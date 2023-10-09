const jwt = require('jsonwebtoken');
const CreateUser = require('../Model/create_user');
const CreateReqUser = require('../Model/create_requser');
const CryptoJS = require('crypto-js');
const dayjs = require('dayjs');
const db_connectTB = require('../config/connectTable');

module.exports.CreateReqUser = async (req, res) => {
  try {
    const datapostUser = await CreateReqUser(req.body).save();
    res.send(datapostUser);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

module.exports.GetReqUser = async (req, res) => {
  try {
    const dataUserReq = await CreateReqUser.find({}).exec();
    res.send(dataUserReq);
  } catch (error) {
    console.log(err);
    res.status(500).send('Server Error');
  }
};

module.exports.register = async (req, res) => {
  try {
    //checkuUser มีหรือยัง
    const { gent_name, name, surname, id_card, email, phone, pin } = req.body;
    let user = await CreateUser.findOne({ id_card });
    if (user) {
      return res.send('User Already Exists!!!').status(400);
    }
    // const salt = await bcrypt.genSalt(10);
    user = new CreateUser({
      gent_name,
      name,
      surname,
      id_card,
      email,
      phone,
      pin,
      type_customer: 'N',
    });
    // user.id_card = await bcrypt.hash(id_card, salt);
    await user.save();
    console.log(user.id_card, 'jgjjgjg');
    //get api ว่า Fill ตรงกันไหม ถ้าตรง
    const db_tcustomer = db_connectTB.getTcustomers();
    let getUserdata = await db_tcustomer.findOne({ PersonalID: id_card });
    console.log(getUserdata, 'tokota');

    let token = jwt.sign(
      {
        user: {
          _id: user.id,
          id_card: user.id_card,
        },
      },
      process.env.SecretKey,
      {
        expiresIn: '1Y',
      }
    );
    if (getUserdata) {
      // ตรวจสอบว่าพบข้อมูลที่ตรงกันหรือไม่
      user.type_customer = 'Y';
      await user.save();

      var newtoken = CryptoJS.AES.encrypt(
        token, //jwt
        process.env.SecretKey // key env
      ).toString();
      return res.status(200).send({ user, token: newtoken });
    } else {
      // ถ้าไม่พบข้อมูลที่ตรงกัน
      var newtoken = CryptoJS.AES.encrypt(
        token, //jwt
        process.env.SecretKey // key env
      ).toString();
      return res.status(200).send({ user, token: newtoken });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Eror');
  }
};

module.exports.getDataUser = async (req, res) => {
  try {
    const getdatauser = await CreateUser.find({}).exec();
    res.send(getdatauser);
  } catch (error) {
    console.log(err);
    res.status(500).send('Server Error');
  }
};

module.exports.login = async (req, res) => {
  const { id_card } = req.body;
  let user = await CreateUser.findOneAndUpdate({ id_card }, { new: true });
  if (user) {
    let payload = {
      user: {
        _id: user.id,
        gent_name: user.gent_name,
        name: user.name,
        surname: user.surname,
        id_card: user.id_card,
        email: user.email,
        phone: user.phone,
        pin: user.pin,
        type_customer: user.type_customer,
      },
    };

    //generate token
    jwt.sign(
      payload,
      process.env.SecretKey,
      { expiresIn: '1y' },
      (err, token) => {
        if (err) throw err;
        var newtoken = CryptoJS.AES.encrypt(
          token, //jwt
          process.env.SecretKey // key env
        ).toString();
        return res.status(200).send({ user, token: newtoken });
      }
    );
  } else {
    return res.status(401).send({ message: 'User Invalid!' });
  }
};

module.exports.getprofile = async (req, res) => {
  try {
    // console.log('decodeqarttt', req.user);
    let id_card = req.user.id_card;
    // console.log(id_card, 'tokota');
    let dataProfile = await CreateUser.findOne({ id_card: id_card });
    // console.log(dataProfile, 'aaaa');
    return res.status(200).send({ data: dataProfile });
    // return res.json({ status: 200, data: dataProfile });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Filed');
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await CreateUser.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    }).exec();
    res.send(updated);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Filed');
  }
};

module.exports.getIdCardUser = async (req, res) => {
  try {
    let id_card = req.query.id_card;
    console.log('aaaacc', id_card);
    const getdata = await CreateUser.findOne({ id_card: id_card });
    if (getdata) {
      return res
        .status(200)
        .send({ status: true, message: 'มีเลขบัตรประชาชนนี้ในระบบแล้ว' });
    }
    return res
      .status(200)
      .send({ status: false, message: 'ไม่พบเลขบัตรประชาชนนี้ในระบบ' });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: 'Server Filed' });
  }
};

