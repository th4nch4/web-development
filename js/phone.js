// Menggambar HP simulasi dari data skenario (chat, sms, email, atau notifikasi).
const CekPhone = (() => {
  const { el } = CekUI;
  const { t } = CekLang;

  function initial(name) {
    return /^[A-Za-z]/.test(name) ? name[0].toUpperCase() : "#";
  }

  function fileExtension(name) {
    return name.split(".").pop().toUpperCase();
  }

  // Setiap bagian pesan dibungkus .part. Tampilannya teks biasa (tidak bisa diketuk dan tidak disorot).
  // data-flag kosong berarti bagian itu wajar;
  // data-label adalah teks pilihan di soal "Apa yang salah dari pesan ini?".
  function part(label, flag, className, content) {
    return el("span", {
      className: `part ${className}`,
      "data-flag": flag || "",
      "data-label": label
    }, content || label);
  }

  // Teks biasa dipecah per kalimat. Potongan pendek (titik, "di") tetap teks biasa.
  const SENTENCE_END = /(?<=[.!?])\s+/;
  const isWholeSentence = (text) => text.trim().split(/\s+/).length >= 3;

  function plainText(text, piece) {
    return text.split(SENTENCE_END).flatMap((sentence, index, all) => {
      const spacer = index < all.length - 1 ? " " : "";
      return isWholeSentence(sentence) ? [piece(sentence, "", "part-text"), spacer] : [sentence + spacer];
    });
  }

  function segment(part, piece) {
    if (typeof part === "string") return plainText(part, piece);
    if (part.url && part.button) {
      // Tombol di email: alamat aslinya ditampilkan kecil di bawahnya, seperti pratinjau link.
      return [piece(part.text, part.flag, "tap-button"), el("small", { className: "link-preview", text: part.url.replace(/^https?:\/\//, "") })];
    }
    return piece(part.text, part.flag, part.url ? "tap-link" : "part-text");
  }

  function scenarioBubbles(scenario, piece, className) {
    return scenario.messages.map((bubble) => el("p", { className }, bubble.flatMap((part) => segment(part, piece))));
  }

  function senderTap(scenario, piece) {
    const { sender } = scenario;
    return piece(t("phone.sender", { name: sender.name }), sender.flag, "tap-sender", sender.name);
  }

  const TIME = t("phone.time");
  const glyph = (name, className) => el("span", { className: `glyph ${className || ""}`, "aria-hidden": "true" }, CekUI.icon(name));

  // Jam kecil di pojok gelembung, seperti di WhatsApp.
  function withMeta(bubble) {
    bubble.append(el("span", { className: "meta", "aria-hidden": "true", text: TIME }));
    return bubble;
  }

  // Tampilan WhatsApp di iPhone: header terang, wallpaper bermotif, gelembung berekor, bar ketik.
  function renderChat(s, piece) {
    const file = s.attachment && withMeta(el("div", { className: "bubble bubble-file" }, [
      piece(t("phone.file", { name: s.attachment.name }), s.attachment.flag, "tap-file", [
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
        el("div", { className: "chat-title" }, [senderTap(s, piece)]),
        glyph("video", "chat-action"),
        glyph("phone", "chat-action")
      ]),
      el("div", { className: "app-body chat-body" }, [
        el("p", { className: "date-chip", "aria-hidden": "true", text: t("phone.today") }),
        s.notice && el("p", { className: "system-notice" }, plainText(s.notice, piece)),
        ...scenarioBubbles(s, piece, "bubble").map((bubble) => withMeta(bubble)),
        file
      ]),
      el("div", { className: "chat-input", "aria-hidden": "true" }, [
        glyph("plus"),
        el("span", { className: "chat-field" }, [t("phone.typeMessage"), glyph("sticker")]),
        glyph("camera"),
        glyph("mic")
      ])
    ];
  }

  // Tampilan Pesan (SMS) di iPhone: nama di tengah, gelembung abu berekor.
  function renderSms(s, piece) {
    return [
      el("div", { className: "app-header sms-header" }, [
        glyph("chevron", "chat-back"),
        el("div", { className: "sms-contact" }, [
          el("span", { className: "avatar", "aria-hidden": "true", text: initial(s.sender.name) }),
          senderTap(s, piece)
        ])
      ]),
      el("div", { className: "app-body sms-body" }, [
        el("p", { className: "sms-stamp", "aria-hidden": "true" }, [el("strong", { text: t("phone.textMessage") }), ` · ${t("phone.todayAt", { time: TIME })}`]),
        ...scenarioBubbles(s, piece, "bubble")
      ]),
      el("div", { className: "chat-input sms-input", "aria-hidden": "true" }, [
        glyph("plus"),
        el("span", { className: "chat-field", text: t("phone.textMessage") })
      ])
    ];
  }

  function renderEmail(s, piece) {
    return [
      el("div", { className: "app-header email-header" }, [glyph("chevron", "chat-back"), t("phone.inbox")]),
      el("div", { className: "app-body email-body" }, [
        el("h3", { className: "email-subject", text: s.subject }),
        el("div", { className: "email-from" }, [
          el("span", { className: "avatar", "aria-hidden": "true", text: initial(s.sender.name) }),
          el("div", {}, [senderTap(s, piece), el("small", { text: s.sender.address || t("phone.toMe") })])
        ]),
        ...scenarioBubbles(s, piece, "email-paragraph")
      ])
    ];
  }

  function renderNotif(s, piece) {
    return [
      el("div", { className: "lock-screen" }, [
        el("p", { className: "lock-time", text: TIME }),
        el("p", { className: "lock-date", text: t("phone.lockDate") }),
        el("div", { className: "notif-card" }, [
          el("div", { className: "notif-top" }, [
            el("span", { className: "app-icon", "aria-hidden": "true", text: initial(s.sender.name) }),
            senderTap(s, piece),
            el("small", { text: t("phone.now") })
          ]),
          el("strong", { className: "notif-title", text: s.subject }),
          ...scenarioBubbles(s, piece, "notif-text")
        ])
      ])
    ];
  }

  const RENDERERS = { chat: renderChat, sms: renderSms, email: renderEmail, notif: renderNotif };

  /** @param {object} scenario */
  function render(scenario) {
    return el("div", { className: `phone phone-${scenario.app}`, role: "group", "aria-label": t("phone.label") }, [
      el("div", { className: "screen" }, [
        el("div", { className: "status-bar", "aria-hidden": "true" }, [
          el("span", { className: "status-time", text: TIME }),
          el("span", { className: "island" }),
          el("span", { className: "status-icons" }, [CekUI.icon("signal"), CekUI.icon("wifi"), el("span", { className: "battery" })])
        ]),
        ...RENDERERS[scenario.app](scenario, part)
      ])
    ]);
  }

  /** Bagian-bagian pesan, urut seperti di layar. */
  function parts(phone) {
    return [...phone.querySelectorAll(".part")];
  }

  return { render, parts };
})();
