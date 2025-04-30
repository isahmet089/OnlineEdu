const express = require('express');
const router = express.Router();
const lessonController = require('../controller/lessonController');
const {authenticate, checkPermission} = require('../middleware/auth');
const {PERMISSIONS} = require('../config/rolesAndPermissions');

router.post('/:courseSlug/add',authenticate,checkPermission(PERMISSIONS.CREATE_COURSE_CONTENT),lessonController.createLesson);
router.get('/:courseSlug/lessons',authenticate,checkPermission(PERMISSIONS.ACCESS_ENROLLED_COURSE_CONTENT),lessonController.getAllLessons); // Tüm dersleri al

router.get('/:courseSlug/lesson/:lessonSlug',authenticate,checkPermission(PERMISSIONS.ACCESS_ENROLLED_COURSE_CONTENT),lessonController.getLessonBySlug); // Belirli bir dersi al
router.delete('/:courseSlug/lesson/:lessonSlug',authenticate,checkPermission(PERMISSIONS.MANAGE_OWN_COURSES),lessonController.deleteLesson); // Belirli bir dersi sil

module.exports = router;    