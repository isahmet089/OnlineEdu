const fs = require("fs");
const path = require("path");

class FileService {
  constructor(basePath = path.join(__dirname, "..", "uploads")) {
    this.basePath = basePath;
  }

  /**
   * Belirtilen klasörü oluşturur (varsa oluşturmaz).
   * @param {string} relativePath 
   * @returns {string} Full path
   */
  createDirectory(relativePath) {
    const fullPath = path.join(this.basePath, relativePath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log("Klasör oluşturuldu:", fullPath);
    }
    return fullPath;
  }

  /**
   * Belirli bir kurs için uploads/category/course klasörü oluşturur.
   * @param {string} categorySlug 
   * @param {string} courseSlug 
   */
  createCourseFolder(categorySlug, courseSlug) {
    const relativePath = path.join(categorySlug, courseSlug);
    return this.createDirectory(relativePath);
  }

  // 🔜 Gelecekte eklenebilir: createLessonFolder(), deleteFolder(), uploadFile(), vs.
}

module.exports = FileService;

