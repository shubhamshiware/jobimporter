import { Redis } from "ioredis";

let redisClient;
let connectionPromise = null;

const connectRedis = async () => {
  console.log("🔗 Connecting to Redis...");

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise((resolve, reject) => {
    try {
      const options = {
        maxRetriesPerRequest: null,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        enableOfflineQueue: false,
      };

      redisClient = new Redis(
        process.env.REDIS_URL || "redis://localhost:6379",
        options
      );

      const timeoutId = setTimeout(() => {
        reject(new Error("Redis connection timeout after 10 seconds"));
      }, 10000);

      redisClient.on("connect", () => {
        clearTimeout(timeoutId);
        console.log("✅ Redis Connected Successfully");
        resolve(redisClient);
      });

      redisClient.on("error", (error) => {
        clearTimeout(timeoutId);
        console.error("❌ Redis connection error:", error.message);
        reject(error);
      });
    } catch (error) {
      console.error("❌ Failed to connect to Redis:", error.message);
      reject(error);
    }
  });

  return connectionPromise;
};

export { redisClient };
export default connectRedis;
