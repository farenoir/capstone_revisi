import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "../../api/client";
import { Barang, Supplier } from "../../types";
import { useToast } from "../../components/common/Toast";
import { Plus, Trash2, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

interface RowItem {
  id_barang: string;
  jumlah: number;
  keterangan: string;
}

export const InputBarangMasukPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [idSupplier, setIdSupplier] = useState("");
  const [namaPetugas, setNamaPetugas] = useState("Budi Santoso");
  const [items, setItems] = useState<RowItem[]>([
    { id_barang: "", jumlah: 1, keterangan: "" },
  ]);

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [bRes, sRes] = await Promise.all([
          apiClient.get("/barang"),
          apiClient.get("/supplier"),
        ]);
        setBarangList(bRes.data.data.items);
        setSupplierList(sRes.data.data);
        if (sRes.data.data.length > 0) {
          setIdSupplier(sRes.data.data[0].id_supplier.toString());
        }
      } catch (err) {
        console.error(err);
        showToast("Gagal memuat referensi supplier atau barang", "error");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!idSupplier) {
      setSubmitError("Pilih supplier terlebih dahulu");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].id_barang) {
        setSubmitError(`Baris #${i + 1}: Silakan pilih barang ATK.`);
        return;
      }
      if (items[i].jumlah <= 0) {
        setSubmitError(`Baris #${i + 1}: Kuantitas barang masuk harus lebih dari 0.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await apiClient.post("/transaksi/barang-masuk", {
        tanggal,
        id_supplier: Number(idSupplier),
        nama_petugas: namaPetugas.trim() || "Budi Santoso",
        items: items.map((it) => ({
          id_barang: Number(it.id_barang),
          jumlah: Number(it.jumlah),
          keterangan: it.keterangan.trim() || undefined,
        })),
      });

      showToast(res.data.message || "Transaksi barang masuk berhasil dicatat");
      navigate("/barang-masuk");
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.error?.message ||
          "Gagal menyimpan transaksi masuk. Pastikan koneksi database tersedia."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-indigo-600" />
        <span>Memuat data supplier dan barang...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/barang-masuk"
          className="rounded-lg p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors focus:ring-2 focus:ring-indigo-600"
          title="Kembali ke Riwayat"
          aria-label="Kembali ke Riwayat Barang Masuk"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Form Penerimaan Barang Masuk
          </h1>
          <p className="text-sm text-slate-500">
            Input transaksi penerimaan ATK dari vendor/supplier untuk penambahan stok fisik.
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
            Informasi Dokumen Penerimaan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Tanggal Penerimaan
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
                Supplier / Vendor
              </label>
              <select
                required
                value={idSupplier}
                onChange={(e) => setIdSupplier(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
              >
                <option value="">Pilih Supplier</option>
                {supplierList.map((s) => (
                  <option key={s.id_supplier} value={s.id_supplier}>
                    {s.nama_supplier}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Yang Menaruh Stok
              </label>
              <input
                type="text"
                required
                value={namaPetugas}
                onChange={(e) => setNamaPetugas(e.target.value)}
                placeholder="Contoh: Budi Santoso / Ahmad Fauzi"
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Item Rows */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                Daftar Barang Masuk (Multi-Item)
              </h2>
              <p className="text-xs text-slate-500">
                Tambahkan satu atau lebih item barang yang diterima ke gudang ATK.
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

          <div className="space-y-3">
            {items.map((row, idx) => {
              const selectedBarang = barangList.find(
                (b) => b.id_barang.toString() === row.id_barang
              );

              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50"
                >
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Barang ATK #{idx + 1}
                    </label>
                    <select
                      required
                      value={row.id_barang}
                      onChange={(e) => updateRow(idx, "id_barang", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
                    >
                      <option value="">-- Pilih Barang --</option>
                      {barangList.map((b) => (
                        <option key={b.id_barang} value={b.id_barang}>
                          [{b.kode_barang}] {b.nama_barang} (Stok Saat Ini: {b.stok} {b.satuan})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-32">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Jumlah {selectedBarang ? `(${selectedBarang.satuan})` : ""}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={row.jumlah}
                      onChange={(e) => updateRow(idx, "jumlah", Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Keterangan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Pengadaan rutin bulanan / Drop barang"
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
            to="/barang-masuk"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px] flex items-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 min-h-[44px] focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan Mutasi...</span>
              </>
            ) : (
              <span>Simpan Transaksi Masuk</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
