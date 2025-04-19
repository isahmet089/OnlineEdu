const {body} = require("express-validator");

const categoryValidationRules = {
    name: body("name")
        .trim()
        .notEmpty().withMessage("Kategori adı boş bırakılamaz.")
        .isLength({ min: 2, max: 20 }).withMessage("Kategori adı 2-20 karakter arasında olmalıdır."),
  
    description: body("description")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("Kategori açıklaması en fazla 200 karakter olmalıdır."),
};

const updateCategoryValidationRules = {
   name : body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 20 }).withMessage("Kategori adı 2-20 karakter arasında olmalıdır."),
    
    description :body("description")
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage("Kategori açıklaması en fazla 200 karakter olmalıdır."),
};

module.exports = {
categoryValidationRules,
updateCategoryValidationRules
};
