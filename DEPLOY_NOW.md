# 🚀 Panduan Deploy Sekarang - Aplikasi Penjadwalan Kuliah

## ✅ Status Build
**Build berhasil!** Folder `dist/` sudah siap untuk di-deploy.

---

## 🎯 Opsi Deployment (Pilih Salah Satu)

### Opsi 1: Vercel (Paling Mudah & Cepat) ⭐ RECOMMENDED

#### Via Website (Drag & Drop)
1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub/GitLab/Email
3. Klik **"Add New..."** → **"Project"**
4. Pilih tab **"Import"** atau langsung drag & drop folder `dist/` ke halaman
5. Vercel akan otomatis detect dan deploy
6. Tunggu beberapa detik, dapat URL langsung!

#### Via CLI
```bash
npm install -g vercel
vercel
```
Ikuti instruksi di terminal.

**Keuntungan:**
- ✅ Gratis untuk personal projects
- ✅ Auto HTTPS
- ✅ Custom domain gratis
- ✅ Auto-deploy dari GitHub (jika connect)

---

### Opsi 2: Netlify (Mudah & Gratis)

#### Via Website (Drag & Drop)
1. Buka [netlify.com](https://netlify.com)
2. Login dengan GitHub/Email
3. Drag & drop folder `dist/` ke area "Deploy manually"
4. Tunggu beberapa detik, dapat URL!

#### Via CLI
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Keuntungan:**
- ✅ Gratis
- ✅ Auto HTTPS
- ✅ Form handling gratis
- ✅ Custom domain gratis

---

### Opsi 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json** (tambahkan script):
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**:
   - Buka repository di GitHub
   - Settings → Pages
   - Source: pilih branch `gh-pages`
   - URL akan tersedia di: `https://username.github.io/repo-name`

---

### Opsi 4: Cloudflare Pages

1. Buka [pages.cloudflare.com](https://pages.cloudflare.com)
2. Login dengan Cloudflare account
3. Connect dengan GitHub repository
4. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Deploy!

---

## 📋 Checklist Sebelum Deploy

- [x] ✅ Dependencies terinstall (`npm install`)
- [x] ✅ Build berhasil (`npm run build`)
- [x] ✅ Folder `dist/` sudah dibuat
- [ ] ⚠️ Test aplikasi di local (opsional): `npm run dev`

---

## 🔍 Verifikasi Setelah Deploy

Setelah deploy, pastikan:
1. ✅ Website bisa diakses
2. ✅ Login page muncul
3. ✅ Navigasi bekerja
4. ✅ Semua gambar ter-load
5. ✅ Responsive di mobile

---

## 🐛 Troubleshooting

### Build Error
```bash
# Clear cache dan rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Routing tidak bekerja
- Pastikan hosting provider sudah dikonfigurasi untuk SPA
- File `vercel.json` dan `netlify.toml` sudah ada di root project

### Asset tidak ter-load
- Pastikan path asset menggunakan relative path
- Check console browser untuk error 404

---

## 📝 Catatan Penting

⚠️ **Data Storage:**
- Saat ini aplikasi menggunakan **mock data** (localStorage)
- Data tidak persisten antar device/browser
- Untuk production dengan data real, perlu integrasi Supabase (lihat `SUPABASE_INTEGRATION.md`)

---

## 🎉 Langkah Cepat Deploy Sekarang

**Paling Cepat (Vercel):**
1. Buka [vercel.com](https://vercel.com)
2. Login
3. Drag folder `dist/` ke halaman
4. Selesai! 🎊

**Atau via Terminal:**
```bash
npm install -g vercel
vercel --prod
```

---

**Selamat deploy! 🚀**

