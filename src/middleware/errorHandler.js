const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { HTTP_CODES } = require('../config/constants');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_CODES.INT_SERVER_ERROR;
  let message = err.message || 'Sunucuda beklenmeyen bir hata oluştu';

  if (!(err instanceof AppError)) {
    logger.errorWithMessage(`Beklenmeyen Hata: ${err.message}`,err, req);
    statusCode = HTTP_CODES.INT_SERVER_ERROR;
    message = 'Sunucuda bir hata oluştu';
  } else {
    logger.errorWithMessage(`Uygulama Hatası: ${message}`,err, req);
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
