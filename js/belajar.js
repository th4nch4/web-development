// Halaman materi "Kenali Jenis Phishing" (Dunia 3 di peta): kartu penjelasan, mini kuis, dan soal suara
// bergantian, gaya Duolingo. Isi materinya ada di js/materi.js.
(() => {
  const { el } = CekUI;
  const { t } = CekLang;
  const storage = CekUI.getStorage();
  const materi = MATERI.find((m) => m.id === new URLSearchParams(location.search).get("m"));
  if (materi) CekWorld.decoratePage(CekWorld.MATERI_WORLD);

  const dom = {
    lesson: document.getElementById("lesson"),
    progress: document.getElementById("progress"),
    task: document.getElementById("task"),
    footer: document.getElementById("footer"),
    feedback: document.getElementById("feedback"),
    primary: document.getElementById("primary")
  };
  const kit = CekKit.create(dom);

  let state = { step: 0, choice: null, right: 0 };

  function setState(patch) {
    state = { ...state, ...patch };
  }

  const steps = materi ? materi.steps : [];
  const quizCount = steps.filter((step) => step.type !== "learn").length; // kuis + soal suara

  function nextStep() {
    stopVoice();
    kit.hideFeedback();
    CekKit.setProgress(dom.progress, state.step + 1, steps.length);
    setState({ step: state.step + 1, choice: null });
    if (state.step < steps.length) showStep();
    else finish();
  }

  function showStep() {
    const step = steps[state.step];
    if (step.type === "learn") showLearn(step);
    else if (step.type === "voice") showVoice(step);
    else showQuiz(step);
  }

  // Kartu penjelasan: Coach Wall menjelaskan, paragraf pendek, lalu "Lanjut".
  function showLearn(step) {
    dom.task.replaceChildren(
      el("div", { className: "coach task-head" }, [CekUI.coach("teach", "coach.lessonTips"), el("h2", { className: "coach-bubble task-title", tabindex: "-1", text: step.title })]),
      el("div", { className: "learn-card" }, [
        ...step.text.map((paragraph) => el("p", { text: paragraph })),
        step.source && el("p", { className: "learn-source", text: t("materi.source", { source: step.source }) })
      ])
    );
    dom.task.querySelector(".task-title").focus({ preventScroll: true });
    // Fungsi baru (bukan nextStep langsung) supaya jeda pengaman klik ganda ikut berjalan:
    // tombol sebelumnya juga "Lanjut" dengan nextStep, jadi klik kedua bisa melompati kartu ini.
    kit.setPrimary(t("common.continue"), true, () => nextStep());
  }

  function quizOptions(step) {
    return step.options.map((option, index) => kit.optionButton(String(index), option.text, () => choose(index), "radio"));
  }

  function showQuiz(step) {
    kit.renderTask(step.question, step.sub, quizOptions(step), t("materi.group"), "quiz", "sus");
    kit.setPrimary(t("common.check"), false, checkQuiz);
  }

  // ---------- Soal suara: penelepon misterius bicara, pemain memilih jawaban ----------
  // Suara dibuat browser (speechSynthesis) hanya dengan suara yang terpasang di perangkat (localService),
  // jadi kalimatnya tidak dikirim ke server mana pun. Tanpa suara yang cocok, kalimatnya ditampilkan sebagai teks.

  const hasSpeech = "speechSynthesis" in window;
  const LANG_TAG = { id: "id-ID", en: "en-US" };
  const SLOW_RATE = 0.6;
  let speakTimer = null;
  let currentUtterance = null; // ucapan yang sedang diputar; ucapan lama yang dibatalkan tidak boleh mengubah tampilan
  if (hasSpeech) window.speechSynthesis.getVoices(); // mulai memuat daftar suara sejak awal

  function localVoice() {
    if (!hasSpeech) return null;
    const tag = LANG_TAG[CekLang.lang];
    const voices = window.speechSynthesis.getVoices()
      .filter((voice) => voice.localService && voice.lang.replace("_", "-").toLowerCase().startsWith(tag.slice(0, 2)));
    return voices.find((voice) => voice.lang.replace("_", "-") === tag) || voices[0] || null;
  }

  function stopVoice() {
    currentUtterance = null;
    clearTimeout(speakTimer);
    if (hasSpeech) window.speechSynthesis.cancel();
    const card = dom.task.querySelector(".voice-card");
    if (card) card.classList.remove("is-speaking");
  }

  function speak(text, rate, card) {
    const voice = localVoice();
    if (!voice) return false;
    stopVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = rate;
    utterance.pitch = 0.8; // suara sedikit lebih berat untuk penelepon misterius
    const done = () => {
      if (currentUtterance !== utterance) return;
      currentUtterance = null;
      clearTimeout(speakTimer);
      card.classList.remove("is-speaking");
    };
    utterance.addEventListener("end", done);
    utterance.addEventListener("error", done);
    currentUtterance = utterance;
    card.classList.add("is-speaking");
    speakTimer = setTimeout(done, (text.length * 110) / rate + 2000); // cadangan kalau "end" tidak pernah datang
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function voiceCard(step) {
    const text = el("p", { className: "voice-text", id: "voice-text", text: `"${step.line}"`, hidden: true });
    const toggle = el("button", { type: "button", className: "link-btn voice-toggle", "aria-controls": "voice-text", "aria-expanded": "false", text: t("voice.show") });
    const note = el("p", { className: "voice-note", text: t("voice.noVoice"), hidden: true });
    const play = el("button", { type: "button", className: "voice-play", "aria-label": t("voice.play") }, CekUI.icon("speaker"));
    const slow = el("button", { type: "button", className: "voice-slow", "aria-label": t("voice.slow") }, CekUI.icon("turtle"));
    const controls = el("div", { className: "voice-controls" }, [play, slow,
      el("span", { className: "voice-bars", "aria-hidden": "true" }, Array.from({ length: 7 }, () => el("i")))]);
    const card = el("div", { className: "voice-card" }, [
      el("div", { className: "voice-caller" }, [
        el("span", { className: "caller-art", "aria-hidden": "true", html: CekCoach.caller() }),
        el("span", { className: "voice-label" }, [el("small", { text: t("voice.calling") }), el("strong", { text: step.caller })])
      ]),
      el("div", { className: "voice-bubble" }, [controls, text, el("div", { className: "voice-foot" }, [toggle, note])])
    ]);
    const showText = (visible) => {
      text.hidden = !visible;
      toggle.setAttribute("aria-expanded", String(visible));
      toggle.textContent = t(visible ? "voice.hide" : "voice.show");
    };
    // Tanpa suara di perangkat: tombol putar disembunyikan, kalimatnya langsung terbaca.
    const noVoice = () => {
      controls.hidden = true;
      note.hidden = false;
      showText(true);
    };
    const say = (rate) => { if (!speak(step.line, rate, card)) noVoice(); };
    toggle.addEventListener("click", () => showText(text.hidden));
    play.addEventListener("click", () => say(CekSettings.voiceRate()));
    slow.addEventListener("click", () => say(SLOW_RATE));
    return { card, say, noVoice, showText };
  }

  function showVoice(step) {
    const voice = voiceCard(step);
    kit.renderTask(step.question, "", quizOptions(step), t("materi.group"), "quiz", "think", voice.card);
    kit.setPrimary(t("common.check"), false, checkQuiz);
    // Langsung diputar seperti soal mendengar di Duolingo (pemain sudah mengetuk "Lanjut", jadi browser mengizinkan).
    if (localVoice()) voice.say(CekSettings.voiceRate());
    else voice.noVoice();
  }

  // Penjelasan jawaban benar ditulis untuk pemain yang memilihnya ("Tepat! ..."). Saat ditampilkan sebagai
  // catatan untuk pemain yang salah pilih, seruan pembukanya dibuang.
  const answerNote = (why) => why.replace(/^(Tepat|Betul|Benar|Exactly|Right|Correct)!\s*/, "");

  function choose(index) {
    setState({ choice: index });
    kit.syncPressed([String(index)]);
    kit.setPrimary(t("common.check"), true, checkQuiz);
  }

  function checkQuiz() {
    stopVoice();
    const step = steps[state.step];
    const chosen = step.options[state.choice];
    const isRight = chosen.correct;
    if (isRight) setState({ right: state.right + 1 });
    kit.lockOptions((id) => {
      const index = Number(id);
      if (index === state.choice) return isRight ? "correct" : "wrong";
      return !isRight && step.options[index].correct ? "answer" : "";
    }, (id, status) => (status === "answer" ? answerNote(step.options[Number(id)].why) : ""), { answer: t("status.theAnswer"), wrong: t("status.yourPick") });
    // Soal suara: setelah menjawab, kalimat penelepon ditampilkan supaya bisa dibaca ulang.
    const transcript = dom.task.querySelector(".voice-text");
    if (transcript) transcript.hidden = false;
    CekKit.setProgress(dom.progress, state.step + 1, steps.length);
    kit.showFeedback(isRight ? "good" : "bad", t(isRight ? "materi.right" : "materi.wrong"), chosen.why, isRight ? CekLogic.XP_MATERI : 0);
    const isLast = state.step === steps.length - 1;
    kit.setPrimary(t(isLast ? "common.finish" : "common.continue"), true, isLast ? finish : nextStep, isRight ? "good" : "bad");
  }

  function finish() {
    stopVoice();
    kit.hideFeedback();
    const before = CekLogic.loadProgress(storage);
    const after = CekLogic.recordMateri(before, materi.id, state.right);
    const saved = CekLogic.saveProgress(storage, after);
    const perfect = state.right === quizCount;
    CekKit.setProgress(dom.progress, steps.length, steps.length);
    // "Lanjut" ke materi berikutnya; setelah materi terakhir, tombol utamanya kembali ke beranda.
    const next = MATERI[MATERI.indexOf(materi) + 1];
    kit.showDone(Boolean(next));
    dom.task.replaceChildren(el("section", { className: "done", "aria-labelledby": "done-title" }, [
      perfect && CekUI.confetti(),
      el("div", { className: "done-hero" }, CekUI.mascot(perfect ? "cheer" : "happy")),
      el("h1", { id: "done-title", text: t(perfect ? "materi.perfect" : "materi.done") }),
      el("div", { className: "stats" }, [
        CekUI.stat(t("common.xpEarned"), `+${after.xp - before.xp}`, "bolt", "gold"),
        CekUI.stat(t("materi.correct"), `${state.right}/${quizCount}`, "target", "green"),
        CekUI.stat(t("materi.label"), materi.title, "hook", "blue")
      ]),
      !saved && el("p", { className: "note", text: t("common.notSaved") })
    ]));
    if (next) kit.setPrimary(t("common.continue"), true, () => { location.href = `materi.html?m=${encodeURIComponent(next.id)}`; });
    else kit.setPrimary(t("common.home"), true, () => { location.href = "index.html"; });
    dom.primary.focus();
  }

  CekUI.guardExit(() => Boolean(materi) && !dom.lesson.classList.contains("is-done"));
  window.addEventListener("pagehide", stopVoice);

  if (materi) {
    CekKit.setProgress(dom.progress, 0, steps.length);
    showStep();
  } else {
    location.href = "index.html";
  }
})();
