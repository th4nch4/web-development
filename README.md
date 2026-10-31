# CekDulu

Latihan memeriksa pesan sebelum klik, untuk lomba **The Trust Trap: Navigating Digital Deception**.
Pengguna menerima pesan fiktif di HP simulasi, memeriksa pengirim, link, dan file, memilih tanda bahaya
dari **5 Pertanyaan Sebelum Klik**, lalu memutuskan tindakan. Setiap langkah langsung dinilai.

- Tanpa login, tanpa server, tanpa AI. Semua berjalan di browser.
- Progres dan XP hanya disimpan di perangkat pengguna (`localStorage`).
- Semua pesan, nama, nomor, dan alamat **fiktif**.

## Cara membuka

Klik dua kali `index.html`, atau pakai Live Server di VS Code. Tidak perlu install apa pun.

## Struktur

| File | Isi | Pemegang |
|---|---|---|
| `index.html` + `js/path.js` | Beranda: jalur belajar (peta pelajaran) | Ketua |
| `materi.html` + `js/belajar.js` | Materi "Kenali jenis phishing": kartu penjelasan + mini kuis | Ketua |
| `js/materi.js` | **Isi materi phishing** (Vishing, Email, SMS, Chat & Medsos, QR) | Konten |
| `kilat.html` + `js/kilat.js` | Ronde Kilat "Asli atau Penipuan?" (ada mode tanpa waktu) | Ketua |
| `js/kit.js` | Bagian umum halaman soal: tombol utama, lembar hasil, Lupi, pilihan | Ketua |
| `js/sound.js` | Efek suara (dibuat di browser, bisa dimatikan di ⚙) | Tampilan |
| `simulator.html` + `js/engine.js` | Mesin pelajaran: Periksa → Tanda bahaya → Tindakan | Ketua |
| `js/phone.js` | Menggambar HP simulasi bergaya iPhone (chat ala WhatsApp, SMS, email, layar kunci) | Ketua |
| `rapor.html` + `js/report.js` | Rapor hasil belajar | Ketua |
| `js/logic.js` | Penilaian, XP, rapor, penyimpanan (tanpa tampilan, ada tesnya) | Ketua |
| `js/scenarios.js` | **Isi semua skenario** | Konten |
| `js/questions.js` | 5 Pertanyaan Sebelum Klik | Konten |
| `css/style.css` | Semua tampilan | Tampilan |
| `js/ui.js` | Bantuan tampilan: elemen, ikon (termasuk ikon 5 Pertanyaan), maskot Lupi | Tampilan |
| `js/theme.js` | Tampilan Sistem/Terang/Gelap (bawaan: Sistem) dan tombol pengaturan ⚙ | Tampilan |
| `img/` | Wallpaper alam buatan sendiri (SVG, hanya warna palet, bebas hak cipta) | Tampilan |
| `fonts/` | Huruf judul Bricolage Grotesque (lisensi OFL di `fonts/OFL.txt`), disimpan lokal tanpa CDN | Tampilan |

Kalau mengubah materi, cek ulang nama merek dan alamat situs di `js/materi.js` sebelum dikumpulkan.

## Warna

Seluruh website hanya memakai 5 warna palet ini (ada di bagian atas `css/style.css`):
Seashell `#FFF4EB`, Wheat `#F6E0B6`, Powder Blue `#A6BCC9`, French Blue `#3E4B8E`, Midnight Violet `#3D1534`.
Jangan menambah warna lain tanpa persetujuan ketua. Pakai variabel CSS (`var(--french)` dll.), bukan kode hex baru.
Satu pengecualian yang sudah disetujui: mode gelap memakai latar abu-abu gelap (`--charcoal`, `--graphite`, `--slate`), bukan ungu.

## Menambah atau mengedit skenario

1. Buka `js/scenarios.js`. Aturan dan format ada di komentar paling atas.
2. Salin satu skenario yang mirip, ganti `id` dan isinya.
3. Jalankan tes (di bawah). Tes akan memberi tahu kalau ada tanda yang lupa ditandai atau penjelasan yang kosong.

`engine.js` tidak perlu diubah untuk menambah skenario.

## Tes

```bash
node --test                      # logika + pemeriksaan isi skenario (butuh Node.js)
python tests/e2e_flow.py         # main semua pelajaran + halaman bantuan di browser (butuh Python + Playwright)
```

Tes E2E juga memastikan tidak ada error JavaScript, tidak ada permintaan jaringan keluar,
klik ganda tidak melompati umpan balik, dan setiap soal muat satu layar tanpa gulir.
