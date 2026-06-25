# Wedding Undangan — Potensial Issue & Improvements

Ditemukan: 23 Jun 2026

---

## 🔴 Critical

### 1. og:image — Preview WA/Telegram kosong
Tidak ada `<meta property="og:image">`. Guest share link via WhatsApp atau Telegram → muncul URL doang tanpa gambar preview. Wedding invite channel utama adalah WA.

**Fix:** Generate foto couple, simpan di `assets/og-image.jpg`, tambah:
```html
<meta property="og:image" content="https://eko-and-melati.github.io/wedding-invitation/assets/og-image.jpg" />
<meta name="twitter:image" content="https://eko-and-melati.github.io/wedding-invitation/assets/og-image.jpg" />
```

---

### 2. IntersectionObserver — Halaman kosong di browser tua **[✓ FIXED]**
`IntersectionObserver` dipakai buat fade-in section. Browser tua (Android WebView 4.x, IE11, UC Browser lawas) tidak support → `new IntersectionObserver()` throw error → semua section tetap `opacity: 0` → invisible.

**Fix:** Wrapper try-catch + fallback langsung visible:
```js
try {
  const obs = new IntersectionObserver(...);
} catch {
  sections.forEach(s => s.classList.remove("section-hidden"));
}
```

---

### 3. `decodeURIComponent` crash kalau URL rusak
```js
App.guestName = decodeURIComponent(to.trim());
```
Guest kirim link rusak `?to=%ZZ` (malformed encoding) → `decodeURIComponent` throw `URIError` → seluruh `initMode()` gagal → undangan error.

**Fix:** Wrapper try-catch + fallback ke raw string:
```js
try {
  App.guestName = decodeURIComponent(to.trim());
} catch {
  App.guestName = to.trim();
}
```

---

## 🟡 Medium

### 4. RSVP sukses palsu — Apps Script error tidak terdeteksi **[✓ FIXED]**
RSVP form submit → POST ke Apps Script. Apps Script return 302 redirect (balik ke halaman kosong) → `fetch()` tidak throw → kode anggap sukses → toast "Sukses 🎉" + localStorage set. Tapi data belum tentu masuk Sheet.

**Fix:** Cek response status/body setelah submit. Atau minimal validasi bahwa data muncul di get.
**Status:** Partial fix — toast notif + `text/plain` content type. Data nyimpan meski redirect.

---

### 5. RSVP duplikat — localStorage bisa dihapus
Dedup cuma pake `localStorage.getItem("rsvp_submitted")`. Guest ganti HP, clear cookie, buka private mode, atau hapus data situs → bisa RSVP lagi. Sheet kena duplikat.

**Fix:** Server-side dedup via Google Sheets `QUERY` atau check existing guest_name. Atau ack di PRD sebagai known limitation.

---

### 6. Informasi deadline H-7 tidak ditampilkan ke guest **[✓ FIXED]**
PRD §6.4 RSVP deadline H-7 sudah diimplement (form closed otomatis). Tapi guest tidak dikasih tau ada deadline. Guest ngisi form, tiba-tiba closed tanpa penjelasan.

**Fix:** Tampilkan info deadline di atas form RSVP: _"Konfirmasi kehadiran paling lambat 1 Agustus 2026"_ (dinamis dari tanggal event).

---

### 7. Edit RSVP — tidak ada mekanisme perubahan
Setelah submit RSVP, guest tidak bisa edit. Kalau tadinya "Hadir" berubah jadi "Tidak Hadir" (atau sebaliknya), tidak ada cara update.

**Fix:** Izinkan re-submit kalau masih sebelum deadline. Timpa data lama berdasarkan `guest_name` + `source_url`. Atau kirim payload `update_existing: true`.

---

### 8. Setelah RSVP — tidak ada tampilan konfirmasi
Setelah submit RSVP, form disembunyikan, toast muncul sebentar lalu hilang. Guest tidak bisa lihat kembali apa yang sudah diisi (hadir/tidak, jumlah tamu).

**Fix:** Setelah submit, tampilkan kartu konfirmasi:
> ✅ Status: Hadir
> Jumlah: 2 orang
> Pesan: —
> [Ubah] (kalau masih sebelum deadline)

---

## 🟢 Minor

### 9. Font loading lambat di koneksi lambat
5+ file font (Cormorant 4 weight, Inter 3 weight, Scheherazade 2 weight). Page render delay sampai font selesai download.

**Fix:** Font subsetting, kurangi weight, atau gunakan `font-display: swap`.

---

### 10. Tidak ada `font-display: swap`
Google Fonts link default `display=block` → browser sembunyikan text sampai font selesai load (FOIT). Di koneksi lambat text invisible beberapa detik.

**Fix:** Tambah `&display=swap` di Google Fonts URL (jika belum ada).

---

### 11. Tidak ada share button **[✓ FIXED]**
Guest tidak ada cara mudah buat copy link undangan dari page.

**Fix:** Floating share button → copy link ke clipboard + native share API.

---

### 12. Cover fade-out transisi kurang smooth
Cover `fade-out` 600ms, terus `remove()`. Hero di belakang cover muncul mentah. Transisi terasa janggal.

**Fix:** Tambah delay kecil + hero fade-in setelah cover hilang.

---

### 13. Guest bisa isi nama sembarang di RSVP/wish
Field name free text. Guest bisa isi nama orang lain atau nickname aneh. Tidak ada validasi.

**Fix:** Minimal disabled field (pake nama dari `?to=`), atau validasi server-side.

---

### 14. Wishes loading lama — no retry
Kalau Apps Script cold start (1-2 detik), wishes muncul telat. Kalau error, loading text hilang diam-diam tanpa notif.

**Fix:** Tambah timeout/retry, atau cache wishes terakhir di localStorage.

---

## 📝 Catatan Boss Eko

| # | Feedback | Status |
|---|----------|--------|
| 1 | RSVP sukses pake **toast popup**, bukan cuma teks di form | ✅ Done |
| 2 | Wish langsung muncul tanpa refresh setelah kirim | ✅ Done |
| 3 | Nav gak perlu Countdown — dihapus | ✅ Done |
| 4 | Nav Couple/Mempelai dihilangkan | ✅ Done |
| 5 | Meta title & description yg menarik | ✅ Done |
| 6 | **Content flow:** Cover → Hero (Bismillah → Assalamu → Yth. → nama tamu) → Couple (3-line: Putra/Putri dari) → Closing (hormat → ortu → Wassalam) | ✅ Done |
| 7 | Font: **Cormorant** (heading) + **Inter** (body) | ✅ Done |
| 8 | Opening cover hanya muncul di **mode invite** (`?to=`), announce langsung hero | ✅ Done |
| 9 | Nama tamu di cover + assalamu'alaikum per baris eksplisit | ✅ Done |
| 10 | Gak suka ukuran judul section terlalu besar | ✅ Done |
| 11 | **Ornamen SVG** — top + bottom, bukan foto | ✅ Done |
| 12 | **Mode announce vs invite** jelas bedanya | ✅ Done |
| 13 | Nav cukup 5 item: **Home · Acara · Map · RSVP · Ucapan** | ✅ Done |
| 14 | Ingin warna elegan — dark text, cream bg, gold + sage accent | ✅ Done |
