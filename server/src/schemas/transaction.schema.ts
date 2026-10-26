import { z } from "zod";

const transactionItemSchema = z.object({
  id_barang: z.coerce.number().int().positive("Barang harus dipilih"),
  jumlah: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
  keterangan: z.string().trim().max(255).optional().nullable(),
});

export const barangMasukCreateSchema = z.object({
  body: z.object({
    tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
    id_supplier: z.coerce.number().int().positive("Supplier harus dipilih"),
    nama_petugas: z.string().trim().max(100).optional().nullable(),
    items: z
      .array(transactionItemSchema)
      .min(1, "Minimal harus ada 1 item barang yang dimasukkan"),
  }),
});

export const barangKeluarCreateSchema = z.object({
  body: z.object({
    tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
    id_divisi: z.coerce.number().int().positive("Divisi penerima harus dipilih"),
    nama_pengambil: z.string().trim().max(100).optional().nullable(),
    items: z
      .array(transactionItemSchema)
      .min(1, "Minimal harus ada 1 item barang yang dikeluarkan"),
  }),
});
