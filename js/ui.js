// Bantuan tampilan yang dipakai semua halaman: membuat elemen, ikon, Coach Wall, lembar hasil, dialog, streak, penyimpanan.
// Butuh js/coach.js (gambar Coach Wall) dan js/settings.js (pilihan konfeti).
const CekUI = (() => {
  /**
   * Membuat elemen. Teks selalu lewat textContent, jadi aman dari HTML sisipan.
   * props: className, text, html (khusus SVG milik kita sendiri), onClick, dan atribut lain.
   */
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
      else node.setAttribute(key, value === true ? "" : value);
    });
    [].concat(children).forEach((child) => {
      if (child === undefined || child === null || child === false) return;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return node;
  }

  const ICONS = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.5"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor"/>',
    trophy: '<path d="M7 4h10v4a5 5 0 0 1-10 0z" fill="currentColor"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 13h4v3h-4zM8 18h8v2.5H8z" fill="currentColor"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor"/>',
    // Ikon level di peta beranda (nama sama dengan field icon di js/scenarios.js). Isi penuh, lubang lewat evenodd.
    invite: '<path fill="currentColor" fill-rule="evenodd" d="M5 5h14a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 19 19H5a2.5 2.5 0 0 1-2.5-2.5v-9A2.5 2.5 0 0 1 5 5zM12 16.5l-3.4-3.2a2.1 2.1 0 0 1 3.4-2.4 2.1 2.1 0 0 1 3.4 2.4z"/>',
    truck: '<path fill="currentColor" fill-rule="evenodd" d="M1.5 5.5h12.5v10H1.5zM15 8.5h4l3 3.5v3.5h-7zM16.6 10v2.3h3.6L18.3 10z"/><circle cx="6" cy="17.5" r="2.4" fill="currentColor"/><circle cx="18" cy="17.5" r="2.4" fill="currentColor"/>',
    box: '<path fill="currentColor" d="M12 2.5l8.5 4.3L12 11 3.5 6.8zM2.8 8.3l8.3 4.1V21.5l-8.3-4.2zM21.2 8.3l-8.3 4.1V21.5l8.3-4.2z"/>',
    bank: '<path fill="currentColor" d="M12 2.5l9.5 5.5h-19zM4 9.5h3v7.5H4zM10.5 9.5h3v7.5h-3zM17 9.5h3v7.5h-3zM2.5 18.5h19v3h-19z"/>',
    chat: '<path fill="currentColor" fill-rule="evenodd" d="M5 3.5h14A2.5 2.5 0 0 1 21.5 6v8a2.5 2.5 0 0 1-2.5 2.5h-8l-5 4.5v-4.5H5A2.5 2.5 0 0 1 2.5 14V6A2.5 2.5 0 0 1 5 3.5zM6.6 10a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 1 0-2.8 0zM10.6 10a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 1 0-2.8 0zM14.6 10a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 1 0-2.8 0z"/>',
    key: '<path fill="currentColor" fill-rule="evenodd" d="M2 12a6 6 0 0 1 11.6-2.2h8.4v4.4h-2v3.3h-3v-3.3h-1.5v2.3h-3v-2.3h-.9A6 6 0 0 1 2 12zM5.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0z"/>',
    // Garis, satu ketebalan: ikon 5 Pertanyaan Sebelum Klik (id sama dengan QUESTIONS) dan bantuan.
    siapa: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20.5a7 7 0 0 1 14 0"/></g>',
    link: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></g>',
    file: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></g>',
    buru: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2.5 2M10 2.5h4"/></g>',
    minta: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15.5" r="4.5"/><path d="M11.2 12.3L20 3.5M16.5 7l3 3M14.5 9l2 2"/></g>',
    lens: '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></g>',
    alert: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5v.1"/></g>',
    phone: '<path d="M6.5 3.5h3l1.5 4.5-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
    // Ikon kecil untuk HP simulasi (status bar iPhone dan aplikasi chat).
    chevron: '<path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    video: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="M15.5 10.5l6-3.5v10l-6-3.5z"/></g>',
    plus: '<path d="M12 4v16M4 12h16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    camera: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13.5" r="3.8"/></g>',
    mic: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></g>',
    sticker: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-8-8h8z"/><path d="M8.5 14.5a4 4 0 0 0 7 0"/></g>',
    signal: '<g fill="currentColor"><rect x="2" y="15" width="3.5" height="5" rx="1"/><rect x="7.5" y="11.5" width="3.5" height="8.5" rx="1"/><rect x="13" y="8" width="3.5" height="12" rx="1"/><rect x="18.5" y="4" width="3.5" height="16" rx="1"/></g>',
    wifi: '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2.5 9a14 14 0 0 1 19 0M6 12.5a9 9 0 0 1 12 0M9.5 16a4 4 0 0 1 5 0"/></g><circle cx="12" cy="19.2" r="1.6" fill="currentColor"/>',
    // Lembar hasil, layar selesai, streak, soal suara, dan pengaturan.
    cross: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    half: '<circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M12 4.5a7.5 7.5 0 0 1 0 15z" fill="currentColor"/>',
    target: '<g fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.8"/></g><circle cx="12" cy="12" r="1.8" fill="currentColor"/>',
    shield: '<g fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.8l7.5 2.7v6c0 5-3.3 8.6-7.5 10.2-4.2-1.6-7.5-5.2-7.5-10.2v-6z"/><path d="M8.4 12.2l2.5 2.5 4.8-4.9"/></g>',
    fire: '<path class="fire-outer" fill="currentColor" d="M12 1.8c.7 3.2 2.7 5 4.5 6.9 1.9 2 3.2 4.2 3.2 6.9A7.7 7.7 0 0 1 12 23.3a7.7 7.7 0 0 1-7.7-7.7c0-3 1.5-5.3 3.2-6.8.3 1.8 1.1 3 2.4 3.7-.3-4.2.5-7.8 2.1-10.7z"/><path class="fire-inner" fill="currentColor" d="M12 12.3c1.7 1.9 3.8 3.4 3.8 5.9a3.8 3.8 0 0 1-7.6 0c0-2 1.3-3.3 2.3-4.4.3.8.8 1.4 1.5 1.6z"/>',
    hook: '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="14.5" cy="4" r="2"/><path d="M14.5 6v9.5a5 5 0 0 1-10 0V12l3 3"/></g>',
    speaker: '<path d="M3.5 9.2h3.8L12 5v14l-4.7-4.2H3.5z" fill="currentColor"/><path d="M15.5 8.8a4.5 4.5 0 0 1 0 6.4M18.3 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>',
    turtle: '<path d="M4 15.5a7.5 6.6 0 0 1 15 0z" fill="currentColor"/><circle cx="20.6" cy="13.4" r="2.1" fill="currentColor"/><path d="M6.5 16.5v2.6M16.5 16.5v2.6M2.5 15.5h19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    sliders: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h9M18 7h2M4 17h3M12 17h8"/><circle cx="15.5" cy="7" r="2.5"/><circle cx="9.5" cy="17" r="2.5"/></g>',
    palette: '<path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-.9 2-1.9 0-1.4-1.2-1.7-1.2-3.1 0-1 .9-1.6 2-1.6H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="7.6" cy="11.4" r="1.5" fill="currentColor"/><circle cx="10.4" cy="7.4" r="1.5" fill="currentColor"/><circle cx="15" cy="7.6" r="1.5" fill="currentColor"/>',
    globe: '<g fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/></g>',
    monitor: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="4" width="18" height="12.5" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/></g>',
    sun: '<circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor"/>',
    trash: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5h16M9.5 6.5V4h5v2.5M6.5 6.5l1 14h9l1-14M10 10.5v6M14 10.5v6"/></g>',
    // Roda gigi dari Feather Icons (lisensi MIT).
    gear: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></g>',
    home: '<path d="M3.5 11.5L12 4l8.5 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10.5V20h4.5v-5h3v5H18v-9.5" fill="currentColor"/>'
  };

  function icon(name) {
    return el("span", { className: `icon icon-${name}`, "aria-hidden": "true", html: `<svg viewBox="0 0 24 24">${ICONS[name]}</svg>` });
  }

  // Ikon pertanyaan di dalam lingkaran berwarna; dipakai di beranda, simulator, rapor, dan "Lagi Ragu?".
  function questionIcon(id) {
    return el("span", { className: `q-icon q-icon-${id}`, "aria-hidden": "true" }, icon(id));
  }

  /**
   * Coach Wall (gambar dari js/coach.js) dalam satu suasana hati. Hanya hiasan untuk pembaca layar.
   * mood: happy | think | sus | cheer | love | sad | oops | close | teach
   */
  function mascot(mood = "happy") {
    return el("span", { className: `mascot mascot-${mood}`, "aria-hidden": "true", html: CekCoach.svg(mood) });
  }

  const TIP_MS = 3200;

  /**
   * Coach Wall yang bisa diketuk: membal, lalu memberi satu tips (bergiliran) di gelembung di atasnya.
   * tipsKey: daftar tips di js/strings.js. Tipsnya umum, tidak pernah membocorkan jawaban soal.
   */
  function coach(mood, tipsKey) {
    const tips = CekLang.list(tipsKey);
    const bubble = el("span", { className: "coach-tip", role: "status" });
    let shown = 0;
    let hideTimer = null;
    const button = el("button", { type: "button", className: "coach-btn", "aria-label": CekLang.t("coach.tap") }, mascot(mood));
    button.addEventListener("click", () => {
      bubble.textContent = tips[shown % tips.length];
      shown += 1;
      const face = button.querySelector(".mascot");
      face.classList.remove("is-poked");
      void face.offsetWidth; // mulai ulang animasi membal
      face.classList.add("is-poked");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => { bubble.textContent = ""; }, TIP_MS);
    });
    return el("span", { className: "coach-wrap" }, [button, bubble]);
  }

  // Hiasan perayaan: potongan kertas yang jatuh. Bisa dimatikan di Pengaturan; disembunyikan kalau gerak dikurangi.
  function confetti() {
    if (!CekSettings.confettiOn()) return null;
    const colors = ["var(--green)", "var(--yellow)", "var(--fire-blue)", "var(--fire-pink)", "var(--french)", "var(--wheat)"];
    return el("div", { className: "confetti", "aria-hidden": "true" }, Array.from({ length: 36 }, (_, i) => el("i", {
      style: `left:${(i * 37) % 100}%;background:${colors[i % colors.length]};animation-delay:${(i % 9) * 0.11}s;--spin:${(i % 5) * 90}deg`
    })));
  }

  /**
   * Ekspresi Coach Wall setelah pemain menjawab.
   * tone: "good" (benar), "partial" (hampir: sebagian benar di soal pilih banyak), "bad" (salah).
   */
  function reaction(tone, streak = 0) {
    if (tone === "partial") return "close";
    if (tone !== "good") return "sad";
    return streak >= 3 ? "love" : "cheer";
  }

  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const TONE = {
    good: { cheers: "feedback.cheers", icon: "check" },
    partial: { cheers: "feedback.close", icon: "half" },
    bad: { cheers: "feedback.oops", icon: "cross" }
  };

  /**
   * Isi lembar hasil ala Duolingo: Coach Wall bereaksi, seruan (+XP, combo), judul hasil, satu kalimat penjelasan.
   * cheer: celetukan khusus; kosong = seruan acak. mood: paksa ekspresi tertentu (mis. "oops" saat waktu habis).
   */
  function feedback({ tone, heading, text, cheer = "", xp = 0, streak = 0, mood = reaction(tone, streak) }) {
    const t = CekLang.t;
    const look = TONE[tone] || TONE.bad;
    return [
      mascot(mood),
      el("div", { className: "feedback-body" }, [
        el("p", { className: cheer ? "feedback-cheer is-quip" : "feedback-cheer" }, [
          cheer || pick(CekLang.list(look.cheers)),
          tone === "good" && xp > 0 && el("span", { className: "xp-pop", text: `+${xp} XP` }),
          tone === "good" && streak >= 2 && el("span", { className: "combo" }, [icon("fire"), t("feedback.combo", { n: streak })])
        ]),
        el("h2", {}, [icon(look.icon), heading]),
        el("p", { text })
      ])
    ];
  }

  function xpChip(xp) {
    return el("span", { className: "xp-chip", "aria-label": `${xp} XP` }, [icon("bolt"), `${xp} XP`]);
  }

  /** Kotak angka di layar selesai. iconName dan tone (gold, green, blue, orange) opsional. */
  function stat(label, value, iconName, tone) {
    return el("div", { className: tone ? `stat stat-${tone}` : "stat" }, [
      el("span", { className: "stat-label", text: label }),
      el("span", { className: "stat-value" }, [iconName && icon(iconName), el("span", { text: value })])
    ]);
  }

  // localStorage bisa melempar error (mode privat, cookie diblokir). null berarti tidak tersedia.
  function getStorage() {
    try {
      const storage = window.localStorage;
      const probe = "__cekdulu_probe__";
      storage.setItem(probe, probe);
      storage.removeItem(probe);
      return storage;
    } catch (error) {
      return null;
    }
  }

  // ---------- Dialog buatan sendiri (pengganti confirm() bawaan browser) ----------

  let dialogCount = 0;
  const SETTLE_MS = 400;

  /** Buka <dialog> dan catat waktunya; ketukan latar baru berlaku setelah SETTLE_MS. */
  function openModal(dialog) {
    dialog.dataset.openedAt = String(performance.now());
    dialog.showModal();
  }

  function settled(dialog) {
    return performance.now() - Number(dialog.dataset.openedAt || 0) > SETTLE_MS;
  }

  /**
   * Jendela tanya di tengah layar memakai <dialog> (fokus terkunci di dalam, Esc menutup).
   * Tombol besar = pilihan aman (stay); tombol teks = pilihan berisiko (leave).
   * @returns {Promise<boolean>} true kalau pemain memilih "leave"
   */
  function ask({ title, text, mood = "sad", stay, leave }) {
    dialogCount += 1;
    const id = `ask-${dialogCount}`;
    const stayButton = el("button", { type: "button", className: "btn", text: stay });
    const leaveButton = el("button", { type: "button", className: "btn-text-danger", text: leave });
    const dialog = el("dialog", { className: "cek-dialog", "aria-labelledby": `${id}-title`, "aria-describedby": `${id}-text` },
      el("div", { className: "cek-dialog-body" }, [
        mascot(mood),
        el("h2", { id: `${id}-title`, text: title }),
        el("p", { id: `${id}-text`, text }),
        el("div", { className: "cek-dialog-actions" }, [stayButton, leaveButton])
      ]));
    stayButton.addEventListener("click", () => dialog.close("stay"));
    leaveButton.addEventListener("click", () => dialog.close("leave"));
    // Ketukan di luar kotak (latar gelap) = batal, kecuali tepat setelah dibuka
    // (klik kedua dari klik ganda di tombol X jangan langsung menutupnya).
    dialog.addEventListener("click", (event) => { if (event.target === dialog && settled(dialog)) dialog.close("stay"); });
    return new Promise((resolve) => {
      dialog.addEventListener("close", () => {
        dialog.remove();
        resolve(dialog.returnValue === "leave");
      }, { once: true });
      document.body.append(dialog);
      openModal(dialog);
      stayButton.focus();
    });
  }

  let sessionActive = () => false;

  /** Tombol X di bar atas halaman soal: tanya dulu lewat dialog kalau sesinya masih berjalan. */
  function guardExit(isActive) {
    sessionActive = isActive;
    const link = document.querySelector(".lesson-top a.icon-btn");
    if (!link) return;
    link.addEventListener("click", (event) => {
      if (!isActive()) return;
      event.preventDefault();
      const t = CekLang.t;
      ask({ mood: "sad", title: t("exit.title"), text: t("exit.text"), stay: t("exit.stay"), leave: t("exit.leave") })
        .then((leave) => { if (leave) location.href = link.href; });
    });
  }

  // ---------- Streak: jawaban benar beruntun, ditampilkan sebagai api di bar atas ----------
  // Disimpan terpisah dari progres supaya tetap jalan antar pelajaran, materi, dan Ronde Kilat.

  const STREAK_KEY = "cekdulu.streak";
  let memoryStreak = 0; // cadangan kalau penyimpanan diblokir

  function streakValue() {
    try {
      const value = Number.parseInt(window.localStorage.getItem(STREAK_KEY), 10);
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch (error) {
      return memoryStreak;
    }
  }

  function saveStreak(value) {
    memoryStreak = value;
    try {
      if (value > 0) window.localStorage.setItem(STREAK_KEY, String(value));
      else window.localStorage.removeItem(STREAK_KEY);
    } catch (error) {
      // Penyimpanan diblokir: streak hanya berlaku selama halaman terbuka.
    }
  }

  // 1-2 oranye, 3-4 biru, 5 ke atas pink, 0 abu-abu.
  function streakTier(value) {
    if (value >= 5) return "pink";
    if (value >= 3) return "blue";
    return value >= 1 ? "orange" : "off";
  }

  function renderStreak(value, effect) {
    const slot = document.getElementById("streak");
    if (!slot) return;
    const chip = el("span", {
      className: `streak streak-${streakTier(value)}${effect ? ` ${effect}` : ""}`,
      role: "img",
      "aria-label": CekLang.t("streak.label", { n: value })
    }, [icon("fire"), el("span", { text: String(value) })]);
    slot.replaceChildren(chip);
  }

  /** Catat satu jawaban: benar menambah streak, salah atau hampir mengembalikannya ke 0. */
  function recordStreak(isRight) {
    const before = streakValue();
    const value = isRight ? before + 1 : 0;
    saveStreak(value);
    const levelUp = value > before && streakTier(value) !== streakTier(before);
    renderStreak(value, levelUp ? "is-levelup" : value > 0 ? "is-bump" : "");
    return value;
  }

  function resetStreak() {
    saveStreak(0);
    renderStreak(0);
  }

  document.addEventListener("DOMContentLoaded", () => renderStreak(streakValue()));

  return {
    el, icon, questionIcon, mascot, coach, reaction, feedback, confetti, xpChip, stat, getStorage,
    ask, openModal, settled, guardExit, isSessionActive: () => sessionActive(), streakValue, recordStreak, resetStreak
  };
})();
