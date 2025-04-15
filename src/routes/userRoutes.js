const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authenticate, checkPermission } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/rolesAndPermissions');


// tüm kullanıcıları listele
router.get('/',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_USERS),
    userController.getAllUsers);
// kullanıcı oluştur
router.post('/',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_USERS),
    userController.createUser);
// kullanıcı güncelle
router.put('/:id',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_USERS),
    userController.updateUser);
// kullanıcı sil
router.delete('/:id',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_USERS),
    userController.deleteUser);



module.exports = router;    