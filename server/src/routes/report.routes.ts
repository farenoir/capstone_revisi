import { Router } from "express";
import { getMutasiReportData, getSaldoAkhirReport, exportReport } from "../controllers/report.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/mutasi", getMutasiReportData);
router.get("/saldo-akhir", getSaldoAkhirReport);
router.get("/export", exportReport);

export default router;
