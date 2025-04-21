const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Course = require("../models/Course");
const FileService = require("../services/fileService");

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      const courseSlug = req.params.courseSlug;
      const course = await Course.findOne({slug:courseSlug}).populate("category");
      if (!course || !course.category) {
        return cb(new Error("Course or category not found"), null);
      }

      const fileService = new FileService();
      const folderPath = fileService.createCourseFolder(course.category.slug, course.slug);
      cb(null, folderPath);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, "thumbnail" + ext); // Her kurs için 1 thumbnail
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) return cb(null, true);
  cb(new Error("Thumbnail must be a valid image"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
