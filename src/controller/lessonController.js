const { MESSAGES ,HTTP_CODES} = require('../config/constants');
const Lesson = require('../models/Lesson');


const createLesson = async (req, res) => { 
    try {
        const { title, description, course, order,} = req.body;
        if (!title || !description || !course || order === undefined) return next(new AppError(MESSAGES.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST)); 
        const newLesson = new Lesson({
            title,
            description,
            course,
            order,
        });
        await newLesson.save();
        
        res.status(201).json({ message: MESSAGES.LESSON_CREATED, lesson: newLesson });
    } catch (error) {
        console.error('Error creating lesson:', error);
        next(error); // Hata işleme middleware'ine yönlendir
    }
};




module.exports = {createLesson};