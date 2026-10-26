import { z } from "zod";

export const barangCreateSchema = z.object({
  body: z.object({
    kode_barang: z.string().trim().min(1, "Kode barang wajib diisi").max(50),
    nama_barang: z.string().trim().min(1, "Nama barang wajib diisi").max(150),
    id_kategori: z.coerce.number().int().positive("Kategori wajib dipilih"),
    satuan: z.string().trim().min(1, "Satuan wajib diisi").max(30),
    stok: z.coerce.number().int().min(0, "Stok awal minimal 0").default(0),
    stok_minimum: z.coerce.number().int().min(0, "Stok minimum minimal 0").default(0),
    harga_satuan: z.coerce.number().int().min(0, "Harga satuan minimal 0").default(0),
    expired_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal kedaluwarsa harus YYYY-MM-DD").optional().nullable(),
    lokasi: z.string().trim().max(100).optional().nullable(),
  }),
});

export const barangUpdateSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    kode_barang: z.string().trim().min(1).max(50).optional(),
    nama_barang: z.string().trim().min(1).max(150).optional(),
    id_kategori: z.coerce.number().int().positive().optional(),
    satuan: z.string().trim().min(1).max(30).optional(),
    stok_minimum: z.coerce.number().int().min(0).optional(),
    harga_satuan: z.coerce.number().int().min(0).optional(),
    expired_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal kedaluwarsa harus YYYY-MM-DD").optional().nullable(),
    lokasi: z.string().trim().max(100).optional().nullable(),
  }),
});

export const kategoriSchema = z.object({
  body: z.object({
    nama_kategori: z.string().trim().min(1, "Nama kategori wajib diisi").max(100),
  }),
});

export const supplierSchema = z.object({
  body: z.object({
    nama_supplier: z.string().trim().min(1, "Nama supplier wajib diisi").max(150),
    alamat: z.string().trim().optional().nullable(),
    telepon: z.string().trim().max(30).optional().nullable(),
  }),
});

export const divisiSchema = z.object({
  body: z.object({
    nama_divisi: z.string().trim().min(1, "Nama divisi wajib diisi").max(100),
  }),
});
