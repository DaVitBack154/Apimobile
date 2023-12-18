const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img_all/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        '.' +
        file.originalname.split('.')[file.originalname.split('.').length - 1]
    );
  },
});
const uploadAll = multer({ storage: storage });

module.exports = uploadAll;
