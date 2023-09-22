const express = require('express');
const app = express();
const { readdirSync } = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./config/connect');
const dotenv = require('dotenv').config();
connectDB();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
//Route
readdirSync('./routes').map((e) => {
  return app.use(require('./routes/' + e));
});

const port = 5500;
app.listen(port, () => {
  console.log('Api run on Port', port);
});
