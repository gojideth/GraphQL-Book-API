const mongoose = require('mongoose');
const Author = mongoose.model(
  "Author",
  new mongoose.Schema({
    firstName:{
      type:String,
      required: true
    },
    lastName: {
      type:String,
      required: true
    },
    country: String,
    booksWritten: []
  })
);

module.exports = Author;
