const mongoose = require('mongoose');
const CreateReqUserSchema = mongoose.Schema(
  {
    name: String,
    surname: String,
    id_card: String,
    no_contract: String,
    list_req: String,
    receive_no: String,
    sent_emailuser: String,
    sent_addressuser: String,
    provin: String,
    district: String,
    subdistrict: String,
    postcode: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_requser', CreateReqUserSchema);
