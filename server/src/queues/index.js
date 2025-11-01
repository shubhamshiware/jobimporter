import { Queue } from "bullmq";
import { redisClient } from "../config/redis.js";

let jobImportQueue = null;

export const initializeQueue = (connectionOptions) => {
  jobImportQueue = new Queue("job-import", {
    connection: connectionOptions,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  });
  console.log("Job import queue initialized");
  return jobImportQueue;
};

// Add job to queue
export const addJobToQueue = async (jobData, importLogId) => {
  if (!jobImportQueue) {
    throw new Error("Queue not initialized. Call initializeQueue() first.");
  }
  try {
    const job = await jobImportQueue.add(
      "process-job",
      {
        ...jobData,
        importLogId,
      },
      {
        priority: 0,
      }
    );

    console.log(`Job added to queue: ${job.id}`);
    return job;
  } catch (error) {
    console.error("Error adding job to queue:", error);
    throw error;
  }
};

export const getQueueStats = async () => {
  if (!jobImportQueue) {
    throw new Error("Queue not initialized. Call initializeQueue() first.");
  }
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      jobImportQueue.getWaiting(),
      jobImportQueue.getActive(),
      jobImportQueue.getCompleted(),
      jobImportQueue.getFailed(),
      jobImportQueue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
    };
  } catch (error) {
    console.error("Error getting queue stats:", error);
    throw error;
  }
};

export const cleanOldJobs = async () => {
  if (!jobImportQueue) {
    console.warn("Queue not initialized. Skipping cleanup.");
    return;
  }
  try {
    await jobImportQueue.clean(24 * 60 * 60 * 1000, 100, "completed");
    await jobImportQueue.clean(7 * 24 * 60 * 60 * 1000, 50, "failed");
    console.log("Queue cleanup completed");
  } catch (error) {
    console.error("Error cleaning queue:", error);
  }
};

export const getQueue = () => jobImportQueue;
export default jobImportQueue;
