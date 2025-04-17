const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig");
const RefreshToken = require("../models/RefreshToken");
const EmailService = require("../utils/emailService");
const { v4: uuidv4 } = require("uuid");
const redisClient = require("../config/redisConfig"); 
const AppError = require("../utils/appError");
const { HTTP_CODES, MESSAGES } = require("../config/constants");

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
const login = async (req, res, next) => {
  const { emailOrUserName, password } = req.body;
  try {
    if (!emailOrUserName || !password)
      throw new AppError(
        MESSAGES.EMAIL_OR_PASSWORD_REQUIRED,
        HTTP_CODES.BAD_REQUEST
      );
      console.log("Login request received:", req.body);
    // Kullanıcı adı veya e-posta ile kullanıcıyı bul
    const user = await User.findOne({
      $or: [
        { email: emailOrUserName },
        { userName: emailOrUserName }
      ]
    });
    console.log("User found:", user);
    if (!user) throw new AppError(MESSAGES.EMAIL_NOT_FOUND, HTTP_CODES.BAD_REQUEST);

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      throw new AppError(
        MESSAGES.PASSWORDS_DO_NOT_MATCH,
        HTTP_CODES.BAD_REQUEST
      );
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
    res.status(HTTP_CODES.OK).json({ message: MESSAGES.LOGIN_SUCCESS, user });
  } catch (error) {
    next(error);
  }
};
const register = async (req, res, next) => {
  try {
    const { userName, firstName, lastName, email, password, role } = req.body;

    // Gerekli alanlar
    if (!firstName || !lastName || !email || !password || !userName) {
      throw new AppError(MESSAGES.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST);
    }
    // Kullanıcı adı daha önce kullanılmış mı kontrol et
    const existingUserName = await User.findOne({ userName });
    if (existingUserName)  throw new AppError(MESSAGES.USERNAME_ALREADY_EXISTS, HTTP_CODES.BAD_REQUEST);
     
    // E-posta daha önce kullanılmış mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_CODES.BAD_REQUEST);
    }

    // Yeni kullanıcı oluştur
    const user = new User({
      userName,
      firstName,
      lastName,
      email,
      password,
      role,
    });

    await user.save();

    // Hoş geldin e-postası gönder
    await EmailService.sendWelcomeEmail(user);

    // E-posta doğrulama token'ı oluştur
    const verificationToken = uuidv4();
    const redisKey = `verify_email:${verificationToken}`;
    const ttlInSeconds = 15 * 60; // 15 dakika

    await redisClient.setex(redisKey, ttlInSeconds, user.id.toString());

    console.log(
      `Redis: ${redisKey} set for user ${user.id} with TTL ${ttlInSeconds}s`
    );

    // Doğrulama e-postasını gönder
    await EmailService.sendVerificationEmail(user, verificationToken);

    // Yanıt gönder
    res.status(HTTP_CODES.CREATED).json({
      message: MESSAGES.REGISTRATION_SUCCESS,
      user,
    });
  } catch (error) {
    next(error); // Middleware zinciri için gerekli
  }
};
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    // Çerezleri temizle
    res.clearCookie("accessToken", { path: "/api/" });
    res.clearCookie("refreshToken", { path: "/api/" });

    res.status(HTTP_CODES.OK).json({ message: MESSAGES.LOGOUT_SUCCESS });
  } catch (error) {
    next(error);
  }
};
const refreshTokens = async (req, res, next) => {
  try {
    const oldRefreshToken = req.body.refreshToken;

    if (!oldRefreshToken) {
      throw new AppError(MESSAGES.TOKEN_REQUIRED, HTTP_CODES.BAD_REQUEST);
    }

    // Eski refresh token'ı sil
    await RefreshToken.deleteOne({ token: oldRefreshToken });

    // Yeni token üret
    const tokens = generateTokens(req.user);

    // Yeni refresh token'ı veritabanına kaydet
    await RefreshToken.create({
      userId: req.user.id,
      token: tokens.refreshToken,
    });

    const isProduction = process.env.NODE_ENV === "production";

    // Çerezlere token'ları ekle
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/api/",
      maxAge: 15 * 60 * 1000, // 15 dakika
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/api/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    res.status(HTTP_CODES.OK).json({ message: MESSAGES.TOKEN_REFRESHED });
  } catch (error) {
    next(error);
  }
};
const verifyEmail = async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    throw new AppError(MESSAGES.TOKEN_REQUIRED, HTTP_CODES.BAD_REQUEST);
  }

  const redisKey = `verify_email:${token}`;

  try {
    const userId = await redisClient.get(redisKey);
    console.log(`Verification token found for user ID: ${userId}`);

    if (!userId) {
      console.log(`Invalid or expired token: ${token}`);
      throw new AppError(MESSAGES.INVALID_TOKEN, HTTP_CODES.BAD_REQUEST);
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(
        `User not found for ID ${userId} during email verification.`
      );
      await redisClient.del(redisKey);
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_CODES.BAD_REQUEST);
    }

    if (user.isVerified) {
      await redisClient.del(redisKey);
      console.log(`User ${userId} is already verified.`);
      return res.status(HTTP_CODES.OK).send(MESSAGES.USER_ALREADY_VERIFIED);
    }

    user.isVerified = true;
    await user.save();
    await redisClient.del(redisKey);
    console.log(`Email verified for user ${userId} successfully.`);

    res.status(HTTP_CODES.OK).send(MESSAGES.EMAIL_VERIFIED);
  } catch (error) {
    console.error("Email Verification Error:", error);
    next(error);
  }
};
const resendVerificationEmail = async (req, res, next) => {
  const user = req.user;

  try {
    if (user.isVerified) {
      throw new AppError(
        MESSAGES.USER_ALREADY_VERIFIED,
        HTTP_CODES.BAD_REQUEST
      );
    }

    const verificationToken = uuidv4();
    const redisKey = `verify_email:${verificationToken}`;
    const ttlInSeconds = 15 * 60;

    await redisClient.setex(redisKey, ttlInSeconds, user.id.toString());

    await EmailService.sendVerificationEmail(user, verificationToken);

    res.status(HTTP_CODES.OK).json({ message: MESSAGES.EMAIL_VERIFICATION_SENT });
  } catch (error) {
    next(error);
  }
};
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      throw new AppError(MESSAGES.EMAIL_REQUIRED, HTTP_CODES.BAD_REQUEST);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_CODES.BAD_REQUEST);
    }

    const resetToken = uuidv4();
    const redisKey = `reset_password:${resetToken}`;
    const ttlInSeconds = 15 * 60;

    await redisClient.setex(redisKey, ttlInSeconds, user.id.toString());

    console.log(
      `Reset token stored in Redis for user ${user.id}: ${redisKey} with TTL ${ttlInSeconds}s`
    );

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await EmailService.sendResetPasswordEmail(user, resetPasswordUrl);

    console.log(`Reset password email sent to ${user.email}`);

    res.status(HTTP_CODES.OK).json({
      message: MESSAGES.PASSWORD_RESET_EMAIL_SENT,
    });
  } catch (error) {
    next(error);
  }
};
const resetPassword = async (req, res, next) => {
  const { password } = req.body; // Yeni şifre
  const { token } = req.query; // Linkten token'ı al (örn: /reset-password?token=abc)

  if (!password) {
    throw new AppError(MESSAGES.PASSWORD_REQUIRED, HTTP_CODES.BAD_REQUEST);
  }

  if (!token) {
    throw new AppError(MESSAGES.INVALID_RESET_TOKEN, HTTP_CODES.BAD_REQUEST);
  }

  const redisKey = `reset_password:${token}`;

  try {
    // 1. Token Redis'te var mı diye bak
    const userId = await redisClient.get(redisKey);
    console.log(`Reset password token found for user ID: ${userId}`);

    if (!userId) {
      console.log(
        `Reset password attempt with invalid/expired token: ${token}`
      );
      throw new AppError(MESSAGES.INVALID_RESET_TOKEN, HTTP_CODES.BAD_REQUEST);
    }

    // 2. Token geçerliyse -> Kullanıcıyı bul ve şifreyi güncelle
    console.log(`Token found in Redis for user ID: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      // Redis'te token var ama veritabanında kullanıcı yok (çok nadir bir durum)
      console.error(`User not found for ID ${userId} during password reset.`);
      await redisClient.del(redisKey); // Redis'teki anahtarı temizle
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_CODES.BAD_REQUEST);
    }

    // Şifreyi güncelle
    user.password = password;
    await user.save();
    console.log(`Password reset for user ${userId} successfully.`);

    // 3. Token'ı Redis'ten Sil (Tek kullanımlık olmalı)
    await redisClient.del(redisKey);
    console.log(`Token deleted from Redis: ${redisKey}`);

    res
      .status(HTTP_CODES.CREATED)
      .json({ message: MESSAGES.PASSWORD_RESET_SUCCESS, user });
  } catch (error) {
    console.error("Password Reset Error:", error);
    next(error); // Hata durumunda middleware'e geç
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
