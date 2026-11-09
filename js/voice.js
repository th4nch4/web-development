// Suara bicara (text-to-speech browser) untuk VO Coach Wall di kartu materi dan penelepon misterius di soal suara.
// Urutan suara: yang terpasang di perangkat (localService) dulu. Kalau tidak ada untuk bahasa ini dan "Suara online"
// diizinkan di Pengaturan > Suara (bawaan: diizinkan), dipakai suara online browser (mis. Google di Chrome, Microsoft di Edge):
// browser mengirim TEKS PELAJARAN itu ke layanan suaranya untuk dibacakan. Data pemain tidak pernah ikut terkirim.
// Tanpa suara sama sekali, pemanggil menampilkan teksnya saja.
const CekVoice = (() => {
  const LANG_TAG = { id: "id-ID", en: "en-US" };
  const hasSpeech = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const READY_WAIT_MS = 1200; // daftar suara dimuat belakangan di sebagian browser
  let current = null; // ucapan yang sedang diputar
  let timer = null;
  if (hasSpeech) window.speechSynthesis.getVoices(); // mulai memuat daftar suara sejak awal

  const normalTag = (voice) => voice.lang.replace("_", "-");

  function pickVoice() {
    if (!hasSpeech) return null;
    const tag = LANG_TAG[CekLang.lang];
    const sameLanguage = window.speechSynthesis.getVoices()
      .filter((voice) => normalTag(voice).toLowerCase().startsWith(tag.slice(0, 2)));
    const best = (list) => list.find((voice) => normalTag(voice) === tag) || list[0] || null;
    const local = best(sameLanguage.filter((voice) => voice.localService));
    if (local || !CekSettings.onlineVoiceOn()) return local;
    return best(sameLanguage.filter((voice) => !voice.localService));
  }

  /** Jalankan callback setelah daftar suara siap (atau setelah ditunggu sebentar). */
  function ready(callback) {
    if (!hasSpeech || window.speechSynthesis.getVoices().length > 0) {
      callback();
      return;
    }
    let called = false;
    const once = () => {
      if (called) return;
      called = true;
      callback();
    };
    window.speechSynthesis.addEventListener("voiceschanged", once, { once: true });
    setTimeout(once, READY_WAIT_MS);
  }

  function stop() {
    const playing = current;
    current = null;
    clearTimeout(timer);
    if (hasSpeech) window.speechSynthesis.cancel();
    if (playing && playing.onEnd) playing.onEnd();
  }

  /**
   * Bacakan teks. onStart/onEnd untuk animasi (gelombang suara, mulut Coach Wall).
   * @returns {boolean} false kalau tidak ada suara yang bisa dipakai (pemanggil menampilkan teksnya).
   */
  function speak(text, { rate = 1, pitch = 1, onStart, onEnd } = {}) {
    const voice = pickVoice();
    if (!voice) return false;
    stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    const playing = { utterance, onEnd };
    const done = () => {
      if (current !== playing) return; // ucapan lama yang dibatalkan tidak boleh mengubah tampilan baru
      current = null;
      clearTimeout(timer);
      if (onEnd) onEnd();
    };
    utterance.addEventListener("end", done);
    utterance.addEventListener("error", done);
    current = playing;
    if (onStart) onStart();
    timer = setTimeout(done, (text.length * 110) / rate + 2500); // cadangan kalau "end" tidak pernah datang
    window.speechSynthesis.speak(utterance);
    return true;
  }

  window.addEventListener("pagehide", stop);

  return {
    ready,
    speak,
    stop,
    available: () => Boolean(pickVoice()),
    isOnline: () => {
      const voice = pickVoice();
      return Boolean(voice && !voice.localService);
    },
    coachOn: () => CekSettings.narrationOn()
  };
})();
