/*
  ISI SKENARIO — file ini yang diedit tim konten.
  Mesin (engine.js) membaca data di sini, jadi menambah skenario tidak perlu mengubah engine.

  Aturan:
  - Semua nama, nomor, dan alamat harus FIKTIF. Cek dulu tidak dipakai pihak sungguhan.
  - flags = tanda bahaya yang benar (id dari questions.js). Pesan asli: flags: [].
  - Setiap id di flags harus ditandai di salah satu bagian pesan (sender, attachment,
    atau potongan teks) dan punya penjelasan di evidence.
  - Setelah mengedit, jalankan `node --test` untuk memeriksa datanya.

  Soal pertama: pemain mengetuk bagian yang mencurigakan. Pengirim, file, setiap potongan bertanda,
  dan setiap kalimat teks biasa bisa diketuk. Bagian tanpa flag dihitung wajar.
  sender.address (opsional, untuk email) tampil di bawah nama pengirim.

  Potongan teks di dalam messages (satu array = satu gelembung pesan):
  - "teks biasa"                     -> dipecah per kalimat; tiap kalimat bisa diketuk (wajar)
  - { text: "teks", flag: "buru" }   -> bagian mencurigakan
  - { text: "teks link", url: "alamat asli", detail: "...", flag: "link" }
                                      -> link yang bisa diketuk; tambah button: true
                                         supaya tampil sebagai tombol (misalnya di email)

  Susunan soal (steps), opsional. Bawaan: ["find", "flags", "action"].
  - "find"   Cari: ketuk bagian yang mencurigakan (selalu pertama)
  - "flags"  Tanda bahaya apa aja (5 pertanyaan)
  - "match"  Pasangkan bagian pesan dengan pertanyaannya (butuh minimal 2 flags)
  - "url"    Tebak link asli (butuh linkQuiz)
  - "reply"  Susun pesan dari kepingan kata (butuh reply)
  - "action" Kalau kamu, bakal ngapain? (selalu terakhir)
  Setiap pelajaran wajib punya "flags" atau "match".

  coach:    { intro, good, bad }  -> celetukan Coach Wall: intro di soal pertama (jangan bocorkan jawaban),
                                     good/bad setelah soal pertama dinilai
  linkQuiz: { question, options: [{ text, correct }], why }   -> tepat satu option benar
  reply:    { prompt, words: [...], extra: [...], why }       -> words = jawaban urut, extra = kata pengecoh

  STATUS: draf pertama. Tim konten wajib cek ulang isi dan nama fiktifnya.
*/

const UNITS = [
  { id: 1, title: "Bagian 1", subtitle: "Paket, file, dan link", world: "Kota Paket", icon: "box" },
  { id: 2, title: "Bagian 2", subtitle: "Kode OTP dan pesan asli", world: "Benteng Kode", icon: "key" }
];

