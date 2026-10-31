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

const ids = ["siapa", "file", "minta"];

test("doubtVerdict: satu jawaban 'ya' sudah cukup untuk berbahaya, walau belum semua dijawab", () => {
  const verdict = CekLogic.doubtVerdict(ids, { file: "ya" });
  assert.equal(verdict.level, "danger");
  assert.deepEqual(verdict.yes, ["file"]);
});

test("doubtVerdict: tanpa 'ya', pertanyaan yang belum dijawab membuat hasil belum lengkap", () => {
  const verdict = CekLogic.doubtVerdict(ids, { siapa: "tidak" });
  assert.equal(verdict.level, "incomplete");
  assert.equal(verdict.remaining, 2);
});

test("doubtVerdict: 'tidak yakin' tidak pernah dianggap aman", () => {
  const verdict = CekLogic.doubtVerdict(ids, { siapa: "tidak", file: "ragu", minta: "tidak" });
  assert.equal(verdict.level, "unsure");
  assert.deepEqual(verdict.unsure, ["file"]);
});

test("doubtVerdict: semua 'tidak' berarti tidak ketemu tanda, bukan aman", () => {
  const verdict = CekLogic.doubtVerdict(ids, { siapa: "tidak", file: "tidak", minta: "tidak" });
  assert.equal(verdict.level, "none-found");
});

test("doubtVerdict: jawaban yang tidak dikenal dihitung belum dijawab", () => {
  const verdict = CekLogic.doubtVerdict(ids, { siapa: "tidak", file: "mungkin", minta: "tidak", lain: "ya" });
  assert.equal(verdict.level, "incomplete");
  assert.equal(verdict.remaining, 1);
});
