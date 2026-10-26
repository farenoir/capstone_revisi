import React, { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Kategori } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Modal } from "../../components/common/Modal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { useToast } from "../../components/common/Toast";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const KategoriPage: React.FC = () => {
  const [list, setList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Kategori | null>(null);
  const [namaKategori, setNamaKategori] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<Kategori | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { isAdmin } = useAuthStore();
  const { showToast } = useToast();

  const fetchKategori = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/kategori");
      setList(res.data.data);
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat kategori", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setNamaKategori("");
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: Kategori) => {
    setEditingItem(item);
    setNamaKategori(item.nama_kategori);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKategori.trim()) return;
    setModalError("");
    setModalLoading(true);

    try {
      if (editingItem) {
        await apiClient.put(`/kategori/${editingItem.id_kategori}`, {
          nama_kategori: namaKategori.trim(),
        });
        showToast(`Kategori '${namaKategori}' berhasil diperbarui`);
      } else {
        await apiClient.post("/kategori", {
          nama_kategori: namaKategori.trim(),
        });
        showToast(`Kategori '${namaKategori}' berhasil ditambahkan`);
      }
      setIsModalOpen(false);
      fetchKategori();
    } catch (err: any) {
      setModalError(
        err.response?.data?.error?.message || "Gagal menyimpan kategori."
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/kategori/${itemToDelete.id_kategori}`);
      showToast(`Kategori '${itemToDelete.nama_kategori}' berhasil dihapus`);
      setItemToDelete(null);
      fetchKategori();
    } catch (err: any) {
      showToast(
        err.response?.data?.error?.message ||
          "Kategori tidak dapat dihapus karena masih digunakan oleh beberapa data barang.",
        "error"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Master Kategori ATK</h1>
          <p className="text-sm text-slate-500">
            Pengelompokan barang inventaris (Kertas, Alat Tulis, Perekat, dll).
          </p>
        </div>
        {isAdmin() && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors min-h-[44px] focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kategori</span>
          </button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Memuat kategori..." />
        ) : list.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Belum Ada Kategori"
              description="Tambahkan kategori awal untuk mengelompokkan barang ATK."
              actionText={isAdmin() ? "Tambah Kategori" : undefined}
              onAction={isAdmin() ? openAddModal : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Nama Kategori</th>
                  <th className="px-6 py-3.5 text-center">Jumlah Barang Terdaftar</th>
                  {isAdmin() && <th className="px-6 py-3.5 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {list.map((item) => (
                  <tr key={item.id_kategori} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {item.nama_kategori}
                    </td>
                    <td className="px-6 py-3.5 text-center text-slate-600 tabular-nums">
                      {item._count?.barang || 0} item
                    </td>
                    {isAdmin() && (
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            title={`Edit ${item.nama_kategori}`}
                            aria-label={`Edit ${item.nama_kategori}`}
                            className="rounded-lg p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors focus:ring-2 focus:ring-indigo-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            title={`Hapus ${item.nama_kategori}`}
                            aria-label={`Hapus ${item.nama_kategori}`}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Kategori" : "Tambah Kategori Baru"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {modalError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Nama Kategori
            </label>
            <input
              type="text"
              required
              autoFocus
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              placeholder="Contoh: Kertas & Buku"
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
              {modalLoading ? "Menyimpan..." : "Simpan Kategori"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Konfirmasi Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori '${itemToDelete?.nama_kategori}'? Kategori yang memiliki relasi barang tidak dapat dihapus.`}
        confirmText="Hapus Kategori"
      />
    </div>
  );
};
