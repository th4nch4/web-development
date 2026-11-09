# CekDulu

Latihan memeriksa pesan sebelum klik, untuk lomba **The Trust Trap: Navigating Digital Deception**.
Pengguna menerima pesan fiktif di HP simulasi, memeriksa pengirim, link, dan file, memilih tanda bahaya
dari **5 Pertanyaan Sebelum Klik**, lalu memutuskan tindakan. Setiap langkah langsung dinilai:
hijau kalau benar, kuning kalau hampir (sebagian benar di soal pilih banyak), merah kalau salah.
Pelatihnya **Coach Wall**, karakter buatan sendiri yang bereaksi di setiap jawaban.

- Tanpa login, tanpa server, tanpa AI. Semua berjalan di browser.
- Progres dan XP hanya disimpan di perangkat pengguna (`localStorage`).
- Semua pesan, nama, nomor, dan alamat **fiktif**.
- Soal suara (materi Voice Phishing) memakai suara bawaan perangkat lewat `speechSynthesis`, **hanya suara yang
  terpasang di perangkat** (`localService`), jadi kalimatnya tidak dikirim ke server. Kalau perangkat tidak punya
  suara untuk bahasa itu, kalimatnya ditampilkan sebagai teks. Teksnya juga selalu bisa dibuka lewat "Lihat teks".

## Cara membuka

Klik dua kali `index.html`, atau pakai Live Server di VS Code. Tidak perlu install apa pun.

## Struktur

| File | Isi | Pemegang |
|---|---|---|
| `index.html` + `js/path.js` | Beranda: peta level. Dunia 1 dan 2 berisi pelajaran (berurutan), Dunia 3 "Teluk Phishing" berisi materi (urutan bebas) | Ketua |
| `js/welcome.js` + `css/welcome.css` | Sambutan beranda: Coach Wall menyapa, janji privasi, fakta IASC, dan jalan cepat (pesan asli + penelepon misterius) di layar kunci mini. Setelah ada progres menyusut jadi janji privasi + jalan cepat yang belum dicoba | Ketua |
| `js/world.js` | Gambar dunia di peta (langit, kota, laut, hiasan), jalan berliku, transisi masuk level | Tampilan |
| `materi.html` + `js/belajar.js` | Materi "Kenali jenis phishing": kartu penjelasan, mini kuis, dan soal suara penelepon misterius | Ketua |
| `js/materi.js` | **Isi materi phishing** (Vishing, Email, SMS, Chat & Medsos, QR), termasuk kalimat penelepon di soal suara | Konten |
| `kilat.html` + `js/kilat.js` | Ronde Kilat "Asli atau Penipuan?" (ada mode tanpa waktu) | Ketua |
| `js/kit.js` | Bagian umum halaman soal: tombol utama, lembar hasil (hijau/kuning/merah), Coach Wall, pilihan | Ketua |
| `js/sound.js` | Efek suara dan getar saat menjawab (dibuat di browser, bisa dimatikan di ⚙) | Tampilan |
| `simulator.html` + `js/engine.js` | Mesin pelajaran: Periksa → Tanda bahaya → Tindakan | Ketua |
| `js/phone.js` | Menggambar HP simulasi bergaya iPhone (chat ala WhatsApp, SMS, email, layar kunci) | Ketua |
| `rapor.html` + `js/report.js` | Rapor hasil belajar | Ketua |
| `js/logic.js` | Penilaian, XP, rapor, penyimpanan (tanpa tampilan, ada tesnya) | Ketua |
| `js/scenarios.js` | **Isi semua skenario** | Konten |
| `js/questions.js` | 5 Pertanyaan Sebelum Klik | Konten |
| `css/style.css` | Tampilan umum: token warna, tombol, halaman soal, lembar hasil, layar selesai, rapor | Tampilan |
| `css/world.css` | Peta beranda dan dunia bertema | Tampilan |
| `css/phone.css` | HP simulasi (hanya `simulator.html`) | Tampilan |
| `css/coach.css` | Gerakan Coach Wall, api streak, soal suara | Tampilan |
| `css/dialog.css` | Dialog buatan sendiri (pengganti `confirm()` browser) dan jendela Pengaturan | Tampilan |
| `js/coach.js` | Gambar Coach Wall (9 ekspresi) dan penelepon misterius, SVG buatan sendiri | Tampilan |
| `js/ui.js` | Bantuan tampilan: elemen, ikon, Coach Wall yang bisa diketuk, lembar hasil, dialog, streak | Tampilan |
| `js/settings.js` | Jendela Pengaturan ⚙ di tengah layar dengan menu Umum (suara, getar, suara penelepon, waktu Ronde Kilat, hapus progres), Tampilan (tema, animasi, konfeti), Bahasa | Tampilan |
| `js/lang.js` + `js/strings.js` | Bahasa Indonesia/English: teks tombol dan judul (`strings.js`), pemilih file isi per bahasa | Tampilan |
| `js/en/` | Terjemahan English dari `questions.js`, `scenarios.js`, `materi.js` (id dan susunan harus sama) | Konten |
| `img/` | Wallpaper alam buatan sendiri (SVG, hanya warna palet, bebas hak cipta) | Tampilan |
| `fonts/` | Huruf Nunito (teks) dan Fredoka (judul), lisensi OFL di `fonts/OFL-*.txt`, disimpan lokal tanpa CDN | Tampilan |

