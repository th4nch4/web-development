// Jalankan dengan: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const CekLogic = require("../js/logic.js");

const scam = {
  id: "palsu",
  flags: ["siapa", "file"],
  actions: [{ correct: false }, { correct: true }]
};
const genuine = {
  id: "asli",
  flags: [],
  actions: [{ correct: true }, { correct: false }]
};
const questions = [
  { id: "siapa", title: "Siapa?", hint: "" },
  { id: "file", title: "File?", hint: "" },
  { id: "minta", title: "Minta?", hint: "" }
];

test("gradeFind: semua bagian mencurigakan ditandai, tanpa salah tandai", () => {
  const result = CekLogic.gradeFind([true, false, true], [0, 2]);
  assert.deepEqual(result, { found: [0, 2], missed: [], extra: [], total: 2, allCorrect: true });
});

test("gradeFind: bagian yang terlewat dan bagian wajar yang ikut ditandai", () => {
  const result = CekLogic.gradeFind([true, false, true], [1, 2]);
  assert.deepEqual(result.found, [2]);
  assert.deepEqual(result.missed, [0]);
  assert.deepEqual(result.extra, [1]);
  assert.equal(result.allCorrect, false);
});

test("gradeFind: pesan asli benar kalau tidak ada yang ditandai", () => {
  assert.equal(CekLogic.gradeFind([false, false], []).allCorrect, true);
  assert.equal(CekLogic.gradeFind([false, false], [0]).allCorrect, false);
});

test("gradeFind: pesan penipuan salah kalau tidak ada yang ditandai", () => {
  const result = CekLogic.gradeFind([true, false], []);
  assert.deepEqual(result.missed, [0]);
  assert.equal(result.allCorrect, false);
});

test("gradeMatch: pasangan yang sempat salah dihitung terlewat", () => {
  const result = CekLogic.gradeMatch(scam, ["file"]);
  assert.deepEqual(result.found, ["siapa"]);
  assert.deepEqual(result.missed, ["file"]);
  assert.equal(result.allCorrect, false);
  assert.equal(CekLogic.gradeMatch(scam, []).allCorrect, true);
});

test("gradeReply: urutan harus sama persis", () => {
  assert.equal(CekLogic.gradeReply(["jangan", "kirim", "kode"], ["jangan", "kirim", "kode"]), true);
  assert.equal(CekLogic.gradeReply(["jangan", "kirim", "kode"], ["kirim", "jangan", "kode"]), false);
  assert.equal(CekLogic.gradeReply(["jangan", "kirim"], ["jangan", "kirim", "aja"]), false);
});

test("quickScore: menghitung benar dan combo terpanjang", () => {
  assert.deepEqual(CekLogic.quickScore([true, true, false, true, true, true]), { right: 5, total: 6, bestStreak: 3 });
  assert.deepEqual(CekLogic.quickScore([]), { right: 0, total: 0, bestStreak: 0 });
});

test("recordQuick: menambah XP dan menyimpan skor terbaik tanpa mengubah progres lama", () => {
  const before = { xp: 10, lessons: {} };
  const after = CekLogic.recordQuick(before, 1, 4);
  assert.equal(after.xp, 10 + 4 * CekLogic.XP_QUICK);
  assert.deepEqual(after.quick, { 1: 4 });
  assert.deepEqual(before, { xp: 10, lessons: {} });
  assert.equal(CekLogic.recordQuick(after, 1, 2).quick[1], 4);
});

test("isQuickUnlocked: terbuka setelah semua pelajaran di bagian itu selesai", () => {
  const scenarios = [{ id: "a", unit: 1 }, { id: "b", unit: 1 }, { id: "c", unit: 2 }];
  const lesson = { found: [], missed: [], extra: [], actionCorrect: true, xp: 10 };
  assert.equal(CekLogic.isQuickUnlocked(scenarios, { xp: 0, lessons: { a: lesson } }, 1), false);
  assert.equal(CekLogic.isQuickUnlocked(scenarios, { xp: 0, lessons: { a: lesson, b: lesson } }, 1), true);
});

