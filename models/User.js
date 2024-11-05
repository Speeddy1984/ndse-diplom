const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  contactPhone: { type: String }
});

// Хеширование пароля перед сохранением
userSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Функция создания пользователя
async function createUser(data) {
  const user = new User(data);
  return user.save();
}

// Функция поиска пользователя по email
async function findByEmail(email) {
  return User.findOne({ email });
}

module.exports = {
  User,
  createUser,
  findByEmail
};
