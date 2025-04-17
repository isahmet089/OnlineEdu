const userValidationRules = require("./userValidator");
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



module.exports = {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};
