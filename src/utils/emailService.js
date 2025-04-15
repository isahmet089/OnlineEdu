const { createTransporter } = require("../config/mailConfig");
const welcomeEmailTemplate = require("./emailTemplates/welcome.js");
const adminNotificationTemplate = require("./emailTemplates/adminNotification.js");


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

  static async sendVerificationEmail(user,token){
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;
    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: `"ONLINE-education-platform" <${
          process.env.EPOSTA || "<tumeal@outlook.com.tr>"
        }>`,
        to: user.email,
        subject: "Hoş Geldiniz! Hesabınızı doğrulayın",
        html : `
        <p>Merhaba ${user.firstName || ''},</p>
        <p>Doğrulama linkiniz (15 dakika geçerli):</p>
        <a href="${verificationUrl}">${verificationUrl}</a>`,
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Doğrulama e-postası gönderildi:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Doğrulama e-postası gönderilirken hata oluştu:", error);
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
