const mongoose = require('mongoose');
const EventEmitter = require('events');
const chatEvents = new EventEmitter();

// Модель для сообщения
const messageSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sentAt: { type: Date, default: Date.now, required: true },
  text: { type: String, required: true },
  readAt: { type: Date }
});

// Модель для чата
const chatSchema = new mongoose.Schema({
  users: { type: [mongoose.Schema.Types.ObjectId], required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  messages: [messageSchema]
});

const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);

// Функция получения чата между двумя пользователями
async function findChat(users) {
  return Chat.findOne({ users: { $all: users } });
}

// Функция отправки сообщения
async function sendMessage(data) {
  const { author, receiver, text } = data;

  // Находим или создаем чат
  let chat = await findChat([author, receiver]);
  if (!chat) {
    chat = new Chat({ users: [author, receiver] });
  }

  // Добавляем сообщение в чат
  const message = { author, text, sentAt: new Date() };
  chat.messages.push(message);
  console.log("Сообщение добавлено");

  await chat.save();

  // Оповещение о новом сообщении через EventEmitter
  chatEvents.emit('newMessage', { chatId: chat._id, message });

  return chat.messages[chat.messages.length - 1];
}


// Функция получения истории сообщений в чате
async function getHistory(chatId) {
  const chat = await Chat.findById(chatId).populate('messages.author', 'name');
  return chat ? chat.messages : [];
}

// Функция подписки на новые сообщения
function subscribe(callback) {
  chatEvents.on('newMessage', callback);
}

module.exports = {
  Chat,
  Message,
  findChat,
  sendMessage,
  getHistory,
  subscribe
};