test("recordLesson mempertahankan skor Ronde Kilat", () => {
  const before = { xp: 0, lessons: {}, quick: { 1: 3 } };
  const after = CekLogic.recordLesson(before, "palsu", CekLogic.gradeFlags(scam, ["siapa", "file"]), { correct: true });
  assert.deepEqual(after.quick, { 1: 3 });
});

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: (key) => { delete data[key]; }

  };
}

test("gradeFlags: semua tanda ditemukan berarti benar", () => {
  const result = CekLogic.gradeFlags(scam, ["file", "siapa"]);
  assert.deepEqual(result.found, ["siapa", "file"]);
  assert.deepEqual(result.missed, []);
  assert.deepEqual(result.extra, []);
  assert.equal(result.allCorrect, true);
});

test("gradeFlags: mencatat tanda yang terlewat dan yang salah dicurigai", () => {
  const result = CekLogic.gradeFlags(scam, ["siapa", "minta"]);
  assert.deepEqual(result.found, ["siapa"]);
  assert.deepEqual(result.missed, ["file"]);
  assert.deepEqual(result.extra, ["minta"]);
  assert.equal(result.allCorrect, false);
});

test("gradeFlags: memilih 'tidak ada tanda' pada pesan palsu berarti semua terlewat", () => {
  const result = CekLogic.gradeFlags(scam, [CekLogic.NO_FLAGS]);
  assert.deepEqual(result.missed, ["siapa", "file"]);
  assert.equal(result.allCorrect, false);
});

test("gradeFlags: pesan asli benar kalau memilih 'tidak ada tanda'", () => {
  const result = CekLogic.gradeFlags(genuine, [CekLogic.NO_FLAGS]);
  assert.equal(result.allCorrect, true);
});

test("gradeFlags: pesan asli salah kalau ada yang dicurigai", () => {
  const result = CekLogic.gradeFlags(genuine, ["siapa"]);
  assert.deepEqual(result.extra, ["siapa"]);
  assert.equal(result.allCorrect, false);
});

test("gradeAction: membaca jawaban benar dari skenario", () => {
  assert.equal(CekLogic.gradeAction(scam, 1).correct, true);
  assert.equal(CekLogic.gradeAction(scam, 0).correct, false);
  assert.equal(CekLogic.gradeAction(scam, 9).correct, false);
});

test("lessonXp: 10 dasar, +5 semua tanda benar, +5 tindakan tepat", () => {
  assert.equal(CekLogic.lessonXp({ allCorrect: true }, { correct: true }), 20);
  assert.equal(CekLogic.lessonXp({ allCorrect: false }, { correct: true }), 15);
  assert.equal(CekLogic.lessonXp({ allCorrect: false }, { correct: false }), 10);
});

test("recordLesson: menghasilkan progres baru tanpa mengubah yang lama", () => {
  const before = CekLogic.emptyProgress();
  const flags = CekLogic.gradeFlags(scam, ["siapa"]);
  const after = CekLogic.recordLesson(before, "palsu", flags, { correct: true });
  assert.deepEqual(before, { xp: 0, lessons: {} });
  assert.equal(after.xp, 15);
  assert.deepEqual(after.lessons.palsu.missed, ["file"]);
  assert.equal(after.lessons.palsu.actionCorrect, true);
});

test("isUnlocked dan currentIndex: pelajaran terbuka berurutan", () => {
  const list = [scam, genuine];
  const empty = CekLogic.emptyProgress();
  assert.equal(CekLogic.isUnlocked(list, empty, 0), true);
  assert.equal(CekLogic.isUnlocked(list, empty, 1), false);
  assert.equal(CekLogic.currentIndex(list, empty), 0);

  const one = CekLogic.recordLesson(empty, "palsu", CekLogic.gradeFlags(scam, ["siapa", "file"]), { correct: true });
  assert.equal(CekLogic.isUnlocked(list, one, 1), true);
  assert.equal(CekLogic.currentIndex(list, one), 1);

  const all = CekLogic.recordLesson(one, "asli", CekLogic.gradeFlags(genuine, [CekLogic.NO_FLAGS]), { correct: true });
  assert.equal(CekLogic.currentIndex(list, all), -1);
});

