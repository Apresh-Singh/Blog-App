const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: String,
  description: String
});

module.exports = mongoose.model('Blog', blogSchema);
