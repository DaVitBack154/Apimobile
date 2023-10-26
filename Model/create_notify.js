const mongoose = require('mongoose');
const CreateNotifySchema = mongoose.Schema(
  {
    contract_no: String,
    title_noti: String,
    body_noti: String,
    datetime_noti: Date,
    date_save: Date,
    status_read: String,
    status_noti: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_notify', CreateNotifySchema);
