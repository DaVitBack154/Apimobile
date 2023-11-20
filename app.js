const express = require('express');
const app = express();
const { readdirSync } = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./config/connect');
require('dotenv').config();

connectDB();
const path = require('path');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(
  cors({
    origin: '*',
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
//Route
readdirSync('./routes').map((e) => {
  return app.use(require('./routes/' + e));
});

const port = 5500;
app.listen(port, () => {
  console.log('Api run on Port', port);
});
