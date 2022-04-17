const mongoose = require('mongoose');
const Book = mongoose.model(
  "Book",
  new mongoose.Schema({
    title:{
      type: String,
      required:true  
    },
    ISBN:{
      type: String,
      required:true  
      
    },
    synopsis:{
      type: String,
      required:true  
      
    },
    publisher:{
      type: mongoose.Schema.ObjectId,
      ref: "Publisher",
      required:true
    },
    genres: [],
    publicationYear: Number,
    authors:[]
  })
);

module.exports = Book;