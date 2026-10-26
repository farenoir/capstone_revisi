import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { sendError } from "../utils/apiResponse";

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "UNAUTHORIZED", "Pengguna belum terautentikasi", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        "FORBIDDEN",
        `Akses ditolak. Fitur ini hanya dapat diakses oleh peran: ${allowedRoles.join(", ")}`,
        403
      );
    }

    next();
  };
};
