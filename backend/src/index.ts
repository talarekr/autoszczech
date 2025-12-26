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
import importRoutes from "./routes/import.js";
import adminRoutes from "./routes/admin.js";
import favoriteRoutes from "./routes/favorites.js";
import { startFtpImportLoop } from "./jobs/ftpWatcher.js";
import { parseFtpEnvConfig, resolvePublicImagePath } from "./lib/ftpConfig.js";
import prisma from "./lib/prisma.js";
import bcrypt from "bcryptjs";
import { RegistrationStatus } from "@prisma/client";
import { ADMIN_EMAILS, normalizeAdminEmail } from "./lib/adminAccess.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));

const defaultAdminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const secondaryAdminPassword = process.env.ADMIN_PASSWORD_SECONDARY || "Nissanpatrol1!";

async function ensureAdminAccounts() {
  const admins = [
    { email: normalizeAdminEmail(ADMIN_EMAILS[0]), password: defaultAdminPassword },
    { email: normalizeAdminEmail(ADMIN_EMAILS[1]), password: secondaryAdminPassword },
  ];

  for (const admin of admins) {
    if (!admin.email) continue;

    const existing = await prisma.user.findUnique({ where: { email: admin.email } });

    if (existing) {
      const updateData: { role?: "ADMIN"; registrationStatus?: RegistrationStatus } = {};
      if (existing.role !== "ADMIN") {
        updateData.role = "ADMIN";
      }
      if (existing.registrationStatus !== RegistrationStatus.APPROVED) {
        updateData.registrationStatus = RegistrationStatus.APPROVED;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({ where: { id: existing.id }, data: updateData });
      }
      continue;
    }

    const hash = await bcrypt.hash(admin.password, 10);
    await prisma.user.create({
      data: {
        email: admin.email,
        password: hash,
        role: "ADMIN",
        registrationStatus: RegistrationStatus.APPROVED,
      },
    });
  }
}

ensureAdminAccounts().catch((error) => {
  console.error("[bootstrap] Nie udało się utworzyć kont administratora", error);
});

const ftpConfig = parseFtpEnvConfig();
mkdirSync(ftpConfig.localImageDir, { recursive: true });
const publicImagePath = resolvePublicImagePath(ftpConfig.imageBaseUrl);
const staticMountPath = publicImagePath.startsWith("/") ? publicImagePath : `/${publicImagePath}`;
app.use(staticMountPath, express.static(path.resolve(ftpConfig.localImageDir)));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/admin", importRoutes);
app.use("/api/admin", adminRoutes);

// Compatibility mounts (some deployments hit the API without the /api prefix)
app.use("/offers", offerRoutes);
app.use("/favorites", favoriteRoutes);

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
