# Sistem Informasi Pencatatan Barang Masuk dan Keluar ATK

Sistem informasi manajemen inventaris dan pencatatan mutasi alat tulis kantor (ATK) berbasis web dengan arsitektur monorepo, pemisahan hak akses berjenjang (Role-Based Access Control), validasi ketersediaan stok fisik secara *real-time* berbasis transaksi ACID, serta generator laporan spreadsheet Excel (.xlsx) dan CSV.

---

## 1. Arsitektur & Teknologi

| Lapisan | Teknologi | Versi / Keterangan |
|---|---|---|
| **Frontend** | React + TypeScript + Vite | React 18, Vite 5, Tailwind CSS, Lucide React, Zustand |
| **Backend** | Node.js + Express (TypeScript) | Express 4, TypeScript 5, Zod 3, jsonwebtoken, bcryptjs |
| **Database & ORM** | MySQL 8.0 + Prisma ORM | Prisma 5.x, InnoDB Engine (ACID Transaction, Pessimistic Locking) |
| **Ekspor Laporan** | ExcelJS & Native Stream | File format .xlsx dan .csv |

---

## 2. Struktur Proyek

```
mibombo/
├── .env.example                     # Contoh konfigurasi environment root
├── DESIGN.md                        # Panduan visual dan antarmuka (Navy #1E3A8A)
├── PRD.synced.md                    # Dokumen spesifikasi kebutuhan produk (PRD)
├── package.json                     # Root monorepo scripts
├── client/                          # Aplikasi Frontend (Single Page Application)
│   ├── src/
│   │   ├── api/                     # Axios instance & interceptor token JWT
│   │   ├── components/              # Komponen UI, Layout (Navbar, Sidebar), Modals & Toast
│   │   ├── pages/
│   │   │   ├── auth/                # LoginPage
│   │   │   ├── dashboard/           # DashboardPage (KPI Cards & Alert Stok)
│   │   │   ├── master/              # BarangPage, KategoriPage, SupplierPage, DivisiPage
│   │   │   ├── transaksi/           # BarangMasuk, InputMasuk, BarangKeluar, InputKeluar
│   │   │   └── laporan/             # LaporanPage (Filter & Generator Unduhan)
│   │   ├── store/                   # Zustand Global Auth State
│   │   └── types/                   # TypeScript interfaces & DTOs
│   ├── package.json
│   └── vite.config.ts
└── server/                          # Aplikasi Backend (RESTful API Server)
    ├── prisma/
    │   ├── schema.prisma            # Skema database relasional & indeks
    │   └── seed.ts                  # Seeding awal user, master, dan transaksi
    ├── src/
    │   ├── config/                  # Validasi env variables
    │   ├── controllers/             # Auth, Master Data, Transaksi, Dashboard, Laporan
    │   ├── middleware/              # JWT Auth, Role RBAC, Zod Validation, Error Handler
    │   ├── routes/                  # Express Router definitions
    │   ├── schemas/                 # Zod validation schemas
    │   ├── types/                   # Backend TypeScript declarations
    │   ├── utils/                   # Database client & API Response helper
    │   └── server.ts                # Server entry point
    └── package.json
```

---

## 3. Konfigurasi Lingkungan (Environment Variables)

Salin template variabel lingkungan sebelum menjalankan aplikasi:

```bash
# Backend
cp server/.env.example server/.env

# Frontend
cp client/.env.example client/.env
```

### Variabel Backend (`server/.env`):
- `PORT`: Port server backend (default `5000`).
- `DATABASE_URL`: URL koneksi MySQL (`mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`).
- `JWT_SECRET`: Kunci rahasia enkripsi token JWT.
- `JWT_EXPIRES_IN`: Masa berlaku token (contoh `8h`).
- `CORS_ORIGIN`: Asal origin frontend (default `http://localhost:5173`).

---

## 4. Migrasi & Seeding Database

1. Pastikan server MySQL lokal berjalan (misal pada `localhost:3306`).
2. Terapkan skema tabel ke database:
   ```bash
   cd server
   npx prisma db push
   ```
3. Jalankan pengisian data awal (*seeding* akun default dan master data):
   ```bash
   npm run seed
   ```

### Akun Bawaan Sistem:
- **Administrator Gudang:**
  - Username: `admin`
  - Password: `admin123`
  - Akses: Pengelolaan master data penuh (CRUD), input transaksi barang masuk dan keluar, monitoring dashboard, dan cetak laporan.
