// config/connect.js
const mongoose = require('mongoose');
const DB_URI = 'mongodb://197.1.1.96:3000/MobileApp'; // แก้ URI ตามที่คุณใช้งาน

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
  connectDB, // เพิ่มการส่งออกฟังก์ชัน connectDB
  getCollection,
};
