const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsConfig');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler  = require('./middleware/errorHandler');
const securityMiddleware = require('./middleware/security');
const path = require('path');

// Security middleware
securityMiddleware(app);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes requirements
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');


// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses',courseRoutes);


// Error handling middleware
app.use(errorHandler);
module.exports = app;