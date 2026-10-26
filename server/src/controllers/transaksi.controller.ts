import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/db";
import { sendSuccess, sendError } from "../utils/apiResponse";

export class InsufficientStockError extends Error {
  id_barang: number;
  nama_barang: string;
  stok_tersedia: number;
  jumlah_diminta: number;

  constructor(id_barang: number, nama_barang: string, stok_tersedia: number, jumlah_diminta: number) {
    super(
      `Jumlah keluar melebihi stok tersedia untuk barang ${nama_barang} (Stok: ${stok_tersedia}, Diminta: ${jumlah_diminta})`
    );
    this.name = "InsufficientStockError";
    this.id_barang = id_barang;
    this.nama_barang = nama_barang;
    this.stok_tersedia = stok_tersedia;
    this.jumlah_diminta = jumlah_diminta;
  }
}

// ==========================================
// TRANSAKSI BARANG MASUK
// ==========================================
export const createBarangMasuk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id_user;
    const { tanggal, id_supplier, items } = req.body;

    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id_supplier: Number(id_supplier) },
    });
    if (!supplier) {
      return sendError(res, "NOT_FOUND", "Data supplier tidak ditemukan", 404);
    }

    const tgl = new Date(tanggal);

    // Execute in an isolated ACID transaction
    const createdRecords = await prisma.$transaction(async (tx) => {
      const records = [];

      for (const item of items) {
        const idBarang = Number(item.id_barang);
        const jumlah = Number(item.jumlah);

        const barang = await tx.barang.findUnique({
          where: { id_barang: idBarang },
        });

        if (!barang) {
          throw new Error(`Barang dengan ID ${idBarang} tidak ditemukan`);
        }

        // Increase physical stock
        await tx.barang.update({
          where: { id_barang: idBarang },
          data: {
            stok: { increment: jumlah },
          },
        });

        // Insert transaction record
        const record = await tx.barangMasuk.create({
          data: {
            tanggal: tgl,
            id_barang: idBarang,
            jumlah,
            id_supplier: Number(id_supplier),
            id_user: userId,
            keterangan: item.keterangan || null,
          },
          include: {
            barang: true,
            supplier: true,
          },
        });

        records.push(record);
      }

      return records;
    });

    return sendSuccess(
      res,
      createdRecords,
      `${createdRecords.length} item barang masuk berhasil dicatat dan stok bertambah`,
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getBarangMasukList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date, id_supplier, id_barang, page, limit } = req.query;

    const where: any = {};

    if (start_date || end_date) {
      where.tanggal = {};
      if (start_date) where.tanggal.gte = new Date(start_date as string);
      if (end_date) where.tanggal.lte = new Date(end_date as string);
    }

    if (id_supplier) {
      where.id_supplier = Number(id_supplier);
    }

    if (id_barang) {
      where.id_barang = Number(id_barang);
    }

    const take = limit ? Number(limit) : undefined;
    const skip = page && limit ? (Number(page) - 1) * Number(limit) : undefined;

    const [total, items] = await Promise.all([
      prisma.barangMasuk.count({ where }),
      prisma.barangMasuk.findMany({
        where,
        take,
        skip,
        include: {
          barang: {
            select: {
              id_barang: true,
              kode_barang: true,
              nama_barang: true,
              satuan: true,
            },
          },
          supplier: {
            select: {
              id_supplier: true,
              nama_supplier: true,
            },
          },
          user: {
            select: {
              id_user: true,
              nama: true,
              username: true,
            },
          },
        },
        orderBy: [{ tanggal: "desc" }, { id_masuk: "desc" }],
      }),
    ]);

    return sendSuccess(res, {
      items,
      total,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : total,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// TRANSAKSI BARANG KELUAR (DENGAN VALIDASI STOK)
// ==========================================
export const createBarangKeluar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id_user;
    const { tanggal, id_divisi, items } = req.body;

    // Verify divisi exists
    const divisi = await prisma.divisi.findUnique({
      where: { id_divisi: Number(id_divisi) },
    });
    if (!divisi) {
      return sendError(res, "NOT_FOUND", "Data divisi tidak ditemukan", 404);
    }

    const tgl = new Date(tanggal);

    // Isolated transaction with pessimistic stock validation
    try {
      const createdRecords = await prisma.$transaction(async (tx) => {
        const records = [];

        for (const item of items) {
          const idBarang = Number(item.id_barang);
          const jumlah = Number(item.jumlah);

          // Get item and check current real-time stock
          const barang = await tx.barang.findUnique({
            where: { id_barang: idBarang },
          });

          if (!barang) {
            throw new Error(`Barang dengan ID ${idBarang} tidak ditemukan`);
          }

          // Strict validation: cannot be negative or exceed available stock
          if (barang.stok < jumlah) {
            throw new InsufficientStockError(idBarang, barang.nama_barang, barang.stok, jumlah);
          }

          // Atomically decrement stock
          await tx.barang.update({
            where: { id_barang: idBarang },
            data: {
              stok: { decrement: jumlah },
            },
          });

          // Insert transaction record
          const record = await tx.barangKeluar.create({
            data: {
              tanggal: tgl,
              id_barang: idBarang,
              jumlah,
              id_divisi: Number(id_divisi),
              id_user: userId,
              keterangan: item.keterangan || null,
            },
            include: {
              barang: true,
              divisi: true,
            },
          });

          records.push(record);
        }

        return records;
      });

      return sendSuccess(
        res,
        createdRecords,
        "Transaksi pengeluaran barang berhasil disimpan",
        201
      );
    } catch (txError: any) {
      if (txError instanceof InsufficientStockError) {
        return sendError(res, "INSUFFICIENT_STOCK", txError.message, 422, {
          id_barang: txError.id_barang,
          nama_barang: txError.nama_barang,
          stok_tersedia: txError.stok_tersedia,
          jumlah_diminta: txError.jumlah_diminta,
        });
      }
      throw txError;
    }
  } catch (error) {
    next(error);
  }
};

export const getBarangKeluarList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date, id_divisi, id_barang, page, limit } = req.query;

    const where: any = {};

    if (start_date || end_date) {
      where.tanggal = {};
      if (start_date) where.tanggal.gte = new Date(start_date as string);
      if (end_date) where.tanggal.lte = new Date(end_date as string);
    }

    if (id_divisi) {
      where.id_divisi = Number(id_divisi);
    }

    if (id_barang) {
      where.id_barang = Number(id_barang);
    }

    const take = limit ? Number(limit) : undefined;
    const skip = page && limit ? (Number(page) - 1) * Number(limit) : undefined;

    const [total, items] = await Promise.all([
      prisma.barangKeluar.count({ where }),
      prisma.barangKeluar.findMany({
        where,
        take,
        skip,
        include: {
          barang: {
            select: {
              id_barang: true,
              kode_barang: true,
              nama_barang: true,
              satuan: true,
            },
          },
          divisi: {
            select: {
              id_divisi: true,
              nama_divisi: true,
            },
          },
          user: {
            select: {
              id_user: true,
              nama: true,
              username: true,
            },
          },
        },
        orderBy: [{ tanggal: "desc" }, { id_keluar: "desc" }],
      }),
    ]);

    return sendSuccess(res, {
      items,
      total,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : total,
    });
  } catch (error) {
    next(error);
  }
};
