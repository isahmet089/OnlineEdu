const multer = require("multer");
const path = require("path");
const Course = require("../models/Course");
const FileService = require("../services/fileService");

const storage ={
  thumbnailUpload: multer.diskStorage({
    destination:  function (req, file, cb) {
      const courseSlug = req.params.courseSlug;

      if (!courseSlug) {
        return cb(new Error("Missing course slug in request parameters"), null);
      }

       Course.findOne({ slug: courseSlug })
        .populate("category")
        .then((course) => {
          if (!course || !course.category) {
            return cb(new Error("Course or category not found"), null);
          }

          const fileService = new FileService();
          const folderPath = fileService.createCourseFolder(course.category.slug, course.slug);
          cb(null, folderPath);
        })
        .catch((err) => {
          cb(err, null);
        });
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, "thumbnail" + ext); // Her kurs için 1 thumbnail
  }
})};

const fileFilter = {
  thumbnailUploadFilter:(req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) return cb(null, true);
  cb(new Error("Thumbnail must be a valid image"));
}};

const upload = {
  courseThumbnailUpload: multer({
  storage: storage.thumbnailUpload,
  fileFilter: fileFilter.thumbnailUploadFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})};

module.exports = upload;
