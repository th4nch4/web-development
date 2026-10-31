// Kerangka inti: 5 Pertanyaan Sebelum Klik.
// Dipakai di simulator, rapor, dan halaman "Lagi Ragu?".
// clear = penjelasan bawaan kalau pertanyaan ini BUKAN tanda bahaya di sebuah pesan.
// ask = pertanyaan ya/tidak di halaman "Lagi Ragu?". Jawaban "Ya" berarti tanda bahaya.
const QUESTIONS = [
  {
    id: "siapa",
    title: "Siapa pengirimnya?",
    hint: "Nomor tidak dikenal, atau nama yang mirip akun resmi.",
    clear: "Pengirimnya tidak mencurigakan di pesan ini.",
    ask: "Pengirimnya asing, atau cuma mirip akun resmi?"
  },
  {
    id: "link",
    title: "Ke mana link ini?",
    hint: "Lihat alamat aslinya, bukan teks yang ditampilkan.",
    clear: "Pesan ini tidak memuat link.",
    ask: "Ada link dengan alamat aneh atau salah eja?"
  },
  {
    id: "file",
    title: "File apa ini?",
    hint: "File .apk itu aplikasi, bukan undangan atau foto.",
    clear: "Pesan ini tidak membawa file.",
    ask: "Kamu disuruh membuka atau memasang file (.apk)?"
  },
  {
    id: "buru",
    title: "Kenapa harus buru-buru?",
    hint: "Ada ancaman, batas waktu, atau iming-iming hadiah.",
    clear: "Tidak ada desakan atau ancaman di pesan ini.",
    ask: "Pesannya mendesak, mengancam, atau menjanjikan hadiah?"
  },
  {
    id: "minta",
    title: "Apa yang diminta?",
    hint: "Kode OTP, PIN, password, data pribadi, atau uang.",
    clear: "Pesan ini tidak meminta data, kode, atau uang.",
    ask: "Kamu diminta OTP, PIN, password, data, atau uang?"
  }
];

if (typeof module !== "undefined") module.exports = QUESTIONS;
