const express=require('express');
const router=express.Router();
const auth=require('../controller/authController');

router.post("/login",auth.login);
router.post("/register",auth.register);
router.post("/logout",auth.logout);

module.exports=router;