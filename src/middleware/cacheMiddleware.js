const redis = require('../config/redisConfig'); // Redis client

// Genel cache middleware
const cacheData = (keyGenerator, ttl = 300) => async (req, res, next) => {
  const key = keyGenerator(req);  // Key'i belirle
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`✅ [Redis] Cache hit for ${key}`);
      return res.json(JSON.parse(cached));
    }

    // Orijinal JSON fonksiyonunu override et ve cache'e yaz
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      console.log(`🔴 [Redis] Writing cache for ${key}`);
      redis.set(key, JSON.stringify(data), 'EX', ttl);
      return originalJson(data);
    };

    console.log(`❌ [Redis] Cache miss for ${key}`);
    next(); // Veriyi backend’den almayı başlat
  } catch (err) {
    console.error(`Redis caching error for ${key}:`, err);
    next(); // Redis hatası olursa bile devam et
  }
};

module.exports = cacheData;
