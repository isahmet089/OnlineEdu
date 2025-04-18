const winston = require('winston');
const { LOG_LEVELS } = require('../config/constants');

const logConfiguration = {
  transports: [
    new winston.transports.Console({
      level: LOG_LEVELS.DEBUG, // Varsayılan log seviyesi
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/app.log',
      level: LOG_LEVELS.INFO, // Dosyaya sadece INFO ve üstü loglar kaydedilecek
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/warn.log',
      level: LOG_LEVELS.WARN, // WARN ve üstü loglar
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: LOG_LEVELS.ERROR, // ERROR logları
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
};

// Logger'ı oluştur
const logger = winston.createLogger(logConfiguration);

// Dinamik loglama fonksiyonları
logger.errorWithMessage = (message, err, req) => {
  const isDev = process.env.NODE_ENV === 'development';

  let logLevel = LOG_LEVELS.ERROR;
  
  // Hata türüne göre log seviyesi ayarlama
  if (err?.statusCode >= 400 && err?.statusCode < 500) {
    logLevel = LOG_LEVELS.WARN; // 4xx hataları için warn seviyesi
  }

  // Hata mesajını logla
  logger.log({
    level: logLevel,
    statusCode: err?.statusCode || 500,
    message: message,
    meta: {
      url: req?.originalUrl,
      method: req?.method,
      ip: req?.ip,
      ...(isDev && {
        params: req?.params,
        query: req?.query,
        body: req?.body,
      }),
    },
  });

  // Hata konsola yazdırılır
  if (logLevel === LOG_LEVELS.ERROR) {
    console.error(message, err);
  } else {
    console.warn(message);
  }
};

// Diğer log seviyeleri
logger.warnWithMessage = (message) => {
  logger.log({
    level: LOG_LEVELS.WARN,
    message: message,
  });
};

logger.infoWithMessage = (message) => {
  logger.log({
    level: LOG_LEVELS.INFO,
    message: message,
  });
};

logger.debugWithMessage = (message) => {
  logger.log({
    level: LOG_LEVELS.DEBUG,
    message: message,
  });
};

module.exports = logger;
