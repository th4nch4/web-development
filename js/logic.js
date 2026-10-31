// Logika murni: penilaian, XP, rapor, dan penyimpanan progres.
// Tidak menyentuh tampilan, jadi bisa diuji dengan `node --test`.
const CekLogic = (() => {
  const NO_FLAGS = "none";
  const STORAGE_KEY = "cekdulu.progress.v1";
  const XP_LESSON = 10;
  const XP_ALL_FLAGS = 5;
  const XP_RIGHT_ACTION = 5;
  const XP_QUICK = 2; // per jawaban benar di Ronde Kilat
  const XP_MATERI = 2; // per jawaban benar di materi

  /** @returns {{ xp: number, lessons: Object<string, object> }} */
  function emptyProgress() {
    return { xp: 0, lessons: {} };
  }

  /**
   * Bandingkan tanda yang dipilih pemain dengan tanda yang benar.
   * @param {{ flags: string[] }} scenario
   * @param {string[]} selected  id pertanyaan, atau NO_FLAGS untuk "tidak ada tanda bahaya"
   * @returns {{ found: string[], missed: string[], extra: string[], allCorrect: boolean }}
   */
  function gradeFlags(scenario, selected) {
    const picked = selected.filter((id) => id !== NO_FLAGS);
    const found = scenario.flags.filter((id) => picked.includes(id));
    const missed = scenario.flags.filter((id) => !picked.includes(id));
    const extra = picked.filter((id) => !scenario.flags.includes(id));
    return { found, missed, extra, allCorrect: missed.length === 0 && extra.length === 0 };
  }

  /**
   * Langkah "Cari": bandingkan bagian pesan yang ditandai pemain dengan bagian yang memang mencurigakan.
   * @param {boolean[]} suspicious  per bagian pesan (urut seperti di layar): true kalau mencurigakan
   * @param {number[]} picked  indeks bagian yang ditandai pemain
   * @returns {{ found: number[], missed: number[], extra: number[], total: number, allCorrect: boolean }}
   */
  function gradeFind(suspicious, picked) {
    const indexes = suspicious.map((_, index) => index);
    const found = indexes.filter((i) => suspicious[i] && picked.includes(i));
    const missed = indexes.filter((i) => suspicious[i] && !picked.includes(i));
    const extra = indexes.filter((i) => !suspicious[i] && picked.includes(i));
    return { found, missed, extra, total: found.length + missed.length, allCorrect: missed.length === 0 && extra.length === 0 };
  }

  /**
   * Soal "Pasangkan" dinilai seperti soal tanda bahaya: pasangan yang langsung benar = ditemukan,
   * pasangan yang sempat salah = terlewat. Hasilnya dipakai rapor dengan cara yang sama.
   * @param {{ flags: string[] }} scenario
   * @param {string[]} wrongFlags  pertanyaan yang sempat salah dipasangkan
   */
  function gradeMatch(scenario, wrongFlags) {
    return gradeFlags(scenario, scenario.flags.filter((id) => !wrongFlags.includes(id)));
  }

  /** Soal "Susun": benar kalau urutan keping kata sama persis dengan jawabannya. */
  function gradeReply(words, answer) {
    return answer.length === words.length && answer.every((word, i) => word === words[i]);
  }

  /**
   * Ronde Kilat: skor dan combo terpanjang.
   * @param {boolean[]} answers  true kalau jawaban benar, urut seperti dimainkan
   */
  function quickScore(answers) {
    let streak = 0;
    let best = 0;
    answers.forEach((right) => {
      streak = right ? streak + 1 : 0;
      best = Math.max(best, streak);
    });
    return { right: answers.filter(Boolean).length, total: answers.length, bestStreak: best };
  }

  /**
   * @param {{ actions: { correct: boolean }[] }} scenario
   * @param {number} index
   * @returns {{ index: number, correct: boolean }}
   */
  function gradeAction(scenario, index) {
    const action = scenario.actions[index];
    return { index, correct: Boolean(action && action.correct) };
  }

  function lessonXp(flagResult, actionResult) {
    return XP_LESSON
      + (flagResult.allCorrect ? XP_ALL_FLAGS : 0)
      + (actionResult.correct ? XP_RIGHT_ACTION : 0);
  }

  /** Mengembalikan progres baru; progres lama tidak diubah. */
  function recordLesson(progress, scenarioId, flagResult, actionResult) {
    const xp = lessonXp(flagResult, actionResult);
    const lesson = {
      found: flagResult.found,
      missed: flagResult.missed,
      extra: flagResult.extra,
      actionCorrect: actionResult.correct,
      xp
    };
    return {
      ...progress,
      xp: progress.xp + xp,
      lessons: { ...progress.lessons, [scenarioId]: lesson }
    };
  }

  /** Ronde Kilat: tambah XP dan simpan skor terbaik per bagian. Progres lama tidak diubah. */
  function recordQuick(progress, unitId, right) {
    const quick = progress.quick || {};
    return {
      ...progress,
      xp: progress.xp + right * XP_QUICK,
      quick: { ...quick, [unitId]: Math.max(quick[unitId] || 0, right) }
    };
  }

  /** Materi: tambah XP dan simpan skor terbaik per materi. Progres lama tidak diubah. */
  function recordMateri(progress, materiId, right) {
    const materi = progress.materi || {};
    return {
      ...progress,
      xp: progress.xp + right * XP_MATERI,
      materi: { ...materi, [materiId]: Math.max(materi[materiId] || 0, right) }
    };
  }

  /** Ronde Kilat sebuah bagian terbuka setelah semua pelajaran di bagian itu selesai. */
  function isQuickUnlocked(scenarios, progress, unitId) {
    return scenarios.filter((s) => s.unit === unitId).every((s) => isDone(progress, s.id));
  }

  function isDone(progress, scenarioId) {
    return Boolean(progress.lessons[scenarioId]);
  }

  // Pelajaran terbuka berurutan: yang pertama selalu terbuka.
  function isUnlocked(scenarios, progress, index) {
    return index === 0 || isDone(progress, scenarios[index - 1].id);
  }

  /** @returns {number} indeks pelajaran pertama yang belum selesai, atau -1 kalau semua selesai */
  function currentIndex(scenarios, progress) {
    return scenarios.findIndex((s) => !isDone(progress, s.id));
  }

  function buildReport(scenarios, questions, progress) {
    const done = scenarios.filter((s) => isDone(progress, s.id));
    const countWhere = (pick) => done.filter((s) => pick(progress.lessons[s.id])).length;

    const perQuestion = questions.map((q) => ({
      id: q.id,
      title: q.title,
      hint: q.hint,
      found: countWhere((lesson) => lesson.found.includes(q.id)),
      missed: countWhere((lesson) => lesson.missed.includes(q.id))
    }));
    // Semua pertanyaan dengan jumlah terlewat terbanyak (bisa lebih dari satu kalau seri).
    const maxMissed = Math.max(0, ...perQuestion.map((q) => q.missed));
    const needsPractice = maxMissed === 0 ? [] : perQuestion.filter((q) => q.missed === maxMissed);
    const genuine = done.filter((s) => s.flags.length === 0);

    return {
      xp: progress.xp,
      doneCount: done.length,
      total: scenarios.length,
      actionsCorrect: countWhere((lesson) => lesson.actionCorrect),
      perQuestion,
      needsPractice,
      genuineDone: genuine.length,
      falseAlarms: genuine.filter((s) => progress.lessons[s.id].extra.length > 0).length
    };
  }

  function isValidLesson(lesson) {
    return Boolean(lesson)
      && Array.isArray(lesson.found)
      && Array.isArray(lesson.missed)
      && Array.isArray(lesson.extra);
  }

  // Skor tambahan (Ronde Kilat, materi) boleh tidak ada; kalau ada, isinya angka.
  function isScoreMap(value) {
    return value === undefined || (Boolean(value) && typeof value === "object" && Object.values(value).every(Number.isFinite));
  }

  function isValidProgress(value) {
    return Boolean(value)
      && typeof value === "object"
      && Number.isFinite(value.xp) && value.xp >= 0
      && Boolean(value.lessons) && typeof value.lessons === "object"
      && Object.values(value.lessons).every(isValidLesson)
      && isScoreMap(value.quick)
      && isScoreMap(value.materi);
  }

  // Penyimpanan bisa tidak tersedia (mode privat, diblokir). Progres kosong adalah cadangan yang aman.
  function loadProgress(storage) {
    if (!storage) return emptyProgress();
    try {
      const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
      return isValidProgress(parsed) ? parsed : emptyProgress();
    } catch (error) {
      return emptyProgress();
    }
  }

  /** @returns {boolean} false kalau progres tidak bisa disimpan */
  function saveProgress(storage, progress) {
    if (!storage) return false;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(progress));
      return true;
    } catch (error) {
      return false;
    }
  }

  function clearProgress(storage) {
    if (!storage) return false;
    try {
      storage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  return {
    NO_FLAGS,
    STORAGE_KEY,
    XP_ALL_FLAGS,
    XP_RIGHT_ACTION,
    emptyProgress,
    gradeFind,
    gradeMatch,
    gradeReply,
    quickScore,
    gradeFlags,
    gradeAction,
    lessonXp,
    recordLesson,
    recordQuick,
    recordMateri,
    XP_MATERI,
    isQuickUnlocked,
    XP_QUICK,
    isDone,
    isUnlocked,
    currentIndex,
    buildReport,
    loadProgress,
    saveProgress,
    clearProgress
  };
})();

if (typeof module !== "undefined") module.exports = CekLogic;
