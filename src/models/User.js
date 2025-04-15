const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../config/rolesAndPermissions.js"); // Roller için config dosyası
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "İsim gereklidir"],
    },
    lastName: {
      type: String,
      required: [true, "İsim gereklidir"],
    },
    email: {
      type: String,
      required: [true, "E-posta gereklidir"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Şifre gereklidir"],
      minlength: 6,
    },
    roles: {
      type: [{
          type: String,
          enum: Object.values(ROLES) // Geçerli roller config dosyasından alınır
      }],
      default: [ROLES.USER] // Varsayılan rol
   },
    isVerified: {
      type: Boolean,
      default: false,
    },  
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(5);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);
