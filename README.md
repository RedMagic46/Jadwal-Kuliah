# Aplikasi Penjadwalan Kuliah

Aplikasi web untuk mengelola jadwal kuliah dengan fitur deteksi bentrok otomatis dan auto-generate schedule.

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

---

## 🔧 Setup Backend (Supabase)

Aplikasi ini mendukung **2 mode**:

### Mode 1: Mock Data (Default)
- Tidak perlu setup backend
- Data disimpan di localStorage
- Cocok untuk development dan demo

### Mode 2: Supabase Backend (Production)
- Data persisten di database
- Multi-user support
- Realtime updates
- Authentication real

**Untuk setup Supabase**, ikuti panduan di [`SETUP_SUPABASE.md`](./SETUP_SUPABASE.md)

**Quick Setup:**
1. Buat project di [supabase.com](https://supabase.com)
2. Copy credentials ke `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Setup database schema (lihat `SUPABASE_INTEGRATION.md`)
4. Restart dev server

---

## 📚 Dokumentasi

- [`SETUP_SUPABASE.md`](./SETUP_SUPABASE.md) - Panduan setup Supabase
- [`SUPABASE_INTEGRATION.md`](./SUPABASE_INTEGRATION.md) - Dokumentasi lengkap integrasi Supabase
- [`DEPLOY_NOW.md`](./DEPLOY_NOW.md) - Panduan deployment
- [`README_PENJADWALAN.md`](./README_PENJADWALAN.md) - Dokumentasi fitur aplikasi

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Routing**: React Router v7

---

## 📝 Environment Variables

Buat file `.env.local` di root project:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Jika tidak ada file ini, aplikasi akan menggunakan mock data.

---

## 🎯 Fitur Utama

- ✅ CRUD Jadwal Kuliah
- ✅ Deteksi Bentrok Otomatis
- ✅ Auto-Generate Schedule
- ✅ Calendar View & Table View
- ✅ Export PDF
- ✅ Role-based Authentication (Admin/Dosen/Mahasiswa)
- ✅ Realtime Updates (dengan Supabase)

---

## 📦 Build untuk Production

```bash
npm run build
```

File production akan ada di folder `dist/`

---

## 🚀 Deployment

Lihat panduan lengkap di [`DEPLOY_NOW.md`](./DEPLOY_NOW.md)

**Quick Deploy:**
1. Build aplikasi: `npm run build`
2. Deploy folder `dist/` ke Vercel/Netlify
3. Set environment variables di hosting provider

---

## 📄 License

MIT License

---

**Original Design**: [Figma](https://www.figma.com/design/JU6znlDP5HXIN7lxtDXRlR/Aplikasi-Penjadwalan-Kuliah)
