const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig");
const RefreshToken = require("../models/RefreshToken");
const EmailService = require("../utils/emailService");


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
      if(!email || !password) throw new Error("Email veya şifre gereklidir");
      const user =await User.findOne({ email });
      if(!user) throw new Error("Kullanıcı bulunamadı");

      const isMatch = await user.comparePassword(password);
      if(!isMatch) throw new Error("Şifre yanlış");
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
    console.log(req.user);
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
    };
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
     
    res.status(201).json({ message: "Başarıyla kayıt oluşturuldu", user });
  }
  catch (error) {
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
    res.clearCookie("accessToken",{path: "/api/"});
    res.clearCookie("refreshToken",{path: "/api/"});

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
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Tokens refreshed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  login,
  register,
  logout,
  refreshTokens
};