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

const server = http.createServer(app);
const io = socketIo(server, {
  allowEIO3: true,
  perMessageDeflate: false,
});

// Настройка сессий для HTTP и WebSocket
const sessionMiddleware = session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL })
});

// Применяем sessionMiddleware как к HTTP, так и к WebSocket
app.use(sessionMiddleware);

// Настраиваем Passport для HTTP
app.use(passport.initialize());
app.use(passport.session());

// Подключаем сессии и Passport к WebSocket
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
io.use((socket, next) => {
  passport.initialize()(socket.request, {}, next);
});
io.use((socket, next) => {
  passport.session()(socket.request, {}, next);
});

// Проверка авторизации пользователя
io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error("Unauthorized"));
  }
});

// Подключаем чат через WebSocket
setupChatSocket(io);

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Подключено к MongoDB'))
  .catch((err) => console.error('Нет подключения к MongoDB', err));

app.use(express.json());

// Подключение маршрутов
app.use('/api', authRoutes);
app.use('/api', advertisementRoutes);

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = app;
