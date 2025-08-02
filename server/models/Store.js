const mongoose = require('mongoose');
const StoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeName: String,
  storeEmail: String,
  storePhone: String,
  storeWhatsapp: String,
  storeCity: String,
  storeAddress: String,
  businessCategory: String,
  // Selected theme identifier
  theme: String,
});
module.exports = mongoose.model('Store', StoreSchema);

