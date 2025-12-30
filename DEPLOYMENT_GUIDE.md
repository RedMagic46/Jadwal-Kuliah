# 🚀 Panduan Deployment Aplikasi Penjadwalan Kuliah

## Status Aplikasi Saat Ini

✅ **Siap untuk di-deploy sebagai static website**
- Menggunakan mock data (tidak perlu backend)
- Semua fitur frontend sudah lengkap
- Bisa langsung di-build dan di-deploy

⚠️ **Catatan**: 
- Data disimpan di localStorage browser (tidak persisten antar device)
- Untuk production dengan data real, perlu integrasi Supabase (lihat `SUPABASE_INTEGRATION.md`)

---

## 📦 Cara Build Aplikasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Build untuk Production
```bash
npm run build
```

Setelah build selesai, folder `dist/` akan berisi file-file yang siap di-deploy.

---

## 🌐 Opsi Deployment

### Opsi 1: Vercel (Paling Mudah & Gratis)

1. **Install Vercel CLI** (opsional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Atau langsung drag & drop folder `dist/` ke [vercel.com](https://vercel.com)

3. **Deploy via GitHub** (Recommended):
   - Push code ke GitHub
   - Buka [vercel.com](https://vercel.com)
   - Import project dari GitHub
   - Vercel akan auto-detect Vite dan deploy otomatis

**Konfigurasi Vercel** (otomatis untuk Vite):
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

### Opsi 2: Netlify (Gratis & Mudah)

1. **Via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

2. **Via Netlify Dashboard**:
   - Buka [netlify.com](https://netlify.com)
   - Drag & drop folder `dist/` ke Netlify
   - Atau connect dengan GitHub untuk auto-deploy

**Netlify Configuration** (buat file `netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Opsi 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
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
   - Buka Settings → Pages di repository GitHub
   - Pilih branch `gh-pages` sebagai source

---

### Opsi 4: Cloudflare Pages

1. **Via Cloudflare Dashboard**:
   - Buka [pages.cloudflare.com](https://pages.cloudflare.com)
   - Connect dengan GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Build output directory: `dist`

---

### Opsi 5: Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init hosting
   ```
   - Pilih `dist` sebagai public directory
   - Configure as single-page app: Yes

3. **Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

---

## 🔧 Konfigurasi Tambahan

### Untuk Vite SPA (Single Page Application)

Pastikan semua route di-redirect ke `index.html`. File `vite.config.ts` sudah benar, tapi pastikan hosting provider mendukung SPA routing.

**Contoh untuk Netlify** (`netlify.toml`):
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Contoh untuk Vercel** (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📝 Checklist Sebelum Deploy

- [ ] Test aplikasi di local dengan `npm run dev`
- [ ] Build aplikasi dengan `npm run build`
- [ ] Test build lokal dengan `npm run preview` (jika tersedia)
- [ ] Pastikan semua asset (gambar, font) ter-load dengan benar
- [ ] Test di berbagai browser (Chrome, Firefox, Safari)
- [ ] Test responsive design di mobile

---

## 🔄 Auto-Deploy dengan GitHub Actions

Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🎯 Setelah Deploy

1. **Test semua fitur** di production URL
2. **Monitor performance** dengan tools seperti:
   - Google PageSpeed Insights
   - Lighthouse
3. **Setup custom domain** (opsional)
4. **Enable HTTPS** (otomatis di Vercel/Netlify)

---

## 🔐 Untuk Production dengan Backend Real

Jika ingin menggunakan data real (bukan mock data):

1. **Setup Supabase** (lihat `SUPABASE_INTEGRATION.md`)
2. **Install Supabase client**:
   ```bash
   npm install @supabase/supabase-js
   ```
3. **Setup environment variables** di hosting provider
4. **Update code** untuk menggunakan Supabase (bukan mock data)

---

## 📞 Troubleshooting

### Build Error
- Pastikan semua dependencies ter-install: `npm install`
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Routing tidak bekerja setelah deploy
- Pastikan hosting provider dikonfigurasi untuk SPA routing
- Tambahkan redirect rules (lihat konfigurasi di atas)

### Asset tidak ter-load
- Pastikan path asset menggunakan relative path
- Check console browser untuk error 404

---

**Selamat deploy! 🎉**

