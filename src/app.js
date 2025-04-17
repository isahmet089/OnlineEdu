const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsConfig');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const  errorHandler  = require('./middleware/errorHandler');
const securityMiddleware = require('./middleware/security');
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// Security middleware
securityMiddleware(app);

// Routes requirements
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');


// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);
module.exports = app;