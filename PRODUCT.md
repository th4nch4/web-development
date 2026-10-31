# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Remaja dan dewasa muda Indonesia, 15–24 tahun. Mereka menerima chat, SMS, dan email setiap hari di HP, dan sesekali mendapat pesan yang meragukan: undangan berupa file .apk, paket tertahan, akun bank "diblokir", teman yang meminta kode OTP.

Tugas mereka ada dua:
- melatih kebiasaan memeriksa pesan sebelum mengeklik;
- mendapat bantuan saat sedang ragu, atau setelah telanjur mengeklik.

HP adalah perangkat utama mereka.

Audiens kedua adalah juri lomba. Mereka membuka link langsung sekali, sekitar 3 menit, dan membandingkannya dengan banyak entri lain.

## Product Purpose

CekDulu adalah entri lomba web internasional dengan studi kasus "The Trust Trap: Navigating Digital Deception". Produk ini membantu anak muda Indonesia:
- **Recognize:** mengenali penipuan digital;
- **Learn:** melatih keputusan yang aman;
- **Act:** tahu langkah berikutnya.

Sukses berarti juri bisa menyelesaikan satu alur di link langsung tanpa error, merasakan bantuan nyata "di saat ragu", dan melihat bahwa privasi, keamanan, serta kejujuran benar-benar dijaga. Kedalaman lebih penting daripada jumlah fitur.

## Positioning

Empat hal yang membedakan CekDulu dan harus dijaga di semua pekerjaan berikutnya:

1. **Periksa dulu, baru dibongkar.** Pengguna mengetuk pengirim, link, atau file di HP simulasi dan melihat faktanya, misalnya alamat asli di balik tombol. Setelah itu mereka menilai sendiri lewat 5 Pertanyaan Sebelum Klik, lalu tanda yang ditemukan dan yang terlewat disorot di pesan.
2. **Tidak semua pesan itu penipuan.** Ada pesan asli. Mencurigai pesan asli dihitung keliru, dan nadanya tidak menakut-nakuti.
3. **Bantuan saat ragu.** "Lagi Ragu?" memeriksa pesan nyata dengan 5 pertanyaan dan tidak pernah menyimpulkan "aman". "Sudah Telanjur?" berisi langkah darurat dan kontak resmi.
4. **Privasi total.** Tanpa login, tanpa server, tanpa AI. Tidak ada data yang dikirim ke mana pun.

## Operating Context

- **Juri** membuka link langsung, biasanya di laptop atau HP, sekali kunjungan. README dan video demo menjelaskan pendekatannya.
- **Pengguna** membuka web saat sedang memegang pesan yang meragukan di aplikasi lain, atau saat berlatih.
- **Tim** terdiri dari 4 orang. Ketua membangun bersama Claude Code; tiga anggota lain hanya menguasai HTML/CSS/JS dasar, jadi kode harus tetap mudah mereka ubah.
- **Jadwal:**
  - feature freeze: Rabu, 4 November 2026;
  - uji pengguna: Kamis, 5 November 2026;
  - target kumpul: Senin, 9 November 2026;
  - batas akhir lomba: Selasa, 10 November 2026.

## Capabilities and Constraints

**Yang sudah ada:**
- Beranda dengan jalur belajar: 6 pelajaran dalam 2 bagian, XP, dan maskot Lupi (kaca pembesar).
- Simulator pelajaran: Periksa → Tanda bahaya → Tindakan → Selesai.
- Rapor.
- `ragu.html` ("Lagi Ragu?") dan `telanjur.html` ("Sudah Telanjur?").

**Batasan teknis dan isi:**
- HTML/CSS/JS polos dengan script klasik, tanpa ES module dan tanpa build. Halaman harus bisa dibuka langsung dari `file://`.
- Isi skenario ada di `js/scenarios.js`, terpisah dari mesin (`js/engine.js`).
- Progres hanya disimpan di `localStorage`.
- Semua contoh fiktif. Merek seperti Bank Arunika, Ekspedisi Lintang, dan Pasar Rimbun dikarang.
- Tidak meminta data sensitif.
- Tidak pernah mengklaim bisa mendeteksi penipuan dengan pasti.
- Kalau suatu saat ada input yang dikirim ke pihak ketiga, harus diungkap dengan jelas.

**Sudah diputuskan untuk tidak dibuat:**
- login atau sign up, karena bertentangan dengan janji "Tanpa login" dan aturan lomba;
- hearts/nyawa, streak, dan leaderboard.

XP yang bertambah setiap kali pelajaran diulang memang disengaja.

