import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { Boxes, AlertCircle, Loader2 } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Mohon lengkapi username dan password");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await apiClient.post("/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });

      const { token, user } = response.data.data;
      login(token, user);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        setErrorMsg(err.response.data.error.message);
      } else {
        setErrorMsg("Koneksi gagal. Pastikan server backend dan database telah aktif.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <Boxes className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Sistem Informasi ATK
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pencatatan Barang Masuk & Keluar Alat Tulis Kantor
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:bg-indigo-400 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk ke Sistem</span>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
          Akses terotentikasi &bull; Hak Akses: Admin & Pimpinan
        </div>
      </div>
    </div>
  );
};
