import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { BarangPage } from "./pages/master/BarangPage";
import { KategoriPage } from "./pages/master/KategoriPage";
import { SupplierPage } from "./pages/master/SupplierPage";
import { DivisiPage } from "./pages/master/DivisiPage";
import { BarangMasukPage } from "./pages/transaksi/BarangMasukPage";
import { InputBarangMasukPage } from "./pages/transaksi/InputBarangMasukPage";
import { BarangKeluarPage } from "./pages/transaksi/BarangKeluarPage";
import { InputBarangKeluarPage } from "./pages/transaksi/InputBarangKeluarPage";
import { LaporanPage } from "./pages/laporan/LaporanPage";
import { ToastProvider } from "./components/common/Toast";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Operational Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="barang" element={<BarangPage />} />
          <Route path="kategori" element={<KategoriPage />} />
          <Route path="supplier" element={<SupplierPage />} />
          <Route path="divisi" element={<DivisiPage />} />
          <Route path="barang-masuk" element={<BarangMasukPage />} />
          <Route
            path="barang-masuk/baru"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <InputBarangMasukPage />
              </ProtectedRoute>
            }
          />
          <Route path="barang-keluar" element={<BarangKeluarPage />} />
          <Route
            path="barang-keluar/baru"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <InputBarangKeluarPage />
              </ProtectedRoute>
            }
          />
          <Route path="laporan" element={<LaporanPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}
