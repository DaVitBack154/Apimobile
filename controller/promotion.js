const CreatePromotion = require('../Model/create_promotion');
const moment = require('moment');

module.exports.CreatePromotion = async (req, res) => {
  try {
    let promotionData = req.body;
    if (req.file) {
      promotionData.file = req.file.filename;
    }

    const promotion = new CreatePromotion({
      image: promotionData.image,
      title_pro: promotionData.title_pro,
      content_pro: promotionData.content_pro,
      type_image: promotionData.type_image,
      expired_date: promotionData.expired_date,
      status: 'ON',
    });

    await promotion.save();

    return res.json({ status: true, data: promotion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports.GetPromotion = async (req, res) => {
  try {
    const promotions = await CreatePromotion.find({}).exec();

    for (let i = 0; i < promotions.length; i++) {
      const promotion = promotions[i];

      if (promotion.expired_date) {
        const expiredDate = moment(promotion.expired_date, 'YYYY/MM/DD');
        const currentDate = moment();

        if (expiredDate.isSameOrBefore(currentDate, 'day')) {
          // ทำการอัปเดต status เป็น 'OFF' ในฐานข้อมูล
          await CreatePromotion.findByIdAndUpdate(promotion._id, {
            status: 'OFF',
          }).exec();
          promotion.status = 'OFF'; // อัปเดตค่าในตัวแปรโปรโมชั่นด้วย
        }

        promotion.expired_date = expiredDate.format('YYYY/MM/DD');
      } else {
        promotion.expired_date = 'ไม่มีวันหมดอายุ';
      }
    }

    return res.status(200).send({ data: promotions });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

module.exports.GetPromotionID = async (req, res) => {
  try {
    const id = req.params.id;
    const promotion = await CreatePromotion.findOne({ _id: id }).exec();
    // return res.status(200).send({ data: promotion });
    return res.json({ status: true, data: promotion });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

module.exports.UpdatePromotion = async (req, res) => {
  try {
    // code
    const id = req.params.id;
    const updated = await CreatePromotion.findOneAndUpdate(
      { _id: id },
      req.body,
      {
        new: true,
      }
    ).exec();
    res.send(updated);
  } catch (err) {
    // error
    console.log(err);
    res.status(500).send('Server Error');
  }
};

module.exports.DeletePromotion = async (req, res) => {
  try {
    // code
    const id = req.params.id;
    const removed = await CreatePromotion.findOneAndDelete({ _id: id }).exec();

    if (removed?.file) {
      await fs.unlink('./uploads/' + removed.file, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Remove success');
        }
      });
    }

    res.send(removed);
  } catch (err) {
    // error
    console.log(err);
    res.status(500).send('Server Error');
  }
};

module.exports.uploadImage = async (req, res) => {
  if (req.file) {
    return res.send({
      status: true,
      message: 'อัพโหลดรูปภาพสำเร็จ',
      data: { filename: req.file.filename, path: req.file.path },
    });
  } else {
    return res.send({ status: false, message: 'อัพโหลดรูปภาพล้มเหลว' });
  }
};
