const express = require('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');
const { authenticate, checkPermission } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/rolesAndPermissions');

router.get('/get', reviewController.getAllReviews);

router.post('/:courseSlug/review',authenticate,checkPermission(PERMISSIONS.REVIEW_OWN_COURSES_CREATED),reviewController.createReview);

router.get('/:courseSlug/review',reviewController.getReviewsByCourseSlug);

//tekil  bir yorumu almak için
router.get('/:courseSlug/review/:reviewId',reviewController.getReviewById);

// güncelleme işlemi için
router.put('/:courseSlug/review/:reviewId',authenticate,checkPermission(PERMISSIONS.MANAGE_OWN_REVIEWS),reviewController.updateReviewById);

router.delete('/:courseSlug/review/:reviewId',authenticate,checkPermission(PERMISSIONS.MANAGE_OWN_REVIEWS),reviewController.deleteReviewById);

module.exports = router;