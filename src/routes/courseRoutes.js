const express = require('express');
const router = express.Router();
const COURSE = require('../controller/courseController');

//admin routes
router.get('/',COURSE.getAllCourses);
router.post('/',COURSE.createCourse);
router.put('/:slug',COURSE.updateCourse);
router.delete('/:slug',COURSE.deleteCourse);

//user routes
router.get('/:slug',COURSE.getCourseBySlug);
router.get('/category/:slug',COURSE.getCourseByCategorySlug);
router.get('/instructor/:slug',COURSE.getCourseByInstructorSlug);



//instructor routes

module.exports = router;