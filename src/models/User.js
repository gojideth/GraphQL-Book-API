const mongoose = require('mongoose');
const User = mongoose.model(
  "User", new mongoose.Schema({
    username:{
      type:String,
      require:true
    },
    email:{
      type:String,
      required: true
    },
    password: {
      type:String,
      required: true
    },
    token:{
      type:String,
      required:true
    }
  })
  
);

module.exports = User;