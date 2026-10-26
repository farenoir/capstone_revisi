import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendError } from "../utils/apiResponse";
import { AuthUser } from "../types";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "UNAUTHORIZED", "Token autentikasi tidak ditemukan", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, "UNAUTHORIZED", "Sesi autentikasi telah berakhir atau token tidak valid", 401);
  }
};
