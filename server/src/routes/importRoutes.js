import express from "express";
import {
  getImportLogs,
  getImportLogById,
  getImportStats,
  triggerImport,
} from "../services/importService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await getImportLogs(page, limit);

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching import logs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch import logs",
      message: error.message,
    });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const stats = await getImportStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching import stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch import statistics",
      message: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const log = await getImportLogById(id);

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error(`Error fetching import log ${req.params.id}:`, error);

    if (error.message === "Import log not found") {
      return res.status(404).json({
        success: false,
        error: "Import log not found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch import log",
      message: error.message,
    });
  }
});

router.post("/trigger", async (req, res) => {
  try {
    const result = await triggerImport();

    res.json({
      success: true,
      message: "Import triggered successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error triggering import:", error);
    res.status(500).json({
      success: false,
      error: "Failed to trigger import",
      message: error.message,
    });
  }
});

export default router;
