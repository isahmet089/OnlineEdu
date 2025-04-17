const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const securityMiddleware = (app) => {
  // CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));

  // Helmet
  app.use(helmet());

  // XSS temizleme
  app.use(xss());

  // MongoDB injection temizleme
  app.use(mongoSanitize());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına 100 istek
    message: "Çok fazla istek gönderdiniz, lütfen sonra tekrar deneyin.",
  });

  app.use(limiter);
};

module.exports = securityMiddleware;
