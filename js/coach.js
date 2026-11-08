// Gambar karakter: Coach Wall (pelatih yang menemani pemain) dan penelepon misterius di soal suara.
// Coach Wall: pelatih muda bertopi baseball berhuruf W ("Wall" = tembok yang melindungimu dari penipu),
// jaket olahraga biru muda, dan peluit. Gerakannya diatur di css/coach.css lewat kelas cw-<pose>.
// Semua gambar SVG milik sendiri (bukan aset pihak lain). Tidak ada teks dari pengguna yang masuk ke sini.
const CekCoach = (() => {
  const C = {
    french: "#3E4B8E", violet: "#3D1534", seashell: "#FFF4EB", wheat: "#F6E0B6", powder: "#A6BCC9",
    skin: "#C98A5E", skinShade: "#A86B42", hair: "#2A1A16", mouth: "#6E2433", tongue: "#E36B6B",
    blush: "#E39070", whistle: "#FFC53D", glass: "#DCE8EF", white: "#FFFFFF", brim: "#2F3A73"
  };
  const LINE = `stroke="${C.violet}" stroke-width="2.2" stroke-linejoin="round"`;

  // Lengan: garis tebal warna jaket dengan tepi violet, tangan bulat warna kulit.
  const sleeve = (d) => `<path d="${d}" fill="none" stroke="${C.violet}" stroke-width="15.5" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="${C.powder}" stroke-width="11" stroke-linecap="round"/>`;
  const hand = (x, y, r = 6.8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.skin}" ${LINE}/>`;
  const finger = (d) => `<path d="${d}" fill="none" stroke="${C.violet}" stroke-width="6.4" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="${C.skin}" stroke-width="3.6" stroke-linecap="round"/>`;
  const armL = (d, x, y) => `<g class="cw-arm-l">${sleeve(d)}${hand(x, y)}</g>`;
  const armR = (inner) => `<g class="cw-arm-r">${inner}</g>`;
  const restL = `<g class="cw-arm-l">${sleeve("M30 100Q24 108 23 119")}</g>`; // lengan kiri santai, tangannya di luar gambar

  // Wajah
  const eye = (x, y = 62, rx = 3.3, ry = 4.3) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.hair}"/>
    <circle cx="${x + 1.2}" cy="${y - 1.7}" r="1.25" fill="${C.white}"/>`;
  const eyes = (dx = 0, dy = 0) => `<g class="cw-look"><g class="cw-eyes">${eye(51 + dx, 62 + dy)}${eye(69 + dx, 62 + dy)}</g></g>`;
  const arcEye = (x) => `<path d="M${x - 4} 63Q${x} 57.5 ${x + 4} 63" fill="none" stroke="${C.hair}" stroke-width="2.8" stroke-linecap="round"/>`;
  const brow = (d, cls = "") => `<path class="${cls}" d="${d}" fill="none" stroke="${C.hair}" stroke-width="2.7" stroke-linecap="round"/>`;
  const browsNormal = brow("M46 55.5Q51 53 55.5 54.5") + brow("M64.5 54.5Q69 53 74 55.5");
  const smileOpen = `<path d="M52.5 72.5Q60 81.5 67.5 72.5Q60 75 52.5 72.5Z" fill="${C.mouth}" stroke="${C.mouth}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M55 73.6Q60 75.4 65 73.6L64.6 74.9Q60 76.3 55.4 74.9Z" fill="${C.white}"/>`;
  const grin = `<path d="M51 71.5Q60 85 69 71.5Q60 74.5 51 71.5Z" fill="${C.mouth}" stroke="${C.mouth}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M55.5 78.6Q60 81.6 64.5 78.6Q60 76.4 55.5 78.6Z" fill="${C.tongue}"/>
    <path d="M53.4 72.6Q60 74.6 66.6 72.6L66 74.1Q60 75.8 54 74.1Z" fill="${C.white}"/>`;
  const drop = (x, y) => `<path class="cw-drop" d="M${x} ${y}q-3.6 5.2 0 7.4q3.6 -2.2 0 -7.4z" fill="${C.glass}" stroke="${C.french}" stroke-width="1.6"/>`;
  const sparkle = (x, y, r, i) => `<path class="cw-spark" style="animation-delay:${i * -0.37}s" d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}z" fill="${C.whistle}" stroke="${C.violet}" stroke-width="1.4"/>`;
  const heart = (x, y, s, cls) => `<path class="${cls}" d="M${x} ${y + s * 0.9}L${x - s} ${y - s * 0.05}A${s * 0.52} ${s * 0.52} 0 0 1 ${x} ${y - s * 0.6}A${s * 0.52} ${s * 0.52} 0 0 1 ${x + s} ${y - s * 0.05}Z" fill="${C.tongue}" stroke="${C.violet}" stroke-width="1.4" stroke-linejoin="round"/>`;

  /*
    Pose per suasana hati. back = digambar di belakang kepala, front = di depan badan,
    face = mata, alis, mulut, extra = hiasan (bintang, hati, keringat).
    happy (melambai), think, sus (kaca pembesar), cheer, love (combo), sad (tepuk jidat),
    oops (kaget), close (hampir, garuk kepala), teach (menjelaskan, jari menunjuk).
  */
  const POSES = {
    happy: {
      front: restL + armR(sleeve("M90 100Q105 93 104 72") + hand(104, 65) + finger("M98.6 61.5L97.4 58.6")),
      face: eyes() + browsNormal + smileOpen
    },
    think: {
      front: restL + armR(sleeve("M90 101Q101 118 72 92") + hand(68, 86) + finger("M66.6 80.5L65.6 76.5")),
      face: eyes(2, -2) + brow("M46 55.5Q51 53.5 55.5 55") + brow("M64.5 52.5Q69 49 74 52", "cw-brow-r")
        + `<path class="cw-mouth" d="M55.5 75.5Q60.5 77 65 74.4" fill="none" stroke="${C.mouth}" stroke-width="2.4" stroke-linecap="round"/>`
    },
    sus: {
      front: restL + armR(sleeve("M90 101Q102 95 88 82") + hand(85.5, 80)
        + `<path d="M84 78.6L77.6 71" stroke="${C.violet}" stroke-width="5" stroke-linecap="round"/>
        <circle cx="70" cy="62" r="10.5" fill="${C.glass}" stroke="${C.violet}" stroke-width="3.4"/>
        <ellipse cx="70" cy="62.6" rx="4.8" ry="6.2" fill="${C.hair}"/><circle cx="71.8" cy="60" r="1.9" fill="${C.white}"/>
        <path d="M63.6 57.4a8 8 0 0 1 4.2-3.6" fill="none" stroke="${C.white}" stroke-width="1.8" stroke-linecap="round"/>`),
      face: `<path d="M47.4 62.4Q51 60.6 54.6 62.4" fill="none" stroke="${C.hair}" stroke-width="2.8" stroke-linecap="round"/>`
        + brow("M45.6 56.2L55.6 57.8") + brow("M63 49.4Q69 45.4 75.6 48.6", "cw-brow-r")
        + `<path class="cw-mouth" d="M53.6 75.6Q60.5 77.4 66.4 72.6" fill="none" stroke="${C.mouth}" stroke-width="2.4" stroke-linecap="round"/>`
    },
    cheer: {
      front: armL("M30 100Q15 89 17 66", 17, 60) + armR(sleeve("M90 100Q105 89 103 66") + hand(103, 60)),
      face: `<g class="cw-eyes">${arcEye(51)}${arcEye(69)}</g>` + brow("M46 53.5Q51 50.5 55.5 52.5") + brow("M64.5 52.5Q69 50.5 74 53.5") + grin,
      extra: sparkle(8, 40, 5, 0) + sparkle(112, 44, 4.4, 1) + sparkle(100, 22, 3.4, 2)
    },
    love: {
      front: armL("M30 100Q15 89 17 66", 17, 60) + armR(sleeve("M90 100Q105 89 103 66") + hand(103, 60)),
      face: heart(51, 62, 5.2, "cw-heart-eye") + heart(69, 62, 5.2, "cw-heart-eye") + browsNormal + grin,
      extra: heart(14, 36, 4.6, "cw-heart") + heart(106, 30, 3.8, "cw-heart cw-heart-2") + heart(96, 14, 3.2, "cw-heart cw-heart-3")
    },
    sad: {
      front: restL + armR(sleeve("M90 101Q106 80 82 59")
        + `<g transform="rotate(-24 72 55)"><ellipse cx="72" cy="55" rx="9" ry="6.6" fill="${C.skin}" ${LINE}/>
        <path d="M64 51.4h-3.2M64 55h-3.6M64 58.6h-3" stroke="${C.violet}" stroke-width="1.6" stroke-linecap="round"/></g>`),
      face: `<g class="cw-look"><g class="cw-eyes">${eye(51, 64.5, 3.1, 3.5)}</g></g>` + brow("M45.6 57Q50 54.6 55 52.6")
        + `<path class="cw-mouth" d="M53.6 77.6Q60 72.4 66.4 77.6" fill="none" stroke="${C.mouth}" stroke-width="2.6" stroke-linecap="round"/>`,
      extra: drop(40, 44)
    },
    oops: {
      front: armL("M30 100Q21 88 39 75", 40.5, 73) + armR(sleeve("M90 100Q99 88 81 75") + hand(79.5, 73)),
      face: `<g class="cw-look"><g class="cw-eyes">${eye(51, 61.5, 3.7, 5)}${eye(69, 61.5, 3.7, 5)}</g></g>`
        + `<g class="cw-brows">${brow("M45.6 52.4Q51 48.6 55.6 51")}${brow("M64.4 51Q69 48.6 74.4 52.4")}</g>`
        + `<ellipse class="cw-mouth" cx="60" cy="76.6" rx="3.6" ry="4.6" fill="${C.mouth}"/>`
    },
    close: {
      back: armR(sleeve("M90 101Q107 76 91 46")),
      front: restL + armR(hand(87.5, 41) + finger("M82.6 37.6L80.4 35.4")),
      face: `<g class="cw-look"><g class="cw-eyes">${eye(51)}</g></g>` + arcEye(69)
        + brow("M46 54.4Q51 52.4 55.6 54.8") + brow("M64.4 53.6Q69 52 74 54.6")
        + `<path d="M53 73.4Q61.5 80 68 71.4Q61 74.8 53 73.4Z" fill="${C.mouth}" stroke="${C.mouth}" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M55.6 74Q61.5 75.2 66.4 73.1L65.8 74.4Q61 76.2 56 75.2Z" fill="${C.white}"/>`,
      extra: drop(84, 30)
    },
    teach: {
      front: restL + armR(sleeve("M90 100Q105 93 102 73") + hand(102, 66) + finger("M101.4 60L101 51.6")),
      face: eyes() + brow("M46 54Q51 51.4 55.5 53.2") + brow("M64.5 53.2Q69 51.4 74 54")
        + `<g class="cw-mouth"><path d="M54 72.6Q60 79.6 66 72.6Q60 74.8 54 72.6Z" fill="${C.mouth}" stroke="${C.mouth}" stroke-width="1.6" stroke-linejoin="round"/></g>`
    }
  };
  POSES.fish = POSES.teach; // nama lama dari materi

  // Kepala: telinga, wajah, rambut di pelipis, topi baseball berhuruf W.
  const head = (face) => `<g class="cw-head">
    <ellipse cx="36.4" cy="61" rx="4.6" ry="6.6" fill="${C.skin}" ${LINE}/><ellipse cx="83.6" cy="61" rx="4.6" ry="6.6" fill="${C.skin}" ${LINE}/>
    <path d="M36 62.5q1.6-2.6 0.4-4.6M84 62.5q-1.6-2.6-0.4-4.6" fill="none" stroke="${C.skinShade}" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="60" cy="58" rx="24" ry="25" fill="${C.skin}" ${LINE}/>
    <path d="M36.6 52Q36.4 45 41 43.4L79 43.4Q83.6 45 83.4 52L80.6 54Q80 48.6 75.6 47.6L44.4 47.6Q40 48.6 39.4 54Z" fill="${C.hair}"/>
    <path d="M35.4 47.6C35.4 28 46.4 19.8 60 19.8S84.6 28 84.6 47.6Z" fill="${C.french}" ${LINE}/>
    <path d="M60 20.4V46M47.6 22.6Q50.6 34 49.6 46.6M72.4 22.6Q69.4 34 70.4 46.6" fill="none" stroke="${C.brim}" stroke-width="1.3"/>
    <circle cx="60" cy="20.2" r="2.6" fill="${C.french}" ${LINE}/>
    <path d="M52.6 28.6L55.4 38L60 31.6L64.6 38L67.4 28.6" fill="none" stroke="${C.wheat}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M30 47.8Q60 41 90 47.8Q90.6 53.6 60 52.4Q29.4 53.6 30 47.8Z" fill="${C.brim}" stroke="${C.violet}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M34.6 48.8Q60 44.2 85.4 48.8" fill="none" stroke="${C.french}" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="44.4" cy="70.6" rx="4.4" ry="2.5" fill="${C.blush}"/><ellipse cx="75.6" cy="70.6" rx="4.4" ry="2.5" fill="${C.blush}"/>
    <path d="M58.4 67.4Q60 70 62 67.8" fill="none" stroke="${C.skinShade}" stroke-width="2" stroke-linecap="round"/>
    ${face}
  </g>`;

  // Badan: leher, jaket olahraga dengan kerah V, garis bahu, resleting, dan peluit di tali.
  const torso = `<g class="cw-torso">
    <path d="M51.6 76H68.4V93H51.6Z" fill="${C.skinShade}"/>
    <path d="M15 120C15 101.5 27.6 91.4 47 88.4L73 88.4C92.4 91.4 105 101.5 105 120Z" fill="${C.powder}" ${LINE}/>
    <path d="M47.6 88.6L60 101L72.4 88.6Z" fill="${C.skinShade}"/>
    <path d="M46.6 88.4L60 102L73.4 88.4" fill="none" stroke="${C.french}" stroke-width="3.4" stroke-linejoin="round"/>
    <path d="M60 102V120" stroke="${C.french}" stroke-width="2.4"/>
    <path d="M21.6 110Q26 98 40.4 92.6M98.4 110Q94 98 79.6 92.6" fill="none" stroke="${C.french}" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M52 89Q53.6 104 63 108.6M68.4 89Q70 101 63 108.6" fill="none" stroke="${C.violet}" stroke-width="1.4"/>
    <rect x="57.4" y="106.4" width="13" height="7.4" rx="3.7" fill="${C.whistle}" ${LINE}/>
    <circle cx="61.2" cy="110.1" r="1.6" fill="${C.violet}"/>
  </g>`;

  /** SVG Coach Wall untuk satu suasana hati (lihat POSES). */
  function svg(mood = "happy") {
    const pose = POSES[mood] || POSES.happy;
    return `<svg viewBox="0 0 120 120" class="cw cw-${mood}"><g class="cw-all">
      ${pose.back || ""}${torso}${head(pose.face)}${pose.front || ""}${pose.extra || ""}
    </g></svg>`;
  }

  // Penelepon misterius: berkerudung, wajah gelap tanpa rupa, tanda tanya di tempat wajah.
  // speaking: gelombang suara keluar dari kepalanya (bergerak saat suara diputar, css/coach.css).
  function caller() {
    return `<svg viewBox="0 0 120 120" class="caller">
      <g class="caller-waves" fill="none" stroke="${C.powder}" stroke-width="3" stroke-linecap="round">
        <path d="M95 38q7 9 0 18"/><path d="M101 32q11 15 0 30"/><path d="M107 26q15 21 0 42"/>
      </g>
      <g class="caller-body">
        <path d="M14 124C14 98 28 86 60 86S106 98 106 124Z" fill="#48484A" ${LINE}/>
        <path d="M46 90L60 106L74 90" fill="none" stroke="#2C2C2E" stroke-width="3" stroke-linejoin="round"/>
        <path d="M54 96v14M66 96v14" stroke="${C.powder}" stroke-width="2" stroke-linecap="round"/>
        <path d="M60 14C36 14 26 34 28 58C29 76 40 90 60 92C80 90 91 76 92 58C94 34 84 14 60 14Z" fill="#48484A" ${LINE}/>
        <path d="M60 30C44 30 38 44 39 59C40 72 48 80 60 81C72 80 80 72 81 59C82 44 76 30 60 30Z" fill="#1C1C1E"/>
        <path d="M53 50.6a7 7 0 1 1 10.4 6.2c-2.4 1.4-3.4 2.6-3.4 5.4" fill="none" stroke="${C.wheat}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="60" cy="69.4" r="2.4" fill="${C.wheat}"/>
      </g>
    </svg>`;
  }

  return { svg, caller, MOODS: Object.keys(POSES) };
})();
