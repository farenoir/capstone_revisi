import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/login", validateRequest(loginSchema), login);
router.get("/me", requireAuth, getMe);

export default router;
