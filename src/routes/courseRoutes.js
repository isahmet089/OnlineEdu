const express = require('express');
const router = express.Router();
const COURSE = require('../controller/courseController');
const upload = require('../middleware/upload');
//admin routes
router.get('/',COURSE.getAllCourses);
router.post('/',COURSE.createCourse);
router.put('/:slug',COURSE.updateCourse);
router.delete('/:slug',COURSE.deleteCourse);

//user routes
router.get('/:slug',COURSE.getCourseBySlug);
router.get('/category/:slug',COURSE.getCourseByCategorySlug);
router.get('/instructor/:slug',COURSE.getCourseByInstructorSlug);

//thumbnail upload
router.patch("/:courseSlug/thumbnail", upload.single("thumbnail"), COURSE.uploadCourseThumbnail);

//instructor routes

module.exports = router;