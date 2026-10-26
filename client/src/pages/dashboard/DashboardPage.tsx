import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/client";
import { DashboardSummary, LowStockItem } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Home,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAdmin } = useAuthStore();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, alertRes] = await Promise.all([
        apiClient.get("/dashboard/summary"),
        apiClient.get("/dashboard/low-stock"),
      ]);
      setSummary(sumRes.data.data);
      setLowStock(alertRes.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          "Gagal memuat data dashboard. Periksa koneksi backend dan database."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Memuat metrik inventaris..." />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <h3 className="font-semibold text-base mb-1">Gagal Memuat Dashboard</h3>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Kembali ke Halaman Depan</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Inventaris</h1>
          <p className="text-sm text-slate-500">
            Ringkasan posisi stok, mutasi bulan berjalan, dan peringatan batas minimum.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/"
            title="Kembali ke Halaman Depan Sistem"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-xs"
          >
            <Home className="h-4 w-4 text-indigo-600" />
            <span>Halaman Depan</span>
          </Link>
          {isAdmin() && (
            <>
              <Link
                to="/barang-masuk/baru"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                <ArrowDownToLine className="h-4 w-4" />
                <span>Input Masuk</span>
              </Link>
              <Link
                to="/barang-keluar/baru"
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
              >
                <ArrowUpFromLine className="h-4 w-4" />
                <span>Input Keluar</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Barang */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Jenis ATK
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-700">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {summary?.total_barang || 0}
            </span>
            <span className="text-xs text-slate-500">item terdaftar</span>
          </div>
          <Link
            to="/barang"
            className="mt-3 inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            Lihat katalog master <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        {/* Barang Masuk Bulan Ini */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Barang Masuk (Bulan Ini)
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {summary?.total_masuk_bulan_ini || 0}
            </span>
            <span className="text-xs text-slate-500">unit diterima</span>
          </div>
          <Link
            to="/barang-masuk"
            className="mt-3 inline-flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-800"
          >
            Riwayat penerimaan <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        {/* Barang Keluar Bulan Ini */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Barang Keluar (Bulan Ini)
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <ArrowUpFromLine className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {summary?.total_keluar_bulan_ini || 0}
            </span>
            <span className="text-xs text-slate-500">unit didistribusikan</span>
          </div>
          <Link
            to="/barang-keluar"
            className="mt-3 inline-flex items-center text-xs font-medium text-amber-700 hover:text-amber-900"
          >
            Riwayat pengeluaran <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        {/* Status Kritis */}
        <div
          className={`rounded-xl border p-5 shadow-sm ${
            (summary?.total_kritis || 0) > 0
              ? "border-red-200 bg-red-50/50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Stok Kritis / Menipis
            </span>
            <div
              className={`rounded-lg p-2 ${
                (summary?.total_kritis || 0) > 0
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold tabular-nums ${
                (summary?.total_kritis || 0) > 0 ? "text-red-700" : "text-slate-900"
              }`}
            >
              {summary?.total_kritis || 0}
            </span>
            <span className="text-xs text-slate-500">item di bawah ambang</span>
          </div>
          <span className="mt-3 block text-xs font-medium text-slate-500">
            Perlu pengadaan ulang
          </span>
        </div>
      </div>

      {/* Low Stock Alert Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-semibold text-slate-800">
              Peringatan Stok Minimum (Perlu Restok)
            </h2>
          </div>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            {lowStock.length} barang
          </span>
        </div>

        {lowStock.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Semua Stok dalam Kondisi Aman"
              description="Tidak ada barang ATK yang mencapai atau berada di bawah ambang stok minimum."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Kode</th>
                  <th className="px-6 py-3">Nama Barang</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3 text-right">Sisa Stok</th>
                  <th className="px-6 py-3 text-right">Stok Min</th>
                  <th className="px-6 py-3">Expired Date</th>
                  <th className="px-6 py-3">Lokasi</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  {isAdmin() && <th className="px-6 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {lowStock.map((item) => (
                  <tr key={item.id_barang} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-700">
                      {item.kode_barang}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">{item.nama_barang}</td>
                    <td className="px-6 py-3.5 text-slate-600">{item.kategori}</td>
                    <td className="px-6 py-3.5 text-right font-bold tabular-nums text-red-600">
                      {item.stok} {item.satuan}
                    </td>
                    <td className="px-6 py-3.5 text-right text-slate-600 tabular-nums">
                      {item.stok_minimum} {item.satuan}
                    </td>
                    <td className="px-6 py-3.5">
                      {item.expired_date ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <Calendar className="h-3 w-3 text-amber-600" />
                          {new Date(item.expired_date).toISOString().split("T")[0]}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{item.lokasi}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.stok === 0
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    {isAdmin() && (
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          to="/barang-masuk/baru"
                          className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Restok <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Mutation Summary Table (6 months) */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-800">
              Rekapitulasi Mutasi 6 Bulan Terakhir
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3">Periode Bulan</th>
                <th className="px-6 py-3 text-right">Volume Barang Masuk</th>
                <th className="px-6 py-3 text-right">Volume Barang Keluar</th>
                <th className="px-6 py-3 text-right">Aktivitas Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {summary?.monthly_trend.map((row) => (
                <tr key={row.bulan} className="hover:bg-slate-50/80">
                  <td className="px-6 py-3.5 font-medium text-slate-800">{row.bulan}</td>
                  <td className="px-6 py-3.5 text-right font-medium text-emerald-600 tabular-nums">
                    +{row.masuk} unit
                  </td>
                  <td className="px-6 py-3.5 text-right font-medium text-amber-700 tabular-nums">
                    -{row.keluar} unit
                  </td>
                  <td className="px-6 py-3.5 text-right text-slate-700 tabular-nums">
                    {row.masuk + row.keluar} transaksi
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