const SCENARIOS = [
  {
    id: "undangan-apk",
    coach: { intro: "Ada undangan nikahan dari nomor baru. Kondangan atau curiga dulu?", good: "Undangan asli nggak perlu di-install. Nikahannya bukan di Play Store!", bad: "Hampir ke-install tuh! Untung cuma latihan." },
    unit: 1,
    icon: "invite", // ikon level di peta beranda
    title: "Undangan pernikahan",
    app: "chat",
    sender: {
      name: "+62 812-0000-1234",
      detail: "Nomor ini tidak tersimpan di kontakmu dan tidak punya foto profil.",
      flag: "siapa"
    },
    messages: [
      ["Assalamualaikum Kak, kami mengundang Kakak ke acara pernikahan kami."],
      [{ text: "Undangan lengkapnya ada di file ini ya", flag: "file" }, ". ", { text: "Mohon segera dibuka", flag: "buru" }, "."]
    ],
    attachment: {
      name: "Undangan Pernikahan.apk",
      size: "4,2 MB",
      detail: "Jenis file: aplikasi Android (.apk), bukan dokumen. Kalau di-install, aplikasi bisa meminta izin membaca SMS dan notifikasimu.",
      flag: "file"
    },
    flags: ["siapa", "file", "buru"],
    verdict: "Ini penipuan. Undangan dikirim sebagai aplikasi .apk oleh nomor yang tidak kamu kenal.",
    evidence: {
      siapa: "Nomornya tidak tersimpan di kontakmu dan tanpa foto profil, tapi mengaku mengundangmu.",
      file: "Undangannya berbentuk file .apk. Itu aplikasi, bukan undangan.",
      buru: "\"Mohon segera dibuka\" dipakai supaya kamu tidak sempat berpikir."
    },
    clear: {
      link: "Pesan ini tidak memuat link. Bahayanya ada di file yang dilampirkan.",
      minta: "Belum ada yang diminta langsung. Aplikasinya yang nanti mencuri data."
    },
    actions: [
      { label: "Buka file undangannya", correct: false, why: "File .apk akan meng-install aplikasi. Aplikasi seperti ini bisa membaca SMS, termasuk kode OTP bankmu." },
      { label: "Jangan dibuka. Tanya teman atau keluarga apakah ada yang mau menikah", correct: true, why: "Kalau undangannya asli, orang terdekatmu kemungkinan tahu. Kamu memastikan lewat jalur lain, bukan lewat pesan itu." },
      { label: "Blokir dan laporkan nomornya", correct: true, why: "Nomor tak dikenal yang mengirim file aplikasi tidak perlu ditanggapi." }
    ],
    takeaway: "Undangan, foto paket, dan surat tilang tidak pernah berbentuk file .apk. Kalau diminta meng-install sesuatu, berhenti."
  },
  {
    id: "pesanan-dikirim",
    coach: { intro: "Kemarin kamu beli sepatu, terus notif ini muncul. Curiga atau santai?", good: "Sip! Nggak semua notif itu jebakan.", bad: "Santai, ini notif biasa dari aplikasi yang kamu pakai sendiri." },
    unit: 1,
    icon: "truck",
    title: "Pesanan dikirim",
    app: "notif",
    context: "Kemarin kamu memesan sepatu di aplikasi belanja Pasar Rimbun.",
    sender: {
      name: "Pasar Rimbun",
      detail: "Notifikasi dari aplikasi Pasar Rimbun yang kamu install sendiri dari toko aplikasi resmi."
    },
    subject: "Pesananmu sedang dikirim",
    messages: [
      ["Pesanan #PR-20817 (sepatu) sudah diserahkan ke kurir. Estimasi tiba Jumat, 6 Nov. Lacak di halaman Pesanan."]
    ],
    flags: [],
    verdict: "Ini pesan asli. Datang dari aplikasi resmi, cocok dengan pesananmu, tanpa link, dan tidak meminta apa pun.",
    evidence: {},
    clear: {
      siapa: "Datang dari aplikasi resmi yang kamu install sendiri, dan cocok dengan pesananmu kemarin.",
      buru: "Tidak ada ancaman atau batas waktu.",
      minta: "Tidak meminta data, kode, atau uang. Kamu hanya diberi tahu status pesanan."
    },
    actions: [
      { label: "Buka aplikasi Pasar Rimbun dan cek halaman Pesanan", correct: true, why: "Kamu mengecek langsung di aplikasi resmi." },
      { label: "Laporkan sebagai penipuan", correct: false, why: "Tidak ada tanda bahaya di sini. Melaporkan pesan asli membuatmu melewatkan info penting." },
      { label: "Cari nomor CS Pasar Rimbun di media sosial untuk memastikan", correct: false, why: "Tidak perlu, dan berisiko: banyak akun CS palsu di media sosial. Kalau ragu, cek langsung di aplikasi resmi." }
    ],
    takeaway: "Pesan asli biasanya tidak memaksa dan tidak meminta apa pun. Kalau ragu, cek langsung di aplikasi resmi, bukan lewat link atau nomor dari pesan."
  },
  {
    id: "paket-tertahan",
    coach: { intro: "Paketmu katanya nyangkut di gudang. Kurirnya SMS sendiri, nih.", good: "Mantap, nggak kepancing ongkir receh!", bad: "Ongkirnya receh, tapi yang diincar data kartumu!" },
    unit: 1,
    icon: "box",
    title: "Paket tertahan",
    app: "sms",
    sender: {
      name: "+62 857-0000-7781",
      detail: "Nomor HP pribadi biasa, bukan nama pengirim resmi ekspedisi.",
      flag: "siapa"
    },
    messages: [
      [
        "[Ekspedisi Lintang] Paket Anda tertahan di gudang karena alamat kurang lengkap. ",
        { text: "Perbarui alamat dan bayar biaya kirim ulang Rp12.500", flag: "minta" },
        " di ",
        {
          text: "lintang-paket-update.top/bayar",
          url: "http://lintang-paket-update.top/bayar",
          detail: "Domain: lintang-paket-update.top. Situs resmi Ekspedisi Lintang adalah ekspedisilintang.co.id.",
          flag: "link"
        },
        ". ",
        { text: "Paket dikembalikan ke pengirim dalam 2 jam.", flag: "buru" }
      ]
    ],
    flags: ["siapa", "link", "buru", "minta"],
    verdict: "Ini penipuan. Link-nya bukan situs ekspedisi, dan kamu diminta membayar dengan batas waktu.",
    evidence: {
      siapa: "Dikirim dari nomor HP pribadi, padahal mengaku ekspedisi.",
      link: "Alamatnya lintang-paket-update.top, bukan ekspedisilintang.co.id.",
      buru: "\"Dikembalikan dalam 2 jam\" dipakai supaya kamu langsung membayar.",
      minta: "Kamu diminta mengisi data dan membayar lewat link. Yang diincar bukan Rp12.500, tapi data kartu atau akun bankmu."
    },
    clear: {
      file: "Pesan ini tidak membawa file. Bahayanya ada di link."
    },
    actions: [
      { label: "Buka link dan bayar, cuma Rp12.500", correct: false, why: "Jumlah kecil sengaja dipakai supaya kamu tidak berpikir panjang. Data kartu yang kamu isi bisa dipakai untuk transaksi yang jauh lebih besar." },
      { label: "Cek nomor resi di aplikasi atau situs resmi ekspedisi", correct: true, why: "Kamu memeriksa lewat jalur yang kamu cari sendiri, bukan dari link di pesan." },
      { label: "Hapus pesannya dan blokir nomornya", correct: true, why: "Ekspedisi resmi tidak menagih biaya lewat SMS dari nomor pribadi." }
    ],
    takeaway: "Penipu sengaja meminta jumlah kecil supaya kamu tidak curiga. Cek paket hanya lewat aplikasi atau situs resmi.",
    steps: ["find", "match", "url", "action"],
    linkQuiz: {
      question: "Mana situs resmi Ekspedisi Lintang?",
      options: [
        { text: "lintang-paket-update.top", correct: false },
        { text: "ekspedisilintang.co.id", correct: true },
        { text: "ekspedisi-lintang.id-cek.com", correct: false }
      ],
      why: "Lihat bagian paling belakang sebelum garis miring. Situs resmi berakhiran ekspedisilintang.co.id; yang lain cuma ditempeli kata mirip."
    }
  },
  {
    id: "akun-bank-diblokir",
    coach: { intro: "Pagi-pagi udah dapet email dari \"bank\". Ngopi dulu, terus cek baik-baik!", good: "Detektif level bank! Satu huruf nyamar pun ketahuan.", bad: "Penipunya cuma ganti satu huruf. Licik, ya?" },
    unit: 1,
    icon: "bank",
    title: "Akun bank diblokir",
    app: "email",
    sender: {
      name: "Bank Arunika",
      address: "keamanan@bankarunika-verifikasi.com",
      detail: "Alamat pengirim: keamanan@bankarunika-verifikasi.com. Email resmi Bank Arunika memakai domain bankarunika.co.id.",
      flag: "siapa"
    },
    subject: "[PENTING] Akun Anda diblokir sementara",
    messages: [
      ["Kepada Nasabah yang terhormat, berikut informasi tentang akun Anda."],
      [{ text: "Akun akan ditutup permanen dalam 24 jam", flag: "buru" }, " jika tidak segera diverifikasi."],
      [{ text: "Silakan masuk dan masukkan PIN serta kode OTP Anda", flag: "minta" }, " melalui tombol di bawah ini."],
      [{
        text: "Verifikasi Sekarang",
        url: "http://bankarunlka.co/login",
        detail: "Alamat asli tombol: bankarunlka.co/login. Perhatikan: \"arunlka\" memakai huruf L, bukan i. Ini bukan bankarunika.co.id.",
        flag: "link",
        button: true
      }]
    ],
    flags: ["siapa", "link", "buru", "minta"],
    verdict: "Ini penipuan. Nama pengirimnya Bank Arunika, tapi alamat email dan tombolnya mengarah ke domain lain.",
    evidence: {
      siapa: "Nama yang tampil \"Bank Arunika\", tapi alamat emailnya bankarunika-verifikasi.com.",
      link: "Tombol mengarah ke bankarunlka.co, domain tiruan dengan satu huruf diganti.",
      buru: "\"Ditutup permanen dalam 24 jam\" adalah ancaman supaya kamu panik.",
      minta: "Bank tidak pernah meminta PIN atau kode OTP lewat email."
    },
    clear: {
      file: "Tidak ada lampiran. Jebakannya ada di tombol."
    },
    actions: [
      { label: "Klik tombol dan verifikasi akun", correct: false, why: "Halaman itu tiruan. PIN dan OTP yang kamu masukkan langsung diterima penipu." },
      { label: "Buka aplikasi resmi bank atau telepon nomor di balik kartu", correct: true, why: "Kalau memang ada masalah, informasinya juga ada di aplikasi resmi." },
      { label: "Balas email dan tanyakan apakah ini asli", correct: false, why: "Balasanmu dibaca penipu, dan mereka tentu akan bilang asli." }
    ],
    takeaway: "Bank tidak pernah meminta PIN atau OTP lewat email, chat, atau telepon. Selalu cek alamat aslinya, bukan nama yang tampil.",
    steps: ["find", "url", "match", "action"],
    linkQuiz: {
      question: "Mana alamat asli Bank Arunika?",
      options: [
        { text: "bankarunlka.co", correct: false },
        { text: "bankarunika-verifikasi.com", correct: false },
        { text: "bankarunika.co.id", correct: true }
      ],
      why: "Baca huruf demi huruf: \"arunlka\" pakai huruf L. Tambahan \"-verifikasi\" juga bikin alamatnya beda. Yang asli cuma bankarunika.co.id."
    }
  },
  {
    id: "teman-minta-kode",
    coach: { intro: "Dimas tiba-tiba chat minta tolong. Temen sendiri, sih... tapi cek dulu!", good: "Temen beneran nggak bakal minta kode OTP-mu.", bad: "Kode itu kunci akunmu. Dimas pun nggak boleh tahu!" },
    unit: 2,
    icon: "chat",
    title: "Teman minta kode",
    app: "chat",
    sender: {
      name: "Dimas",
      detail: "Tersimpan di kontakmu sebagai Dimas, nomornya sama seperti biasa. Tapi akun yang dibajak juga tampil dengan nama dan nomor aslinya.",
      flag: "siapa"
    },
    notice: "SMS baru: Kode verifikasi akun chat kamu 482913. Jangan berikan kode ini kepada siapa pun.",
    messages: [
      ["Eh sori, aku salah masukin nomor pas daftar. Kodenya malah kekirim ke nomormu"],
      [{ text: "Tolong kirim kode 6 digit yang barusan masuk ya", flag: "minta" }],
      [{ text: "Cepet ya, kodenya cuma berlaku 5 menit", flag: "buru" }]
    ],
    flags: ["siapa", "buru", "minta"],
    verdict: "Ini penipuan. Kode itu untuk masuk ke akunmu sendiri, dan akun Dimas kemungkinan sedang dibajak.",
    evidence: {
      siapa: "Namanya memang Dimas, tapi itu bukan jaminan. Akun yang dibajak tetap tampil dengan nama aslinya.",
      buru: "\"Cuma berlaku 5 menit\" dipakai supaya kamu tidak sempat menelepon Dimas.",
      minta: "Kamu diminta kode verifikasi. Kode itu kunci akunmu sendiri."
    },
    clear: {
      link: "Tidak ada link. Jebakannya adalah permintaan kode."
    },
    actions: [
      { label: "Kirim kodenya, kasihan Dimas", correct: false, why: "Kode itu untuk masuk ke akunmu. Kalau dikirim, akunmu yang diambil alih, lalu dipakai menipu teman-temanmu." },
      { label: "Telepon Dimas lewat telepon biasa, bukan lewat aplikasi chat", correct: true, why: "Kalau akun chatnya dibajak, panggilan di aplikasi itu bisa diangkat penipu. Telepon biasa ke nomor yang kamu simpan, atau bertemu langsung, jauh lebih sulit dipalsukan." },
      { label: "Jangan kirim, lalu kabari teman lain bahwa akun Dimas mungkin dibajak", correct: true, why: "Kamu melindungi dirimu dan teman lain yang mungkin juga dimintai kode." }
    ],
    takeaway: "Kode OTP adalah kunci akunmu sendiri. Siapa pun yang memintanya, entah teman, keluarga, atau petugas, jangan diberikan.",
    steps: ["find", "match", "reply", "action"],
    reply: {
      prompt: "Kabari grup temanmu. Susun pesannya:",
      words: ["Akun", "Dimas", "kayaknya", "dibajak,", "jangan", "kirim", "kode"],
      extra: ["kirim", "aja", "cepat"],
      why: "Teman lain mungkin juga dimintai kode. Peringatan singkat bisa menyelamatkan akun mereka."
    }
  },
  {
    id: "kode-otp-asli",
    coach: { intro: "Kamu baru aja login, terus SMS ini masuk. Aman atau jebakan?", good: "Betul! Kodenya buat kamu pakai sendiri.", bad: "Santai, kode ini memang kamu sendiri yang minta." },
    unit: 2,
    icon: "key",
    title: "Kode OTP",
    app: "sms",
    context: "Kamu baru saja menekan tombol Masuk di aplikasi Bank Arunika di HP-mu sendiri.",
    sender: {
      name: "ARUNIKA",
      detail: "Nama pengirim bank. Nama seperti ini bisa dipalsukan, tapi kode ini datang tepat setelah kamu sendiri menekan Masuk."
    },
    messages: [
      ["Kode OTP Anda: 739204. Berlaku 3 menit. JANGAN berikan kode ini kepada siapa pun, termasuk petugas bank."]
    ],
    flags: [],
    verdict: "Ini pesan asli. Kamu sendiri yang meminta kode ini, dan pesannya tidak meminta apa pun darimu.",
    evidence: {},
    clear: {
      siapa: "Nama pengirim bisa dipalsukan, tapi kode ini datang tepat setelah kamu sendiri menekan Masuk, dan pesannya tidak meminta apa pun.",
      buru: "Batas 3 menit itu wajar untuk kode OTP. Pesannya tidak mengancam atau memaksamu.",
      minta: "Pesan ini tidak meminta apa pun. Justru mengingatkan agar kode tidak diberikan."
    },
    actions: [
      { label: "Masukkan kode di aplikasi bank yang sedang kamu buka", correct: true, why: "Kode ini untuk kamu pakai sendiri, di aplikasi yang kamu buka sendiri." },
      { label: "Abaikan. Semua SMS berisi kode pasti penipuan", correct: false, why: "Kalau semua pesan dicurigai, kamu tidak bisa memakai layanan resmi. Kamu sendiri yang meminta kode ini." },
      { label: "Teruskan kodenya ke grup keluarga supaya tersimpan", correct: false, why: "Kode OTP tidak boleh diteruskan ke siapa pun, termasuk keluarga. Cukup dipakai sekali oleh kamu sendiri." }
    ],
    takeaway: "SMS berisi kode itu normal kalau kamu sendiri yang memintanya. Pakai sendiri, jangan pernah diteruskan."
  }
];

