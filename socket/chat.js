const { sendMessage, findChat, getHistory, subscribe } = require('../models/chat');

function setupChatSocket(io) {
  io.on('connection', (socket) => {
    const user = socket.request.user;

    if (!user) {
      console.log('Пользователь не авторизован');
      socket.disconnect();
      return;
    }

    const userId = user._id.toString();
    socket.join(`user:${userId}`);
    console.log('Пользователь подключился к чату:', socket.id, 'Пользователь ID:', userId);

    // Получение истории сообщений
    socket.on('getHistory', async (data) => {
      const { receiverId } = data;
      const chat = await findChat([userId, receiverId]);
      const messages = chat ? await getHistory(chat._id) : [];
      socket.emit('chatHistory', messages);
    });

    // Отправка сообщения
    socket.on('sendMessage', async (data) => {
      const { receiver, text } = data;
      const message = await sendMessage({ author: userId, receiver, text });

      // Уведомление о новом сообщении для получателя
      io.to(`user:${receiver}`).emit('newMessage', { chatId: message.chatId, message });
    });

    // Подписка на новые сообщения
    subscribe(({ chatId, message }) => {
      const receiverRoom = `user:${message.receiver}`;
      io.to(receiverRoom).emit('newMessage', { chatId, message });
    });

    // Отключение пользователя
    socket.on('disconnect', () => {
      console.log('Пользователь отключился:', socket.id);
    });
  });
}

module.exports = setupChatSocket;
