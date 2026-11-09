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
  const { t } = CekLang;
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

  const { setPrimary, showFeedback, hideFeedback, renderTask, optionButton, syncPressed, lockOptions, showDone } = CekKit.create(dom);
  const { shuffled, toneOf } = CekKit;

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

  // Soal sudah dinilai: majukan progres, Coach Wall bereaksi di lembar hasil, lalu tombol "Lanjut" ke soal berikutnya.
  // tone: good (benar), partial (sebagian benar di soal pilih banyak), bad (salah).
  function graded(tone, heading, text, xp, cheer) {
    setProgress(state.step + 1);
    showFeedback(tone, heading, text, xp, cheer);
    const isLast = state.step === STEPS.length - 1;
    setPrimary(t(isLast ? "common.finish" : "common.continue"), true, isLast ? finish : nextStep, tone);
  }

  function nextStep() {
    hideFeedback();
    setState({ step: state.step + 1, choice: null });
    STARTERS[STEPS[state.step]]();
  }

  // ---------- HP simulasi ----------

  // Isi HP simulasi tidak diperkecil: kalau pesannya lebih panjang dari ruang HP, isinya digulir di dalam HP
  // (css/phone.css). --phone-h = tinggi alami HP (termasuk isi yang tersembunyi di bawah); di layar HP, ruang HP
  // setinggi itu (dibatasi CSS). HP hanya diperkecil (transform lewat --fit) kalau lebarnya tidak muat.
  // Transform, bukan zoom: Safari tidak mau mengecilkan huruf di bawah batas minimumnya.
  function fitPhone() {
    if (!phone) return;
    const slot = dom.phoneSlot;
    const height = Math.round(phone.offsetHeight + hiddenHeight() + FRAME_ALLOWANCE);
    // Beda 1px karena pembulatan diabaikan, supaya ukuran HP dan ruangnya tidak saling memicu bolak-balik.
    if (Math.abs(height - (Number.parseFloat(slot.style.getPropertyValue("--phone-h")) || 0)) > 1) {
      slot.style.setProperty("--phone-h", `${height}px`);
    }
    const scale = Math.min(1, slot.clientWidth / (phone.offsetWidth + FRAME_ALLOWANCE));
    phone.style.setProperty("--fit", String(scale));
  }

  // Tinggi isi HP yang tersembunyi di bawah (perlu digulir), dalam piksel HP. Isinya bisa diperbesar dengan zoom
  // (ukuran teks), jadi diubah lewat perbandingan ukuran tampil dan ukuran asli; transform --fit dikeluarkan.
  function hiddenHeight() {
    const scroller = phone.querySelector(".app-body, .lock-screen");
    if (!scroller || !scroller.clientHeight || !phone.offsetHeight) return 0;
    const fit = phone.getBoundingClientRect().height / phone.offsetHeight;
    const zoom = scroller.getBoundingClientRect().height / scroller.clientHeight / fit;
    return (scroller.scrollHeight - scroller.clientHeight) * zoom;
  }

  function showPhone() {
    if (scenario.context) {
      dom.context.textContent = t("lesson.context", { text: scenario.context });
      dom.context.hidden = false;
    }
    phone = CekPhone.render(scenario);
    dom.phoneSlot.replaceChildren(phone);
    // Ruang untuk HP berubah saat soal, umpan balik, atau ukuran layar berganti; HP-nya sendiri berubah
    // saat ukuran teks diganti di Pengaturan.
    const observer = new ResizeObserver(fitPhone);
    observer.observe(dom.phoneSlot);
    observer.observe(phone);
    const scroller = phone.querySelector(".app-body, .lock-screen");
    if (scroller) CekKit.watchScroll(scroller); // ujung bawah dipudarkan selama masih ada pesan di bawah
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

  // Potongan teks diberi tanda kutip; pengirim dan file sudah berlabel ("Pengirim: ...").
  const quote = (node) => (node.matches(".tap-sender, .tap-file") ? node.dataset.label : `"${node.dataset.label}"`);

  function startFind() {
    showPhone();
    setProgress(0);
    const choices = findChoices();
    setState({ findChoices: choices, picked: [] });
    const options = [
      ...choices.map((node, index) => optionButton(String(index), quote(node), () => toggleFind(index), "check")),
      optionButton(NO_FLAGS, t("find.none"), () => toggleFind(NO_FLAGS))
    ];
    renderTask(t("find.title"), scenario.coach ? scenario.coach.intro : t("find.sub"), options, t("find.group"), "find", "sus");
    setPrimary(t("common.check"), false, checkFind);
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
    setPrimary(t("common.check"), picked.length > 0, checkFind);
  }

  // Sengaja tanpa penjelasan: pemain baru diberi tahu "kenapa" di soal berikutnya.
  function findFeedback(result) {
    const legend = t("find.legend");
    if (isGenuine) {
      return result.allCorrect
        ? [t("find.genuineRight"), t("find.genuineRightSub")]
        : [t("find.genuineWrong"), legend];
    }
    if (result.allCorrect) return [t("find.allFound"), t("find.allFoundSub")];
    if (result.missed.length > 0) return [t("find.some", { found: result.found.length, total: result.total }), legend];
    return [t("find.extra"), legend];
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
    const quip = scenario.coach && (result.allCorrect ? scenario.coach.good : scenario.coach.bad);
    graded(toneOf(result), heading, text, 0, quip);
  }

  // ---------- Soal 2: tanda bahaya apa saja ----------

  function startFlags() {
    const options = [
      ...QUESTIONS.map((q) => optionButton(q.id, q.title, () => toggleFlag(q.id), "check", q.id)),
      optionButton(NO_FLAGS, t("flags.none"), () => toggleFlag(NO_FLAGS))
    ];
    renderTask(t("flags.title"), t("flags.sub"), options, t("flags.group"), "chips");
    setPrimary(t("common.check"), false, checkFlags);
  }

  function toggleFlag(id) {
    const without = (list, value) => list.filter((item) => item !== value);
    let selected;
    if (state.selected.includes(id)) selected = without(state.selected, id);
    else if (id === NO_FLAGS) selected = [NO_FLAGS];
    else selected = [...without(state.selected, NO_FLAGS), id];
    setState({ selected });
    syncPressed(selected);
    setPrimary(t("common.check"), selected.length > 0, checkFlags);
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
    if (result.allCorrect) return t(isGenuine ? "flags.genuineRight" : "flags.allFound");
    if (isGenuine) return t("flags.genuineWrong");
    if (result.missed.length > 0) return t("flags.some", { found: result.found.length, total: scenario.flags.length });
    return t("flags.extra");
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
    graded(toneOf(result), flagHeading(result), scenario.verdict, CekLogic.XP_ALL_FLAGS);
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
    renderTask(t("match.title"), t("match.sub"), cells, t("match.group"), "match");
    dom.task.append(el("p", { className: "visually-hidden", id: "match-status", "aria-live": "polite" }));
    setPrimary(t("match.pending"), false, null);
  }

  function tapMatch(button) {
    const first = state.matchPick;
    if (!first || first.dataset.side === button.dataset.side) {
      CekSound.play("tap");
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
      announce(t("match.wrong"));
      pair.forEach((item) => { item.classList.remove("is-shaking"); void item.offsetWidth; item.classList.add("is-shaking"); });
      return;
    }
    CekSound.play("good");
    announce(t("match.right", { title: questionById[button.dataset.flag].title }));
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
      el("div", { className: "options", role: "group", "aria-label": t("match.pairs") }, rows)
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
    const heading = result.allCorrect ? t("match.allRight") : t("match.someWrong", { n: result.missed.length });
    graded(toneOf(result), heading, scenario.verdict, CekLogic.XP_ALL_FLAGS);
  }

  // ---------- Soal: tebak link asli ----------

  function startUrl() {
    const quiz = scenario.linkQuiz;
    const options = quiz.options.map((option, index) =>
      optionButton(String(index), option.text, () => choose(index, checkUrl), "radio", "link"));
    renderTask(quiz.question, t("url.sub"), options, t("url.group"), "url");
    setPrimary(t("common.check"), false, checkUrl);
  }

  // Pilihan tunggal (tebak link, tindakan): tandai, membal, lalu tombol Periksa aktif.
  function choose(index, check) {
    setState({ choice: index });
    syncPressed([String(index)]);
    setPrimary(t("common.check"), true, check);
  }

  function checkUrl() {
    const { options, why } = scenario.linkQuiz;
    const isRight = options[state.choice].correct;
    lockOptions((id) => {
      const index = Number(id);
      if (index === state.choice) return isRight ? "correct" : "wrong";
      return !isRight && options[index].correct ? "answer" : "";
    }, () => "", { answer: t("status.theAnswer"), wrong: t("status.yourPick") });
    graded(isRight ? "good" : "bad", t(isRight ? "url.right" : "url.wrong"), why, 0);
  }

  // ---------- Soal: susun pesan dari kepingan kata ----------

  function startReply() {
    const { prompt, words, extra } = scenario.reply;
    const line = el("div", { className: "reply-line", "aria-label": t("reply.line") });
    const bank = el("div", { className: "reply-bank", "aria-label": t("reply.bank") },
      shuffled([...words, ...extra]).map((word) => el("button", {
        type: "button", className: "tile", text: word, onClick: (event) => moveTile(event.currentTarget)
      })));
    renderTask(t("reply.title"), prompt, [line, bank], t("reply.group"), "reply");
    setPrimary(t("common.check"), false, checkReply);
  }

  function moveTile(tile) {
    CekSound.play("tap");
    const line = dom.task.querySelector(".reply-line");
    const bank = dom.task.querySelector(".reply-bank");
    (tile.parentElement === line ? bank : line).append(tile);
    setPrimary(t("common.check"), line.children.length > 0, checkReply);
  }

  function checkReply() {
    const { words, why } = scenario.reply;
    const answer = [...dom.task.querySelectorAll(".reply-line .tile")].map((tile) => tile.textContent);
    const isRight = CekLogic.gradeReply(words, answer);
    dom.task.querySelectorAll(".tile").forEach((tile) => { tile.disabled = true; });
    dom.task.querySelector(".reply-line").classList.add(isRight ? "is-correct" : "is-wrong");
    graded(isRight ? "good" : "bad", t(isRight ? "reply.right" : "reply.wrong"), isRight ? why : t("reply.example", { answer: words.join(" "), why }), 0);
  }

  // ---------- Soal 3: tindakan ----------

  function startAction() {
    const options = scenario.actions.map((action, index) =>
      optionButton(String(index), action.label, () => choose(index, checkAction), "radio"));
    renderTask(t("action.title"), t("action.sub"), options, t("action.group"));
    setPrimary(t("common.check"), false, checkAction);
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
    graded(result.correct ? "good" : "bad", t(result.correct ? "action.right" : "action.wrong"), chosen.why, CekLogic.XP_RIGHT_ACTION);
  }

  // ---------- Selesai ----------

  function doneScreen(xp, saved, streak) {
    const { findResult, flagResult, actionResult } = state;
    const findValue = isGenuine
      ? t(findResult.allCorrect ? "done.recognized" : "done.mistaken")
      : `${findResult.found.length}/${findResult.total}`;
    const perfect = findResult.allCorrect && flagResult.allCorrect && actionResult.correct;
    return el("section", { className: "done", "aria-labelledby": "done-title" }, [
      perfect && CekUI.celebrate(),
      el("div", { className: "done-hero" }, CekUI.mascot(perfect ? "cheer" : "happy")),
      el("h1", { id: "done-title", text: t(perfect ? "done.perfect" : "done.title") }),
      CekUI.streakNote(streak),
      el("div", { className: "stats" }, [
        CekUI.stat(t("common.xpEarned"), `+${xp}`, "bolt", "gold"),
        CekUI.stat(t(isGenuine ? "done.genuine" : "done.found"), findValue, "target", "green"),
        CekUI.stat(t("done.action"), t(actionResult.correct ? "done.actionRight" : "done.actionWrong"), "shield", "blue")
      ]),
      el("div", { className: "takeaway" }, [el("strong", { text: t("done.remember") }), el("p", { text: scenario.takeaway })]),
      !saved && el("p", { className: "note", text: t("done.notSaved") })
    ]);
  }

  function finish() {
    hideFeedback();
    const before = CekLogic.loadProgress(storage);
    const after = CekLogic.recordLesson(before, scenario.id, state.flagResult, state.actionResult, state.findResult);
    const saved = CekLogic.saveProgress(storage, after);
    showDone();
    dom.lesson.replaceChildren(doneScreen(after.xp - before.xp, saved, CekUI.addLessonStreak()));
    // "Lanjut" langsung ke pelajaran berikutnya; setelah yang terakhir, ke rapor. "Kembali ke beranda" ke peta.
    const next = SCENARIOS[CekLogic.currentIndex(SCENARIOS, after)];
    const nextUrl = next ? `simulator.html?s=${encodeURIComponent(next.id)}` : "rapor.html";
    setPrimary(t(next ? "common.continue" : "done.seeReport"), true, () => { location.href = nextUrl; });
    dom.lesson.scrollTo(0, 0);
    dom.primary.focus();
  }

  function showMissing() {
    dom.lesson.classList.add("is-done");
    dom.lesson.replaceChildren(el("section", { className: "done" }, [
      CekUI.mascot("oops"),
      el("h1", { text: t("missing.title") }),
      el("p", { text: t("missing.text") })
    ]));
    setPrimary(t("common.home"), true, () => { location.href = "index.html"; });
  }

  // Tombol X di bar atas: tanya dulu lewat dialog kalau pelajaran sedang berjalan.
  CekUI.guardExit(() => Boolean(scenario) && !dom.lesson.classList.contains("is-done"));

  const STARTERS = { find: startFind, flags: startFlags, match: startMatch, url: startUrl, reply: startReply, action: startAction };

  if (scenario) startFind();
  else showMissing();
})();
