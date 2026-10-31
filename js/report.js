// Halaman rapor: ringkasan hasil belajar dari progres yang tersimpan di perangkat ini.
(() => {
  const { el } = CekUI;
  const progress = CekLogic.loadProgress(CekUI.getStorage());
  const report = CekLogic.buildReport(SCENARIOS, QUESTIONS, progress);

  function emptyState() {
    return el("section", { className: "done" }, [
      CekUI.mascot("think"),
      el("h1", { text: "Rapormu masih kosong" }),
      el("p", { text: "Selesaikan satu pelajaran dulu, nanti hasilnya muncul di sini." }),
      el("a", { className: "btn", href: "index.html", text: "Mulai belajar" })
    ]);
  }

  const MAX_FOCUS = 2; // lebih dari ini bukan fokus lagi, cukup lihat daftar di bawah

  function focusCard() {
    const weak = report.needsPractice;
    if (weak.length > MAX_FOCUS) return null;
    if (weak.length === 0) {
      return el("div", { className: "callout callout-good" }, [
        el("strong", { text: "Tidak ada tanda yang terlewat." }),
        el("p", { text: "Pertahankan kebiasaan memeriksa sebelum klik." })
      ]);
    }
    return el("div", { className: "callout" }, [
      el("span", { className: "callout-kicker", text: weak.length === 1 ? "Paling sering terlewat" : "Sama-sama paling sering terlewat" }),
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
      ? "Belum muncul di pelajaran yang kamu selesaikan."
      : `Ditemukan ${q.found} dari ${seen} kali`;
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
    return el("p", { className: "note", text: `Pesan asli: ${right} dari ${report.genuineDone} kamu kenali dengan benar. Tidak semua pesan itu penipuan.` });
  }

  function fullReport() {
    return [
      el("h1", { className: "page-title", text: "Rapor kamu" }),
      el("div", { className: "stats" }, [
        CekUI.stat("Total XP", String(report.xp)),
        CekUI.stat("Pelajaran", `${report.doneCount}/${report.total}`),
        CekUI.stat("Tindakan tepat", `${report.actionsCorrect}/${report.doneCount}`)
      ]),
      focusCard(),
      el("h2", { className: "section-title", text: "5 Pertanyaan Sebelum Klik" }),
      el("ol", { className: "q-list" }, report.perQuestion.map(questionRow)),
      genuineNote(),
      el("a", {
        className: "btn report-cta",
        href: "index.html",
        text: report.doneCount < report.total ? "Lanjut belajar" : "Kembali ke jalur"
      })
    ].filter(Boolean);
  }

  document.getElementById("xp").replaceChildren(CekUI.xpChip(report.xp));
  const root = document.getElementById("report");
  if (report.doneCount === 0) root.replaceChildren(emptyState());
  else root.replaceChildren(...fullReport());
})();