- **Pimpinan Operasional:**
  - Username: `pimpinan`
  - Password: `pimpinan123`
  - Akses: *Read-only* pada master data dan riwayat mutasi transaksi, monitoring dashboard, dan unduh ekspor laporan Excel/CSV.

---

## 5. Cara Menjalankan Aplikasi

### Mode Pengembangan (Development)

Jalankan backend dan frontend secara bersamaan dari root repositori:
```bash
npm run dev
```
Atau jalankan masing-masing di terminal terpisah:
- **Backend:** `cd server && npm run dev` (berjalan di `http://localhost:5000`)
- **Frontend:** `cd client && npm run dev` (berjalan di `http://localhost:5173`)

### Build Produksi (Production Build)

```bash
# Build Frontend
cd client && npm run build

# Build Backend
cd ../server && npm run build
```

### Deployment Kontainer (Docker Compose)

Untuk menjalankan seluruh stack (MySQL 8.0, Backend API, Nginx Web) dalam lingkungan kontainer terisolasi:

```bash
# 1. Pastikan docker-compose.yml dan nginx.conf tersedia di root repositori
# 2. Jalankan seluruh layanan
docker compose up -d --build

# 3. Akses antarmuka di peramban web
http://localhost
```

---

## 6. Daftar Endpoint RESTful API

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Publik | Otentikasi username & password, mengembalikan token JWT |
| `GET` | `/api/v1/auth/me` | Terotentikasi | Mendapatkan profil pengguna aktif |
| `GET` | `/api/v1/dashboard/summary` | Admin, Pimpinan | Ringkasan KPI dan tren bulanan mutasi ATK |
| `GET` | `/api/v1/dashboard/low-stock` | Admin, Pimpinan | Daftar barang kritis (`stok <= stok_minimum`) |
| `GET` | `/api/v1/barang` | Admin, Pimpinan | Katalog data barang dengan filter pencarian & kategori |
| `POST` | `/api/v1/barang` | Admin | Menambah data barang baru |
| `PUT` | `/api/v1/barang/:id` | Admin | Memperbarui data barang (nama, lokasi, stok minimum) |
| `DELETE` | `/api/v1/barang/:id` | Admin | Menghapus barang (dilindungi RESTRICT jika ada transaksi) |
| `GET` | `/api/v1/kategori` | Admin, Pimpinan | Daftar kategori master |
| `POST` | `/api/v1/kategori` | Admin | Menambah kategori |
| `GET` | `/api/v1/supplier` | Admin, Pimpinan | Daftar vendor supplier ATK |
| `POST` | `/api/v1/supplier` | Admin | Menambah data supplier |
| `GET` | `/api/v1/divisi` | Admin, Pimpinan | Daftar divisi pemohon ATK |
| `POST` | `/api/v1/divisi` | Admin | Menambah data divisi |
| `GET` | `/api/v1/transaksi/barang-masuk` | Admin, Pimpinan | Riwayat transaksi penerimaan barang masuk |
| `POST` | `/api/v1/transaksi/barang-masuk` | Admin | Input transaksi barang masuk (multi-item & auto-tambah stok) |
| `GET` | `/api/v1/transaksi/barang-keluar` | Admin, Pimpinan | Riwayat transaksi pengeluaran barang keluar |
| `POST` | `/api/v1/transaksi/barang-keluar` | Admin | Input transaksi barang keluar (validasi stok fisik & potong stok) |
| `GET` | `/api/v1/laporan/mutasi` | Admin, Pimpinan | Rekapitulasi mutasi gabungan dengan filter tanggal & entitas |
| `GET` | `/api/v1/laporan/export` | Admin, Pimpinan | Generator unduh berkas spreadsheet format `.xlsx` dan `.csv` |

---

## 7. Status Integrasi Eksternal & Pengembangan Mendatang

Sesuai kriteria PRD dan batasan implementasi fase rilis:
- **Integrasi SMTP / Notifikasi Email:** Saat ini peringatan batas stok minimum disajikan secara langsung pada tabel *Low Stock Alert* di Dashboard. Integrasi pengiriman email berkala (cron job SMTP) dapat ditambahkan melalui adapter Nodemailer/SendGrid pada fase pemeliharaan berikutnya.
- **Integrasi Scanner Barcode / QR Code:** Input kode barang saat ini menggunakan autocomplete dropdown dan pencarian teks cepat. Fitur *camera scanner* HTML5 dapat diintegrasikan langsung pada kolom kode barang di form input jika perangkat memiliki webcam/kamera barcode.
