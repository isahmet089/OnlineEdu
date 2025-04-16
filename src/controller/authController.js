const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig");
const RefreshToken = require("../models/RefreshToken");
const EmailService = require("../utils/emailService");
const { v4: uuidv4 } = require("uuid");
const redisClient = require("../config/redisConfig"); // Redis istemciniz

const generateTokens = (user) => {
  const accessTokenPayload = {
    id: user._id,
    email: user.email,
    roles: user.roles,
  };
  const refreshTokenPayload = { id: user._id };

  const newAccessToken = jwt.sign(accessTokenPayload, accessToken.secret, {
    expiresIn: accessToken.expiresIn,
  });

  const newRefreshToken = jwt.sign(refreshTokenPayload, refreshToken.secret, {
    expiresIn: refreshToken.expiresIn,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) throw new Error("Email veya şifre gereklidir");
    const user = await User.findOne({ email });
    if (!user) throw new Error("Kullanıcı bulunamadı");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Şifre yanlış");
    // Kullanıcının eski tüm refresh tokenlarını sil
    await RefreshToken.deleteMany({ userId: user._id });
    // Yeni tokenları oluştur
    const tokens = generateTokens(user);
    // Yeni refresh token'ı veritabanına kaydet
    await RefreshToken.create({
      userId: user._id,
      token: tokens.refreshToken,
    });
    // Cookie'leri ayarla
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/api/",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 dakika
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/api/",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });
    res.status(200).json({ message: "Giriş başarılı", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
    if (!firstName || !lastName || !email || !password) {
      throw new Error("Tüm alanlar gereklidir");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("Bu e-posta adresi zaten kullanılıyor");
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    await user.save();
    // Kullanıcı kaydedildikten sonra hoş geldiniz e-postası gönder
    await EmailService.sendWelcomeEmail(user);
    // doğrulama kodu oluştur
    const verificationToken = uuidv4();
    const redisKey = `verify_email:${verificationToken}`;
    const ttlInSeconds = 15 * 60; // 15 dakika
    await redisClient.setex(redisKey, ttlInSeconds, user.id.toString()); // user.id objectId ise string'e çevir
    console.log(
      `Token stored in Redis for user ${user.id}: ${redisKey} with TTL ${ttlInSeconds}s`
    );
    // doğrulama kodunu e-posta ile gönder
    await EmailService.sendVerificationEmail(user, verificationToken);

    res.status(201).json({ message: "Başarıyla kayıt oluşturuldu", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    // Clear cookies
    res.clearCookie("accessToken", { path: "/api/" });
    res.clearCookie("refreshToken", { path: "/api/" });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const refreshTokens = async (req, res) => {
  try {
    const oldRefreshToken = req.body.refreshToken;
    // Remove old refresh token
    await RefreshToken.deleteOne({ token: oldRefreshToken });

    // Generate new tokens
    const tokens = generateTokens(req.user);

    // Save new refresh token
    await RefreshToken.create({
      userId: req.user.id,
      token: tokens.refreshToken,
    });

    // Set cookies
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Tokens refreshed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const verifyEmail = async (req, res) => {
  const { token } = req.query; // Linkten token'ı al (örn: /verify-email?token=abc)
  if (!token) {
    return res.status(400).send("Doğrulama token'ı bulunamadı.");
  }
  const redisKey = `verify_email:${token}`;
  try {
    // 1. Token Redis'te var mı diye bak
    const userId = await redisClient.get(redisKey);

    if (!userId) {
      // Token Redis'te yoksa -> Geçersiz veya Süresi Dolmuş
      console.log(`Verification attempt with invalid/expired token: ${token}`);
      return res.status(400).send("Doğrulama linki geçersiz veya süresi dolmuş.");
    }
    // 2. Token geçerliyse -> Kullanıcıyı bul ve doğrula
    console.log(`Token found in Redis for user ID: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      // Redis'te token var ama veritabanında kullanıcı yok (çok nadir bir durum)
      console.error(`User not found for ID ${userId} during verification.`);
      await redisClient.del(redisKey); // Redis'teki anahtarı temizle
      return res.status(400).send("Kullanıcı bulunamadı.");
    }

    if (user.isVerified) {
      // Kullanıcı zaten doğrulanmışsa
      await redisClient.del(redisKey); // Token'ı yine de sil
      return res.status(200).send("Hesabınız zaten doğrulanmış.");
    }

    // Kullanıcıyı doğrulanmış olarak işaretle
    user.isVerified = true;
    await user.save();
    console.log(`User ${userId} verified successfully.`);

    // 3. Token'ı Redis'ten Sil (Tek kullanımlık olmalı)
    await redisClient.del(redisKey);
    console.log(`Token deleted from Redis: ${redisKey}`);

    // Kullanıcıyı başarılı sayfasına yönlendir veya mesaj göster
    res.status(200).send("E-posta adresiniz başarıyla doğrulandı!");
    
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).send('Doğrulama sırasında bir sunucu hatası oluştu.');
  }
};
const resendVerificationEmail = async (req, res) => {
  const user = req.user; // authenticate middleware ile alınmış kullanıcı
  try {
    if (user.isVerified) {
      return res.status(400).json({ message: "Kullanıcı zaten doğrulanmış" });
    }
    // Doğrulama kodunu oluştur
    const verificationToken = uuidv4();
    const redisKey = `verify_email:${verificationToken}`;
    const ttlInSeconds = 15 * 60; // 15 dakika
    await redisClient.setex(redisKey, ttlInSeconds, user.id.toString()); // user.id objectId ise string'e çevir
    console.log(
      `Token stored in Redis for user ${user.id}: ${redisKey} with TTL ${ttlInSeconds}s`
    );
    // Doğrulama kodunu e-posta ile gönder
    await EmailService.sendVerificationEmail(user, verificationToken);
    res.status(200).json({ message: "Doğrulama e-postası gönderildi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
const forgotPassword = async (req, res) => {
  const {email} =req.body;
  try{
    if (!email) throw new Error("Email gereklidir")
    const user = await User.findOne({email});
    if (!user) throw new Error("Kullanıcı bulunamadı");
    // Şifre sıfırlama token'ı oluştur
    const resetToken = uuidv4();
    const redisKey = `reset_password:${resetToken}`;
    const ttlInSeconds = 15 * 60; // 15 dakika
    await redisClient.setex(redisKey, ttlInSeconds, user.id.toString()); // user.id objectId ise string'e çevir
    console.log(
      `Reset token stored in Redis for user ${user.id}: ${redisKey} with TTL ${ttlInSeconds}s`
    );
    // Şifre sıfırlama e-postası gönder
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/api/auth/reset-password?token=${resetToken}`;
    await EmailService.sendResetPasswordEmail(user, resetPasswordUrl);
    
    res.status(200).json({message:"Şifre sıfırlama e-postası gönderildi"})
  }catch(error){
    res.status(500).json({message:error.message})
  }
};
const resetPassword = async (req, res) => {
  const {newPassword} = req.body;
  const {token} = req.query; // Linkten token'ı al (örn: /reset-password?token=abc)
  if (!newPassword) {
    return res.status(400).json({message:"Yeni şifre gereklidir."});
  }
  if (!token) {
    return res.status(400).json({message:"Şifre sıfırlama token'ı bulunamadı."});
  }
  const redisKey = `reset_password:${token}`;
  try {
    // 1. Token Redis'te var mı diye bak
    const userId = await redisClient.get(redisKey);
    console.log(userId);
    if (!userId) {
      // Token Redis'te yoksa -> Geçersiz veya Süresi Dolmuş
      console.log(`Reset password attempt with invalid/expired token: ${token}`);
      return res.status(400).json({message :"Şifre sıfırlama linki geçersiz veya süresi dolmuş."});
    }
    // 2. Token geçerliyse -> Kullanıcıyı bul ve şifreyi güncelle
    console.log(`Token found in Redis for user ID: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      // Redis'te token var ama veritabanında kullanıcı yok (çok nadir bir durum)
      console.error(`User not found for ID ${userId} during password reset.`);
      await redisClient.del(redisKey); // Redis'teki anahtarı temizle
      return res.status(400).json({message:"Kullanıcı bulunamadı."});
    }
    // Şifreyi güncelle 
    user.password = newPassword;
    await user.save();
    console.log(`Password reset for user ${userId} successfully.`);
    // 3. Token'ı Redis'ten Sil (Tek kullanımlık olmalı)
    await redisClient.del(redisKey);
    console.log(`Token deleted from Redis: ${redisKey}`); 
    res.status(200).json({message:"Şifre sıfırlama işlemi başarılı.",user});
    }catch (error) {
    console.error('Password Reset Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  register,
  logout,
  refreshTokens,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};
