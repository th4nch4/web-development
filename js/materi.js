/*
  ISI MATERI "Kenali Jenis Phishing" — file ini yang diedit tim konten.
  icon: nama ikon di js/ui.js (ICONS) untuk tombol di jalur belajar.
  Setiap materi berisi langkah (steps) yang dimainkan berurutan:
  - { type: "quiz", question, sub, options: [{ text, correct, why }] }
      Satu pilihan benar. why = penjelasan yang muncul setelah menjawab.
  - { type: "learn", title, text: ["paragraf", ...], source }
      Kartu penjelasan singkat. source opsional.
  - { type: "voice", caller, line, question, options: [{ text, correct, why }] }
      Soal suara: penelepon misterius mengucapkan line (suara bawaan perangkat), pemain memilih jawaban.
      Satu pilihan benar. Nama, nomor, dan bank harus fiktif.

  CATATAN: kuis tautan memakai nama merek sungguhan (bank dan toko online) sesuai naskah tim.
  Alamat palsu hanya ditampilkan sebagai teks, tidak bisa diklik. Cek ulang sebelum dikumpulkan.
*/

const MATERI = [
  {
    id: "vishing",
    icon: "phone",
    title: "Voice Phishing",
    steps: [
      {
        type: "quiz",
        question: "Ada telepon dari nomor asing, ngakunya dari bank. Kamu ngapain?",
        sub: "Pernah ngalamin? Pilih satu, ya.",
        options: [
          { text: "Tutup teleponnya, lalu hubungi bank lewat nomor resmi", correct: true, why: "Tepat! Bisa jadi itu Voice Phishing. Cek sendiri lewat nomor resmi di balik kartu atau di aplikasi bank." },
          { text: "Ikuti instruksi penelepon", correct: false, why: "Penipu jago membujuk lewat suara. Tutup teleponnya, lalu cek sendiri ke bank." },
          { text: "Memberikan kode OTP jika diminta", correct: false, why: "Kode OTP nggak boleh dikasih ke siapa pun, termasuk yang ngaku petugas bank." },
          { text: "Menelepon kembali nomor tersebut", correct: false, why: "Nomor itu milik penipu. Hubungi bank hanya lewat nomor resmi yang kamu cari sendiri." }
        ]
      },
      {
        type: "learn",
        title: "Apa itu Voice Phishing (Vishing)?",
        text: [
          "Penipuan lewat telepon atau pesan suara. Penipu pura-pura jadi orang yang bisa dipercaya supaya kamu memberi data penting: data pribadi, password, kode OTP, info rekening, atau akses ke HP.",
          "Modusnya macam-macam: rekening katanya mau diblokir, kamu katanya menang undian, atau penipu mengaku petugas bank.",
          "Siapa saja bisa jadi korban, terutama yang belum banyak tahu soal penipuan online, seperti anak-anak dan lansia."
        ]
      },
      {
        type: "voice",
        caller: "Nomor tidak dikenal",
        line: "Selamat siang, saya Andi dari bagian keamanan Bank Arunika. Ada transaksi lima juta rupiah dari rekening Anda. Kalau itu bukan Anda, sebutkan kode OTP yang baru masuk supaya kami batalkan.",
        question: "Dengar baik-baik. Apa yang diminta penelepon?",
        options: [
          { text: "Kode OTP", correct: true, why: "Tepat! Petugas bank tidak pernah meminta OTP. Begitu kode itu disebut, penipu bisa masuk ke rekeningmu." },
          { text: "Nomor rekening untuk kirim hadiah", correct: false, why: "Dengar lagi: yang diminta kode OTP yang baru masuk. Itu kunci rekeningmu." },
          { text: "Tidak minta apa-apa", correct: false, why: "Penelepon meminta kode OTP. Permintaan itu tanda bahaya paling jelas." }
        ]
      },
      {
        type: "voice",
        caller: "+62 21-0000-7788",
        line: "Ini panggilan terakhir dari kami. Dalam sepuluh menit rekening Anda diblokir permanen. Jangan tutup teleponnya dan jangan cerita ke siapa pun, ini rahasia.",
        question: "Trik apa yang dipakai penelepon?",
        options: [
          { text: "Bikin panik dan buru-buru", correct: true, why: "Betul! Batas waktu dan larangan bercerita dipakai supaya kamu tidak sempat berpikir atau bertanya ke orang lain." },
          { text: "Menawarkan hadiah", correct: false, why: "Tidak ada hadiah di sini. Yang ada ancaman blokir dan batas waktu sepuluh menit." },
          { text: "Menjelaskan prosedur resmi bank", correct: false, why: "Bank tidak mengancam lewat telepon dan tidak melarangmu bercerita ke keluarga." }
        ]
      },
      {
        type: "voice",
        caller: "Nomor tidak dikenal",
        line: "Halo, Nak? Ini Om. HP Om rusak, jadi pinjam punya teman. Om lagi kena masalah, tolong transfer dua juta sekarang ya. Nanti Om ganti.",
        question: "Langkah paling aman sekarang apa?",
        options: [
          { text: "Tutup, lalu telepon Om lewat nomor lama yang kamu simpan", correct: true, why: "Tepat! Cek lewat nomor yang sudah kamu simpan. Penipu sering pura-pura jadi keluarga dari nomor baru." },
          { text: "Langsung transfer karena darurat", correct: false, why: "Rasa darurat itu yang dimanfaatkan penipu. Cek dulu lewat nomor lama Om." },
          { text: "Kirim setengahnya dulu", correct: false, why: "Berapa pun jumlahnya tetap hilang kalau ini penipuan. Pastikan dulu itu benar Om-mu." }
        ]
      },
      {
        type: "quiz",
        question: "Penelepon bilang: \"Rekening Anda akan diblokir. Sebutkan kode OTP sekarang!\" Ini tanda apa?",
        sub: "Pilih satu.",
        options: [
          { text: "Tanda Voice Phishing", correct: true, why: "Ancaman diblokir + minta OTP = ciri khas Vishing." },
          { text: "Prosedur bank yang biasa", correct: false, why: "Bank nggak pernah minta OTP lewat telepon." },
          { text: "Hadiah dari bank", correct: false, why: "Nggak ada hadiah di sini. Yang ada malah ancaman." }
        ]
      }
    ]
  },
  {
    id: "email-phishing",
    icon: "link",
    title: "Email Phishing",
    steps: [
      {
        type: "learn",
        title: "Apa itu Email Phishing?",
        text: [
          "Pernah dapat email yang ngaku dari perusahaan terkenal, tapi isinya mencurigakan? Bisa jadi itu Email Phishing.",
          "Email Phishing adalah penipuan lewat email palsu. Pelaku membuat email yang terlihat seperti dari perusahaan atau orang yang kita kenal. Isinya menyuruh membuka tautan, mengunduh file, atau memasukkan data pribadi.",
          "Supaya terlihat asli, pelaku meniru logo, alamat email, dan tampilan pesan. Tautannya sering dibuat mirip situs resmi, padahal mengarah ke situs palsu untuk mencuri data."
        ],
        source: "Microsoft.com"
      },
      {
        type: "quiz",
        question: "Pilih tautan situs web yang palsu!",
        sub: "Soal 1 dari 5",
        options: [
          { text: "https://www.bankmandiri.co.id", correct: false, why: "Ini situs resmi Bank Mandiri dengan alamat bankmandiri.co.id." },
          { text: "https://www.bankmandiri-fix.com", correct: true, why: "Mencurigakan: ada tambahan \"-fix\" pada nama Bank Mandiri, dan alamatnya beda dari situs resmi." },
          { text: "https://www.bri.co.id", correct: false, why: "Ini situs resmi Bank BRI." },
          { text: "https://www.bni.co.id", correct: false, why: "Ini situs resmi Bank BNI." }
        ]
      },
      {
        type: "quiz",
        question: "Pilih tautan situs web yang palsu!",
        sub: "Soal 2 dari 5",
        options: [
          { text: "https://www.tokopedia.com", correct: false, why: "Ini situs resmi Tokopedia untuk belanja online." },
          { text: "https://www.bukalapak.com", correct: false, why: "Ini situs resmi Bukalapak." },
          { text: "https://www.blibli.com", correct: false, why: "Ini situs resmi Blibli." },
          { text: "https://tokopedia-promo-resmi.com", correct: true, why: "Mencurigakan: memakai nama Tokopedia lalu ditambah \"promo-resmi\" supaya menarik perhatian." }
        ]
      },
      {
        type: "quiz",
        question: "Pilih tautan situs web yang palsu!",
        sub: "Soal 3 dari 5",
        options: [
          { text: "https://gojek-bonus-saldo-gratis.com", correct: true, why: "Iming-iming bonus saldo gratis jadi umpan supaya kamu memasukkan data akun." },
          { text: "https://www.gojek.com", correct: false, why: "Ini situs resmi Gojek." },
          { text: "https://www.grab.com", correct: false, why: "Ini situs resmi Grab." },
          { text: "https://www.traveloka.com", correct: false, why: "Ini situs resmi Traveloka." }
        ]
      },
      {
        type: "quiz",
        question: "Pilih tautan situs web yang palsu!",
        sub: "Soal 4 dari 5",
        options: [
          { text: "https://www.bca.co.id", correct: false, why: "Ini situs resmi Bank BCA." },
          { text: "https://www.cimbniaga.co.id", correct: false, why: "Ini situs resmi CIMB Niaga." },
          { text: "https://bca.co.id.login-verifikasi.com", correct: true, why: "Sekilas ada bca.co.id di depan, tapi domain utamanya login-verifikasi.com. Nama BCA cuma pengecoh." },
          { text: "https://www.btn.co.id", correct: false, why: "Ini situs resmi Bank BTN." }
        ]
      },
      {
        type: "quiz",
        question: "Pilih tautan situs web yang palsu!",
        sub: "Soal 5 dari 5",
        options: [
          { text: "https://shopee.co.id", correct: false, why: "Ini situs resmi Shopee Indonesia." },
          { text: "https://shopee.co.id.hadiah-spaylater.com", correct: true, why: "Jangan langsung percaya ada tulisan shopee.co.id. Domain utamanya hadiah-spaylater.com." },
          { text: "https://www.lazada.co.id", correct: false, why: "Ini situs resmi Lazada Indonesia." },
          { text: "https://www.tiket.com", correct: false, why: "Ini situs resmi Tiket.com." }
        ]
      }
    ]
  },
  {
    id: "smishing",
    icon: "alert",
    title: "SMS Phishing",
    steps: [
      {
        type: "quiz",
        question: "SMS: \"Selamat! Nomor Anda menang Rp10 juta. Klaim di hadiah-kamu.xyz\". Kamu ngapain?",
        sub: "Pilih satu.",
        options: [
          { text: "Klik linknya buat klaim", correct: false, why: "Link itu bisa mengarah ke situs palsu yang mencuri data." },
          { text: "Balas SMS dengan nama dan nomor rekening", correct: false, why: "Data rekeningmu malah dipakai penipu." },
          { text: "Abaikan dan hapus SMS-nya", correct: true, why: "Tepat! Kamu nggak pernah ikut undian itu, jadi nggak mungkin menang." },
          { text: "Teruskan ke teman biar ikut menang", correct: false, why: "Temanmu malah ikut jadi sasaran." }
        ]
      },
      {
        type: "learn",
        title: "Apa itu SMS Phishing (Smishing)?",
        text: [
          "Penipuan lewat SMS. Isinya biasanya kabar paket tertahan, hadiah, tagihan, atau akun yang mau diblokir, plus link yang harus diklik.",
          "Tujuannya bikin kamu mengeklik link atau membalas dengan data pribadi. Cek informasinya langsung di aplikasi resmi, bukan lewat link di SMS."
        ]
      }
    ]
  },
  {
    id: "chat-medsos",
    icon: "siapa",
    title: "Phishing di Chat & Medsos",
    steps: [
      {
        type: "learn",
        title: "Phishing di chat dan media sosial",
        text: [
          "Penipu bisa memakai akun teman yang dibajak, akun \"CS resmi\" palsu, atau giveaway palsu di media sosial.",
          "Ciri-cirinya: minta kode OTP, minta transfer mendesak, atau menyuruh DM data pribadi. Pastikan lewat telepon atau kontak resmi yang kamu cari sendiri."
        ]
      },
      {
        type: "quiz",
        question: "Akun \"CS Bank Official\" balas komentarmu: \"DM nomor kartu kamu ya, biar kami bantu\". Kamu ngapain?",
        sub: "Pilih satu.",
        options: [
          { text: "Kirim nomor kartu lewat DM", correct: false, why: "CS asli nggak pernah minta nomor kartu lewat DM." },
          { text: "Abaikan, lalu cari kontak resmi di aplikasi bank", correct: true, why: "Tepat! Akun CS palsu sering muncul di kolom komentar." },
          { text: "Follow dulu akunnya biar aman", correct: false, why: "Nama \"Official\" bisa dipakai siapa saja." }
        ]
      }
    ]
  },
  {
    id: "quishing",
    icon: "lens",
    title: "QR Code Palsu",
    steps: [
      {
        type: "quiz",
        question: "Di meja kafe ada stiker QR \"Scan & bayar, diskon 50%!\" ditempel di atas QR kasir. Kamu ngapain?",
        sub: "Pilih satu.",
        options: [
          { text: "Scan dan langsung bayar", correct: false, why: "Uangmu bisa masuk ke rekening penipu." },
          { text: "Tanya kasir dulu, QR mana yang resmi", correct: true, why: "Tepat! Stiker QR palsu sering ditempel di atas QR asli." },
          { text: "Scan lalu isi data kartu biar dapat diskon", correct: false, why: "Situsnya bisa palsu dan mencuri data kartumu." }
        ]
      },
      {
        type: "learn",
        title: "Apa itu QR Phishing (Quishing)?",
        text: [
          "Penipuan memakai QR code palsu, misalnya ditempel di tempat parkir, menu, atau poster promo. Kalau di-scan, kamu dibawa ke situs palsu atau membayar ke rekening penipu.",
          "Sebelum bayar, cek nama penerima yang muncul di aplikasi pembayaran. Kalau ragu, tanya petugasnya."
        ]
      }
    ]
  }
];

if (typeof module !== "undefined") module.exports = MATERI;
