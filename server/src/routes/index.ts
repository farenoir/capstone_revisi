import { Router } from "express";
import authRoutes from "./auth.routes";
import masterRoutes from "./master.routes";
import transaksiRoutes from "./transaksi.routes";
import dashboardRoutes from "./dashboard.routes";
import reportRoutes from "./report.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/", masterRoutes);
router.use("/transaksi", transaksiRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/laporan", reportRoutes);

export default router;
