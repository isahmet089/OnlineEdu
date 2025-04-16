const { createTransporter } = require("../config/mailConfig");
const welcomeEmailTemplate = require("./emailTemplates/welcome.js");


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
  static async sendResetPasswordEmail(user, resetPasswordUrl){
    
    if(!resetPasswordUrl){
      return { success: false, error: "Reset password token is not provided" };
    }
    try{
      const transporter = createTransporter();
      const mailOptions = {
        from: `"ONLINE-education-platform" <${
          process.env.EPOSTA || "<tumeal@outlook.com.tr>"
        }>`,
        to: user.email,
        subject: "Şifre Sıfırlama Talebi",
        html: `
        <p>Merhaba ${user.firstName || ''},</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${resetPasswordUrl}">${resetPasswordUrl}</a>`,
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Şifre sıfırlama e-postası gönderildi:", info.messageId);
      return { success: true, messageId: info.messageId };
    }catch(error){
      console.error("Şifre sıfırlama e-postası gönderilirken hata oluştu:", error);
      return { success: false, error: error.message };
    }
    
  }

}

module.exports = EmailService;
