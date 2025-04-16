const express=require('express');
const router=express.Router();
const auth=require('../controller/authController');
const {verifyRefreshToken} =require('../middleware/auth');
const {authenticate}=require('../middleware/auth');

router.post("/login",auth.login);
router.post("/register",auth.register);
router.post("/logout",auth.logout);
router.post("/refresh-token",verifyRefreshToken,auth.refreshTokens);

router.post("/reset-password",auth.resetPassword);
router.post("/resend-verification-email",authenticate,auth.resendVerificationEmail);
router.post("/forgot-password",auth.forgotPassword);
router.get("/verify-email",auth.verifyEmail);

module.exports=router;