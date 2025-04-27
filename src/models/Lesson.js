const mongoose = require('mongoose');
const slugify = require('slugify'); // Slug oluşturmak için
const LessonSchema = new mongoose.Schema({
  title: { // Dersin başlığı
    type: String,
    required: true,
    trim: true
  },
  description: { // Dersin kısa açıklaması veya içeriği
    type: String,
    trim: true,
    required: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  course: { // Bu dersin hangi kursa ait olduğu (Course modeline referans)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: { // Kurs içindeki dersin sırası
    type: Number,
    required: true,
  },
  // Ders Materyalleri - File modeline referanslar
  video: { // Dersin ana videosu (File modeline referans)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File', // 'File' modeline referans veriyoruz
    // required: true // Her dersin videosu olmayabilir, isteğe bağlı
  },
  resources: [ // Derse ait ek kaynaklar (File modeline referanslar dizisi)
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File' // 'File' modeline referanslar dizisi
    }
  ],
  // İsteğe bağlı olarak ileride eklenebilir alanlar: status vb.

}, {
  timestamps: true // createdAt ve updatedAt alanları
});

// İsteğe bağlı olarak, bir kurs içindeki ders sırasının benzersizliğini sağlamak için index:
// LessonSchema.index({ course: 1, order: 1 }, { unique: true });
// Slug otomatik oluşturma
LessonSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  let baseSlug = slugify(this.title, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;

  // Slug benzersiz olana kadar kontrol et
  while (await mongoose.models.Lesson.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
  next();
});


module.exports = mongoose.model('Lesson', LessonSchema);