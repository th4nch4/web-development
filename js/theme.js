// Tampilan terang/gelap. Dimuat di <head> supaya tema terpasang sebelum halaman tampil (tanpa kedip).
// Pilihan: "system" (bawaan, ikut pengaturan perangkat), "light", atau "dark". Disimpan hanya di perangkat ini.
const CekTheme = (() => {
  const KEY = "cekdulu.theme";
  const CHOICES = [
    { value: "system", label: "Sistem" },
    { value: "light", label: "Terang" },
    { value: "dark", label: "Gelap" }
  ];
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function stored() {
    try {
      const value = window.localStorage.getItem(KEY);
      return value === "light" || value === "dark" ? value : "system";
    } catch (error) {
      return "system";
    }
  }

  function apply(choice) {
    const dark = choice === "dark" || (choice === "system" && media.matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }

  function choose(choice) {
    try {
      if (choice === "system") window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, choice);
    } catch (error) {
      // Penyimpanan diblokir: tema tetap berlaku sampai halaman ditutup.
    }
    apply(choice);
  }

  const GEAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></g></svg>';

  // Tombol roda gigi + panel pilihan, dipasang di bar atas setiap halaman.
  function mount() {
    const bar = document.querySelector(".topbar, .lesson-top");
    if (!bar) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-btn settings-btn";
    button.setAttribute("aria-label", "Pengaturan tampilan");
    button.setAttribute("aria-haspopup", "true");
    button.innerHTML = GEAR;

    const panel = document.createElement("div");
    panel.className = "settings-panel";
    panel.id = "settings-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Pengaturan tampilan");
    panel.hidden = true;
    const current = stored();
    panel.innerHTML = `<fieldset><legend>Tampilan</legend><div class="answers">${CHOICES.map((c) => `
      <label class="answer"><input type="radio" name="theme" value="${c.value}"${c.value === current ? " checked" : ""}><span>${c.label}</span></label>`).join("")}
    </div></fieldset><p class="settings-note">Sistem ikut pengaturan terang/gelap HP-mu.</p>
    <fieldset class="settings-sound"><legend>Suara</legend><div class="answers answers-2">
      <label class="answer"><input type="radio" name="sound" value="on"${CekSound.isOn() ? " checked" : ""}><span>Nyala</span></label>
      <label class="answer"><input type="radio" name="sound" value="off"${CekSound.isOn() ? "" : " checked"}><span>Mati</span></label>
    </div></fieldset>`;

    const close = () => {
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
    };
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      button.setAttribute("aria-expanded", String(!panel.hidden));
    });
    panel.addEventListener("change", (event) => {
      if (event.target.name === "sound") {
        CekSound.setOn(event.target.value === "on");
      } else {
        choose(event.target.value);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) {
        close();
        button.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!panel.hidden && !panel.contains(event.target) && !button.contains(event.target)) close();
    });
    bar.append(button, panel);
  }

  apply(stored());
  media.addEventListener("change", () => apply(stored()));
  document.addEventListener("DOMContentLoaded", mount);
  return { stored, choose };
})();
