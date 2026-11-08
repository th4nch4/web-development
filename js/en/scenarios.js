/*
  Versi bahasa Inggris dari js/scenarios.js. Halaman memuat file ini SEBAGAI GANTI js/scenarios.js,
  jadi isinya harus lengkap dan berdiri sendiri.

  Aturan dan penjelasan setiap field ada di js/scenarios.js. Yang wajib sama persis dengan versi Indonesia:
  urutan, id, key, susunan, flag/flags, steps, correct, url, button, angka, nama fiktif, nomor, dan alamat link.
  Hanya teks yang dibaca pemain yang diterjemahkan. Jalankan tes setelah mengedit:
  node --test tests/logic.test.js tests/scenarios.test.js
*/

const UNITS = [
  { id: 1, title: "Part 1", subtitle: "Parcels, files, and links", world: "Parcel Town", icon: "box" },
  { id: 2, title: "Part 2", subtitle: "OTP codes and real messages", world: "Code Fortress", icon: "key" }
];

const SCENARIOS = [
  {
    id: "undangan-apk",
    coach: { intro: "A wedding invite from a new number. RSVP, or get suspicious first?", good: "Real invitations don't need installing. The wedding isn't on the Play Store!", bad: "That almost got installed! Good thing it's just practice." },
    unit: 1,
    icon: "invite",
    title: "Wedding invitation",
    app: "chat",
    sender: {
      name: "+62 812-0000-1234",
      detail: "This number isn't saved in your contacts and has no profile photo.",
      flag: "siapa"
    },
    messages: [
      ["Assalamualaikum, we'd like to invite you to our wedding."],
      [{ text: "The full invitation is in this file", flag: "file" }, ". ", { text: "Please open it right away", flag: "buru" }, "."]
    ],
    attachment: {
      name: "Wedding Invitation.apk",
      size: "4.2 MB",
      detail: "File type: Android app (.apk), not a document. Once installed, the app can ask for permission to read your SMS and notifications.",
      flag: "file"
    },
    flags: ["siapa", "file", "buru"],
    verdict: "This is a scam. The invitation was sent as an .apk app by a number you don't know.",
    evidence: {
      siapa: "The number isn't in your contacts and has no profile photo, yet it claims to be inviting you.",
      file: "The invitation is an .apk file. That's an app, not an invitation.",
      buru: "\"Please open it right away\" is there so you don't have time to think."
    },
    clear: {
      link: "This message has no link. The danger is in the attached file.",
      minta: "Nothing is asked for directly yet. It's the app that steals your data later."
    },
    actions: [
      { label: "Open the invitation file", correct: false, why: "An .apk file installs an app. Apps like this can read your SMS, including your bank's OTP codes." },
      { label: "Don't open it. Ask friends or family if anyone is getting married", correct: true, why: "If the invitation is real, the people close to you will probably know. You're checking through another channel, not through that message." },
      { label: "Block and report the number", correct: true, why: "An unknown number sending an app file doesn't need a reply." }
    ],
    takeaway: "Invitations, parcel photos, and traffic tickets never come as .apk files. If you're asked to install something, stop."
  },
  {
    id: "pesanan-dikirim",
    coach: { intro: "You bought shoes yesterday, and now this notification pops up. Suspicious or chill?", good: "Nice! Not every notification is a trap.", bad: "Relax, this is a normal notification from an app you use yourself." },
    unit: 1,
    icon: "truck",
    title: "Order shipped",
    app: "notif",
    context: "Yesterday you ordered shoes on the Pasar Rimbun shopping app.",
    sender: {
      name: "Pasar Rimbun",
      detail: "A notification from the Pasar Rimbun app, which you installed yourself from the official app store."
    },
    subject: "Your order is on its way",
    messages: [
      ["Order #PR-20817 (shoes) has been handed to the courier. Estimated arrival Friday, 6 Nov. Track it on the Orders page."]
    ],
    flags: [],
    verdict: "This is a real message. It comes from the official app, matches your order, has no link, and doesn't ask for anything.",
    evidence: {},
    clear: {
      siapa: "It comes from the official app you installed yourself, and it matches your order from yesterday.",
      buru: "No threats or deadlines.",
      minta: "It doesn't ask for data, codes, or money. It just tells you your order status."
    },
    actions: [
      { label: "Open the Pasar Rimbun app and check the Orders page", correct: true, why: "You're checking directly in the official app." },
      { label: "Report it as a scam", correct: false, why: "There are no red flags here. Reporting real messages makes you miss important info." },
      { label: "Look up Pasar Rimbun's customer service number on social media to make sure", correct: false, why: "No need, and it's risky: social media is full of fake customer service accounts. If in doubt, check directly in the official app." }
    ],
    takeaway: "Real messages usually don't pressure you or ask for anything. If in doubt, check directly in the official app, not through a link or number from the message."
  },
  {
    id: "paket-tertahan",
    coach: { intro: "Your parcel is supposedly stuck at the warehouse. And the courier texted you personally, huh.", good: "Awesome, you didn't take the pocket-change shipping fee bait!", bad: "The fee is pocket change, but what they're after is your card details!" },
    unit: 1,
    icon: "box",
    title: "Parcel on hold",
    app: "sms",
    sender: {
      name: "+62 857-0000-7781",
      detail: "Just an ordinary personal phone number, not the courier's official sender name.",
      flag: "siapa"
    },
    messages: [
      [
        "[Ekspedisi Lintang] Your parcel is on hold at our warehouse because the address is incomplete. ",
        { text: "Update your address and pay a Rp12,500 redelivery fee", flag: "minta" },
        " at ",
        {
          text: "lintang-paket-update.top/bayar",
          url: "http://lintang-paket-update.top/bayar",
          detail: "Domain: lintang-paket-update.top. The official Ekspedisi Lintang website is ekspedisilintang.co.id.",
          flag: "link"
        },
        ". ",
        { text: "Parcel returned to sender in 2 hours.", flag: "buru" }
      ]
    ],
    flags: ["siapa", "link", "buru", "minta"],
    verdict: "This is a scam. The link isn't the courier's website, and you're told to pay before a deadline.",
    evidence: {
      siapa: "Sent from a personal phone number, even though it claims to be a courier.",
      link: "The address is lintang-paket-update.top, not ekspedisilintang.co.id.",
      buru: "\"Returned to sender in 2 hours\" is there so you pay right away.",
      minta: "You're asked to fill in your details and pay through a link. What they're after isn't the Rp12,500, it's your card or bank account details."
    },
    clear: {
      file: "This message has no file. The danger is in the link."
    },
    actions: [
      { label: "Open the link and pay, it's only Rp12,500", correct: false, why: "The small amount is on purpose, so you don't think twice. The card details you enter can be used for much bigger transactions." },
      { label: "Check the tracking number in the courier's official app or website", correct: true, why: "You're checking through a channel you found yourself, not through the link in the message." },
      { label: "Delete the message and block the number", correct: true, why: "Official couriers don't ask for fees by SMS from a personal number." }
    ],
    takeaway: "Scammers ask for small amounts on purpose so you won't get suspicious. Only check your parcels through the official app or website.",
    steps: ["find", "match", "url", "action"],
    linkQuiz: {
      question: "Which one is the official Ekspedisi Lintang website?",
      options: [
        { text: "lintang-paket-update.top", correct: false },
        { text: "ekspedisilintang.co.id", correct: true },
        { text: "ekspedisi-lintang.id-cek.com", correct: false }
      ],
      why: "Look at the very last part before the slash. The official site ends in ekspedisilintang.co.id; the others just have look-alike words stuck on."
    }
  },
  {
    id: "akun-bank-diblokir",
    coach: { intro: "An email from the \"bank\" first thing in the morning. Grab a coffee, then check it carefully!", good: "Bank-level detective! Even one letter in disguise got caught.", bad: "The scammer only changed one letter. Sneaky, right?" },
    unit: 1,
    icon: "bank",
    title: "Bank account blocked",
    app: "email",
    sender: {
      name: "Bank Arunika",
      address: "keamanan@bankarunika-verifikasi.com",
      detail: "Sender address: keamanan@bankarunika-verifikasi.com. Official Bank Arunika emails use the bankarunika.co.id domain.",
      flag: "siapa"
    },
    subject: "[IMPORTANT] Your account has been temporarily blocked",
    messages: [
      ["Dear Customer, here is an update about your account."],
      [{ text: "Your account will be permanently closed in 24 hours", flag: "buru" }, " unless verified immediately."],
      [{ text: "Please log in and enter your PIN and OTP", flag: "minta" }, " using the button below."],
      [{
        text: "Verify Now",
        url: "http://bankarunlka.co/login",
        detail: "The button's real address: bankarunlka.co/login. Look closely: \"arunlka\" uses the letter L, not i. This is not bankarunika.co.id.",
        flag: "link",
        button: true
      }]
    ],
    flags: ["siapa", "link", "buru", "minta"],
    verdict: "This is a scam. The sender's name says Bank Arunika, but the email address and the button lead to other domains.",
    evidence: {
      siapa: "The name shown is \"Bank Arunika\", but the email address is bankarunika-verifikasi.com.",
      link: "The button leads to bankarunlka.co, a copycat domain with one letter swapped.",
      buru: "\"Permanently closed in 24 hours\" is a threat to make you panic.",
      minta: "Banks never ask for your PIN or OTP code by email."
    },
    clear: {
      file: "No attachment. The trap is the button."
    },
    actions: [
      { label: "Click the button and verify the account", correct: false, why: "That page is a fake. The PIN and OTP you enter go straight to the scammer." },
      { label: "Open the official bank app or call the number on the back of your card", correct: true, why: "If there really is a problem, you'll find the info in the official app too." },
      { label: "Reply to the email and ask if it's real", correct: false, why: "The scammer reads your reply, and of course they'll say it's real." }
    ],
    takeaway: "Banks never ask for your PIN or OTP by email, chat, or phone. Always check the real address, not the name that's shown.",
    steps: ["find", "url", "match", "action"],
    linkQuiz: {
      question: "Which one is Bank Arunika's real address?",
      options: [
        { text: "bankarunlka.co", correct: false },
        { text: "bankarunika-verifikasi.com", correct: false },
        { text: "bankarunika.co.id", correct: true }
      ],
      why: "Read it letter by letter: \"arunlka\" uses the letter L. The extra \"-verifikasi\" also makes the address different. The only real one is bankarunika.co.id."
    }
  },
  {
    id: "teman-minta-kode",
    coach: { intro: "Dimas suddenly messages you asking for help. He's your friend and all... but check first!", good: "A real friend would never ask for your OTP code.", bad: "That code is the key to your account. Not even Dimas gets to know it!" },
    unit: 2,
    icon: "chat",
    title: "Friend asking for a code",
    app: "chat",
    sender: {
      name: "Dimas",
      detail: "Saved in your contacts as Dimas, with his usual number. But a hijacked account also shows up with its real name and number.",
      flag: "siapa"
    },
    notice: "New SMS: Your chat account verification code is 482913. Do not share this code with anyone.",
    messages: [
      ["Hey sorry, I typed in the wrong number when I signed up. The code got sent to your number instead"],
      [{ text: "Please send the 6-digit code you just got", flag: "minta" }],
      [{ text: "Hurry, the code only works for 5 minutes", flag: "buru" }]
    ],
    flags: ["siapa", "buru", "minta"],
    verdict: "This is a scam. That code is for logging into your own account, and Dimas's account has probably been hijacked.",
    evidence: {
      siapa: "The name really is Dimas, but that's no guarantee. A hijacked account still shows its real name.",
      buru: "\"Only works for 5 minutes\" is there so you don't have time to call Dimas.",
      minta: "You're asked for a verification code. That code is the key to your own account."
    },
    clear: {
      link: "No link here. The trap is the request for the code."
    },
    actions: [
      { label: "Send the code, poor Dimas", correct: false, why: "That code logs into your account. If you send it, your account gets taken over and used to scam your friends." },
      { label: "Call Dimas with a regular phone call, not through the chat app", correct: true, why: "If his chat account is hijacked, a call inside that app could be answered by the scammer. A regular call to the number you saved, or meeting in person, is much harder to fake." },
      { label: "Don't send it, and warn other friends that Dimas's account may be hijacked", correct: true, why: "You protect yourself and other friends who might also be asked for a code." }
    ],
    takeaway: "An OTP code is the key to your own account. Whoever asks for it, whether a friend, family, or an official, don't give it out.",
    steps: ["find", "match", "reply", "action"],
    reply: {
      prompt: "Warn your friend group. Build the message:",
      words: ["Dimas's", "account", "probably got", "hijacked,", "don't", "send", "codes"],
      extra: ["just", "quick", "it's fine"],
      why: "Other friends might also be asked for a code. A short warning can save their accounts."
    }
  },
  {
    id: "kode-otp-asli",
    coach: { intro: "You just logged in, and then this SMS came in. Safe or a trap?", good: "Correct! The code is for you to use yourself.", bad: "Relax, you're the one who asked for this code." },
    unit: 2,
    icon: "key",
    title: "OTP code",
    app: "sms",
    context: "You just tapped the Log In button in the Bank Arunika app on your own phone.",
    sender: {
      name: "ARUNIKA",
      detail: "The bank's sender name. Names like this can be faked, but this code arrived right after you tapped Log In yourself."
    },
    messages: [
      ["Your OTP code: 739204. Valid for 3 minutes. DO NOT share this code with anyone, including bank staff."]
    ],
    flags: [],
    verdict: "This is a real message. You asked for this code yourself, and the message doesn't ask you for anything.",
    evidence: {},
    clear: {
      siapa: "Sender names can be faked, but this code arrived right after you tapped Log In yourself, and the message doesn't ask for anything.",
      buru: "A 3-minute limit is normal for an OTP code. The message doesn't threaten or pressure you.",
      minta: "This message doesn't ask for anything. In fact, it reminds you not to share the code."
    },
    actions: [
      { label: "Enter the code in the bank app you have open", correct: true, why: "This code is for you to use yourself, in an app you opened yourself." },
      { label: "Ignore it. Every SMS with a code must be a scam", correct: false, why: "If you suspect every message, you can't use official services. You asked for this code yourself." },
      { label: "Forward the code to the family group so it's saved", correct: false, why: "OTP codes must never be forwarded to anyone, including family. Just use it once, yourself." }
    ],
    takeaway: "An SMS with a code is normal if you asked for it yourself. Use it yourself, and never forward it."
  }
];

