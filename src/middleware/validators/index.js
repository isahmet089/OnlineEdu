const userValidationRules = require("./userValidator");
const {categoryValidationRules,updateCategoryValidationRules} = require("./categoryValidator");
const validate = require("./validatorMiddleware");

const validateRegistration = [
  userValidationRules.userName,
  userValidationRules.firstName,
  userValidationRules.lastName,
  userValidationRules.email,
  userValidationRules.password,
  userValidationRules.role, // optional olabilir
  validate,
];

const validateLogin = [
    userValidationRules.emailOrUserName, validate
];

const validateForgotPassword = [
  userValidationRules.email,
  validate,
];

const validateResetPassword = [
  userValidationRules.password,
  validate,
];

//category validation rules
const validateCategoryCreate = [
  categoryValidationRules.name,
  categoryValidationRules.description,
  validate,
];

const updateCategoryValidation = [
  updateCategoryValidationRules.name,
  updateCategoryValidationRules.description,
  validate,
];






module.exports = {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,

  validateCategoryCreate,
  updateCategoryValidation,
};
