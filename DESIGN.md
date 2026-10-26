# Design Direction & Identity: Sistem Informasi Pencatatan Barang Masuk dan Keluar ATK

> Acuan visual dan interaksi yang diturunkan dari PRD (Kondisi Antarmuka, Desain, & Aksesibilitas) dan dipadukan dengan standar Anti-Slop (craftsmanship, purposeful UI, dan no decorative slop).

---

## 1. Identitas & Karakter Produk
- **Nama Produk:** Sistem Informasi Pencatatan Barang Masuk dan Keluar ATK (Sistem ATK)
- **Tipe Aplikasi:** Web-based Internal Operational & Inventory System (Self-Hosted Intranet)
- **Target Pengguna:** 
  1. *Admin Gudang:* Operator inventaris harian dengan beban kerja input cepat, pencarian barang responsif, validasi ketersediaan stok, dan manajemen master data.
  2. *Pimpinan:* Manajer/Kepala Bagian yang membutuhkan dashboard eksekutif ringkas, pemantauan status stok kritis, dan ekspor berkas audit.
- **Karakter Visual:** Fungsional, terstruktur, presisi, bersahaja (utilitarian & clean corporate), tanpa ornamen dekoratif yang mengganggu efisiensi kerja.

---

## 2. Dials (Tingkat Energi, Ritme, & Gerak)
- **ENERGY: 2** (Fokus pada keterbacaan data tabel inventaris, kepadatan informasi seimbang, hierarki kontras tegas tanpa elemen visual berlebihan).
- **RHYTHM: 2** (Komposisi modular yang disesuaikan dengan data nyata: tabel master data dengan kontrol aksi jelas, form multi-item dinamis dengan feedback stok langsung, dan kartu metrik ringkas).
- **MOTION: 1** (Hanya transisi mikro fungsional 150-200ms untuk feedback tombol, status loading, dan pembukaan dialog modal; tanpa animasi memantul, melayang, atau dekoratif).

---

## 3. Palet Warna & Kontras (Berdasarkan PRD)
- **Brand / Primary:** Deep Indigo / Navy (`#1E3A8A`) — dipakai untuk navigasi sidebar, header bar, dan tombol aksi utama.
- **Surface & Backgrounds:**
  - Base Background: Slate 50 (`#F8FAFC`)
  - Card & Container Surface: Pure White (`#FFFFFF`)
  - Border: Slate 200 (`#E2E8F0`) / Slate 300 (`#CBD5E1`)
  - Muted Surface: Slate 100 (`#F1F5F9`)
- **Teks & Tipografi Kontras Tinggi (Memenuhi WCAG AA >= 4.5:1):**
  - Text Primary: Slate 900 (`#0F172A`)
  - Text Secondary: Slate 600 (`#475569`)
  - Text Muted: Slate 500 (`#64748B`)
- **Warna Semantik & Status Mutasi:**
  - *Success (Barang Masuk / Stok Aman):* Emerald 700 (`#047857`) pada latar Emerald 50 (`#ECFDF5`)
  - *Warning (Stok Menipis):* Amber 700 (`#B45309`) pada latar Amber 50 (`#FFFBEB`)
  - *Danger (Barang Keluar / Stok Kritis / Error Validasi):* Red 700 (`#B91C1C`) pada latar Red 50 (`#FEF2F2`)

---

## 4. Tipografi
- **Font Utama:** Inter, Roboto, atau System Sans-Serif (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Skala & Hierarki:**
  - H1 (Judul Halaman): 24px (1.5rem), font-semibold, tracking-tight
  - H2 (Judul Bagian/Card): 18px (1.125rem), font-semibold
  - Body Text: 14px (0.875rem), font-normal, line-height 1.5
  - Caption / Label / Table Header: 12px (0.75rem), font-medium, uppercase tracking-wider
  - Code / Angka Stok / Badge: Tabular numbers (`font-mono` atau `tabular-nums`) untuk konsistensi angka kuantitas.

---

## 5. Komponen Kunci & Pola Interaksi
1. **Form Multi-Item Transaksi:**
   - Tabel input baris dinamis (tambah baris / hapus baris).
   - Dropdown pencarian barang menampilkan sisa stok fisik saat dipilih.
   - Peringatan stok instan jika kuantitas diminta > stok tersedia, dengan pencegahan tombol submit.
2. **Badge Peringatan Stok Minimum:**
   - Menampilkan status *"Kritis"* (stok = 0 atau <= stok_minimum) dan *"Aman"* (stok > stok_minimum) secara lugas tanpa animasi kilau/glow.
3. **Empty, Loading & Error States:**
   - Setiap tabel memiliki skeleton loading terstruktur saat memuat data.
   - Keadaan kosong menampilkan teks keterangan jelas dan tombol aksi penambahan data.
   - Keadaan error menampilkan pesan spesifik dan opsi coba lagi.
4. **Navigasi & Aksesibilitas:**
   - Fokus keyboard terlihat jelas (`ring-2 ring-indigo-600 ring-offset-2`).
   - Modal dapat ditutup dengan tombol `Escape` atau klik tombol batal.
   - Seluruh elemen interaktif memiliki label yang deskriptif dan dapat diakses pembaca layar.
