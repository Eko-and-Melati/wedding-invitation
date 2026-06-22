# Wedding Invitation Web App

## Referensi Dokumen
- PRD: `PRD-wedding-invitation-v1.1.0.md`
- Implementation Plan: `IMPLEMENTATION-PLAN-wedding-invitation.md`

## Stack
- Pure HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- Deploy target: GitHub Pages (STATIC ONLY)
- Storage: Google Sheets + Google Apps Script
- TIDAK BOLEH pakai framework (React, Vue, Next.js, Nuxt, dll)
- TIDAK BOLEH ada file yang butuh `npm build` atau compile step
- TIDAK BOLEH ada backend server atau database sendiri

## Struktur File
```
/
├── index.html
├── style.css
├── script.js
├── config.js
├── i18n.js
├── assets/
│   ├── ornament-top.svg
│   ├── ornament-bottom.svg
│   └── favicon.ico
└── apps-script/
    └── Code.gs
```

## Aturan Coding

### General
- Mobile-first layout, target load < 3 detik di 4G
- Semua konten dikontrol dari `config.js` — jangan hardcode nama, tanggal, atau teks di HTML/JS
- Semua string UI (label, pesan, placeholder) ada di `i18n.js` — support ID dan EN
- Tidak ada `console.log` yang tertinggal di production code

### HTML
- Semantic HTML5
- Semua section punya `id` yang sesuai implementation plan
- `data-i18n` attribute untuk semua teks yang perlu diterjemahkan
- Gunakan `hidden` class untuk elemen yang disembunyikan secara kondisional

### CSS
- CSS variables di `:root` untuk warna dan font
- Tidak pakai CSS framework (Bootstrap, Tailwind, dll)
- Semua warna dari `var(--*)`, jangan hardcode hex di luar `:root`
- Hindari pink dan ungu

### JavaScript
- Vanilla JS, ES6+, tidak ada dependency eksternal
- Semua logika ada di `script.js`
- `escapeHtml()` wajib dipakai untuk semua output dari user input ke DOM
- `localStorage` untuk: bahasa, flag RSVP sudah submit
- Fetch ke Apps Script pakai `try/catch`, error jangan crash halaman

### config.js
- Satu-satunya file yang boleh diedit untuk update konten
- Endpoint Apps Script disimpan di sini
- Jangan simpan secret/API key di sini (semua Apps Script endpoint bersifat public)

## Fitur Utama

### Mode
- `invite` — aktif jika URL punya `?to=NamaTamu`, tampilkan RSVP
- `announce` — default jika tidak ada `?to=`, tanpa RSVP

### RSVP
- Hanya di mode `invite`
- Tutup otomatis H-7 sebelum tanggal acara
- Cegah double submit via `localStorage`
- Submit ke Apps Script POST endpoint

### Guest Wish
- Tersedia di kedua mode
- Fetch dari Apps Script GET endpoint saat page load (no polling)
- Render dengan `escapeHtml()` untuk keamanan XSS

### Countdown
- Update tiap detik via `setInterval`
- Target dari `CONFIG.events` yang `isCountdownTarget: true`
- Jika sudah lewat → tampil pesan "hari telah tiba"

### Maps
- Wajib ada embed Google Maps + tombol buka di Google Maps
- Render dari `CONFIG.events`

### Language Toggle
- Sticky button pojok kanan bawah
- Switch tanpa reload halaman
- Simpan preferensi ke `localStorage`

## Apps Script
- Satu endpoint untuk RSVP dan Wish (dibedakan field `type`)
- Harus return CORS header: `Access-Control-Allow-Origin: *`
- Handle `doGet` (fetch wishes) dan `doPost` (submit RSVP/wish)
- Source ada di `apps-script/Code.gs` — tidak di-deploy dari sini, copy manual ke Google Apps Script

## Testing Lokal
```bash
cd /home/ekorudiawan/development/wedding-invitation-app
python3 -m http.server 8080
```
Buka: `http://localhost:8080`

Test mode invite: `http://localhost:8080?to=NamaTamu`

## Git Commit Convention
- `feat:` fitur baru
- `fix:` bug fix
- `chore:` setup, config, non-code changes
- `style:` perubahan CSS/visual
- `docs:` perubahan dokumentasi

Commit setiap task selesai sesuai implementation plan.
