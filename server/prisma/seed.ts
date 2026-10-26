import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Menjalankan seeding database...");

  // 1. Seed Users (admin & pimpinan)
  const passwordHashAdmin = await bcrypt.hash("admin123", 10);
  const passwordHashPimpinan = await bcrypt.hash("pimpinan123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: passwordHashAdmin,
      nama: "Administrator Gudang ATK",
      role: "admin",
    },
  });

  const pimpinan = await prisma.user.upsert({
    where: { username: "pimpinan" },
    update: {},
    create: {
      username: "pimpinan",
      password: passwordHashPimpinan,
      nama: "Kepala Bagian Operasional",
      role: "pimpinan",
    },
  });

  console.log(`✓ User dibuat: ${admin.username} (admin), ${pimpinan.username} (pimpinan)`);

  // 2. Seed Kategori
  const katKertas = await prisma.kategori.upsert({
    where: { nama_kategori: "Kertas & Buku" },
    update: {},
    create: { nama_kategori: "Kertas & Buku" },
  });

  const katTulis = await prisma.kategori.upsert({
    where: { nama_kategori: "Alat Tulis & Menggambar" },
    update: {},
    create: { nama_kategori: "Alat Tulis & Menggambar" },
  });

  const katPerekat = await prisma.kategori.upsert({
    where: { nama_kategori: "Perekat & Pengikat" },
    update: {},
    create: { nama_kategori: "Perekat & Pengikat" },
  });

  const katSimpan = await prisma.kategori.upsert({
    where: { nama_kategori: "Penyimpanan & File" },
    update: {},
    create: { nama_kategori: "Penyimpanan & File" },
  });

  console.log("✓ Kategori ATK berhasil dibuat");

  // 3. Seed Supplier
  const sup1 = await prisma.supplier.upsert({
    where: { id_supplier: 1 },
    update: {},
    create: {
      id_supplier: 1,
      nama_supplier: "PT Sumber Makmur ATK",
      alamat: "Jl. Industri Raya No. 12, Jakarta",
      telepon: "021-5551234",
    },
  });

  const sup2 = await prisma.supplier.upsert({
    where: { id_supplier: 2 },
    update: {},
    create: {
      id_supplier: 2,
      nama_supplier: "CV Sentosa Stationery",
      alamat: "Jl. Niaga Sentral No. 45, Bandung",
      telepon: "022-7778899",
    },
  });

  console.log("✓ Supplier berhasil dibuat");

  // 4. Seed Divisi
  const divIT = await prisma.divisi.upsert({
    where: { nama_divisi: "Divisi IT & Sistem Informasi" },
    update: {},
    create: { nama_divisi: "Divisi IT & Sistem Informasi" },
  });

  const divHRD = await prisma.divisi.upsert({
    where: { nama_divisi: "Divisi HRD & Umum" },
    update: {},
    create: { nama_divisi: "Divisi HRD & Umum" },
  });

  const divKeu = await prisma.divisi.upsert({
    where: { nama_divisi: "Divisi Keuangan & Akuntansi" },
    update: {},
    create: { nama_divisi: "Divisi Keuangan & Akuntansi" },
  });

  const divOps = await prisma.divisi.upsert({
    where: { nama_divisi: "Divisi Operasional Gudang" },
    update: {},
    create: { nama_divisi: "Divisi Operasional Gudang" },
  });

  console.log("✓ Divisi berhasil dibuat");

  // 5. Seed Barang Awal
  const barangAwal = [
    {
      kode_barang: "ATK-001",
      nama_barang: "Kertas HVS A4 80gr",
      id_kategori: katKertas.id_kategori,
      satuan: "Rim",
      stok: 50,
      stok_minimum: 10,
      lokasi: "Rak A1",
    },
    {
      kode_barang: "ATK-002",
      nama_barang: "Spidol Whiteboard Hitam",
      id_kategori: katTulis.id_kategori,
      satuan: "Pcs",
      stok: 25,
      stok_minimum: 5,
      lokasi: "Rak B2",
    },
    {
      kode_barang: "ATK-003",
      nama_barang: "Buku Ekspedisi Folio 100 Lembar",
      id_kategori: katKertas.id_kategori,
      satuan: "Buku",
      stok: 4, // Kritis (stok <= stok_minimum)
      stok_minimum: 10,
      lokasi: "Rak A2",
    },
    {
      kode_barang: "ATK-004",
      nama_barang: "Stapler HD-10 Kangaro",
      id_kategori: katPerekat.id_kategori,
      satuan: "Pcs",
      stok: 12,
      stok_minimum: 5,
      lokasi: "Rak C1",
    },
    {
      kode_barang: "ATK-005",
      nama_barang: "Map Bantex Folio Biru",
      id_kategori: katSimpan.id_kategori,
      satuan: "Pcs",
      stok: 2, // Kritis (stok <= stok_minimum)
      stok_minimum: 8,
      lokasi: "Rak D3",
    },
  ];

  for (const b of barangAwal) {
    await prisma.barang.upsert({
      where: { kode_barang: b.kode_barang },
      update: {},
      create: b,
    });
  }

  console.log("✓ Data Master Barang awal berhasil dibuat");
  console.log("Seeding selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("Gagal menjalankan seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
