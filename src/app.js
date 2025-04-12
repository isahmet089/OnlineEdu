const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsConfig');
const morgan = require('morgan');

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));


module.exports = app;