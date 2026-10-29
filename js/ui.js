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
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor"/>'
  };

  function icon(name) {
    return el("span", { className: `icon icon-${name}`, "aria-hidden": "true", html: `<svg viewBox="0 0 24 24">${ICONS[name]}</svg>` });
  }

  // Maskot "Lupi" si kaca pembesar. mood: happy | think | oops
  const MOUTHS = {
    happy: '<path d="M43 60q9 10 18 0" fill="none" stroke="#1F2937" stroke-width="4" stroke-linecap="round"/>',
    think: '<path d="M45 63h14" fill="none" stroke="#1F2937" stroke-width="4" stroke-linecap="round"/>',
    oops: '<ellipse cx="52" cy="63" rx="4.5" ry="5.5" fill="#1F2937"/>'
  };

  function mascot(mood = "happy") {
    const svg = `<svg viewBox="0 0 120 120">
      <line x1="82" y1="82" x2="108" y2="108" stroke="#7C2D12" stroke-width="15" stroke-linecap="round"/>
      <circle cx="52" cy="52" r="42" fill="#C2410C"/>
      <circle cx="52" cy="52" r="32" fill="#FFF7ED"/>
      <path d="M30 38a26 26 0 0 1 14-13" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
      <circle cx="40" cy="48" r="5" fill="#1F2937"/>
      <circle cx="64" cy="48" r="5" fill="#1F2937"/>
      <circle cx="33" cy="59" r="4" fill="#FDBA74"/>
      <circle cx="71" cy="59" r="4" fill="#FDBA74"/>
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

  return { el, icon, mascot, renderCoach, xpChip, stat, getStorage };
})();
