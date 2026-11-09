// Suara permainan, semua dibuat langsung di browser (Web Audio), tanpa file dan tanpa internet:
// - efek saat menjawab (benar, hampir, salah) + getar pelan di HP yang mendukung;
// - bunyi ketuk saat memilih jawaban;
// - musik latar pelan selama soal menunggu dijawab (berhenti begitu jawaban dinilai);
// - perayaan (fanfare + tepuk tangan) saat konfeti muncul.
// Efek, musik, dan getar bisa dimatikan sendiri-sendiri di Pengaturan; pilihan disimpan hanya di perangkat ini.
const CekSound = (() => {
  const KEYS = { sound: "cekdulu.sound", vibrate: "cekdulu.vibrate", music: "cekdulu.music" };
  // [frekuensi Hz, mulai detik, lama detik, bentuk gelombang, volume]
  const SOUNDS = {
    good: [[523, 0, 0.09, "triangle", 0.12], [659, 0.08, 0.09, "triangle", 0.12], [988, 0.16, 0.22, "triangle", 0.12]],
    close: [[440, 0, 0.1, "triangle", 0.11], [494, 0.1, 0.2, "triangle", 0.11]],
    bad: [[311, 0, 0.14, "square", 0.05], [233, 0.14, 0.26, "square", 0.05]],
    tap: [[880, 0, 0.05, "sine", 0.07], [1320, 0.012, 0.045, "sine", 0.035]]
  };
  const BUZZ = { good: 25, close: [30, 50, 30], bad: [50, 60, 50] }; // milidetik
  let context = null;

  // Pilihan nyala/mati: bawaan nyala, "off" disimpan kalau dimatikan.
  function isEnabled(name) {
    try {
      return window.localStorage.getItem(KEYS[name]) !== "off";
    } catch (error) {
      return true;
    }
  }

  function setEnabled(name, on) {
    try {
      if (on) window.localStorage.removeItem(KEYS[name]);
      else window.localStorage.setItem(KEYS[name], "off");
    } catch (error) {
      // Penyimpanan diblokir: pilihan berlaku sampai halaman ditutup.
    }
  }

  // Browser baru mengizinkan suara setelah pemain menyentuh halaman; konteksnya dibuka saat itu.
  function audio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    context = context || new AudioCtx();
    if (context.state === "suspended") context.resume();
    return context;
  }
  ["pointerdown", "keydown"].forEach((type) => document.addEventListener(type, () => { if (context) context.resume(); }, { passive: true }));

  function note(ctx, [frequency, start, length, wave, volume], out = ctx.destination) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const at = ctx.currentTime + start;
    osc.type = wave;
    osc.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.008); // serangan pendek supaya tidak "klik"
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(gain).connect(out);
    osc.start(at);
    osc.stop(at + length + 0.02);
  }

  // ---------- Perayaan: letupan, fanfare naik, lalu tepuk tangan yang mereda ----------

  const FANFARE = [
    [392, 0, 0.12, "triangle", 0.11], [523, 0.1, 0.12, "triangle", 0.11], [659, 0.2, 0.12, "triangle", 0.11],
    [784, 0.3, 0.16, "triangle", 0.12], [523, 0.46, 0.6, "triangle", 0.07], [659, 0.46, 0.6, "triangle", 0.07],
    [784, 0.46, 0.6, "triangle", 0.07], [1047, 0.46, 0.7, "triangle", 0.08]
  ];

  // Tepuk tangan: ratusan "plak" pendek dari derau, makin jarang di akhir. Dibuat sekali, dipakai ulang.
  let applauseBuffer = null;
  function applause(ctx) {
    if (!applauseBuffer) {
      const seconds = 2.6;
      applauseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
      const data = applauseBuffer.getChannelData(0);
      for (let i = 0; i < 260; i += 1) {
        const at = Math.pow(Math.random(), 1.6) * (seconds - 0.1); // lebih rapat di awal
        const start = Math.floor(at * ctx.sampleRate);
        const length = Math.floor((0.008 + Math.random() * 0.02) * ctx.sampleRate);
        const loud = 0.25 + Math.random() * 0.5;
        for (let s = 0; s < length && start + s < data.length; s += 1) {
          data[start + s] += (Math.random() * 2 - 1) * loud * Math.exp(-s / (length / 4));
        }
      }
    }
    const source = ctx.createBufferSource();
    const band = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = applauseBuffer;
    band.type = "bandpass";
    band.frequency.value = 1800;
    band.Q.value = 0.6;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.9);
    source.connect(band).connect(gain).connect(ctx.destination);
    source.start(ctx.currentTime + 0.3);
  }

  function celebrate() {
    if (!isEnabled("sound")) return;
    const ctx = audio();
    if (!ctx) return;
    note(ctx, [140, 0, 0.12, "sine", 0.2]); // letupan konfeti
    FANFARE.forEach((part) => note(ctx, [part[0], part[1] + 0.06, ...part.slice(2)]));
    applause(ctx);
    if (isEnabled("vibrate") && typeof navigator.vibrate === "function") navigator.vibrate([30, 40, 30, 40, 60]);
  }

  /** name: "good" (benar), "close" (hampir), "bad" (salah), "tap" (memilih), atau "celebrate". */
  function play(name) {
    if (name === "celebrate") {
      celebrate();
      return;
    }
    if (!SOUNDS[name]) return;
    if (BUZZ[name] && isEnabled("vibrate") && typeof navigator.vibrate === "function") navigator.vibrate(BUZZ[name]);
    if (!isEnabled("sound")) return;
    const ctx = audio();
    if (ctx) SOUNDS[name].forEach((part) => note(ctx, part));
  }

  // ---------- Musik menunggu jawaban: marimba pelan di atas 4 akor yang berulang ----------
  // Dijadwalkan sedikit ke depan setiap 100 ms (pola penjadwalan Web Audio), jadi temponya stabil.

  const BEAT = 60 / 96 / 2; // seperdelapan ketukan pada 96 BPM
  const CHORDS = [ // nada arpeggio (Hz) dan nada bas, per birama: Cmaj7, Am7, Fmaj7, G6
    { notes: [523, 659, 784, 988, 784, 659, 784, 659], bass: 131 },
    { notes: [440, 523, 659, 784, 659, 523, 659, 523], bass: 110 },
    { notes: [349, 440, 523, 659, 523, 440, 523, 440], bass: 87 },
    { notes: [392, 494, 587, 659, 587, 494, 587, 494], bass: 98 }
  ];
  const music = { timer: null, step: 0, next: 0, bus: null };

  function pluck(ctx, frequency, at, volume, out) {
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    overtone.type = "sine";
    osc.frequency.value = frequency;
    overtone.frequency.value = frequency * 4; // kilau kayu ala marimba
    const shine = ctx.createGain();
    shine.gain.value = 0.18;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
    osc.connect(gain);
    overtone.connect(shine).connect(gain);
    gain.connect(out);
    [osc, overtone].forEach((node) => { node.start(at); node.stop(at + 0.55); });
  }

  function schedule(ctx) {
    while (music.next < ctx.currentTime + 0.3) {
      const bar = CHORDS[Math.floor(music.step / 8) % CHORDS.length];
      const beat = music.step % 8;
      pluck(ctx, bar.notes[beat], music.next, beat % 2 === 0 ? 0.32 : 0.22, music.bus);
      if (beat === 0) note(ctx, [bar.bass, music.next - ctx.currentTime, 1.1, "triangle", 0.3], music.bus);
      music.step += 1;
      music.next += BEAT;
    }
  }

  function startMusic() {
    if (music.timer || !isEnabled("music")) return;
    const ctx = audio();
    if (!ctx) return;
    music.bus = ctx.createGain();
    music.bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    music.bus.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 1.2); // masuk pelan
    music.bus.connect(ctx.destination);
    music.step = 0;
    music.next = ctx.currentTime + 0.05;
    schedule(ctx);
    music.timer = setInterval(() => schedule(ctx), 100);
  }

  function stopMusic() {
    if (!music.timer) return;
    clearInterval(music.timer);
    music.timer = null;
    const bus = music.bus;
    const ctx = context;
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), ctx.currentTime);
    bus.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35); // keluar pelan
    setTimeout(() => bus.disconnect(), 500);
  }

  document.addEventListener("visibilitychange", () => { if (document.hidden) stopMusic(); });

  return {
    play,
    music: { start: startMusic, stop: stopMusic },
    isOn: () => isEnabled("sound"),
    setOn: (on) => setEnabled("sound", on),
    vibrateOn: () => isEnabled("vibrate"),
    setVibrate: (on) => setEnabled("vibrate", on),
    musicOn: () => isEnabled("music"),
    setMusic: (on) => {
      setEnabled("music", on);
      if (!on) stopMusic();
    }
  };
})();
