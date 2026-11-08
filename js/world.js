// Dunia bertema per bagian di peta beranda, seperti peta level di game: langit dan kota di atas,
// hiasan kartun di sisi kosong jalur, dan jalan berliku yang menghubungkan setiap level.
// Dunia 1 "Kota Paket" (kurir, paket, surat), Dunia 2 "Benteng Kode" (malam, brankas, kunci, OTP),
// Dunia 3 "Teluk Phishing" (laut, perahu pemancing, kail berumpan surat): materi jenis-jenis phishing.
// Hanya warna palet. Warna tanah, langit, dan jalan diatur CSS (ikut mode gelap); hiasan memakai warna tetap.
const CekWorld = (() => {
  const { el } = CekUI;
  const C = { french: "#3E4B8E", violet: "#3D1534", seashell: "#FFF4EB", wheat: "#F6E0B6", powder: "#A6BCC9" };
  const OUTLINE = `stroke="${C.violet}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;

  // Hiasan 64x64 bergaya stiker: isi rata + garis tepi violet.
  const PROPS = {
    box: `<path d="M14 26l18-9 18 9v20l-18 9-18-9z" fill="${C.wheat}"/><path d="M14 26l18-9 18 9-18 9z" fill="${C.seashell}"/>
      <path d="M23 21.5l18 9v8" fill="none" stroke="${C.powder}" stroke-width="5"/><path d="M14 26l18 9 18-9M32 35v20" fill="none"/>`,
    mailbox: `<path d="M30 38h5v20h-5z" fill="${C.french}"/><path d="M18 26a9 9 0 0 1 9-9h13a9 9 0 0 1 9 9v15H18z" fill="${C.french}"/>
      <path d="M18 26a7 7 0 0 1 14 0v15H18z" fill="${C.powder}"/><path d="M42 26V10h9v6h-9" fill="${C.wheat}"/>`,
    tree: `<path d="M29 38h6v20h-6z" fill="${C.french}"/><circle cx="21" cy="34" r="10" fill="${C.powder}"/>
      <circle cx="43" cy="34" r="10" fill="${C.powder}"/><circle cx="32" cy="25" r="15" fill="${C.powder}"/>
      <circle cx="26" cy="20" r="3.5" fill="${C.seashell}" stroke="none"/>`,
    van: `<path d="M5 26h33v22H5z" fill="${C.seashell}"/><path d="M38 32h12l9 9v7H38z" fill="${C.seashell}"/>
      <path d="M41 35h8l6 6H41z" fill="${C.powder}"/><path d="M13 31h14v12H13z" fill="${C.wheat}"/><path d="M13 37h14M20 31v12" fill="none"/>
      <circle cx="16" cy="50" r="5.5" fill="${C.violet}"/><circle cx="47" cy="50" r="5.5" fill="${C.violet}"/>
      <circle cx="16" cy="50" r="2" fill="${C.seashell}" stroke="none"/><circle cx="47" cy="50" r="2" fill="${C.seashell}" stroke="none"/>`,
    house: `<path d="M15 32h34v24H15z" fill="${C.seashell}"/><path d="M9 35l23-19 23 19z" fill="${C.french}"/>
      <path d="M28 42h8v14h-8z" fill="${C.wheat}"/><path d="M19 38h6v6h-6zM39 38h6v6h-6z" fill="${C.powder}"/>`,
    envelope: `<g transform="rotate(-10 32 36)"><path d="M11 22h42v28H11z" fill="${C.seashell}"/><path d="M11 22l21 16 21-16" fill="none"/>
      <path d="M32 48l-5.5-5a3.2 3.2 0 0 1 5.5-3.9 3.2 3.2 0 0 1 5.5 3.9z" fill="${C.french}"/></g>`,
    bush: `<path d="M7 54a10 10 0 0 1 13-13 13 13 0 0 1 24 0 10 10 0 0 1 13 13z" fill="${C.powder}"/>
      <circle cx="22" cy="46" r="3" fill="${C.seashell}"/><circle cx="34" cy="40" r="3" fill="${C.wheat}"/><circle cx="45" cy="47" r="3" fill="${C.seashell}"/>`,
    safe: `<rect x="11" y="13" width="42" height="40" rx="5" fill="${C.french}"/><rect x="17" y="19" width="30" height="28" rx="3" fill="${C.powder}"/>
      <circle cx="30" cy="33" r="8" fill="${C.seashell}"/><path d="M30 27v3M30 36v3M24 33h3M33 33h3M42 29v8" fill="none"/>
      <path d="M15 53v4M49 53v4" fill="none" stroke-width="4"/>`,
    key: `<g transform="translate(2 8) scale(2.5)"><path fill="${C.wheat}" stroke="${C.violet}" stroke-width="1" stroke-linejoin="round" fill-rule="evenodd"
      d="M2 12a6 6 0 0 1 11.6-2.2h8.4v4.4h-2v3.3h-3v-3.3h-1.5v2.3h-3v-2.3h-.9A6 6 0 0 1 2 12zM5.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0z"/></g>`,
    shield: `<path d="M32 7l21 7v15c0 14-9 22-21 27-12-5-21-13-21-27V14z" fill="${C.powder}"/>
      <path d="M22 31l7 7 13-14" fill="none" stroke="${C.french}" stroke-width="5"/>`,
    phone: `<rect x="18" y="5" width="28" height="52" rx="6" fill="${C.violet}"/><rect x="21.5" y="11" width="21" height="38" rx="2" fill="${C.seashell}"/>
      <rect x="24.5" y="18" width="15" height="10" rx="3" fill="${C.powder}"/><rect x="24.5" y="32" width="11" height="8" rx="3" fill="${C.wheat}"/>
      <path d="M28 23h.1M32 23h.1M36 23h.1" fill="none" stroke="${C.french}" stroke-width="3"/>`,
    padlock: `<path d="M22 30v-8a10 10 0 0 1 20 0v8" fill="none" stroke-width="10"/><path d="M22 30v-8a10 10 0 0 1 20 0v8" fill="none" stroke="${C.powder}" stroke-width="5"/>
      <rect x="15" y="28" width="34" height="27" rx="6" fill="${C.wheat}"/><circle cx="32" cy="39" r="4" fill="${C.violet}"/><path d="M32 41v7" fill="none" stroke-width="4"/>`,
    bubbles: `<path d="M8 12h28a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5H19l-7 6v-6H8a5 5 0 0 1-5-5V17a5 5 0 0 1 5-5z" fill="${C.powder}"/>
      <path d="M30 38h24a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5h-2v5l-6-5H30a5 5 0 0 1-5-5v-7a5 5 0 0 1 5-5z" fill="${C.wheat}"/>
      <path d="M14 23h.1M22 23h.1M30 23h.1" fill="none" stroke="${C.french}" stroke-width="4"/>`,
    fish: `<path d="M8 32c8-12 26-14 38 0-12 14-30 12-38 0z" fill="${C.powder}"/><path d="M46 32l12-10v20z" fill="${C.french}"/>
      <path d="M22 24c2 6 2 10 0 16" fill="none"/><circle cx="16" cy="30" r="2.6" fill="${C.violet}" stroke="none"/>`,
    hook: `<path d="M38 4v30a12 12 0 0 1-24 0v-6l7 6" fill="none" stroke-width="4"/><circle cx="38" cy="6" r="3.5" fill="${C.wheat}"/>
      <g transform="rotate(-12 24 40)"><path d="M14 34h20v14H14z" fill="${C.seashell}"/><path d="M14 34l10 8 10-8" fill="none"/></g>`,
    buoy: `<circle cx="32" cy="32" r="21" fill="${C.seashell}"/><circle cx="32" cy="32" r="9" fill="${C.powder}"/>
      <path d="M17 17l8 8M47 17l-8 8M17 47l8-8M47 47l-8-8" fill="none" stroke="${C.french}" stroke-width="7"/>
      <circle cx="32" cy="32" r="21" fill="none"/><circle cx="32" cy="32" r="9" fill="none"/>`,
    anchor: `<circle cx="32" cy="12" r="5" fill="${C.wheat}"/><path d="M32 17v38M22 26h20" fill="none" stroke-width="5"/>
      <path d="M12 38c2 12 12 17 20 17s18-5 20-17l-6 4M12 38l6 4" fill="none" stroke-width="5"/>`,
    bottle: `<g transform="rotate(-30 32 32)"><path d="M26 8h12v8l6 6v32a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V22l6-6z" fill="${C.powder}"/>
      <path d="M26 4h12v6H26z" fill="${C.wheat}"/><path d="M25 30h14v16H25z" fill="${C.seashell}"/><path d="M28 35h8M28 40h6" fill="none"/></g>`,
    boat: `<path d="M8 40h48l-8 12H16z" fill="${C.wheat}"/><path d="M32 8v32" fill="none"/><path d="M32 10l16 26H32z" fill="${C.seashell}"/>
      <path d="M32 14L18 36h14z" fill="${C.powder}"/><path d="M50 40l8-30M58 10q4 14 2 22" fill="none" stroke-width="2"/>`
  };

  // Urutan hiasan di sisi jalur, bergiliran per level.
  const WORLD_PROPS = {
    1: ["envelope", "tree", "van", "mailbox", "box", "house", "bush"],
    2: ["safe", "bubbles", "key", "phone", "shield", "padlock"],
    3: ["fish", "hook", "buoy", "bottle", "anchor", "boat"]
  };

  // Gedung kota (Dunia 1): kotak dengan jendela berderet.
  function building(x, w, h, body, glass) {
    const top = 120 - h;
    const windows = [];
    for (let wy = top + 8; wy < 108; wy += 13) {
      for (let wx = x + 5; wx + 6 <= x + w - 4; wx += 11) windows.push(`<rect x="${wx}" y="${wy}" width="6" height="7" rx="1.5" fill="${glass}"/>`);
    }
    return `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="3" fill="${body}"/>${windows.join("")}`;
  }

  // Menara benteng (Dunia 2): puncak bergerigi dan satu jendela menyala.
  function tower(x, w, h) {
    const top = 120 - h;
    const merlon = w / 5;
    const teeth = [0, 2, 4].map((i) => `<rect x="${x + i * merlon}" y="${top - 7}" width="${merlon}" height="8" fill="${C.violet}"/>`).join("");
    return `${teeth}<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${C.violet}"/>
      <path d="M${x + w / 2 - 4} ${top + 22}v-5a4 4 0 0 1 8 0v5z" fill="${C.wheat}"/>`;
  }

  // Mercusuar di batu karang (Dunia 3).
  function lighthouse(x) {
    return `<path d="M${x - 16} 78q16-12 32 0v10h-32z" fill="${C.violet}"/>
      <path d="M${x - 7} 72l2-44h10l2 44z" fill="${C.seashell}"/><path d="M${x - 6.4} 44h12.8M${x - 6.8} 58h13.6" stroke="${C.violet}" stroke-width="5"/>
      <path d="M${x - 6} 28h12v-8h-12z" fill="${C.wheat}"/><path d="M${x - 8} 20l8-7 8 7z" fill="${C.violet}"/>`;
  }

  // Perahu pemancing dengan kail berumpan amplop: "phishing" = memancing data.
  function boat(x, y) {
    return `<g class="w-boat"><path d="M${x - 18} ${y}h36l-6 9h-24z" fill="${C.violet}"/><path d="M${x} ${y}v-26" stroke="${C.violet}" stroke-width="2"/>
      <path d="M${x} ${y - 25}l13 21h-13z" fill="${C.seashell}"/><path d="M${x + 14} ${y - 2}l14-22" stroke="${C.violet}" stroke-width="1.8"/>
      <path d="M${x + 28} ${y - 24}q3 14 1 30" fill="none" stroke="${C.seashell}" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M${x + 24} ${y + 6}h9v6h-9zM${x + 24} ${y + 6}l4.5 3 4.5-3" fill="${C.wheat}" stroke="${C.violet}" stroke-width="1"/></g>`;
  }

  // Langit yang hidup (gerakannya di css/world.css): bintang berkelip, awan melayang, burung mengepak.
  const sparkle = (x, y, r, color) => `<path class="w-twinkle" style="animation-delay: -${(x % 7) * 0.4}s"
    d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}z" fill="${color}"/>`;
  const cloud = (x, y) => `<path class="w-cloud" d="M${x} ${y}a9 9 0 0 1 16-6 11 11 0 0 1 20 2 7 7 0 0 1 2 14H${x + 2}a5 5 0 0 1-2-10z" fill="${C.seashell}"/>`;
  const bird = (x, y) => `<path class="w-bird" d="M${x} ${y}q4 -5 8 0q4 -5 8 0" fill="none" stroke="${C.violet}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  // Bukit depan berwarna sama dengan tanah, supaya kota menyatu dengan jalur di bawahnya.
  // Ujung kiri dan kanan setinggi dan semiring sama, jadi kota bisa dideret tanpa sambungan terlihat.
  const hill = '<path class="w-ground" d="M-2 104.3Q100 90 200 104T402 103.7V122H-2z"/>';

  // Tiap dunia: benda langit (sekali saja, di tengah) dan deretan kota (diulang ke samping).
  const HORIZONS = {
    1: {
      sky: () => `<circle class="w-sun" cx="338" cy="34" r="17" fill="${C.wheat}"/>${cloud(40, 30)}${cloud(250, 18)}
        <g class="w-birds">${bird(150, 30)}${bird(172, 22)}${bird(190, 34)}</g>`,
      town: () => `${building(8, 44, 62, C.french, C.seashell)}${building(56, 30, 44, C.violet, C.wheat)}${building(92, 52, 78, C.french, C.seashell)}
        ${building(232, 40, 52, C.violet, C.wheat)}${building(276, 58, 70, C.french, C.seashell)}${building(340, 50, 46, C.violet, C.wheat)}${hill}`
    },
    2: {
      sky: () => `<circle cx="336" cy="32" r="17" fill="${C.wheat}"/><circle cx="345" cy="26" r="15" fill="${C.french}"/>
        ${sparkle(40, 24, 6, C.wheat)}${sparkle(120, 40, 4, C.seashell)}${sparkle(200, 18, 5, C.wheat)}${sparkle(280, 46, 4, C.seashell)}${sparkle(378, 70, 5, C.wheat)}`,
      town: () => `${tower(14, 40, 64)}${tower(60, 30, 44)}${tower(250, 34, 50)}${tower(292, 48, 76)}${tower(348, 36, 52)}${hill}`
    },
    3: {
      sky: () => `<circle class="w-sun" cx="320" cy="58" r="20" fill="${C.wheat}"/>${cloud(60, 26)}${cloud(220, 40)}
        <g class="w-birds">${bird(140, 26)}${bird(160, 18)}</g>`,
      town: () => `<path d="M-2 70H402V122H-2z" fill="${C.french}"/>
        <g class="w-waves" fill="none" stroke="${C.powder}" stroke-width="2.4" stroke-linecap="round">
          <path d="M20 80q6-4 12 0t12 0M130 86q6-4 12 0t12 0M250 79q6-4 12 0t12 0M340 88q6-4 12 0t12 0"/></g>
        ${lighthouse(40)}${boat(170, 68)}${boat(282, 72)}${hill}`
    }
  };
  const TOWN_COPIES = 5; // cukup untuk menutup layar selebar ~2100px

  /** Langit dan kota di bagian atas dunia, selebar layar: kota dideret, benda langit hanya di salinan tengah. */
  function sky(unitId) {
    const horizon = HORIZONS[unitId];
    const middle = Math.floor(TOWN_COPIES / 2);
    const copies = horizon ? Array.from({ length: TOWN_COPIES }, (_, i) =>
      `<svg viewBox="0 0 400 120">${i === middle ? horizon.sky() : ""}${horizon.town()}</svg>`).join("") : "";
    return el("div", { className: "world-sky", "aria-hidden": "true", html: `<div class="world-town">${copies}</div>` });
  }

  // Sisi kosong sebuah level: kalau level bergeser ke kanan, hiasan di kiri (dan sebaliknya).
  const sideOf = (index, x) => (x > 0 ? -1 : x < 0 ? 1 : (index % 2 ? 1 : -1));

  /**
   * Hiasan dunia di sisi kosong sebuah level.
   * @param {number} unitId  @param {number} index urutan level di dunia  @param {number} x geseran level (px)
   */
  function prop(unitId, index, x) {
    const names = WORLD_PROPS[unitId] || WORLD_PROPS[1];
    return el("span", { className: "world-prop", style: `--side: ${sideOf(index, x)}; --i: ${index}`, "aria-hidden": "true",
      html: `<svg viewBox="0 0 64 64"><g ${OUTLINE}>${PROPS[names[index % names.length]]}</g></svg>` });
  }

  /** Coach Wall menunggu di samping level yang sedang dimainkan dan melambai; ketuk dia untuk tips. */
  function coach(index, x) {
    return el("span", { className: "world-prop world-coach", style: `--side: ${sideOf(index, x)}` },
      CekUI.coach("happy", "coach.mapTips"));
  }

  // Jalan berliku lewat titik tengah setiap level. Digambar ulang kalau ukuran dunia berubah.
  function drawRoad(world) {
    const box = world.getBoundingClientRect();
    const points = [...world.querySelectorAll(".path .node")].map((node) => {
      const r = node.getBoundingClientRect();
      return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
    });
    if (points.length < 2) return;
    const d = points.map(([x, y], i) => {
      if (i === 0) return `M${x} ${y}`;
      const [px, py] = points[i - 1];
      const mid = (py + y) / 2;
      return `C${px} ${mid} ${x} ${mid} ${x} ${y}`;
    }).join("");
    world.querySelector(".world-road").innerHTML = `<path class="road" d="${d}"/><path class="road-line" d="${d}"/>`;
  }

  /** Pasang jalan di setiap dunia dan gambar ulang saat ukuran berubah (rotasi HP, font selesai dimuat). */
  function mountRoads(worlds) {
    worlds.forEach((world) => {
      world.prepend(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
      world.firstChild.setAttribute("class", "world-road");
      world.firstChild.setAttribute("aria-hidden", "true");
      drawRoad(world);
    });
    const observer = new ResizeObserver((entries) => entries.forEach((entry) => drawRoad(entry.target)));
    worlds.forEach((world) => observer.observe(world));
  }

  const ENTER_MS = 500;

  /**
   * Transisi masuk level: latar dunia (warna tanah, sama dengan latar halaman level) membesar
   * dari level yang diketuk sampai menutup layar, baru pindah halaman.
   * Dilewati kalau pemain memilih gerakan dikurangi, atau membuka link di tab baru.
   */
  function mountTransitions(worlds) {
    worlds.forEach((world) => world.addEventListener("click", (event) => {
      const link = event.target.closest("a.node");
      if (!link || CekSettings.reducedMotion() || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const r = link.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const theme = [...world.classList].find((name) => /^world-\d+$/.test(name));
      const wipe = el("div", { className: `level-wipe ${theme}`, "aria-hidden": "true" });
      document.body.append(wipe);
      const go = () => location.assign(link.href);
      wipe.animate(
        { clipPath: [`circle(${r.width / 2}px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: ENTER_MS, easing: "cubic-bezier(.6, 0, .4, 1)", fill: "forwards" }
      ).finished.then(go, go);
    }));
    // Kembali lewat tombol Back (halaman dipulihkan dari cache): buang tirai yang masih menutup.
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) document.querySelectorAll(".level-wipe").forEach((wipe) => wipe.remove());
    });
  }

  /** Halaman level (pelajaran, materi, Ronde Kilat): latar polos sewarna tanah dunianya, tanpa hiasan bergerak. */
  function decoratePage(unitId) {
    if (!HORIZONS[unitId]) return;
    document.body.classList.add("world-page", `world-${unitId}`);
  }

  const MATERI_WORLD = 3; // Dunia 3 "Teluk Phishing": materi jenis-jenis phishing

  return { sky, prop, coach, mountRoads, mountTransitions, decoratePage, MATERI_WORLD };
})();
