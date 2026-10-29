// Logika murni: penilaian, XP, rapor, dan penyimpanan progres.
// Tidak menyentuh tampilan, jadi bisa diuji dengan `node --test`.
const CekLogic = (() => {
  const NO_FLAGS = "none";
  const STORAGE_KEY = "cekdulu.progress.v1";
  const XP_LESSON = 10;
  const XP_ALL_FLAGS = 5;
  const XP_RIGHT_ACTION = 5;

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
      xp: progress.xp + xp,
      lessons: { ...progress.lessons, [scenarioId]: lesson }
    };
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

  function isValidProgress(value) {
    return Boolean(value)
      && typeof value === "object"
      && Number.isFinite(value.xp) && value.xp >= 0
      && Boolean(value.lessons) && typeof value.lessons === "object"
      && Object.values(value.lessons).every(isValidLesson);
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
    emptyProgress,
    gradeFlags,
    gradeAction,
    lessonXp,
    recordLesson,
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
