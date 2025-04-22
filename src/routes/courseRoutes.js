const express = require('express');
const router = express.Router();
const COURSE = require('../controller/courseController');
const {courseThumbnailUpload} = require('../middleware/upload');
const {authenticate, checkPermission} = require('../middleware/auth');
const { PERMISSIONS } = require('../config/rolesAndPermissions');
//admin routes
router.get('/',authenticate,COURSE.getAllCourses);
router.post('/',authenticate,checkPermission(PERMISSIONS.CREATE_COURSE_CONTENT),COURSE.createCourse);
router.put('/:slug',authenticate,checkPermission(PERMISSIONS.MANAGE_OWN_COURSES),COURSE.updateCourse);
router.delete('/:slug',authenticate,checkPermission(PERMISSIONS.MANAGE_OWN_COURSES),COURSE.deleteCourse);

//user routes
router.get('/:slug',COURSE.getCourseBySlug);
router.get('/category/:slug',COURSE.getCourseByCategorySlug);
router.get('/instructor/:slug',COURSE.getCourseByInstructorSlug);

//thumbnail upload
router.patch("/:courseSlug/thumbnail",authenticate,checkPermission(PERMISSIONS.MANAGE_OWN_COURSES),courseThumbnailUpload.single("thumbnail"), COURSE.uploadCourseThumbnail);



module.exports = router;