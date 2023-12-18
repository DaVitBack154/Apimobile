const mongoose = require('mongoose');
const CreateOtpSchema = mongoose.Schema(
  {
    phone: String,
    otp: String,
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_otp', CreateOtpSchema);
