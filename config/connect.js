// config/connect.js
const mongoose = require('mongoose');
const DB_URI = 'mongodb://127.0.0.1:27017/Mobileapp';
// const DB_URI =
//   'mongodb://chase:Adm1nP%40ssw0rd23!@10.0.143.206:27017/MobileApp?authMechanism=DEFAULT&authSource=MobileApp';
const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connect MongoDB Success');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ MongoDB:', error);
  }
};

const getCollection = (collectionName) => {
  return mongoose.connection.collection(collectionName);
};

module.exports = {
  connectDB,
  getCollection,
};
