import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  ArrowRight,
  Database,
  BarChart3,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  ShieldCheck,
  Clock,
  ChevronRight,
  LogIn,
  LayoutDashboard,
  Check,
} from "lucide-react";
import { apiClient } from "../../api/client";

interface QuickItem {
  id_barang: number;
  kode_barang: string;
  nama_barang: string;
  kategori: { nama_kategori: string };
  satuan: string;
  stok: number;
  stok_minimum: number;
  harga_satuan?: number;
  expired_date?: string | null;
}

export const LandingPage: React.FC = () => {
  const [items, setItems] = useState<QuickItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    const fetchQuickItems = async () => {
      try {
        const res = await apiClient.get("/barang", { params: { limit: 100 } });
        setItems(res.data.data.items || []);
      } catch (err) {
        console.error("Gagal memuat katalog barang:", err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchQuickItems();
  }, []);

  const categories = ["Semua", ...Array.from(new Set(items.map((i) => i.kategori?.nama_kategori).filter(Boolean)))];

  const filteredItems = items
    .filter((item) => activeCategory === "Semua" || item.kategori?.nama_kategori === activeCategory)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Boxes className="h-6 w-6" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  SIM-ATK
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Pencatatan Barang Masuk & Keluar
                </span>
              </div>
            </div>

            {/* Nav Menu */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#fitur" className="hover:text-indigo-600 transition-colors">
                Modul Sistem
              </a>
              <a href="#katalog" className="hover:text-indigo-600 transition-colors">
                Katalog ATK
              </a>
              <a href="#laporan" className="hover:text-indigo-600 transition-colors">
                Saldo Akhir
              </a>
              <Link to="/diagram-database" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Database className="h-4 w-4 text-indigo-600" />
                <span>Diagram DB XAMPP</span>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/diagram-database"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Database className="h-3.5 w-3.5" />
                <span>Diagram DB</span>
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Buka Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Masuk / Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-white to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span>Laporan Akhir / Tugas 3 • Sistem Informasi ATK</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Sistem Informasi Pencatatan Barang Masuk dan Keluar ATK
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              Platform inventaris terintegrasi untuk mencatat riwayat penerimaan barang dari supplier, memvalidasi
              distribusi pengeluaran ke divisi kerja, memantau batas stok kritis &amp; kedaluwarsa, serta menyusun
              laporan saldo akhir otomatis.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all hover:translate-y-[-1px]"
              >
                <span>{isAuthenticated ? "Masuk ke Dashboard Operasional" : "Masuk ke Sistem Aplikasi"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/diagram-database"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors"
              >
                <Database className="h-4 w-4 text-indigo-600" />
                <span>Lihat Diagram Database XAMPP</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200">
              <div>
                <div className="text-2xl font-bold text-slate-900 font-mono">50 Item</div>
                <div className="text-xs text-slate-500 mt-0.5">Master Data ATK Riil</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 font-mono">6 Kategori</div>
                <div className="text-xs text-slate-500 mt-0.5">Kelompok Inventaris</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-700 font-mono">100% Real-time</div>
                <div className="text-xs text-slate-500 mt-0.5">Mutasi &amp; Saldo Akhir</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-700 font-mono">7 Tabel</div>
                <div className="text-xs text-slate-500 mt-0.5">Relasi MySQL Capstone</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modul Sistem Section */}
      <section id="fitur" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Struktur Fitur Aplikasi
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Cakupan Modul Tugas 3 &amp; Laporan Akhir
            </h3>
            <p className="mt-3 text-sm text-slate-500">
              Komponen sistem informasi pencatatan inventaris yang dirancang sesuai alur kerja operasional pergudangan ATK.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Halaman Depan */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Boxes className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">1. Halaman Depan (Landing Page)</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Portal informasi publik sistem inventaris ATK, menyajikan katalog komoditas, alur transaksi,
                serta gerbang navigasi menuju modul operasional.
              </p>
              <div className="text-xs font-semibold text-indigo-600 inline-flex items-center gap-1">
                <span>Halaman Aktif Ini</span>
                <Check className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* 2. Halaman Login */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">2. Halaman Login &amp; Autentikasi</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Autentikasi akun pengguna berbasis JWT dengan kontrol otorisasi ganda: peran <strong>Admin</strong> (hak input &amp; kelola) dan <strong>Pimpinan</strong> (monitoring &amp; laporan).
              </p>
              <Link to="/login" className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                <span>Buka Form Login</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* 3. Dashboard */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">3. Dashboard Operasional</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Monitoring metrik inventaris secara visual, grafik tren mutasi mingguan, ringkasan transaksi terbaru, serta tabel peringatan dini stok kritis.
              </p>
              <Link to="/dashboard" className="text-xs font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1">
                <span>Akses Dashboard</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* 4. Transaksi Barang Masuk */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">4. Transaksi Barang Masuk</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Pencatatan penerimaan pengadaan ATK dari supplier rekanan dengan penambahan kuantitas stok otomatis dan penerbitan nomor referensi dokumen.
              </p>
              <Link to="/barang-masuk" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
                <span>Lihat Data Barang Masuk</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* 5. Transaksi Barang Keluar */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">5. Transaksi Barang Keluar</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Pencatatan distribusi ATK ke divisi atau unit kerja pemohon dengan validasi ketat batas kuantitas agar stok gudang tidak minus.
              </p>
              <Link to="/barang-keluar" className="text-xs font-semibold text-rose-700 hover:text-rose-800 inline-flex items-center gap-1">
                <span>Lihat Data Barang Keluar</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* 6. Riwayat Laporan Saldo Akhir */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">6. Riwayat Laporan Saldo Akhir</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Audit saldo persediaan barang, akumulasi mutasi masuk dan keluar, valuasi total nilai inventaris (Rp), serta fitur ekspor format Excel (.xlsx) &amp; CSV.
              </p>
              <Link to="/laporan" className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1">
                <span>Buka Laporan Saldo Akhir</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Katalog Barang Preview Section */}
      <section id="katalog" className="py-16 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                Data Riil Gudang ATK
              </h2>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                Katalog Produk &amp; Informasi Kedaluwarsa
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Data diambil langsung dari database MySQL capstone hasil impor Data_Barang_Gudang_ATK.xlsx.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {loadingItems ? (
            <div className="text-center py-12 text-xs text-slate-500">Memuat katalog barang...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id_barang}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {item.kode_barang}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.kategori?.nama_kategori}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2">
                      {item.nama_barang}
                    </h4>

                    {item.harga_satuan && item.harga_satuan > 0 ? (
                      <div className="text-xs font-semibold text-slate-700 mb-2">
                        Rp {item.harga_satuan.toLocaleString("id-ID")} / {item.satuan}
                      </div>
                    ) : null}

                    {item.expired_date && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold mb-2">
                        <Clock className="h-3 w-3" />
                        <span>Kedaluwarsa: {item.expired_date.split("T")[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Stok Tersedia:</span>
                    <span
                      className={`font-bold tabular-nums ${
                        item.stok <= item.stok_minimum ? "text-amber-600" : "text-slate-900"
                      }`}
                    >
                      {item.stok} {item.satuan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/barang"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <span>Kelola seluruh 50 data master ATK di Master Data Barang</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Diagram Database Showcase Section */}
      <section id="database" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-xl overflow-hidden relative">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4">
                <Database className="h-3.5 w-3.5" />
                <span>Skema Relasional MySQL (XAMPP phpMyAdmin Designer)</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
                Diagram Hubungan Antar Tabel Basis Data
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Database <strong>capstone</strong> memiliki 7 tabel yang dinormalisasi dengan integritas referensial foreign key:
                <code className="text-indigo-200 mx-1">users</code>,
                <code className="text-indigo-200 mx-1">kategori</code>,
                <code className="text-indigo-200 mx-1">supplier</code>,
                <code className="text-indigo-200 mx-1">divisi</code>,
                <code className="text-indigo-200 mx-1">barang</code>,
                <code className="text-indigo-200 mx-1">barang_masuk</code>, dan
                <code className="text-indigo-200 mx-1">barang_keluar</code>.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/diagram-database"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-md transition-colors"
                >
                  <Database className="h-4 w-4" />
                  <span>Buka Mode phpMyAdmin Designer Interaktif</span>
                </Link>

                <a
                  href="/diagram-database"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-colors"
                >
                  <span>Unduh Tangkapan Layar (PNG)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Akun Demo / Reviewer Helper */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto">
            <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Informasi Kredensial Pengujian (Laporan / Evaluasi Tugas 3)</span>
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Gunakan akun berikut untuk menguji fitur operasional pada Halaman Login:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Peran: Administrator Gudang</div>
                <div className="text-slate-600">Username: <code className="bg-white px-1.5 py-0.5 rounded border font-bold">admin</code></div>
                <div className="text-slate-600 mt-0.5">Password: <code className="bg-white px-1.5 py-0.5 rounded border font-bold">admin123</code></div>
                <div className="text-[11px] text-slate-400 mt-2">Hak Akses: Penuh (Master Data, Transaksi Masuk/Keluar, Laporan)</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Peran: Pimpinan / Manajer</div>
                <div className="text-slate-600">Username: <code className="bg-white px-1.5 py-0.5 rounded border font-bold">pimpinan</code></div>
                <div className="text-slate-600 mt-0.5">Password: <code className="bg-white px-1.5 py-0.5 rounded border font-bold">pimpinan123</code></div>
                <div className="text-[11px] text-slate-400 mt-2">Hak Akses: Monitoring Dashboard &amp; Ekspor Rekapitulasi Saldo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Sistem Informasi Pencatatan Barang Masuk dan Keluar ATK.
          </div>
          <div className="mt-2 sm:mt-0 flex justify-center gap-4">
            <Link to="/diagram-database" className="hover:text-indigo-600">
              Diagram Database
            </Link>
            <Link to="/login" className="hover:text-indigo-600">
              Halaman Login
            </Link>
            <Link to="/dashboard" className="hover:text-indigo-600">
              Dashboard
            </Link>
            <Link to="/laporan" className="hover:text-indigo-600">
              Laporan Saldo Akhir
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
