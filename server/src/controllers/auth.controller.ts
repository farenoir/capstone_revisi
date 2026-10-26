import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/db";
import { env } from "../config/env";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return sendError(res, "AUTH_INVALID", "Username atau password salah", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "AUTH_INVALID", "Username atau password salah", 401);
    }

    const payload = {
      id_user: user.id_user,
      username: user.username,
      nama: user.nama,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    return sendSuccess(
      res,
      {
        token,
        user: payload,
      },
      "Login berhasil"
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, "UNAUTHORIZED", "Tidak ada sesi aktif", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id_user: req.user.id_user },
      select: {
        id_user: true,
        nama: true,
        username: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      return sendError(res, "NOT_FOUND", "Pengguna tidak ditemukan", 404);
    }

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};
