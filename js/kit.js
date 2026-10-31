// Bagian umum halaman soal (pelajaran dan materi): tombol utama, lembar hasil ala Duolingo,
// soal dengan Lupi, dan pilihan jawaban. Dipakai js/engine.js dan js/materi.js.
const CekKit = (() => {
  const { el } = CekUI;
  const COOLDOWN_MS = 500;

  // Kata-kata seru di lembar hasil, dipilih acak supaya tidak monoton.
  const CHEERS = ["Mantap!", "Keren!", "Jeli banget!", "Gokil!", "Pinter!"];
  const OOPS = ["Hampir!", "Yah, kelewat.", "Santai, belajar dulu.", "Nggak apa-apa!"];
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  // Salinan acak (Fisher-Yates); data aslinya tidak diubah.
  function shuffled(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function setProgress(bar, done, total) {
    bar.setAttribute("aria-valuemax", String(total));
    bar.setAttribute("aria-valuenow", String(done));
    bar.firstElementChild.style.width = `${(done / total) * 100}%`;
  }

  /**
   * @param {{ lesson: HTMLElement, task: HTMLElement, footer: HTMLElement, feedback: HTMLElement, primary: HTMLButtonElement }} dom
   */
  function create(dom) {
    let primaryAction = null;
    let cooldownTimer = null;
    let streak = 0;

    // Satu tombol utama dipakai di semua langkah; fungsinya diganti lewat primaryAction.
    // Setiap kali fungsinya berganti, klik diabaikan sebentar supaya klik ganda
    // (atau Enter yang ditahan) tidak melompati umpan balik.
    function setPrimary(label, enabled, action, tone) {
      dom.primary.textContent = label;
      dom.primary.disabled = !enabled;
      dom.primary.className = tone ? `btn btn-${tone}` : "btn";
      if (action !== primaryAction) startCooldown();
      primaryAction = action;
    }

    function startCooldown() {
      dom.primary.dataset.cooldown = "true";
      clearTimeout(cooldownTimer);
      cooldownTimer = setTimeout(() => { delete dom.primary.dataset.cooldown; }, COOLDOWN_MS);
    }

    dom.primary.addEventListener("click", () => {
      if (dom.primary.dataset.cooldown || !primaryAction) return;
      primaryAction();
    });

    // Lembar bawah seperti Duolingo: seruan, judul hasil, satu kalimat. Benar berturut-turut = combo.
    // xp: bonus yang didapat di soal ini (0 kalau soal ini tidak memberi XP).
    // cheer: celetukan khusus (misalnya dari Lupi); kosong = seruan acak.
    function showFeedback(tone, heading, text, xp = 0, cheer = "") {
      const isGood = tone === "good";
      streak = isGood ? streak + 1 : 0;
      dom.lesson.classList.add("is-graded");
      dom.footer.className = `lesson-footer is-${tone}`;
      dom.feedback.replaceChildren(
        el("p", { className: cheer ? "feedback-cheer is-quip" : "feedback-cheer" }, [
          cheer || (isGood ? pick(CHEERS) : pick(OOPS)),
          isGood && xp > 0 && el("span", { className: "xp-pop", text: `+${xp} XP` }),
          streak >= 2 && el("span", { className: "combo", text: `${streak}x combo!` })
        ]),
        el("h2", {}, [CekUI.icon(isGood ? "check" : "alert"), heading]),
        el("p", { text })
      );
      CekSound.play(!isGood ? "bad" : streak >= 2 ? "combo" : "good");
    }

    function hideFeedback() {
      dom.lesson.classList.remove("is-graded");
      dom.footer.className = "lesson-footer";
      dom.feedback.replaceChildren();
    }

    // Soal: Lupi + gelembung berisi pertanyaan, petunjuk singkat, lalu pilihan.
    // layout: nama gaya pilihan (chips, find, match, url, reply); mood: ekspresi awal Lupi.
    function renderTask(title, subtitle, options, label, layout, mood = "think") {
      const heading = el("h2", { className: "coach-bubble task-title", tabindex: "-1", text: title });
      dom.task.replaceChildren(
        el("div", { className: "coach task-head" }, [CekUI.mascot(mood), heading]),
        el("p", { className: "task-sub", text: subtitle }),
        el("div", { className: layout ? `options options-${layout}` : "options", role: "group", "aria-label": label }, options)
      );
      // Pindahkan fokus ke soal baru supaya pengguna keyboard/pembaca layar tidak tersesat.
      heading.focus({ preventScroll: true });
    }

    // Lupi ikut bereaksi: lompat senang kalau benar, geleng kalau salah.
    function setMood(isRight) {
      dom.task.querySelector(".mascot").replaceWith(CekUI.mascot(isRight ? "cheer" : "oops"));
    }

    function optionButton(id, title, onClick, kind, iconId) {
      return el("button", { type: "button", className: "option", "data-id": id, "aria-pressed": "false", onClick }, [
        el("span", { className: `option-${kind}`, "aria-hidden": "true" }),
        iconId && CekUI.questionIcon(iconId),
        el("span", { className: "option-text" }, [el("strong", { text: title })])
      ]);
    }

    function syncPressed(selectedIds) {
      dom.task.querySelectorAll(".option").forEach((button) => {
        button.setAttribute("aria-pressed", String(selectedIds.includes(button.dataset.id)));
      });
    }

    // Setiap ketukan terasa: suara kecil dan pilihan "membal".
    function bump(button) {
      CekSound.play("tap");
      button.classList.remove("is-bumped");
      void button.offsetWidth; // ulang animasi
      button.classList.add("is-bumped");
    }

    // Kunci pilihan setelah dinilai, beri warna, dan tulis penjelasan di bawah pilihan yang relevan.
    function lockOptions(statusOf, noteOf) {
      dom.task.querySelector(".task-sub").textContent = "Baca penjelasan di tiap pilihan.";
      dom.task.querySelector(".options").classList.add("is-graded");
      dom.task.querySelectorAll(".option").forEach((button) => {
        button.disabled = true;
        const status = statusOf(button.dataset.id);
        if (!status) return;
        button.classList.add(`is-${status}`);
        const note = noteOf(button.dataset.id, status);
        if (note) button.querySelector(".option-text").append(el("span", { className: "option-note", text: note }));
      });
    }

    return { setPrimary, showFeedback, hideFeedback, renderTask, setMood, optionButton, syncPressed, bump, lockOptions };
  }

  return { create, shuffled, setProgress };
})();
