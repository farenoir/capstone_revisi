import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";
import { BarangKeluarRecord, Divisi } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Plus, ArrowUpFromLine, Filter, Calendar } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const BarangKeluarPage: React.FC = () => {
  const [list, setList] = useState<BarangKeluarRecord[]>([]);
  const [divisions, setDivisions] = useState<Divisi[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDivisi, setSelectedDivisi] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const [recRes, divRes] = await Promise.all([
        apiClient.get("/transaksi/barang-keluar", {
          params: {
            id_divisi: selectedDivisi || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
          },
        }),
        apiClient.get("/divisi"),
      ]);
      setList(recRes.data.data.items);
      setDivisions(divRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedDivisi, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Riwayat Distribusi Barang Keluar
          </h1>
          <p className="text-sm text-slate-500">
            Catatan pengeluaran ATK per divisi dengan validasi ketersediaan stok fisik ketat.
          </p>
        </div>
        {isAdmin() && (
          <Link
            to="/barang-keluar/baru"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Input Transaksi Keluar</span>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedDivisi}
            onChange={(e) => setSelectedDivisi(e.target.value)}
            className="w-full sm:w-60 rounded-lg border border-slate-300 py-1.5 px-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">Semua Divisi Penerima</option>
            {divisions.map((d) => (
              <option key={d.id_divisi} value={d.id_divisi}>
                {d.nama_divisi}
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

        {(selectedDivisi || startDate || endDate) && (
          <button
            onClick={() => {
              setSelectedDivisi("");
              setStartDate("");
              setEndDate("");
            }}
            className="min-h-[44px] flex items-center text-xs text-slate-500 hover:text-slate-800 underline ml-auto px-2 focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Memuat transaksi barang keluar..." />
        ) : list.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Belum Ada Transaksi Keluar"
              description="Catat pengeluaran barang ATK ke divisi kantor untuk memotong stok fisik."
              actionText={isAdmin() ? "Input Transaksi Keluar" : undefined}
              onAction={isAdmin() ? () => navigate("/barang-keluar/baru") : undefined}
              icon={<ArrowUpFromLine className="h-6 w-6 text-red-600" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">No. Dokumen</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Divisi Penerima</th>
                  <th className="px-6 py-3">Barang ATK</th>
                  <th className="px-6 py-3 text-right">Jumlah Keluar</th>
                  <th className="px-6 py-3">Petugas Pencatat</th>
                  <th className="px-6 py-3">Keterangan / Keperluan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {list.map((rec) => (
                  <tr key={rec.id_keluar} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3.5 font-mono text-xs font-semibold text-red-700">
                      BK-{rec.id_keluar.toString().padStart(5, "0")}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {new Date(rec.tanggal).toISOString().split("T")[0]}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {rec.divisi.nama_divisi}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-900">{rec.barang.nama_barang}</div>
                      <div className="font-mono text-xs text-slate-500">
                        {rec.barang.kode_barang}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-red-600 tabular-nums">
                      -{rec.jumlah} {rec.barang.satuan}
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
