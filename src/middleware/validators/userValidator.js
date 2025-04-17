const { body } = require("express-validator");

const userValidationRules = {
  email: body("email")
    .trim()
    .notEmpty().withMessage("E-posta alanı boş bırakılamaz.")
    .isEmail().withMessage("Geçerli bir email adresi girin.")
    .normalizeEmail()
    .toLowerCase(),

  password: body("password")
    .notEmpty().withMessage("Şifre alanı boş bırakılamaz.")
    .isLength({ min: 6 }).withMessage("Şifre en az 6 karakter olmalıdır.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir."),

  userName: body("userName")
    .trim()
    .notEmpty().withMessage("Kullanıcı adı boş bırakılamaz.")
    .isLength({ min: 3, max: 30 }).withMessage("Kullanıcı adı 3-30 karakter arasında olmalıdır."),

  firstName: body("firstName")
    .trim()
    .notEmpty().withMessage("İsim alanı zorunludur.")
    .isLength({ min: 2, max: 50 }).withMessage("İsim 2-50 karakter arasında olmalıdır."),

  lastName: body("lastName")
    .trim()
    .notEmpty().withMessage("Soyisim alanı zorunludur.")
    .isLength({ min: 2, max: 50 }).withMessage("Soyisim 2-50 karakter arasında olmalıdır."),

  // Eğer `role` kullanıcıdan alınacaksa (zorunlu değilse)
  role: body("role")
    .optional()
    .isString().withMessage("Rol geçerli bir string olmalıdır."),

  emailOrUserName: body("emailOrUserName")
    .trim()
    .notEmpty().withMessage("E-posta veya kullanıcı adı zorunludur."),
    

};

  


module.exports = userValidationRules;
