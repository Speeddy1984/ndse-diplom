const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  shortText: { type: String, required: true },
  description: { type: String },
  images: { type: [String] },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  tags: { type: [String] },
  isDeleted: { type: Boolean, default: false }
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

// Функция создания объявления
async function createAdvertisement(data) {
  const advertisement = new Advertisement(data);
  return advertisement.save();
}

// Функция поиска объявления по параметрам
async function findAdvertisements(params) {
  const { shortText, description, userId, tags } = params;

  // Строим параметры поиска
  const searchQuery = { isDeleted: false };

  if (shortText) {
    searchQuery.shortText = new RegExp(shortText, 'i');
  }
  if (description) {
    searchQuery.description = new RegExp(description, 'i');
  }
  if (userId) {
    searchQuery.userId = userId;
  }
  if (tags && tags.length) {
    searchQuery.tags = { $all: tags };
  }

  return Advertisement.find(searchQuery);
}

// Функция "удаления" объявления (пометки на удаление)
async function removeAdvertisement(id) {
  return Advertisement.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
}

module.exports = {
  Advertisement,
  createAdvertisement,
  findAdvertisements,
  removeAdvertisement
};
