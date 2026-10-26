import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { sendError } from "../utils/apiResponse";

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.slice(1).join("."),
          message: e.message,
        }));
        return sendError(res, "VALIDATION_ERROR", "Data masukan tidak valid", 400, issues);
      }
      next(error);
    }
  };
};
