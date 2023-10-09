const connectDB = require('./connect');

module.exports = {
  getTcustomers: () => {
    return connectDB.getCollection('tcustomers');
  },
  getTpayment: () => {
    return connectDB.getCollection('tpayments');
  },
  getNotify: () => {
    return connectDB.getCollection('tnotifies');
  },
};
