const express = require('express');
const route = express.Router();
const Member_controller = require('../controller/index');
const Promotion_controller = require('../controller/promotion');
const { auth } = require('../Middleware/auth');
const upload = require('../Middleware/multerimg');

route.post('/register', Member_controller.register);
route.post('/login', Member_controller.login);
route.get('/getprofile', auth, Member_controller.getprofile);
route.put('/updateprofile/:id', Member_controller.updateProfile);
route.put('/getpin/:id', Member_controller.getpin);
route.get('/getacc_user', auth, Member_controller.getAccountUser);
route.get('/gethistory_user', auth, Member_controller.getHistoryUser);
route.get('/getid_card', Member_controller.getIdCardUser);
route.get('/getphone', Member_controller.getPhoneUser);
route.get('/getdate_server', Member_controller.getDateServer);
route.post('/create_requser', Member_controller.CreateReqUser);
route.get('/get_requser', Member_controller.GetReqUser);
route.get('/getnotify', auth, Member_controller.GetNotify);
route.get('/getdatauserall', Member_controller.getDataUser);
// ============================Promotion========================
route.post('/promotion', Promotion_controller.CreatePromotion);
route.get('/promotion', Promotion_controller.GetPromotion);
route.get('/promotion/:id', Promotion_controller.GetPromotionID);
route.put('/promotion/:id', Promotion_controller.UpdatePromotion);
route.delete('/promotion/:id', Promotion_controller.DeletePromotion);
// ============================Promotion========================

route.post(
  '/upload/image',
  upload.single('image'),
  Promotion_controller.uploadImage
);

module.exports = route;
