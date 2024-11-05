const express = require('express');
const passport = require('passport');
const { createUser, findByEmail } = require('../models/user');
const router = express.Router();

// Регистрация
router.post('/signup', async (req, res) => {
  const { email, password, name, contactPhone } = req.body;

  try {
    // Проверка, существует ли пользователь с таким email
    if (await findByEmail(email)) {
      return res.status(400).json({ error: "email занят", status: "error" });
    }

    // Создание пользователя (пароль будет хэширован в модели User)
    const user = await createUser({ email, passwordHash: password, name, contactPhone });
    res.json({
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        contactPhone: user.contactPhone,
      },
      status: "ok"
    });
  } catch (error) {
    res.status(500).json({ error: error.message, status: "error" });
  }
});

// Вход
router.post('/signin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: info.message, status: "error" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          contactPhone: user.contactPhone,
        },
        status: "ok"
      });
    });
  })(req, res, next);
});

module.exports = router;
