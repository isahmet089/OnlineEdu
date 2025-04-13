const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, role } = req.body;
  try {
    if(!id) throw new Error("User ID Yok");
    const user = await User.findById(id);
    if (!user) throw new Error("Kullanıcı Bulunamadı");
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (user.email !== email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("Bu e-posta adresi zaten kullanılıyor");
    }
    if (email) user.email = email;
    if (password) user.password = password;
    if (role) user.role = role;
    await user.save();
    res.status(200).json({message: "Kullanıcı güncellendi",user});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteUser = async (req, res) => { 
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) throw new Error("Kullanıcı Bulunamadı");
    res.status(200).json({ message: "Kullanıcı silindi" });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};