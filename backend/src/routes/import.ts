import { Router } from "express";

import { auth } from "../middleware/auth.js";
import { getFtpImportStatus, runFtpImportOnce } from "../jobs/ftpWatcher.js";

const r = Router();

r.get("/ftp/status", auth("ADMIN"), (_req, res) => {
  const status = getFtpImportStatus();
  res.json({
    running: status.running,
    lastRun: status.lastRun
      ? {
          at: status.lastRun.at,
          report: status.lastRun.result,
        }
      : null,
  });
});

r.post("/ftp/run", auth("ADMIN"), async (_req, res) => {
  try {
    const result = await runFtpImportOnce();
    res.json(result);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({ error: err.message });
  }
});

export default r;
