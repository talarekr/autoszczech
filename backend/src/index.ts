import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";

import authRoutes from "./routes/auth";
import carRoutes from "./routes/cars";
import offerRoutes from "./routes/offers";

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/offers", offerRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`API on :${PORT}`);
});
