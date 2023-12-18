const express = require('express');
const route = express.Router();
const Member_controller = require('../controller/index');
const Promotion_controller = require('../controller/promotion');
const { auth } = require('../Middleware/auth');
const upload = require('../Middleware/multerimg');
const Notify_controller = require('../controller/notify');
const Salehome_controller = require('../controller/salehome.js');
const uploadMiddleware = require('../Middleware/multerimgall.js');

route.post('/register', Member_controller.register);
route.post('/login', Member_controller.login);
route.put('/updatestar/:id', Member_controller.updateStartUser);
route.put('/logout', auth, Member_controller.logoutDevice);
route.get('/getprofile', auth, Member_controller.getprofile);
route.put('/updateprofile/:id', Member_controller.updateProfile);
route.put('/getpin/:id', Member_controller.getpin);
route.get('/getacc_user', auth, Member_controller.getAccountUser);
route.get('/gethistory_user', auth, Member_controller.getHistoryUser);
route.get('/getid_card', Member_controller.getIdCardUser);
route.get('/getphone', Member_controller.getPhoneUser);
route.get('/getdate_server', Member_controller.getDateServer);

//===============================Req-User=====================//
route.post('/create_requser', Member_controller.CreateReqUser);
route.get('/get_requser', Member_controller.GetReqUser);
route.get('/get_requser/:id', Member_controller.GetReqUserID);
route.put('/update_requser/:id', Member_controller.UpdateReqUserID);
//===============================Req-User=====================//
route.get('/getnotify', auth, Member_controller.GetNotify);
route.get('/getdatauserall', Member_controller.getDataUser);

// ============================Promotion========================
route.post('/promotion', Promotion_controller.CreatePromotion);
route.get('/promotion', Promotion_controller.GetPromotion);
route.get('/promotion/:id', Promotion_controller.GetPromotionID);
route.put('/promotion/:id', Promotion_controller.UpdatePromotion);
route.delete('/promotion/:id', Promotion_controller.DeletePromotion);
// ============================Promotion========================

// ============================Notify========================
route.post('/createnotify', Notify_controller.CreateNotify);
route.get('/getnotifyall', Notify_controller.GetNotifyAll);
route.get('/getnotify_id', auth, Notify_controller.GetNotifyByID);
route.put('/updatenotify', auth, Notify_controller.UpdateAllNoti);
// ============================Notify========================

//==========================SaleHome================================
route.post('/createsalehome', Salehome_controller.CreateSalehome);
route.get('/getsalehome', Salehome_controller.GetSalehome);
route.get('/getsalehome/:id', Salehome_controller.GetSaleHomeID);
route.put('/updatesalehome/:id', Salehome_controller.UpdateSaleHome);
//==========================SaleHome================================

route.post('/request-otp', Member_controller.requestOTP);
route.post('/verify-otp', Member_controller.verifyOTP);
route.get('/getphome', Member_controller.getPhoneOTP);

route.post(
  '/upload/image',
  upload.single('image'),
  Promotion_controller.uploadImage
);

route.post(
  '/upload/img_all',
  uploadMiddleware.array('image', 20),
  Salehome_controller.uploadImageArr
);

module.exports = route;
