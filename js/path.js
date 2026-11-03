// Halaman jalur belajar: pelajaran berurutan seperti peta level, dibagi per dunia bertema
// (latar dan jalan dari js/world.js), ditutup dengan rapor.
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

  const offsetOf = (position) => OFFSETS[position % OFFSETS.length];

  function pathItem(node, label, position, badge, extra) {
    return el("li", {
      className: badge ? "path-item is-current" : "path-item",
      style: `--x: ${offsetOf(position)}px`
    }, [
      badge && el("span", { className: "node-badge", "aria-hidden": "true", text: badge }),
      node,
      extra,
      el("span", { className: "node-label", "aria-hidden": "true", text: label })
    ]);
  }

  // Bintang ala game di bawah level yang sudah selesai (lihat CekLogic.lessonStars).
  function starRow(count) {
    return el("span", { className: "stars", "aria-hidden": "true" }, [1, 2, 3].map((n) =>
      el("span", { className: n <= count ? "star is-on" : "star" }, icon("star"))));
  }

  function lessonNode(scenario, index) {
    const done = CekLogic.isDone(progress, scenario.id);
    const stars = CekLogic.lessonStars(progress.lessons[scenario.id]);
    const name = `Level ${index + 1}: ${scenario.title}`;
    const node = done || CekLogic.isUnlocked(SCENARIOS, progress, index)
      ? el("a", {
        className: done ? "node node-done" : "node node-current",
        href: `simulator.html?s=${encodeURIComponent(scenario.id)}`,
        "aria-label": `${name}, ${done ? `selesai, ${stars} dari 3 bintang, ulangi` : "mulai"}`
      }, [icon(scenario.icon), done && el("span", { className: "node-check" }, icon("check"))])
      : el("span", { className: "node node-locked", role: "img", "aria-label": `${name}, terkunci` }, icon("lock"));
    const badge = index === current ? (doneCount === 0 ? "Mulai" : "Lanjut") : null;
    return pathItem(node, scenario.title, index, badge, done && starRow(stars));
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

  // Materi "Kenali jenis phishing": rak terpisah di bawah jalur, selalu terbuka, urutan bebas.
  // Jalur pelajaran (simulator) tetap yang pertama terlihat.
  function materiShelf() {
    const scores = progress.materi || {};
    const cards = MATERI.map((materi) => {
      const done = scores[materi.id] !== undefined;
      return el("li", {}, el("a", {
        className: done ? "materi-card is-done" : "materi-card",
        href: `materi.html?m=${encodeURIComponent(materi.id)}`,
        "aria-label": `${materi.title}${done ? ", selesai, ulangi" : ""}`
      }, [
        el("span", { className: "materi-icon", "aria-hidden": "true" }, icon(done ? "check" : materi.icon)),
        el("span", { className: "materi-title", text: materi.title })
      ]));
    });
    return el("section", { className: "materi-shelf", "aria-labelledby": "materi-title" }, [
      el("h2", { id: "materi-title", text: "Kenali jenis phishing" }),
      el("p", { className: "materi-lede", text: "Penjelasan singkat + mini kuis. Buka yang mana aja." }),
      el("ul", { className: "materi-list" }, cards)
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
    // Setiap level dapat satu hiasan dunia di sisi yang kosong.
    items.forEach((item, i) => item.append(CekWorld.prop(unit.id, i, offsetOf(lessons[0].index + i))));
    return el("section", { className: `unit unit-${unit.id} world world-${unit.id}`, "aria-label": `Dunia ${unit.id}, ${unit.world}: ${unit.subtitle}` }, [
      CekWorld.sky(unit.id),
      el("div", { className: "unit-banner" }, [
        el("span", { className: "unit-icon", "aria-hidden": "true" }, icon(unit.icon)),
        el("div", {}, [
          el("p", { className: "unit-kicker", text: `Dunia ${unit.id} · ${unit.world}` }),
          el("h2", { text: unit.subtitle })
        ])
      ]),
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
  document.getElementById("units").replaceChildren(...UNITS.map(unitSection), reportPath());
  CekWorld.mountRoads([...document.querySelectorAll(".world")]);
  document.getElementById("materi").replaceChildren(materiShelf());
  document.getElementById("storage-note").hidden = Boolean(storage);
  setupReset();
})();
