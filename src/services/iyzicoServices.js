const Iyzipay = require('iyzipay'); // Iyzipay kütüphanesi


// Iyzipay client'ını başlat
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL, // Sandbox veya production URL'si
});

exports.processPayment = async (user, course, paymentDetails,ipAddress) => {
    // user: veritabanından çekilmiş kullanıcı objesi
    // course: veritabanından çekilmiş kurs objesi
    // paymentDetails: client'tan gelen ödeme bilgileri (kart detayları/token)

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: generateUniqueConversationId(), // Her işlem için benzersiz ID oluştur
        price: course.price.toFixed(2), // Kurs fiyatı
        paidPrice: course.price.toFixed(2), // Aynı fiyattan ödendiği varsayılır
        currency: Iyzipay.CURRENCY.TRY, // Para birimi
        installment: '1', // Tek çekim
        basketId: `COURSE_${course._id.toString()}`, // Kurs ID'si veya benzersiz bir sepet ID'si
        paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT, // Eğitim sanal bir ürün gibi düşünülebilir

        paymentCard: {
            cardHolderName: paymentDetails.cardHolderName,
            cardNumber: paymentDetails.cardNumber,
            expireMonth: paymentDetails.expireMonth,
            expireYear: paymentDetails.expireYear,
            cvc: paymentDetails.cvc,
            registerCard: '0' // Kartı kaydetmek istemiyorsanız '0'
            // Token kullanılıyorsa farklı alanlar olabilir
        },

        buyer: {
            id: user._id.toString(), // Kullanıcı ID'si
            name: user.firstName, // Kullanıcının adı
            surname: user.lastName, // Kullanıcının soyadı
            gsmNumber: user.gsmNumber, // Kullanıcının telefon numarası
            email: user.email, // Kullanıcının e-posta
            identityNumber: user.identityNumber || '11111111111', // TCKN (gereklilikleri kontrol edin)
            lastLoginDate: user.lastLoginDate ? user.lastLoginDate.toISOString().slice(0, 19).replace('T', ' ') : '2023-01-01 00:00:00', // Son giriş tarihi (format önemli)
            registrationDate: user.createdAt ? user.createdAt.toISOString().slice(0, 19).replace('T', ' ') : '2023-01-01 00:00:00', // Kayıt tarihi (format önemli)
            registrationAddress: user.address || 'Adres Bilgisi Yok', // Kayıt adresi
            ip: ipAddress ||'127.0.0.1', // Kullanıcının IP adresi (controller'dan servise iletilmeli)
            city: user.city || 'Şehir Bilgisi Yok',
            country: user.country || 'Türkiye',
            zipCode: user.zipCode || '00000'
        },
        // Online eğitim için fiziksel adresler genellikle gerekmeyebilir, Iyzico dokümantasyonunu kontrol edin.
        // Gerekiyorsa kullanıcı profilinden veya formdan alınarak doldurulur.
        shippingAddress: {
            contactName: user.firstName + ' ' + user.lastName,
            city: user.city || 'Şehir Bilgisi Yok',
            country: user.country || 'Turkey',
            address: user.address || 'Adres Bilgisi Yok',
            zipCode: user.zipCode || '00000'
        },
        billingAddress: {
           contactName: user.firstName + ' ' + user.lastName,
           city: user.city || 'Şehir Bilgisi Yok',
           country: user.country || 'Turkey',
           address: user.address || 'Adres Bilgisi Yok',
           zipCode: user.zipCode || '00000'
       },


        basketItems: [
            {
                id: course._id.toString(), // Kurs ID'si ürün ID'si olarak
                name: course.title, // Kurs Adı
                category1: course.category ? course.category.name : 'Eğitim', // Kategori Adı
                category2: 'Online Kurs', // Daha spesifik kategori
                itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL, // Online eğitim sanal üründür
                price: course.price.toFixed(2) // Ürün fiyatı
            },
            // Birden fazla ürün/kurs satılıyorsa buraya eklenecek
        ]
    };

    // Promisify the callback-based create method for easier async/await usage
    return new Promise((resolve, reject) => {
        iyzipay.payment.create(request, function (err, result) {
            if (err) {
                console.error("Iyzico API Error:", err);
                // Hata detaylarını loglayın, kullanıcıya genel bir hata döndürün
                return reject(err); // Iyzico API hatasını fırlat
            }

            console.log("Iyzico API Result:", result);

            if (result.status === 'success') {
                // Ödeme başarılı
                resolve({ success: true, data: result });
            } else {
                // Ödeme başarısız ama API'den geçerli yanıt geldi
                // result.errorMessage, result.errorCode gibi alanları kontrol edin
                resolve({ success: false, message: result.errorMessage, code: result.errorCode, rawResult: result });
            }
        });
    });
};


// Her işlem için benzersiz bir conversationId oluşturan yardımcı fonksiyon
function generateUniqueConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

