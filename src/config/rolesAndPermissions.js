// Roller (Roller)
const ROLES = {
    ADMIN: 'admin',         // Yönetici: Platformdaki en yetkili rol.
    INSTRUCTOR: 'instructor', // Eğitmen: Kurs oluşturan ve yöneten rol.
    STUDENT: 'student',       // Öğrenci: Kurslara katılan ve içerikleri tüketen rol.
  };
  
  // İzinler (Permissions) - Her bir iznin ne anlama geldiği yorum satırlarında belirtilmiştir.
  const PERMISSIONS = {
    // === Genel Ayarlar ===
    MANAGE_SETTINGS: 'manage_settings',       // Platformun genel ayarlarını (site adı, logo, entegrasyonlar vb.) yönetme yetkisi.
  
    // === Kullanıcı Yönetimi ===
    MANAGE_USERS: 'manage_users',           // Tüm kullanıcıları (öğrenci, eğitmen, admin) oluşturma, düzenleme, silme ve rollerini atama yetkisi.
    MANAGE_OWN_PROFILE: 'manage_own_profile', // Kullanıcının kendi profilini (bilgilerini, şifresini) düzenleme yetkisi.
    VIEW_USERS: 'view_users',                 // Sistemdeki kullanıcıların listesini ve profillerini görüntüleme yetkisi.
  
    // === Kurs ve İçerik Yönetimi ===
    MANAGE_ALL_COURSES: 'manage_all_courses', // Sistemdeki *tüm* kursları, dersleri, sınavları ve diğer içerikleri oluşturma, düzenleme, silme ve yayınlama/yayından kaldırma yetkisi (Genellikle Admin veya Editor için).
    MANAGE_OWN_COURSES: 'manage_own_courses', // *Sadece kendi oluşturduğu* kursları, dersleri, sınavları ve diğer içerikleri yönetme yetkisi (Genellikle Eğitmen için).
    CREATE_COURSE_CONTENT: 'create_course_content', // Yeni bir kurs, ders, sınav veya içerik öğesi oluşturabilme temel yetkisi. (Düzenleme/silme bu izne dahil değildir).
    VIEW_COURSES: 'view_courses',             // Platformda listelenen veya yayınlanmış olan kursları genel olarak görebilme yetkisi (Kursa kayıt olmadan).
  
    // === Kayıt (Enrollment) ve Erişim ===
    MANAGE_ENROLLMENTS: 'manage_enrollments',   // Öğrencileri manuel olarak kurslara kaydetme veya kurslardan çıkarma yetkisi (Admin veya Eğitmen için).
    ENROLL_SELF: 'enroll_self',               // Öğrencinin bir kursa kendi kendine kaydolabilme yetkisi (Eğer sistem bu özelliği destekliyorsa).
    ACCESS_ENROLLED_COURSE_CONTENT: 'access_enrolled_course_content', // Öğrencinin *kayıtlı olduğu* bir kursun derslerine, materyallerine ve sınavlarına erişme yetkisi.
  
    // === Değerlendirme ve İlerleme Takibi ===
    SUBMIT_ASSIGNMENT: 'submit_assignment',     // Öğrencinin bir kurs içindeki ödevi veya sınavı tamamlayıp gönderebilme yetkisi.
    GRADE_SUBMISSIONS: 'grade_submissions',     // Eğitmenin veya yöneticinin, öğrencilerin gönderdiği ödevleri/sınavları inceleyip notlandırma yetkisi.
    VIEW_OWN_PROGRESS: 'view_own_progress',     // Öğrencinin bir kurstaki veya genel olarak platformdaki kendi ilerlemesini (tamamlanan dersler, notlar vb.) görme yetkisi.
    VIEW_STUDENT_PROGRESS: 'view_student_progress', // Eğitmenin, *kendi kurslarına kayıtlı* öğrencilerin ilerlemesini ve notlarını takip etme yetkisi.
  
    // === Diğer Kategori/Yapılandırma ===
    MANAGE_CATEGORIES: 'manage_categories'      // Kursların sınıflandırıldığı kategorileri (örn: Yazılım, Tasarım, Pazarlama) oluşturma, düzenleme ve silme yetkisi.
  };
  
  // Rol İzin Eşleştirmesi (Role Permissions Mapping)
const rolePermissions = {
    // --- Yönetici Rolü İzinleri ---
    [ROLES.ADMIN]: [
      PERMISSIONS.MANAGE_SETTINGS,          // Platform ayarlarını yönetir.
      PERMISSIONS.MANAGE_USERS,             // Tüm kullanıcıları yönetir (oluştur, sil, düzenle).
      PERMISSIONS.VIEW_USERS,               // Tüm kullanıcıları listeler/görür.
      PERMISSIONS.MANAGE_ALL_COURSES,       // *Tüm* kursları ve içeriklerini yönetir.
      PERMISSIONS.CREATE_COURSE_CONTENT,    // Kurs/içerik oluşturabilir.
      PERMISSIONS.VIEW_COURSES,             // Tüm kursları görür.
      PERMISSIONS.MANAGE_ENROLLMENTS,       // Tüm kayıtları yönetir (öğrenci ekle/çıkar).
      PERMISSIONS.GRADE_SUBMISSIONS,        // Tüm gönderimleri notlandırabilir.
      PERMISSIONS.VIEW_STUDENT_PROGRESS,    // Tüm öğrencilerin ilerlemesini görür.
      PERMISSIONS.MANAGE_CATEGORIES         // Kurs kategorilerini yönetir.
    ],
    // --- Eğitmen Rolü İzinleri ---
    [ROLES.INSTRUCTOR]: [
      PERMISSIONS.MANAGE_OWN_COURSES,       // *Sadece kendi* kurslarını yönetir.
      PERMISSIONS.CREATE_COURSE_CONTENT,    // Kurs/içerik oluşturabilir.
      PERMISSIONS.VIEW_COURSES,             // Kursları görür.
      PERMISSIONS.VIEW_USERS,               // Kullanıcıları listeler (genellikle kendi öğrencileri).
      PERMISSIONS.ACCESS_ENROLLED_COURSE_CONTENT, // Kendi kurs içeriklerine erişir.
      PERMISSIONS.GRADE_SUBMISSIONS,        // Kendi kurslarındaki gönderimleri notlandırır.
      PERMISSIONS.VIEW_STUDENT_PROGRESS,    // Kendi öğrencilerinin ilerlemesini görür.
      PERMISSIONS.MANAGE_ENROLLMENTS        // Kendi kurslarına öğrenci kaydı yönetir (opsiyonel).
    ],
    // --- Öğrenci Rolü İzinleri ---
    [ROLES.STUDENT]: [
      PERMISSIONS.VIEW_COURSES,             // Kursları listeler/görür.
      PERMISSIONS.ENROLL_SELF,              // Kurslara kendi kendine kaydolabilir.
      PERMISSIONS.ACCESS_ENROLLED_COURSE_CONTENT, // Kayıtlı olduğu kurs içeriklerine erişir.
      PERMISSIONS.SUBMIT_ASSIGNMENT,        // Ödev/sınav gönderebilir.
      PERMISSIONS.VIEW_OWN_PROGRESS,         // Kendi ilerlemesini/notlarını görür.
      PERMISSIONS.MANAGE_OWN_PROFILE      // Kendi profilini yönetir (opsiyonel).
    ]
  };
  
  module.exports = { ROLES, PERMISSIONS, rolePermissions };