// Halaman jalur belajar: pelajaran berurutan seperti peta level, dibagi per dunia bertema
// (latar dan jalan dari js/world.js). Dunia 3 berisi materi jenis-jenis phishing (urutan bebas),
// dan jalurnya ditutup dengan rapor. Coach Wall menunggu di samping level yang sedang dimainkan.
(() => {
  const { el, icon } = CekUI;
  const { t } = CekLang;
  const OFFSETS = [0, 48, 72, 48, 0, -48, -72, -48]; // pola zig-zag jalur, dalam px
  const storage = CekUI.getStorage();
  const progress = CekLogic.loadProgress(storage);
  const current = CekLogic.currentIndex(SCENARIOS, progress);
  const doneCount = SCENARIOS.filter((s) => CekLogic.isDone(progress, s.id)).length;

  const offsetOf = (position) => OFFSETS[position % OFFSETS.length];

  // node: elemen level, atau [tombol, gelembung] untuk level terkunci (lihat lockedNode).
  function pathItem(node, label, position, badge, extra) {
    return el("li", {
      className: badge ? "path-item is-current" : "path-item",
      style: `--x: ${offsetOf(position)}px`
    }, [
      badge && el("span", { className: "node-badge", "aria-hidden": "true", text: badge }),
      ...[].concat(node),
      extra,
      el("span", { className: "node-label", "aria-hidden": "true", text: label })
    ]);
  }

  // ---------- Level terkunci: diketuk, muncul gelembung "kenapa terkunci" + jalan ke level yang sedang dimainkan ----------
  const currentScenario = SCENARIOS[current];
  let openTip = null; // { button, tip } yang sedang terbuka

  function closeTip(returnFocus) {
    if (!openTip) return;
    const { button, tip } = openTip;
    tip.hidden = true;
    button.setAttribute("aria-expanded", "false");
    button.closest(".path-item").classList.remove("has-tip");
    openTip = null;
    if (returnFocus) button.focus();
  }

  /** Tombol level terkunci. label: nama level untuk pembaca layar; reason: kenapa masih terkunci. */
  let tipCount = 0;

  function lockedNode(iconName, label, reason, extraClass = "") {
    tipCount += 1;
    const tipId = `lock-tip-${tipCount}`;
    const button = el("button", {
      type: "button", className: `node node-locked ${extraClass}`.trim(), "aria-label": label,
      "aria-expanded": "false", "aria-controls": tipId
    }, icon(iconName));
    const tip = el("div", { className: "lock-tip", id: tipId, hidden: true }, [
      el("p", { className: "lock-tip-text" }, [icon("lock"), reason]),
      currentScenario && el("a", {
        className: "lock-go", href: `simulator.html?s=${encodeURIComponent(currentScenario.id)}`
      }, t("lock.go", { n: current + 1 }))
    ]);
    button.addEventListener("click", () => {
      const wasOpen = openTip && openTip.button === button;
      closeTip(false);
      if (wasOpen) return;
      tip.hidden = false;
      button.setAttribute("aria-expanded", "true");
      button.closest(".path-item").classList.add("has-tip");
      openTip = { button, tip };
      CekSound.play("tap");
    });
    return [button, tip];
  }

  // Ketuk di luar gelembung menutupnya; Esc juga (fokus kembali ke levelnya).
  document.addEventListener("click", (event) => {
    if (openTip && !openTip.button.contains(event.target) && !openTip.tip.contains(event.target)) closeTip(false);
  });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeTip(true); });

  // Bintang ala game di bawah level yang sudah selesai (lihat CekLogic.lessonStars).
  function starRow(count) {
    return el("span", { className: "stars", "aria-hidden": "true" }, [1, 2, 3].map((n) =>
      el("span", { className: n <= count ? "star is-on" : "star" }, icon("star"))));
  }

  function lessonNode(scenario, index) {
    const done = CekLogic.isDone(progress, scenario.id);
    const stars = CekLogic.lessonStars(progress.lessons[scenario.id]);
    const name = t("map.level", { n: index + 1, title: scenario.title });
    const node = done || CekLogic.isUnlocked(SCENARIOS, progress, index)
      ? el("a", {
        className: done ? "node node-done" : "node node-current",
        href: `simulator.html?s=${encodeURIComponent(scenario.id)}`,
        "aria-label": done ? t("map.levelDone", { name, stars }) : t("map.levelStart", { name })
      }, [icon(scenario.icon), done && el("span", { className: "node-check" }, icon("check"))])
      : lockedNode("lock", t("map.levelLocked", { name }), t(index - 1 === current ? "lock.lesson" : "lock.lessons", { n: current + 1 }));
    const badge = index === current ? t(doneCount === 0 ? "map.badgeStart" : "map.badgeContinue") : null;
    return pathItem(node, scenario.title, index, badge, done && starRow(stars));
  }

  // Ronde Kilat: bonus di akhir setiap bagian, terbuka setelah semua pelajaran bagian itu selesai.
  function quickNode(unit, position) {
    const best = (progress.quick || {})[unit.id];
    const label = best === undefined ? t("map.quick") : t("map.quickScore", { score: best });
    const node = CekLogic.isQuickUnlocked(SCENARIOS, progress, unit.id)
      ? el("a", { className: "node node-quick", href: `kilat.html?unit=${unit.id}`, "aria-label": t("map.quickOpen", { label }) }, icon("bolt"))
      : lockedNode("bolt", t("map.quickLocked"), t("lock.quick"), "node-quick-locked");
    return pathItem(node, label, position, null);
  }

  // Satu dunia di peta: langit dan kota, banner yang menempel saat digulir, lalu jalur levelnya.
  function worldSection(id, names, iconName, items) {
    return el("section", { className: `unit unit-${id} world world-${id}`, "aria-label": t("map.worldLabel", names) }, [
      CekWorld.scenery(id),
      CekWorld.sky(id),
      el("div", { className: "unit-banner" }, [
        el("span", { className: "unit-icon", "aria-hidden": "true" }, icon(iconName)),
        el("div", {}, [
          el("p", { className: "unit-kicker", text: t("map.worldKicker", names) }),
          el("h2", { text: names.subtitle })
        ])
      ]),
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
    // Setiap level dapat satu hiasan dunia di sisi yang kosong; di level yang sedang dimainkan, Coach Wall yang menunggu.
    items.forEach((item, i) => {
      const x = offsetOf(lessons[0].index + i);
      item.append(item.classList.contains("is-current") ? CekWorld.coach(i, x) : CekWorld.prop(unit.id, i, x));
    });
    return worldSection(unit.id, { n: unit.id, world: unit.world, subtitle: unit.subtitle }, unit.icon, items);
  }

  // Dunia 3 "Teluk Phishing": setiap materi jadi satu level. Semuanya terbuka, boleh dimainkan urutan bebas.
  const { MATERI_WORLD } = CekWorld;

  function materiNode(materi, index) {
    const best = (progress.materi || {})[materi.id];
    const done = best !== undefined;
    const quizzes = materi.steps.filter((step) => step.type !== "learn").length;
    const node = el("a", {
      className: done ? "node node-done" : "node",
      href: `materi.html?m=${encodeURIComponent(materi.id)}`,
      "aria-label": done ? t("materi.cardDone", { title: materi.title }) : materi.title
    }, [icon(materi.icon), done && el("span", { className: "node-check" }, icon("check"))]);
    const item = pathItem(node, materi.title, index, null, done && starRow(CekLogic.materiStars(best, quizzes)));
    item.append(CekWorld.prop(MATERI_WORLD, index, offsetOf(index)));
    return item;
  }

  function materiWorld() {
    const names = { n: MATERI_WORLD, world: t("map.materiWorld"), subtitle: t("map.materiSubtitle") };
    return worldSection(MATERI_WORLD, names, "hook", MATERI.map(materiNode));
  }

  function reportPath() {
    const node = doneCount > 0
      ? el("a", { className: "node node-trophy", href: "rapor.html", "aria-label": t("map.reportOpen") }, icon("trophy"))
      : lockedNode("trophy", t("map.reportLocked"), t("lock.report"), "node-trophy-locked");
    return el("ol", { className: "path path-end" }, [
      pathItem(node, t("map.report"), SCENARIOS.length, current === -1 ? t("map.badgeView") : null)
    ]);
  }

  document.getElementById("xp").replaceChildren(CekUI.xpChip(progress.xp));
  document.getElementById("units").replaceChildren(...UNITS.map(unitSection), materiWorld(), reportPath());
  const worlds = [...document.querySelectorAll(".world")];
  CekWorld.mountRoads(worlds);
  CekWorld.mountTransitions(worlds);
  // Dipulihkan dari cache Back/Forward: XP, bintang, dan level terbuka masih yang lama, jadi muat ulang.
  window.addEventListener("pageshow", (event) => { if (event.persisted) location.reload(); });
})();
