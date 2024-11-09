const express = require('express');
const passport = require('passport');
const { createUser, findByEmail } = require('../models/user');
const router = express.Router();
const { sendSuccess, sendError } = require('../utils/response');

// Регистрация
router.post('/signup', async (req, res) => {
  const { email, password, name, contactPhone } = req.body;

  try {
    // Проверка, существует ли пользователь с таким email
    if (await findByEmail(email)) {
      return sendError(res, "email занят", "error", 400);
    }

    // Создание пользователя (пароль будет хэширован в модели User)
    const user = await createUser({ email, passwordHash: password, name, contactPhone });
    sendSuccess(res, {
      id: user._id,
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
    });
  } catch (error) {
    sendError(res, error.message);
  }
});

// Вход
router.post('/signin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return sendError(res, info.message, "error", 401);
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      sendSuccess(res, {
        id: user._id,
        email: user.email,
        name: user.name,
        contactPhone: user.contactPhone,
      });
    });
  })(req, res, next);
});

module.exports = router;
