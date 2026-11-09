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

1. **Cari sendiri dulu, baru dibongkar.** Pengguna mengetuk sendiri bagian pesan yang menurutnya mencurigakan. Bagian yang wajar juga bisa diketuk dan tampil sama, jadi tidak ada petunjuk jawaban. Setelah itu mereka menilai lewat 5 Pertanyaan Sebelum Klik, dan penjelasan baru muncul setelah menjawab.
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
- Beranda dengan jalur belajar: 6 pelajaran dalam 2 bagian, Dunia 3 berisi materi phishing, XP, streak, dan maskot Coach Wall.
- Simulator pelajaran, 3 soal ala Duolingo: Cari (ketuk bagian mencurigakan) → Tanda bahaya apa saja → Tindakan → Selesai.
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

**Istilah tetap:** "5 Pertanyaan Sebelum Klik" (Siapa pengirimnya? / Ke mana link ini? / File apa ini? / Kenapa harus buru-buru? / Apa yang diminta?), "Lagi Ragu?", "Sudah Telanjur?", Coach Wall (dulu Lupi).

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
- (31 Okt 2026) Setiap soal tampil bersama HP simulasi dan muat satu layar tanpa gulir; HP simulasi diperkecil otomatis. Jawaban tidak pernah dibocorkan sebelum pemain menjawab: tidak ada kotak penanda dan tidak ada kartu "hasil periksa". Lupi muncul di samping setiap soal.

**Masih terbuka:** isi akhir "Lagi Ragu?" dan "Sudah Telanjur?" (versi pertama dibuat Claude; pemiliknya Anggota 4).

## Brand Commitments

- Nama **CekDulu** sudah final.
- Bahasa Indonesia yang santai dan hangat, tidak menggurui.
- Maskot **Coach Wall** (sejak 8 Nov 2026, menggantikan Lupi): pelatih muda bertopi baseball berhuruf W, jaket olahraga, dan peluit. "Wall" = tembok yang melindungimu dari penipu. Sembilan ekspresi bergerak (melambai, mikir, curiga dengan kaca pembesar, sorak, jatuh hati, tepuk jidat, kaget, garuk kepala, menjelaskan).
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

**Perubahan 31 Oktober 2026 (permintaan ketua):**
- Halaman "Lagi Ragu?" (`ragu.html`) dan "Sudah Telanjur?" (`telanjur.html`) dihapus, termasuk tombolnya di bar atas. Catatan lama tentang kedua halaman itu di dokumen ini tidak berlaku lagi.
- Ada materi "Kenali jenis phishing" (`materi.html`, isi di `js/materi.js`): Voice Phishing, Email Phishing (5 kuis tautan palsu), SMS Phishing, Chat & Medsos, dan QR Code palsu. Kuis tautan memakai nama merek sungguhan sesuai naskah tim; alamat palsunya hanya teks dan tidak bisa diklik.
- Soal pertama pelajaran: "Apa yang salah dari pesan ini?". Pilihannya potongan pesan itu sendiri, diacak, dan tanpa sorotan di HP simulasi.
- Wallpaper chat bermotif doodle ala WhatsApp; layar kunci memakai wallpaper gelombang. Keduanya hanya warna palet.
- Lupi punya celetukan sendiri untuk setiap pesan dan ekspresi "curiga" serta "memancing".

