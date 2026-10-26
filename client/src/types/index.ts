export type Role = "admin" | "pimpinan";

export interface User {
  id_user: number;
  nama: string;
  username: string;
  role: Role;
}

export interface Kategori {
  id_kategori: number;
  nama_kategori: string;
  _count?: { barang: number };
}

export interface Supplier {
  id_supplier: number;
  nama_supplier: string;
  alamat?: string | null;
  telepon?: string | null;
  _count?: { barang_masuk: number };
}

export interface Divisi {
  id_divisi: number;
  nama_divisi: string;
  _count?: { barang_keluar: number };
}

export interface Barang {
  id_barang: number;
  kode_barang: string;
  nama_barang: string;
  id_kategori: number;
  satuan: string;
  stok: number;
  stok_minimum: number;
  harga_satuan?: number;
  expired_date?: string | null;
  lokasi?: string | null;
  kategori: {
    id_kategori: number;
    nama_kategori: string;
  };
  status_stok?: "kritis" | "aman";
}

export interface BarangMasukItem {
  id_barang: number;
  jumlah: number;
  keterangan?: string;
}

export interface BarangMasukRecord {
  id_masuk: number;
  tanggal: string;
  id_barang: number;
  jumlah: number;
  id_supplier: number;
  id_user: number;
  keterangan?: string | null;
  barang: {
    id_barang: number;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
  };
  supplier: {
    id_supplier: number;
    nama_supplier: string;
  };
  user: {
    id_user: number;
    nama: string;
    username: string;
  };
}

export interface BarangKeluarRecord {
  id_keluar: number;
  tanggal: string;
  id_barang: number;
  jumlah: number;
  id_divisi: number;
  id_user: number;
  keterangan?: string | null;
  barang: {
    id_barang: number;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
  };
  divisi: {
    id_divisi: number;
    nama_divisi: string;
  };
  user: {
    id_user: number;
    nama: string;
    username: string;
  };
}

export interface DashboardSummary {
  total_barang: number;
  total_masuk_bulan_ini: number;
  total_keluar_bulan_ini: number;
  total_kritis: number;
  monthly_trend: Array<{
    bulan: string;
    masuk: number;
    keluar: number;
  }>;
}

export interface LowStockItem {
  id_barang: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  stok: number;
  stok_minimum: number;
  satuan: string;
  lokasi: string;
  expired_date?: string | null;
  status: string;
}

export interface MutasiReportRow {
  id: string;
  tanggal: string;
  jenis: "Masuk" | "Keluar";
  pihak: string;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  jumlah: number;
  satuan: string;
  petugas: string;
  keterangan: string;
}

export interface SaldoAkhirRow {
  id_barang: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  satuan: string;
  total_masuk: number;
  total_keluar: number;
  saldo_akhir: number;
  stok_minimum: number;
  harga_satuan: number;
  nilai_saldo_akhir: number;
  expired_date?: string | null;
  lokasi?: string | null;
  status_stok: "aman" | "kritis" | "habis";
}

export interface SaldoAkhirSummary {
  total_item: number;
  total_stok_unit: number;
  total_nilai_persediaan: number;
  total_kritis: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
