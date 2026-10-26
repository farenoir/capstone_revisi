import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/db";
import { sendSuccess, sendError } from "../utils/apiResponse";

// ==========================================
// MASTER BARANG
// ==========================================
export const getAllBarang = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, id_kategori, page, limit } = req.query;

    const where: any = {};

    if (search && typeof search === "string" && search.trim() !== "") {
      where.OR = [
        { kode_barang: { contains: search.trim() } },
        { nama_barang: { contains: search.trim() } },
      ];
    }

    if (id_kategori) {
      where.id_kategori = Number(id_kategori);
    }

    const take = limit ? Number(limit) : undefined;
    const skip = page && limit ? (Number(page) - 1) * Number(limit) : undefined;

    const [total, items] = await Promise.all([
      prisma.barang.count({ where }),
      prisma.barang.findMany({
        where,
        take,
        skip,
        include: {
          kategori: {
            select: { id_kategori: true, nama_kategori: true },
          },
        },
        orderBy: { kode_barang: "asc" },
      }),
    ]);

    const itemsWithStatus = items.map((b) => ({
      ...b,
      status_stok: b.stok <= b.stok_minimum ? "kritis" : "aman",
    }));

    return sendSuccess(res, {
      items: itemsWithStatus,
      total,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : total,
    });
  } catch (error) {
    next(error);
  }
};

export const getBarangById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.barang.findUnique({
      where: { id_barang: id },
      include: {
        kategori: true,
      },
    });

    if (!item) {
      return sendError(res, "NOT_FOUND", "Data barang tidak ditemukan", 404);
    }

    return sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
};

export const createBarang = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      kode_barang,
      nama_barang,
      id_kategori,
      satuan,
      stok,
      stok_minimum,
      harga_satuan,
      expired_date,
      lokasi,
    } = req.body;

    const existing = await prisma.barang.findUnique({
      where: { kode_barang },
    });

    if (existing) {
      return sendError(res, "DUPLICATE_CODE", `Kode barang '${kode_barang}' sudah digunakan`, 409);
    }

    const newItem = await prisma.barang.create({
      data: {
        kode_barang,
        nama_barang,
        id_kategori: Number(id_kategori),
        satuan,
        stok: Number(stok) || 0,
        stok_minimum: Number(stok_minimum) || 0,
        harga_satuan: Number(harga_satuan) || 0,
        expired_date: expired_date ? new Date(expired_date) : null,
        lokasi: lokasi || null,
      },
      include: {
        kategori: true,
      },
    });

    return sendSuccess(res, newItem, "Barang berhasil ditambahkan", 201);
  } catch (error) {
    next(error);
  }
};

export const updateBarang = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const {
      kode_barang,
      nama_barang,
      id_kategori,
      satuan,
      stok_minimum,
      harga_satuan,
      expired_date,
      lokasi,
    } = req.body;

    if (kode_barang) {
      const existing = await prisma.barang.findFirst({
        where: {
          kode_barang,
          NOT: { id_barang: id },
        },
      });
      if (existing) {
        return sendError(res, "DUPLICATE_CODE", `Kode barang '${kode_barang}' sudah digunakan`, 409);
      }
    }

    const updated = await prisma.barang.update({
      where: { id_barang: id },
      data: {
        ...(kode_barang && { kode_barang }),
        ...(nama_barang && { nama_barang }),
        ...(id_kategori && { id_kategori: Number(id_kategori) }),
        ...(satuan && { satuan }),
        ...(stok_minimum !== undefined && { stok_minimum: Number(stok_minimum) }),
        ...(harga_satuan !== undefined && { harga_satuan: Number(harga_satuan) }),
        ...(expired_date !== undefined && {
          expired_date: expired_date ? new Date(expired_date) : null,
        }),
        ...(lokasi !== undefined && { lokasi }),
      },
      include: {
        kategori: true,
      },
    });

    return sendSuccess(res, updated, "Data barang berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

export const deleteBarang = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    // Check if item has transactions
    const [masukCount, keluarCount] = await Promise.all([
      prisma.barangMasuk.count({ where: { id_barang: id } }),
      prisma.barangKeluar.count({ where: { id_barang: id } }),
    ]);

    if (masukCount > 0 || keluarCount > 0) {
      return sendError(
        res,
        "FOREIGN_KEY_RESTRICT",
        "Barang tidak dapat dihapus karena telah memiliki riwayat transaksi masuk/keluar",
        409,
        { masukCount, keluarCount }
      );
    }

    await prisma.barang.delete({
      where: { id_barang: id },
    });

    return sendSuccess(res, { id_barang: id }, "Barang berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MASTER KATEGORI
// ==========================================
export const getAllKategori = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await prisma.kategori.findMany({
      include: {
        _count: {
          select: { barang: true },
        },
      },
      orderBy: { nama_kategori: "asc" },
    });
    return sendSuccess(res, list);
  } catch (error) {
    next(error);
  }
};

