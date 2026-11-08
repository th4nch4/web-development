// Memeriksa isi js/questions.js, js/scenarios.js, dan js/materi.js beserta versi bahasa Inggrisnya di js/en/.
// Jalankan setelah menambah atau mengedit skenario: node --test tests/logic.test.js tests/scenarios.test.js
const test = require("node:test");
const assert = require("node:assert/strict");

const LANGS = [
  { lang: "id", QUESTIONS: require("../js/questions.js"), ...require("../js/scenarios.js"), MATERI: require("../js/materi.js") },
  { lang: "en", QUESTIONS: require("../js/en/questions.js"), ...require("../js/en/scenarios.js"), MATERI: require("../js/en/materi.js") }
];

const APPS = ["chat", "sms", "email", "notif"];
const STEPS = ["find", "flags", "match", "url", "reply", "action"];

// Semua bagian pesan yang bisa membawa tanda: pengirim, lampiran, dan potongan teks.
function markedFlags(scenario) {
  const segments = scenario.messages.flat().filter((s) => typeof s === "object");
  return [scenario.sender, scenario.attachment, ...segments]
    .filter((part) => part && part.flag)
    .map((part) => part.flag);
}

LANGS.forEach(({ lang, QUESTIONS, UNITS, SCENARIOS, QUICK_ROUND, MATERI }) => {
  const QUESTION_IDS = QUESTIONS.map((q) => q.id);

  test(`[${lang}] ada 5 pertanyaan dengan id unik`, () => {
    assert.equal(QUESTIONS.length, 5);
    assert.equal(new Set(QUESTION_IDS).size, 5);
    QUESTIONS.forEach((q) => {
      assert.ok(q.title && q.hint && q.clear && q.ask, `pertanyaan ${q.id} belum lengkap`);
    });
  });

  test(`[${lang}] id skenario unik`, () => {
    const ids = SCENARIOS.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  SCENARIOS.forEach((s) => {
    test(`[${lang}] skenario "${s.id}" lengkap dan konsisten`, () => {
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

  test(`[${lang}] ada pesan palsu dan pesan asli`, () => {
    assert.ok(SCENARIOS.some((s) => s.flags.length > 0));
    assert.ok(SCENARIOS.some((s) => s.flags.length === 0));
  });

  SCENARIOS.forEach((s) => {
    test(`[${lang}] susunan soal "${s.id}" valid`, () => {
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
      if (s.coach) assert.ok(s.coach.intro && s.coach.good && s.coach.bad, "coach butuh intro, good, dan bad");
      if (steps.includes("reply")) {
        assert.ok(s.reply && s.reply.prompt && s.reply.why, "reply butuh prompt dan why");
        assert.ok(s.reply.words.length >= 3 && s.reply.extra.length >= 1, "reply butuh minimal 3 kata dan 1 pengecoh");
      }
    });
  });

  test(`[${lang}] Ronde Kilat: setiap bagian punya pesan asli dan penipuan`, () => {
    UNITS.forEach((unit) => {
      const items = QUICK_ROUND.filter((q) => q.unit === unit.id);
      assert.ok(items.some((q) => q.scam) && items.some((q) => !q.scam), `bagian ${unit.id} butuh campuran asli dan penipuan`);
      items.forEach((q) => assert.ok(q.sender && q.app && q.text && q.why && typeof q.scam === "boolean", "item Ronde Kilat belum lengkap"));
    });
  });

  MATERI.forEach((m) => {
    test(`[${lang}] materi "${m.id}" lengkap`, () => {
      assert.match(m.id, /^[a-z0-9-]+$/);
      assert.ok(m.title && m.steps.length > 0, "materi butuh title dan steps");
      assert.ok(m.steps.some((step) => step.type === "quiz"), "materi butuh minimal satu kuis");
      m.steps.forEach((step) => {
        assert.ok(["quiz", "learn", "voice"].includes(step.type), `jenis langkah "${step.type}" tidak dikenal`);
        if (step.type === "learn") assert.ok(step.title && step.text.length > 0, "kartu learn butuh title dan text");
        if (step.type === "voice") {
          assert.ok(step.caller && step.line && step.question, "soal suara butuh caller, line, dan question");
          assert.equal(step.options.filter((o) => o.correct).length, 1, `soal suara "${step.question}" harus punya tepat satu jawaban benar`);
          step.options.forEach((o) => assert.ok(o.text && o.why, "setiap pilihan butuh text dan why"));
        }
        if (step.type === "quiz") {
          assert.ok(step.question && step.sub, "kuis butuh question dan sub");
          assert.equal(step.options.filter((o) => o.correct).length, 1, `kuis "${step.question}" harus punya tepat satu jawaban benar`);
          step.options.forEach((o) => assert.ok(o.text && o.why, "setiap pilihan butuh text dan why"));
        }
      });
    });
  });
});

// ---------- Versi Inggris harus sejajar dengan versi Indonesia ----------
// Halaman memuat js/en/scenarios.js sebagai ganti js/scenarios.js, jadi id, urutan, dan susunannya harus sama.

const [ID, EN] = LANGS;
const ids = (list) => list.map((item) => item.id);
// Untuk setiap gelembung: daftar flag dari potongan bertanda, urut seperti di pesan.
const bubbleFlags = (s) => s.messages.map((bubble) => bubble.filter((p) => typeof p === "object").map((p) => p.flag));
const urls = (s) => s.messages.flat().filter((p) => typeof p === "object" && p.url).map((p) => p.url);
const extension = (name) => name.split(".").pop();

test("[en] pertanyaan: id dan urutan sama dengan versi Indonesia", () => {
  assert.deepEqual(ids(EN.QUESTIONS), ids(ID.QUESTIONS));
});

test("[en] UNITS: id, urutan, dan icon sama dengan versi Indonesia", () => {
  assert.deepEqual(EN.UNITS.map((u) => [u.id, u.icon]), ID.UNITS.map((u) => [u.id, u.icon]));
  EN.UNITS.forEach((u) => assert.ok(u.title && u.subtitle && u.world, `unit ${u.id} belum lengkap`));
});

test("[en] skenario: id dan urutan sama dengan versi Indonesia", () => {
  assert.deepEqual(ids(EN.SCENARIOS), ids(ID.SCENARIOS));
});

test("[en] Ronde Kilat: jumlah, urutan, unit, dan scam sama dengan versi Indonesia", () => {
  assert.deepEqual(EN.QUICK_ROUND.map((q) => [q.unit, q.scam]), ID.QUICK_ROUND.map((q) => [q.unit, q.scam]));
});

test("[en] materi: id dan urutan sama dengan versi Indonesia", () => {
  assert.deepEqual(ids(EN.MATERI), ids(ID.MATERI));
});

ID.SCENARIOS.forEach((idScenario, index) => {
  test(`[en] skenario "${idScenario.id}" sejajar dengan versi Indonesia`, () => {
    const en = EN.SCENARIOS[index];
    assert.ok(en && en.id === idScenario.id, "skenario tidak ada di posisi yang sama");
    assert.deepEqual(Object.keys(en).sort(), Object.keys(idScenario).sort(), "key skenario berbeda");
    ["unit", "icon", "app"].forEach((key) => assert.equal(en[key], idScenario[key], `${key} berbeda`));
    assert.deepEqual(en.flags, idScenario.flags, "flags berbeda");
    assert.deepEqual(en.steps, idScenario.steps, "steps berbeda");
    assert.deepEqual(Object.keys(en.evidence), Object.keys(idScenario.evidence), "key evidence berbeda");
    assert.deepEqual(Object.keys(en.clear || {}), Object.keys(idScenario.clear || {}), "key clear berbeda");
    assert.equal(en.sender.flag, idScenario.sender.flag, "flag pengirim berbeda");
    if (idScenario.attachment) {
      assert.equal(en.attachment.flag, idScenario.attachment.flag, "flag lampiran berbeda");
      assert.equal(extension(en.attachment.name), extension(idScenario.attachment.name), "ekstensi file lampiran berbeda");
    }

    assert.equal(en.messages.length, idScenario.messages.length, "jumlah gelembung berbeda");
    assert.deepEqual(bubbleFlags(en), bubbleFlags(idScenario), "urutan potongan bertanda di gelembung berbeda");
    assert.deepEqual(urls(en), urls(idScenario), "alamat link berbeda");

    assert.equal(en.actions.length, idScenario.actions.length, "jumlah tindakan berbeda");
    assert.deepEqual(en.actions.map((a) => a.correct), idScenario.actions.map((a) => a.correct), "tindakan benar berbeda");

    if (idScenario.linkQuiz) {
      const enOptions = en.linkQuiz.options;
      const idOptions = idScenario.linkQuiz.options;
      assert.equal(enOptions.length, idOptions.length, "jumlah pilihan linkQuiz berbeda");
      assert.equal(enOptions.findIndex((o) => o.correct), idOptions.findIndex((o) => o.correct), "jawaban benar linkQuiz berbeda");
      assert.deepEqual(enOptions.map((o) => o.text), idOptions.map((o) => o.text), "alamat di pilihan linkQuiz tidak boleh diterjemahkan");
    }
    if (idScenario.reply) {
      assert.equal(en.reply.words.length, idScenario.reply.words.length, "jumlah kepingan kata reply berbeda");
    }
  });
});

ID.MATERI.forEach((idMateri, index) => {
  test(`[en] materi "${idMateri.id}" sejajar dengan versi Indonesia`, () => {
    const en = EN.MATERI[index];
    assert.ok(en && en.id === idMateri.id, "materi tidak ada di posisi yang sama");
    assert.equal(en.icon, idMateri.icon, "icon berbeda");
    assert.deepEqual(en.steps.map((step) => step.type), idMateri.steps.map((step) => step.type), "jenis langkah berbeda");
    idMateri.steps.forEach((step, i) => {
      if (step.type === "learn") return;
      const enOptions = en.steps[i].options;
      assert.equal(enOptions.length, step.options.length, `jumlah pilihan kuis ${i + 1} berbeda`);
      assert.deepEqual(enOptions.map((o) => o.correct), step.options.map((o) => o.correct), `jawaban benar kuis ${i + 1} berbeda`);
      // Pilihan berupa alamat situs adalah teka-tekinya, jadi harus sama huruf demi huruf.
      step.options.forEach((o, j) => {
        if (/^https?:\/\//.test(o.text)) assert.equal(enOptions[j].text, o.text, `alamat "${o.text}" tidak boleh diubah`);
      });
    });
  });
});
