// Mesin pelajaran: Periksa -> Tanda bahaya -> Tindakan -> Selesai.
(() => {
  const { el, renderCoach } = CekUI;
  const { NO_FLAGS } = CekLogic;
  const TOTAL_STEPS = 3;
  const COOLDOWN_MS = 500;
  const storage = CekUI.getStorage();
  const scenario = SCENARIOS.find((s) => s.id === new URLSearchParams(location.search).get("s"));
  const questionById = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
  const isGenuine = Boolean(scenario) && scenario.flags.length === 0;

  const dom = {
    lesson: document.getElementById("lesson"),
    progress: document.getElementById("progress"),
    coach: document.getElementById("coach"),
    context: document.getElementById("context"),
    phoneSlot: document.getElementById("phone-slot"),
    inspect: document.getElementById("inspect"),
    task: document.getElementById("task"),
    footer: document.getElementById("footer"),
    feedback: document.getElementById("feedback"),
    primary: document.getElementById("primary")
  };

  let phone = null;
  let primaryAction = null;
  let cooldownTimer = null;
  let state = { step: "inspect", inspected: 0, selected: [], actionIndex: null, flagResult: null, actionResult: null };

  function setState(patch) {
    state = { ...state, ...patch };
  }

  // ---------- Bagian umum ----------

  function setProgress(stepsDone) {
    dom.progress.setAttribute("aria-valuenow", String(stepsDone));
    dom.progress.firstElementChild.style.width = `${(stepsDone / TOTAL_STEPS) * 100}%`;
  }

  // Satu tombol utama dipakai di semua langkah; fungsinya diganti lewat primaryAction.
  // Setiap kali fungsinya berganti, klik diabaikan sebentar supaya klik ganda
  // (atau Enter yang ditahan) tidak melompati umpan balik.
  function setPrimary(label, enabled, action, tone) {
    dom.primary.textContent = label;
    dom.primary.disabled = !enabled;
    dom.primary.className = tone ? `btn btn-${tone}` : "btn";
    if (action !== primaryAction) startCooldown();
    primaryAction = action;
  }

  function startCooldown() {
    dom.primary.dataset.cooldown = "true";
    clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(() => { delete dom.primary.dataset.cooldown; }, COOLDOWN_MS);
  }

  dom.primary.addEventListener("click", () => {
    if (dom.primary.dataset.cooldown || !primaryAction) return;
    primaryAction();
  });

  // Lembar bawah sengaja ringkas; penjelasan rinci muncul di bawah tiap pilihan.
  function showFeedback(tone, heading, text) {
    dom.footer.className = `lesson-footer is-${tone}`;
    dom.feedback.replaceChildren(el("h2", { text: heading }), el("p", { text }));
  }

  function hideFeedback() {
    dom.footer.className = "lesson-footer";
    dom.feedback.replaceChildren();
  }

  function renderTask(title, subtitle, options, label) {
    const heading = el("h2", { className: "task-title", tabindex: "-1", text: title });
    dom.task.replaceChildren(
      heading,
      el("p", { className: "task-sub", text: subtitle }),
      el("div", { className: "options", role: "group", "aria-label": label }, options)
    );
    // Pindahkan fokus ke soal baru supaya pengguna keyboard/pembaca layar tidak tersesat.
    heading.focus({ preventScroll: true });
    // Di layar HP, soal ada di bawah HP simulasi, jadi gulir ke soal.
    if (window.matchMedia("(max-width: 859px)").matches) dom.task.scrollIntoView({ block: "start" });
  }

  function optionButton(id, title, hint, onClick, kind) {
    return el("button", { type: "button", className: "option", "data-id": id, "aria-pressed": "false", onClick }, [
      el("span", { className: `option-${kind}`, "aria-hidden": "true" }),
      el("span", { className: "option-text" }, [el("strong", { text: title }), hint && el("small", { text: hint })])
    ]);
  }

  function syncPressed(selectedIds) {
    dom.task.querySelectorAll(".option").forEach((button) => {
      button.setAttribute("aria-pressed", String(selectedIds.includes(button.dataset.id)));
    });
  }

  // Kunci pilihan setelah dinilai, beri warna, dan tulis penjelasan di bawah pilihan yang relevan.
  function lockOptions(statusOf, noteOf) {
    dom.task.querySelector(".task-sub").textContent = "Penjelasannya ada di bawah pilihan yang diberi tanda.";
    dom.task.querySelectorAll(".option").forEach((button) => {
      button.disabled = true;
      const status = statusOf(button.dataset.id);
      if (!status) return;
      button.classList.add(`is-${status}`);
      const note = noteOf(button.dataset.id, status);
      if (note) button.querySelector(".option-text").append(el("span", { className: "option-note", text: note }));
    });
  }

  // ---------- Langkah 1: periksa ----------

  function startInspect() {
    if (scenario.context) {
      dom.context.textContent = `Situasi: ${scenario.context}`;
      dom.context.hidden = false;
    }
    phone = CekPhone.render(scenario, onInspect);
    phone.classList.add("is-inspecting");
    dom.phoneSlot.replaceChildren(phone);
    renderCoach(dom.coach, "Ada pesan masuk. Ketuk bagian yang bergaris putus-putus untuk memeriksanya.", "think");
    setProgress(0);
    setPrimary("Lanjut", false, startFlags);
  }

  function onInspect(item, button) {
    button.classList.add("is-inspected");
    dom.inspect.replaceChildren(el("div", { className: "inspect-card" }, [
      el("span", { className: "inspect-kind", text: `Hasil periksa · ${item.title}` }),
      el("strong", { className: "inspect-label", text: item.label }),
      el("p", { text: item.detail })
    ]));
    if (state.step !== "inspect") return;
    if (state.inspected === 0) {
      renderCoach(dom.coach, "Bagus! Periksa bagian lain juga, lalu tekan Lanjut.", "happy");
      setPrimary("Lanjut", true, startFlags);
    }
    setState({ inspected: state.inspected + 1 });
    if (window.matchMedia("(max-width: 859px)").matches) dom.inspect.scrollIntoView({ block: "nearest" });
  }

  // ---------- Langkah 2: tanda bahaya ----------

  function startFlags() {
    setState({ step: "flags" });
    phone.classList.remove("is-inspecting");
    setProgress(1);
    renderCoach(dom.coach, "Ingat lagi isi pesannya. Kamu boleh gulir ke atas untuk melihatnya.", "think");
    const options = [
      ...QUESTIONS.map((q) => optionButton(q.id, q.title, q.hint, () => toggleFlag(q.id), "check")),
      optionButton(NO_FLAGS, "Tidak ada tanda bahaya", "Pesan ini terlihat wajar.", () => toggleFlag(NO_FLAGS), "check")
    ];
    renderTask("Tanda bahaya apa yang kamu temukan?", "Pilih semua yang cocok.", options, "Tanda bahaya");
    setPrimary("Periksa", false, checkFlags);
  }

  function toggleFlag(id) {
    const without = (list, value) => list.filter((item) => item !== value);
    let selected;
    if (state.selected.includes(id)) selected = without(state.selected, id);
    else if (id === NO_FLAGS) selected = [NO_FLAGS];
    else selected = [...without(state.selected, NO_FLAGS), id];
    setState({ selected });
    syncPressed(selected);
    setPrimary("Periksa", selected.length > 0, checkFlags);
  }

  function flagStatus(id, result) {
    if (id === NO_FLAGS) {
      const pickedNone = state.selected.includes(NO_FLAGS);
      if (isGenuine) return pickedNone ? "found" : "missed";
      return pickedNone ? "extra" : "";
    }
    if (result.found.includes(id)) return "found";
    if (result.missed.includes(id)) return "missed";
    if (result.extra.includes(id)) return "extra";
    return "";
  }

  function flagHeading(result) {
    // Kalimat "Ini pesan asli/penipuan" sudah ada di verdict, jadi judul tidak mengulanginya.
    if (result.allCorrect) return isGenuine ? "Tepat! Tidak ada tanda bahaya." : "Tepat! Semua tanda kamu temukan.";
    if (isGenuine) return "Ternyata tidak ada tanda bahaya.";
    if (result.missed.length > 0) return `Kamu menemukan ${result.found.length} dari ${scenario.flags.length} tanda.`;
    return "Semua tanda ketemu, tapi ada yang keliru.";
  }

  function flagNote(id, status) {
    if (id === NO_FLAGS) return "";
    if (status === "extra") return (scenario.clear && scenario.clear[id]) || questionById[id].clear;
    return scenario.evidence[id];
  }

  function checkFlags() {
    const result = CekLogic.gradeFlags(scenario, state.selected);
    const tone = result.allCorrect ? "good" : "bad";
    setState({ flagResult: result });
    CekPhone.highlight(phone, result);
    lockOptions((id) => flagStatus(id, result), flagNote);
    setProgress(2);
    renderCoach(dom.coach, result.allCorrect ? "Mantap, matamu jeli!" : "Tidak apa-apa. Justru di sini kita belajar.", result.allCorrect ? "happy" : "oops");
    showFeedback(tone, flagHeading(result), scenario.verdict);
    setPrimary("Lanjut", true, startAction, tone);
  }

  // ---------- Langkah 3: tindakan ----------

  function startAction() {
    hideFeedback();
    setState({ step: "action" });
    renderCoach(dom.coach, "Sekarang putuskan tindakanmu.", "think");
    const options = scenario.actions.map((action, index) =>
      optionButton(String(index), action.label, null, () => chooseAction(index), "radio"));
    renderTask("Apa yang kamu lakukan?", "Pilih satu.", options, "Pilihan tindakan");
    setPrimary("Periksa", false, checkAction);
  }

  function chooseAction(index) {
    setState({ actionIndex: index });
    syncPressed([String(index)]);
    setPrimary("Periksa", true, checkAction);
  }

  function checkAction() {
    const result = CekLogic.gradeAction(scenario, state.actionIndex);
    const tone = result.correct ? "good" : "bad";
    const chosen = scenario.actions[state.actionIndex];
    setState({ actionResult: result });
    lockOptions((id) => {
      const index = Number(id);
      if (index === state.actionIndex) return result.correct ? "correct" : "wrong";
      return !result.correct && scenario.actions[index].correct ? "answer" : "";
    }, (id, status) => (status === "answer" ? scenario.actions[Number(id)].why : ""));
    setProgress(3);
    renderCoach(dom.coach, result.correct ? "Keputusan yang aman!" : "Hampir. Lihat pilihan yang lebih aman, ya.", result.correct ? "happy" : "oops");
    showFeedback(tone, result.correct ? "Tindakan yang tepat!" : "Kurang tepat.", chosen.why);
    setPrimary("Selesai", true, finish, tone);
  }

  // ---------- Selesai ----------

  function doneScreen(xp, saved) {
    const { flagResult, actionResult } = state;
    const flagValue = isGenuine
      ? (flagResult.allCorrect ? "Dikenali" : "Keliru")
      : `${flagResult.found.length}/${scenario.flags.length}`;
    return el("section", { className: "done", "aria-labelledby": "done-title" }, [
      CekUI.mascot("happy"),
      el("h1", { id: "done-title", text: "Pelajaran selesai!" }),
      el("div", { className: "stats" }, [
        CekUI.stat("XP didapat", `+${xp}`),
        CekUI.stat(isGenuine ? "Pesan asli" : "Tanda ditemukan", flagValue),
        CekUI.stat("Tindakan", actionResult.correct ? "Tepat" : "Kurang tepat")
      ]),
      el("div", { className: "takeaway" }, [el("strong", { text: "Ingat" }), el("p", { text: scenario.takeaway })]),
      !saved && el("p", { className: "note", text: "Progres tidak bisa disimpan di browser ini, tapi kamu tetap bisa lanjut belajar." })
    ]);
  }

  function finish() {
    hideFeedback();
    const before = CekLogic.loadProgress(storage);
    const after = CekLogic.recordLesson(before, scenario.id, state.flagResult, state.actionResult);
    const saved = CekLogic.saveProgress(storage, after);
    dom.lesson.classList.add("is-done");
    dom.lesson.replaceChildren(doneScreen(after.xp - before.xp, saved));
    setPrimary("Lanjut", true, () => { location.href = "index.html"; });
    window.scrollTo(0, 0);
    dom.primary.focus();
  }

  function showMissing() {
    dom.lesson.classList.add("is-done");
    dom.lesson.replaceChildren(el("section", { className: "done" }, [
      CekUI.mascot("oops"),
      el("h1", { text: "Pelajaran tidak ditemukan" }),
      el("p", { text: "Kembali ke jalur belajar untuk memilih pelajaran." })
    ]));
    setPrimary("Ke jalur belajar", true, () => { location.href = "index.html"; });
  }

  if (scenario) startInspect();
  else showMissing();
})();
