const Redis = require('ioredis');
require('dotenv').config();

const redisClient = new Redis({
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    // password: process.env.REDIS_PASSWORD,
});
    
redisClient.on('connect', () => console.log('Connected to Redis successfully!'));
redisClient.on('error', (err) => console.error('Redis connection error:', err));

module.exports = redisClient;