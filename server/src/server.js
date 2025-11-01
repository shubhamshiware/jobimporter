import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import cron from "node-cron";

import connectDB from "./config/db.js";
import connectRedis, { redisClient } from "./config/redis.js";
import { initializeQueue } from "./queues/index.js";
import { initializeWorker } from "./workers/jobWorker.js";
import importRoutes from "./routes/importRoutes.js";
import { fetchAllFeeds } from "./services/fetchService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/imports", importRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

await connectDB();
const redisConnection = await connectRedis();

initializeQueue(redisConnection);
initializeWorker(redisConnection);

cron.schedule("0 * * * *", async () => {
  console.log("Running scheduled job import...");
  try {
    await fetchAllFeeds();
    console.log("Scheduled import completed successfully");
  } catch (error) {
    console.error(" Scheduled import failed:", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Cron job scheduled to run every hour");
});
