import dotenv from "dotenv";
import path from "path";

// Load .env from server directory or root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "fallback_secret_for_dev_sistem_atk_2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
