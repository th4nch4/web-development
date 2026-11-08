// Ronde Kilat "Asli atau Penipuan?": pesan muncul satu per satu, jawab cepat, kumpulkan combo.
// Ada mode santai tanpa waktu supaya tetap bisa dimainkan siapa saja (WCAG 2.2.1).
(() => {
  const { el } = CekUI;
  const { t } = CekLang;
  const COOLDOWN_MS = 500;
  const TICK_MS = 100;
  const storage = CekUI.getStorage();
  const unitId = Number(new URLSearchParams(location.search).get("unit")) || 1;
  const unit = UNITS.find((u) => u.id === unitId);
  const items = QUICK_ROUND.filter((q) => q.unit === unitId);
  if (unit) CekWorld.decoratePage(unitId);

  const dom = {
    main: document.getElementById("quick"),
    progress: document.getElementById("progress"),
    footer: document.getElementById("footer"),
    feedback: document.getElementById("feedback"),
    buttons: document.getElementById("buttons")
  };

  // seconds: waktu per pesan (10 atau 20, dari Pengaturan), dibaca saat ronde dimulai.
  let state = { index: 0, answers: [], timed: true, timer: null, seconds: CekSettings.quickSeconds() };

  function setState(patch) {
    state = { ...state, ...patch };
  }

  function setProgress(done) {
    dom.progress.setAttribute("aria-valuemax", String(items.length));
    dom.progress.setAttribute("aria-valuenow", String(done));
    dom.progress.firstElementChild.style.width = `${(done / items.length) * 100}%`;
  }

  // Setiap kali tombol berganti, klik diabaikan sebentar. Tanpa ini, klik kedua dari klik ganda mengenai
  // tombol baru di tempat yang sama (mis. "Asli" lalu langsung "Lanjut", melewati umpan balik).
  let cooldownTimer = null;

  function setButtons(...buttons) {
    dom.buttons.replaceChildren(...buttons);
    dom.buttons.dataset.cooldown = "true";
    clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(() => { delete dom.buttons.dataset.cooldown; }, COOLDOWN_MS);
  }

  function bigButton(label, className, onClick) {
    return el("button", {
      type: "button", className: `btn ${className}`, text: label,
      onClick: () => { if (!dom.buttons.dataset.cooldown) onClick(); }
    });
  }

  // ---------- Layar pembuka ----------

  function intro() {
    setProgress(0);
    dom.main.replaceChildren(el("section", { className: "done quick-intro", "aria-labelledby": "quick-title" }, [
      el("div", { className: "done-hero" }, CekUI.mascot("cheer")),
      el("h1", { id: "quick-title", text: t("quick.title") }),
      el("p", { text: t("quick.intro", { n: items.length, s: CekSettings.quickSeconds() }) })
    ]));
    setButtons(
      bigButton(t("quick.start"), "", () => start(true)),
      bigButton(t("quick.relaxed"), "btn-quiet", () => start(false))
    );
  }

  function start(timed) {
    setState({ index: 0, answers: [], timed, seconds: CekSettings.quickSeconds() });
    setProgress(0);
    showCard();
  }

  // ---------- Satu pesan ----------

  function card(item) {
    return el("article", { className: "quick-card", "aria-label": t("quick.cardLabel", { sender: item.sender }) }, [
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
        CekUI.coach("think", "coach.lessonTips"),
        el("h2", { className: "coach-bubble task-title", id: "quick-q", tabindex: "-1", text: t("quick.question") })
      ]),
      timerBar,
      card(item),
      state.answers.length > 0 && el("p", { className: "quick-score", text: t("quick.scoreLine", { score: state.answers.filter(Boolean).length, combo: currentStreak() }) })
    ]));
    dom.main.querySelector("#quick-q").focus({ preventScroll: true });
    setButtons(
      bigButton(t("quick.real"), "btn-real", () => answer(false)),
      bigButton(t("quick.scam"), "btn-scam", () => answer(true))
    );
    if (state.timed) startTimer(timerBar.firstElementChild);
  }

  function currentStreak() {
    let streak = 0;
    for (let i = state.answers.length - 1; i >= 0 && state.answers[i]; i -= 1) streak += 1;
    return streak;
  }

  function startTimer(bar) {
    const total = state.seconds * 1000;
    let deadline = Date.now() + total;
    const tick = () => {
      // Dialog keluar atau Pengaturan terbuka, atau pemain pindah aplikasi/tab: waktunya ditahan, tidak berkurang.
      if (document.hidden || document.querySelector("dialog[open]")) {
        deadline += TICK_MS;
        return;
      }
      const left = Math.max(0, deadline - Date.now());
      bar.style.width = `${(left / total) * 100}%`;
      if (left === 0) answer(null);
    };
    clearInterval(state.timer);
    setState({ timer: setInterval(tick, TICK_MS) });
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
    const streak = CekUI.recordStreak(isRight); // api streak di bar atas, berlanjut antar pelajaran
    CekSound.play(isRight ? "good" : "bad");
    const quickCard = dom.main.querySelector(".quick-card");
    quickCard.classList.add(isRight ? "is-correct" : "is-wrong");
    // Coach Wall bereaksi: bersorak, jatuh hati saat combo, tepuk jidat kalau salah, kaget kalau waktunya habis.
    const tone = isRight ? "good" : "bad";
    const timedOut = pickedScam === null;
    const mood = timedOut ? "oops" : CekUI.reaction(tone, streak);
    dom.main.querySelector(".mascot").replaceWith(CekUI.mascot(mood));
    const verdict = t(item.scam ? "quick.isScam" : "quick.isReal");
    let heading = t(isRight ? "quick.right" : "quick.wrong", { verdict });
    if (timedOut) heading = t("quick.timeout", { verdict });
    dom.footer.className = `lesson-footer is-${tone}`;
    dom.feedback.replaceChildren(...CekUI.feedback({ tone, heading, text: item.why, xp: CekLogic.XP_QUICK, streak, mood }));
    const isLast = state.index === items.length - 1;
    setButtons(bigButton(t(isLast ? "quick.seeScore" : "common.continue"), `btn-${tone}`, isLast ? finish : nextCard));
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
    dom.footer.className = "lesson-footer is-done";
    dom.feedback.replaceChildren();
    dom.main.replaceChildren(el("section", { className: "done", "aria-labelledby": "score-title" }, [
      great && CekUI.confetti(),
      el("div", { className: "done-hero" }, CekUI.mascot(great ? "cheer" : "happy")),
      el("h1", { id: "score-title", tabindex: "-1", text: t(great ? "quick.great" : "quick.done") }),
      el("div", { className: "stats" }, [
        CekUI.stat(t("common.xpEarned"), `+${after.xp - before.xp}`, "bolt", "gold"),
        CekUI.stat(t("quick.score"), `${score.right}/${score.total}`, "target", "green"),
        CekUI.stat(t("quick.bestCombo"), String(score.bestStreak), "fire", "orange")
      ]),
      !saved && el("p", { className: "note", text: t("quick.notSaved") })
    ]));
    setButtons(
      bigButton(t("quick.again"), "btn-quiet", () => start(state.timed)),
      bigButton(t("common.home"), "", () => { location.href = "index.html"; })
    );
    // Tombol "Lihat skor" yang tadi difokus sudah hilang: fokus pindah ke judul skor (keyboard/pembaca layar).
    dom.main.querySelector("#score-title").focus({ preventScroll: true });
  }

  // Tombol X: tanya dulu lewat dialog kalau ronde sedang berjalan (bukan di layar pembuka atau skor).
  CekUI.guardExit(() => Boolean(dom.main.querySelector(".quick-play")));

  // Waktu per pesan diganti di Pengaturan saat masih di layar pembuka: tulisannya ikut diperbarui.
  document.addEventListener("cek:prefs", () => { if (dom.main.querySelector(".quick-intro")) intro(); });

  if (unit && items.length > 0) intro();
  else location.href = "index.html";
})();
