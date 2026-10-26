import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { sendError } from "../utils/apiResponse";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Unhandled Error:", err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[])?.join(", ") || "field";
      return sendError(
        res,
        "DUPLICATE_ENTRY",
        `Data dengan nilai ${target} tersebut sudah digunakan`,
        409,
        err.meta
      );
    }

    if (err.code === "P2003") {
      return sendError(
        res,
        "FOREIGN_KEY_RESTRICT",
        "Data tidak dapat dihapus karena masih memiliki relasi transaksi inventaris terkait",
        409,
        err.meta
      );
    }

    if (err.code === "P2025") {
      return sendError(res, "NOT_FOUND", "Data yang dituju tidak ditemukan", 404);
    }
  }

  return sendError(
    res,
    "INTERNAL_SERVER_ERROR",
    err.message || "Terjadi kesalahan internal pada server",
    500
  );
};
