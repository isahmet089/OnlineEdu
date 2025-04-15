const express=require('express');
const router=express.Router();
const auth=require('../controller/authController');
const {verifyRefreshToken} =require('../middleware/auth');

router.post("/login",auth.login);
router.post("/register",auth.register);
router.post("/logout",auth.logout);
router.post("/refresh-token",verifyRefreshToken,auth.refreshTokens);

router.get("/verify-email",auth.verifyEmail);
module.exports=router;