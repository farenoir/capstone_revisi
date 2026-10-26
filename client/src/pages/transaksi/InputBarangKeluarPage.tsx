import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "../../api/client";
import { Barang, Divisi } from "../../types";
import { useToast } from "../../components/common/Toast";
import { Plus, Trash2, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

interface RowItem {
  id_barang: string;
  jumlah: number;
  keterangan: string;
}

export const InputBarangKeluarPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [divisiList, setDivisiList] = useState<Divisi[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [idDivisi, setIdDivisi] = useState("");
  const [items, setItems] = useState<RowItem[]>([
    { id_barang: "", jumlah: 1, keterangan: "" },
  ]);

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [bRes, dRes] = await Promise.all([
          apiClient.get("/barang"),
          apiClient.get("/divisi"),
        ]);
        setBarangList(bRes.data.data.items);
        setDivisiList(dRes.data.data);
        if (dRes.data.data.length > 0) {
          setIdDivisi(dRes.data.data[0].id_divisi.toString());
        }
      } catch (err) {
        console.error(err);
        showToast("Gagal memuat referensi divisi atau barang", "error");
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchDropdowns();
  }, []);

  const addRow = () => {
    setItems([...items, { id_barang: "", jumlah: 1, keterangan: "" }]);
  };

  const removeRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof RowItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const getRowStockStatus = (row: RowItem) => {
    if (!row.id_barang) return { valid: true, max: 0, requested: row.jumlah, nama: "", satuan: "" };
    const b = barangList.find((item) => item.id_barang.toString() === row.id_barang);
    if (!b) return { valid: true, max: 0, requested: row.jumlah, nama: "", satuan: "" };

    const valid = row.jumlah > 0 && row.jumlah <= b.stok;
    return {
      valid,
      max: b.stok,
      requested: row.jumlah,
      nama: b.nama_barang,
      satuan: b.satuan,
    };
  };

  const hasValidationErrors = items.some((row) => {
    if (!row.id_barang) return true;
    const status = getRowStockStatus(row);
    return !status.valid;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!idDivisi) {
      setSubmitError("Pilih divisi penerima terlebih dahulu");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      if (!row.id_barang) {
        setSubmitError(`Baris #${i + 1}: Silakan pilih barang ATK.`);
        return;
      }
      const stockStatus = getRowStockStatus(row);
      if (row.jumlah <= 0) {
        setSubmitError(`Baris #${i + 1}: Kuantitas barang keluar harus lebih dari 0.`);
        return;
      }
      if (!stockStatus.valid) {
        setSubmitError(
          `Baris #${i + 1}: Jumlah keluar (${row.jumlah}) melebihi stok tersedia (${stockStatus.max} ${stockStatus.satuan}) untuk barang '${stockStatus.nama}'.`
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await apiClient.post("/transaksi/barang-keluar", {
        tanggal,
        id_divisi: Number(idDivisi),
        items: items.map((it) => ({
          id_barang: Number(it.id_barang),
          jumlah: Number(it.jumlah),
          keterangan: it.keterangan.trim() || undefined,
        })),
      });

      showToast(res.data.message || "Transaksi pengeluaran barang berhasil disimpan");
      navigate("/barang-keluar");
    } catch (err: any) {
      const errData = err.response?.data?.error;
      if (errData?.code === "INSUFFICIENT_STOCK") {
        setSubmitError(
          errData.message ||
            "Stok tidak mencukupi untuk memenuhi permintaan pengeluaran barang ini."
        );
      } else {
        setSubmitError(
          errData?.message ||
            "Gagal menyimpan transaksi keluar. Pastikan koneksi server dan database tersedia."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-indigo-600" />
        <span>Memuat data divisi dan stok barang...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/barang-keluar"
          className="rounded-lg p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors focus:ring-2 focus:ring-indigo-600"
          title="Kembali ke Riwayat"
          aria-label="Kembali ke Riwayat Barang Keluar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Form Pengeluaran Barang Keluar
          </h1>
          <p className="text-sm text-slate-500">
            Pencatatan distribusi ATK ke divisi kantor dengan pengecekan ketersediaan stok fisik real-time.
          </p>
        </div>
      </div>

      {submitError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Document Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-4">
            Informasi Dokumen Pengeluaran
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Tanggal Pengeluaran
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Divisi Penerima
              </label>
              <select
                required
                value={idDivisi}
                onChange={(e) => setIdDivisi(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
              >
                <option value="">Pilih Divisi Penerima</option>
                {divisiList.map((d) => (
                  <option key={d.id_divisi} value={d.id_divisi}>
                    {d.nama_divisi}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Item Rows with Live Stock Validation */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                Daftar Barang Keluar (Multi-Item)
              </h2>
              <p className="text-xs text-slate-500">
                Kuantitas keluar wajib tidak melebihi sisa stok fisik yang tersedia.
              </p>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors min-h-[44px] focus:ring-2 focus:ring-indigo-600"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Baris</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((row, idx) => {
              const selectedBarang = barangList.find(
                (b) => b.id_barang.toString() === row.id_barang
              );
              const status = getRowStockStatus(row);
              const isOverStock = row.id_barang && !status.valid;

              return (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-lg border transition-colors ${
                    isOverStock
                      ? "border-red-300 bg-red-50/50"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-600">
                        Barang ATK #{idx + 1}
                      </label>
                      {selectedBarang && (
                        <span
                          className={`text-xs font-semibold tabular-nums ${
                            selectedBarang.stok === 0
                              ? "text-red-700 font-bold"
                              : "text-indigo-700"
                          }`}
                        >
                          Stok Tersedia: {selectedBarang.stok} {selectedBarang.satuan}
                        </span>
                      )}
                    </div>
                    <select
                      required
                      value={row.id_barang}
                      onChange={(e) => updateRow(idx, "id_barang", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
                    >
                      <option value="">-- Pilih Barang --</option>
                      {barangList.map((b) => (
                        <option key={b.id_barang} value={b.id_barang}>
                          [{b.kode_barang}] {b.nama_barang} (Sisa Stok: {b.stok} {b.satuan})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-36">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Jumlah Keluar
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={row.jumlah}
                      onChange={(e) => updateRow(idx, "jumlah", Number(e.target.value))}
                      className={`w-full rounded-lg px-3 py-2 text-sm min-h-[44px] focus:outline-none ${
                        isOverStock
                          ? "border-2 border-red-500 bg-red-50 text-red-900 font-bold focus:ring-red-500"
                          : "border border-slate-300 bg-white text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      }`}
                    />
                    {isOverStock && (
                      <p className="mt-1 text-[11px] font-semibold text-red-600">
                        Melebihi stok ({status.max})
                      </p>
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Keterangan / Keperluan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Operasional Divisi IT"
                      value={row.keterangan}
                      onChange={(e) => updateRow(idx, "keterangan", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
                    />
                  </div>

                  <div className="sm:self-end pb-1">
                    <button
                      type="button"
                      disabled={items.length === 1}
                      onClick={() => removeRow(idx)}
                      title="Hapus baris"
                      aria-label={`Hapus baris barang ke-${idx + 1}`}
                      className="rounded-lg p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 focus:ring-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to="/barang-keluar"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px] flex items-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting || hasValidationErrors}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed min-h-[44px] focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memvalidasi Stok & Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Transaksi Keluar</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
