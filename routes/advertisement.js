const express = require('express');
const { Advertisement, createAdvertisement, findAdvertisements, removeAdvertisement } = require('../models/advertisement');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const ensureAuthenticated = require('../middlewares/authMiddleware');
const { sendSuccess, sendError } = require('../utils/response');

// Настройка загрузки файлов с помощью multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Получение расширения файла!!!
    const ext = path.extname(file.originalname);
    const newFileName = Date.now() + ext;
    cb(null, newFileName);
  }
});

const upload = multer({ storage: storage });


// Создание объявления (приватно)
router.post('/advertisements', ensureAuthenticated, upload.array('images'), async (req, res) => {
  const { shortText, description, tags } = req.body;
  console.log('Session:', req.session);
  console.log('User:', req.user);

  const userId = req.user ? req.user._id : null;

  if (!userId) {
    return sendError(res, "Необходимо аутентифицироваться", "error", 401);
  }

  try {
    // Сохраняем пути к загруженным файлам с расширениями!
    const images = req.files.map(file => file.path);
    const advertisement = await createAdvertisement({ shortText, description, tags, images, userId });
    
    sendSuccess(res, {
      id: advertisement._id,
      shortText: advertisement.shortText,
      description: advertisement.description,
      images: advertisement.images,
      user: { id: userId },
      createdAt: advertisement.createdAt,
    });
  } catch (error) {
    sendError(res, error.message);
  }
});

// Поиск объявлений (публично)
router.get('/advertisements', async (req, res) => {
  try {
    // Получаем все объявления и раскрываем информацию о пользователе через populate
    const advertisements = await Advertisement.find().populate('userId', 'name');

    sendSuccess(res, advertisements.map(ad => ({
      id: ad._id,
      shortText: ad.shortText,
      description: ad.description,
      images: ad.images,
      user: { id: ad.userId._id, name: ad.userId.name },
      createdAt: ad.createdAt,
    })));
  } catch (error) {
    sendError(res, error.message);
  }
});

// Получение данных объявления по id (публично)
router.get('/advertisements/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const advertisement = await Advertisement.findById(id).populate('userId', 'name');
    
    if (!advertisement) {
      return sendError(res, "Объявление не найдено", "error", 404);
    }

    sendSuccess(res, {
      id: advertisement._id,
      shortText: advertisement.shortText,
      description: advertisement.description,
      images: advertisement.images,
      user: {
        id: advertisement.userId._id,
        name: advertisement.userId.name
      },
      createdAt: advertisement.createdAt,
    });
  } catch (error) {
    sendError(res, error.message);
  }
});

// Удаление объявления (приватно)
router.delete('/advertisements/:id', ensureAuthenticated, async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const { id } = req.params;
  console.log("UserId при удалении" + userId);
  console.log("id объявления при удалении" + id);

  if (!userId) {
    return sendError(res, "Необходимо аутентифицироваться", "error", 401);
  }

  try {
    const advertisement = await removeAdvertisement(id);
    if (advertisement.userId.toString() !== userId.toString()) {
      return sendError(res, "Нет доступа для удаления объявления", "error", 403);
    }
    
    res.json({ status: "ok" });
  } catch (error) {
    sendError(res, error.message);
  }
});

module.exports = router;
