const express=require('express');
const router=express.Router();
const auth=require('../controller/authController');
const {verifyRefreshToken} =require('../middleware/auth');
const {authenticate}=require('../middleware/auth');
const {validateRegistration,validateLogin,validateForgotPassword,validateResetPassword}=require('../middleware/validators');

router.post("/login",validateLogin,auth.login);
router.post("/register",validateRegistration,auth.register);
router.post("/logout",auth.logout);
router.post("/refresh-token",verifyRefreshToken,auth.refreshTokens);

router.post("/reset-password",validateResetPassword,auth.resetPassword);
router.post("/resend-verification-email",authenticate,auth.resendVerificationEmail);
router.post("/forgot-password",validateForgotPassword,auth.forgotPassword);
router.get("/verify-email",auth.verifyEmail);

module.exports=router;