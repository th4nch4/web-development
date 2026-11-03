// Mesin pelajaran ala Duolingo. Susunan soal diambil dari scenario.steps (lihat js/scenarios.js):
// - find:   Cari, pemain mengetuk sendiri bagian pesan yang mencurigakan (tanpa petunjuk).
// - flags:  tanda bahaya apa saja, dari 5 Pertanyaan Sebelum Klik.
// - match:  pasangkan bagian pesan dengan pertanyaannya.
// - url:    tebak alamat link yang asli.
// - reply:  susun pesan dari kepingan kata.
// - action: apa yang kamu lakukan.
// Penjelasan selalu baru muncul setelah pemain menjawab.
(() => {
  const { el } = CekUI;
  const { NO_FLAGS } = CekLogic;
  const FRAME_ALLOWANCE = 16; // bingkai dan tombol samping HP yang menonjol keluar kotaknya
  const storage = CekUI.getStorage();
  const scenario = SCENARIOS.find((s) => s.id === new URLSearchParams(location.search).get("s"));
  const questionById = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
  const isGenuine = Boolean(scenario) && scenario.flags.length === 0;
  const STEPS = scenario ? scenario.steps || ["find", "flags", "action"] : [];
  if (scenario) CekWorld.decoratePage(scenario.unit);

  const dom = {
    lesson: document.getElementById("lesson"),
    progress: document.getElementById("progress"),
    context: document.getElementById("context"),
    phoneSlot: document.getElementById("phone-slot"),
    task: document.getElementById("task"),
    footer: document.getElementById("footer"),
    feedback: document.getElementById("feedback"),
    primary: document.getElementById("primary")
  };

  const { setPrimary, showFeedback, hideFeedback, renderTask, setMood, optionButton, syncPressed, lockOptions } = CekKit.create(dom);
  const { shuffled } = CekKit;

  let phone = null;
  let state = {
    step: 0,
    picked: [], findChoices: [], findResult: null,
    selected: [], flagResult: null,
    matchPick: null, matchWrong: [], matchDone: 0,
    choice: null, actionResult: null
  };

  function setState(patch) {
    state = { ...state, ...patch };
  }

  // ---------- Bagian umum ----------

  function setProgress(stepsDone) {
    CekKit.setProgress(dom.progress, stepsDone, STEPS.length);
  }

  // Soal sudah dinilai: majukan progres, Lupi bereaksi, lalu tombol "Lanjut" ke soal berikutnya.
  function graded(isRight, heading, text, xp, cheer) {
    const tone = isRight ? "good" : "bad";
    setProgress(state.step + 1);
    setMood(isRight);
    showFeedback(tone, heading, text, xp, cheer);
    const isLast = state.step === STEPS.length - 1;
    setPrimary(isLast ? "Selesai" : "Lanjut", true, isLast ? finish : nextStep, tone);
  }

  function nextStep() {
    hideFeedback();
    setState({ step: state.step + 1, choice: null });
    STARTERS[STEPS[state.step]]();
  }

  // ---------- HP simulasi ----------

  // Satu soal harus muat satu layar tanpa gulir: HP simulasi diperkecil sampai muat di sisa ruang.
  // Pakai transform (lewat --fit), bukan zoom: Safari tidak mau mengecilkan huruf di bawah batas minimumnya.
  function fitPhone() {
    if (!phone) return;
    const slot = dom.phoneSlot;
    const scale = Math.min(1,
      slot.clientWidth / (phone.offsetWidth + FRAME_ALLOWANCE),
      slot.clientHeight / (phone.offsetHeight + FRAME_ALLOWANCE));
    phone.style.setProperty("--fit", String(scale));
  }

  function showPhone() {
    if (scenario.context) {
      dom.context.textContent = `Situasi: ${scenario.context}`;
      dom.context.hidden = false;
    }
    phone = CekPhone.render(scenario);
    dom.phoneSlot.replaceChildren(phone);
    // Ruang untuk HP berubah saat soal, umpan balik, atau ukuran layar berganti.
    new ResizeObserver(fitPhone).observe(dom.phoneSlot);
    document.fonts.ready.then(fitPhone);
  }

  // ---------- Soal: apa yang salah dari pesan ini? ----------

  const MAX_FIND_OPTIONS = 5; // ditambah "Nggak ada yang salah" = 6, muat satu layar HP

  // Pilihan diambil dari bagian pesan itu sendiri: semua yang mencurigakan + bagian wajar sebagai pengecoh.
  // Urutannya diacak, jadi tidak ada petunjuk mana yang benar.
  function findChoices() {
    const all = CekPhone.parts(phone);
    const suspicious = all.filter((node) => node.dataset.flag);
    const normal = all.filter((node) => !node.dataset.flag);
    const decoys = normal.slice(0, Math.max(1, MAX_FIND_OPTIONS - suspicious.length));
    return shuffled([...suspicious, ...decoys]);
  }

  const quote = (label) => (/^(Pengirim|File):/.test(label) ? label : `"${label}"`);

  function startFind() {
    showPhone();
    setProgress(0);
    const choices = findChoices();
    setState({ findChoices: choices, picked: [] });
    const options = [
      ...choices.map((node, index) => optionButton(String(index), quote(node.dataset.label), () => toggleFind(index), "check")),
      optionButton(NO_FLAGS, "Nggak ada yang salah", () => toggleFind(NO_FLAGS))
    ];
    renderTask("Apa yang salah dari pesan ini?", scenario.lupi ? scenario.lupi.intro : "Baca pesannya, lalu pilih semua yang bikin curiga.", options, "Bagian pesan", "find", "sus");
    setPrimary("Periksa", false, checkFind);
  }

  function toggleFind(id) {
    const key = String(id);
    const without = state.picked.filter((item) => item !== key && item !== NO_FLAGS);
    let picked;
    if (state.picked.includes(key)) picked = without;
    else if (key === NO_FLAGS) picked = [NO_FLAGS];
    else picked = [...without, key];
    setState({ picked });
    syncPressed(picked);
    setPrimary("Periksa", picked.length > 0, checkFind);
  }

  // Sengaja tanpa penjelasan: pemain baru diberi tahu "kenapa" di soal berikutnya.
  function findFeedback(result) {
    const legend = "Lihat tanda di tiap pilihan.";
    if (isGenuine) {
      return result.allCorrect
        ? ["Betul, pesan ini wajar!", "Yuk cek lagi pakai 5 pertanyaan."]
        : ["Eits, bagian itu sebenarnya wajar.", legend];
    }
    if (result.allCorrect) return ["Semua yang aneh ketemu!", "Sekarang cari tahu kenapa itu bahaya."];
    if (result.missed.length > 0) return [`Kamu nemu ${result.found.length} dari ${result.total} bagian.`, legend];
    return ["Semua ketemu, tapi ada yang sebenarnya wajar.", legend];
  }

  function checkFind() {
    const choices = state.findChoices;
    const picked = state.picked.filter((id) => id !== NO_FLAGS).map(Number);
    const result = CekLogic.gradeFind(choices.map((node) => node.dataset.flag !== ""), picked);
    // Bagian mencurigakan selalu masuk pilihan, jadi "terlewat" = bagian mencurigakan yang tidak dipilih.
    setState({ findResult: result });
    const status = (id) => {
      if (id === NO_FLAGS) return state.picked.includes(NO_FLAGS) ? (isGenuine ? "found" : "extra") : (isGenuine ? "missed" : "");
      const i = Number(id);
      if (result.found.includes(i)) return "found";
      if (result.missed.includes(i)) return "missed";
      if (result.extra.includes(i)) return "extra";
      return "";
    };
    lockOptions(status, () => "");
    const [heading, text] = findFeedback(result);
    const quip = scenario.lupi && (result.allCorrect ? scenario.lupi.good : scenario.lupi.bad);
    graded(result.allCorrect, heading, text, 0, quip);
  }

  // ---------- Soal 2: tanda bahaya apa saja ----------

  function startFlags() {
    const options = [
      ...QUESTIONS.map((q) => optionButton(q.id, q.title, () => toggleFlag(q.id), "check", q.id)),
      optionButton(NO_FLAGS, "Nggak ada tanda bahaya", () => toggleFlag(NO_FLAGS))
    ];
    const sub = "Pilih semua yang cocok, ya.";
    renderTask("Tanda bahayanya apa aja?", sub, options, "Tanda bahaya", "chips");
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
    if (result.allCorrect) return isGenuine ? "Betul, nggak ada tanda bahaya!" : "Semua tanda bahaya ketemu!";
    if (isGenuine) return "Ternyata pesan ini wajar, kok.";
    if (result.missed.length > 0) return `Kamu nemu ${result.found.length} dari ${scenario.flags.length} tanda.`;
    return "Semua ketemu, tapi ada yang keliru.";
  }

  function flagNote(id, status) {
    if (id === NO_FLAGS) return "";
    if (status === "extra") return (scenario.clear && scenario.clear[id]) || questionById[id].clear;
    return scenario.evidence[id];
  }

  function checkFlags() {
    const result = CekLogic.gradeFlags(scenario, state.selected);
    setState({ flagResult: result });
    lockOptions((id) => flagStatus(id, result), flagNote);
    graded(result.allCorrect, flagHeading(result), scenario.verdict, CekLogic.XP_ALL_FLAGS);
  }

  // ---------- Soal: pasangkan bagian pesan dengan pertanyaannya ----------

  // Teks bagian pesan yang membawa tanda ini: pengirim, lampiran, atau potongan teks.
  function partText(flag) {
    const parts = [scenario.sender, scenario.attachment, ...scenario.messages.flat().filter((p) => typeof p === "object")];
    const part = parts.find((p) => p && p.flag === flag);
    const text = part.text || part.name;
    return text.length > 42 ? `${text.slice(0, 40)}…` : text;
  }

  function matchItem(side, flag, content) {
    return el("button", {
      type: "button",
      className: `option match-item match-${side}`,
      "data-side": side,
      "data-flag": flag,
      "aria-pressed": "false",
      onClick: (event) => tapMatch(event.currentTarget)
    }, content);
  }

  function startMatch() {
    const left = shuffled(scenario.flags).map((flag) => matchItem("part", flag, el("span", { className: "option-text", text: `"${partText(flag)}"` })));
    const right = shuffled(scenario.flags).map((flag) => matchItem("question", flag, [
      CekUI.questionIcon(flag), el("span", { className: "option-text" }, [el("strong", { text: questionById[flag].title })])
    ]));
    const cells = left.flatMap((item, i) => [item, right[i]]);
    setState({ matchPick: null, matchWrong: [], matchDone: 0 });
    renderTask("Pasangkan, yuk!", "Ketuk bagian pesan, lalu pertanyaan yang cocok.", cells, "Pasangkan", "match");
    dom.task.append(el("p", { className: "visually-hidden", id: "match-status", "aria-live": "polite" }));
    setPrimary("Pasangkan semua dulu", false, null);
  }

  function tapMatch(button) {
    const first = state.matchPick;
    if (!first || first.dataset.side === button.dataset.side) {
      if (first) first.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-pressed", "true");
      setState({ matchPick: button });
      return;
    }
    const pair = [first, button];
    pair.forEach((item) => item.setAttribute("aria-pressed", "false"));
    setState({ matchPick: null });
    if (first.dataset.flag !== button.dataset.flag) {
      const wrong = [...new Set([...state.matchWrong, first.dataset.flag, button.dataset.flag])];
      setState({ matchWrong: wrong });
      CekSound.play("bad");
      announce("Belum cocok, coba lagi.");
      pair.forEach((item) => { item.classList.remove("is-shaking"); void item.offsetWidth; item.classList.add("is-shaking"); });
      return;
    }
    CekSound.play("good");
    announce(`Cocok: ${questionById[button.dataset.flag].title}`);
    pair.forEach((item) => { item.disabled = true; item.classList.add("is-matched"); });
    setState({ matchDone: state.matchDone + 1 });
    if (state.matchDone === scenario.flags.length) checkMatch();
  }

  function announce(text) {
    dom.task.querySelector("#match-status").textContent = text;
  }

  // Setelah semua cocok: setiap pertanyaan jadi satu baris. Alasannya hanya ditulis di pasangan yang
  // sempat salah (di situ pelajarannya), supaya semuanya muat satu layar.
  function showMatchedPairs() {
    const rows = scenario.flags.map((flag) => optionButton(flag, questionById[flag].title, null, "check", flag));
    dom.task.querySelector(".options").replaceWith(
      el("div", { className: "options", role: "group", "aria-label": "Pasangan" }, rows)
    );
    lockOptions(
      (flag) => (state.matchWrong.includes(flag) ? "retry" : "found"),
      (flag, status) => (status === "retry" ? scenario.evidence[flag] : "")
    );
  }

  function checkMatch() {
    const result = CekLogic.gradeMatch(scenario, state.matchWrong);
    setState({ flagResult: result });
    showMatchedPairs();
    const heading = result.allCorrect ? "Semua pasangan cocok!" : `Cocok semua, tapi ${result.missed.length} sempat salah.`;
    graded(result.allCorrect, heading, scenario.verdict, CekLogic.XP_ALL_FLAGS);
  }

  // ---------- Soal: tebak link asli ----------

  function startUrl() {
    const quiz = scenario.linkQuiz;
    const options = quiz.options.map((option, index) =>
      optionButton(String(index), option.text, () => choose(index, checkUrl), "radio", "link"));
    renderTask(quiz.question, "Baca alamatnya huruf demi huruf.", options, "Pilihan alamat", "url");
    setPrimary("Periksa", false, checkUrl);
  }

  // Pilihan tunggal (tebak link, tindakan): tandai, membal, lalu tombol Periksa aktif.
  function choose(index, check) {
    setState({ choice: index });
    syncPressed([String(index)]);
    setPrimary("Periksa", true, check);
  }

  function checkUrl() {
    const { options, why } = scenario.linkQuiz;
    const isRight = options[state.choice].correct;
    lockOptions((id) => {
      const index = Number(id);
      if (index === state.choice) return isRight ? "correct" : "wrong";
      return !isRight && options[index].correct ? "answer" : "";
    }, () => "", { answer: "Jawabannya", wrong: "Pilihanmu" });
    graded(isRight, isRight ? "Itu dia yang asli!" : "Itu tiruan, lho.", why, 0);
  }

  // ---------- Soal: susun pesan dari kepingan kata ----------

  function startReply() {
    const { prompt, words, extra } = scenario.reply;
    const line = el("div", { className: "reply-line", "aria-label": "Pesanmu" });
    const bank = el("div", { className: "reply-bank", "aria-label": "Kepingan kata" },
      shuffled([...words, ...extra]).map((word) => el("button", {
        type: "button", className: "tile", text: word, onClick: (event) => moveTile(event.currentTarget)
      })));
    renderTask("Susun pesannya!", prompt, [line, bank], "Susun pesan", "reply");
    setPrimary("Periksa", false, checkReply);
  }

  function moveTile(tile) {
    const line = dom.task.querySelector(".reply-line");
    const bank = dom.task.querySelector(".reply-bank");
    (tile.parentElement === line ? bank : line).append(tile);
    setPrimary("Periksa", line.children.length > 0, checkReply);
  }

  function checkReply() {
    const { words, why } = scenario.reply;
    const answer = [...dom.task.querySelectorAll(".reply-line .tile")].map((tile) => tile.textContent);
    const isRight = CekLogic.gradeReply(words, answer);
    dom.task.querySelectorAll(".tile").forEach((tile) => { tile.disabled = true; });
    dom.task.querySelector(".reply-line").classList.add(isRight ? "is-correct" : "is-wrong");
    graded(isRight, isRight ? "Pesannya pas!" : "Belum pas, nih.", isRight ? why : `Contohnya: "${words.join(" ")}" ${why}`, 0);
  }

  // ---------- Soal 3: tindakan ----------

  function startAction() {
    const options = scenario.actions.map((action, index) =>
      optionButton(String(index), action.label, () => choose(index, checkAction), "radio"));
    renderTask("Kalau kamu, bakal ngapain?", "Pilih satu aja.", options, "Pilihan tindakan");
    setPrimary("Periksa", false, checkAction);
  }

  function checkAction() {
    const result = CekLogic.gradeAction(scenario, state.choice);
    const chosen = scenario.actions[state.choice];
    setState({ actionResult: result });
    // Kalau salah, tunjukkan satu pilihan yang lebih aman (yang pertama) supaya penjelasan muat satu layar.
    const safest = scenario.actions.findIndex((action) => action.correct);
    lockOptions((id) => {
      const index = Number(id);
      if (index === state.choice) return result.correct ? "correct" : "wrong";
      return !result.correct && index === safest ? "answer" : "";
    }, (id, status) => (status === "answer" ? scenario.actions[Number(id)].why : ""));
    graded(result.correct, result.correct ? "Langkah yang tepat!" : "Hmm, kurang pas nih.", chosen.why, CekLogic.XP_RIGHT_ACTION);
  }

  // ---------- Selesai ----------

  function doneScreen(xp, saved) {
    const { findResult, flagResult, actionResult } = state;
    const findValue = isGenuine
      ? (findResult.allCorrect ? "Dikenali" : "Keliru")
      : `${findResult.found.length}/${findResult.total}`;
    const perfect = findResult.allCorrect && flagResult.allCorrect && actionResult.correct;
    return el("section", { className: "done", "aria-labelledby": "done-title" }, [
      perfect && CekUI.confetti(),
      CekUI.mascot(perfect ? "cheer" : "happy"),
      el("h1", { id: "done-title", text: perfect ? "Sempurna! Kamu jago!" : "Yeay, pelajaran selesai!" }),
      el("div", { className: "stats" }, [
        CekUI.stat("XP didapat", `+${xp}`),
        CekUI.stat(isGenuine ? "Pesan asli" : "Bagian ketemu", findValue),
        CekUI.stat("Tindakan", actionResult.correct ? "Tepat" : "Kurang pas")
      ]),
      el("div", { className: "takeaway" }, [el("strong", { text: "Inget ya" }), el("p", { text: scenario.takeaway })]),
      !saved && el("p", { className: "note", text: "Progres tidak bisa disimpan di browser ini, tapi kamu tetap bisa lanjut belajar." })
    ]);
  }

  function finish() {
    hideFeedback();
    const before = CekLogic.loadProgress(storage);
    const after = CekLogic.recordLesson(before, scenario.id, state.flagResult, state.actionResult, state.findResult);
    const saved = CekLogic.saveProgress(storage, after);
    dom.lesson.classList.add("is-done");
    dom.footer.classList.add("is-done");
    dom.lesson.replaceChildren(doneScreen(after.xp - before.xp, saved));
    // Langsung ke pelajaran berikutnya (tanpa mampir ke peta); setelah yang terakhir, ke rapor.
    const next = SCENARIOS[CekLogic.currentIndex(SCENARIOS, after)];
    const nextUrl = next ? `simulator.html?s=${encodeURIComponent(next.id)}` : "rapor.html";
    setPrimary(next ? "Lanjut pelajaran" : "Lihat rapor", true, () => { location.href = nextUrl; });
    dom.lesson.scrollTo(0, 0);
    dom.primary.focus();
  }

  function showMissing() {
    dom.lesson.classList.add("is-done");
    dom.lesson.replaceChildren(el("section", { className: "done" }, [
      CekUI.mascot("oops"),
      el("h1", { text: "Waduh, pelajarannya nggak ketemu" }),
      el("p", { text: "Balik ke jalur belajar buat pilih pelajaran, ya." })
    ]));
    setPrimary("Ke jalur belajar", true, () => { location.href = "index.html"; });
  }

  // Tombol X di bar atas: konfirmasi dulu kalau pelajaran sedang berjalan.
  document.querySelector(".lesson-top a.icon-btn").addEventListener("click", (event) => {
    const midLesson = scenario && !dom.lesson.classList.contains("is-done");
    if (midLesson && !window.confirm("Keluar dari pelajaran? Jawabanmu di pelajaran ini tidak disimpan.")) event.preventDefault();
  });

  const STARTERS = { find: startFind, flags: startFlags, match: startMatch, url: startUrl, reply: startReply, action: startAction };

  if (scenario) startFind();
  else showMissing();
})();
