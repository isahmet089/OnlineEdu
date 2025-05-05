const { HTTP_CODES ,MESSAGES} = require("../config/constants");
const Course = require("../models/Course");
const Review = require("../models/Review");
const User = require("../models/User");
const AppError = require("../utils/appError"); 
const getAllReviews = async (req, res,next) => {
    try {
        const reviews = await Review.find()
            .populate("user", "name email")
            .populate("course", "title slug");
        res.status(HTTP_CODES.OK).json(reviews);
    } catch (error) {
        next(error);
    }
};

const createReview = async (req, res,next) => {
    const { courseSlug } = req.params;
    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return next( new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    const { rating, comment } = req.body;
    if (!rating || !comment) return next( new AppError(MESSAGES.REVIEW_REQUIRED_FIELDS, HTTP_CODES.BAD_REQUEST));
    const user = req.user;
    const existingReview = await Review.findOne({ user: user._id, course: course._id });
    if (existingReview) return next( new AppError(MESSAGES.REVIEW_ALREADY_EXISTS, HTTP_CODES.BAD_REQUEST));
    try {
        const review = new Review({
            user: user._id,
            course: course._id,
            rating,
            comment,
        });
        await review.save();
        course.reviews.push(review._id);
        await course.save();
        res.status(HTTP_CODES.CREATED).json({ message: MESSAGES.REVIEW_CREATED, review });
    } catch (error) {
        next(error);
    }
   
};  

const getReviewsByCourseSlug = async (req, res,next) => {
    const { courseSlug } = req.params;
    if (!courseSlug) return next( new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return next( new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    try {
        const reviews = await Review.find({ course: course._id })
            .populate("user", "name email")
            .populate("course", "title slug");
        res.status(HTTP_CODES.OK).json(reviews);
    } catch (error) {
        next(error);
    }

};

const getReviewById = async (req, res,next) => {
    const { courseSlug, reviewId } = req.params;
    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return next( new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    const review = await Review.findOne({uuid: reviewId});
    if (!review) return next( new AppError(MESSAGES.REVIEW_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    try {
        const reviewDetails = await Review.findById(review._id)
            .populate("user", "name email")
            .populate("course", "title slug");
        res.status(HTTP_CODES.OK).json(reviewDetails);
    } catch (error) {
        next(error);
    }
};

const updateReviewById = async (req, res,next) => {
    const { courseSlug, reviewId } = req.params;
    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return next( new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    const review = await Review.findOne({uuid: reviewId});
    if (!review) return next( new AppError(MESSAGES.REVIEW_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    // Kullanıcının yaptığıroumları konrol et
    const user = req.user;
    if (!review.user.equals(user._id)) return next( new AppError(MESSAGES.JUST_OWN_REVIEW, HTTP_CODES.FORBIDDEN));
    const { rating, comment } = req.body;
    if (!rating || !comment) return next( new AppError(MESSAGES.REVIEW_REQUIRED_FIELDS, HTTP_CODES.BAD_REQUEST));
    try {
        review.rating = rating;
        review.comment = comment;
        await review.save();
        res.status(HTTP_CODES.OK).json({ message: MESSAGES.REVIEW_UPDATED, review });
    } catch (error) {
        next(error);
    }
};

const deleteReviewById = async (req, res,next) => {
    const { courseSlug, reviewId } = req.params;
    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return next( new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    const review = await Review.findOne({uuid: reviewId});
    if (!review) return next( new AppError(MESSAGES.REVIEW_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    // Kullanıcının yaptığı yorumları kontrol et
    const user = req.user;
    if (!review.user.equals(user._id)) return next( new AppError(MESSAGES.JUST_OWN_REVIEW, HTTP_CODES.FORBIDDEN));
    try {
        await Review.deleteOne({ uuid: reviewId });
        await course.updateOne({ $pull: { reviews: review._id } });
        res.status(HTTP_CODES.OK).json({ message: MESSAGES.REVIEW_DELETED });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllReviews,
    createReview,
    getReviewsByCourseSlug,
    getReviewById,
    updateReviewById,
    deleteReviewById,
    };