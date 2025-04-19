const Category = require('../models/Category');
const {HTTP_CODES, MESSAGES} = require('../config/constants'); // Log ve mesajlar için
const AppError = require('../utils/appError');

const getAllCategories = async (req, res,next) => {
  try {
    const categories = await Category.find({});
    if (!categories || categories.length === 0) return next(new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    res.status(HTTP_CODES.OK).json({message:MESSAGES.SUCCESS,categories});
  } catch (error) {
    next(error);
  }
};

const createCategory =async (req,res,next) => {
    try {
        const{name ,description} = req.body;
        if(!name || !description) return next(new AppError(MESSAGES.MISSING_FIELDS,HTTP_CODES.BAD_REQUEST));
        const e = await Category.findOne({name});
        if(e) return next(new AppError(MESSAGES.DUPLICATE_ENTRY,HTTP_CODES.BAD_REQUEST));
        const category = new Category({
            name,
            description
        });
        await category.save();
        res.status(HTTP_CODES.CREATED).json({message:MESSAGES.SUCCESS,category});
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    const {slug} = req.params;
    const {name, description} = req.body;
    try {
        if(!slug) return next(new AppError(MESSAGES.MISSING_FIELDS,HTTP_CODES.BAD_REQUEST));
        const category = await Category.findOne({slug:slug});
        if(!category) return next(new AppError(MESSAGES.CATEGORY_NOT_FOUND,HTTP_CODES.NOT_FOUND));
        console.log(category);
        if(name) category.name = name;
        if(description) category.description = description;
        await category.save();
        res.status(HTTP_CODES.OK).json({message:MESSAGES.SUCCESS,category});
    } catch (error) {
        next(error);
    }
}

const deleteCategory = async (req, res, next) => {
    const { slug } = req.params;
    try {
        if (!slug) return next(new AppError(MESSAGES.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST));
        const category = await Category.findOne({ slug });
        if (!category) return next(new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_CODES.NOT_FOUND));
        await Category.deleteOne({ slug });
        res.status(HTTP_CODES.OK).json({message: MESSAGES.SUCCESS,category});
    } catch (error) {
        next(error);
    }
};

const getCategoryBySlug = async (req, res, next) => {
  const {slug} =req.params;
  try {
    if(!slug) return next(new AppError(MESSAGES.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST));
    const category = await Category.findOne({slug});
    if(!category || category.length === 0) return next(new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_CODES.NOT_FOUND));
    res.status(HTTP_CODES.OK).json({message: MESSAGES.SUCCESS,category});
  } catch (error) {
    next(error);
  }
};
module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryBySlug
};

