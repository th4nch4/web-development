// Kerangka inti: 5 Pertanyaan Sebelum Klik.
// Dipakai di simulator dan rapor (nanti juga di halaman "Lagi Ragu?").
// clear = penjelasan bawaan kalau pertanyaan ini BUKAN tanda bahaya di sebuah pesan.
const QUESTIONS = [
  {
    id: "siapa",
    title: "Siapa pengirimnya?",
    hint: "Nomor tidak dikenal, atau nama yang mirip akun resmi.",
    clear: "Pengirimnya tidak mencurigakan di pesan ini."
  },
  {
    id: "link",
    title: "Ke mana link ini?",
    hint: "Lihat alamat aslinya, bukan teks yang ditampilkan.",
    clear: "Pesan ini tidak memuat link."
  },
  {
    id: "file",
    title: "File apa ini?",
    hint: "File .apk itu aplikasi, bukan undangan atau foto.",
    clear: "Pesan ini tidak membawa file."
  },
  {
    id: "buru",
    title: "Kenapa harus buru-buru?",
    hint: "Ada ancaman, batas waktu, atau iming-iming hadiah.",
    clear: "Tidak ada desakan atau ancaman di pesan ini."
  },
  {
    id: "minta",
    title: "Apa yang diminta?",
    hint: "Kode OTP, PIN, password, data pribadi, atau uang.",
    clear: "Pesan ini tidak meminta data, kode, atau uang."
  }
];

if (typeof module !== "undefined") module.exports = QUESTIONS;