test("buildReport: menghitung tanda terlewat dan salah curiga pada pesan asli", () => {
  let progress = CekLogic.emptyProgress();
  progress = CekLogic.recordLesson(progress, "palsu", CekLogic.gradeFlags(scam, ["siapa"]), { correct: false });
  progress = CekLogic.recordLesson(progress, "asli", CekLogic.gradeFlags(genuine, ["minta"]), { correct: true });
  const report = CekLogic.buildReport([scam, genuine], questions, progress);

  assert.equal(report.doneCount, 2);
  assert.equal(report.total, 2);
  assert.equal(report.actionsCorrect, 1);
  assert.deepEqual(report.needsPractice.map((q) => q.id), ["file"]);
  assert.deepEqual(report.perQuestion.find((q) => q.id === "siapa"), { id: "siapa", title: "Siapa?", hint: "", found: 1, missed: 0 });
  assert.equal(report.genuineDone, 1);
  assert.equal(report.falseAlarms, 1);
});

test("buildReport: tanpa tanda terlewat, needsPractice kosong", () => {
  const progress = CekLogic.recordLesson(CekLogic.emptyProgress(), "palsu", CekLogic.gradeFlags(scam, ["siapa", "file"]), { correct: true });
  assert.deepEqual(CekLogic.buildReport([scam, genuine], questions, progress).needsPractice, []);
});

test("buildReport: kalau jumlah terlewat sama, semua yang seri disebut", () => {
  const progress = CekLogic.recordLesson(CekLogic.emptyProgress(), "palsu", CekLogic.gradeFlags(scam, []), { correct: true });
  const report = CekLogic.buildReport([scam, genuine], questions, progress);
  assert.deepEqual(report.needsPractice.map((q) => q.id), ["siapa", "file"]);
});

test("loadProgress: data kosong, rusak, atau aneh menjadi progres kosong", () => {
  assert.deepEqual(CekLogic.loadProgress(null), CekLogic.emptyProgress());
  assert.deepEqual(CekLogic.loadProgress(fakeStorage()), CekLogic.emptyProgress());
  assert.deepEqual(CekLogic.loadProgress(fakeStorage({ [CekLogic.STORAGE_KEY]: "{bukan json" })), CekLogic.emptyProgress());
  assert.deepEqual(CekLogic.loadProgress(fakeStorage({ [CekLogic.STORAGE_KEY]: '{"xp":-5,"lessons":{}}' })), CekLogic.emptyProgress());
  assert.deepEqual(CekLogic.loadProgress(fakeStorage({ [CekLogic.STORAGE_KEY]: '{"xp":5,"lessons":{"a":{"found":1}}}' })), CekLogic.emptyProgress());
});

test("saveProgress lalu loadProgress mengembalikan data yang sama", () => {
  const storage = fakeStorage();
  const progress = CekLogic.recordLesson(CekLogic.emptyProgress(), "palsu", CekLogic.gradeFlags(scam, ["siapa"]), { correct: true });
  assert.equal(CekLogic.saveProgress(storage, progress), true);
  assert.deepEqual(CekLogic.loadProgress(storage), progress);
  CekLogic.clearProgress(storage);
  assert.deepEqual(CekLogic.loadProgress(storage), CekLogic.emptyProgress());
});

test("saveProgress mengembalikan false kalau penyimpanan menolak", () => {
  const broken = { getItem: () => null, setItem: () => { throw new Error("penuh"); }, removeItem: () => {} };
  assert.equal(CekLogic.saveProgress(broken, CekLogic.emptyProgress()), false);
  assert.equal(CekLogic.saveProgress(null, CekLogic.emptyProgress()), false);
});

