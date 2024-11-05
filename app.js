const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
require('dotenv').config();

const http = require('http');
const socketIo = require('socket.io');
const setupChatSocket = require('./socket/chat');

const authRoutes = require('./routes/auth');
const advertisementRoutes = require('./routes/advertisement');

const app = express();
const PORT = process.env.HTTP_PORT || 3000;

// Создаем HTTP-сервер и настраиваем Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

// Подключаем сокеты для чатов
setupChatSocket(io);

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Подключено к MongoDB'))
  .catch((err) => console.error('Нет подключения к MongoDB', err));

// Настройка сессий
app.use(session({
  secret: 'secretkey',
  resave: true,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL })
}));

app.use(express.json());

// Подключение Passport
app.use(passport.initialize());
app.use(passport.session());

// Подключение маршрутов
app.use('/api', authRoutes);
app.use('/api', advertisementRoutes);

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
module.exports = app;
