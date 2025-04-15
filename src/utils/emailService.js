const { createTransporter } = require("../config/mailConfig");
const welcomeEmailTemplate = require("./emailTemplates/welcome.js");
const adminNotificationTemplate = require("./emailTemplates/adminNotification.js");

/**
 * Email servisi - çeşitli e-posta türlerini gönderen fonksiyonları içerir
 */
class EmailService {
  static async sendWelcomeEmail(user) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"ONLINE-education-platform" <${
          process.env.EPOSTA || "<tumeal@outlook.com.tr>"
        }>`,
        to: user.email,
        subject: "Hoş Geldiniz! Kaydınız Başarıyla Tamamlandı",
        html: welcomeEmailTemplate(user),
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Hoş geldiniz e-postası gönderildi:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Hoş geldiniz e-postası gönderilirken hata oluştu:", error);
      return { success: false, error: error.message };
    }
  }

  static async sendAdminNotification(user, adminEmail) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"Sistem Bildirimi" <${
          process.env.MAIL_USER || "noreply@uygulama.com"
        }>`,
        to: adminEmail || process.env.ADMIN_EMAIL || "admin@uygulama.com",
        subject: "Yeni Kullanıcı Kaydı Bildirimi",
        html: adminNotificationTemplate(user),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Admin bildirim e-postası gönderildi:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(
        "Admin bildirim e-postası gönderilirken hata oluştu:",
        error
      );
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;
