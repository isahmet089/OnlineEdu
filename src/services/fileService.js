const fs = require("fs");
const path = require("path");

class FileService {
  constructor(basePath = path.join(__dirname, "..", "uploads")) {
    this.basePath = basePath;
  }

  createDirectory(relativePath) {
    const fullPath = path.join(this.basePath, relativePath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log("📁 Klasör oluşturuldu:", fullPath);
    }
    return fullPath;
  }

  createCourseFolder(categorySlug, courseSlug) {
    const relativePath = path.join(categorySlug, courseSlug);
    return this.createDirectory(relativePath);
  }
   // Lesson klasörü için yeni bir helper metot ekleyebiliriz veya createDirectory'i kullanabiliriz.
   createLessonFolder(categorySlug, courseSlug, lessonSlugOrId) {
    const relativePath = path.join(categorySlug, courseSlug, 'lessons', lessonSlugOrId.toString()); // lesson için de bir alt klasör
    return this.createDirectory(relativePath);
}

}

module.exports = FileService;
