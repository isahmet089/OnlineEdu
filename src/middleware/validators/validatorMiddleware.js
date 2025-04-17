const { validationResult } = require("express-validator");
const {HTTP_CODES} = require("../../config/constants");
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_CODES.BAD_REQUEST).json({
      status: "Validate error",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = validate;