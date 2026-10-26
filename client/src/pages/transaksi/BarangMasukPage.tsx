import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/client";
import { BarangMasukRecord, Supplier } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Plus, ArrowDownToLine, Filter, Calendar } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const BarangMasukPage: React.FC = () => {
  const [list, setList] = useState<BarangMasukRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { isAdmin } = useAuthStore();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const [recRes, supRes] = await Promise.all([
        apiClient.get("/transaksi/barang-masuk", {
          params: {
            id_supplier: selectedSupplier || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
          },
        }),
        apiClient.get("/supplier"),
      ]);
      setList(recRes.data.data.items);
      setSuppliers(supRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedSupplier, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Riwayat Barang Masuk
          </h1>
          <p className="text-sm text-slate-500">
            Catatan transaksi penerimaan ATK dari supplier beserta penambahan stok otomatis.
          </p>
        </div>
        {isAdmin() && (
          <Link
            to="/barang-masuk/baru"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Input Transaksi Masuk</span>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full sm:w-60 rounded-lg border border-slate-300 py-1.5 px-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">Semua Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id_supplier} value={s.id_supplier}>
                {s.nama_supplier}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-slate-300 py-1.5 px-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
          <span className="text-xs text-slate-400">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-slate-300 py-1.5 px-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        {(selectedSupplier || startDate || endDate) && (
          <button
            onClick={() => {
              setSelectedSupplier("");
              setStartDate("");
              setEndDate("");
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline ml-auto"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Memuat transaksi barang masuk..." />
        ) : list.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Belum Ada Transaksi Masuk"
              description="Catat penerimaan barang baru dari supplier untuk menambah stok barang."
              actionText={isAdmin() ? "Input Transaksi Masuk" : undefined}
              onAction={isAdmin() ? () => (window.location.href = "/barang-masuk/baru") : undefined}
              icon={<ArrowDownToLine className="h-6 w-6 text-emerald-600" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">No. Dokumen</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Supplier</th>
                  <th className="px-6 py-3">Barang ATK</th>
                  <th className="px-6 py-3 text-right">Jumlah Masuk</th>
                  <th className="px-6 py-3">Petugas Pencatat</th>
                  <th className="px-6 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {list.map((rec) => (
                  <tr key={rec.id_masuk} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3.5 font-mono text-xs font-semibold text-emerald-700">
                      BM-{rec.id_masuk.toString().padStart(5, "0")}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {new Date(rec.tanggal).toISOString().split("T")[0]}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {rec.supplier.nama_supplier}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-900">{rec.barang.nama_barang}</div>
                      <div className="font-mono text-xs text-slate-500">
                        {rec.barang.kode_barang}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-emerald-600 tabular-nums">
                      +{rec.jumlah} {rec.barang.satuan}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{rec.user.nama}</td>
                    <td className="px-6 py-3.5 text-slate-500 text-xs">
                      {rec.keterangan || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
