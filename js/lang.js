// Bahasa tampilan: Indonesia (bawaan) atau English. Dimuat di <head> setelah js/strings.js, sebelum skrip lain.
// - Teks tombol, judul, dan label ada di js/strings.js, dipakai lewat CekLang.t("kunci").
// - Isi pelajaran punya file per bahasa: js/scenarios.js (Indonesia) dan js/en/scenarios.js (English), dst.
//   Halaman memuat salah satunya lewat CekLang.load("scenarios").
// - Teks tetap di HTML diberi data-i18n (isi teks) atau data-i18n-label (aria-label).
// Pilihan bahasa disimpan hanya di perangkat ini.
const CekLang = (() => {
  const KEY = "cekdulu.lang";
  const CHOICES = [
    { value: "id", label: "Indonesia" },
    { value: "en", label: "English" }
  ];

  function stored() {
    try {
      return window.localStorage.getItem(KEY) === "en" ? "en" : "id";
    } catch (error) {
      return "id";
    }
  }

  const lang = stored();
  document.documentElement.lang = lang;

  /** Ganti bahasa lalu muat ulang halaman, karena isi pelajaran dipilih saat halaman dimuat. */
  function choose(value) {
    try {
      if (value === "en") window.localStorage.setItem(KEY, value);
      else window.localStorage.removeItem(KEY);
    } catch (error) {
      // Penyimpanan diblokir: bahasa tidak bisa diingat, jadi tetap bahasa bawaan.
    }
    location.reload();
  }

  function entry(key) {
    const found = STRINGS[key];
    if (!found) throw new Error(`Teks "${key}" belum ada di js/strings.js`);
    return found[lang] || found.id;
  }

  /** Teks dalam bahasa aktif. {nama} diganti nilai dari vars, mis. t("find.some", { found: 2, total: 3 }). */
  function t(key, vars = {}) {
    return entry(key).replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
  }

  /** Daftar teks (mis. seruan acak di lembar hasil). */
  function list(key) {
    return entry(key);
  }

  /** Muat file isi sesuai bahasa: "scenarios" menjadi js/scenarios.js atau js/en/scenarios.js. */
  function load(name) {
    document.write(`<script src="js/${lang === "en" ? "en/" : ""}${name}.js"><\/script>`);
  }

  function translatePage() {
    document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
    document.querySelectorAll("[data-i18n-label]").forEach((node) => { node.setAttribute("aria-label", t(node.dataset.i18nLabel)); });
  }

  document.addEventListener("DOMContentLoaded", translatePage);
  return { lang, CHOICES, choose, t, list, load };
})();
