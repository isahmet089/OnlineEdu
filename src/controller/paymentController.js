const iyzicoService = require('../services/iyzicoServices');
const Course = require('../models/Course'); // Kurs modeliniz
const Payment = require('../models/Payment'); 
const AppError = require('../utils/appError');
const { HTTP_CODES, MESSAGES } = require('../config/constants');


const purchaseCourse = async (req, res, next) => {
    try {
        // Kimliği doğrulanmış kullanıcı bilgisi (Auth middleware'inizden gelmeli)
        const user = req.user; // Kullanıcı bilgisi (req.user) kimlik doğrulama middleware'inden gelmeli
        if (!user) return next(new AppError(HTTP_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED));
        const courseSlug = req.params.courseSlug;
        const course = await Course.findOne({slug:courseSlug}).populate('category');

        if (!course) {
            return res.status(HTTP_CODES.NOT_FOUND).json(MESSAGES.COURSE_NOT_FOUND);
        }
        // Kursun zaten satın alınıp alınmadığını kontrol 
        if (user.purchasedCourses.includes(course._id)) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({ success: false, message: MESSAGES.COURSE_ALREADY_PURCHASED });
        }
        

        // Client'tan gelen ödeme detayları (Kart bilgileri veya token)
        // Güvenlik AÇISINDAN, hassas kart bilgileri server tarafına gelmemeli,
        // Frontend'de Iyzico'nun JS SDK'sı ile token'a dönüştürülüp token gönderilmelidir.
        // Bu örnekte direct kart bilgisi geldiği varsayılıyor (TEST İÇİN), PRODUCTION'da BU ŞEKİLDE YAPMAYIN!
        const paymentDetails = {
            cardHolderName: req.body.cardHolderName,
            cardNumber: req.body.cardNumber,
            expireMonth: req.body.expireMonth,
            expireYear: req.body.expireYear,
            cvc: req.body.cvc,
            // token: req.body.paymentToken // Eğer token kullanıyorsanız
        };

         // IP adresini servise ilet
         const ipAddress = req.ip;

        // Iyzico servisindeki ödeme işlemini çağır
        const paymentResult = await iyzicoService.processPayment(user, course, paymentDetails,ipAddress);

        if (paymentResult.success) {
            // Ödeme Başarılı!
            // Kullanıcının purchasedCourses listesine kursu ekle (User modelini güncelle)
            user.purchasedCourses.push(course._id);
            await user.save();
            course.students.push(user._id);
            await course.save();
            

            console.log("Kurs satın alındı:", course._id, "Kullanıcı:", user._id);
            const payment = new Payment({
                user: user._id,
                course: course._id,
                iyzicoPaymentId: paymentResult.data.paymentId,
                iyzicoConversationId: paymentResult.data.conversationId,
                status: 'success',
                paidPrice: course.price,
                currency: 'TRY'
            });
            await payment.save(); // Ödeme kaydını veritabanına kaydet

            // await Purchase.create({ user: user._id, course: course._id, iyzicoResponse: paymentResult.rawResult, status: 'completed', amount: course.price });
            

            res.status(HTTP_CODES.OK).json({
                success: true,
                message: MESSAGES.PAYMENT_SUCCESS,
                data: paymentResult.data // Iyzico'dan dönen başarılı yanıt
            });

        } else {
            // Ödeme Başarısız (Iyzico'dan hata/başarısız yanıtı döndü)
            // Hata koduna göre kullanıcıya daha spesifik bilgi verebilirsiniz
            res.status(HTTP_CODES.BAD_REQUEST).json({ // Genellikle client hatası (kart reddi vb.) olduğu için 400 kullanılır
                success: false,
                message: paymentResult.message || MESSAGES.PAYMENT_FAILED,
                code: paymentResult.code,
                 // result: paymentResult.rawResult // Debug için Iyzico yanıtını dönebilirsiniz (güvenli değilse dönmeyin)
            });
        }

    } catch (error) {
        console.error("Error in purchaseCourse controller:", error);
         // Servisten fırlayan Iyzico hatalarını veya diğer beklenmedik hataları yakala
         if (error && error.message && error.errorCode) { // Iyzipay kütüphanesinin döndürdüğü hatalar
              return res.status(400).json({ success: false, message: `Iyzico Hatası: ${error.errorMessage || error.message}`, code: error.errorCode });
         }
        next(error); // Diğer hatalar
    }
};

const getPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find().populate('user', 'firstName lastName email').populate('course', 'title price').sort({ createdAt: -1 });
        if (!payments || payments.length === 0) {
            return res.status(HTTP_CODES.NOT_FOUND).json({ success: false, message: MESSAGES.NO_PAYMENTS_FOUND });
        }
        res.status(HTTP_CODES.OK).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error("Error in getPayments controller:", error);
        next(error);
    }
};

module.exports = {
    purchaseCourse,
    getPayments
};