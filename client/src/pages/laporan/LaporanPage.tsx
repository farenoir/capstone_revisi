import React, { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { MutasiReportRow, Kategori, Supplier, Divisi } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { FileSpreadsheet, Download } from "lucide-react";
import { useToast } from "../../components/common/Toast";

export const LaporanPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<MutasiReportRow[]>([]);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [divisions, setDivisions] = useState<Divisi[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<"mutasi" | "masuk" | "keluar">("mutasi");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedKat, setSelectedKat] = useState("");
  const [selectedSup, setSelectedSup] = useState("");
  const [selectedDiv, setSelectedDiv] = useState("");

  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [kRes, sRes, dRes] = await Promise.all([
          apiClient.get("/kategori"),
          apiClient.get("/supplier"),
          apiClient.get("/divisi"),
        ]);
        setCategories(kRes.data.data);
        setSuppliers(sRes.data.data);
        setDivisions(dRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/laporan/mutasi", {
        params: {
          type: activeTab,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          id_kategori: selectedKat || undefined,
          id_supplier: selectedSup || undefined,
          id_divisi: selectedDiv || undefined,
        },
      });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat data mutasi.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, startDate, endDate, selectedKat, selectedSup, selectedDiv]);

  const handleExport = async (format: "xlsx" | "csv") => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        format,
        type: activeTab,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
        ...(selectedKat && { id_kategori: selectedKat }),
        ...(selectedSup && { id_supplier: selectedSup }),
        ...(selectedDiv && { id_divisi: selectedDiv }),
      });

      const response = await fetch(`/api/v1/laporan/export?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengunduh berkas laporan");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Mutasi_ATK_${activeTab}_${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Berkas laporan ${format.toUpperCase()} berhasil diunduh.`, "success");
    } catch (err) {
      showToast("Gagal mengunduh berkas laporan.", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Laporan Mutasi & Rekapitulasi Stok
          </h1>
          <p className="text-sm text-slate-500">
            Audit riwayat transaksi mutasi ATK dan generator ekspor spreadsheet Excel & CSV.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("xlsx")}
            disabled={downloading || data.length === 0}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => handleExport("csv")}
            disabled={downloading || data.length === 0}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("mutasi")}
          className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "mutasi"
              ? "border-indigo-600 text-indigo-700 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Semua Mutasi (Masuk & Keluar)
        </button>
        <button
          onClick={() => setActiveTab("masuk")}
          className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "masuk"
              ? "border-indigo-600 text-indigo-700 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Barang Masuk (Penerimaan)
        </button>
        <button
          onClick={() => setActiveTab("keluar")}
          className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "keluar"
              ? "border-indigo-600 text-indigo-700 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Barang Keluar (Distribusi)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Rentang Tanggal
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-1.5 px-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            />
            <span className="text-xs text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-1.5 px-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Kategori</label>
          <select
            value={selectedKat}
            onChange={(e) => setSelectedKat(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((k) => (
              <option key={k.id_kategori} value={k.id_kategori}>
                {k.nama_kategori}
              </option>
            ))}
          </select>
        </div>

        {activeTab !== "keluar" && (
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Supplier</label>
            <select
              value={selectedSup}
              onChange={(e) => setSelectedSup(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="">Semua Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id_supplier} value={s.id_supplier}>
                  {s.nama_supplier}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab !== "masuk" && (
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Divisi</label>
            <select
              value={selectedDiv}
              onChange={(e) => setSelectedDiv(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="">Semua Divisi</option>
              {divisions.map((d) => (
                <option key={d.id_divisi} value={d.id_divisi}>
                  {d.nama_divisi}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Mengagregasi data mutasi..." />
        ) : data.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Tidak Ada Data Mutasi"
              description="Tidak ditemukan riwayat mutasi untuk kriteria dan rentang tanggal yang dipilih."
              icon={<FileSpreadsheet className="h-6 w-6 text-indigo-600" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">No. Dokumen</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Jenis Mutasi</th>
                  <th className="px-6 py-3">Pihak Terkait</th>
                  <th className="px-6 py-3">Barang ATK</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3 text-right">Kuantitas</th>
                  <th className="px-6 py-3">Petugas</th>
                  <th className="px-6 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-700">
                      {row.id}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {new Date(row.tanggal).toISOString().split("T")[0]}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          row.jenis === "Masuk"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.jenis === "Masuk" ? "Barang Masuk" : "Barang Keluar"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">{row.pihak}</td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-900">{row.nama_barang}</div>
                      <div className="font-mono text-xs text-slate-500">{row.kode_barang}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{row.kategori}</td>
                    <td
                      className={`px-6 py-3.5 text-right font-bold tabular-nums ${
                        row.jenis === "Masuk" ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {row.jenis === "Masuk" ? `+${row.jumlah}` : `-${row.jumlah}`} {row.satuan}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{row.petugas}</td>
                    <td className="px-6 py-3.5 text-slate-500 text-xs">{row.keterangan}</td>
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
