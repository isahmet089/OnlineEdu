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
  ],
};

const logger = winston.createLogger(logConfiguration);

// Fonksiyonları ekleyelim:
logger.errorWithMessage = (message) => {
  logger.log({
    level: LOG_LEVELS.ERROR,
    message: message,
  });
};

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