Kalau mengubah materi, cek ulang nama merek dan alamat situs di `js/materi.js` sebelum dikumpulkan.

## Warna

Warna utama tetap 5 warna palet ini (ada di bagian atas `css/style.css`):
Seashell `#FFF4EB`, Wheat `#F6E0B6`, Powder Blue `#A6BCC9`, French Blue `#3E4B8E`, Midnight Violet `#3D1534`.
Jangan menambah warna lain tanpa persetujuan ketua. Pakai variabel CSS (`var(--french)` dll.), bukan kode hex baru.

Pengecualian yang sudah disetujui ketua:
- mode gelap memakai latar abu-abu gelap (`--charcoal`, `--graphite`, `--slate`), bukan ungu;
- status jawaban: hijau benar (`--green`), kuning hampir (`--yellow`), merah salah (`--red`);
- api streak (jumlah level selesai): oranye (1-2), biru (3-4), pink (5 ke atas);
- warna kulit, rambut, dan peluit Coach Wall (hanya di `js/coach.js`).

Status tidak hanya ditunjukkan warna: setiap pilihan yang dinilai juga diberi label teks (Benar, Terlewat, Keliru).

## Menambah atau mengedit skenario

1. Buka `js/scenarios.js`. Aturan dan format ada di komentar paling atas.
2. Salin satu skenario yang mirip, ganti `id` dan isinya.
3. Tulis juga versi English-nya di `js/en/scenarios.js`: `id`, urutan, dan susunannya harus sama, hanya teksnya yang diterjemahkan.
4. Jalankan tes (di bawah). Tes akan memberi tahu kalau ada tanda yang lupa ditandai, penjelasan yang kosong,
   atau versi English yang susunannya beda.

Teks tombol dan judul (bukan isi pelajaran) ada di `js/strings.js`, Indonesia dan English berdampingan.

`engine.js` tidak perlu diubah untuk menambah skenario.

## Tes

```bash
node --test                      # logika + isi skenario dan terjemahannya + teks dua bahasa (butuh Node.js)
python tests/e2e_flow.py         # main semua pelajaran + halaman bantuan di browser (butuh Python + Playwright)
```

Tes E2E memainkan semuanya di 4 ukuran layar, lalu sekali lagi dalam bahasa English.
Tes ini juga memastikan tidak ada error JavaScript, tidak ada permintaan jaringan keluar,
tidak ada jendela bawaan browser (alert/confirm), klik ganda tidak melompati umpan balik,
halaman soal tidak pernah digulir (HP simulasi dan pertanyaan tetap di tempat, hanya daftar jawaban
yang boleh digulir), Pengaturan dan dialog keluar bekerja, streak bertambah satu per level selesai,
level terkunci menjelaskan alasannya, ukuran teks paling besar tetap muat satu layar,
soal suara tetap bisa dijawab tanpa suara, dan hapus progres benar-benar menghapus.