**Perubahan 8 November 2026 (permintaan ketua):**
- Lupi diganti Coach Wall (maskot manusia). Dia bereaksi di lembar hasil setiap jawaban, bisa diketuk untuk tips umum (tidak pernah membocorkan jawaban), dan menunggu di samping level yang sedang dimainkan di peta.
- Warna status jawaban: hijau benar, kuning hampir (sebagian benar di soal pilih banyak), merah salah. Ini pengecualian palet yang disetujui ketua; label teks tetap ada.
- Soal pilih banyak menampilkan kotak centang dan penanda "Bisa pilih lebih dari satu"; soal pilih satu memakai bulatan.
- Streak = jawaban benar beruntun (bukan hari beruntun), tampil sebagai api di bar atas: 1-2 oranye, 3-4 biru, 5 ke atas pink. Salah atau hampir mengembalikannya ke 0. Ini membatalkan keputusan 29 Okt "tanpa streak". (Diganti 9 Nov: streak per level selesai, lihat di bawah.)
- Latar bergerak dan hiasan di pinggir halaman soal dihapus supaya tidak mengganggu.
- Materi "Kenali jenis phishing" pindah dari rak di bawah peta menjadi Dunia 3 "Teluk Phishing" di peta (urutan bebas). Catatan fiktif/privasi dan tombol Hapus progres pindah ke Pengaturan > Umum.
- Materi Voice Phishing punya 3 soal suara: penelepon tanpa wajah berbicara (suara bawaan perangkat, hanya suara lokal), pemain memilih jawaban. Tanpa suara, kalimatnya ditampilkan sebagai teks.
- Pengaturan menjadi jendela di tengah layar dengan menu Umum, Tampilan, Bahasa, dan pilihan baru: getar, kecepatan suara penelepon, waktu Ronde Kilat, animasi, konfeti.
- Keluar dari pelajaran dan hapus progres memakai dialog buatan sendiri, bukan jendela bawaan browser.
- Layar selesai bergaya game: Coach Wall besar, kotak angka berwarna dengan ikon (XP, bagian ketemu, tindakan), tombol "Lanjut" dan "Kembali ke beranda".
- Sambutan beranda (hasil critique 26/40, `/impeccable onboard`): untuk pemain baru, Coach Wall menyapa, judul "Cek dulu sebelum klik.", janji privasi terlihat (Tanpa login · Tidak ada data dikirim · Progres hanya di perangkat ini), fakta 548.093 laporan IASC dengan sumber, dan layar kunci mini dengan dua jalan cepat: notifikasi asli Pasar Rimbun (pelajaran pesan asli) dan "Panggilan masuk" (langsung ke soal suara, `materi.html?m=vishing&mulai=suara`). Juri bisa bertemu pesan asli dan penelepon misterius dalam satu ketukan masing-masing tanpa menamatkan level 1. Setelah ada progres, sambutan menyusut dan Coach Wall pindah ke samping level aktif di peta.

**Perubahan 9 November 2026 (masukan tim, "webdev yg krng.pdf"):**
- Streak sekarang dihitung per level selesai, bukan per soal: +1 setiap pelajaran, materi, atau Ronde Kilat selesai (termasuk saat diulang). Jawaban salah tidak mengembalikannya ke 0; hanya Hapus progres. Layar selesai menulis "Streak naik jadi N!". Combo jawaban benar beruntun tetap ada di lembar hasil, tapi hanya di dalam satu pelajaran.
- Level terkunci di peta bisa diketuk: gelembung di atasnya menjelaskan kenapa masih terkunci ("Selesaikan Level 4 dulu…") dan tombol ke level yang sedang dimainkan.
- Pengaturan > Tampilan > Ukuran teks (Normal, Besar, Paling besar) memperbesar isi HP simulasi, soal, jawaban, kartu Ronde Kilat, dan lembar hasil.
- HP simulasi di laptop tidak lagi diperkecil mengikuti rasio layar iPhone (dulu teks pesan +-10px): HP selebar aslinya dan setinggi ruang yang ada. Isi HP tidak pernah diperkecil; pesan yang lebih panjang dari layar HP digulir di dalam HP (ujung bawahnya dipudarkan sebagai tanda).
- Hiasan kecil di samping level menempel di samping levelnya dan ikut jalur yang berliku, bukan berbaris di satu kolom.
- Beranda punya panel di atas peta: kartu "Selanjutnya" (level berikutnya, progres, tombol Lanjut belajar), tiga angka (pelajaran, bintang, materi), 5 Pertanyaan Sebelum Klik dengan petunjuknya, lalu janji privasi, fakta IASC, dan jalan cepat.
