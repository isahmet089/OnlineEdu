const helmet = require("helmet");

const rateLimit = require("express-rate-limit");

const securityMiddleware = (app) => {

  // Helmet
  app.use(helmet());


  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına 100 istek
    message: "Çok fazla istek gönderdiniz, lütfen sonra tekrar deneyin.",
  });

  app.use(limiter);
};

module.exports = securityMiddleware;
