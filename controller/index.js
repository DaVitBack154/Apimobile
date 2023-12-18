const jwt = require('jsonwebtoken');
const CreateUser = require('../Model/create_user');
const CreateReqUser = require('../Model/create_requser');
const CryptoJS = require('crypto-js');
const dayjs = require('dayjs');
const db_connectTB = require('../config/connectTable');
const CreateOtp = require('../Model/create_otp');
const axios = require('axios');

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
      message: 'อัปเดตmessageที่อยู่เรียบร้อยแล้ว',
    });
    // return res
    //   .status(200)
    //   .send({ dataReq, message: 'อัปเดตmessageที่อยู่เรียบร้อยแล้ว' });
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

//===========================Authen User=======================//
module.exports.register = async (req, res) => {
  try {
    //checkuUser มีหรือยัง
    const {
      gent_name,
      name,
      surname,
      id_card,
      email,
      phone,
      pin,
      device,
      yomrub1,
      yomrub2,
      yomrub3,
    } = req.body;
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
      device,
      yomrub1,
      yomrub2,
      yomrub3,
      status_star: 'N',
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
          // device: user.device,
        },
      },
      process.env.SecretKey
      // {
      //   expiresIn: '1Y',
      // }
    );
    if (getUserdata) {
      // ตรวจสอบว่าพบmessageที่ตรงกันหรือไม่
      user.type_customer = 'Y';
      await user.save();

      var newtoken = CryptoJS.AES.encrypt(
        token, //jwt
        process.env.SecretKey // key env
      ).toString();
      return res.status(200).send({ user, token: newtoken });
    } else {
      // ถ้าไม่พบmessageที่ตรงกัน
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

module.exports.login = async (req, res) => {
  const { id_card, device } = req.body;
  console.log(device);
  let user = await CreateUser.findOneAndUpdate(
    { id_card },
    { $set: { device: device } },
    { new: true }
  );
  if (user) {
    let payload = {
      user: {
        _id: user.id,
        gent_name: user.gent_name,
        name: user.name,
        surname: user.surname,
        id_card: user.id_card,
        device: device,
        device: user.device,
        email: user.email,
        phone: user.phone,
        pin: user.pin,
        type_customer: user.type_customer,
        status_star: user.type_customer,
      },
    };

    //generate token
    jwt.sign(
      payload,
      process.env.SecretKey,
      null,
      // { expiresIn: '1y' },
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

module.exports.updateStartUser = async (req, res) => {
  try {
    const id = req.params.id;
    const newStatus = req.body.status_star;
    const updatedstar = await CreateUser.findOneAndUpdate(
      { _id: id },
      req.body,
      { status_star: newStatus },
      {
        new: true,
      }
    ).exec();
    console.log('Updated document:', updatedstar);
    res.send(updatedstar);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Filed');
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

module.exports.logoutDevice = async (req, res) => {
  try {
    const id_card = req.user.id_card;
    // อัปเดตค่า device เป็นค่าว่าง
    const updatedUser = await CreateUser.findOneAndUpdate(
      { id_card: id_card },
      { $set: { device: '' } },
      { new: true } // เพื่อให้ค่าที่ถูกอัปเดตถูกส่งกลับ
    );

    if (updatedUser) {
      res.status(200).json({ data: updatedUser });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

//===========================Authen User=======================//

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

    // ค้นหาmessage CreateUser ด้วย _id ที่ระบุ
    const dataProfile = await CreateUser.findOne({ _id: id });

    if (!dataProfile) {
      return res.status(404).send('User not found');
    }
    const userEnteredPin = req.body.pin; // สมมติว่ารับ pin ที่ผู้ใช้กรอกเข้ามา
    // ส่งmessage pin กลับไปให้ client
    if (userEnteredPin !== dataProfile.pin) {
      return res.status(401).send('pin ไม่ถูกต้อง'); // กรณี pin ไม่ตรงกับในฐานmessage
    }

    // ส่งmessage pin กลับไปให้ client หลังที่ตรวจสอบ pin ถูกต้องแล้ว
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

    // ส่งmessageกลับไปยัง client
    return res.status(200).send({ data: formattedDate });
    // res.json({ currentDate: formattedDate });
  } catch (error) {
    // ในกรณีที่เกิดmessage
    console.error(error);
    res.status(500).json({ error: 'เกิดmessageในการดึงวันที่และเวลา' });
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

//==========OTP Data========================

module.exports.requestOTP = async (req, res) => {
  try {
    const userPhoneNumber = req.body.phone;
    // const userPhoneNumber = '66960841988';
    const randomCode = generateRandomCode();

    const xmlData = generateXmlData(userPhoneNumber, randomCode);

    try {
      // ทำการ POST XML ไปยัง URL และรับ response
      const apiResponse = await callApiAndSaveData(
        xmlData,
        userPhoneNumber,
        randomCode
      );

      // ดำเนินการต่อไปตามต้องการ
      console.log(apiResponse, 'รายละเอียดข้อมูลจาก API');

      return res.json({ status: true, message: apiResponse });
    } catch (error) {
      // จัดการmessage
      console.error(error, 'messageจาก API');

      return res.json({ status: false, message: error });
    }
  } catch (error) {
    // จัดการmessage
    const errorMessage = error.response
      ? error.response.data
      : 'messageที่ไม่รู้จัก';
    console.error(errorMessage, 'messageจาก API');

    return res.json({ status: false, message: errorMessage });
  }
};

const generateRandomCode = () => {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .padStart(6, '0');
};

const generateXmlData = (userPhoneNumber, randomCode) => {
  return `<?xml version="1.0" encoding="TIS-620"?>
    <message>
      <sms type="mt">
         <service-id>2325301101</service-id>
         <destination>
          <address>
            <number type="international">${userPhoneNumber}</number>
          </address>
         </destination>
        <source>
          <address>
            <number type="abbreviated">40002397</number>
            <originate type="international">66942135643</originate>
            <sender>ARMA</sender>
          </address>
        </source>
         <ud type="text" encoding="unicode">&#3619;&#3627;&#3633;&#3626;&#32;&#79;&#84;&#80;&#32;&#3586;&#3629;&#3591;&#3588;&#3640;&#3603;&#3588;&#3639;&#3629;&#32; ${randomCode}</ud>
         <scts>2009-05-21T11:05:29+07:00</scts>
         <dro>true</dro>
       </sms>
    </message>`;
};

const callApiAndSaveData = async (xmlData, userPhoneNumber, randomCode) => {
  try {
    // ทำการ POST XML ไปยัง URL
    const response = await axios.post('http://119.46.177.99:55000/', xmlData, {
      headers: {
        'Content-Type': 'text/xml',
        Authorization: 'Basic MjMyNTMwMTEwMTpOY01AQjIxN0wlRXh1Y0Y=',
      },
    });

    // เอาmessageเข้า database
    const dataOTP = new CreateOtp({
      phone: userPhoneNumber,
      otp: randomCode,
      status: 'Y',
    });
    await dataOTP.save();

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : 'messageที่ไม่รู้จัก';
  }
};

// module.exports.verifyOTP = async (req, res) => {
//   const { otp, phone } = req.body;
//   // ค้นหาข้อมูลล่าสุดที่มี status เป็น 'Y' และ phone เป็นตามที่รับมา
//   let user = await CreateOtp.findOne({ status: 'Y', phone }).sort({
//     createdAt: -1,
//   });
//   // ตรวจสอบว่า user ไม่เป็น null และ otp ตรงกับที่รับมา
//   if (user && user.otp === otp) {
//     return res.json({ status: true, data: user });
//   }

//   res.status(401).json({ status: false, message: 'รหัส OTP ไม่ถูกต้อง' });
// };
const OTP_EXPIRATION_TIME = 2 * 60 * 1000; // 3 นาที

module.exports.verifyOTP = async (req, res) => {
  const { otp, phone } = req.body;

  try {
    // ค้นหาข้อมูลล่าสุดที่มี status เป็น 'Y' และ phone เป็นตามที่รับมา
    let latestUser = await CreateOtp.findOne({ phone }).sort({ createdAt: -1 });

    // ตรวจสอบว่ามีข้อมูลล่าสุดหรือไม่
    if (!latestUser) {
      return res.status(403).json({
        status: false,
        message: 'ไม่พบข้อมูล OTP สำหรับหมายเลขโทรศัพท์นี้',
      });
    }

    // ตรวจสอบว่า otp ตรงกับที่รับมา และ status เป็น 'Y'
    if (latestUser.otp === otp && latestUser.status === 'Y') {
      // ตรวจสอบว่ารหัส OTP หมดอายุหรือไม่
      const currentTime = new Date().getTime();
      const otpTime = new Date(latestUser.createdAt).getTime();

      if (currentTime - otpTime > OTP_EXPIRATION_TIME) {
        // รหัส OTP หมดอายุ
        await CreateOtp.updateMany(
          { phone, status: 'N', _id: { $ne: latestUser._id } },
          { status: 'N' }
        );

        return res
          .status(403)
          .json({ status: false, message: 'รหัส OTP หมดอายุ' });
      }

      // รหัส OTP ถูกต้อง และไม่หมดอายุ
      return res.json({ status: true, data: latestUser });
    } else {
      res.status(403).json({ status: false, message: 'รหัส OTP ไม่ถูกต้อง' });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ OTP' });
  }
};

module.exports.getPhoneOTP = async (req, res) => {
  try {
    const phonereq = await CreateOtp.find({}).exec();
    return res.status(200).send({ data: phonereq });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

//==========OTP Data========================
