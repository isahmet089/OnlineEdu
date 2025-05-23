const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {HTTP_CODES,MESSAGES} = require("../config/constants");
const AppError = require("../utils/appError");
const FileService = require("../services/fileService");
const path = require("path");


const getAllCourses = async (req, res,next) => {
  try {
    const courses = await Course.find({}).populate("instructor", "firstName lastName email").populate("category", "name description");
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const createCourse = async (req, res,next) => {
  const  user = req.user;
  const instructor = user._id;
  if (!instructor) return next(new AppError(MESSAGES.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST));
  const { title, description, category, duration, tags, level,price } = req.body;
  const categoryFind = await Category.findOne({slug:category});
  if (!categoryFind) return next(new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_CODES.NOT_FOUND));
  try {
    const course = new Course({
      title,
      description,
      category: categoryFind._id,
      instructor,
      duration,
      tags,
      level,
      price,
    });
    await course.save();
    const fileService = new FileService();
    await fileService.createCourseFolder(categoryFind.slug, course.slug); // Create course folder
    res.status(HTTP_CODES.CREATED).json({message:MESSAGES.SUCCESS,course});
  } catch (error) {
    next(error);
  }
};
const updateCourse = async (req, res,next) => {
  const user = req.user;
  const instructor = user._id;
  const { slug } = req.params;
  const { title, description, category, duration, tags, level,price } = req.body;
  try {
    const course = await Course.findOne({slug:slug});
    if(course.instructor.toString() !== instructor.toString()) return next(new AppError(MESSAGES.FORBIDDEN, HTTP_CODES.UNAUTHORIZED));
   
    if (!course)  return next(new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (duration) course.duration = duration;
    if (tags) course.tags = tags;
    if (level) course.level = level;
    if (price) course.price = price;
    await course.save();
    const courseData = await Course.findOne(course).populate("category", "name description").populate("instructor", "firstName lastName email");
    res.status(HTTP_CODES.OK).json({message:MESSAGES.UPDATED_SUCCESSFULLY,courseData});
  } catch (error) {
    next(error);
  }
};
const deleteCourse = async (req, res,next) => {
  const { slug } = req.params;
  if (!slug) return next(new AppError(MESSAGES.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST));
  const course = await Course.findOne({slug:slug});

  if(req.user.roles.includes("admin")){ 
    await course.deleteOne();
    res.status(HTTP_CODES.OK).json({message:MESSAGES.DELETED_SUCCESSFULLY ,course});
  }
  try {
    const instructor = req.user._id;
    if(course.instructor.toString() !== instructor.toString()) return next(new AppError(MESSAGES.FORBIDDEN, HTTP_CODES.UNAUTHORIZED));
    if (!course) return next(new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    await course.deleteOne();
    res.status(HTTP_CODES.OK).json({message:MESSAGES.DELETED_SUCCESSFULLY,course});
  } catch (error) {
    next(error);
  }
};
const getCourseBySlug = async (req, res,next) => {
  const { slug } = req.params;
  try {
    if (!slug) return next(new AppError(MESSAGES.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST));
    const course = await Course.findOne({ slug:slug })
      .populate("category", "name description")
      .populate("instructor", "firstName lastName email")
      .populate("lessons");
    if (!course) return next(new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    res.status(HTTP_CODES.OK).json({message: MESSAGES.SUCCESS,course});
  }catch (error) {
    next(error);
  }
};

//user operations 
const getCourseByInstructorSlug = async (req, res,next) => {
  const { slug } = req.params;
  try {
    if (!slug) return next(new AppError(MESSAGES.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST));
    const user = await User.findOne({slug:slug});
    if (!user) return next(new AppError(MESSAGES.INSTRUCTOR_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    const courses = await Course.find({ instructor: user._id })
      .populate("category", "name description")
      .populate("instructor", "firstName lastName email")
    //.populate("lessons");
    if (!courses) return next(new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    res.status(HTTP_CODES.OK).json({message: MESSAGES.SUCCESS,courses});
  }catch (error) {
    next(error);
  }
};
const getCourseByCategorySlug = async (req, res,next) => {
  const { slug } = req.params;
  try {
    const category = await Category.findOne({ slug:slug });
    if (!category) return next(new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    const courses = await Course.find({ category: category._id });
    if (!courses) return next(new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    res.status(HTTP_CODES.OK).json({message: MESSAGES.SUCCESS,courses});
  } catch (error) {
    next(error);
  }
};

//thumbnail upload
const uploadCourseThumbnail = async (req, res, next) => {
  const user = req.user; 
  try {
    const course = await Course.findOne({slug:req.params.courseSlug}).populate("category");
    if (!course) return next(new AppError(MESSAGES.COURSE_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    if (course.instructor.toString() !== user._id.toString()) return next(new AppError(MESSAGES.FORBIDDEN, HTTP_CODES.UNAUTHORIZED));
    if (!req.file) return next(new AppError(MESSAGES.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST));
    const ext = path.extname(req.file.filename);
    console.log(req.file.filename);
    console.log("ext",ext);
    const relativePath = path.join(course.category.slug, course.slug, "thumbnail" + ext);

    course.thumbnail = relativePath;
    await course.save();

    res.status(HTTP_CODES.OK).json({
      message: MESSAGES.SUCCESS,
      thumbnail: course.thumbnail
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseBySlug,
    getCourseByCategorySlug,
    getCourseByInstructorSlug,
    uploadCourseThumbnail
  };
