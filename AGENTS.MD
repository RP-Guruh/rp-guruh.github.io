# AGENTS.md

Panduan untuk agen (AI coding assistant) yang mengerjakan proyek ini.

## 1. Ringkasan Proyek

Website portofolio sekaligus CV pribadi, berbentuk **desktop Windows XP interaktif**. Statis penuh (HTML, CSS, JavaScript murni), tanpa framework, tanpa backend, tanpa build step. Di-deploy ke **GitHub Pages** (`username.github.io`).

Pengunjung melihat layar monitor ala Windows XP dengan kursor, ikon desktop, taskbar, dan Start Menu. Klik ikon membuka jendela popup berisi konten CV/portofolio.

## 2. Aturan Utama

- Hanya HTML, CSS, dan vanilla JavaScript (ES6+). Dilarang memakai React/Vue/bundler/npm build.
- Semua path **relatif** agar berjalan di GitHub Pages (tanpa leading `/` yang bergantung domain).
- Seluruh isi konten disimpan di `js/data.js`. Jangan menulis data pribadi langsung di HTML/komponen.
- Gunakan aset bebas lisensi atau buatan sendiri. **Jangan** memakai file asli Microsoft (wallpaper Bliss, ikon, suara startup asli). Gunakan yang bergaya mirip.
- Library opsional yang boleh dipakai: [XP.css](https://botoxparty.github.io/XP.css/) via CDN atau salinan lokal.
- Kode harus berjalan dengan membuka `index.html` langsung atau lewat server statis sederhana.

## 3. Struktur Folder

```
/
├── index.html
├── cv.pdf
├── AGENTS.md
├── css/
│   ├── xp.css          # variabel warna, font, komponen dasar XP
│   ├── desktop.css     # wallpaper, ikon, taskbar, start menu
│   └── window.css      # jendela, title bar, tombol, konten
├── js/
│   ├── data.js         # SEMUA konten (data diri, pendidikan, dst.)
│   ├── windows.js      # logika jendela: buka, tutup, drag, z-index, minimize
│   ├── desktop.js      # ikon, seleksi, start menu, jam, shutdown
│   └── main.js         # inisialisasi, boot screen, deteksi mobile
└── assets/
    ├── icons/
    ├── cursors/
    ├── wallpaper/
    └── sounds/
```

## 4. Desain & Tampilan

### Desktop
- **Wallpaper**: pemandangan bukit hijau dan langit biru bergaya "Bliss" (versi buatan sendiri/lisensi bebas), `background-size: cover`.
- **Ikon desktop**: sisi kiri, tersusun vertikal, label putih dengan text-shadow.
- **Taskbar** (bawah, biru XP):
  - Tombol **Start** hijau di kiri.
  - Tombol jendela yang sedang terbuka di tengah.
  - Jam asli pengunjung di kanan (system tray).
- **Start Menu**: berisi 5 menu utama, opsi **Download CV (PDF)**, dan **Shut Down**.
- **Kursor**: kursor panah bergaya XP via `cursor: url(...)`. Kursor tangan saat hover ikon, kursor jam pasir saat jendela sedang dibuka/loading. Selalu sertakan fallback (`auto`, `pointer`, `wait`).

### Jendela
- Title bar gradien biru XP, ikon + judul di kiri, tombol **minimize / maximize / close** di kanan.
- Body berwarna krem/abu-abu klasik XP dengan border 3D.
- Font: Tahoma/Trebuchet MS, fallback sans-serif.

## 5. Menu & Isi Jendela

| No | Menu | Ikon | Isi |
|----|------|------|-----|
| 1 | Data Diri | Notepad / profil | Foto, nama, tanggal lahir, domisili, ringkasan profil, skill utama |
| 2 | Pendidikan | Buku / topi wisuda | Timeline: institusi, jurusan, tahun, IPK/prestasi |
| 3 | Pekerjaan | Tas / folder | Timeline: perusahaan, posisi, periode, tanggung jawab, pencapaian |
| 4 | Portofolio | Folder proyek / My Pictures | Grid proyek ala Windows Explorer: thumbnail, judul, deskripsi, teknologi, link demo/repo. Klik proyek membuka detail di jendela baru |
| 5 | Kontak | Amplop | Email, WhatsApp, LinkedIn, GitHub, tombol Download CV |

## 6. Perilaku Interaksi

- **Klik ikon** = pilih (highlight biru). **Double-click** = buka jendela. Di perangkat sentuh, **satu tap** langsung membuka.
- Jendela bisa **di-drag** lewat title bar, bisa tumpang tindih, dan jendela yang diklik naik ke depan (kelola `z-index`).
- **Minimize** menyembunyikan jendela dan menyisakan tombol di taskbar. Klik tombol taskbar untuk memulihkan/fokus.
- **Maximize** memenuhi area di atas taskbar, klik lagi untuk kembali ke ukuran semula.
- **Close** menghapus jendela dan tombol taskbar-nya.
- Satu jendela per menu: jika sudah terbuka, fokuskan, jangan duplikasi.
- Klik area kosong desktop membatalkan seleksi ikon dan menutup Start Menu.
- **Shut Down**: efek layar memudar ke hitam dengan opsi "Nyalakan kembali".
- **Opsional** (dapat dimatikan lewat flag di `data.js` atau `main.js`): layar boot/login singkat, suara startup dan klik. Suara tidak boleh autoplay sebelum ada interaksi pengguna.

## 7. Struktur Data (`js/data.js`)

Ekspor satu objek konfigurasi. Contoh bentuk:

```js
const SITE = {
  config: { bootScreen: true, sounds: false, language: "id" },
  profile: {
    name: "", birthDate: "", location: "", photo: "assets/photo.jpg",
    summary: "", skills: []
  },
  education: [
    { institution: "", major: "", start: "", end: "", gpa: "", notes: "" }
  ],
  experience: [
    { company: "", position: "", start: "", end: "", tasks: [], achievements: [] }
  ],
  projects: [
    { title: "", description: "", thumbnail: "", tech: [], demo: "", repo: "" }
  ],
  contact: {
    email: "", whatsapp: "", linkedin: "", github: "", cv: "cv.pdf"
  }
};
```

Gunakan data dummy yang jelas ditandai sampai pemilik mengisi data asli.

## 8. Responsif

- Di layar kecil (mis. lebar < 768px): jendela otomatis **fullscreen**, drag dinonaktifkan, ikon dibuat lebih besar, Start Menu menyesuaikan lebar layar.
- Gunakan unit fleksibel dan uji pada 360px, 768px, dan 1280px+.

## 9. Aksesibilitas & SEO

- Sediakan fallback konten CV dalam HTML biasa (di dalam `<noscript>` atau bagian tersembunyi yang dapat diakses) agar terbaca mesin pencari dan screen reader.
- Sediakan tombol **"Versi sederhana"** yang menampilkan CV sebagai halaman teks biasa untuk rekruter yang tidak ingin berinteraksi dengan UI XP.
- Elemen interaktif harus dapat diakses keyboard: `tabindex`, Enter untuk membuka ikon, Esc untuk menutup jendela, atribut `role` dan `aria-label` yang sesuai.
- Isi `<title>`, `<meta description>`, dan Open Graph tag dengan nama dan profesi pemilik.
- Hormati `prefers-reduced-motion` (matikan animasi boot/shutdown).

## 10. Deploy

1. Buat repo `username.github.io` dan push seluruh isi proyek ke branch `main`.
2. Aktifkan GitHub Pages: Settings, Pages, Source: `main` / root.
3. Pastikan `index.html` berada di root dan semua path relatif.

## 11. Alur Kerja Agen

1. Mulai dari struktur dasar: `index.html`, desktop, taskbar, jam.
2. Bangun sistem jendela (`windows.js`) dengan satu jendela contoh sebelum membuat semua menu.
3. Isi kelima menu dari `data.js`, render dinamis.
4. Tambahkan Start Menu, minimize/maximize, dan shutdown.
5. Tambahkan kursor, suara, dan boot screen (opsional).
6. Terapkan responsif, aksesibilitas, dan fallback SEO.
7. Uji manual di Chrome, Firefox, dan Safari, desktop dan mobile.

## 12. Checklist Sebelum Selesai

- [ ] Kelima ikon membuka jendela yang benar dan isinya berasal dari `data.js`
- [ ] Drag, minimize, maximize, close, dan fokus jendela berfungsi
- [ ] Start Menu dan Shutdown berfungsi
- [ ] Jam di taskbar akurat
- [ ] Kursor kustom tampil dengan fallback
- [ ] Tampilan mobile fullscreen dan bisa digunakan
- [ ] Fallback teks / versi sederhana tersedia
- [ ] Tidak ada aset berhak cipta Microsoft
- [ ] Semua path relatif dan berjalan di GitHub Pages
- [ ] `cv.pdf` tersedia dan tombol download berfungsi

## 13. Informasi yang Dibutuhkan dari Pemilik

- Data untuk 5 menu (draf kasar atau dummy dulu).
- Preferensi layar boot/login dan suara: pakai atau tidak.
- Bahasa konten: Indonesia, Inggris, atau dua bahasa.