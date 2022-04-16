const {connect} = require('mongoose');

const connectDB = async ()=> {
  try {
    const uri = 
    await connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')
  } catch (error) {
    console.error(error);
  }
}

module.exports = {connectDB};
