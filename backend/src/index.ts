import { mkdirSync } from "node:fs";
import path from "node:path";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";

import authRoutes from "./routes/auth.js";
import carRoutes from "./routes/cars.js";
import offerRoutes from "./routes/offers.js";
import { startFtpImportLoop } from "./jobs/ftpWatcher.js";
import { parseFtpEnvConfig, resolvePublicImagePath } from "./lib/ftpConfig.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));

const ftpConfig = parseFtpEnvConfig();
mkdirSync(ftpConfig.localImageDir, { recursive: true });
const publicImagePath = resolvePublicImagePath(ftpConfig.imageBaseUrl);
const staticMountPath = publicImagePath.startsWith("/") ? publicImagePath : `/${publicImagePath}`;
app.use(staticMountPath, express.static(path.resolve(ftpConfig.localImageDir)));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/offers", offerRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ API running on port: ${PORT}`);
});

const ftpEnabled = (process.env.FTP_IMPORT_ENABLED ?? "true").toLowerCase() === "true";
if (ftpEnabled) {
  startFtpImportLoop(ftpConfig).catch((error) => {
    console.error("[ftp-importer] Failed to start watcher:", error);
  });
} else {
  console.info("[ftp-importer] watcher disabled (set FTP_IMPORT_ENABLED=true to activate)");
}
