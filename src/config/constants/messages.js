const MESSAGES = Object.freeze({
  // Genel mesajlar
  SERVER_ERROR: "Sunucu hatası oluştu.",
  FORBIDDEN: "Bu işlemi gerçekleştirmeye yetkiniz yok.",
  NOT_FOUND: "İstenen kaynak bulunamadı.",
  BAD_REQUEST: "Geçersiz istek.",
  UNAUTHORIZED: "Yetkilendirme gerekli.",
  TOO_MANY_REQUESTS: "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.",
  AUTHENTICATION_ERROR: "Kimlik doğrulama hatası.",

  // Auth & User işlemleri
  EMAIL_OR_PASSWORD_REQUIRED: "E-posta ve şifre gereklidir.",
  EMAIL_NOT_FOUND: "E-posta adresi bulunamadı.",
  EMAIL_REQUIRED: "E-posta adresi gereklidir.",
  PASSWORD_REQUIRED: "Şifre gereklidir.",
  USERNAME_REQUIRED: "Kullanıcı adı gereklidir.",
  INVALID_EMAIL: "Geçersiz e-posta adresi.",
  INVALID_PASSWORD: "Şifre en az 6 karakter olmalıdır.",
  USER_NOT_FOUND: "Kullanıcı bulunamadı.",
  EMAIL_ALREADY_EXISTS: "Bu e-posta adresi zaten kullanımda.",
  USERNAME_ALREADY_EXISTS: "Bu kullanıcı adı zaten kullanımda.",
  USER_ALREADY_VERIFIED: "Kullanıcı zaten doğrulanmış.",
  INVALID_CREDENTIALS: "E-posta veya şifre hatalı.",
  ACCOUNT_INACTIVE: "Hesabınız aktif değil.",
  ACCOUNT_BLOCKED: "Hesabınız bloke edilmiş.",
  LOGIN_SUCCESS: "Giriş başarılı.",
  LOGOUT_SUCCESS: "Çıkış başarılı.",
  REGISTRATION_SUCCESS: "Kayıt başarılı.",
  PASSWORDS_DO_NOT_MATCH: "Şifreler eşleşmiyor.",
  INVALID_OLD_PASSWORD: "Eski şifre hatalı.",
  PASSWORD_CHANGED: "Şifreniz başarıyla güncellendi.",
  PROFILE_UPDATED: "Profil güncellendi.",

  // Token işlemleri
  INVALID_TOKEN: "Geçersiz veya süresi dolmuş token.",
  TOKEN_EXPIRED: "Token süresi dolmuş.",
  TOKEN_REQUIRED: "Token gereklidir.",
  TOKEN_GENERATION_FAILED: "Token oluşturulurken hata oluştu.",
  TOKEN_VERIFIED: "Token doğrulandı.",
  EMAIL_VERIFIED: "E-posta adresiniz doğrulandı.",
  EMAIL_VERIFICATION_FAILED: "E-posta doğrulama başarısız oldu.",
  EMAIL_VERIFICATION_SENT: "Doğrulama e-postası gönderildi.",
  PASSWORD_RESET_SENT: "Şifre sıfırlama e-postası gönderildi.",
  PASSWORD_RESET_SUCCESS: "Şifre başarıyla sıfırlandı.",
  INVALID_RESET_TOKEN: "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
  SESSION_EXPIRED: "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.",
  TOKEN_REFREHED: "Token yenilendi.",



  // Alan validasyonları
  MISSING_FIELDS: "Eksik alanlar var.",
  INVALID_FIELDS: "Geçersiz alanlar mevcut.",
  INVALID_ID: "Geçersiz ID formatı.",
  INVALID_INPUT: "Geçersiz giriş verisi.",

  // Yetki / Roller
  ROLE_REQUIRED: "Kullanıcı rolü gereklidir.",
  INVALID_ROLE: "Geçersiz kullanıcı rolü.",
  PERMISSION_DENIED: "Bu işlemi yapmak için yeterli izniniz yok.",

  // Upload / Dosya işlemleri
  FILE_REQUIRED: "Dosya yüklenmedi.",
  FILE_TOO_LARGE: "Dosya boyutu çok büyük.",
  INVALID_FILE_TYPE: "Geçersiz dosya türü.",
  UPLOAD_FAILED: "Dosya yüklenemedi.",

  // Veritabanı
  DB_CONNECTION_FAILED: "Veritabanına bağlanılamadı.",
  DB_OPERATION_FAILED: "Veritabanı işlemi başarısız oldu.",
  DUPLICATE_ENTRY: "Aynı kayıt zaten mevcut.",
  CATEGORY_NOT_FOUND: "Kategori bulunamadı.",

  // Başarı mesajları
  SUCCESS: "İşlem başarılı.",
  CREATED_SUCCESSFULLY: "Başarıyla oluşturuldu.",
  UPDATED_SUCCESSFULLY: "Başarıyla güncellendi.",
  DELETED_SUCCESSFULLY: "Başarıyla silindi.",

  // Diğer mesajlar
  INTERNAL_SERVER_ERROR: "İç sunucu hatası.",


  // Course işlemleri
  COURSE_NOT_FOUND: "Kurs bulunamadı.",
  COURSE_ALREADY_PURCHASED: "Bu kurs zaten satın alındı.",



  // Category işlemleri
  CATEGORY_NOT_FOUND: "Kategori bulunamadı.",

  
  //Instructor işlemleri
  INSTRUCTOR_NOT_FOUND: "Eğitmen bulunamadı.",

  // Payment işlemleri
  PAYMENT_SUCCESS: "Ödeme başarılı.",
  PAYMENT_FAILED: "Ödeme başarısız.",
  COURSE_ALREADY_PURCHASED: "Bu kurs zaten satın alındı.",
  NO_PAYMENTS_FOUND: "Ödeme kaydı bulunamadı.",

  // Lesson işlemleri
  LESSON_NOT_FOUND: "Ders bulunamadı.",
  LESSON_CREATED: "Ders başarıyla oluşturuldu.",
  LESSON_DELETED: "Ders başarıyla silindi.",

  //kurs lesson işlemleri
  PAYMENT_REQUIRED_COURSE: "Bu kursu izlemek için ödeme yapmalısınız.",

  //role işlemleri
  ROLE_NOT_FOUND: "Rol bulunamadı.",
  ROLE_ALREADY_EXISTS: "Bu rol zaten mevcut.",
  ROLE_CREATED: "Rol başarıyla oluşturuldu.",
  ROLE_UPDATED: "Rol başarıyla güncellendi.",

  // Review işlemleri
  REVIEW_NOT_FOUND: "Yorum bulunamadı.",
  REVIEW_ALREADY_EXISTS: "Bu kurs için zaten bir yorum yapılmış.",
  REVIEW_CREATED: "Yorum başarıyla oluşturuldu.", 
  REVIEW_UPDATED: "Yorum başarıyla güncellendi.", 
  REVIEW_DELETED: "Yorum başarıyla silindi.", 
  REVIEW_REQUIRED_FIELDS: "Yorum bilgileri gereklidir.",
  REVIEW_PURCHASE_REQUIRED: "Bu kurs için yorum yapabilmek için önce kursu satın almanız gerekmektedir.",
  JUST_OWN_REVIEW: "Sadece kendi yorumunuzu güncelleyebilirsiniz.",
  

});

module.exports = MESSAGES;
