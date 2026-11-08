/*
  Versi bahasa Inggris dari js/materi.js. Id, urutan, icon, jenis langkah, jumlah pilihan, dan
  correct harus sama persis; penjelasan setiap field ada di js/materi.js.
  Alamat situs di kuis tautan dan nama merek sungguhan tidak diterjemahkan.
*/

const MATERI = [
  {
    id: "vishing",
    icon: "phone",
    title: "Voice Phishing",
    steps: [
      {
        type: "quiz",
        question: "You get a call from an unknown number claiming to be the bank. What do you do?",
        sub: "Ever had this happen? Pick one.",
        options: [
          { text: "Hang up, then contact the bank through its official number", correct: true, why: "Exactly! It could be Voice Phishing. Check for yourself using the official number on the back of your card or in the bank's app." },
          { text: "Follow the caller's instructions", correct: false, why: "Scammers are great at talking people into things. Hang up, then check with the bank yourself." },
          { text: "Give the OTP code if asked", correct: false, why: "Never give your OTP code to anyone, including someone claiming to be bank staff." },
          { text: "Call the number back", correct: false, why: "That number belongs to the scammer. Only contact the bank through the official number you look up yourself." }
        ]
      },
      {
        type: "learn",
        title: "What is Voice Phishing (Vishing)?",
        text: [
          "A scam over phone calls or voice messages. Scammers pretend to be someone you can trust so you'll hand over important info: personal data, passwords, OTP codes, bank account details, or access to your phone.",
          "The tricks vary: your account is supposedly about to be blocked, you've supposedly won a prize draw, or the scammer claims to be bank staff.",
          "Anyone can become a victim, especially people who don't know much about online scams yet, like kids and older people."
        ]
      },
      {
        type: "voice",
        caller: "Unknown number",
        line: "Good afternoon, this is Andi from the security team at Bank Arunika. There's a five million rupiah transaction from your account. If that wasn't you, tell me the OTP code you just received so we can cancel it.",
        question: "Listen closely. What is the caller asking for?",
        options: [
          { text: "The OTP code", correct: true, why: "Right! Bank staff never ask for your OTP. Once you say that code, the scammer can get into your account." },
          { text: "An account number to send a prize to", correct: false, why: "Listen again: they asked for the OTP code you just received. That's the key to your account." },
          { text: "Nothing at all", correct: false, why: "The caller asked for your OTP code. That request is the clearest red flag." }
        ]
      },
      {
        type: "voice",
        caller: "+62 21-0000-7788",
        line: "This is our final call. In ten minutes your account will be blocked for good. Don't hang up, and don't tell anyone, this is confidential.",
        question: "What trick is the caller using?",
        options: [
          { text: "Making you panic and rush", correct: true, why: "Right! A deadline and \"don't tell anyone\" are used so you don't have time to think or ask someone else." },
          { text: "Offering a prize", correct: false, why: "There's no prize here. Just a threat of blocking and a ten-minute deadline." },
          { text: "Explaining official bank procedure", correct: false, why: "Banks don't make threats over the phone or tell you to keep it from your family." }
        ]
      },
      {
        type: "voice",
        caller: "Unknown number",
        line: "Hello? It's your uncle. My phone broke, so I'm borrowing a friend's. I'm in trouble, please transfer two million right now. I'll pay you back.",
        question: "What's the safest thing to do now?",
        options: [
          { text: "Hang up, then call your uncle on the number you already saved", correct: true, why: "Right! Check using the number you already have. Scammers often pretend to be family calling from a new number." },
          { text: "Transfer right away because it's an emergency", correct: false, why: "That sense of emergency is exactly what scammers use. Check with your uncle's old number first." },
          { text: "Send half of it first", correct: false, why: "Any amount is gone if it's a scam. Make sure it's really your uncle first." }
        ]
      },
      {
        type: "quiz",
        question: "The caller says: \"Your account will be blocked. Tell me the OTP code now!\" What's this a sign of?",
        sub: "Pick one.",
        options: [
          { text: "A sign of Voice Phishing", correct: true, why: "Threat of blocking + asking for an OTP = classic Vishing." },
          { text: "Normal bank procedure", correct: false, why: "Banks never ask for an OTP over the phone." },
          { text: "A gift from the bank", correct: false, why: "There's no gift here. Only a threat." }
        ]
      }
    ]
  },
  {
    id: "email-phishing",
    icon: "link",
    title: "Email Phishing",
    steps: [
      {
        type: "learn",
        title: "What is Email Phishing?",
        text: [
          "Ever gotten an email claiming to be from a well-known company, but with something fishy inside? It might be Email Phishing.",
          "Email Phishing is a scam using fake emails. Scammers make emails that look like they come from a company or a person we know. The email tells you to open a link, download a file, or enter personal data.",
          "To look real, scammers copy the logo, the email address, and the look of the message. The links are often made to look like the official site, but they actually lead to a fake site that steals your data."
        ],
        source: "Microsoft.com"
      },
      {
        type: "quiz",
        question: "Pick the fake website link!",
        sub: "Question 1 of 5",
        options: [
          { text: "https://www.bankmandiri.co.id", correct: false, why: "This is Bank Mandiri's official site, at bankmandiri.co.id." },
          { text: "https://www.bankmandiri-fix.com", correct: true, why: "Suspicious: \"-fix\" is tacked onto the Bank Mandiri name, and the address is different from the official site." },
          { text: "https://www.bri.co.id", correct: false, why: "This is Bank BRI's official site." },
          { text: "https://www.bni.co.id", correct: false, why: "This is Bank BNI's official site." }
        ]
      },
      {
        type: "quiz",
        question: "Pick the fake website link!",
        sub: "Question 2 of 5",
        options: [
          { text: "https://www.tokopedia.com", correct: false, why: "This is Tokopedia's official online shopping site." },
          { text: "https://www.bukalapak.com", correct: false, why: "This is Bukalapak's official site." },
          { text: "https://www.blibli.com", correct: false, why: "This is Blibli's official site." },
          { text: "https://tokopedia-promo-resmi.com", correct: true, why: "Suspicious: it uses the Tokopedia name plus \"promo-resmi\" (\"official promo\") to grab your attention." }
        ]
      },
      {
        type: "quiz",
        question: "Pick the fake website link!",
        sub: "Question 3 of 5",
        options: [
          { text: "https://gojek-bonus-saldo-gratis.com", correct: true, why: "The promise of a free balance bonus (\"bonus saldo gratis\") is bait to get you to enter your account details." },
          { text: "https://www.gojek.com", correct: false, why: "This is Gojek's official site." },
          { text: "https://www.grab.com", correct: false, why: "This is Grab's official site." },
          { text: "https://www.traveloka.com", correct: false, why: "This is Traveloka's official site." }
        ]
      },
      {
        type: "quiz",
        question: "Pick the fake website link!",
        sub: "Question 4 of 5",
        options: [
          { text: "https://www.bca.co.id", correct: false, why: "This is Bank BCA's official site." },
          { text: "https://www.cimbniaga.co.id", correct: false, why: "This is CIMB Niaga's official site." },
          { text: "https://bca.co.id.login-verifikasi.com", correct: true, why: "At a glance there's bca.co.id at the front, but the main domain is login-verifikasi.com. The BCA name is just a decoy." },
          { text: "https://www.btn.co.id", correct: false, why: "This is Bank BTN's official site." }
        ]
      },
      {
        type: "quiz",
        question: "Pick the fake website link!",
        sub: "Question 5 of 5",
        options: [
          { text: "https://shopee.co.id", correct: false, why: "This is Shopee Indonesia's official site." },
          { text: "https://shopee.co.id.hadiah-spaylater.com", correct: true, why: "Don't trust it just because it says shopee.co.id. The main domain is hadiah-spaylater.com." },
          { text: "https://www.lazada.co.id", correct: false, why: "This is Lazada Indonesia's official site." },
          { text: "https://www.tiket.com", correct: false, why: "This is Tiket.com's official site." }
        ]
      }
    ]
  },
  {
    id: "smishing",
    icon: "alert",
    title: "SMS Phishing",
    steps: [
      {
        type: "quiz",
        question: "SMS: \"Congrats! Your number won Rp10 million. Claim it at hadiah-kamu.xyz\". What do you do?",
        sub: "Pick one.",
        options: [
          { text: "Click the link to claim it", correct: false, why: "That link could lead to a fake site that steals your data." },
          { text: "Reply with your name and bank account number", correct: false, why: "Your account details end up in the scammer's hands." },
          { text: "Ignore it and delete the SMS", correct: true, why: "Exactly! You never entered that prize draw, so there's no way you won." },
          { text: "Forward it to friends so they win too", correct: false, why: "Your friends just become targets too." }
        ]
      },
      {
        type: "learn",
        title: "What is SMS Phishing (Smishing)?",
        text: [
          "A scam by SMS. It usually talks about a parcel on hold, a prize, a bill, or an account about to be blocked, plus a link you're supposed to click.",
          "The goal is to get you to click the link or reply with personal data. Check the info directly in the official app, not through the link in the SMS."
        ]
      }
    ]
  },
  {
    id: "chat-medsos",
    icon: "siapa",
    title: "Chat & Social Media Phishing",
    steps: [
      {
        type: "learn",
        title: "Phishing in chats and on social media",
        text: [
          "Scammers can use a friend's hijacked account, a fake \"official customer service\" account, or fake giveaways on social media.",
          "Warning signs: asking for an OTP code, asking for an urgent transfer, or telling you to DM your personal data. Double-check by phone or through official contacts you look up yourself."
        ]
      },
      {
        type: "quiz",
        question: "An account called \"CS Bank Official\" replies to your comment: \"DM us your card number so we can help\". What do you do?",
        sub: "Pick one.",
        options: [
          { text: "Send the card number by DM", correct: false, why: "Real customer service never asks for your card number by DM." },
          { text: "Ignore it, then find the official contact in the bank app", correct: true, why: "Exactly! Fake customer service accounts often pop up in comment sections." },
          { text: "Follow the account first to be safe", correct: false, why: "Anyone can put \"Official\" in their name." }
        ]
      }
    ]
  },
  {
    id: "quishing",
    icon: "lens",
    title: "Fake QR Codes",
    steps: [
      {
        type: "quiz",
        question: "On a café table there's a QR sticker saying \"Scan & pay, 50% off!\" stuck over the cashier's QR. What do you do?",
        sub: "Pick one.",
        options: [
          { text: "Scan it and pay right away", correct: false, why: "Your money could end up in the scammer's account." },
          { text: "Ask the cashier first which QR is official", correct: true, why: "Exactly! Fake QR stickers are often stuck on top of the real QR." },
          { text: "Scan it, then enter card details for the discount", correct: false, why: "The site could be fake and steal your card details." }
        ]
      },
      {
        type: "learn",
        title: "What is QR Phishing (Quishing)?",
        text: [
          "A scam using fake QR codes, for example stuck up in parking lots, on menus, or on promo posters. Scan one and you're taken to a fake site, or you end up paying into the scammer's account.",
          "Before you pay, check the recipient name shown in the payment app. If in doubt, ask the staff."
        ]
      }
    ]
  }
];

if (typeof module !== "undefined") module.exports = MATERI;