// Ronde Kilat "Real or Scam?". Penjelasan field ada di js/scenarios.js.
const QUICK_ROUND = [
  { unit: 1, sender: "+62 813-0000-4410", app: "SMS", text: "Your parcel couldn't be delivered. Pay the redelivery fee at lintang-kirim.xyz today.", scam: true, why: "Personal number, weird link, and asks you to pay. Just check the tracking number in the official app." },
  { unit: 1, sender: "Mom", app: "Chat", text: "Hey sweetie, grab some eggs on your way home, okay?", scam: false, why: "No link, no request for data or money. Just an ordinary request." },
  { unit: 1, sender: "+62 821-0000-9031", app: "Chat", text: "Congrats! You won a Rp50 million prize draw. Claim before 12:00 at rimbun-hadiah.site", scam: true, why: "A prize from a draw you never entered, a deadline, and a weird link." },
  { unit: 1, sender: "Pasar Rimbun", app: "Notification", text: "Flash sale starts at 12:00. Check the Promo page in the app.", scam: false, why: "From the official app, no link, doesn't ask for anything." },
  { unit: 1, sender: "Traffic Ticket Info", app: "SMS", text: "You got an electronic traffic ticket. See the proof in the file Traffic_Ticket.apk", scam: true, why: "Traffic tickets never come as .apk files." },
  { unit: 2, sender: "Rani", app: "Chat", text: "I'm at the café already, where are you?", scam: false, why: "A friend you actually made plans with, not asking for anything." },
  { unit: 2, sender: "+62 857-0000-2208", app: "Chat", text: "It's me, I changed my number. Can I borrow Rp500,000 for now? It's a real emergency.", scam: true, why: "Claims to be a friend from a new number and asks for money right away. Call their old number first." },
  { unit: 2, sender: "Bank Arunika", app: "Email", text: "Your monthly account statement is now available in the Bank Arunika app.", scam: false, why: "No link, no request for data. Just check it yourself in the app." },
  { unit: 2, sender: "Job Offer", app: "Chat", text: "Easy job: like videos and earn Rp150,000/day. Sign up first by paying Rp50,000.", scam: true, why: "A job that makes you pay upfront is almost certainly a scam." },
  { unit: 2, sender: "+62 812-0000-7765", app: "Chat", text: "Hi, I'm from Bank Arunika customer service. Please tell me the OTP code you just received.", scam: true, why: "Bank staff never ask for OTP codes." }
];

if (typeof module !== "undefined") module.exports = { UNITS, SCENARIOS, QUICK_ROUND };
