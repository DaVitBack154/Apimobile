const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

module.exports.auth = async (req, res, next) => {
  try {
    const token = req.headers['tokenmobile'];
    // console.log(token);
    if (!token) {
      return res.status(401).send('No token');
    }
    // console.log(token, 'tokotkadfdf');
    // Decrypt
    var bytes = CryptoJS.AES.decrypt(token, process.env.SecretKey);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    const decode = jwt.verify(originalText, process.env.SecretKey);
    // console.log('decoded=>', decode);
    req.user = decode.user;
    // console.log(req.user, 'ggggg');
    next();
  } catch (error) {
    console.log(error);
    res.send('Server Filed');
  }
};
