const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: { // Dersin başlığı
    type: String,
    required: true,
    trim: true
  },
  description: { // Dersin kısa açıklaması veya içeriği
    type: String,
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


module.exports = mongoose.model('Lesson', LessonSchema);