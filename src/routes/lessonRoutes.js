const express = require('express');
const router = express.Router();
const lessonController = require('../controller/lessonController');


router.post('/create',lessonController.createLesson);

module.exports = router;