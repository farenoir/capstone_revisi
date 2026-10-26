import { Router } from "express";
import {
  getAllBarang,
  getBarangById,
  createBarang,
  updateBarang,
  deleteBarang,
  getAllKategori,
  createKategori,
  updateKategori,
  deleteKategori,
  getAllSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getAllDivisi,
  createDivisi,
  updateDivisi,
  deleteDivisi,
} from "../controllers/master.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import {
  barangCreateSchema,
  barangUpdateSchema,
  kategoriSchema,
  supplierSchema,
  divisiSchema,
} from "../schemas/master.schema";

const router = Router();

// Semua rute master memerlukan autentikasi
router.use(requireAuth);

// Barang
router.get("/barang", getAllBarang);
router.get("/barang/:id", getBarangById);
router.post("/barang", requireRole(["admin"]), validateRequest(barangCreateSchema), createBarang);
router.put("/barang/:id", requireRole(["admin"]), validateRequest(barangUpdateSchema), updateBarang);
router.delete("/barang/:id", requireRole(["admin"]), deleteBarang);

// Kategori
router.get("/kategori", getAllKategori);
router.post("/kategori", requireRole(["admin"]), validateRequest(kategoriSchema), createKategori);
router.put("/kategori/:id", requireRole(["admin"]), validateRequest(kategoriSchema), updateKategori);
router.delete("/kategori/:id", requireRole(["admin"]), deleteKategori);

// Supplier
router.get("/supplier", getAllSupplier);
router.post("/supplier", requireRole(["admin"]), validateRequest(supplierSchema), createSupplier);
router.put("/supplier/:id", requireRole(["admin"]), validateRequest(supplierSchema), updateSupplier);
router.delete("/supplier/:id", requireRole(["admin"]), deleteSupplier);

// Divisi
router.get("/divisi", getAllDivisi);
router.post("/divisi", requireRole(["admin"]), validateRequest(divisiSchema), createDivisi);
router.put("/divisi/:id", requireRole(["admin"]), validateRequest(divisiSchema), updateDivisi);
router.delete("/divisi/:id", requireRole(["admin"]), deleteDivisi);

export default router;
