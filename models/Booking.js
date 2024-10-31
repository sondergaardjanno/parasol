const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  serviceType: { type: String, required: true },
  description: { type: String },
  preferredDate: { type: Date, required: true },
  photos: [String],
  status: { type: String, default: 'Pending' },
  adminComment: { type: String, default: '' },
  cost: { type: Number, default: 0 }
});

module.exports = mongoose.model('Booking', BookingSchema);
