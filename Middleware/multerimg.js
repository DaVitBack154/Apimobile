const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/image/');
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
const upload = multer({ storage: storage });

module.exports = upload;
