const ROLES= require("../constants/roles");
const authorize = (...roles) => {
    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({message : "you  are not authorized"});
        }
        if(req.user.role === ROLES.ADMIN) return next();
        
        if (!roles.includes(req.user.role)) {
            return res.status(401).json({message : "yetkiniz yok "});
        }
        next();
    }
};
module.exports = authorize;