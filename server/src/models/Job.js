import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    raw: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    lastImportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ company: 1, location: 1 });
jobSchema.index({ lastImportedAt: -1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;
