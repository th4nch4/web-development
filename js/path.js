// Halaman jalur belajar: pelajaran berurutan seperti peta, ditutup dengan rapor.
(() => {
  const { el, icon } = CekUI;
  const OFFSETS = [0, 48, 72, 48, 0, -48, -72, -48]; // pola zig-zag jalur, dalam px
  const storage = CekUI.getStorage();
  const progress = CekLogic.loadProgress(storage);
  const current = CekLogic.currentIndex(SCENARIOS, progress);
  const doneCount = SCENARIOS.filter((s) => CekLogic.isDone(progress, s.id)).length;

  function coachText() {
    if (doneCount === 0) return "Halo, aku Lupi! Bareng aku, yuk latihan nyari pesan penipuan.";
    if (current === -1) return "Semua beres, kamu keren! Intip rapormu, yuk.";
    return `Mantap, ${doneCount} dari ${SCENARIOS.length} beres! Gas lanjut?`;
  }

  function pathItem(node, label, position, badge) {
    return el("li", {
      className: badge ? "path-item is-current" : "path-item",
      style: `--x: ${OFFSETS[position % OFFSETS.length]}px`
    }, [
      badge && el("span", { className: "node-badge", "aria-hidden": "true", text: badge }),
      node,
      el("span", { className: "node-label", "aria-hidden": "true", text: label })
    ]);
  }

  function lessonNode(scenario, index) {
    const done = CekLogic.isDone(progress, scenario.id);
    const name = `Pelajaran ${index + 1}: ${scenario.title}`;
    const node = done || CekLogic.isUnlocked(SCENARIOS, progress, index)
      ? el("a", {
        className: done ? "node node-done" : "node node-current",
        href: `simulator.html?s=${encodeURIComponent(scenario.id)}`,
        "aria-label": `${name}, ${done ? "selesai, ulangi" : "mulai"}`
      }, icon(done ? "check" : "star"))
      : el("span", { className: "node node-locked", role: "img", "aria-label": `${name}, terkunci` }, icon("lock"));
    const badge = index === current ? (doneCount === 0 ? "Mulai" : "Lanjut") : null;
    return pathItem(node, scenario.title, index, badge);
  }

  // Ronde Kilat: bonus di akhir setiap bagian, terbuka setelah semua pelajaran bagian itu selesai.
  function quickNode(unit, position) {
    const best = (progress.quick || {})[unit.id];
    const label = best === undefined ? "Ronde Kilat" : `Ronde Kilat · skor ${best}`;
    const node = CekLogic.isQuickUnlocked(SCENARIOS, progress, unit.id)
      ? el("a", { className: "node node-quick", href: `kilat.html?unit=${unit.id}`, "aria-label": `${label}: asli atau penipuan?` }, icon("bolt"))
      : el("span", { className: "node node-locked", role: "img", "aria-label": "Ronde Kilat, terbuka setelah semua pelajaran di bagian ini selesai" }, icon("bolt"));
    return pathItem(node, label, position, null);
  }

  // Materi "Kenali Jenis Phishing": selalu terbuka, boleh dibuka dengan urutan mana saja.
  function materiSection() {
    const scores = progress.materi || {};
    const items = MATERI.map((materi, index) => {
      const done = scores[materi.id] !== undefined;
      const node = el("a", {
        className: done ? "node node-done" : "node node-materi",
        href: `materi.html?m=${encodeURIComponent(materi.id)}`,
        "aria-label": `Materi: ${materi.title}${done ? ", selesai, ulangi" : ""}`
      }, icon(done ? "check" : materi.icon));
      return pathItem(node, materi.title, index, null);
    });
    return el("section", { className: "unit unit-materi", "aria-label": "Materi: Kenali Jenis Phishing" }, [
      el("div", { className: "unit-banner" }, [el("span", { className: "unit-kicker", text: "Materi" }), el("h2", { text: "Kenali jenis phishing" })]),
      el("ol", { className: "path" }, items)
    ]);
  }

  function unitSection(unit) {
    const lessons = SCENARIOS
      .map((scenario, index) => ({ scenario, index }))
      .filter(({ scenario }) => scenario.unit === unit.id);
    const items = [
      ...lessons.map(({ scenario, index }) => lessonNode(scenario, index)),
      quickNode(unit, lessons[lessons.length - 1].index + 1)
    ];
    return el("section", { className: `unit unit-${unit.id}`, "aria-label": `${unit.title}: ${unit.subtitle}` }, [
      el("div", { className: "unit-banner" }, [el("span", { className: "unit-kicker", text: unit.title }), el("h2", { text: unit.subtitle })]),
      el("ol", { className: "path" }, items)
    ]);
  }

  function reportPath() {
    const node = doneCount > 0
      ? el("a", { className: "node node-trophy", href: "rapor.html", "aria-label": "Rapor belajarmu" }, icon("trophy"))
      : el("span", { className: "node node-locked", role: "img", "aria-label": "Rapor, terbuka setelah satu pelajaran selesai" }, icon("trophy"));
    return el("ol", { className: "path path-end" }, [
      pathItem(node, "Rapor", SCENARIOS.length, current === -1 ? "Lihat" : null)
    ]);
  }

  function setupReset() {
    const reset = document.getElementById("reset");
    reset.hidden = doneCount === 0;
    reset.addEventListener("click", () => {
      if (!window.confirm("Hapus semua progres di perangkat ini?")) return;
      CekLogic.clearProgress(storage);
      location.reload();
    });
  }

  document.getElementById("xp").replaceChildren(CekUI.xpChip(progress.xp));
  CekUI.renderCoach(document.getElementById("coach"), coachText(), "happy");
  document.getElementById("units").replaceChildren(materiSection(), ...UNITS.map(unitSection), reportPath());
  document.getElementById("storage-note").hidden = Boolean(storage);
  setupReset();
})();
