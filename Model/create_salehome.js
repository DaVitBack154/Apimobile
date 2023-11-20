const mongoose = require('mongoose');
const CreateSaleHomeSchema = mongoose.Schema(
  {
    img_show: String,
    name_home: String,
    location_home: String,
    price_home: String,
    detail_home: String,
    status_home: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_salehome', CreateSaleHomeSchema);
