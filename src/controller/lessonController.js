const { MESSAGES ,HTTP_CODES} = require('../config/constants');
const Lesson = require('../models/Lesson');
const AppError = require('../utils/appError');
const Course = require('../models/Course');


const createLesson = async (req, res,next) => { 
    const {courseSlug} = req.params;
    const { title, description, order} = req.body;
    if (!courseSlug) return res.status(HTTP_CODES.BAD_REQUEST).json({ message: MESSAGES.MISSING_FIELDS });
    if (!title || !description  ) return next(new AppError(MESSAGES.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST)); 
    const course = await Course.findOne({slug:courseSlug});
    if (!course) return next(new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    // Kullanıcının kursa erişim izni olup olmadığını kontrol et
    const user = req.user;
    if(!user._id.equals(course.instructor._id)) return res.status(HTTP_CODES.UNAUTHORIZED).json({ message: MESSAGES.FORBIDDEN });
    try {   
        const newLesson = new Lesson({
            title,
            description,
            course: course._id,
            order,
        });
        await newLesson.save();
        // Kursu güncelle ve yeni dersi ilişkilendir
        await Course.findByIdAndUpdate(course._id, { $push: { lessons: newLesson._id } });
        res.status(HTTP_CODES.CREATED).json({ message: MESSAGES.LESSON_CREATED, lesson: newLesson });
    } catch (error) {
        console.error('Error creating lesson:', error);
        next(error); // Hata işleme middleware'ine yönlendir
    }
};
const getAllLessons = async (req, res) => {
    const {  courseSlug } = req.params;
    if (!courseSlug) return res.status(HTTP_CODES.BAD_REQUEST).json({ message: MESSAGES.MISSING_FIELDS });
    // Kullanıcının kursa erişim izni olup olmadığını kontrol et
    const course = await Course.findOne({slug:courseSlug});
    if (!course) return res.status(HTTP_CODES.BAD_REQUEST).json({ message: MESSAGES.COURSE_NOT_FOUND });
    const user = req.user;
    if(!user.purchasedCourses.includes(course._id)) return res.status(HTTP_CODES.UNAUTHORIZED).json({ message: MESSAGES.PAYMENT_REQUIRED_COURSE });
    try {
        const course = await Course.findOne({ slug: courseSlug }).select('title description slug _id lessons').populate('lessons', 'title description slug order video resources').populate('instructor', 'firstName lastName email').populate('category', 'name description');
        res.status(HTTP_CODES.OK).json({message: MESSAGES.SUCCESS, course:course});
    } catch (error) {
        console.error('Error fetching lessons:', error);
        next(error); 
    }
};
const getLessonBySlug = async (req, res,next) => {
    const { courseSlug , lessonSlug } = req.params;
    console.log(courseSlug, lessonSlug);
    if (!courseSlug || !lessonSlug) return res.status(HTTP_CODES.BAD_REQUEST).json({ message: MESSAGES.MISSING_FIELDS });
    // Kursu bul
    const course = await Course.findOne({slug:courseSlug});
    if (!course) return res.status(HTTP_CODES.BAD_REQUEST).json({ message: MESSAGES.COURSE_NOT_FOUND });
    // Kullanıcının kursa erişim izni olup olmadığını kontrol et
    const user = req.user;
    if(!user.purchasedCourses.includes(course._id)) return res.status(HTTP_CODES.UNAUTHORIZED).json({ message: MESSAGES.PAYMENT_REQUIRED_COURSE });
    const lesson = await Lesson.findOne({slug:lessonSlug});
    if (!lesson) return res.status(HTTP_CODES.BAD_REQUEST).json({ message: MESSAGES.LESSON_NOT_FOUND });
    try {   
       const lesson = await Lesson.findOne({ slug: lessonSlug })
       .select('-__v -slug')
       .populate('course', 'title description video resources')
        if (!lesson) return res.status(HTTP_CODES.BAD_REQUEST).json({ message: MESSAGES.LESSON_NOT_FOUND });
        res.status(HTTP_CODES.OK).json({ message: MESSAGES.SUCCESS, lesson: lesson });
    } catch (error) {
       next(error); // Hata işleme middleware'ine yönlendir
    }
};
const deleteLesson = async (req, res,next) => { 
    const {courseSlug, lessonSlug} = req.params;
    if (!courseSlug || !lessonSlug) return res.status(HTTP_CODES.BAD_REQUEST).json({ message: MESSAGES.MISSING_FIELDS });
    // Kursu bul
    const course = await Course.findOne({slug:courseSlug});
    if (!course) return res.status(HTTP_CODES.BAD_REQUEST).json({ message: MESSAGES.COURSE_NOT_FOUND });
    // Kullanıcının kursa erişim izni olup olmadığını kontrol et
    const user = req.user;
    if(!user._id.equals(course.instructor._id)) return res.status(HTTP_CODES.UNAUTHORIZED).json({ message: MESSAGES.FORBIDDEN });
    co
    try {
        const lesson = await Lesson.findOneAndDelete({ slug: lessonSlug });
        if (!lesson) return res.status(HTTP_CODES.BAD_REQUEST).json({ message: MESSAGES.LESSON_NOT_FOUND });
        // Kursu güncelle ve dersi sil
        await Course.findByIdAndUpdate(course._id, { $pull: { lessons: lesson._id } });
        res.status(HTTP_CODES.OK).json({ message: MESSAGES.LESSON_DELETED });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        next(error); // Hata işleme middleware'ine yönlendir
    }

};



module.exports = {createLesson,
    getAllLessons,
    getLessonBySlug,
    deleteLesson
    
};