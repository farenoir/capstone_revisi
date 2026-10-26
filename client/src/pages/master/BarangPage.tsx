import React, { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Barang, Kategori } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Modal } from "../../components/common/Modal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { useToast } from "../../components/common/Toast";
import { Plus, Search, Edit2, Trash2, AlertCircle, Filter, X, Calendar } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const BarangPage: React.FC = () => {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedKat, setSelectedKat] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Barang | null>(null);
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Delete Confirm State
  const [itemToDelete, setItemToDelete] = useState<Barang | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    kode_barang: "",
    nama_barang: "",
    id_kategori: "",
    satuan: "",
    stok: 0,
    stok_minimum: 0,
    harga_satuan: 0,
    expired_date: "",
    lokasi: "",
  });

  const { isAdmin } = useAuthStore();
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, kRes] = await Promise.all([
        apiClient.get("/barang", {
          params: {
            search: search.trim() || undefined,
            id_kategori: selectedKat || undefined,
          },
        }),
        apiClient.get("/kategori"),
      ]);
      setBarangList(bRes.data.data.items);
      setKategoriList(kRes.data.data);
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat data barang", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedKat]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleClearSearch = () => {
    setSearch("");
    setTimeout(() => fetchData(), 0);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      kode_barang: "",
      nama_barang: "",
      id_kategori: kategoriList[0]?.id_kategori.toString() || "",
      satuan: "pcs",
      stok: 0,
      stok_minimum: 5,
      harga_satuan: 0,
      expired_date: "",
      lokasi: "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: Barang) => {
    setEditingItem(item);
    setFormData({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      id_kategori: item.id_kategori.toString(),
      satuan: item.satuan,
      stok: item.stok,
      stok_minimum: item.stok_minimum,
      harga_satuan: item.harga_satuan || 0,
      expired_date: item.expired_date ? item.expired_date.split("T")[0] : "",
      lokasi: item.lokasi || "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalLoading(true);

    try {
      if (editingItem) {
        await apiClient.put(`/barang/${editingItem.id_barang}`, {
          kode_barang: formData.kode_barang.trim(),
          nama_barang: formData.nama_barang.trim(),
          id_kategori: Number(formData.id_kategori),
          satuan: formData.satuan.trim(),
          stok_minimum: Number(formData.stok_minimum),
          harga_satuan: Number(formData.harga_satuan) || 0,
          expired_date: formData.expired_date || null,
          lokasi: formData.lokasi.trim() || null,
        });
        showToast(`Data barang '${formData.nama_barang}' berhasil diperbarui`);
      } else {
        await apiClient.post("/barang", {
          kode_barang: formData.kode_barang.trim(),
          nama_barang: formData.nama_barang.trim(),
          id_kategori: Number(formData.id_kategori),
          satuan: formData.satuan.trim(),
          stok: Number(formData.stok),
          stok_minimum: Number(formData.stok_minimum),
          harga_satuan: Number(formData.harga_satuan) || 0,
          expired_date: formData.expired_date || null,
          lokasi: formData.lokasi.trim() || null,
        });
        showToast(`Barang baru '${formData.nama_barang}' berhasil ditambahkan`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setModalError(
        err.response?.data?.error?.message || "Gagal menyimpan data barang. Periksa kembali input."
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/barang/${itemToDelete.id_barang}`);
      showToast(`Barang '${itemToDelete.nama_barang}' berhasil dihapus`);
      setItemToDelete(null);
      fetchData();
    } catch (err: any) {
      showToast(
        err.response?.data?.error?.message ||
          "Barang tidak dapat dihapus karena masih terkait riwayat transaksi mutasi.",
        "error"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Master Data Barang</h1>
          <p className="text-sm text-slate-500">
            Katalog ATK kantor, posisi stok fisik terkini, dan batas stok minimum.
          </p>
        </div>
        {isAdmin() && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors min-h-[44px] focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Barang</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama barang..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600"
              aria-label="Bersihkan pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500 shrink-0" />
          <select
            value={selectedKat}
            onChange={(e) => setSelectedKat(e.target.value)}
            className="w-full sm:w-52 rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map((k) => (
              <option key={k.id_kategori} value={k.id_kategori}>
                {k.nama_kategori}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Memuat data barang..." />
        ) : barangList.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Barang Tidak Ditemukan"
              description="Tidak ada data barang ATK yang sesuai dengan kata kunci pencarian atau kategori ini."
              actionText={isAdmin() ? "Tambah Barang Baru" : undefined}
              onAction={isAdmin() ? openAddModal : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Kode</th>
                  <th className="px-6 py-3.5">Nama Barang</th>
                  <th className="px-6 py-3.5">Kategori</th>
                  <th className="px-6 py-3.5 text-right">Stok</th>
                  <th className="px-6 py-3.5 text-right">Stok Min</th>
                  <th className="px-6 py-3.5">Satuan</th>
                  <th className="px-6 py-3.5">Expired Date</th>
                  <th className="px-6 py-3.5">Lokasi Rak</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  {isAdmin() && <th className="px-6 py-3.5 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {barangList.map((item) => (
                  <tr key={item.id_barang} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-700">
                      {item.kode_barang}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">{item.nama_barang}</td>
                    <td className="px-6 py-3.5 text-slate-600">{item.kategori.nama_kategori}</td>
                    <td
                      className={`px-6 py-3.5 text-right font-bold tabular-nums ${
                        item.stok <= item.stok_minimum ? "text-red-600" : "text-slate-900"
                      }`}
                    >
                      {item.stok}
                    </td>
                    <td className="px-6 py-3.5 text-right text-slate-500 tabular-nums">
                      {item.stok_minimum}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{item.satuan}</td>
                    <td className="px-6 py-3.5">
                      {item.expired_date ? (
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                          <Calendar className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>{new Date(item.expired_date).toISOString().split("T")[0]}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{item.lokasi || "-"}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.stok <= item.stok_minimum
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {item.stok <= item.stok_minimum ? "Kritis" : "Aman"}
                      </span>
                    </td>
                    {isAdmin() && (
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            title={`Edit ${item.nama_barang}`}
                            aria-label={`Edit ${item.nama_barang}`}
                            className="rounded-lg p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors focus:ring-2 focus:ring-indigo-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            title={`Hapus ${item.nama_barang}`}
                            aria-label={`Hapus ${item.nama_barang}`}
                            className="rounded-lg p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors focus:ring-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Data Barang" : "Tambah Barang ATK Baru"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {modalError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Kode Barang
              </label>
              <input
                type="text"
                required
                value={formData.kode_barang}
                onChange={(e) => setFormData({ ...formData, kode_barang: e.target.value })}
                placeholder="Contoh: ATK-001"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Kategori
              </label>
              <select
                required
                value={formData.id_kategori}
                onChange={(e) => setFormData({ ...formData, id_kategori: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
              >
                {kategoriList.map((k) => (
                  <option key={k.id_kategori} value={k.id_kategori}>
                    {k.nama_kategori}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Nama Barang
            </label>
            <input
              type="text"
              required
              value={formData.nama_barang}
              onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
              placeholder="Contoh: Kertas HVS A4 80gr"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Satuan
              </label>
              <input
                type="text"
                required
                value={formData.satuan}
                onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                placeholder="pcs, rim, pak, botol"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>

            {!editingItem && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Stok Awal
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stok}
                  onChange={(e) => setFormData({ ...formData, stok: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Stok Minimum
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stok_minimum}
                onChange={(e) =>
                  setFormData({ ...formData, stok_minimum: Number(e.target.value) })
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Harga Satuan (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={formData.harga_satuan}
                onChange={(e) =>
                  setFormData({ ...formData, harga_satuan: Number(e.target.value) })
                }
                placeholder="Contoh: 3000"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Expired Date (Kedaluwarsa)
              </label>
              <input
                type="date"
                value={formData.expired_date}
                onChange={(e) => setFormData({ ...formData, expired_date: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Lokasi Penyimpanan (Rak/Gudang)
            </label>
            <input
              type="text"
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              placeholder="Contoh: Rak A1, Lemari 2"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[44px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 min-h-[44px]"
            >
              {modalLoading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Konfirmasi Hapus Barang"
        message={`Apakah Anda yakin ingin menghapus barang '${itemToDelete?.nama_barang}' (${itemToDelete?.kode_barang})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Barang"
      />
    </div>
  );
};
