import { Request, Response, NextFunction } from "express";
import ExcelJS from "exceljs";
import { format as formatCsv } from "fast-csv";
import { prisma } from "../utils/db";
import { sendSuccess } from "../utils/apiResponse";

export const getMutasiReportData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type = "mutasi", start_date, end_date, id_supplier, id_divisi, id_kategori } = req.query;

    const dateFilter: any = {};
    if (start_date) dateFilter.gte = new Date(start_date as string);
    if (end_date) dateFilter.lte = new Date(end_date as string);

    let rows: Array<{
      id: string;
      tanggal: Date;
      jenis: "Masuk" | "Keluar";
      pihak: string;
      kode_barang: string;
      nama_barang: string;
      kategori: string;
      jumlah: number;
      satuan: string;
      petugas: string;
      keterangan: string;
    }> = [];

    // Barang Masuk
    if (type === "mutasi" || type === "masuk") {
      const masukWhere: any = {};
      if (start_date || end_date) masukWhere.tanggal = dateFilter;
      if (id_supplier) masukWhere.id_supplier = Number(id_supplier);
      if (id_kategori) masukWhere.barang = { id_kategori: Number(id_kategori) };

      const masukList = await prisma.barangMasuk.findMany({
        where: masukWhere,
        include: {
          barang: { include: { kategori: true } },
          supplier: true,
          user: true,
        },
        orderBy: { tanggal: "desc" },
      });

      rows.push(
        ...masukList.map((m) => ({
          id: `IN-${m.id_masuk}`,
          tanggal: m.tanggal,
          jenis: "Masuk" as const,
          pihak: m.supplier.nama_supplier,
          kode_barang: m.barang.kode_barang,
          nama_barang: m.barang.nama_barang,
          kategori: m.barang.kategori.nama_kategori,
          jumlah: m.jumlah,
          satuan: m.barang.satuan,
          petugas: m.user.nama,
          keterangan: m.keterangan || "-",
        }))
      );
    }

    // Barang Keluar
    if (type === "mutasi" || type === "keluar") {
      const keluarWhere: any = {};
      if (start_date || end_date) keluarWhere.tanggal = dateFilter;
      if (id_divisi) keluarWhere.id_divisi = Number(id_divisi);
      if (id_kategori) keluarWhere.barang = { id_kategori: Number(id_kategori) };

      const keluarList = await prisma.barangKeluar.findMany({
        where: keluarWhere,
        include: {
          barang: { include: { kategori: true } },
          divisi: true,
          user: true,
        },
        orderBy: { tanggal: "desc" },
      });

      rows.push(
        ...keluarList.map((k) => ({
          id: `OUT-${k.id_keluar}`,
          tanggal: k.tanggal,
          jenis: "Keluar" as const,
          pihak: k.divisi.nama_divisi,
          kode_barang: k.barang.kode_barang,
          nama_barang: k.barang.nama_barang,
          kategori: k.barang.kategori.nama_kategori,
          jumlah: k.jumlah,
          satuan: k.barang.satuan,
          petugas: k.user.nama,
          keterangan: k.keterangan || "-",
        }))
      );
    }

    // Sort combined records by date descending
    rows.sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime());

    return sendSuccess(res, rows);
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format = "xlsx", type = "mutasi", start_date, end_date } = req.query;

    const dateFilter: any = {};
    if (start_date) dateFilter.gte = new Date(start_date as string);
    if (end_date) dateFilter.lte = new Date(end_date as string);

    const rows: Array<{
      no_dokumen: string;
      tanggal: string;
      jenis: string;
      pihak_terkait: string;
      kode_barang: string;
      nama_barang: string;
      kategori: string;
      jumlah: number;
      satuan: string;
      petugas: string;
      keterangan: string;
    }> = [];

    // Barang Masuk
    if (type === "mutasi" || type === "masuk") {
      const masukWhere: any = {};
      if (start_date || end_date) masukWhere.tanggal = dateFilter;

      const masukList = await prisma.barangMasuk.findMany({
        where: masukWhere,
        include: {
          barang: { include: { kategori: true } },
          supplier: true,
          user: true,
        },
        orderBy: { tanggal: "desc" },
      });

      rows.push(
        ...masukList.map((m) => ({
          no_dokumen: `BM-${m.id_masuk.toString().padStart(5, "0")}`,
          tanggal: m.tanggal.toISOString().split("T")[0],
          jenis: "Barang Masuk",
          pihak_terkait: m.supplier.nama_supplier,
          kode_barang: m.barang.kode_barang,
          nama_barang: m.barang.nama_barang,
          kategori: m.barang.kategori.nama_kategori,
          jumlah: m.jumlah,
          satuan: m.barang.satuan,
          petugas: m.user.nama,
          keterangan: m.keterangan || "-",
        }))
      );
    }

    // Barang Keluar
    if (type === "mutasi" || type === "keluar") {
      const keluarWhere: any = {};
      if (start_date || end_date) keluarWhere.tanggal = dateFilter;

      const keluarList = await prisma.barangKeluar.findMany({
        where: keluarWhere,
        include: {
          barang: { include: { kategori: true } },
          divisi: true,
          user: true,
        },
        orderBy: { tanggal: "desc" },
      });

      rows.push(
        ...keluarList.map((k) => ({
          no_dokumen: `BK-${k.id_keluar.toString().padStart(5, "0")}`,
          tanggal: k.tanggal.toISOString().split("T")[0],
          jenis: "Barang Keluar",
          pihak_terkait: k.divisi.nama_divisi,
          kode_barang: k.barang.kode_barang,
          nama_barang: k.barang.nama_barang,
          kategori: k.barang.kategori.nama_kategori,
          jumlah: k.jumlah,
          satuan: k.barang.satuan,
          petugas: k.user.nama,
          keterangan: k.keterangan || "-",
        }))
      );
    }

    rows.sort((a, b) => b.tanggal.localeCompare(a.tanggal));

    const filename = `Laporan_Mutasi_ATK_${type}_${new Date().toISOString().split("T")[0]}`;

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);

      const csvStream = formatCsv({ headers: true });
      csvStream.pipe(res);

      for (const row of rows) {
        csvStream.write(row);
      }
      csvStream.end();
      return;
    }

    // Default: Excel (.xlsx) via ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sistem Informasi ATK";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Riwayat Mutasi ATK");

    worksheet.columns = [
      { header: "No Dokumen", key: "no_dokumen", width: 15 },
      { header: "Tanggal", key: "tanggal", width: 14 },
      { header: "Jenis Mutasi", key: "jenis", width: 16 },
      { header: "Supplier / Divisi", key: "pihak_terkait", width: 25 },
      { header: "Kode Barang", key: "kode_barang", width: 14 },
      { header: "Nama Barang", key: "nama_barang", width: 28 },
      { header: "Kategori", key: "kategori", width: 20 },
      { header: "Jumlah", key: "jumlah", width: 10 },
      { header: "Satuan", key: "satuan", width: 10 },
      { header: "Pencatat", key: "petugas", width: 20 },
      { header: "Keterangan", key: "keterangan", width: 25 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A8A" }, // Indigo/Navy
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    rows.forEach((r) => {
      worksheet.addRow(r);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
