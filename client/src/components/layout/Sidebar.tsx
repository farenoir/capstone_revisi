import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Truck,
  Building2,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileSpreadsheet,
  X,
  Boxes,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Data Barang", to: "/barang", icon: Package },
    { label: "Kategori", to: "/kategori", icon: FolderTree },
    { label: "Supplier", to: "/supplier", icon: Truck },
    { label: "Divisi", to: "/divisi", icon: Building2 },
    { label: "Barang Masuk", to: "/barang-masuk", icon: ArrowDownToLine },
    { label: "Barang Keluar", to: "/barang-keluar", icon: ArrowUpFromLine },
    { label: "Laporan & Saldo", to: "/laporan", icon: FileSpreadsheet },
    { label: "Diagram DB XAMPP", to: "/diagram-database", icon: Boxes },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#1E3A8A] text-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-indigo-950/60 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-sm">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">SISTEM ATK</h1>
              <p className="text-[11px] text-indigo-200">Inventaris Masuk & Keluar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-indigo-200 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-white md:hidden"
            aria-label="Tutup menu navigasi"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
            Menu Utama
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white text-indigo-900 shadow-sm font-semibold"
                        : "text-indigo-100 hover:bg-indigo-900/60 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="border-t border-indigo-950/60 p-4 text-xs text-indigo-300">
          <p className="font-medium text-white">Sistem Inventaris Kantor</p>
          <p className="text-[11px] text-indigo-200 mt-0.5">Versi 1.0.0 (Prisma + MySQL)</p>
        </div>
      </aside>
    </>
  );
};
