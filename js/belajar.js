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

  // ?mulai=suara: jalan cepat dari beranda, langsung ke soal suara pertama (untuk yang cuma punya semenit).
  // Langkah sebelumnya dilewati; skor dan progres dihitung dari langkah yang dimainkan saja.
  const firstVoice = materi && new URLSearchParams(location.search).get("mulai") === "suara"
    ? materi.steps.findIndex((step) => step.type === "voice")
    : -1;
  const steps = materi ? materi.steps.slice(Math.max(0, firstVoice)) : [];
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

  // Kartu penjelasan: Coach Wall menjelaskan (VO: dibacakan otomatis kalau ada suara dan Narasi menyala),
  // paragraf pendek, lalu "Lanjut". Tombol "Dengarkan" memutar ulang.
  function showLearn(step) {
    const card = el("div", { className: "learn-card" }, [
      ...step.text.map((paragraph) => el("p", { text: paragraph })),
      step.source && el("p", { className: "learn-source", text: t("materi.source", { source: step.source }) })
    ]);
    dom.task.replaceChildren(
      el("div", { className: "coach task-head" }, [CekUI.coach("teach", "coach.lessonTips"), el("h2", { className: "coach-bubble task-title", tabindex: "-1", text: step.title })]),
      card
    );
    dom.task.querySelector(".task-title").focus({ preventScroll: true });
    narrate(step, card);
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

  // ---------- Suara: VO Coach Wall dan penelepon misterius (js/voice.js) ----------

  const SLOW_RATE = 0.6;
  const stopVoice = () => CekVoice.stop();

  // Catatan jujur di tempat suara dipakai: kalau suaranya online, browser mengirim teks ini ke layanan suaranya.
  const onlineNote = () => CekVoice.isOnline() && el("p", { className: "voice-online", text: t("voice.online") });

  function narrate(step, card) {
    const sentence = (piece) => (/[.!?]$/.test(piece.trim()) ? piece.trim() : `${piece.trim()}.`);
    const text = [step.title, ...step.text].map(sentence).join(" ");
    const listen = el("button", { type: "button", className: "vo-btn" }, [CekUI.icon("speaker"), el("span", { text: t("vo.listen") })]);
    const bars = el("span", { className: "voice-bars", "aria-hidden": "true" }, Array.from({ length: 5 }, () => el("i")));
    const say = () => CekVoice.speak(text, {
      rate: CekSettings.voiceRate(),
      pitch: 1.05,
      onStart: () => card.classList.add("is-speaking"),
      onEnd: () => card.classList.remove("is-speaking")
    });
    listen.addEventListener("click", () => {
      if (card.classList.contains("is-speaking")) stopVoice();
      else say();
    });
    CekVoice.ready(() => {
      if (!card.isConnected || !CekVoice.available()) return;
      card.prepend(el("div", { className: "vo-bar" }, [listen, bars, onlineNote()]));
      if (CekVoice.coachOn()) say();
    });
  }

  function speak(text, rate, card) {
    return CekVoice.speak(text, {
      rate,
      pitch: 0.8, // suara sedikit lebih berat untuk penelepon misterius
      onStart: () => card.classList.add("is-speaking"),
      onEnd: () => card.classList.remove("is-speaking")
    });
  }

  function voiceCard(step) {
    const text = el("p", { className: "voice-text", id: "voice-text", text: `"${step.line}"`, hidden: true });
    CekKit.watchScroll(text); // di layar pendek kalimatnya digulir (css/coach.css)
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
      el("div", { className: "voice-bubble" }, [controls, text, el("div", { className: "voice-foot" }, [toggle, note]), onlineNote()])
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
    CekVoice.ready(() => {
      if (!voice.card.isConnected) return;
      if (CekVoice.available()) voice.say(CekSettings.voiceRate());
      else voice.noVoice();
    });
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
    const streak = CekUI.addLessonStreak();
    CekKit.setProgress(dom.progress, steps.length, steps.length);
    // "Lanjut" ke materi berikutnya; setelah materi terakhir, tombol utamanya kembali ke beranda.
    const next = MATERI[MATERI.indexOf(materi) + 1];
    kit.showDone(Boolean(next));
    dom.task.replaceChildren(el("section", { className: "done", "aria-labelledby": "done-title" }, [
      perfect && CekUI.celebrate(),
      el("div", { className: "done-hero" }, CekUI.mascot(perfect ? "cheer" : "happy")),
      el("h1", { id: "done-title", text: t(perfect ? "materi.perfect" : "materi.done") }),
      CekUI.streakNote(streak),
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

  if (materi) {
    CekKit.setProgress(dom.progress, 0, steps.length);
    showStep();
  } else {
    location.href = "index.html";
  }
})();
