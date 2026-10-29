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
| `index.html` + `js/path.js` | Jalur belajar (peta pelajaran) | Ketua |
| `simulator.html` + `js/engine.js` | Mesin pelajaran: Periksa → Tanda bahaya → Tindakan | Ketua |
| `js/phone.js` | Menggambar HP simulasi (chat, SMS, email, notifikasi) | Ketua |
| `rapor.html` + `js/report.js` | Rapor hasil belajar | Ketua |
| `js/logic.js` | Penilaian, XP, rapor, penyimpanan (tanpa tampilan, ada tesnya) | Ketua |
| `js/scenarios.js` | **Isi semua skenario** | Konten |
| `js/questions.js` | 5 Pertanyaan Sebelum Klik | Konten |
| `css/style.css` | Semua tampilan | Tampilan |
| `js/ui.js` | Bantuan tampilan: elemen, ikon, maskot Lupi | Tampilan |

Halaman "Lagi Ragu?" dan "Sudah Telanjur?" belum dibuat (bagian Anggota 4, lihat `docs/`).

## Menambah atau mengedit skenario

1. Buka `js/scenarios.js`. Aturan dan format ada di komentar paling atas.
2. Salin satu skenario yang mirip, ganti `id` dan isinya.
3. Jalankan tes (di bawah). Tes akan memberi tahu kalau ada tanda yang lupa ditandai atau penjelasan yang kosong.

`engine.js` tidak perlu diubah untuk menambah skenario.

## Tes

```bash
node --test                      # logika + pemeriksaan isi skenario (butuh Node.js)
python tests/e2e_flow.py         # main semua pelajaran di browser (butuh Python + Playwright)
```

Tes E2E juga memastikan tidak ada error JavaScript, tidak ada permintaan jaringan keluar,
dan klik ganda tidak melompati umpan balik.