export const createKategori = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nama_kategori } = req.body;
    const existing = await prisma.kategori.findUnique({
      where: { nama_kategori },
    });
    if (existing) {
      return sendError(res, "DUPLICATE_CATEGORY", `Kategori '${nama_kategori}' sudah ada`, 409);
    }
    const item = await prisma.kategori.create({
      data: { nama_kategori },
    });
    return sendSuccess(res, item, "Kategori berhasil ditambahkan", 201);
  } catch (error) {
    next(error);
  }
};

export const updateKategori = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { nama_kategori } = req.body;
    const existing = await prisma.kategori.findFirst({
      where: {
        nama_kategori,
        NOT: { id_kategori: id },
      },
    });
    if (existing) {
      return sendError(res, "DUPLICATE_CATEGORY", `Kategori '${nama_kategori}' sudah ada`, 409);
    }
    const updated = await prisma.kategori.update({
      where: { id_kategori: id },
      data: { nama_kategori },
    });
    return sendSuccess(res, updated, "Kategori berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

export const deleteKategori = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const count = await prisma.barang.count({ where: { id_kategori: id } });
    if (count > 0) {
      return sendError(
        res,
        "FOREIGN_KEY_RESTRICT",
        "Kategori tidak dapat dihapus karena masih digunakan oleh beberapa data barang",
        409
      );
    }
    await prisma.kategori.delete({ where: { id_kategori: id } });
    return sendSuccess(res, { id_kategori: id }, "Kategori berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MASTER SUPPLIER
// ==========================================
export const getAllSupplier = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await prisma.supplier.findMany({
      include: {
        _count: {
          select: { barang_masuk: true },
        },
      },
      orderBy: { nama_supplier: "asc" },
    });
    return sendSuccess(res, list);
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nama_supplier, alamat, telepon } = req.body;
    const item = await prisma.supplier.create({
      data: {
        nama_supplier,
        alamat: alamat || null,
        telepon: telepon || null,
      },
    });
    return sendSuccess(res, item, "Supplier berhasil ditambahkan", 201);
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { nama_supplier, alamat, telepon } = req.body;
    const updated = await prisma.supplier.update({
      where: { id_supplier: id },
      data: {
        ...(nama_supplier && { nama_supplier }),
        ...(alamat !== undefined && { alamat }),
        ...(telepon !== undefined && { telepon }),
      },
    });
    return sendSuccess(res, updated, "Supplier berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const count = await prisma.barangMasuk.count({ where: { id_supplier: id } });
    if (count > 0) {
      return sendError(
        res,
        "FOREIGN_KEY_RESTRICT",
        "Supplier tidak dapat dihapus karena memiliki riwayat transaksi barang masuk",
        409
      );
    }
    await prisma.supplier.delete({ where: { id_supplier: id } });
    return sendSuccess(res, { id_supplier: id }, "Supplier berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MASTER DIVISI
// ==========================================
export const getAllDivisi = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await prisma.divisi.findMany({
      include: {
        _count: {
          select: { barang_keluar: true },
        },
      },
      orderBy: { nama_divisi: "asc" },
    });
    return sendSuccess(res, list);
  } catch (error) {
    next(error);
  }
};

export const createDivisi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nama_divisi } = req.body;
    const existing = await prisma.divisi.findUnique({
      where: { nama_divisi },
    });
    if (existing) {
      return sendError(res, "DUPLICATE_DIVISI", `Divisi '${nama_divisi}' sudah ada`, 409);
    }
    const item = await prisma.divisi.create({
      data: { nama_divisi },
    });
    return sendSuccess(res, item, "Divisi berhasil ditambahkan", 201);
  } catch (error) {
    next(error);
  }
};

export const updateDivisi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { nama_divisi } = req.body;
    const existing = await prisma.divisi.findFirst({
      where: {
        nama_divisi,
        NOT: { id_divisi: id },
      },
    });
    if (existing) {
      return sendError(res, "DUPLICATE_DIVISI", `Divisi '${nama_divisi}' sudah ada`, 409);
    }
    const updated = await prisma.divisi.update({
      where: { id_divisi: id },
      data: { nama_divisi },
    });
    return sendSuccess(res, updated, "Divisi berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

export const deleteDivisi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const count = await prisma.barangKeluar.count({ where: { id_divisi: id } });
    if (count > 0) {
      return sendError(
        res,
        "FOREIGN_KEY_RESTRICT",
        "Divisi tidak dapat dihapus karena memiliki riwayat transaksi barang keluar",
        409
      );
    }
    await prisma.divisi.delete({ where: { id_divisi: id } });
    return sendSuccess(res, { id_divisi: id }, "Divisi berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
