const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig");
const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const { ROLES, rolePermissions } = require("../config/rolesAndPermissions");

const verifyAccessToken = (req, res, next) => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, accessToken.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};

const verifyRefreshToken = async (req, res, next) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(403).json({ message: "Refresh token required" });
  }

  try {
    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const decoded = jwt.verify(token, refreshToken.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      await RefreshToken.deleteOne({
        token: req.cookies.refreshToken || req.body.refreshToken,
      });
      return res.status(403).json({ message: "Expired refresh token" });
    }
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

const authenticate = async(req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Access token required" });
  }
  try {
   // DB'den güncel kullanıcıyı al (Rollerin güncel olması için önemli)
   const decoded = jwt.verify(token, accessToken.secret);
   const user = await User.findById(decoded.id).select('-password');
   if (!user) {
        return res.status(401).json({ message: "Kullanıcı bulunamadı" });
   }
   req.user = user; // TAM KULLANICI NESNESİNİ EKLE
   next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Oturum süresi doldu" }); // Frontend'in refresh tetiklemesi için 401
  }
   if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Geçersiz token" });
  }
  console.error("Authenticate Error:", err);
  return res.status(500).json({ message: "Yetkilendirme hatası" });
  }
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
      // authenticate middleware'i req.user'ı (roller dahil) doldurmuş olmalı
      if (!req.user || !Array.isArray(req.user.roles)) {
          console.error("RBAC checkPermission Error: req.user.roles tanımsız.");
          return res.status(401).json({ message: "Kullanıcı bilgileri bulunamadı" });
      }

      const userRoles = req.user.roles;

      if (userRoles.includes(ROLES.ADMIN)) {
          return next(); // Admin her zaman yetkili
      }

      let hasPermission = false;
      for (const role of userRoles) {
          const permissionsForRole = rolePermissions[role] || [];
          if (permissionsForRole.includes(requiredPermission)) {
              hasPermission = true;
              break;
          }
      }

      if (hasPermission) {
          next();
      } else {
          res.status(403).json({ message: "Yasak: Bu işlem için yetkiniz yok" });
      }
  };
};


module.exports = {  
  verifyAccessToken,
  verifyRefreshToken,
  authenticate,
  checkPermission
};  