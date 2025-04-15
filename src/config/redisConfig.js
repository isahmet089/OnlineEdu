const Redis = require('ioredis');
require('dotenv').config();

const redisClient = new Redis({
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    // password: process.env.REDIS_PASSWORD,
});
    
redisClient.on('connect', () => console.log('Redise başarıyla bağlandı!'));
redisClient.on('error', (err) => console.error('Redise bağlantı hatası:', err));

module.exports = redisClient;