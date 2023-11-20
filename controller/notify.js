const CreateNotify = require('../Model/create_notify');
const CreateUser = require('../Model/create_user');
const moment = require('moment');
const db_connectTB = require('../config/connectTable');
const admin = require('firebase-admin');

const serviceAccount = require('../notimessage-9bfc3-firebase-adminsdk-zwgec-91bc7bcfef.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

module.exports.CreateNotify = async (req, res) => {
  try {
    let body = req.body;
    let Datesave = new Date();
    let datetimeNoti = new Date(body.datetime_noti);
    let dataNoti = new CreateNotify({
      contract_no: body.contract_no,
      title_noti: body.title_noti,
      body_noti: body.body_noti,
      id_cardno: body.id_cardno,
      datetime_noti: datetimeNoti,
      date_save: Datesave,
      status_read: 'N',
      status_noti: 'N',
      status_firebase: 'N',
    });
    await dataNoti.save();
    return res.json({ status: true, data: dataNoti });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message });
  }
};

module.exports.GetNotifyAll = async (req, res) => {
  try {
    const getnoti = await CreateNotify.find({}).exec();

    const getnotimap = [];
    for (const item of getnoti) {
      let dataget = item.datetime_noti;
      let currentDateTimeStamp = parseInt(moment().format('X')) + 25200;
      let notiDateTimeStamp = parseInt(moment(dataget).format('X'));
      let resultNoti = 'N';
      if (notiDateTimeStamp <= currentDateTimeStamp) {
        resultNoti = 'Y';
        // Update status_noti in the database
        await CreateNotify.updateOne(
          { _id: item._id },
          { $set: { status_noti: resultNoti } }
        );
      }

      getnotimap.push({
        _id: item._id,
        contract_no: item.contract_no,
        title_noti: item.title_noti,
        body_noti: item.body_noti,
        datetime_noti: item.datetime_noti,
        date_save: item.date_save,
        status_read: item.status_read,
        status_noti: resultNoti,
        status_firebase: item.status_firebase,
        id_cardno: item.id_cardno,
      });
    }

    const filteredData = getnotimap.filter(
      (item) => item.status_noti === 'Y' && item.status_firebase === 'N'
    );
    if (filteredData.length > 0) {
      const idCards = filteredData.map((item) => item.id_cardno);
      const usersWithMatchingIdCard = await CreateUser.find({
        id_card: { $in: idCards },
      }).exec();

      const messages = usersWithMatchingIdCard.map((user) => ({
        notification: {
          title: filteredData[0].title_noti,
          body: filteredData[0].body_noti,
        },
        token: user.device,
      }));

      const responses = [];

      for (const [index, message] of messages.entries()) {
        try {
          const response = await admin.messaging().send(message);
          console.log(
            response,
            `ส่งข้อความสำเร็จไปยัง ${usersWithMatchingIdCard[index].id_card}`
          );
          responses.push(response);
        } catch (error) {
          console.log(`ข้อผิดพลาดในการส่งข้อมูล: ${error}`);
          responses.push(null);
        }
      }

      const successfulResponses = responses.filter(
        (response) => response !== null
      );
      const successfulNotiIds = successfulResponses.map(
        (_, index) => filteredData[index]._id
      );

      if (successfulResponses.length > 0) {
        try {
          await CreateNotify.updateMany(
            { _id: { $in: successfulNotiIds } },
            { $set: { status_firebase: 'Y' } }
          );
        } catch (error) {
          console.error('ข้อผิดพลาดในการอัพเดตฐานข้อมูล:', error);
          return res
            .status(500)
            .json({ status: false, message: 'ข้อผิดพลาดในการอัพเดตฐานข้อมูล' });
        }
      }

      return res.json({ status: true, data: getnotimap, filteredData });
    } else {
      return res.json({ status: true, data: getnotimap, filteredData });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

module.exports.GetNotifyByID = async (req, res) => {
  try {
    let id_card = req.user.id_card;
    const db_tcustomer = db_connectTB.getTcustomers();
    const dataUser = await db_tcustomer.find({ PersonalID: id_card }).toArray();

    if (!dataUser) {
      return res.status(404).json({ status: false, message: 'ไม่พบผู้ใช้' });
    }

    const customerIDs = dataUser.map((user) => user.CustomerID);
    const getdata_id = await CreateNotify.find({
      contract_no: { $in: customerIDs },
    }).exec();
    return res.json({ status: true, data: getdata_id });
  } catch (error) {
    console.log(err);
    res.status(500).send('Server Error');
  }
};

module.exports.UpdateAllNoti = async (req, res) => {
  try {
    let id_card = req.user.id_card;
    const db_tcustomer = db_connectTB.getTcustomers();
    const dataUser = await db_tcustomer.find({ PersonalID: id_card }).toArray();

    if (!dataUser || dataUser.length === 0) {
      return res.status(404).json({ status: false, message: 'ไม่พบผู้ใช้' });
    }

    const customerIDs = dataUser.map((user) => user.CustomerID);
    const newStatus = req.body.status_read;

    // ตรวจสอบว่า customerIDs มีข้อมูลอยู่
    if (!customerIDs || customerIDs.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: 'ไม่พบรายการที่ต้องอัปเดต' });
    }

    const updateResult = await CreateNotify.updateMany(
      { contract_no: { $in: customerIDs } },
      { $set: { status_read: newStatus } }
    );

    if (updateResult.modifiedCount > 0) {
      // มีรายการถูกอัปเดต
      res.json({ status: true, message: 'อัปเดตสถานะเรียบร้อย' });
    } else {
      // ไม่พบรายการที่ต้องอัปเดต
      res.json({ status: false, message: 'ไม่พบรายการที่ต้องอัปเดต' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

// module.LogNotifyID = async (req, res) => {
//   try {
//     let id_card = req.user.id_card;
//     const db_tcustomer = db_connectTB.getTcustomers();
//     const dataUser = await db_tcustomer.find({ PersonalID: id_card }).toArray();

//     if (!dataUser) {
//       return res.status(404).json({ status: false, message: 'ไม่พบผู้ใช้' });
//     }
//     const customerIDs = dataUser.map((user) => user.CustomerID);
//     const getdata_id = await CreateNotify.find({
//       contract_no: { $in: customerIDs },
//     }).exec();
//     console.log(getdata_id, 'fdfdfdfd');
//   } catch (error) {}
// };
