const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsConfig');
const morgan = require('morgan');

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Routes requirements
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;