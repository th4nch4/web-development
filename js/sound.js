// Efek saat menjawab: bunyi (dibuat langsung di browser lewat Web Audio, tanpa file dan tanpa internet)
// dan getar pelan di HP yang mendukung. Sengaja tidak ada efek saat mengetuk pilihan.
// Keduanya bisa dimatikan di Pengaturan; pilihan disimpan hanya di perangkat ini.
const CekSound = (() => {
  const KEY = "cekdulu.sound";
  const VIBRATE_KEY = "cekdulu.vibrate";
  // [frekuensi Hz, mulai detik, lama detik, bentuk gelombang, volume]
  const SOUNDS = {
    good: [[523, 0, 0.09, "triangle", 0.12], [659, 0.08, 0.09, "triangle", 0.12], [988, 0.16, 0.22, "triangle", 0.12]],
    close: [[440, 0, 0.1, "triangle", 0.11], [494, 0.1, 0.2, "triangle", 0.11]],
    bad: [[311, 0, 0.14, "square", 0.05], [233, 0.14, 0.26, "square", 0.05]]
  };
  const BUZZ = { good: 25, close: [30, 50, 30], bad: [50, 60, 50] }; // milidetik
  let context = null;

  // Pilihan nyala/mati: bawaan nyala, "off" disimpan kalau dimatikan.
  function isEnabled(key) {
    try {
      return window.localStorage.getItem(key) !== "off";
    } catch (error) {
      return true;
    }
  }

  function setEnabled(key, on) {
    try {
      if (on) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, "off");
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

  /** name: "good" (benar), "close" (hampir), atau "bad" (salah). */
  function play(name) {
    if (!SOUNDS[name]) return;
    if (isEnabled(VIBRATE_KEY) && typeof navigator.vibrate === "function") navigator.vibrate(BUZZ[name]);
    if (!isEnabled(KEY)) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    context = context || new AudioCtx();
    if (context.state === "suspended") context.resume();
    SOUNDS[name].forEach((part) => note(context, part));
  }

  return {
    play,
    isOn: () => isEnabled(KEY),
    setOn: (on) => setEnabled(KEY, on),
    vibrateOn: () => isEnabled(VIBRATE_KEY),
    setVibrate: (on) => setEnabled(VIBRATE_KEY, on)
  };
})();
