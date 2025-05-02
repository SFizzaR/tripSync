const mongoose = require('mongoose');

const userRatingsSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  place_id: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

// Ensure unique rating per user and place
userRatingsSchema.index({ user_id: 1, place_id: 1 }, { unique: true });

module.exports = mongoose.model('UserRatings', userRatingsSchema);