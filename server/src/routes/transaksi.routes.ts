import { Router } from "express";
import {
  createBarangMasuk,
  getBarangMasukList,
  createBarangKeluar,
  getBarangKeluarList,
} from "../controllers/transaksi.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import {
  barangMasukCreateSchema,
  barangKeluarCreateSchema,
} from "../schemas/transaction.schema";

const router = Router();

router.use(requireAuth);

// Barang Masuk
router.post(
  "/barang-masuk",
  requireRole(["admin"]),
  validateRequest(barangMasukCreateSchema),
  createBarangMasuk
);
router.get("/barang-masuk", getBarangMasukList);

// Barang Keluar
router.post(
  "/barang-keluar",
  requireRole(["admin"]),
  validateRequest(barangKeluarCreateSchema),
  createBarangKeluar
);
router.get("/barang-keluar", getBarangKeluarList);

export default router;
