const CreateSaleHome = require('../Model/create_salehome');
// const moment = require('moment');

module.exports.CreateSalehome = async (req, res) => {
  try {
    let salehome = req.body;
    const newSaleData = new CreateSaleHome({
      number_home: salehome.number_home,
      img_show: salehome.img_show,
      name_home: salehome.name_home,
      province: salehome.province,
      location_home: salehome.location_home,
      price_home: salehome.price_home,
      detail_home: salehome.detail_home,
      img_all: salehome.img_all,
      status_home: 'ON',
    });

    await newSaleData.save();

    return res.json({ status: true, data: newSaleData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports.GetSalehome = async (req, res) => {
  try {
    const datasale = await CreateSaleHome.find({}).exec();
    return res.status(200).send({ data: datasale });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

module.exports.GetSaleHomeID = async (req, res) => {
  try {
    const id = req.params.id;
    const datasale = await CreateSaleHome.findOne({ _id: id }).exec();
    return res.json({ status: true, data: datasale });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

module.exports.UpdateSaleHome = async (req, res) => {
  try {
    // code
    const id = req.params.id;
    const updated = await CreateSaleHome.findOneAndUpdate(
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

module.exports.uploadImageArr = async (req, res) => {
  try {
    if (req.files && req.files.length > 0) {
      const filenames = req.files.map((file) => file.filename);
      return res.status(200).json({
        status: true,
        message: 'อัพโหลดรูปภาพสำเร็จ',
        data: { selectedImages: filenames },
      });
    } else {
      return res.status(400).json({
        status: false,
        message: 'ไม่พบรูปภาพที่อัพโหลด',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ',
    });
  }
};
