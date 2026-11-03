// Memeriksa isi js/scenarios.js. Jalankan setelah menambah atau mengedit skenario: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const QUESTIONS = require("../js/questions.js");
const { UNITS, SCENARIOS, QUICK_ROUND } = require("../js/scenarios.js");

const QUESTION_IDS = QUESTIONS.map((q) => q.id);
const APPS = ["chat", "sms", "email", "notif"];

// Semua bagian pesan yang bisa membawa tanda: pengirim, lampiran, dan potongan teks.
function markedFlags(scenario) {
  const segments = scenario.messages.flat().filter((s) => typeof s === "object");
  return [scenario.sender, scenario.attachment, ...segments]
    .filter((part) => part && part.flag)
    .map((part) => part.flag);
}

test("ada 5 pertanyaan dengan id unik", () => {
  assert.equal(QUESTIONS.length, 5);
  assert.equal(new Set(QUESTION_IDS).size, 5);
  QUESTIONS.forEach((q) => {
    assert.ok(q.title && q.hint && q.clear && q.ask, `pertanyaan ${q.id} belum lengkap`);
  });
});

test("id skenario unik", () => {
  const ids = SCENARIOS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

SCENARIOS.forEach((s) => {
  test(`skenario "${s.id}" lengkap dan konsisten`, () => {
    assert.match(s.id, /^[a-z0-9-]+$/, "id hanya huruf kecil, angka, dan tanda hubung");
    assert.ok(UNITS.some((u) => u.id === s.unit), "unit tidak ada di UNITS");
    assert.ok(typeof s.icon === "string" && s.icon, "icon wajib diisi (nama ikon di js/ui.js)");
    assert.ok(APPS.includes(s.app), `app harus salah satu dari ${APPS.join(", ")}`);
    assert.ok(s.title && s.verdict && s.takeaway, "title, verdict, dan takeaway wajib diisi");
    assert.ok(s.sender && s.sender.name && s.sender.detail, "sender.name dan sender.detail wajib diisi");
    if (s.app === "email" || s.app === "notif") assert.ok(s.subject, "email dan notif butuh subject");

    assert.ok(Array.isArray(s.messages) && s.messages.length > 0, "messages minimal satu gelembung");
    s.messages.flat().forEach((segment) => {
      if (typeof segment === "string") return;
      assert.ok(segment.text, "potongan teks butuh text");
      if (segment.url) assert.ok(segment.detail, `link "${segment.text}" butuh detail`);
    });

    s.flags.forEach((flag) => {
      assert.ok(QUESTION_IDS.includes(flag), `flag "${flag}" tidak dikenal`);
      assert.ok(s.evidence[flag], `flag "${flag}" belum punya penjelasan di evidence`);
    });
    const marked = markedFlags(s);
    s.flags.forEach((flag) => {
      assert.ok(marked.includes(flag), `flag "${flag}" belum ditandai di bagian pesan mana pun`);
    });
    marked.forEach((flag) => {
      assert.ok(s.flags.includes(flag), `bagian pesan ditandai "${flag}", tapi "${flag}" tidak ada di flags`);
    });
    Object.keys(s.clear || {}).forEach((key) => {
      assert.ok(QUESTION_IDS.includes(key), `clear.${key} bukan id pertanyaan`);
      assert.ok(!s.flags.includes(key), `clear.${key} bertentangan dengan flags`);
    });

    assert.ok(s.actions.length >= 2 && s.actions.length <= 4, "pilihan tindakan 2 sampai 4");
    assert.ok(s.actions.some((a) => a.correct), "minimal satu tindakan benar");
    assert.ok(s.actions.some((a) => !a.correct), "minimal satu tindakan salah");
    s.actions.forEach((a) => assert.ok(a.label && a.why, "setiap tindakan butuh label dan why"));
  });
});

test("ada pesan palsu dan pesan asli", () => {
  assert.ok(SCENARIOS.some((s) => s.flags.length > 0));
  assert.ok(SCENARIOS.some((s) => s.flags.length === 0));
});

const STEPS = ["find", "flags", "match", "url", "reply", "action"];

SCENARIOS.forEach((s) => {
  test(`susunan soal "${s.id}" valid`, () => {
    const steps = s.steps || ["find", "flags", "action"];
    steps.forEach((step) => assert.ok(STEPS.includes(step), `jenis soal "${step}" tidak dikenal`));
    assert.equal(steps[0], "find", "soal pertama harus find");
    assert.equal(steps[steps.length - 1], "action", "soal terakhir harus action");
    assert.ok(steps.includes("flags") || steps.includes("match"), "butuh flags atau match");
    if (steps.includes("match")) assert.ok(s.flags.length >= 2, "match butuh minimal 2 flags");
    if (steps.includes("url")) {
      assert.ok(s.linkQuiz && s.linkQuiz.question && s.linkQuiz.why, "url butuh linkQuiz lengkap");
      assert.equal(s.linkQuiz.options.filter((o) => o.correct).length, 1, "linkQuiz harus punya tepat satu jawaban benar");
    }
    if (s.lupi) assert.ok(s.lupi.intro && s.lupi.good && s.lupi.bad, "lupi butuh intro, good, dan bad");
    if (steps.includes("reply")) {
      assert.ok(s.reply && s.reply.prompt && s.reply.why, "reply butuh prompt dan why");
      assert.ok(s.reply.words.length >= 3 && s.reply.extra.length >= 1, "reply butuh minimal 3 kata dan 1 pengecoh");
    }
  });
});

test("Ronde Kilat: setiap bagian punya pesan asli dan penipuan", () => {
  UNITS.forEach((unit) => {
    const items = QUICK_ROUND.filter((q) => q.unit === unit.id);
    assert.ok(items.some((q) => q.scam) && items.some((q) => !q.scam), `bagian ${unit.id} butuh campuran asli dan penipuan`);
    items.forEach((q) => assert.ok(q.sender && q.app && q.text && q.why && typeof q.scam === "boolean", "item Ronde Kilat belum lengkap"));
  });
});

const MATERI = require("../js/materi.js");

MATERI.forEach((m) => {
  test(`materi "${m.id}" lengkap`, () => {
    assert.match(m.id, /^[a-z0-9-]+$/);
    assert.ok(m.title && m.steps.length > 0, "materi butuh title dan steps");
    assert.ok(m.steps.some((step) => step.type === "quiz"), "materi butuh minimal satu kuis");
    m.steps.forEach((step) => {
      assert.ok(["quiz", "learn"].includes(step.type), `jenis langkah "${step.type}" tidak dikenal`);
      if (step.type === "learn") assert.ok(step.title && step.text.length > 0, "kartu learn butuh title dan text");
      if (step.type === "quiz") {
        assert.ok(step.question && step.sub, "kuis butuh question dan sub");
        assert.equal(step.options.filter((o) => o.correct).length, 1, `kuis "${step.question}" harus punya tepat satu jawaban benar`);
        step.options.forEach((o) => assert.ok(o.text && o.why, "setiap pilihan butuh text dan why"));
      }
    });
  });
});
