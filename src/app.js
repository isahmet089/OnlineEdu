const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsConfig');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler  = require('./middleware/errorHandler');
const securityMiddleware = require('./middleware/security');

// Security middleware
securityMiddleware(app);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());


// Routes requirements
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);


// Error handling middleware
app.use(errorHandler);
module.exports = app;