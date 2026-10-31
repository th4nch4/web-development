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

  function scenarioBubbles(scenario, tap, className) {
    return scenario.messages.map((bubble) => el("p", { className }, bubble.map((part) => segment(part, tap))));
  }

  function senderTap(scenario, tap) {
    const { sender } = scenario;
    return tap("sender", sender.name, sender.detail, sender.flag, "tap-sender", sender.name);
  }

  const TIME = "09.41";
  const glyph = (name, className) => el("span", { className: `glyph ${className || ""}`, "aria-hidden": "true" }, CekUI.icon(name));

  // Jam kecil di pojok gelembung, seperti di WhatsApp.
  function withMeta(bubble) {
    bubble.append(el("span", { className: "meta", "aria-hidden": "true", text: TIME }));
    return bubble;
  }

  // Tampilan WhatsApp di iPhone: header terang, wallpaper bermotif, gelembung berekor, bar ketik.
  function renderChat(s, tap) {
    const file = s.attachment && withMeta(el("div", { className: "bubble bubble-file" }, [
      tap("attachment", s.attachment.name, s.attachment.detail, s.attachment.flag, "tap-file", [
        el("span", { className: "file-icon", "aria-hidden": "true", text: fileExtension(s.attachment.name) }),
        el("span", { className: "file-meta" }, [
          el("strong", { text: s.attachment.name }),
          el("small", { text: `${s.attachment.size} · ${fileExtension(s.attachment.name)}` })
        ])
      ])
    ]));
    return [
      el("div", { className: "app-header chat-header" }, [
        glyph("chevron", "chat-back"),
        el("span", { className: "avatar", "aria-hidden": "true", text: initial(s.sender.name) }),
        el("div", { className: "chat-title" }, [
          senderTap(s, tap),
          el("small", { "aria-hidden": "true", text: "ketuk untuk info kontak" })
        ]),
        glyph("video", "chat-action"),
        glyph("phone", "chat-action")
      ]),
      el("div", { className: "app-body chat-body" }, [
        el("p", { className: "date-chip", "aria-hidden": "true", text: "Hari ini" }),
        s.notice && el("p", { className: "system-notice", text: s.notice }),
        ...scenarioBubbles(s, tap, "bubble").map((bubble) => withMeta(bubble)),
        file
      ]),
      el("div", { className: "chat-input", "aria-hidden": "true" }, [
        glyph("plus"),
        el("span", { className: "chat-field" }, ["Ketik pesan", glyph("sticker")]),
        glyph("camera"),
        glyph("mic")
      ])
    ];
  }

  // Tampilan Pesan (SMS) di iPhone: nama di tengah, gelembung abu berekor.
  function renderSms(s, tap) {
    return [
      el("div", { className: "app-header sms-header" }, [
        glyph("chevron", "chat-back"),
        el("div", { className: "sms-contact" }, [
          el("span", { className: "avatar", "aria-hidden": "true", text: initial(s.sender.name) }),
          senderTap(s, tap)
        ])
      ]),
      el("div", { className: "app-body sms-body" }, [
        el("p", { className: "sms-stamp", "aria-hidden": "true" }, [el("strong", { text: "Pesan Teks" }), ` · Hari ini ${TIME}`]),
        ...scenarioBubbles(s, tap, "bubble")
      ]),
      el("div", { className: "chat-input sms-input", "aria-hidden": "true" }, [
        glyph("plus"),
        el("span", { className: "chat-field", text: "Pesan Teks" })
      ])
    ];
  }

  function renderEmail(s, tap) {
    return [
      el("div", { className: "app-header email-header" }, [glyph("chevron", "chat-back"), "Kotak Masuk"]),
      el("div", { className: "app-body email-body" }, [
        el("h3", { className: "email-subject", text: s.subject }),
        el("div", { className: "email-from" }, [
          el("span", { className: "avatar", "aria-hidden": "true", text: initial(s.sender.name) }),
          el("div", {}, [senderTap(s, tap), el("small", { text: "kepada saya" })])
        ]),
        ...scenarioBubbles(s, tap, "email-paragraph")
      ])
    ];
  }

  function renderNotif(s, tap) {
    return [
      el("div", { className: "lock-screen" }, [
        el("p", { className: "lock-time", text: TIME }),
        el("p", { className: "lock-date", text: "Kamis, 5 November" }),
        el("div", { className: "notif-card" }, [
          el("div", { className: "notif-top" }, [
            el("span", { className: "app-icon", "aria-hidden": "true", text: initial(s.sender.name) }),
            senderTap(s, tap),
            el("small", { text: "sekarang" })
          ]),
          el("strong", { className: "notif-title", text: s.subject }),
          ...scenarioBubbles(s, tap, "notif-text")
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
          el("span", { className: "status-time", text: TIME }),
          el("span", { className: "island" }),
          el("span", { className: "status-icons" }, [CekUI.icon("signal"), CekUI.icon("wifi"), el("span", { className: "battery" })])
        ]),
        ...RENDERERS[scenario.app](scenario, tap)
      ])
    ]);
  }

  // Setelah pemain menjawab: mark-found = tanda yang ditemukan, mark-missed = tanda yang terlewat.
  function highlight(phone, flagResult) {
    phone.querySelectorAll("[data-flag]").forEach((node) => {
      const flag = node.getAttribute("data-flag");
      if (flagResult.found.includes(flag)) node.classList.add("mark-found");
      else if (flagResult.missed.includes(flag)) node.classList.add("mark-missed");
    });
  }

  return { render, highlight };
})();
