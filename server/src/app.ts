import express from "express";
import cors from "cors";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { env } from "./config/env";
import { prisma } from "./utils/db";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : [env.CORS_ORIGIN, "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/api/v1/health", async (_req, res) => {
  try {
    // Check DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: "degraded",
      database: "disconnected",
      error: error.message,
    });
  }
});

// API Routes
app.use("/api/v1", apiRoutes);

// Error Handler
app.use(errorHandler);

export default app;