test("recordMateri: menambah XP dan menyimpan skor terbaik", () => {
  const before = { xp: 0, lessons: {} };
  const after = CekLogic.recordMateri(before, "vishing", 2);
  assert.equal(after.xp, 2 * CekLogic.XP_MATERI);
  assert.deepEqual(after.materi, { vishing: 2 });
  assert.deepEqual(before, { xp: 0, lessons: {} });
  assert.equal(CekLogic.recordMateri(after, "vishing", 1).materi.vishing, 2);
});

test("loadProgress menolak skor materi yang bukan angka", () => {
  const storage = fakeStorage({ [CekLogic.STORAGE_KEY]: JSON.stringify({ xp: 1, lessons: {}, materi: { vishing: "x" } }) });
  assert.deepEqual(CekLogic.loadProgress(storage), CekLogic.emptyProgress());
});

test("recordLesson + buildReport: bagian pesan yang terlewat di soal pertama ikut dihitung", () => {
  const flags = CekLogic.gradeFlags(scam, ["siapa", "file"]);
  const find = CekLogic.gradeFind([true, true, false, true], [0]);
  const after = CekLogic.recordLesson(CekLogic.emptyProgress(), "palsu", flags, { correct: true }, find);
  assert.equal(after.lessons.palsu.findMissed, 2);
  const report = CekLogic.buildReport([scam, genuine], questions, after);
  assert.equal(report.findMissed, 2);
  assert.deepEqual(report.needsPractice, []);
});

test("buildReport: progres lama tanpa findMissed dianggap 0", () => {
  const old = { xp: 10, lessons: { palsu: { found: ["siapa"], missed: [], extra: [], actionCorrect: true, xp: 10 } } };
  assert.equal(CekLogic.buildReport([scam], questions, old).findMissed, 0);
});

test("lessonStars: 1 bintang karena selesai, +1 tanda bahaya lengkap, +1 tindakan tepat", () => {
  const lesson = (missed, extra, actionCorrect) => ({ found: [], missed, extra, actionCorrect });
  assert.equal(CekLogic.lessonStars(lesson([], [], true)), 3);
  assert.equal(CekLogic.lessonStars(lesson(["file"], [], true)), 2);
  assert.equal(CekLogic.lessonStars(lesson([], ["siapa"], false)), 1);
  assert.equal(CekLogic.lessonStars(undefined), 0);
});

test("materiStars: 1 bintang karena selesai, +1 minimal separuh benar, +1 semua benar", () => {
  assert.equal(CekLogic.materiStars(0, 4), 1);
  assert.equal(CekLogic.materiStars(2, 4), 2);
  assert.equal(CekLogic.materiStars(3, 4), 2);
  assert.equal(CekLogic.materiStars(4, 4), 3);
});

test("recordLesson: bintang terbaik disimpan, jadi tidak turun saat pelajaran diulang lebih buruk", () => {
  const perfect = { found: ["siapa"], missed: [], extra: [], allCorrect: true };
  const poor = { found: [], missed: ["siapa"], extra: [], allCorrect: false };
  const first = CekLogic.recordLesson(CekLogic.emptyProgress(), "palsu", perfect, { correct: true });
  const again = CekLogic.recordLesson(first, "palsu", poor, { correct: false });
  assert.equal(CekLogic.lessonStars(again.lessons.palsu), 3);
  assert.deepEqual(again.lessons.palsu.missed, ["siapa"], "rapor tetap memakai percobaan terakhir");
  assert.equal(CekLogic.lessonStars({ found: [], missed: ["x"], extra: [], actionCorrect: false, bestStars: 99 }), 3, "nilai rusak dibatasi 3");
});

test("isFresh: pemain baru sampai ada satu pelajaran, materi, atau Ronde Kilat yang selesai", () => {
  const fresh = CekLogic.emptyProgress();
  assert.equal(CekLogic.isFresh(fresh), true);
  assert.equal(CekLogic.isFresh(CekLogic.recordMateri(fresh, "vishing", 2)), false);
  assert.equal(CekLogic.isFresh(CekLogic.recordQuick(fresh, 1, 3)), false);
});
