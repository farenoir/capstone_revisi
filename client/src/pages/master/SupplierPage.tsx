import React, { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Supplier } from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Modal } from "../../components/common/Modal";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const SupplierPage: React.FC = () => {
  const [list, setList] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    nama_supplier: "",
    alamat: "",
    telepon: "",
  });
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const { isAdmin } = useAuthStore();

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/supplier");
      setList(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ nama_supplier: "", alamat: "", telepon: "" });
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: Supplier) => {
    setEditingItem(item);
    setFormData({
      nama_supplier: item.nama_supplier,
      alamat: item.alamat || "",
      telepon: item.telepon || "",
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
        await apiClient.put(`/supplier/${editingItem.id_supplier}`, formData);
      } else {
        await apiClient.post("/supplier", formData);
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      setModalError(
        err.response?.data?.error?.message || "Gagal menyimpan data supplier."
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (item: Supplier) => {
    if (!window.confirm(`Yakin ingin menghapus supplier '${item.nama_supplier}'?`)) {
      return;
    }
    try {
      await apiClient.delete(`/supplier/${item.id_supplier}`);
      fetchSuppliers();
    } catch (err: any) {
      alert(
        err.response?.data?.error?.message ||
          "Supplier tidak dapat dihapus karena memiliki transaksi riwayat barang masuk."
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Master Data Supplier</h1>
          <p className="text-sm text-slate-500">
            Daftar mitra vendor pemasok ATK untuk transaksi penerimaan barang masuk.
          </p>
        </div>
        {isAdmin() && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Supplier</span>
          </button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Memuat supplier..." />
        ) : list.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Belum Ada Supplier"
              description="Tambahkan data supplier/vendor ATK pertama Anda."
              actionText={isAdmin() ? "Tambah Supplier" : undefined}
              onAction={isAdmin() ? openAddModal : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Nama Supplier</th>
                  <th className="px-6 py-3">Telepon</th>
                  <th className="px-6 py-3">Alamat</th>
                  <th className="px-6 py-3 text-center">Total Transaksi Masuk</th>
                  {isAdmin() && <th className="px-6 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {list.map((item) => (
                  <tr key={item.id_supplier} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {item.nama_supplier}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{item.telepon || "-"}</td>
                    <td className="px-6 py-3.5 text-slate-500">{item.alamat || "-"}</td>
                    <td className="px-6 py-3.5 text-center text-slate-600 tabular-nums">
                      {item._count?.barang_masuk || 0}
                    </td>
                    {isAdmin() && (
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit Supplier"
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Hapus Supplier"
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
        title={editingItem ? "Edit Supplier" : "Tambah Supplier Baru"}
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
              Nama Supplier / Perusahaan
            </label>
            <input
              type="text"
              required
              value={formData.nama_supplier}
              onChange={(e) => setFormData({ ...formData, nama_supplier: e.target.value })}
              placeholder="Contoh: PT Sumber Makmur ATK"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Nomor Telepon
            </label>
            <input
              type="text"
              value={formData.telepon}
              onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
              placeholder="Contoh: 021-5551234"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Alamat Lengkap
            </label>
            <textarea
              rows={3}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="Alamat kantor / gudang supplier..."
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
              {modalLoading ? "Menyimpan..." : "Simpan Supplier"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
