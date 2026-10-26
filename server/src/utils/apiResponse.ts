import { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    data,
  });
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  });
};
