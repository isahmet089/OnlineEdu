const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../config/rolesAndPermissions.js"); // Roller için config dosyası
const slugify = require("slugify"); // Slug oluşturmak için
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Kullanıcı adı gereklidir"],
      unique: true,
    },
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
      default: () => [ROLES.STUDENT] // Varsayılan rol
   },
    isVerified: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);
// Slug oluşturma fonksiyonu (benzersizlik kontrolü ile)
async function generateUniqueSlug(model, slug) {
  const existingUser = await model.findOne({ slug });
  if (existingUser) {
    const count = await model.countDocuments({ slug: { $regex: `^${slug}(?:-\\d+)?$` } });
    return `${slug}-${count + 1}`;
  }
  return slug;
}

// Slug oluşturma middleware'i (kayıt veya userName güncellemesi sırasında)
userSchema.pre("save", async function (next) {
  if (this.isModified("userName") || !this.slug) {
    try {
      const baseSlug = slugify(this.userName, { lower: true, replacement: "-" });
      this.slug = await generateUniqueSlug(this.model("User"), baseSlug);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

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
