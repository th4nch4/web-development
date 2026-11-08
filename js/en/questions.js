// Versi bahasa Inggris dari js/questions.js. Id, urutan, dan susunan harus sama persis;
// penjelasan setiap field ada di js/questions.js. Hanya teks yang dibaca pemain yang diterjemahkan.
const QUESTIONS = [
  {
    id: "siapa",
    title: "Who sent it?",
    hint: "An unknown number, or a name that looks like an official account.",
    clear: "Nothing suspicious about the sender in this message.",
    ask: "Is the sender a stranger, or only looks like an official account?"
  },
  {
    id: "link",
    title: "Where does this link go?",
    hint: "Look at the real address, not the text that's shown.",
    clear: "This message has no link.",
    ask: "Is there a link with a weird or misspelled address?"
  },
  {
    id: "file",
    title: "What file is this?",
    hint: "An .apk file is an app, not an invitation or a photo.",
    clear: "This message has no file.",
    ask: "Are you told to open or install a file (.apk)?"
  },
  {
    id: "buru",
    title: "Why the rush?",
    hint: "A threat, a deadline, or the lure of a prize.",
    clear: "No pressure or threats in this message.",
    ask: "Is the message pushy, threatening, or promising a prize?"
  },
  {
    id: "minta",
    title: "What is it asking for?",
    hint: "An OTP code, PIN, password, personal data, or money.",
    clear: "This message doesn't ask for data, codes, or money.",
    ask: "Are you asked for an OTP, PIN, password, data, or money?"
  }
];

if (typeof module !== "undefined") module.exports = QUESTIONS;
