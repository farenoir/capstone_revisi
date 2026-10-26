import React, { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Kategori } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Modal } from "../../components/common/Modal";
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

  const { isAdmin } = useAuthStore();

  const fetchKategori = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/kategori");
      setList(res.data.data);
    } catch (err) {
      console.error(err);
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
      } else {
        await apiClient.post("/kategori", {
          nama_kategori: namaKategori.trim(),
        });
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

  const handleDelete = async (item: Kategori) => {
    if (!window.confirm(`Yakin ingin menghapus kategori '${item.nama_kategori}'?`)) {
      return;
    }
    try {
      await apiClient.delete(`/kategori/${item.id_kategori}`);
      fetchKategori();
    } catch (err: any) {
      alert(
        err.response?.data?.error?.message ||
          "Kategori tidak dapat dihapus karena masih terkait data barang."
      );
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
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
                  <th className="px-6 py-3">Nama Kategori</th>
                  <th className="px-6 py-3 text-center">Jumlah Barang Terdaftar</th>
                  {isAdmin() && <th className="px-6 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {list.map((item) => (
                  <tr key={item.id_kategori} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {item.nama_kategori}
                    </td>
                    <td className="px-6 py-3.5 text-center text-slate-600 tabular-nums">
                      {item._count?.barang || 0} item
                    </td>
                    {isAdmin() && (
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit Kategori"
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Hapus Kategori"
                            className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
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
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
              {modalLoading ? "Menyimpan..." : "Simpan Kategori"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
