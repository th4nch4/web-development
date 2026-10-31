// Ronde Kilat "Asli atau Penipuan?": pesan muncul satu per satu, jawab cepat, kumpulkan combo.
// Ada mode santai tanpa waktu supaya tetap bisa dimainkan siapa saja (WCAG 2.2.1).
(() => {
  const { el } = CekUI;
  const SECONDS = 10;
  const storage = CekUI.getStorage();
  const unitId = Number(new URLSearchParams(location.search).get("unit")) || 1;
  const unit = UNITS.find((u) => u.id === unitId);
  const items = QUICK_ROUND.filter((q) => q.unit === unitId);

  const dom = {
    main: document.getElementById("quick"),
    progress: document.getElementById("progress"),
    footer: document.getElementById("footer"),
    feedback: document.getElementById("feedback"),
    buttons: document.getElementById("buttons")
  };

  let state = { index: 0, answers: [], timed: true, timer: null, deadline: 0 };

  function setState(patch) {
    state = { ...state, ...patch };
  }

  function setProgress(done) {
    dom.progress.setAttribute("aria-valuemax", String(items.length));
    dom.progress.setAttribute("aria-valuenow", String(done));
    dom.progress.firstElementChild.style.width = `${(done / items.length) * 100}%`;
  }

  function bigButton(label, className, onClick) {
    return el("button", { type: "button", className: `btn ${className}`, text: label, onClick });
  }

  // ---------- Layar pembuka ----------

  function intro() {
    setProgress(0);
    dom.main.replaceChildren(el("section", { className: "done quick-intro", "aria-labelledby": "quick-title" }, [
      CekUI.mascot("cheer"),
      el("h1", { id: "quick-title", text: "Ronde Kilat!" }),
      el("p", { text: `${items.length} pesan, ${SECONDS} detik per pesan. Asli atau penipuan? Jawab secepatnya, kumpulkan combo!` })
    ]));
    dom.buttons.replaceChildren(
      bigButton("Mulai!", "", () => start(true)),
      bigButton("Santai, tanpa waktu", "btn-quiet", () => start(false))
    );
  }

  function start(timed) {
    setState({ index: 0, answers: [], timed });
    showCard();
  }

  // ---------- Satu pesan ----------

  function card(item) {
    return el("article", { className: "quick-card", "aria-label": `Pesan dari ${item.sender}` }, [
      el("div", { className: "quick-card-top" }, [
        el("span", { className: "app-icon", "aria-hidden": "true", text: item.sender.replace(/[^A-Za-z]/g, "")[0] || "#" }),
        el("strong", { text: item.sender }),
        el("small", { text: item.app })
      ]),
      el("p", { text: item.text })
    ]);
  }

  function showCard() {
    const item = items[state.index];
    dom.footer.className = "lesson-footer";
    dom.feedback.replaceChildren();
    const timerBar = state.timed ? el("div", { className: "quick-timer", "aria-hidden": "true" }, el("span")) : null;
    dom.main.replaceChildren(el("section", { className: "quick-play", "aria-labelledby": "quick-q" }, [
      el("div", { className: "coach task-head" }, [
        CekUI.mascot("think"),
        el("h2", { className: "coach-bubble task-title", id: "quick-q", tabindex: "-1", text: "Asli atau penipuan?" })
      ]),
      timerBar,
      card(item),
      state.answers.length > 0 && el("p", { className: "quick-score", text: `Skor ${state.answers.filter(Boolean).length} · Combo ${currentStreak()}` })
    ]));
    dom.main.querySelector("#quick-q").focus({ preventScroll: true });
    dom.buttons.replaceChildren(
      bigButton("Asli", "btn-real", () => answer(false)),
      bigButton("Penipuan", "btn-scam", () => answer(true))
    );
    if (state.timed) startTimer(timerBar.firstElementChild);
  }

  function currentStreak() {
    let streak = 0;
    for (let i = state.answers.length - 1; i >= 0 && state.answers[i]; i -= 1) streak += 1;
    return streak;
  }

  function startTimer(bar) {
    const deadline = Date.now() + SECONDS * 1000;
    const tick = () => {
      const left = Math.max(0, deadline - Date.now());
      bar.style.width = `${(left / (SECONDS * 1000)) * 100}%`;
      if (left === 0) answer(null);
    };
    clearInterval(state.timer);
    setState({ timer: setInterval(tick, 100) });
    tick();
  }

  // pickedScam: true/false, atau null kalau waktunya habis.
  function answer(pickedScam) {
    clearInterval(state.timer);
    const item = items[state.index];
    const isRight = pickedScam === item.scam;
    const answers = [...state.answers, isRight];
    setState({ answers });
    setProgress(answers.length);
    const streak = currentStreak();
    CekSound.play(!isRight ? "bad" : streak >= 2 ? "combo" : "good");
    const quickCard = dom.main.querySelector(".quick-card");
    quickCard.classList.add(isRight ? "is-correct" : "is-wrong");
    dom.main.querySelector(".mascot").replaceWith(CekUI.mascot(isRight ? "cheer" : "oops"));
    const verdict = item.scam ? "Ini penipuan." : "Ini asli.";
    let heading = isRight ? `Betul! ${verdict}` : `Yah! ${verdict}`;
    if (pickedScam === null) heading = `Waktu habis! ${verdict}`;
    dom.footer.className = `lesson-footer is-${isRight ? "good" : "bad"}`;
    dom.feedback.replaceChildren(
      el("p", { className: "feedback-cheer" }, [
        isRight ? "Mantap!" : "Santai, lanjut!",
        isRight && el("span", { className: "xp-pop", text: `+${CekLogic.XP_QUICK} XP` }),
        streak >= 2 && el("span", { className: "combo", text: `${streak}x combo!` })
      ]),
      el("h2", {}, [CekUI.icon(isRight ? "check" : "alert"), heading]),
      el("p", { text: item.why })
    );
    const isLast = state.index === items.length - 1;
    dom.buttons.replaceChildren(bigButton(isLast ? "Lihat skor" : "Lanjut", isRight ? "btn-good" : "btn-bad", isLast ? finish : nextCard));
    dom.buttons.firstElementChild.focus();
  }

  function nextCard() {
    setState({ index: state.index + 1 });
    showCard();
  }

  // ---------- Skor ----------

  function finish() {
    const score = CekLogic.quickScore(state.answers);
    const before = CekLogic.loadProgress(storage);
    const after = CekLogic.recordQuick(before, unitId, score.right);
    const saved = CekLogic.saveProgress(storage, after);
    const great = score.right >= score.total - 1;
    CekSound.play("done");
    dom.footer.className = "lesson-footer is-done";
    dom.feedback.replaceChildren();
    dom.main.replaceChildren(el("section", { className: "done", "aria-labelledby": "score-title" }, [
      great && CekUI.confetti(),
      CekUI.mascot(great ? "cheer" : "happy"),
      el("h1", { id: "score-title", text: great ? "Kilat banget! Kamu jago!" : "Ronde selesai!" }),
      el("div", { className: "stats" }, [
        CekUI.stat("Skor", `${score.right}/${score.total}`),
        CekUI.stat("Combo terpanjang", String(score.bestStreak)),
        CekUI.stat("XP didapat", `+${after.xp - before.xp}`)
      ]),
      !saved && el("p", { className: "note", text: "Skor tidak bisa disimpan di browser ini." })
    ]));
    dom.buttons.replaceChildren(
      bigButton("Main lagi", "btn-quiet", () => start(state.timed)),
      bigButton("Ke jalur belajar", "", () => { location.href = "index.html"; })
    );
  }

  if (unit && items.length > 0) intro();
  else location.href = "index.html";
})();
