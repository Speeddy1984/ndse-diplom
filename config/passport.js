const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User, findByEmail } = require('../models/user');
const bcrypt = require('bcryptjs');

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await findByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Неверный логин или пароль' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return done(null, false, { message: 'Неверный логин или пароль' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  console.log('Сериализация пользователя:', user);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  console.log('Десериализация пользователя ID:', id);
  const user = await User.findById(id);
  // const user = await findByEmail(email);
  console.log('Десериализованный пользователь:', user);
  done(null, user);
});

module.exports = passport;
