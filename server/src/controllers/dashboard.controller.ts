import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/db";
import { sendSuccess } from "../utils/apiResponse";

export const getDashboardSummary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [totalBarang, allBarang, masukBulanIni, keluarBulanIni] = await Promise.all([
      prisma.barang.count(),
      prisma.barang.findMany({
        select: {
          stok: true,
          stok_minimum: true,
        },
      }),
      prisma.barangMasuk.aggregate({
        _sum: { jumlah: true },
        where: {
          tanggal: {
            gte: firstDayThisMonth,
            lte: lastDayThisMonth,
          },
        },
      }),
      prisma.barangKeluar.aggregate({
        _sum: { jumlah: true },
        where: {
          tanggal: {
            gte: firstDayThisMonth,
            lte: lastDayThisMonth,
          },
        },
      }),
    ]);

    const totalKritis = allBarang.filter((b) => b.stok <= b.stok_minimum).length;

    // Monthly Trend (6 months)
    const monthlyTrend: Array<{
      bulan: string;
      masuk: number;
      keluar: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthName = start.toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });

      const [mSum, kSum] = await Promise.all([
        prisma.barangMasuk.aggregate({
          _sum: { jumlah: true },
          where: { tanggal: { gte: start, lte: end } },
        }),
        prisma.barangKeluar.aggregate({
          _sum: { jumlah: true },
          where: { tanggal: { gte: start, lte: end } },
        }),
      ]);

      monthlyTrend.push({
        bulan: monthName,
        masuk: mSum._sum.jumlah || 0,
        keluar: kSum._sum.jumlah || 0,
      });
    }

    return sendSuccess(res, {
      total_barang: totalBarang,
      total_masuk_bulan_ini: masukBulanIni._sum.jumlah || 0,
      total_keluar_bulan_ini: keluarBulanIni._sum.jumlah || 0,
      total_kritis: totalKritis,
      monthly_trend: monthlyTrend,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockAlerts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allBarang = await prisma.barang.findMany({
      include: {
        kategori: {
          select: { nama_kategori: true },
        },
      },
      orderBy: { stok: "asc" },
    });

    const lowStockItems = allBarang
      .filter((b) => b.stok <= b.stok_minimum)
      .map((b) => ({
        id_barang: b.id_barang,
        kode_barang: b.kode_barang,
        nama_barang: b.nama_barang,
        kategori: b.kategori.nama_kategori,
        stok: b.stok,
        stok_minimum: b.stok_minimum,
        satuan: b.satuan,
        lokasi: b.lokasi || "-",
        expired_date: b.expired_date ? b.expired_date.toISOString().split("T")[0] : null,
        status: b.stok === 0 ? "Habis" : "Menipis",
      }));

    return sendSuccess(res, lowStockItems);
  } catch (error) {
    next(error);
  }
};
