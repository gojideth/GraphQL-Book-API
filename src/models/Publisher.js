const mongoose = require('mongoose');
const Publisher = mongoose.model(
  "Publisher",
  new mongoose.Schema({
    name:{
      type: String,
      required:true
    },
    foundationYear:{
      type: Number,
      required:true
    },
    booksPublished: [{ type:  mongoose.Schema.ObjectId, ref: 'Book' }]
  })
);

module.exports = Publisher;