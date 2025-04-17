const ROLES= require("../constants/roles");
const { HTTP_CODES, MESSAGES } = require('../config/constants'); // Log ve mesajlar için
const AppError = require('../utils/appError'); // Hata yönetimi için
const authorize = (...roles) => {
    return (req,res,next)=>{
        if(!req.user){
            return next(new AppError(MESSAGES.UNAUTHORIZED, HTTP_CODES.UNAUTHORIZED));
        }
        if(req.user.role === ROLES.ADMIN) return next();
        
        if (!roles.includes(req.user.role)) {
            return next(new AppError(MESSAGES.FORBIDDEN, HTTP_CODES.FORBIDDEN));
        }
        next();
    }
};
module.exports = authorize;