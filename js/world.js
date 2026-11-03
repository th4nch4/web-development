// Dunia bertema per bagian di peta beranda, seperti peta level di game: langit dan kota di atas,
// hiasan kartun di sisi kosong jalur, dan jalan berliku yang menghubungkan setiap level.
// Dunia 1 "Kota Paket" (kurir, paket, surat), Dunia 2 "Benteng Kode" (malam, brankas, kunci, OTP).
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
      <path d="M14 23h.1M22 23h.1M30 23h.1" fill="none" stroke="${C.french}" stroke-width="4"/>`
  };

  // Urutan hiasan di sisi jalur, bergiliran per level.
  const WORLD_PROPS = {
    1: ["envelope", "tree", "van", "mailbox", "box", "house", "bush"],
    2: ["safe", "bubbles", "key", "phone", "shield", "padlock"]
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

  const sparkle = (x, y, r, color) => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}z" fill="${color}"/>`;
  const cloud = (x, y) => `<path d="M${x} ${y}a9 9 0 0 1 16-6 11 11 0 0 1 20 2 7 7 0 0 1 2 14H${x + 2}a5 5 0 0 1-2-10z" fill="${C.seashell}"/>`;
  // Bukit depan berwarna sama dengan tanah, supaya kota menyatu dengan jalur di bawahnya.
  const hill = '<path class="w-ground" d="M0 106Q100 90 200 104T400 100V121H0z"/>';

  const HORIZONS = {
    1: () => `<circle cx="338" cy="34" r="17" fill="${C.wheat}"/>${cloud(40, 30)}${cloud(250, 18)}
      ${building(8, 44, 62, C.french, C.seashell)}${building(56, 30, 44, C.violet, C.wheat)}${building(92, 52, 78, C.french, C.seashell)}
      ${building(232, 40, 52, C.violet, C.wheat)}${building(276, 58, 70, C.french, C.seashell)}${building(340, 50, 46, C.violet, C.wheat)}${hill}`,
    2: () => `<circle cx="336" cy="32" r="17" fill="${C.wheat}"/><circle cx="345" cy="26" r="15" fill="${C.french}"/>
      ${sparkle(40, 24, 6, C.wheat)}${sparkle(120, 40, 4, C.seashell)}${sparkle(200, 18, 5, C.wheat)}${sparkle(280, 46, 4, C.seashell)}${sparkle(378, 70, 5, C.wheat)}
      ${tower(14, 40, 64)}${tower(60, 30, 44)}${tower(250, 34, 50)}${tower(292, 48, 76)}${tower(348, 36, 52)}${hill}`
  };

  /** Langit dan kota di bagian atas dunia. */
  function sky(unitId) {
    const art = HORIZONS[unitId] ? HORIZONS[unitId]() : "";
    return el("div", { className: "world-sky", "aria-hidden": "true",
      html: `<svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice">${art}</svg>` });
  }

  /**
   * Hiasan di sisi kosong sebuah level: kalau level bergeser ke kanan, hiasan di kiri (dan sebaliknya).
   * @param {number} unitId  @param {number} index urutan level di dunia  @param {number} x geseran level (px)
   */
  function prop(unitId, index, x) {
    const names = WORLD_PROPS[unitId] || WORLD_PROPS[1];
    const side = x > 0 ? -1 : x < 0 ? 1 : (index % 2 ? 1 : -1);
    return el("span", { className: "world-prop", style: `--side: ${side}`, "aria-hidden": "true",
      html: `<svg viewBox="0 0 64 64"><g ${OUTLINE}>${PROPS[names[index % names.length]]}</g></svg>` });
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

  /** Halaman level (pelajaran, Ronde Kilat): latar ikut warna dunianya, hiasan dunia di pinggir layar lebar. */
  function decoratePage(unitId) {
    const names = WORLD_PROPS[unitId];
    if (!names) return;
    document.body.classList.add("world-page", `world-${unitId}`);
    document.body.append(el("div", { className: "world-side", "aria-hidden": "true" },
      names.slice(0, 4).map((_, i) => prop(unitId, i, 0))));
  }

  return { sky, prop, mountRoads, decoratePage };
})();
