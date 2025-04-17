const User = require('../models/User');
const { HTTP_CODES, MESSAGES } = require('../config/constants'); // Log ve mesajlar için
const AppError = require('../utils/appError'); // Hata yönetimi için

// Tüm kullanıcıları al
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(HTTP_CODES.OK).json(users);
  } catch (error) {
    console.error("Kullanıcılar alınırken hata oluştu:", error);
    next(new AppError(MESSAGES.INTERNAL_SERVER_ERROR, HTTP_CODES.INT_SERVER_ERROR)); 
  }
};

// Yeni kullanıcı oluştur
const createUser = async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    // Gerekli alanların olup olmadığını kontrol et
    if (!firstName || !lastName || !email || !password) {
      console.log("Eksik kullanıcı bilgileri:", req.body);
      throw new AppError(MESSAGES.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST);
    }

    // Kullanıcıyı oluştur
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    // Yeni kullanıcıyı kaydet
    await user.save();
    console.log(`Yeni kullanıcı oluşturuldu: ${user._id}`);
    res.status(HTTP_CODES.CREATED).json(user);
  } catch (error) {
    console.error("Kullanıcı oluşturulurken hata oluştu:", error);
    next(new AppError(MESSAGES.INTERNAL_SERVER_ERROR, HTTP_CODES.INT_SERVER_ERROR));
  }
};

// Kullanıcıyı güncelle
const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, role } = req.body;

  try {
    // Kullanıcı ID'si yoksa hata fırlat
    if (!id) throw new AppError(MESSAGES.USER_ID_REQUIRED, HTTP_CODES.BAD_REQUEST);

    const user = await User.findById(id);
    if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_CODES.NOT_FOUND);

    // Güncelleme işlemleri
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) {
      if (user.email !== email) {
        // E-posta adresi değiştirilmişse kontrol et
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new AppError(MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_CODES.BAD_REQUEST);
      }
      user.email = email;
    }
    if (password) user.password = password;
    if (role) user.role = role;

    // Kullanıcıyı kaydet
    await user.save();
    console.log(`Kullanıcı güncellendi: ${user._id}`);
    res.status(HTTP_CODES.OK).json({ message: MESSAGES.USER_UPDATED, user });
  } catch (error) {
    console.error("Kullanıcı güncellenirken hata oluştu:", error);
    next(new AppError(MESSAGES.INTERNAL_SERVER_ERROR, HTTP_CODES.INT_SERVER_ERROR));
  }
};

// Kullanıcıyı sil
const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_CODES.NOT_FOUND);
    
    console.log(`Kullanıcı silindi: ${id}`);
    res.status(HTTP_CODES.OK).json({ message: MESSAGES.USER_DELETED });
  } catch (error) {
    console.error("Kullanıcı silinirken hata oluştu:", error);
    next(new AppError(MESSAGES.INTERNAL_SERVER_ERROR, HTTP_CODES.INT_SERVER_ERROR));
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
