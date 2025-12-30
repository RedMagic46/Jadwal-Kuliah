# 📅 Aplikasi Penjadwalan Kuliah - InfoKHS

Aplikasi web untuk mengelola jadwal kuliah dengan fitur deteksi bentrok otomatis dan auto-generate schedule.

🌐 **Website Live**: [jadwalkuliahkhs.online](https://jadwalkuliahkhs.online)

---

## 🌐 Akses Aplikasi

**Website Production**: [jadwalkuliahkhs.online](https://jadwalkuliahkhs.online)

Aplikasi sudah di-deploy dan dapat diakses secara langsung melalui website di atas. Tidak perlu install atau setup apapun, langsung buka dan gunakan!

---

## 🔐 Login Demo

Aplikasi menggunakan mock authentication untuk demo. Login dapat dilakukan dengan NIM dan PIC bebas.

---

## 🎯 Fitur Utama

### 1. Dashboard
- 📊 Statistik jadwal, mata kuliah, dan ruangan
- ⚠️ Notifikasi jadwal bentrok
- 🎯 Quick actions untuk navigasi cepat

### 2. Manajemen Jadwal
- ✅ **Create**: Tambah jadwal baru
- ✅ **Read**: Lihat jadwal dalam format kalender atau tabel
- ✅ **Update**: Edit waktu, hari, atau ruangan
- ✅ **Delete**: Hapus jadwal yang tidak diperlukan
- 🔍 **Deteksi Bentrok**: Scan otomatis untuk jadwal yang bertabrakan
- 🔄 **Auto-Generate**: Generate jadwal tabel otomatis
- 📥 **Export PDF**: Download jadwal dalam format PDF

### 3. Authentication & Authorization
- 🔐 Role-based access (Admin/Dosen/Mahasiswa)
- 👤 User management
- 🔒 Protected routes

---

## 🚀 Quick Start (Development)

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
- ✅ Tidak perlu setup backend
- ✅ Data disimpan di localStorage
- ✅ Cocok untuk development dan demo
- ✅ **Mode ini digunakan di website production saat ini**

### Mode 2: Supabase Backend (Production)
- ✅ Data persisten di database PostgreSQL
- ✅ Multi-user support
- ✅ Realtime updates
- ✅ Authentication real

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL) - Optional
- **Build Tool**: Vite 6
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Notifications**: Sonner
- **PDF Export**: jsPDF + jsPDF-AutoTable

---

## 📁 Struktur Project

```
src/
├── app/
│   ├── components/        # Komponen UI
│   │   ├── Layout.tsx     # Layout dengan sidebar
│   │   ├── ScheduleCalendar.tsx
│   │   ├── ScheduleEditModal.tsx
│   │   └── ui/            # Shadcn UI components
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── SchedulePage.tsx
│   ├── types/
│   │   └── schedule.ts
│   └── utils/
│       ├── scheduleAlgorithm.ts
│       └── exportPDF.ts
├── lib/                   # Supabase services
│   ├── supabase.ts
│   ├── auth.ts
│   ├── scheduleService.ts
│   ├── courseService.ts
│   └── roomService.ts
└── hooks/
    └── useRealtimeSchedules.ts
```

---

## 📦 Build untuk Production

```bash
npm run build
```

File production akan ada di folder `dist/`

---

## 🚀 Deployment

Aplikasi sudah di-deploy di **jadwalkuliahkhs.online**

### Untuk Deploy Ulang:

1. **Build aplikasi**:
   ```bash
   npm run build
   ```

2. **Deploy folder `dist/`** ke hosting provider:
   - **Vercel**: Drag & drop folder `dist/` atau connect dengan GitHub
   - **Netlify**: Drag & drop folder `dist/` atau connect dengan GitHub
   - **Cloudflare Pages**: Connect dengan GitHub repository

3. **Set Environment Variables** (jika menggunakan Supabase):
   - Di hosting provider, tambahkan:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

---

## 🐛 Troubleshooting

### Aplikasi tidak bisa diakses
- Pastikan server development sudah running (`npm run dev`)
- Cek apakah port 5173 sudah digunakan
- Cek browser console untuk error

### Data tidak muncul
- Jika menggunakan Supabase, pastikan environment variables sudah benar
- Jika menggunakan mock data, pastikan tidak ada error di console
- Refresh halaman

---

## 📄 License

MIT License - Bebas digunakan untuk pembelajaran dan produksi.

---

## 👨‍💻 Development

### Prerequisites
- Node.js >= 18
- npm atau pnpm

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production

---

## 🔗 Links

- 🌐 **Website**: [jadwalkuliahkhs.online](https://jadwalkuliahkhs.online)

---

