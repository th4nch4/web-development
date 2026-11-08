// Halaman rapor: ringkasan hasil belajar dari progres yang tersimpan di perangkat ini.
(() => {
  const { el } = CekUI;
  const { t } = CekLang;
  const progress = CekLogic.loadProgress(CekUI.getStorage());
  const report = CekLogic.buildReport(SCENARIOS, QUESTIONS, progress);

  function emptyState() {
    return el("section", { className: "done" }, [
      CekUI.mascot("think"),
      el("h1", { text: t("report.emptyTitle") }),
      el("p", { text: t("report.emptyText") }),
      el("a", { className: "btn", href: "index.html", text: t("report.start") })
    ]);
  }

  const MAX_FOCUS = 2; // lebih dari ini bukan fokus lagi, cukup lihat daftar di bawah

  function focusCard() {
    const weak = report.needsPractice;
    if (weak.length > MAX_FOCUS) return null;
    if (weak.length === 0 && report.findMissed > 0) {
      return el("div", { className: "callout" }, [
        el("strong", { text: t("report.findMissed", { n: report.findMissed }) }),
        el("p", { text: t("report.findMissedText") })
      ]);
    }
    if (weak.length === 0) {
      return el("div", { className: "callout callout-good" }, [
        el("strong", { text: t("report.noneMissed") }),
        el("p", { text: t("report.keepItUp") })
      ]);
    }
    return el("div", { className: "callout" }, [
      el("span", { className: "callout-kicker", text: t(weak.length === 1 ? "report.mostMissed" : "report.mostMissedTie") }),
      el("ul", { className: "callout-list" }, weak.map((q) => el("li", {}, [
        el("strong", { text: q.title }),
        el("p", { text: q.hint })
      ])))
    ]);
  }

  // Angka selalu ditulis sebagai teks; meter hanya penegas visual.
  function questionRow(q) {
    const seen = q.found + q.missed;
    const summary = seen === 0
      ? t("report.notSeen")
      : t("report.foundTimes", { found: q.found, seen });
    return el("li", { className: "q-row" }, [
      CekUI.questionIcon(q.id),
      el("div", {}, [
        el("div", { className: "q-head" }, [
          el("strong", { text: q.title }),
          el("span", { className: "q-count", text: summary })
        ]),
        seen > 0 && el("div", { className: "meter", "aria-hidden": "true" }, [
          el("span", { style: `width: ${(q.found / seen) * 100}%` })
        ])
      ])
    ]);
  }

  function genuineNote() {
    if (report.genuineDone === 0) return null;
    const right = report.genuineDone - report.falseAlarms;
    return el("p", { className: "note", text: t("report.genuine", { right, total: report.genuineDone }) });
  }

  function fullReport() {
    return [
      el("h1", { className: "page-title", text: t("report.title") }),
      el("div", { className: "stats" }, [
        CekUI.stat(t("report.totalXp"), String(report.xp)),
        CekUI.stat(t("report.lessons"), `${report.doneCount}/${report.total}`),
        CekUI.stat(t("report.actions"), `${report.actionsCorrect}/${report.doneCount}`)
      ]),
      focusCard(),
      el("h2", { className: "section-title", text: t("report.questions") }),
      el("ol", { className: "q-list" }, report.perQuestion.map(questionRow)),
      genuineNote(),
      el("a", {
        className: "btn report-cta",
        href: "index.html",
        text: t(report.doneCount < report.total ? "report.continue" : "report.back")
      })
    ].filter(Boolean);
  }

  document.getElementById("xp").replaceChildren(CekUI.xpChip(report.xp));
  const root = document.getElementById("report");
  if (report.doneCount === 0) root.replaceChildren(emptyState());
  else root.replaceChildren(...fullReport());
  // Dipulihkan dari cache Back/Forward: hasilnya bisa sudah berubah, jadi muat ulang.
  window.addEventListener("pageshow", (event) => { if (event.persisted) location.reload(); });
})();
