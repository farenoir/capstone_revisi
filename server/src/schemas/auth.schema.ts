import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    username: z.string().trim().min(1, "Username wajib diisi"),
    password: z.string().trim().min(1, "Password wajib diisi"),
  }),
});
