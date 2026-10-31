// Efek suara ala game, dibuat langsung di browser (Web Audio). Tanpa file dan tanpa internet.
// Bisa dimatikan lewat tombol pengaturan; pilihan disimpan hanya di perangkat ini.
const CekSound = (() => {
  const KEY = "cekdulu.sound";
  // [frekuensi Hz, mulai detik, lama detik, bentuk gelombang, volume]
  const SOUNDS = {
    tap: [[880, 0, 0.05, "triangle", 0.06]],
    good: [[523, 0, 0.09, "triangle", 0.12], [659, 0.08, 0.09, "triangle", 0.12], [988, 0.16, 0.22, "triangle", 0.12]],
    bad: [[311, 0, 0.14, "square", 0.05], [233, 0.14, 0.26, "square", 0.05]],
    combo: [[784, 0, 0.07, "triangle", 0.1], [1047, 0.07, 0.07, "triangle", 0.1], [1319, 0.14, 0.16, "triangle", 0.1]],
    done: [[523, 0, 0.12, "triangle", 0.12], [659, 0.12, 0.12, "triangle", 0.12], [784, 0.24, 0.12, "triangle", 0.12], [1047, 0.36, 0.4, "triangle", 0.14]]
  };
  let context = null;

  function isOn() {
    try {
      return window.localStorage.getItem(KEY) !== "off";
    } catch (error) {
      return true;
    }
  }

  function setOn(on) {
    try {
      if (on) window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, "off");
    } catch (error) {
      // Penyimpanan diblokir: pilihan berlaku sampai halaman ditutup.
    }
  }

  function note(audio, [frequency, start, length, wave, volume]) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const at = audio.currentTime + start;
    osc.type = wave;
    osc.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(volume, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + length);
    osc.connect(gain).connect(audio.destination);
    osc.start(at);
    osc.stop(at + length + 0.02);
  }

  function play(name) {
    if (!isOn() || !SOUNDS[name]) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    context = context || new AudioCtx();
    if (context.state === "suspended") context.resume();
    SOUNDS[name].forEach((part) => note(context, part));
  }

  return { play, isOn, setOn };
})();
