const jwt = require('jsonwebtoken');
const CreateUser = require('../Model/create_user');
const CreateReqUser = require('../Model/create_requser');
const CryptoJS = require('crypto-js');
const dayjs = require('dayjs');
const db_connectTB = require('../config/connectTable');
const { validationResult } = require('express-validator');
const thaibulksmsApi = require('thaibulksms-api');
const http = require('http');

const options = {
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
};
const otp = thaibulksmsApi.otp(options);

//---------------requser-----------------------------
module.exports.CreateReqUser = async (req, res) => {
  try {
    let body = req.body;
    let dataReq = new CreateReqUser({
      name: body.name,
      surname: body.surname,
      id_card: body.id_card,
      no_contract: body.no_contract,
      list_req: body.list_req,
      receive_no: body.receive_no,
      sent_emailuser: body.sent_emailuser,
      sent_addressuser: body.sent_addressuser,
      provin: body.provin,
      district: body.district,
      subdistrict: body.subdistrict,
      postcode: body.postcode,
      other: body.other,
      status_req: 'Process',
      remark: body.remark,
    });
    await dataReq.save();

    const updateAdd = {
      sent_addressuser: dataReq.sent_addressuser,
      provin: dataReq.provin,
      district: dataReq.district,
      subdistrict: dataReq.subdistrict,
      postcode: dataReq.postcode,
    };
    await CreateUser.findOneAndUpdate({ id_card: dataReq.id_card }, updateAdd);
    return res.json({
      status: 200,
      dataReq,
      message: 'อัปเดตข้อมูลที่อยู่เรียบร้อยแล้ว',
    });
    // return res
    //   .status(200)
    //   .send({ dataReq, message: 'อัปเดตข้อมูลที่อยู่เรียบร้อยแล้ว' });
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

module.exports.GetReqUserID = async (req, res) => {
  try {
    const id = req.params.id;
    const getreqID = await CreateReqUser.findOne({ _id: id }).exec();
    return res.json({ status: 200, data: getreqID });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

module.exports.UpdateReqUserID = async (req, res) => {
  try {
    // code
    const id = req.params.id;
    // เพิ่มวันที่และเวลาปัจจุบันใน req.body
    req.body.date_sent = new Date();
    const updated = await CreateReqUser.findOneAndUpdate(
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
//---------------requser-----------------------------

// module.exports.SaveaddressUser = async (req, res) => {
//   try {
//     let id_card = req.user.id_card;
//     let dataProfile = await CreateReqUser.findOne({ id_card: id_card });

//     if (dataProfile.sent_addressuser !== null) {
//       // ถ้าพบข้อมูลและ sent_addressuser ไม่มีค่าเป็น null หรือว่าง
//       // ให้ทำการค้นหาและอัปเดตข้อมูลใน table user โดยใช้ id_card เป็นเงื่อนไข
//       const updateResult = await CreateUser.findOneAndUpdate(
//         { id_card: id_card },
//         {
//           $set: {
//             sent_addressuser: dataProfile.sent_addressuser,
//             provin: dataProfile.provin,
//             district: dataProfile.district,
//             subdistrict: dataProfile.subdistrict,
//           },
//         }
//       );

//       if (updateResult) {
//         // ถ้ามีการอัปเดตเรียบร้อย
//         return res
//           .status(200)
//           .send({ updateResult, message: 'อัปเดตข้อมูลที่อยู่เรียบร้อยแล้ว' });
//       } else {
//         // ถ้าไม่มีการอัปเดต (ไม่พบข้อมูลที่ต้องการอัปเดต)
//         return res.send('ไม่พบข้อมูลที่ต้องการอัปเดต');
//       }
//     } else {
//       return res.send(
//         'ไม่พบข้อมูลผู้ใช้หรือ sent_addressuser เป็น null หรือว่าง'
//       );
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send('Server Error');
//   }
// };

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

//==========OTP Data========================
module.exports.requestOTP = async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  var body = `<?xml version="1.0" encoding="TIS-620"?>
  <message>
      <sms type="mt">
          <service-id>2325301101
          </service-id>
          <destination>
              <address>
                  <number type="international">${phoneNumber}</number>
              </address>
          </destination>
          <source>
              <address>
                  <number type="abbreviated">40002397
                  </number>
                  <originate type="international">66942135643
                  </originate>
                  <sender>ARMA</sender>
              </address>
          </source>
          <ud type="text" encoding="default">เลขรหัส OTP ของคุณคือ:</ud>
          <scts>2009-05-21T11:05:29+07:00</scts>
          <dro>true</dro>
      </sms>
  </message>`;
  const contentLength = Buffer.byteLength(body); // คำนวณความยาวของข้อมูล XML

  var postRequest = {
    host: '119.46.177.99',
    path: '/',
    port: 55000,
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      'Content-Length': contentLength, // ใช้ค่า contentLength ที่คำนวณ
      Connection: 'Keep-Alive',
      Authorization: 'Basic MjMyNTMwMTEwMTpOY01AQjIxN0wlRXh1Y0YK',
    },
  };

  const request = http.request(postRequest, function (response) {
    console.log(response.statusCode);
    let buffer = '';
    response.on('data', function (data) {
      buffer += data;
    });
    response.on('end', function () {
      console.log(buffer);
    });
  });

  request.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  request.write(body);
  request.end();
};

module.exports.verifyOTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let token = req.body.token;
    let otpCode = req.body.otp_code;
    const response = await otp.verify(token, otpCode);
    res.json(response.data);
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};
//==========OTP Data========================

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
