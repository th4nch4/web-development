// Bagian umum halaman soal (pelajaran dan materi): tombol utama, lembar hasil ala Duolingo,
// soal dengan Coach Wall, dan pilihan jawaban. Dipakai js/engine.js dan js/belajar.js.
const CekKit = (() => {
  const { el } = CekUI;
  const { t } = CekLang;
  const COOLDOWN_MS = 500;
  const SOUND_OF = { good: "good", partial: "close", bad: "bad" };

  // Label status setelah dinilai. Ditulis sebagai teks sungguhan supaya dibacakan pembaca layar.
  const STATUS_LABELS = {
    found: t("status.found"), correct: t("status.correct"), answer: t("status.answer"),
    missed: t("status.missed"), extra: t("status.extra"), wrong: t("status.wrong"), retry: t("status.retry")
  };

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
   * Nada hasil soal pilih banyak: semua benar = "good" (hijau), sebagian benar = "partial" (kuning, hampir),
   * tidak ada yang benar = "bad" (merah).
   * @param {{ allCorrect: boolean, found: Array }} result
   */
  function toneOf(result) {
    if (result.allCorrect) return "good";
    return result.found.length > 0 ? "partial" : "bad";
  }

  /**
   * @param {{ lesson: HTMLElement, task: HTMLElement, footer: HTMLElement, feedback: HTMLElement, primary: HTMLButtonElement }} dom
   */
  // Daftar jawaban boleh digulir (HP dan pertanyaan tetap di tempat). Selama masih ada pilihan di bawah,
  // kelas has-more memudarkan ujung bawahnya sebagai tanda bisa digulir.
  function watchScroll(list) {
    const update = () => list.classList.toggle("has-more", list.scrollHeight - list.clientHeight - list.scrollTop > 2);
    list.addEventListener("scroll", update, { passive: true });
    new ResizeObserver(update).observe(list);
    return update;
  }

  function create(dom) {
    let primaryAction = null;
    let cooldownTimer = null;
    let watched = null; // daftar jawaban yang sedang dipantau guliran-nya
    let refreshScroll = () => {};

    function watchOptions() {
      const list = dom.task.querySelector(".options");
      if (list && list !== watched) {
        watched = list;
        refreshScroll = watchScroll(list);
      }
      refreshScroll();
    }

    // Satu tombol utama dipakai di semua langkah; fungsinya diganti lewat primaryAction.
    // Setiap kali fungsinya berganti, klik diabaikan sebentar supaya klik ganda
    // (atau Enter yang ditahan) tidak melompati umpan balik. tone: good | partial | bad.
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

    // Lembar bawah seperti Duolingo: Coach Wall bereaksi, seruan, judul hasil, satu kalimat.
    // tone: good (hijau), partial (kuning, hampir benar), bad (merah). Hanya "good" yang menambah streak.
    // xp: bonus yang didapat di soal ini. cheer: celetukan khusus; kosong = seruan acak.
    function showFeedback(tone, heading, text, xp = 0, cheer = "") {
      const streak = CekUI.recordStreak(tone === "good");
      const mood = CekUI.reaction(tone, streak);
      dom.lesson.classList.add("is-graded");
      dom.footer.className = `lesson-footer is-${tone}`;
      dom.feedback.replaceChildren(...CekUI.feedback({ tone, heading, text, cheer, xp, streak, mood }));
      // Coach Wall di soal (kalau masih terlihat, mis. di layar lebar) ikut berekspresi sama.
      const taskMascot = dom.task.querySelector(".task-head .mascot");
      if (taskMascot) taskMascot.replaceWith(CekUI.mascot(mood));
      CekSound.play(SOUND_OF[tone]);
    }

    function hideFeedback() {
      dom.lesson.classList.remove("is-graded");
      dom.footer.className = "lesson-footer";
      dom.feedback.replaceChildren();
    }

    /**
     * Soal: Coach Wall + gelembung berisi pertanyaan, petunjuk singkat, lalu pilihan.
     * layout: gaya pilihan (chips, find, match, url, reply, quiz); mood: ekspresi awal Coach Wall.
     * lead: elemen tambahan di atas pilihan (mis. penelepon di soal suara).
     * Kalau ada pilihan berkotak centang, ditulis juga "Bisa pilih lebih dari satu".
     */
    function renderTask(title, subtitle, options, label, layout, mood = "think", lead = null) {
      const heading = el("h2", { className: "coach-bubble task-title", tabindex: "-1", text: title });
      const isMulti = options.some((option) => option.querySelector && option.querySelector(".option-check"));
      const sub = subtitle || isMulti
        ? el("p", { className: "task-sub" }, [subtitle, isMulti && el("span", { className: "multi-hint" }, [CekUI.icon("check"), t("task.multi")])])
        : null;
      dom.task.replaceChildren(...[
        el("div", { className: "coach task-head" }, [CekUI.coach(mood, "coach.lessonTips"), heading]),
        sub,
        lead,
        el("div", { className: layout ? `options options-${layout}` : "options", role: "group", "aria-label": label }, options)
      ].filter(Boolean));
      watchOptions();
      // Pindahkan fokus ke soal baru supaya pengguna keyboard/pembaca layar tidak tersesat.
      heading.focus({ preventScroll: true });
    }

    // kind: "check" (boleh banyak, kotak centang), "radio" (pilih satu, bulatan),
    // atau kosong untuk pilihan tanpa kotak (mis. "Nggak ada yang salah").
    function optionButton(id, title, onClick, kind, iconId) {
      return el("button", { type: "button", className: kind ? "option" : "option option-plain", "data-id": id, "aria-pressed": "false", onClick }, [
        kind && el("span", { className: `option-${kind}`, "aria-hidden": "true" }),
        iconId && CekUI.questionIcon(iconId),
        el("span", { className: "option-text" }, [el("strong", { text: title })])
      ]);
    }

    function syncPressed(selectedIds) {
      dom.task.querySelectorAll(".option").forEach((button) => {
        button.setAttribute("aria-pressed", String(selectedIds.includes(button.dataset.id)));
      });
    }

    // Kunci pilihan setelah dinilai, beri warna dan label status, dan tulis penjelasan di bawah pilihan yang relevan.
    // labels: label pengganti per status (mis. kuis "pilih tautan palsu" tidak boleh bilang "Lebih aman").
    function lockOptions(statusOf, noteOf, labels = {}) {
      dom.task.querySelector(".options").classList.add("is-graded");
      dom.task.querySelectorAll(".option").forEach((button) => {
        button.disabled = true;
        const status = statusOf(button.dataset.id);
        if (!status) return;
        button.classList.add(`is-${status}`);
        button.append(el("span", { className: "option-status", text: labels[status] || STATUS_LABELS[status] }));
        const note = noteOf(button.dataset.id, status);
        if (note) button.querySelector(".option-text").append(el("span", { className: "option-note", text: note }));
      });
      dom.task.querySelector(".options").scrollTop = 0; // hasil dibaca dari atas
      watchOptions(); // isi daftar berubah (penjelasan ditambah, pilihan lain disembunyikan, atau daftar diganti)
    }

    /**
     * Layar selesai. withHome: tampilkan juga tombol "Kembali ke beranda" (tautan #home di HTML) di samping
     * tombol utama; false kalau tombol utamanya sendiri sudah kembali ke beranda.
     */
    function showDone(withHome = true) {
      dom.lesson.classList.add("is-done");
      dom.footer.classList.add("is-done");
      const home = document.getElementById("home");
      if (home) home.hidden = !withHome;
    }

    return { setPrimary, showFeedback, hideFeedback, renderTask, optionButton, syncPressed, lockOptions, showDone };
  }

  return { create, shuffled, setProgress, toneOf };
})();