**Istilah tetap:** "5 Pertanyaan Sebelum Klik" (Siapa pengirimnya? / Ke mana link ini? / File apa ini? / Kenapa harus buru-buru? / Apa yang diminta?), "Lagi Ragu?", "Sudah Telanjur?", Lupi.

**Pengujian:**
- `node --test` untuk logika dan validasi isi skenario;
- `python tests/e2e_flow.py` (Playwright) di HP 375×812, iPhone 18 Pro Max 440×956 (perkiraan), dan laptop. Tesnya memastikan tidak ada error console, tidak ada request keluar, dan "Lagi Ragu?" tidak pernah menyimpulkan "aman".

**Sudah diputuskan (30 Oktober 2026):**
- Pelajaran tetap terkunci berurutan, tetapi satu pesan asli ("Pesanan dikirim") ada di urutan 2 supaya juri cepat bertemu "tidak semua pesan itu penipuan".
- Beranda hanya berisi Lupi dan jalur belajar. "Lagi ragu?" dan "Telanjur?" dibuka dari bar atas di setiap halaman, kecuali di tengah pelajaran.
- Layar selesai langsung membuka pelajaran berikutnya.
- HP simulasi bergaya iPhone, dan chat-nya mirip WhatsApp.
- Seluruh website hanya memakai 5 warna palet (lihat README). Pengecualian: abu-abu gelap untuk mode gelap.
- Tampilan Sistem/Terang/Gelap lewat tombol ⚙, bawaan Sistem. Mode gelap berlatar abu-abu gelap (bukan ungu) dengan aksen dari palet. HP simulasi selalu tampil terang karena meniru aplikasi sungguhan.
- HP simulasi berproporsi iPhone Pro Max sungguhan (layar 440 × 956) di laptop. Di layar satu kolom (HP, tablet) tinggi layarnya mengikuti isi pesan, supaya seluruh pesan terlihat tanpa gulir dan tidak tertutup tombol bawah. Wallpaper alamnya digambar sendiri.
- Soal tanda bahaya langsung muncul setelah ketukan pertama di pesan, tanpa tombol Lanjut. Bagian pesan yang bisa diketuk berupa kotak ala Duolingo.

**Masih terbuka:** isi akhir "Lagi Ragu?" dan "Sudah Telanjur?" (versi pertama dibuat Claude; pemiliknya Anggota 4).

## Brand Commitments

- Nama **CekDulu** sudah final.
- Bahasa Indonesia yang santai dan hangat, tidak menggurui.
- Maskot Lupi, kaca pembesar (French Blue).
- Tim memilih mekanik belajar ala Duolingo (jalur pelajaran, umpan balik instan, XP) tetapi dengan identitas sendiri, tanpa branding Duolingo.

## Evidence on Hand

- **548.093 laporan ke IASC** (22 November 2024 – 29 April 2026), sumber RRI dan Kontan.
- **Rp 8,2 triliun kerugian yang dilaporkan** (sampai 30 November 2025), sumber Kontan.
- **Kontak resmi di `telanjur.html`**, diperiksa 30 Oktober 2026: Kontak OJK 157, WhatsApp 081-157-157-157, iasc.ojk.go.id, aduannomor.id, cekrekening.id, Polisi 110.

Belum ada testimoni, hasil uji pengguna, atau data pemakaian. Jangan mengarang satu pun.

## Product Principles

1. **Satu alur yang dalam dan andal** lebih baik daripada banyak fitur. Alur utama harus selesai tanpa error di link langsung.
2. **Ajarkan cara memeriksa, bukan hafalan.** Fakta lebih dulu, penilaian sendiri, baru penjelasan.
3. **Jujur soal batasan.** Jangan pernah bilang "aman" atau "pasti penipuan" untuk pesan nyata, dan arahkan ke kanal resmi.
4. **Privasi sebagai janji yang terlihat.** Tanpa akun, tanpa pengiriman data, dan janji itu ditampilkan, tidak disembunyikan.
5. **Tenangkan, jangan menakut-nakuti.** Kesalahan adalah bagian dari belajar, dan di situasi darurat yang ditawarkan adalah langkah, bukan panik.

## Accessibility & Inclusion

- Target WCAG 2.2 AA:
  - kontras teks ≥ 4,5:1;
  - area ketuk minimal 44px untuk kontrol utama;
  - fokus keyboard terlihat;
  - fokus pindah ke soal baru untuk pembaca layar;
  - menghormati `prefers-reduced-motion`.
- Teks harus besar dan mudah dibaca di HP (dasar 18px).
- Hindari scroll di dalam area soal; pengguna diminta sedikit scroll.
