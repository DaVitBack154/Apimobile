const mongoose = require('mongoose');
const CreatePromotionSchema = mongoose.Schema(
  {
    image: String,
    title_pro: String,
    content_pro: String,
    type_image: String,
    status: String,
    expired_date: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_promotion', CreatePromotionSchema);
