const mongoose = require('mongoose');
const CreateSaleHomeSchema = mongoose.Schema(
  {
    img_show: String,
    number_home: String,
    name_home: String,
    province: String,
    location_home: String,
    price_home: String,
    detail_home: String,
    status_home: String,
    img_all: {
      type: [String], // เปลี่ยนจาก String เป็น [String]
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_salehome', CreateSaleHomeSchema);
