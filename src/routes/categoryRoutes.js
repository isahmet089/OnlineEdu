const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');
const auth =require('../middleware/auth');
const { PERMISSIONS } = require('../config/rolesAndPermissions');
const { validateCategoryCreate, updateCategoryValidation } = require('../middleware/validators');

router.get('/',auth.authenticate,categoryController.getAllCategories);
router.post('/',auth.authenticate,auth.checkPermission(PERMISSIONS.MANAGE_CATEGORIES),validateCategoryCreate,categoryController.createCategory);
router.put('/:slug',auth.authenticate,auth.checkPermission(PERMISSIONS.MANAGE_CATEGORIES),updateCategoryValidation,categoryController.updateCategory);
router.delete('/:slug',auth.authenticate,auth.checkPermission(PERMISSIONS.MANAGE_CATEGORIES),categoryController.deleteCategory); 
router.get('/:slug',auth.authenticate,categoryController.getCategoryBySlug);


module.exports = router;