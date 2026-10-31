// Halaman materi "Kenali Jenis Phishing": kartu penjelasan dan mini kuis bergantian, gaya Duolingo.
// Isi materinya ada di js/materi.js.
(() => {
  const { el } = CekUI;
  const storage = CekUI.getStorage();
  const materi = MATERI.find((m) => m.id === new URLSearchParams(location.search).get("m"));

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
  const quizCount = steps.filter((step) => step.type === "quiz").length;

  function nextStep() {
    kit.hideFeedback();
    CekKit.setProgress(dom.progress, state.step + 1, steps.length);
    setState({ step: state.step + 1, choice: null });
    if (state.step < steps.length) showStep();
    else finish();
  }

  function showStep() {
    const step = steps[state.step];
    if (step.type === "learn") showLearn(step);
    else showQuiz(step);
  }

  // Kartu penjelasan: Lupi membawakan materi, paragraf pendek, lalu "Lanjut".
  function showLearn(step) {
    dom.task.replaceChildren(
      el("div", { className: "coach task-head" }, [CekUI.mascot("fish"), el("h2", { className: "coach-bubble task-title", tabindex: "-1", text: step.title })]),
      el("div", { className: "learn-card" }, [
        ...step.text.map((paragraph) => el("p", { text: paragraph })),
        step.source && el("p", { className: "learn-source", text: `Sumber: ${step.source}` })
      ])
    );
    dom.task.querySelector(".task-title").focus({ preventScroll: true });
    kit.setPrimary("Lanjut", true, nextStep);
  }

  function showQuiz(step) {
    const options = step.options.map((option, index) => kit.optionButton(String(index), option.text, () => choose(index), "radio"));
    kit.renderTask(step.question, step.sub, options, "Pilihan jawaban", "quiz", "sus");
    kit.setPrimary("Periksa", false, checkQuiz);
  }

  function choose(index) {
    setState({ choice: index });
    kit.syncPressed([String(index)]);
    kit.bump(dom.task.querySelector(`[data-id="${index}"]`));
    kit.setPrimary("Periksa", true, checkQuiz);
  }

  function checkQuiz() {
    const step = steps[state.step];
    const chosen = step.options[state.choice];
    const isRight = chosen.correct;
    if (isRight) setState({ right: state.right + 1 });
    kit.lockOptions((id) => {
      const index = Number(id);
      if (index === state.choice) return isRight ? "correct" : "wrong";
      return !isRight && step.options[index].correct ? "answer" : "";
    }, (id, status) => (status === "answer" ? step.options[Number(id)].why : ""));
    CekKit.setProgress(dom.progress, state.step + 1, steps.length);
    kit.setMood(isRight);
    kit.showFeedback(isRight ? "good" : "bad", isRight ? "Betul!" : "Belum tepat.", chosen.why, isRight ? CekLogic.XP_MATERI : 0);
    const isLast = state.step === steps.length - 1;
    kit.setPrimary(isLast ? "Selesai" : "Lanjut", true, isLast ? finish : nextStep, isRight ? "good" : "bad");
  }

  function finish() {
    kit.hideFeedback();
    const before = CekLogic.loadProgress(storage);
    const after = CekLogic.recordMateri(before, materi.id, state.right);
    const saved = CekLogic.saveProgress(storage, after);
    const perfect = state.right === quizCount;
    CekSound.play("done");
    CekKit.setProgress(dom.progress, steps.length, steps.length);
    dom.lesson.classList.add("is-done");
    dom.footer.classList.add("is-done");
    dom.task.replaceChildren(el("section", { className: "done", "aria-labelledby": "done-title" }, [
      perfect && CekUI.confetti(),
      CekUI.mascot(perfect ? "cheer" : "happy"),
      el("h1", { id: "done-title", text: perfect ? "Kamu paham banget!" : "Materi selesai!" }),
      el("div", { className: "stats" }, [
        CekUI.stat("Benar", `${state.right}/${quizCount}`),
        CekUI.stat("XP didapat", `+${after.xp - before.xp}`),
        CekUI.stat("Materi", materi.title)
      ]),
      !saved && el("p", { className: "note", text: "Progres tidak bisa disimpan di browser ini." })
    ]));
    kit.setPrimary("Ke jalur belajar", true, () => { location.href = "index.html"; });
    dom.primary.focus();
  }

  if (materi) {
    CekKit.setProgress(dom.progress, 0, steps.length);
    showStep();
  } else {
    location.href = "index.html";
  }
})();
