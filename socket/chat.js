const { sendMessage, findChat, getHistory, subscribe } = require('../models/chat');

function setupChatSocket(io) {
  io.on('connection', (socket) => {
    console.log('Пользователь подключился к чату:', socket.id);

    // Получение истории сообщений
    socket.on('getHistory', async (data) => {
      const { receiverId, userId } = data;
      const chat = await findChat([userId, receiverId]);
      const messages = chat ? await getHistory(chat._id) : [];
      socket.emit('chatHistory', messages);
    });

    // Отправка сообщения
    socket.on('sendMessage', async (data) => {
      const { author, receiver, text } = data;
      const message = await sendMessage({ author, receiver, text });

      // Уведомление о новом сообщении для всех участников
      socket.to(receiver).emit('newMessage', { chatId: message.chatId, message });
    });

    // Подписка на новые сообщения в чате для данного клиента
    subscribe(({ chatId, message }) => {
      socket.emit('newMessage', { chatId, message });
    });

    // Отключение пользователя
    socket.on('disconnect', () => {
      console.log('Пользователь отключился:', socket.id);
    });
  });
}

module.exports = setupChatSocket;