// Ronde Kilat "Asli atau Penipuan?": pesan singkat, dijawab cepat. Satu ronde per bagian (unit).
// scam: true = penipuan. why = penjelasan singkat setelah menjawab.
const QUICK_ROUND = [
  { unit: 1, sender: "+62 813-0000-4410", app: "SMS", text: "Paket Anda gagal dikirim. Bayar ongkir ulang di lintang-kirim.xyz hari ini.", scam: true, why: "Nomor pribadi, link aneh, dan minta bayar. Cek resi di aplikasi resmi saja." },
  { unit: 1, sender: "Mama", app: "Chat", text: "Nak, nanti pulang sekalian beli telur ya.", scam: false, why: "Tidak ada link, tidak minta data atau uang. Permintaannya biasa saja." },
  { unit: 1, sender: "+62 821-0000-9031", app: "Chat", text: "Selamat! Kamu menang undian Rp50 juta. Klaim sebelum jam 12 di rimbun-hadiah.site", scam: true, why: "Hadiah yang tidak pernah kamu ikuti, batas waktu, dan link aneh." },
  { unit: 1, sender: "Pasar Rimbun", app: "Notifikasi", text: "Flash sale mulai jam 12.00. Cek di halaman Promo aplikasi.", scam: false, why: "Dari aplikasi resmi, tidak ada link, tidak minta apa pun." },
  { unit: 1, sender: "Info Tilang", app: "SMS", text: "Anda terkena tilang elektronik. Lihat bukti di file Surat_Tilang.apk", scam: true, why: "Surat tilang tidak pernah berbentuk file .apk." },
  { unit: 2, sender: "Rani", app: "Chat", text: "Aku udah sampai kafe, kamu di mana?", scam: false, why: "Teman yang memang janjian, tidak minta apa pun." },
  { unit: 2, sender: "+62 857-0000-2208", app: "Chat", text: "Ini aku, ganti nomor. Bisa pinjam Rp500 ribu dulu? Darurat banget.", scam: true, why: "Mengaku teman dari nomor baru dan langsung minta uang. Telepon nomor lamanya dulu." },
  { unit: 2, sender: "Bank Arunika", app: "Email", text: "Laporan bulanan rekeningmu sudah tersedia di aplikasi Bank Arunika.", scam: false, why: "Tidak ada link, tidak minta data. Cukup cek sendiri di aplikasi." },
  { unit: 2, sender: "Lowongan Kerja", app: "Chat", text: "Kerja santai: like video dapat Rp150 ribu/hari. Daftar dulu bayar Rp50 ribu.", scam: true, why: "Kerja yang minta bayar di awal hampir pasti penipuan." },
  { unit: 2, sender: "+62 812-0000-7765", app: "Chat", text: "Halo, aku CS Bank Arunika. Sebutkan kode OTP yang barusan masuk ya.", scam: true, why: "Petugas bank tidak pernah meminta kode OTP." }
];

if (typeof module !== "undefined") module.exports = { UNITS, SCENARIOS, QUICK_ROUND };
