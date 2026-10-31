// Bantuan tampilan yang dipakai semua halaman: membuat elemen, ikon, maskot, penyimpanan.
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
    // Garis, satu ketebalan: ikon 5 Pertanyaan Sebelum Klik (id sama dengan QUESTIONS) dan bantuan.
    siapa: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20.5a7 7 0 0 1 14 0"/></g>',
    link: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></g>',
    file: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></g>',
    buru: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2.5 2M10 2.5h4"/></g>',
    minta: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15.5" r="4.5"/><path d="M11.2 12.3L20 3.5M16.5 7l3 3M14.5 9l2 2"/></g>',
    lens: '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></g>',
    close: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
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
    wifi: '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2.5 9a14 14 0 0 1 19 0M6 12.5a9 9 0 0 1 12 0M9.5 16a4 4 0 0 1 5 0"/></g><circle cx="12" cy="19.2" r="1.6" fill="currentColor"/>'
  };

  function icon(name) {
    return el("span", { className: `icon icon-${name}`, "aria-hidden": "true", html: `<svg viewBox="0 0 24 24">${ICONS[name]}</svg>` });
  }

  // Ikon pertanyaan di dalam lingkaran berwarna; dipakai di beranda, simulator, rapor, dan "Lagi Ragu?".
  function questionIcon(id) {
    return el("span", { className: `q-icon q-icon-${id}`, "aria-hidden": "true" }, icon(id));
  }

  // Maskot "Lupi" si kaca pembesar. mood: happy | think | oops
  const MOUTHS = {
    happy: '<path d="M43 60q9 10 18 0" fill="none" stroke="#3D1534" stroke-width="4" stroke-linecap="round"/>',
    think: '<path d="M45 63h14" fill="none" stroke="#3D1534" stroke-width="4" stroke-linecap="round"/>',
    oops: '<ellipse cx="52" cy="63" rx="4.5" ry="5.5" fill="#3D1534"/>'
  };

  function mascot(mood = "happy") {
    const svg = `<svg viewBox="0 0 120 120">
      <line x1="82" y1="82" x2="108" y2="108" fill="none" stroke="currentColor" stroke-width="15" stroke-linecap="round"/>
      <circle cx="52" cy="52" r="42" fill="#3E4B8E"/>
      <circle cx="52" cy="52" r="32" fill="#FFF4EB"/>
      <path d="M30 38a26 26 0 0 1 14-13" fill="none" stroke="#A6BCC9" stroke-width="5" stroke-linecap="round"/>
      <circle cx="40" cy="48" r="5" fill="#3D1534"/>
      <circle cx="64" cy="48" r="5" fill="#3D1534"/>
      <circle cx="33" cy="59" r="4" fill="#F6E0B6"/>
      <circle cx="71" cy="59" r="4" fill="#F6E0B6"/>
      ${MOUTHS[mood] || MOUTHS.happy}
    </svg>`;
    return el("span", { className: `mascot mascot-${mood}`, "aria-hidden": "true", html: svg });
  }

  function renderCoach(container, text, mood) {
    container.replaceChildren(
      el("div", { className: "coach" }, [mascot(mood), el("p", { className: "coach-bubble", text })])
    );
  }

  function xpChip(xp) {
    return el("span", { className: "xp-chip", "aria-label": `${xp} XP` }, [icon("bolt"), `${xp} XP`]);
  }

  function stat(label, value) {
    return el("div", { className: "stat" }, [
      el("span", { className: "stat-label", text: label }),
      el("span", { className: "stat-value", text: value })
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

  return { el, icon, questionIcon, mascot, renderCoach, xpChip, stat, getStorage };
})();
