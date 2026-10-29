// Menggambar HP simulasi dari data skenario (chat, sms, email, atau notifikasi).
const CekPhone = (() => {
  const { el } = CekUI;
  const KIND_TITLES = { sender: "Pengirim", link: "Link", attachment: "File" };

  function initial(name) {
    return /^[A-Za-z]/.test(name) ? name[0].toUpperCase() : "#";
  }

  function fileExtension(name) {
    return name.split(".").pop().toUpperCase();
  }

  // Bagian pesan yang bisa diketuk untuk diperiksa. Isinya fakta, bukan jawaban.
  function makeTap(onInspect) {
    return (kind, label, detail, flag, className, content) => el("button", {
      type: "button",
      className: `tap ${className}`,
      "data-flag": flag,
      "aria-label": `Periksa ${KIND_TITLES[kind].toLowerCase()}: ${label}`,
      onClick: (event) => onInspect({ title: KIND_TITLES[kind], label, detail }, event.currentTarget)
    }, content || label);
  }

  function segment(part, tap) {
    if (typeof part === "string") return part;
    if (part.url) {
      return tap("link", part.url, part.detail, part.flag, part.button ? "tap-button" : "tap-link", part.text);
    }
    return el("span", { className: "evidence", "data-flag": part.flag }, part.text);
  }

  function paragraphs(scenario, tap, className) {
    return scenario.messages.map((bubble) => el("p", { className }, bubble.map((part) => segment(part, tap))));
  }

  function senderTap(scenario, tap) {
    const { sender } = scenario;
    return tap("sender", sender.name, sender.detail, sender.flag, "tap-sender", sender.name);
  }

  function renderChat(s, tap) {
    const file = s.attachment && el("div", { className: "bubble bubble-file" }, [
      tap("attachment", s.attachment.name, s.attachment.detail, s.attachment.flag, "tap-file", [
        el("span", { className: "file-icon", "aria-hidden": "true", text: fileExtension(s.attachment.name) }),
        el("span", { className: "file-meta" }, [
          el("strong", { text: s.attachment.name }),
          el("small", { text: s.attachment.size })
        ])
      ])
    ]);
    return [
      el("div", { className: "app-header chat-header" }, [
        el("span", { className: "avatar", "aria-hidden": "true", text: initial(s.sender.name) }),
        senderTap(s, tap)
      ]),
      el("div", { className: "app-body chat-body" }, [
        s.notice && el("p", { className: "system-notice", text: s.notice }),
        ...paragraphs(s, tap, "bubble"),
        file
      ]),
      el("div", { className: "chat-input", "aria-hidden": "true", text: "Ketik pesan" })
    ];
  }

  function renderSms(s, tap) {
    return [
      el("div", { className: "app-header sms-header" }, [
        el("span", { className: "avatar", "aria-hidden": "true", text: initial(s.sender.name) }),
        senderTap(s, tap),
        el("small", { className: "app-tag", text: "SMS" })
      ]),
      el("div", { className: "app-body sms-body" }, paragraphs(s, tap, "bubble"))
    ];
  }

  function renderEmail(s, tap) {
    return [
      el("div", { className: "app-header email-header", text: "Kotak masuk" }),
      el("div", { className: "app-body email-body" }, [
        el("h3", { className: "email-subject", text: s.subject }),
        el("div", { className: "email-from" }, [
          el("span", { className: "avatar", "aria-hidden": "true", text: initial(s.sender.name) }),
          el("div", {}, [senderTap(s, tap), el("small", { text: "kepada saya" })])
        ]),
        ...paragraphs(s, tap, "email-paragraph")
      ])
    ];
  }

  function renderNotif(s, tap) {
    return [
      el("div", { className: "lock-screen" }, [
        el("p", { className: "lock-time", text: "09.41" }),
        el("p", { className: "lock-date", text: "Kamis, 5 November" }),
        el("div", { className: "notif-card" }, [
          el("div", { className: "notif-top" }, [
            el("span", { className: "app-icon", "aria-hidden": "true", text: initial(s.sender.name) }),
            senderTap(s, tap),
            el("small", { text: "sekarang" })
          ]),
          el("strong", { className: "notif-title", text: s.subject }),
          ...paragraphs(s, tap, "notif-text")
        ])
      ])
    ];
  }

  const RENDERERS = { chat: renderChat, sms: renderSms, email: renderEmail, notif: renderNotif };

  /**
   * @param {object} scenario
   * @param {(item: { title: string, label: string, detail: string }, button: HTMLElement) => void} onInspect
   */
  function render(scenario, onInspect) {
    const tap = makeTap(onInspect);
    return el("div", { className: `phone phone-${scenario.app}`, role: "group", "aria-label": "HP simulasi" }, [
      el("div", { className: "screen" }, [
        el("div", { className: "status-bar", "aria-hidden": "true" }, [
          el("span", { text: "09.41" }),
          el("span", { className: "battery" })
        ]),
        ...RENDERERS[scenario.app](scenario, tap)
      ])
    ]);
  }

  // Setelah pemain menjawab: hijau = tanda yang ditemukan, merah = tanda yang terlewat.
  function highlight(phone, flagResult) {
    phone.querySelectorAll("[data-flag]").forEach((node) => {
      const flag = node.getAttribute("data-flag");
      if (flagResult.found.includes(flag)) node.classList.add("mark-found");
      else if (flagResult.missed.includes(flag)) node.classList.add("mark-missed");
    });
  }

  return { render, highlight };
})();
