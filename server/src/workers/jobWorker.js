import { Worker } from "bullmq";
import { redisClient } from "../config/redis.js";
import Job from "../models/Job.js";
import ImportLog from "../models/ImportLog.js";

let jobWorker = null;

export const initializeWorker = (connectionOptions) => {
  jobWorker = new Worker(
    "job-import",
    async (job) => {
      const { importLogId, ...jobData } = job.data;

      try {
        console.log(`Processing job ${job.id} for import log ${importLogId}`);

        if (!jobData.externalId || !jobData.title || !jobData.company) {
          throw new Error(
            "Missing required job fields: externalId, title, or company"
          );
        }

        const existingJob = await Job.findOne({
          externalId: jobData.externalId,
        });

        let isNew = false;
        let isUpdated = false;

        if (existingJob) {
          existingJob.title = jobData.title;
          existingJob.description = jobData.description;
          existingJob.company = jobData.company;
          existingJob.location = jobData.location;
          existingJob.type = jobData.type;
          existingJob.url = jobData.url;
          existingJob.raw = jobData.raw;
          existingJob.lastImportedAt = new Date();

          await existingJob.save();
          isUpdated = true;
          console.log(`Updated existing job: ${jobData.externalId}`);
        } else {
          const newJob = new Job({
            externalId: jobData.externalId,
            title: jobData.title,
            description: jobData.description,
            company: jobData.company,
            location: jobData.location,
            type: jobData.type,
            url: jobData.url,
            raw: jobData.raw,
            lastImportedAt: new Date(),
          });

          await newJob.save();
          isNew = true;
          console.log(`Created new job: ${jobData.externalId}`);
        }

        const updateQuery = {
          $inc: {
            totalImported: 1,
          },
        };

        if (isNew) {
          updateQuery.$inc.newJobs = 1;
        } else if (isUpdated) {
          updateQuery.$inc.updatedJobs = 1;
        }

        const updatedLog = await ImportLog.findByIdAndUpdate(
          importLogId,
          updateQuery,
          { new: true }
        );

        if (
          updatedLog &&
          updatedLog.totalImported + updatedLog.failedJobs ===
            updatedLog.totalFetched
        ) {
          await ImportLog.findByIdAndUpdate(importLogId, {
            status: "completed",
          });
          console.log(` Import log ${importLogId} marked as completed`);
        }

        return {
          success: true,
          jobId: jobData.externalId,
          action: isNew ? "created" : "updated",
        };
      } catch (error) {
        console.error(`Job processing failed for ${job.id}:`, error);

        const failureEntry = {
          jobKey: jobData.externalId || "unknown",
          reason: error.message,
          ts: new Date(),
        };

        const updatedLog = await ImportLog.findByIdAndUpdate(
          importLogId,
          {
            $inc: { failedJobs: 1 },
            $push: { failures: failureEntry },
          },
          { new: true }
        );

        if (
          updatedLog &&
          updatedLog.totalImported + updatedLog.failedJobs ===
            updatedLog.totalFetched
        ) {
          await ImportLog.findByIdAndUpdate(importLogId, {
            status: "completed",
          });
          console.log(`Import log ${importLogId} marked as completed`);
        }

        throw error;
      }
    },
    {
      connection: connectionOptions,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  );

  // Event listeners
  jobWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  jobWorker.on("failed", (job, err) => {
    console.error(` Job ${job.id} failed:`, err.message);
  });

  jobWorker.on("stalled", (jobId) => {
    console.warn(` Job ${jobId} stalled`);
  });

  console.log("Job worker initialized and listening for jobs");
  return jobWorker;
};

export const getWorker = () => jobWorker;
export default jobWorker;