module.exports.getPhoneUser = async (req, res) => {
  try {
    let phone = req.query.phone;
    console.log('aaaacc', phone);
    const getdataphone = await CreateUser.findOne({ phone: phone });
    if (getdataphone) {
      return res
        .status(200)
        .send({ status: true, message: 'มีเบอร์มือถือนี้ในระบบแล้ว' });
    }
    return res
      .status(401)
      .send({ status: false, message: 'ไม่พบเบอร์มือถือนี้ในระบบ' });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: 'sever filed' });
  }
};

module.exports.getAccountUser = async (req, res) => {
  try {
    let id_card = req.user.id_card;
    const db_tcustomer = db_connectTB.getTcustomers();
    const dataUser = await db_tcustomer.find({ PersonalID: id_card }).toArray();
    return res.status(200).send({ data: dataUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Server Filed' });
  }
};

module.exports.getHistoryUser = async (req, res) => {
  try {
    let id_card = req.user.id_card;
    // console.log(id_card, 'oopo');
    const db_tcustomer = db_connectTB.getTcustomers();
    const dataUsers = await db_tcustomer
      .find({ PersonalID: id_card })
      .toArray();
    if (!dataUsers || dataUsers.length === 0) {
      return res.status(404).send('Customers not found');
    }

    // ใช้ map เพื่อดึงเฉพาะ CustomerID ออกมา
    const customerIDs = dataUsers.map((user) => user.CustomerID);
    // console.log(customerIDs, 'Customer IDs');

    const db_tpayment = db_connectTB.getTpayment();
    const dataPayment = await db_tpayment
      .find({ CustomerID: { $in: customerIDs } }) // ใช้ $in ในการค้นหา
      .toArray();

    // แปลงรูปแบบ PayDate ก่อนส่งค่า dataPayment
    const formattedDataPayment = dataPayment.map((payment) => {
      if (payment.PayDate instanceof Date) {
        const year = payment.PayDate.getFullYear();
        const month = String(payment.PayDate.getMonth() + 1).padStart(2, '0');
        const day = String(payment.PayDate.getDate()).padStart(2, '0');
        return {
          ...payment,
          PayDate: `${year}${month}${day}`,
        };
      } else {
        return payment;
      }
    });

    // console.log(dataPayment, 'okotdt');
    return res.status(200).send({ data: formattedDataPayment });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Failed');
  }
};

module.exports.getpin = async (req, res) => {
  try {
    const id = req.params.id; // สมมติว่ารับ id มาจาก parameter

    // ค้นหาข้อมูล CreateUser ด้วย _id ที่ระบุ
    const dataProfile = await CreateUser.findOne({ _id: id });

    if (!dataProfile) {
      return res.status(404).send('User not found');
    }
    const userEnteredPin = req.body.pin; // สมมติว่ารับ pin ที่ผู้ใช้กรอกเข้ามา
    // ส่งข้อมูล pin กลับไปให้ client
    if (userEnteredPin !== dataProfile.pin) {
      return res.status(401).send('pin ไม่ถูกต้อง'); // กรณี pin ไม่ตรงกับในฐานข้อมูล
    }

    // ส่งข้อมูล pin กลับไปให้ client หลังที่ตรวจสอบ pin ถูกต้องแล้ว
    return res
      .status(200)
      .send({ pin: dataProfile.pin, message: 'pin ถูกต้อง' });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Failed');
  }
};

module.exports.getDateServer = async (req, res) => {
  try {
    // สร้างวัตถุ day.js สำหรับวันที่และเวลาปัจจุบัน
    const currentDate = dayjs();

    // รูปแบบวันที่และเวลาตามที่คุณต้องการ
    const formattedDate = currentDate.format('YYYY-MM-DD HH:mm:ss');

    // ส่งข้อมูลกลับไปยัง client
    return res.status(200).send({ data: formattedDate });
    // res.json({ currentDate: formattedDate });
  } catch (error) {
    // ในกรณีที่เกิดข้อผิดพลาด
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงวันที่และเวลา' });
  }
};

module.exports.GetNotify = async (req, res) => {
  try {
    let id_card = req.user.id_card;
    const db_notify = db_connectTB.getNotify();
    const getnotify = await db_notify.find({ PersonalID: id_card }).toArray();
    return res.status(200).send({ data: getnotify });
  } catch (error) {
    console.log(err);
    res.status(500).send('Server Error');
  }
};
