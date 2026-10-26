import { Router } from "express";
import { getDashboardSummary, getLowStockAlerts } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/summary", getDashboardSummary);
router.get("/low-stock", getLowStockAlerts);

export default router;
