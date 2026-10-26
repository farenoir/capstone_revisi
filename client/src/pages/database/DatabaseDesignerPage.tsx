import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface ColumnDef {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  nullable?: boolean;
}

interface TableDef {
  name: string;
  x: number;
  y: number;
  width: number;
  columns: ColumnDef[];
}

const TABLES: TableDef[] = [
  {
    name: "kategori",
    x: 50,
    y: 80,
    width: 240,
    columns: [
      { name: "id_kategori", type: "int(11)", isPk: true },
      { name: "nama_kategori", type: "varchar(100)" },
      { name: "created_at", type: "datetime" },
    ],
  },
  {
    name: "barang",
    x: 350,
    y: 60,
    width: 290,
    columns: [
      { name: "id_barang", type: "int(11)", isPk: true },
      { name: "kode_barang", type: "varchar(50)" },
      { name: "nama_barang", type: "varchar(150)" },
      { name: "id_kategori", type: "int(11)", isFk: true },
      { name: "satuan", type: "varchar(30)" },
      { name: "stok", type: "int(11)" },
      { name: "stok_minimum", type: "int(11)" },
      { name: "harga_satuan", type: "int(11)" },
      { name: "expired_date", type: "date", nullable: true },
      { name: "lokasi", type: "varchar(100)", nullable: true },
      { name: "created_at", type: "datetime" },
      { name: "updated_at", type: "datetime" },
    ],
  },
  {
    name: "supplier",
    x: 50,
    y: 360,
    width: 250,
    columns: [
      { name: "id_supplier", type: "int(11)", isPk: true },
      { name: "nama_supplier", type: "varchar(150)" },
      { name: "alamat", type: "text", nullable: true },
      { name: "telepon", type: "varchar(30)", nullable: true },
      { name: "created_at", type: "datetime" },
    ],
  },
  {
    name: "divisi",
    x: 1040,
    y: 80,
    width: 240,
    columns: [
      { name: "id_divisi", type: "int(11)", isPk: true },
      { name: "nama_divisi", type: "varchar(100)" },
      { name: "created_at", type: "datetime" },
    ],
  },
  {
    name: "barang_masuk",
    x: 360,
    y: 470,
    width: 280,
    columns: [
      { name: "id_masuk", type: "int(11)", isPk: true },
      { name: "tanggal", type: "date" },
      { name: "id_barang", type: "int(11)", isFk: true },
      { name: "jumlah", type: "int(11)" },
      { name: "id_supplier", type: "int(11)", isFk: true },
      { name: "id_user", type: "int(11)", isFk: true },
      { name: "nama_petugas", type: "varchar(100)", nullable: true },
      { name: "keterangan", type: "varchar(255)", nullable: true },
      { name: "created_at", type: "datetime" },
    ],
  },
  {
    name: "users",
    x: 720,
    y: 430,
    width: 250,
    columns: [
      { name: "id_user", type: "int(11)", isPk: true },
      { name: "nama", type: "varchar(100)" },
      { name: "username", type: "varchar(50)" },
      { name: "password", type: "varchar(255)" },
      { name: "role", type: "enum('admin','pimpinan')" },
      { name: "created_at", type: "datetime" },
      { name: "updated_at", type: "datetime" },
    ],
  },
  {
    name: "barang_keluar",
    x: 720,
    y: 70,
    width: 280,
    columns: [
      { name: "id_keluar", type: "int(11)", isPk: true },
      { name: "tanggal", type: "date" },
      { name: "id_barang", type: "int(11)", isFk: true },
      { name: "jumlah", type: "int(11)" },
      { name: "id_divisi", type: "int(11)", isFk: true },
      { name: "id_user", type: "int(11)", isFk: true },
      { name: "nama_pengambil", type: "varchar(100)", nullable: true },
      { name: "keterangan", type: "varchar(255)", nullable: true },
      { name: "created_at", type: "datetime" },
    ],
  },
];

interface RelationDef {
  id: string;
  fromTable: string;
  fromCol: string;
  toTable: string;
  toCol: string;
}

const RELATIONS: RelationDef[] = [
  {
    id: "rel_kategori_barang",
    fromTable: "kategori",
    fromCol: "id_kategori",
    toTable: "barang",
    toCol: "id_kategori",
  },
  {
    id: "rel_barang_masuk",
    fromTable: "barang",
    fromCol: "id_barang",
    toTable: "barang_masuk",
    toCol: "id_barang",
  },
  {
    id: "rel_supplier_masuk",
    fromTable: "supplier",
    fromCol: "id_supplier",
    toTable: "barang_masuk",
    toCol: "id_supplier",
  },
  {
    id: "rel_users_masuk",
    fromTable: "users",
    fromCol: "id_user",
    toTable: "barang_masuk",
    toCol: "id_user",
  },
  {
    id: "rel_barang_keluar",
    fromTable: "barang",
    fromCol: "id_barang",
    toTable: "barang_keluar",
    toCol: "id_barang",
  },
  {
    id: "rel_divisi_keluar",
    fromTable: "divisi",
    fromCol: "id_divisi",
    toTable: "barang_keluar",
    toCol: "id_divisi",
  },
  {
    id: "rel_users_keluar",
    fromTable: "users",
    fromCol: "id_user",
    toTable: "barang_keluar",
    toCol: "id_user",
  },
];

