// Pembuka beranda dan janji privasi.
// - Halaman pembuka "Kenali phishing." (penuh layar, di awal setiap sesi browser): Coach Wall menyapa, tombol mulai,
//   janji privasi, fakta IASC, dan jalan cepat untuk yang cuma punya semenit (mis. juri): satu pesan ASLI dan satu
//   penelepon misterius, tampil sebagai notifikasi di layar kunci HP mini. Tombol mulai menggeser pembuka ke atas;
//   langitnya menyambung ke langit Dunia 1 di peta.
// - Di atas peta selalu ada panel beranda: kartu "lanjut belajar" (level berikutnya + progres), tiga angka ringkas,
//   5 Pertanyaan Sebelum Klik, lalu janji privasi + fakta + jalan cepat yang belum dicoba.
// - Gelembung Coach Wall di peta terbuka sendiri sekali, saat dia pertama kali terlihat.
// Dimuat setelah js/path.js (butuh peta yang sudah jadi).
(() => {
  const { el, icon } = CekUI;
  const { t } = CekLang;
  const storage = CekUI.getStorage();
  const progress = CekLogic.loadProgress(storage);
  const slot = document.getElementById("welcome");
  if (!slot) return;
  const OPENED_KEY = "cekdulu.opened"; // sessionStorage: pembuka sudah dilewati di sesi ini
  const SEEN_KEY = "cekdulu.coachSeen"; // localStorage: gelembung Coach Wall di peta sudah pernah terbuka sendiri
  const ENTER_MS = 750;
  const AUTO_TIP_MS = 6000;

  // Pesan asli pertama di daftar pelajaran, dan materi yang punya soal suara.
  const genuine = SCENARIOS.find((s) => s.flags.length === 0);
  const vishing = MATERI.find((m) => m.steps.some((step) => step.type === "voice"));
  const caller = vishing && vishing.steps.find((step) => step.type === "voice").caller;

  const QUICK = [
    genuine && {
      id: "real",
      href: `simulator.html?s=${encodeURIComponent(genuine.id)}`,
      tried: CekLogic.isDone(progress, genuine.id),
      short: t("welcome.realShort")
    },
    vishing && {
      id: "call",
      href: `materi.html?m=${encodeURIComponent(vishing.id)}&mulai=suara`,
      tried: (progress.materi || {})[vishing.id] !== undefined,
      short: t("welcome.callShort")
    }
  ].filter(Boolean);
  const quick = Object.fromEntries(QUICK.map((item) => [item.id, item]));

  const flag = (area, key, value) => {
    try {
      if (value === undefined) return window[area].getItem(key);
      window[area].setItem(key, value);
    } catch (error) {
      // Penyimpanan diblokir: pembuka tampil lagi di kunjungan berikutnya, tidak masalah.
    }
    return null;
  };

  function promises() {
    return el("ul", { className: "promises", "aria-label": t("welcome.promises") }, [
      ["lock", "welcome.noLogin"], ["shield", "welcome.noData"], ["device", "welcome.local"]
    ].map(([iconName, key]) => el("li", {}, [icon(iconName), t(key)])));
  }

  // Fakta IASC sebagai kalimat (angkanya ditebalkan), lengkap dengan sumbernya.
  function fact() {
    const [number, ...rest] = t("welcome.fact").split(" ");
    return el("p", { className: "welcome-fact" }, [el("strong", { text: number }), ` ${rest.join(" ")} `, el("span", { text: t("welcome.source") })]);
  }

  // Potongan pertama pesan, sebagai teks pratinjau notifikasi.
  function preview(scenario) {
    const first = scenario.messages[0].map((part) => (typeof part === "string" ? part : part.text)).join("");
    return first.length > 90 ? `${first.slice(0, 88).replace(/[\s.,;:]+$/, "")}…` : first;
  }

  // Layar kunci mini: dua "notifikasi masuk" yang langsung membuka latihannya.
  function lockScreen() {
    const items = [];
    if (quick.real) {
      items.push(el("a", { className: "incoming incoming-real", href: quick.real.href }, [
        el("span", { className: "incoming-top" }, [
          el("span", { className: "app-icon", "aria-hidden": "true", text: genuine.sender.name[0] }),
          el("strong", { text: genuine.sender.name }),
          el("small", { text: t("phone.now") })
        ]),
        genuine.subject && el("span", { className: "incoming-title", text: genuine.subject }),
        el("span", { className: "incoming-text", text: preview(genuine) }),
        el("span", { className: "incoming-cta", text: t("welcome.tryReal") })
      ]));
    }
    if (quick.call) {
      items.push(el("a", { className: "incoming incoming-call", href: quick.call.href }, [
        el("span", { className: "call-ring", "aria-hidden": "true" }, icon("phone")),
        el("span", { className: "incoming-body" }, [
          el("small", { text: t("voice.calling") }),
          el("strong", { text: caller }),
          el("span", { className: "incoming-cta", text: t("welcome.tryCall") })
        ])
      ]));
    }
    return el("section", { className: "lockscreen", "aria-labelledby": "try-title" }, [
      el("p", { className: "lockscreen-time", "aria-hidden": "true", text: t("phone.time") }),
      el("h2", { className: "lockscreen-title", id: "try-title", text: t("welcome.tryTitle") }),
      el("div", { className: "incoming-list" }, items)
    ]);
  }

  // Awan tambahan di langit pembuka (langit dan kota Dunia 1 dari js/world.js ada di bawahnya).
  const CLOUD = '<svg viewBox="0 0 64 30"><path d="M8 26a8 8 0 0 1 3-15 12 12 0 0 1 22-5 10 10 0 0 1 18 4 8 8 0 0 1 5 16z" fill="currentColor"/></svg>';
  function skyClouds() {
    return [[6, 10, 120, 0], [70, 6, 90, -6], [40, 22, 70, -12], [86, 30, 110, -3]].map(([x, y, w, delay]) =>
      el("span", { className: "landing-cloud", "aria-hidden": "true", style: `left:${x}%;top:${y}%;width:${w}px;animation-delay:${delay}s`, html: CLOUD }));
  }

  function landing() {
    const start = el("button", { type: "button", className: "btn landing-start", text: t(CekLogic.isFresh(progress) ? "landing.start" : "landing.continue") });
    const section = el("section", { className: "landing world-1", "aria-labelledby": "landing-title" },
      el("div", { className: "landing-stage" }, [
        el("div", { className: "landing-scene", "aria-hidden": "true" }, [...skyClouds(), CekWorld.sky(1)]),
        el("div", { className: "landing-inner" }, [
          el("p", { className: "landing-brand" }, [icon("shield"), "CekDulu"]),
          el("div", { className: "landing-intro" }, [
            el("div", { className: "welcome-coach" }, [
              CekUI.mascot("happy"),
              el("p", { className: "welcome-bubble", text: t("welcome.greet") })
            ]),
            el("h2", { className: "landing-title", id: "landing-title", tabindex: "-1", text: t("landing.title") }),
            el("p", { className: "landing-lede", text: t("landing.lede") }),
            start,
            promises()
          ]),
          lockScreen(),
          fact()
        ])
      ]));
    start.addEventListener("click", () => enterMap(section));
    section.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => flag("sessionStorage", OPENED_KEY, "1")));
    return section;
  }

  // Selama pembuka terlihat, isi halaman di belakangnya tidak bisa difokus atau dibaca pembaca layar.
  function setBehind(hidden) {
    document.querySelectorAll("body > header, body > main").forEach((node) => { node.inert = hidden; });
    document.documentElement.classList.toggle("has-landing", hidden);
  }

  // Masuk ke peta: pembuka meluncur ke atas, peta di belakangnya maju sedikit (langitnya menyambung).
  function enterMap(section) {
    flag("sessionStorage", OPENED_KEY, "1");
    const done = () => {
      section.remove();
      setBehind(false);
      window.scrollTo(0, 0);
      const current = document.querySelector("#units a.node-current, #units a.node");
      if (current) current.focus({ preventScroll: true });
      watchMapCoach();
    };
    if (CekSettings.reducedMotion()) {
      done();
      return;
    }
    setBehind(false);
    document.documentElement.classList.add("has-landing"); // tetap tanpa gulir sampai transisi selesai
    const easing = "cubic-bezier(.7, 0, .25, 1)";
    document.querySelector("main").animate([{ transform: "translateY(36px) scale(.97)", opacity: 0.4 }, { transform: "none", opacity: 1 }],
      { duration: ENTER_MS, easing: "cubic-bezier(.2, .7, .2, 1)" });
    section.animate([{ transform: "none" }, { transform: "translateY(-100%)" }], { duration: ENTER_MS, easing, fill: "forwards" })
      .finished.then(done, done);
  }

  // ---------- Panel di atas peta: lanjut belajar, ringkasan, 5 pertanyaan, janji privasi ----------

  const doneLessons = SCENARIOS.filter((s) => CekLogic.isDone(progress, s.id)).length;
  const materiBest = progress.materi || {};

  // Yang dimainkan berikutnya: pelajaran pertama yang belum selesai, lalu materi yang belum dicoba, lalu rapor.
  function nextUp() {
    const index = CekLogic.currentIndex(SCENARIOS, progress);
    if (index >= 0) {
      const scenario = SCENARIOS[index];
      return {
        kicker: t("dash.nextLevel", { n: index + 1 }), title: scenario.title, icon: scenario.icon,
        href: `simulator.html?s=${encodeURIComponent(scenario.id)}`,
        cta: t(CekLogic.isFresh(progress) ? "landing.start" : "landing.continue")
      };
    }
    const materi = MATERI.find((m) => materiBest[m.id] === undefined);
    if (materi) {
      return { kicker: t("dash.nextMateri"), title: materi.title, icon: materi.icon, href: `materi.html?m=${encodeURIComponent(materi.id)}`, cta: t("landing.continue") };
    }
    return { note: t("dash.allDoneText"), title: t("dash.allDone"), icon: "trophy", href: "rapor.html", cta: t("done.seeReport") };
  }

  function nextCard() {
    const next = nextUp();
    const percent = Math.round((doneLessons / SCENARIOS.length) * 100);
    return el("article", { className: "dash-next", "aria-labelledby": "dash-next-title" }, [
      el("div", { className: "dash-next-head" }, [
        CekUI.mascot("happy"),
        el("div", { className: "dash-next-text" }, [
          next.kicker && el("p", { className: "dash-kicker", text: next.kicker }),
          el("h2", { className: "dash-title", id: "dash-next-title", text: next.title }),
          next.note && el("p", { className: "dash-note", text: next.note })
        ]),
        el("span", { className: "dash-node", "aria-hidden": "true" }, icon(next.icon))
      ]),
      el("div", { className: "dash-meter" }, [
        el("span", { className: "meter", "aria-hidden": "true" }, el("span", { style: `width: ${percent}%` })),
        el("small", { text: t("dash.progress", { done: doneLessons, total: SCENARIOS.length }) })
      ]),
      el("a", { className: "btn dash-go", href: next.href }, next.cta)
    ]);
  }

  // Tiga angka ringkas: pelajaran selesai, bintang terkumpul (pelajaran + materi), materi selesai.
  function summary() {
    const quizCount = (materi) => materi.steps.filter((step) => step.type !== "learn").length;
    const stars = SCENARIOS.reduce((sum, s) => sum + CekLogic.lessonStars(progress.lessons[s.id]), 0)
      + MATERI.reduce((sum, m) => sum + (materiBest[m.id] === undefined ? 0 : CekLogic.materiStars(materiBest[m.id], quizCount(m))), 0);
    const maxStars = (SCENARIOS.length + MATERI.length) * 3;
    return el("div", { className: "stats dash-stats" }, [
      CekUI.stat(t("report.lessons"), `${doneLessons}/${SCENARIOS.length}`, "check", "green"),
      CekUI.stat(t("dash.stars"), `${stars}/${maxStars}`, "star", "gold"),
      CekUI.stat(t("dash.materi"), `${MATERI.filter((m) => materiBest[m.id] !== undefined).length}/${MATERI.length}`, "hook", "blue")
    ]);
  }

  // Kerangka inti yang dilatih di setiap pelajaran, supaya bisa dipakai juga di luar CekDulu.
  function questionsCard() {
    return el("section", { className: "dash-questions", "aria-labelledby": "dash-q-title" }, [
      el("h2", { id: "dash-q-title", text: t("report.questions") }),
      el("p", { className: "dash-q-lede", text: t("dash.questionsLede") }),
      el("ol", { className: "dash-q-list" }, QUESTIONS.map((q) => el("li", {}, [
        CekUI.questionIcon(q.id),
        el("span", {}, [el("strong", { text: q.title }), el("small", { text: q.hint })])
      ])))
    ]);
  }

  // Janji privasi tetap terlihat, fakta, dan jalan cepat yang belum dicoba.
  function trust() {
    const open = QUICK.filter((item) => !item.tried);
    return el("div", { className: "dash-trust" }, [
      promises(),
      fact(),
      open.length > 0 && el("p", { className: "quick-links" }, [
        el("span", { text: `${t("welcome.tryShort")}:` }),
        ...open.map((item) => el("a", { className: `quick-link quick-${item.id}`, href: item.href }, [
          icon(item.id === "call" ? "phone" : "chat"), item.short
        ]))
      ])
    ]);
  }

  function dashboard() {
    return el("section", { className: "dash", "aria-label": t("dash.label") }, [nextCard(), summary(), questionsCard(), trust()]);
  }

  // Gelembung Coach Wall di peta terbuka sendiri sekali, saat dia pertama kali terlihat.
  function watchMapCoach() {
    const mapCoach = document.querySelector(".world-coach .coach-btn");
    if (!mapCoach || flag("localStorage", SEEN_KEY) || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      mapCoach.dataset.hold = String(AUTO_TIP_MS);
      mapCoach.click();
      flag("localStorage", SEEN_KEY, "1");
    }, { threshold: 0.8 });
    observer.observe(mapCoach);
  }

  slot.replaceChildren(dashboard());
  if (flag("sessionStorage", OPENED_KEY)) {
    watchMapCoach();
  } else {
    const section = landing();
    document.body.append(section);
    setBehind(true);
    section.querySelector(".landing-title").focus({ preventScroll: true });
  }
})();
