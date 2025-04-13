const express = require('express');
const router = express.Router();
const userConttroller = require('../controller/userController');

router.get("/",userConttroller.getAllUsers);
router.post("/",userConttroller.createUser);
router.put("/:id",userConttroller.updateUser);
router.delete("/:id",userConttroller.deleteUser);


module.exports = router;    