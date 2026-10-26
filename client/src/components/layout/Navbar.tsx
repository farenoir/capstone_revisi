import React from "react";
import { LogOut, User as UserIcon, Menu } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Buka menu navigasi"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden focus:ring-2 focus:ring-indigo-600"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-slate-700 md:hidden">Sistem ATK</span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-slate-800 leading-tight">{user.nama}</p>
              <span
                className={`inline-block text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                  user.role === "admin"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Keluar dari akun"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors focus:ring-2 focus:ring-red-500"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
