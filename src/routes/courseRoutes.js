const express = require('express');
const router = express.Router();
const COURSE = require('../controller/courseController');
const {courseThumbnailUpload} = require('../middleware/upload');
const {authenticate, checkPermission} = require('../middleware/auth');
const { PERMISSIONS } = require('../config/rolesAndPermissions');
const cacheData = require('../middleware/cacheMiddleware');
//admin routes
router.get('/',authenticate,COURSE.getAllCourses);
router.post('/',authenticate,checkPermission(PERMISSIONS.CREATE_COURSE_CONTENT),COURSE.createCourse);
router.put('/:slug',authenticate,checkPermission(PERMISSIONS.MANAGE_OWN_COURSES),COURSE.updateCourse);
router.delete('/:slug',authenticate,checkPermission(PERMISSIONS.MANAGE_OWN_COURSES),COURSE.deleteCourse);


// Kurs Detayı
router.get('/:slug', cacheData((req) => `course:${req.params.slug}`, 300), COURSE.getCourseBySlug);

// Kategoriye göre Kurslar
router.get('/category/:slug', cacheData((req) => `category:${req.params.slug}`, 300), COURSE.getCourseByCategorySlug);

// Eğitmene Göre Kurslar
router.get('/instructor/:slug', cacheData((req) => `instructor:${req.params.slug}`, 300), COURSE.getCourseByInstructorSlug);

//thumbnail upload
router.patch("/:courseSlug/thumbnail",authenticate,checkPermission(PERMISSIONS.MANAGE_OWN_COURSES),courseThumbnailUpload.single("thumbnail"), COURSE.uploadCourseThumbnail);

module.exports = router;