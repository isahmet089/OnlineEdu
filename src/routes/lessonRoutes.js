const express = require('express');
const router = express.Router();
const lessonController = require('../controller/lessonController');
const {authenticate} = require('../middleware/auth');


router.post('/:courseSlug/add',authenticate,lessonController.createLesson);
router.get('/:courseSlug/lessons',authenticate,lessonController.getAllLessons); // Tüm dersleri al
router.get('/:courseSlug/lesson/:lessonSlug',authenticate,lessonController.getLessonBySlug); // Belirli bir dersi al

router.delete('/:courseSlug/lesson/:lessonSlug',authenticate,lessonController.deleteLesson); // Belirli bir dersi sil

module.exports = router;    