export const DatabaseDesignerPage: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [showRelations, setShowRelations] = useState(true);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const getColY = (table: TableDef, colName: string) => {
    const colIndex = table.columns.findIndex((c) => c.name === colName);
    const headerHeight = 32;
    const rowHeight = 24;
    return table.y + headerHeight + (colIndex >= 0 ? colIndex * rowHeight + rowHeight / 2 : 20);
  };

  const handleDownloadPng = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1350 * 2;
      canvas.height = 800 * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#f5f6f8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(2, 2);
        ctx.drawImage(image, 0, 0);
        const a = document.createElement("a");
        a.download = `diagram_database_capstone_xampp_${new Date().toISOString().split("T")[0]}.png`;
        a.href = canvas.toDataURL("image/png");
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header: XAMPP / phpMyAdmin Simulation Bar */}
      <header className="bg-[#e4ebf2] border-b border-[#c8d4df] px-4 py-2 text-slate-800 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* phpMyAdmin emblem */}
            <div className="flex items-center gap-1.5 font-bold text-slate-900 bg-white px-2 py-1 rounded border border-[#b8c7d6] shadow-sm">
              <span className="text-orange-600 font-black tracking-tight text-sm">php</span>
              <span className="text-blue-700 font-black tracking-tight text-sm">MyAdmin</span>
              <span className="ml-1 text-[10px] text-slate-500 font-normal">5.2.1</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-slate-600 font-mono text-[11px]">
              <span>localhost</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="font-semibold text-slate-900">127.0.0.1:3306</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">capstone</span>
              <span className="text-slate-400">&gt;&gt;</span>
              <span className="text-indigo-800 font-semibold">Designer (Relasi Tabel)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1 rounded shadow-sm text-xs font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Ke Dashboard</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1 rounded shadow-sm text-xs font-medium transition-colors"
            >
              <span>Halaman Depan</span>
            </Link>
          </div>
        </div>

        {/* phpMyAdmin Tab Strip */}
        <div className="flex gap-1 mt-2 border-b border-[#b5c7d8] -mb-2 overflow-x-auto text-[11px]">
          {["Struktur", "SQL", "Cari", "Kueri", "Ekspor", "Impor", "Operasi", "Hak Akses", "Rutin"].map(
            (tab) => (
              <span
                key={tab}
                className="px-3 py-1 bg-[#d8e2ec] hover:bg-[#cddae6] text-slate-700 rounded-t border-t border-x border-[#b5c7d8] cursor-pointer"
              >
                {tab}
              </span>
            )
          )}
          <span className="px-3 py-1 bg-white font-bold text-slate-900 rounded-t border-t-2 border-t-blue-600 border-x border-[#b5c7d8] shadow-sm">
            Designer (ERD Diagram)
          </span>
        </div>
      </header>

      {/* Designer Sub-bar: Controls & Screenshot Actions */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
              className="p-1 hover:bg-white rounded text-slate-700"
              title="Perkecil"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-2 font-mono text-slate-600 min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
              className="p-1 hover:bg-white rounded text-slate-700"
              title="Perbesar"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-white rounded text-slate-700 ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowRelations((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showRelations
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {showRelations ? "Garis Relasi Aktif" : "Garis Relasi Sembunyi"}
          </button>

          <span className="text-xs text-slate-500 hidden md:inline">
            7 Tabel • RDBMS MySQL InnoDB • Database: <strong className="text-slate-800">capstone</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copied ? "Tautan Disalin" : "Salin Tautan"}</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Unduh Screenshot PNG (Resolusi Tinggi)</span>
          </button>
        </div>
      </div>

      {/* Main Designer Canvas Area */}
      <main className="flex-1 overflow-auto p-4 bg-[#f1f3f6]">
        <div
          className="mx-auto bg-[#fafbfc] border border-[#d2d9e1] rounded shadow-sm overflow-hidden"
          style={{ width: "1350px", minHeight: "780px" }}
        >
          {/* SVG Canvas for Designer Diagram */}
          <svg
            ref={svgRef}
            width="1350"
            height="780"
            viewBox="0 0 1350 780"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.15s ease-out",
              backgroundColor: "#f5f7fa",
              backgroundImage:
                "radial-gradient(#d3dbe3 1px, transparent 1px), radial-gradient(#d3dbe3 1px, #f5f7fa 1px)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          >
            <defs>
              {/* Markers for relations */}
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#1e40af" />
              </marker>
              <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6">
                <circle cx="5" cy="5" r="3.5" fill="#1e40af" />
              </marker>
              <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="115%">
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Canvas Header watermark / label */}
            <g opacity="0.85">
              <rect x="20" y="16" width="360" height="28" rx="4" fill="#ffffff" stroke="#c9d4de" />
              <text x="32" y="35" fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#0f172a">
                DATABASE: capstone (phpMyAdmin Designer Schema)
              </text>
            </g>

            {/* Relation Lines */}
            {showRelations &&
              RELATIONS.map((rel) => {
                const fromTable = TABLES.find((t) => t.name === rel.fromTable);
                const toTable = TABLES.find((t) => t.name === rel.toTable);
                if (!fromTable || !toTable) return null;

                const startY = getColY(fromTable, rel.fromCol);
                const endY = getColY(toTable, rel.toCol);

                let startX = fromTable.x + fromTable.width;
                let endX = toTable.x;

                // If target is to the left of source
                if (toTable.x + toTable.width < fromTable.x) {
                  startX = fromTable.x;
                  endX = toTable.x + toTable.width;
                } else if (Math.abs(fromTable.x - toTable.x) < 50) {
                  // Vertically aligned
                  startX = fromTable.x + fromTable.width;
                  endX = toTable.x + toTable.width;
                }

                const deltaX = Math.abs(endX - startX) * 0.45;
                const pathData =
                  startX <= endX
                    ? `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`
                    : `M ${startX} ${startY} C ${startX - deltaX} ${startY}, ${endX + deltaX} ${endY}, ${endX} ${endY}`;

                return (
                  <g key={rel.id} className="relation-line">
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      markerStart="url(#dot)"
                      markerEnd="url(#arrow)"
                    />
                  </g>
                );
              })}

            {/* Table Cards */}
            {TABLES.map((table) => {
              const headerHeight = 30;
              const rowHeight = 24;
              const totalHeight = headerHeight + table.columns.length * rowHeight + 6;

              return (
                <g key={table.name} transform={`translate(${table.x}, ${table.y})`} filter="url(#cardShadow)">
                  {/* Table Box Background */}
                  <rect
                    width={table.width}
                    height={totalHeight}
                    rx="4"
                    fill="#ffffff"
                    stroke="#a9bac9"
                    strokeWidth="1.2"
                  />

                  {/* Table Header */}
                  <path
                    d={`M 0 4 Q 0 0 4 0 L ${table.width - 4} 0 Q ${table.width} 0 ${table.width} 4 L ${table.width} ${headerHeight} L 0 ${headerHeight} Z`}
                    fill="#dbe5ee"
                    stroke="#a9bac9"
                    strokeWidth="1"
                  />
                  <line x1="0" y1={headerHeight} x2={table.width} y2={headerHeight} stroke="#a9bac9" strokeWidth="1" />

                  {/* Header Title & Icons */}
                  <text x="10" y="19" fontSize="11" fill="#475569">
                    ▦
                  </text>
                  <text x="24" y="20" fontSize="12" fontWeight="bold" fill="#0f172a" fontFamily="sans-serif">
                    {table.name}
                  </text>
                  <text x={table.width - 24} y="19" fontSize="11" fill="#64748b" fontFamily="monospace">
                    _ ×
                  </text>

                  {/* Columns */}
                  {table.columns.map((col, cIdx) => {
                    const rowY = headerHeight + cIdx * rowHeight;
                    const textY = rowY + 16;
                    const isEven = cIdx % 2 === 1;

                    return (
                      <g key={col.name}>
                        {isEven && (
                          <rect
                            x="1"
                            y={rowY}
                            width={table.width - 2}
                            height={rowHeight}
                            fill="#f8fafc"
                          />
                        )}
                        {/* PK / FK icon */}
                        {col.isPk ? (
                          <text x="8" y={textY} fontSize="11" fill="#ca8a04">
                            🔑
                          </text>
                        ) : col.isFk ? (
                          <text x="8" y={textY} fontSize="10" fill="#2563eb">
                            🔗
                          </text>
                        ) : (
                          <circle cx="12" cy={textY - 4} r="2" fill="#94a3b8" />
                        )}

                        {/* Column Name */}
                        <text
                          x="24"
                          y={textY}
                          fontSize="11"
                          fontWeight={col.isPk ? "bold" : col.isFk ? "600" : "normal"}
                          fill={col.isPk ? "#854d0e" : col.isFk ? "#1e40af" : "#1e293b"}
                          fontFamily="monospace"
                        >
                          {col.name}
                        </text>

                        {/* Column Type */}
                        <text
                          x={table.width - 8}
                          y={textY}
                          textAnchor="end"
                          fontSize="10"
                          fill="#64748b"
                          fontFamily="monospace"
                        >
                          {col.type}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      </main>

      {/* Footer info */}
      <footer className="bg-white border-t border-slate-200 px-4 py-2 text-xs text-slate-500 flex flex-wrap items-center justify-between">
        <span>
          Schema Database: <strong className="text-slate-700">capstone</strong> | Engine: InnoDB | Charset: utf8mb4
        </span>
        <span>
          Gunakan tombol di atas untuk mengunduh tangkapan layar (PNG) untuk lampiran Laporan Akhir / Tugas 3.
        </span>
      </footer>
    </div>
  );
};
