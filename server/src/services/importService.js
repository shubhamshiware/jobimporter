import ImportLog from "../models/ImportLog.js";
import { addJobToQueue } from "../queues/index.js";

export const processFeedData = async (feedData) => {
  const { feedUrl, jobs, totalFetched } = feedData;

  try {
    console.log(`Processing ${jobs.length} jobs from ${feedUrl}`);

    const importLog = new ImportLog({
      feedUrl,
      totalFetched,
      status: "processing",
    });

    const savedLog = await importLog.save();
    console.log(`Created import log: ${savedLog._id}`);

    const queuePromises = jobs.map((jobData) =>
      addJobToQueue(jobData, savedLog._id)
    );

    await Promise.all(queuePromises);

    console.log(`Queued ${jobs.length} jobs for processing`);

    await ImportLog.findByIdAndUpdate(savedLog._id, {
      status: "queued",
    });

    return {
      importLogId: savedLog._id,
      queuedJobs: jobs.length,
    };
  } catch (error) {
    console.error(`Error processing feed data for ${feedUrl}:`, error);

    try {
      await ImportLog.create({
        feedUrl,
        totalFetched,
        status: "failed",
        failures: [
          {
            jobKey: "feed_processing",
            reason: error.message,
            ts: new Date(),
          },
        ],
      });
    } catch (logError) {
      console.error("Failed to create error log:", logError);
    }

    throw error;
  }
};

export const getImportLogs = async (page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const logs = await ImportLog.find()
      .sort({ importDateTime: -1 })
      .skip(skip)
      .limit(limit)
      .select("-failures");

    const total = await ImportLog.countDocuments();

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching import logs:", error);
    throw error;
  }
};

export const getImportLogById = async (id) => {
  try {
    const log = await ImportLog.findById(id);

    if (!log) {
      throw new Error("Import log not found");
    }

    return log;
  } catch (error) {
    console.error(`Error fetching import log ${id}:`, error);
    throw error;
  }
};

export const getImportStats = async () => {
  try {
    const stats = await ImportLog.aggregate([
      {
        $group: {
          _id: null,
          totalImports: { $sum: 1 },
          totalJobsFetched: { $sum: "$totalFetched" },
          totalJobsImported: { $sum: "$totalImported" },
          totalNewJobs: { $sum: "$newJobs" },
          totalUpdatedJobs: { $sum: "$updatedJobs" },
          totalFailedJobs: { $sum: "$failedJobs" },
          completedImports: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          failedImports: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalImports: 0,
        totalJobsFetched: 0,
        totalJobsImported: 0,
        totalNewJobs: 0,
        totalUpdatedJobs: 0,
        totalFailedJobs: 0,
        completedImports: 0,
        failedImports: 0,
      }
    );
  } catch (error) {
    console.error("Error fetching import stats:", error);
    throw error;
  }
};

export const triggerImport = async () => {
  try {
    const { fetchAllFeeds } = await import("./fetchService.js");
    const result = await fetchAllFeeds();

    return {
      success: true,
      message: `Import triggered successfully. Processed ${result.success} feeds, ${result.failed} failed.`,
      details: result,
    };
  } catch (error) {
    console.error("Error triggering import:", error);
    throw error;
  }
};
