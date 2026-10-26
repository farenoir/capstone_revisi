import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Menjalankan seeding database dari Data_Barang_Gudang_ATK.xlsx...");

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

  // 2. Baca file Excel Data_Barang_Gudang_ATK.xlsx
  const excelPath = path.resolve(__dirname, "../../Data_Barang_Gudang_ATK.xlsx");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const worksheet = workbook.getWorksheet("Data Barang ATK");
  if (!worksheet) {
    throw new Error("Worksheet 'Data Barang ATK' tidak ditemukan dalam file Excel");
  }

  // 3. Ekstrak Kategori Unik dan Buat di Database
  const kategoriMap = new Map<string, number>();
  const categoriesInSheet = new Set<string>();

  worksheet.eachRow((row, rowNum) => {
    if (rowNum >= 5 && rowNum <= 54) {
      const katName = row.getCell(4).value?.toString().trim();
      if (katName) categoriesInSheet.add(katName);
    }
  });

  for (const katName of categoriesInSheet) {
    const kat = await prisma.kategori.upsert({
      where: { nama_kategori: katName },
      update: {},
      create: { nama_kategori: katName },
    });
    kategoriMap.set(katName, kat.id_kategori);
  }
  console.log(`✓ ${kategoriMap.size} Kategori berhasil dibuat: ${Array.from(categoriesInSheet).join(", ")}`);

  // 4. Seed Supplier
  await prisma.supplier.upsert({
    where: { id_supplier: 1 },
    update: {},
    create: {
      id_supplier: 1,
      nama_supplier: "PT Sumber Makmur ATK",
      alamat: "Jl. Industri Raya No. 12, Jakarta Barat",
      telepon: "021-5551234",
    },
  });

  await prisma.supplier.upsert({
    where: { id_supplier: 2 },
    update: {},
    create: {
      id_supplier: 2,
      nama_supplier: "CV Sentosa Stationery",
      alamat: "Jl. Niaga Sentral No. 45, Bandung",
      telepon: "022-7778899",
    },
  });

  await prisma.supplier.upsert({
    where: { id_supplier: 3 },
    update: {},
    create: {
      id_supplier: 3,
      nama_supplier: "PT Graha Stationeries Utama",
      alamat: "Kawasan Pergudangan Rawa Terate Blok C, Jakarta Timur",
      telepon: "021-8889900",
    },
  });
  console.log("✓ 3 Supplier berhasil dibuat");

  // 5. Seed Divisi
  const divisiList = [
    "Divisi Keuangan & Akuntansi",
    "Divisi HRD & Umum",
    "Divisi IT & Sistem Informasi",
    "Divisi Operasional & Logistik",
    "Divisi Pemasaran & Penjualan",
  ];

  for (const nama_divisi of divisiList) {
    await prisma.divisi.upsert({
      where: { nama_divisi },
      update: {},
      create: { nama_divisi },
    });
  }
  console.log("✓ Divisi kerja berhasil dibuat");

  // 6. Seed 50 Data Barang dari Excel
  // Item dengan expired date 2 tahun dari sekarang (2026-10-26 -> 2028-10-26):
  // ATK-044 Tinta Printer Hitam
  // ATK-045 Tinta Printer Warna (Set)
  // ATK-046 Toner Cartridge Laser
  // ATK-049 Baterai AA Alkaline
  // ATK-033 Lem Stick 8 gr
  const targetExpiredItems = ["ATK-044", "ATK-045", "ATK-046", "ATK-049", "ATK-033"];
  const twoYearsFromNow = new Date("2028-10-26T00:00:00.000Z");

  const rackLocationMap: Record<string, string> = {
    "Alat Tulis": "Rak A (Alat Tulis)",
    "Kertas & Buku": "Rak B (Kertas & Buku)",
    "Perlengkapan Kantor": "Rak C (Perlengkapan)",
    "Arsip & Penyimpanan": "Rak D (Arsip & File)",
    "Tinta & Printer": "Rak E (Tinta & Toner)",
    "Lain-lain": "Rak F (Peralatan Umum)",
  };

  let barangCount = 0;
  worksheet.eachRow(async (row, rowNum) => {
    if (rowNum >= 5 && rowNum <= 54) {
      const kode_barang = row.getCell(2).value?.toString().trim();
      const nama_barang = row.getCell(3).value?.toString().trim();
      const katName = row.getCell(4).value?.toString().trim();
      const satuan = row.getCell(5).value?.toString().trim();
      const stok = Number(row.getCell(6).value) || 0;
      const stok_minimum = Number(row.getCell(7).value) || 0;
      const harga_satuan = Number(row.getCell(8).value) || 0;

      if (!kode_barang || !nama_barang || !katName || !satuan) return;

      const id_kategori = kategoriMap.get(katName);
      if (!id_kategori) return;

      const isTargetExpired = targetExpiredItems.includes(kode_barang);
      const expired_date = isTargetExpired ? twoYearsFromNow : null;
      const lokasi = rackLocationMap[katName] || "Rak Utama";

      await prisma.barang.upsert({
        where: { kode_barang },
        update: {
          nama_barang,
          id_kategori,
          satuan,
          stok,
          stok_minimum,
          harga_satuan,
          expired_date,
          lokasi,
        },
        create: {
          kode_barang,
          nama_barang,
          id_kategori,
          satuan,
          stok,
          stok_minimum,
          harga_satuan,
          expired_date,
          lokasi,
        },
      });
      barangCount++;
    }
  });

  // Karena eachRow bersifat synchronous per iterasi namun asynchronous dalam callback,
  // gunakan for-loop agar eksekusi sequential dan terjamin selesai.
  for (let r = 5; r <= 54; r++) {
    const row = worksheet.getRow(r);
    const kode_barang = row.getCell(2).value?.toString().trim();
    const nama_barang = row.getCell(3).value?.toString().trim();
    const katName = row.getCell(4).value?.toString().trim();
    const satuan = row.getCell(5).value?.toString().trim();
    const stok = Number(row.getCell(6).value) || 0;
    const stok_minimum = Number(row.getCell(7).value) || 0;
    const harga_satuan = Number(row.getCell(8).value) || 0;

    if (!kode_barang || !nama_barang || !katName || !satuan) continue;

    const id_kategori = kategoriMap.get(katName);
    if (!id_kategori) continue;

    const isTargetExpired = targetExpiredItems.includes(kode_barang);
    const expired_date = isTargetExpired ? twoYearsFromNow : null;
    const lokasi = rackLocationMap[katName] || "Rak Utama";

    await prisma.barang.upsert({
      where: { kode_barang },
      update: {
        nama_barang,
        id_kategori,
        satuan,
        stok,
        stok_minimum,
        harga_satuan,
        expired_date,
        lokasi,
      },
      create: {
        kode_barang,
        nama_barang,
        id_kategori,
        satuan,
        stok,
        stok_minimum,
        harga_satuan,
        expired_date,
        lokasi,
      },
    });
  }

  console.log(`✓ 50 Data Barang dari Excel berhasil disimpan ke database!`);
  console.log(`✓ Kolom Expired Date diset ke 2028-10-26 (2 tahun) untuk: ${targetExpiredItems.join(", ")}`);
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
