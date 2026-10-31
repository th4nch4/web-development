// Halaman "Lagi Ragu?": 5 pertanyaan ya/tidak untuk pesan nyata yang sedang diragukan.
// Tidak ada isi pesan yang diminta, dan jawaban tidak disimpan.
(() => {
  const { el, icon, questionIcon } = CekUI;
  const ANSWERS = [
    { value: "ya", label: "Ya" },
    { value: "tidak", label: "Tidak" },
    { value: "ragu", label: "Tidak yakin" }
  ];
  const form = document.getElementById("doubt-form");
  const verdictBox = document.getElementById("verdict");
  const questionIds = QUESTIONS.map((q) => q.id);
  const titleOf = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.title]));

  function questionItem(q) {
    const name = `q-${q.id}`;
    return el("li", { className: "doubt-item" }, [
      el("fieldset", {}, [
        el("legend", {}, [questionIcon(q.id), el("span", { text: q.ask })]),
        el("div", { className: "answers" }, ANSWERS.map((answer) => el("label", { className: `answer answer-${answer.value}` }, [
          el("input", { type: "radio", name, value: answer.value }),
          el("span", { text: answer.label })
        ])))
      ])
    ]);
  }

  function readAnswers() {
    const data = new FormData(form);
    return Object.fromEntries(questionIds.map((id) => [id, data.get(`q-${id}`)]));
  }

  function list(ids) {
    return el("ul", { className: "verdict-list" }, ids.map((id) => el("li", {}, [questionIcon(id), titleOf[id]])));
  }

  const helpLink = () => el("a", { className: "verdict-link", href: "telanjur.html", text: "Sudah telanjur klik atau kirim? Lihat langkah darurat" });

  const VIEWS = {
    incomplete: (v) => [
      el("p", { className: "verdict-wait", text: `Jawab ${v.remaining} pertanyaan lagi.` })
    ],
    danger: (v) => [
      el("h2", { id: "verdict-title" }, [icon("alert"), `Berhenti dulu. Ada ${v.yes.length} tanda bahaya.`]),
      list(v.yes),
      v.unsure.length > 0 && el("p", { className: "verdict-also", text: "Juga belum yakin:" }),
      v.unsure.length > 0 && list(v.unsure),
      el("p", { text: "Jangan klik, jangan kirim kode atau uang. Hubungi pengirimnya lewat nomor atau aplikasi resmi yang kamu cari sendiri." }),
      helpLink()
    ],
    unsure: (v) => [
      el("h2", { id: "verdict-title" }, [icon("lens"), "Belum bisa dipastikan."]),
      list(v.unsure),
      el("p", { text: "Anggap mencurigakan sampai jelas. Tanyakan ke orang yang kamu percaya atau lewat kanal resmi." })
    ],
    "none-found": () => [
      el("h2", { id: "verdict-title" }, [icon("check"), "Tidak ketemu tanda bahaya."]),
      el("p", { text: "Itu belum berarti pesannya pasti aman. Kalau diminta sesuatu yang penting, tetap pastikan lewat kanal resmi." })
    ]
  };

  function render() {
    const verdict = CekLogic.doubtVerdict(questionIds, readAnswers());
    verdictBox.className = `verdict verdict-${verdict.level}`;
    verdictBox.replaceChildren(...VIEWS[verdict.level](verdict));
  }

  document.getElementById("doubt-list").replaceChildren(...QUESTIONS.map(questionItem));
  form.addEventListener("change", render);
  // Event reset terjadi sebelum isian dikosongkan, jadi tunggu satu putaran.
  form.addEventListener("reset", () => setTimeout(render));
  form.addEventListener("submit", (event) => event.preventDefault());
  render();
})();
