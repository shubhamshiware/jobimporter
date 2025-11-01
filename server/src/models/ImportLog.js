import mongoose from "mongoose";

const failureSchema = new mongoose.Schema(
  {
    jobKey: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    ts: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const importLogSchema = new mongoose.Schema(
  {
    feedUrl: {
      type: String,
      required: true,
    },
    importDateTime: {
      type: Date,
      default: Date.now,
    },
    totalFetched: {
      type: Number,
      default: 0,
    },
    totalImported: {
      type: Number,
      default: 0,
    },
    newJobs: {
      type: Number,
      default: 0,
    },
    updatedJobs: {
      type: Number,
      default: 0,
    },
    failedJobs: {
      type: Number,
      default: 0,
    },
    failures: [failureSchema],
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },
  },
  {
    timestamps: true,
  }
);

importLogSchema.index({ feedUrl: 1, importDateTime: -1 });
importLogSchema.index({ status: 1 });
importLogSchema.index({ importDateTime: -1 });

const ImportLog = mongoose.model("ImportLog", importLogSchema);

export default ImportLog;
