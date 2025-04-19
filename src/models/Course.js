const mongoose = require("mongoose");
const slugify = require("slugify");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },

    // ✅ Eklenen Özellikler
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: "default-course-thumbnail.jpg", // frontendte varsayılan bir resim göstermek için
    },
    duration: {
      type: String,
      required: true,
      default: "0 saat", // örnek: "5 saat 30 dakika"
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
  },
  { timestamps: true }
);

// Slug oluşturma middleware
courseSchema.pre("save", async function (next) {
  try {
    if (this.isModified("title") || !this.slug) {
      const slugOptions = {
        lower: true,
        strict: true,
        trim: true,
        locale: "tr",
      };

      let baseSlug = slugify(this.title, slugOptions);
      let slug = baseSlug;
      let counter = 1;

      while (
        await mongoose.model("Course").findOne({
          slug,
          _id: { $ne: this._id },
        })
      ) {
        slug = `${baseSlug}-${counter++}`;
      }

      this.slug = slug;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Slug ile kurs bulmak için static method
courseSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug })
    .populate("category")
    .populate("instructor")
    .populate("lessons");
};

module.exports = mongoose.model("Course", courseSchema);
