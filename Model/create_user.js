const mongoose = require('mongoose');
const CreateUserSchema = mongoose.Schema(
  {
    gent_name: {
      type: String,
    },
    name: String,
    surname: String,
    id_card: {
      type: String,
      unique: true,
    },
    email: String,
    phone: String,
    pin: {
      type: String,
    },
    type_customer: String,
    sent_addressuser: String,
    provin: String,
    district: String,
    subdistrict: String,
    postcode: String,
    device: String,
    yomrub1: String,
    yomrub2: String,
    yomrub3: String,
    starpoint: String,
    comment: String,
    status_star: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_user', CreateUserSchema);
