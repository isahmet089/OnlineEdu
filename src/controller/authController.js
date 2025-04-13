const User = require("../models/User");


const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      if(!email || !password) throw new Error("Email veya şifre gereklidir");
      const user =await User.findOne({ email });
      if(!user) throw new Error("Kullanıcı bulunamadı");
      const isMatch = await user.comparePassword(password);
      if(!isMatch) throw new Error("Şifre yanlış");
      res.status(200).json({ message: "Giriş başarılı", user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
    if (!firstName || !lastName || !email || !password) {
      throw new Error("Tüm alanlar gereklidir");
    };
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("Bu e-posta adresi zaten kullanılıyor");
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    await user.save();
    res.status(201).json({ message: "Başarıyla kayıt oluşturuldu", user });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const logout = async (req, res) => {
   try {
    
    res.status(200).json({ message: "Başarıyla çıkış yapıldı" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};

module.exports = {
  login,
  register,
  logout,
};