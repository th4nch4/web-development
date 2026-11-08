// Pengaturan: tombol roda gigi di bar atas membuka jendela di tengah layar dengan menu samping
// Umum, Tampilan, dan Bahasa. Dimuat di <head> setelah js/lang.js supaya tema dan pilihan gerak terpasang
// sebelum halaman tampil (tanpa kedip). Jendelanya dibuat saat DOMContentLoaded, setelah js/ui.js dimuat.
// Semua pilihan disimpan hanya di perangkat ini.
const CekSettings = (() => {
  const { t } = CekLang;
  const THEME_KEY = "cekdulu.theme";
  // Pilihan kecil: nilai bawaan tidak disimpan; nilai di luar daftar dianggap bawaan.
  const PREFS = {
    motion: { key: "cekdulu.motion", values: ["auto", "on", "reduce"] }, // auto = ikut pengaturan HP
    confetti: { key: "cekdulu.confetti", values: ["on", "off"] },
    voice: { key: "cekdulu.voice", values: ["normal", "slow"] },
    quick: { key: "cekdulu.quick", values: ["10", "20"] }
  };
  const VOICE_RATE = { normal: 0.95, slow: 0.7 };
  const darkMedia = window.matchMedia("(prefers-color-scheme: dark)");
  const reducedMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function write(key, value, isDefault) {
    try {
      if (isDefault) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (error) {
      // Penyimpanan diblokir: pilihan berlaku sampai halaman ditutup.
    }
  }

  const memory = {}; // cadangan kalau penyimpanan diblokir

  function pref(name) {
    const { key, values } = PREFS[name];
    const value = memory[name] || read(key);
    return values.includes(value) ? value : values[0];
  }

  function setPref(name, value) {
    memory[name] = value;
    write(PREFS[name].key, value, value === PREFS[name].values[0]);
    apply();
    document.dispatchEvent(new CustomEvent("cek:prefs", { detail: { name, value } }));
  }

  function theme() {
    const value = memory.theme || read(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  }

  function setTheme(value) {
    memory.theme = value;
    write(THEME_KEY, value, value === "system");
    apply();
  }

  function apply() {
    const choice = theme();
    root.dataset.theme = choice === "dark" || (choice === "system" && darkMedia.matches) ? "dark" : "light";
    root.dataset.motion = pref("motion");
  }

  // ---------- Isi jendela pengaturan ----------

  let uid = 0;

  // Baris nyala/mati bergaya sakelar.
  function switchRow(title, desc, isOn, onChange) {
    const { el } = CekUI;
    uid += 1;
    const input = el("input", { type: "checkbox", role: "switch", className: "switch", id: `set-${uid}`, "aria-describedby": `set-${uid}-desc` });
    input.checked = isOn;
    input.addEventListener("change", () => onChange(input.checked));
    return el("div", { className: "set-row" }, [
      el("label", { className: "set-text", for: `set-${uid}` }, [el("strong", { text: title }), el("small", { id: `set-${uid}-desc`, text: desc })]),
      input
    ]);
  }

  // Baris pilihan bergaya tombol berderet (radio).
  function choiceRow(title, desc, choices, current, onChange) {
    const { el, icon } = CekUI;
    uid += 1;
    const name = `set-${uid}`;
    return el("fieldset", { className: "set-row set-choice" }, [
      el("legend", { className: "set-text" }, [el("strong", { text: title }), desc && el("small", { text: desc })]),
      el("div", { className: `answers answers-${choices.length}` }, choices.map((choice) => {
        const input = el("input", { type: "radio", name, value: choice.value });
        input.checked = choice.value === current;
        input.addEventListener("change", () => onChange(choice.value));
        return el("label", { className: "answer" }, [input, el("span", {}, [choice.icon && icon(choice.icon), choice.label])]);
      }))
    ]);
  }

  async function resetProgress() {
    const sure = await CekUI.ask({ mood: "oops", title: t("reset.title"), text: t("reset.text"), stay: t("reset.cancel"), leave: t("reset.confirm") });
    if (!sure) return;
    CekLogic.clearProgress(CekUI.getStorage());
    CekUI.resetStreak();
    location.href = "index.html";
  }

  function generalPanel() {
    const { el, icon } = CekUI;
    const seconds = (n) => t("settings.seconds", { n });
    return [
      switchRow(t("settings.soundTitle"), t("settings.soundDesc"), CekSound.isOn(), CekSound.setOn),
      switchRow(t("settings.vibrate"), t("settings.vibrateDesc"), CekSound.vibrateOn(), CekSound.setVibrate),
      choiceRow(t("settings.voice"), t("settings.voiceDesc"), [
        { value: "normal", label: t("settings.voiceNormal"), icon: "speaker" },
        { value: "slow", label: t("settings.voiceSlow"), icon: "turtle" }
      ], pref("voice"), (value) => setPref("voice", value)),
      choiceRow(t("settings.quick"), t("settings.quickDesc"), [
        { value: "10", label: seconds(10), icon: "bolt" },
        { value: "20", label: seconds(20) }
      ], pref("quick"), (value) => setPref("quick", value)),
      el("section", { className: "set-privacy" }, [
        el("h3", { text: t("settings.privacy") }),
        el("p", { text: t("settings.about") }),
        !CekUI.getStorage() && el("p", { text: t("settings.storageNote") }),
        el("button", { type: "button", className: "btn-text-danger set-reset", onClick: resetProgress }, [icon("trash"), t("settings.reset")])
      ])
    ];
  }

  function lookPanel() {
    return [
      choiceRow(t("settings.theme"), t("settings.systemNote"), [
        { value: "system", label: t("settings.system"), icon: "monitor" },
        { value: "light", label: t("settings.light"), icon: "sun" },
        { value: "dark", label: t("settings.dark"), icon: "moon" }
      ], theme(), setTheme),
      switchRow(t("settings.motion"), t("settings.motionDesc"), !reducedMotion(), (on) => setPref("motion", on ? "on" : "reduce")),
      switchRow(t("settings.confetti"), t("settings.confettiDesc"), pref("confetti") === "on", (on) => setPref("confetti", on ? "on" : "off"))
    ];
  }

  // Ganti bahasa memuat ulang halaman. Kalau pelajaran sedang berjalan, tanya dulu; kalau batal, pilihan kembali.
  async function chooseLanguage(value, row) {
    if (CekUI.isSessionActive()) {
      const sure = await CekUI.ask({ mood: "oops", title: t("lang.confirmTitle"), text: t("lang.confirmText"), stay: t("reset.cancel"), leave: t("lang.confirmYes") });
      if (!sure) {
        row.querySelector(`input[value="${CekLang.lang}"]`).checked = true;
        return;
      }
    }
    CekLang.choose(value);
  }

  function langPanel() {
    const canSave = Boolean(CekUI.getStorage());
    const note = canSave ? t("settings.langNote") : t("settings.langBlocked");
    const row = choiceRow(t("settings.langTitle"), note, CekLang.CHOICES, CekLang.lang, (value) => chooseLanguage(value, row));
    if (!canSave) row.disabled = true; // fieldset: semua pilihan di dalamnya ikut nonaktif
    return [row];
  }

  const TABS = [
    { id: "general", label: "settings.general", icon: "sliders", build: generalPanel },
    { id: "look", label: "settings.appearance", icon: "palette", build: lookPanel },
    { id: "lang", label: "settings.language", icon: "globe", build: langPanel }
  ];

  // Menu samping sebagai tab: panah atas/bawah (atau kiri/kanan) berpindah tab, Home/End ke ujung.
  function buildDialog() {
    const { el, icon } = CekUI;
    const tabs = TABS.map((tab) => el("button", {
      type: "button", role: "tab", className: "settings-tab", id: `set-tab-${tab.id}`, "aria-controls": `set-panel-${tab.id}`
    }, [icon(tab.icon), el("span", { text: t(tab.label) })]));
    const panels = TABS.map((tab) => el("section", {
      className: "settings-panel", role: "tabpanel", id: `set-panel-${tab.id}`, "aria-labelledby": `set-tab-${tab.id}`
    }, [el("h3", { className: "settings-panel-title", text: t(tab.label) }), ...tab.build()]));

    const select = (index, focus) => {
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, i) => tab.addEventListener("click", () => select(i)));
    const KEYS = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    const tablist = el("div", { className: "settings-tabs", role: "tablist", "aria-label": t("settings.title") }, tabs);
    const narrow = window.matchMedia("(max-width: 640px)"); // sama dengan css/dialog.css
    const orient = () => tablist.setAttribute("aria-orientation", narrow.matches ? "horizontal" : "vertical");
    orient();
    narrow.addEventListener("change", orient);
    tablist.addEventListener("keydown", (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      let next = null;
      if (event.key in KEYS) next = (current + KEYS[event.key] + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      select(next, true);
    });
    select(0, false);

    const close = el("button", { type: "button", className: "icon-btn settings-close", "aria-label": t("settings.close") }, icon("cross"));
    const dialog = el("dialog", { className: "settings-dialog", "aria-labelledby": "settings-title" },
      el("div", { className: "settings-shell" }, [
        el("nav", { className: "settings-side" }, [el("h2", { id: "settings-title", text: t("settings.title") }), tablist]),
        el("div", { className: "settings-main" }, [close, ...panels])
      ]));
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog && CekUI.settled(dialog)) dialog.close(); }); // ketuk latar gelap
    return dialog;
  }

  // Tombol roda gigi di bar atas setiap halaman.
  function mount() {
    const bar = document.querySelector(".topbar, .lesson-top");
    if (!bar) return;
    const { el, icon } = CekUI;
    const button = el("button", { type: "button", className: "icon-btn settings-btn", "aria-label": t("settings.title"), "aria-haspopup": "dialog" }, icon("gear"));
    let dialog = null;
    button.addEventListener("click", () => {
      dialog = dialog || buildDialog();
      document.body.append(dialog);
      CekUI.openModal(dialog);
    });
    bar.append(button);
  }

  function reducedMotion() {
    const motion = pref("motion");
    return motion === "reduce" || (motion === "auto" && reducedMedia.matches);
  }

  apply();
  darkMedia.addEventListener("change", apply);
  document.addEventListener("DOMContentLoaded", mount);
  return {
    reducedMotion,
    confettiOn: () => pref("confetti") === "on",
    voiceRate: () => VOICE_RATE[pref("voice")],
    quickSeconds: () => Number(pref("quick"))
  };
})();
