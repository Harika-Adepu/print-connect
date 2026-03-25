// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['customer','owner','admin','delivery'], required: true },
//     phone: { type: String },
//     createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('User', UserSchema);


// src/models/User.model.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,   // always stored lowercase
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['customer', 'owner', 'delivery', 'admin'],// ← must match exactly what frontend sends
    required: true,
    lowercase: true,   // always stored lowercase
  },
  phone: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,   // createdAt + updatedAt
});

module.exports = mongoose.model('User', UserSchema);