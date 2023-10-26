const CreateNotify = require('../Model/create_notify');
const moment = require('moment');
const db_connectTB = require('../config/connectTable');

module.exports.CreateNotify = async (req, res) => {
  try {
    let body = req.body;
    let Datesave = new Date();
    let datetimeNoti = new Date(body.datetime_noti);
    let dataNoti = new CreateNotify({
      contract_no: body.contract_no,
      title_noti: body.title_noti,
      body_noti: body.body_noti,
      datetime_noti: datetimeNoti,
      date_save: Datesave,
      status_read: 'N',
      status_noti: 'N',
    });
    await dataNoti.save();
    return res.json({ status: true, data: dataNoti });
  } catch (error) {
    console.log(error);
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
        // อัพเดท status_noti ในฐานข้อมูล
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
        // currentDateTimeStamp: currentDateTimeStamp,
        // notiDateTimeStamp: notiDateTimeStamp,
      });
    }
    // let getnotimap = getnoti.map( (item) => {
    //   let dataget = item.datetime_noti;
    //   let currentDateTimeStamp = parseInt(moment().format('X')) + 25200;
    //   let notiDateTimeStamp = parseInt(moment(dataget).format('X'));
    //   let resultNoti = 'N';
    //   if (notiDateTimeStamp <= currentDateTimeStamp) {
    //     resultNoti = 'Y';
    //     await CreateNotify.updateOne(
    //       { _id: item._id },
    //       { $set: { status_noti: resultNoti } }
    //     );
    //   }
    //   return {
    //     _id: item._id,
    //     contract_no: item.contract_no,
    //     title_noti: item.title_noti,
    //     body_noti: item.body_noti,
    //     datetime_noti: item.datetime_noti,
    //     date_save: item.date_save,
    //     status_read: item.status_read,
    //     status_noti: resultNoti,
    //     // currentDateTimeStamp: currentDateTimeStamp,
    //     // notiDateTimeStamp: notiDateTimeStamp,
    //   };
    // });
    return res.json({ status: true, data: getnotimap });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};

// module.exports.GetNotifyAll = async (req, res) => {
//   try {
//     const currentDate = moment().utc(); // วันที่และเวลาปัจจุบัน
//     // แปลงรูปแบบ datetime_noti เพื่อให้สอดคล้องกับรูปแบบ currentDate
//     const notificationsToBeUpdated = await CreateNotify.find({
//       datetime_noti: { $lte: currentDate.format('YYYY-MM-DDTHH:mm') }, // ใช้รูปแบบ currentDate
//       status_noti: 'N', // เพื่อหลีกเลี่ยงการอัปเดตแจ้งเตือนซ้ำ
//     }).exec();

//     // อัปเดต status_noti เป็น 'Y' สำหรับแจ้งเตือนที่ตรงเงื่อนไข
//     const updatePromises = notificationsToBeUpdated.map(
//       async (notification) => {
//         notification.status_noti = 'Y';
//         return notification.save();
//       }
//     );

//     // รอสำหรับการอัปเดตทุกแจ้งเตือน
//     await Promise.all(updatePromises);

//     // ดึงข้อมูลทั้งหมด
//     const allNotifications = await CreateNotify.find({}).exec();

//     return res.json({ status: true, data: allNotifications });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send('Server Error');
//   }
// };

module.exports.GetNotifyByID = async (req, res) => {
  try {
    let id_card = req.user.id_card;
    const db_tcustomer = db_connectTB.getTcustomers();
    const dataUser = await db_tcustomer.find({ PersonalID: id_card }).toArray();
    // console.log(dataUser.CustomerID, 'fdfdffdfdfdfdf');

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

// module.exports.UpdateNotifyID = async (req, res) => {
//   try {
//     // code
//     const id = req.params.id;
//     const updated = await CreateNotify.findOneAndUpdate({ _id: id }, req.body, {
//       new: true,
//     }).exec();
//     return res.json({ status: true, data: updated });
//   } catch (err) {
//     // error
//     console.log(err);
//     res.status(500).send('Server Error');
//   }
// };

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
