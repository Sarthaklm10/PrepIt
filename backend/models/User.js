const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  recipes: [
    {
      id: {
        type: String,
        required: true,
      },
      title: String,
      image: String,
      sourceUrl: String,
      publisher: String,
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
