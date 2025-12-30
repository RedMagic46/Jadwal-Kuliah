# 🚀 Setup Supabase untuk Aplikasi Penjadwalan Kuliah

Panduan lengkap untuk setup Supabase sebagai backend untuk aplikasi ini.

## 📋 Langkah-langkah Setup

### 1. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com)
2. Login atau daftar akun baru
3. Klik **"New Project"**
4. Isi detail project:
   - **Name**: `university-scheduling` (atau nama lain)
   - **Database Password**: Buat password yang kuat (simpan password ini!)
   - **Region**: Pilih **Southeast Asia (Singapore)** untuk performa terbaik di Indonesia
5. Klik **"Create new project"**
6. Tunggu beberapa menit hingga project siap

---

### 2. Dapatkan Credentials

1. Setelah project dibuat, buka **Settings** → **API**
2. Copy **Project URL** (contoh: `https://xxxxx.supabase.co`)
3. Copy **anon public** key (key yang panjang)

---

### 3. Setup Environment Variables

1. Di root project, buat file `.env.local` (copy dari `.env.example`)
2. Isi dengan credentials dari Supabase:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ PENTING**: 
- Jangan commit file `.env.local` ke Git (sudah ada di `.gitignore`)
- File `.env.example` boleh di-commit sebagai template

---

### 4. Setup Database Schema

1. Buka Supabase Dashboard → **SQL Editor**
2. Copy semua SQL dari file `DATABASE_SCHEMA.sql` atau dari `SUPABASE_INTEGRATION.md` bagian "Database Schema"
3. Paste ke SQL Editor
4. Klik **Run** untuk menjalankan SQL
5. Pastikan semua tabel berhasil dibuat (cek di **Table Editor**)

---

### 5. Setup Row Level Security (RLS)

1. Di SQL Editor, jalankan SQL untuk RLS dari `SUPABASE_INTEGRATION.md` bagian "Row Level Security"
2. Pastikan semua policies berhasil dibuat

---

### 6. Insert Sample Data (Opsional)

1. Di SQL Editor, jalankan SQL untuk insert sample data dari `SUPABASE_INTEGRATION.md`
2. Atau insert manual melalui **Table Editor**

---

### 7. Test Aplikasi

1. Restart development server:
   ```bash
   npm run dev
   ```
2. Buka aplikasi di browser
3. Coba login dengan user yang sudah dibuat di Supabase
4. Cek apakah data jadwal muncul dari database

---

## 🔐 Setup Authentication

### Membuat User Pertama (Admin)

1. Buka Supabase Dashboard → **Authentication** → **Users**
2. Klik **"Add user"** → **"Create new user"**
3. Isi:
   - **Email**: `admin@university.ac.id`
   - **Password**: Buat password yang kuat
   - **Auto Confirm User**: ✅ Centang (untuk development)
4. Klik **"Create user"**
5. Setelah user dibuat, buka **Table Editor** → **users**
6. Tambahkan row baru dengan:
   - **id**: Copy dari user ID di Authentication
   - **name**: `Admin Sistem`
   - **role**: `admin`

### Membuat User Dosen

1. Buat user di Authentication (sama seperti di atas)
2. Tambahkan di tabel **users** dengan role `dosen`

### Membuat User Mahasiswa

1. Buat user di Authentication
2. Tambahkan di tabel **users** dengan role `mahasiswa`

---

## 🧪 Testing

### Test CRUD Operations

1. **Create**: Tambah jadwal baru melalui aplikasi
2. **Read**: Lihat jadwal muncul di aplikasi
3. **Update**: Edit jadwal yang sudah ada
4. **Delete**: Hapus jadwal

### Test Realtime

1. Buka aplikasi di 2 browser berbeda
2. Edit jadwal di browser 1
3. Browser 2 harus otomatis update (tanpa refresh)

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Solusi**: Pastikan file `.env.local` sudah dibuat dan berisi credentials yang benar.

### Error: "Row Level Security is enabled but no policy allows this operation"

**Solusi**: 
1. Pastikan RLS policies sudah dibuat
2. Pastikan user sudah login
3. Cek role user di tabel `users`

### Error: "Foreign key constraint violation"

**Solusi**: Pastikan data yang di-reference sudah ada:
- Saat create schedule, pastikan `course_id` dan `room_id` sudah ada
- Saat create course, pastikan `lecturer_id` sudah ada (atau NULL)

### Data tidak muncul

**Solusi**:
1. Cek apakah data sudah ada di Supabase Table Editor
2. Cek RLS policies apakah allow SELECT
3. Cek browser console untuk error
4. Pastikan environment variables sudah benar

### Realtime tidak bekerja

**Solusi**:
1. Pastikan RLS policy allow SELECT untuk tabel schedules
2. Cek browser console untuk error
3. Pastikan Supabase project masih aktif (free tier ada limit)

---

## 📊 Monitoring

### Cek Logs

1. Supabase Dashboard → **Logs**
2. Lihat API requests, errors, dll

### Cek Database Usage

1. Supabase Dashboard → **Settings** → **Usage**
2. Monitor database size, API calls, dll

---

## 🚀 Production Checklist

Sebelum deploy ke production:

- [ ] Environment variables sudah di-set di hosting (Vercel/Netlify)
- [ ] RLS policies sudah dikonfigurasi dengan benar
- [ ] Sample data sudah dihapus (jika ada)
- [ ] Password user sudah diubah dari default
- [ ] Database backup sudah dibuat
- [ ] Monitoring sudah di-setup

---

## 📝 Catatan Penting

1. **Free Tier Limits**:
   - 500 MB database
   - 2 GB bandwidth/month
   - 50,000 monthly active users

2. **Security**:
   - Jangan expose Service Role Key di frontend
   - Gunakan RLS untuk semua tabel
   - Validate input di backend

3. **Performance**:
   - Gunakan indexes untuk query yang sering digunakan
   - Batch operations jika memungkinkan
   - Pagination untuk data besar

---

**Selamat! Backend Supabase sudah siap digunakan! 🎉**

