# Wedding Invitation Web App — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a static wedding invitation web app deployable on GitHub Pages with RSVP, guest wishes, countdown, maps, calendar reminder, and bilingual support — all backed by Google Sheets via Google Apps Script.

**Architecture:** Pure static HTML/CSS/Vanilla JS. No build step, no framework, no server. All dynamic data (RSVP, guest wishes) flows through Google Apps Script endpoints to Google Sheets. Content is driven by `config.js`.

**Tech Stack:** HTML5, CSS3, Vanilla JS (ES6+), Google Apps Script, Google Sheets, GitHub Pages

**Reference:** PRD v1.1.0 — `PRD-wedding-invitation-v1.1.0.md`

---

## Phase Overview

| Phase | Description |
|---|---|
| 1 | Repo & project structure setup |
| 2 | config.js schema |
| 3 | Base HTML layout & CSS foundation |
| 4 | Language engine (i18n) |
| 5 | URL param & mode detection |
| 6 | Hero section |
| 7 | Event / timeline section |
| 8 | Countdown section |
| 9 | Maps section |
| 10 | Calendar reminder |
| 11 | RSVP section |
| 12 | Guest Wish section |
| 13 | Google Apps Script backend |
| 14 | GitHub Pages deployment |
| 15 | Final QA checklist |

---

## Phase 1 — Repo & Project Structure

### Task 1.1: Create GitHub repository

**Objective:** Create the GitHub repo that will be used for GitHub Pages deployment.

**Steps:**

1. Go to https://github.com/new
2. Repository name: `wedding-invitation` (or preferred name)
3. Set visibility: **Public** (required for GitHub Pages free tier)
4. Initialize with README: Yes
5. Click **Create repository**
6. Clone locally:
```bash
git clone https://github.com/<username>/wedding-invitation.git
cd wedding-invitation
```

**Verify:** Folder exists locally with `.git` directory.

---

### Task 1.2: Create project folder structure

**Objective:** Set up the correct file structure before writing any code.

**Files to create:**
```
wedding-invitation/
├── index.html
├── style.css
├── script.js
├── config.js
├── i18n.js
├── assets/
│   ├── ornament-top.svg        (placeholder)
│   ├── ornament-bottom.svg     (placeholder)
│   └── favicon.ico             (placeholder)
└── apps-script/
    └── Code.gs
```

**Steps:**

1. Create all files and folders:
```bash
touch index.html style.css script.js config.js i18n.js
mkdir -p assets apps-script
touch assets/ornament-top.svg assets/ornament-bottom.svg
touch apps-script/Code.gs
```

2. Commit:
```bash
git add .
git commit -m "chore: initialize project structure"
git push
```

**Verify:** All files exist. `git status` shows clean working tree.

---

## Phase 2 — config.js Schema

### Task 2.1: Write config.js with full schema

**Objective:** Create the single source of truth for all event data, theme, and settings.

**File:** `config.js`

**Step 1: Write config.js**

```javascript
const CONFIG = {
  // App mode — overridden by ?to= URL param at runtime
  // "invite" = full invitation with RSVP
  // "announce" = announcement only, no RSVP
  defaultMode: "announce",
  defaultLanguage: "id", // "id" | "en"

  // Couple identity
  couple: {
    groom: {
      name: "Nama Pria",           // Short name for display
      fullName: "Nama Lengkap Pria",
      parents: "Putra dari Bapak X dan Ibu Y"
    },
    bride: {
      name: "Nama Wanita",
      fullName: "Nama Lengkap Wanita",
      parents: "Putri dari Bapak A dan Ibu B"
    }
  },

  // Events — can be 1 (akad only) or 2 (akad + resepsi)
  events: [
    {
      id: "akad",
      title: {
        id: "Akad Nikah",
        en: "Akad Nikah (Religious Ceremony)"
      },
      date: "2026-12-12",          // YYYY-MM-DD
      time: "09.00 WIB - Selesai",
      venue: "Nama Masjid / Gedung",
      address: "Jl. Alamat Lengkap, Kota",
      mapEmbedUrl: "",             // Google Maps embed iframe src URL
      mapDirectUrl: "",            // Google Maps direct link (goo.gl/maps/...)
      isCountdownTarget: true      // Which event drives the countdown
    }
    // Uncomment to add resepsi:
    // {
    //   id: "resepsi",
    //   title: { id: "Resepsi", en: "Wedding Reception" },
    //   date: "2026-12-12",
    //   time: "11.00 - 14.00 WIB",
    //   venue: "Nama Gedung",
    //   address: "Jl. Alamat, Kota",
    //   mapEmbedUrl: "",
    //   mapDirectUrl: "",
    //   isCountdownTarget: false
    // }
  ],

  // RSVP settings
  rsvp: {
    enabled: true,
    deadlineDays: 7,               // RSVP closes H-7 before event
    maxPartySize: 10,
    endpointUrl: ""                // REQUIRED: Apps Script Web App URL
  },

  // Guest wish settings
  guestWish: {
    enabled: true,
    endpointUrl: ""                // REQUIRED: Apps Script Web App URL
  },

  // Visual theme
  theme: {
    bgColor: "#FAF7F2",
    primaryColor: "#2C2C2C",
    accentColor: "#8A9E85",
    secondaryAccent: "#C9A84C",
    fontHeading: "Playfair Display",
    fontBody: "Inter"
  }
};
```

**Step 2: Commit**
```bash
git add config.js
git commit -m "feat: add config.js schema"
git push
```

**Verify:** Open `config.js` in browser console — `CONFIG` object accessible without errors.

---

## Phase 3 — Base HTML Layout & CSS Foundation

### Task 3.1: Write base HTML structure

**Objective:** Create the full one-page HTML skeleton with all sections present.

**File:** `index.html`

**Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Wedding Invitation" />
  <title>Wedding Invitation</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <!-- LANGUAGE TOGGLE (sticky) -->
  <button id="lang-toggle" class="lang-toggle" aria-label="Switch language">
    <span id="lang-label">EN</span>
  </button>

  <!-- HERO SECTION -->
  <section id="hero" class="section section-hero">
    <div class="ornament ornament-top">
      <img src="assets/ornament-top.svg" alt="" aria-hidden="true" />
    </div>
    <p id="hero-to" class="hero-to hidden"></p>
    <p class="hero-label" data-i18n="hero.label"></p>
    <h1 class="hero-names">
      <span id="groom-name"></span>
      <span class="hero-ampersand">&</span>
      <span id="bride-name"></span>
    </h1>
    <p id="hero-date" class="hero-date"></p>
    <p id="hero-city" class="hero-city"></p>
    <div class="ornament ornament-bottom">
      <img src="assets/ornament-bottom.svg" alt="" aria-hidden="true" />
    </div>
  </section>

  <!-- OPENING / COUPLE SECTION -->
  <section id="couple" class="section section-couple">
    <h2 class="section-title" data-i18n="couple.title"></h2>
    <div class="couple-grid">
      <div class="couple-card">
        <p class="couple-fullname" id="groom-fullname"></p>
        <p class="couple-parents" id="groom-parents"></p>
      </div>
      <div class="couple-divider">&</div>
      <div class="couple-card">
        <p class="couple-fullname" id="bride-fullname"></p>
        <p class="couple-parents" id="bride-parents"></p>
      </div>
    </div>
  </section>

  <!-- EVENT / TIMELINE SECTION -->
  <section id="events" class="section section-events">
    <h2 class="section-title" data-i18n="events.title"></h2>
    <div id="events-list" class="events-list"></div>
  </section>

  <!-- COUNTDOWN SECTION -->
  <section id="countdown" class="section section-countdown">
    <h2 class="section-title" data-i18n="countdown.title"></h2>
    <div class="countdown-grid">
      <div class="countdown-item">
        <span id="cd-days" class="countdown-number">00</span>
        <span class="countdown-label" data-i18n="countdown.days"></span>
      </div>
      <div class="countdown-item">
        <span id="cd-hours" class="countdown-number">00</span>
        <span class="countdown-label" data-i18n="countdown.hours"></span>
      </div>
      <div class="countdown-item">
        <span id="cd-minutes" class="countdown-number">00</span>
        <span class="countdown-label" data-i18n="countdown.minutes"></span>
      </div>
      <div class="countdown-item">
        <span id="cd-seconds" class="countdown-number">00</span>
        <span class="countdown-label" data-i18n="countdown.seconds"></span>
      </div>
    </div>
    <p id="countdown-passed" class="countdown-passed hidden" data-i18n="countdown.passed"></p>
  </section>

  <!-- MAPS SECTION -->
  <section id="maps" class="section section-maps">
    <h2 class="section-title" data-i18n="maps.title"></h2>
    <div id="maps-list" class="maps-list"></div>
  </section>

  <!-- RSVP SECTION (Invitation Mode only) -->
  <section id="rsvp" class="section section-rsvp hidden">
    <h2 class="section-title" data-i18n="rsvp.title"></h2>
    <div id="rsvp-closed" class="rsvp-closed hidden">
      <p data-i18n="rsvp.closed"></p>
    </div>
    <form id="rsvp-form" class="form" novalidate>
      <div class="form-group">
        <label for="rsvp-name" data-i18n="rsvp.name"></label>
        <input type="text" id="rsvp-name" name="name" required autocomplete="name" />
      </div>
      <div class="form-group">
        <label data-i18n="rsvp.attendance"></label>
        <div class="toggle-group">
          <button type="button" id="btn-attend" class="toggle-btn active" data-value="attending" data-i18n="rsvp.attending"></button>
          <button type="button" id="btn-not-attend" class="toggle-btn" data-value="not_attending" data-i18n="rsvp.notAttending"></button>
        </div>
        <input type="hidden" id="rsvp-attendance" value="attending" />
      </div>
      <div class="form-group" id="party-size-group">
        <label for="rsvp-party-size" data-i18n="rsvp.partySize"></label>
        <div class="stepper">
          <button type="button" id="party-minus" class="stepper-btn">−</button>
          <span id="party-count">1</span>
          <button type="button" id="party-plus" class="stepper-btn">+</button>
        </div>
        <input type="hidden" id="rsvp-party-size" value="1" />
      </div>
      <div class="form-group">
        <label for="rsvp-note" data-i18n="rsvp.note"></label>
        <textarea id="rsvp-note" name="note" rows="3"></textarea>
      </div>
      <button type="submit" id="rsvp-submit" class="btn-primary" data-i18n="rsvp.submit"></button>
      <p id="rsvp-feedback" class="form-feedback hidden"></p>
    </form>
  </section>

  <!-- GUEST WISH SECTION -->
  <section id="wishes" class="section section-wishes">
    <h2 class="section-title" data-i18n="wishes.title"></h2>
    <form id="wish-form" class="form" novalidate>
      <div class="form-group">
        <label for="wish-name" data-i18n="wishes.name"></label>
        <input type="text" id="wish-name" name="name" required autocomplete="name" />
      </div>
      <div class="form-group">
        <label for="wish-message" data-i18n="wishes.message"></label>
        <textarea id="wish-message" name="message" rows="3" required></textarea>
      </div>
      <button type="submit" id="wish-submit" class="btn-primary" data-i18n="wishes.submit"></button>
      <p id="wish-feedback" class="form-feedback hidden"></p>
    </form>
    <div id="wishes-list" class="wishes-list">
      <p id="wishes-loading" data-i18n="wishes.loading"></p>
    </div>
  </section>

  <!-- CLOSING SECTION -->
  <section id="closing" class="section section-closing">
    <p class="closing-text" data-i18n="closing.text"></p>
    <p class="closing-names">
      <span id="closing-groom"></span> & <span id="closing-bride"></span>
    </p>
    <p class="closing-footer">Made with ♥</p>
  </section>

  <!-- Scripts -->
  <script src="config.js"></script>
  <script src="i18n.js"></script>
  <script src="script.js"></script>
</body>
</html>
```

**Step 2: Commit**
```bash
git add index.html
git commit -m "feat: add base HTML structure"
git push
```

**Verify:** Open `index.html` in browser. All sections visible (unstyled). No console errors.

---

### Task 3.2: Write CSS foundation

**Objective:** Implement mobile-first styling with the configured color palette and typography.

**File:** `style.css`

**Step 1: Write style.css**

```css
/* =====================
   CSS Variables (from config via JS injection or defaults)
   ===================== */
:root {
  --bg: #FAF7F2;
  --text: #2C2C2C;
  --accent: #8A9E85;
  --accent2: #C9A84C;
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --max-width: 640px;
  --section-pad: 4rem 1.5rem;
}

/* =====================
   Reset & Base
   ===================== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

img { max-width: 100%; display: block; }
a { color: inherit; }
textarea, input { font-family: inherit; font-size: inherit; }

/* =====================
   Utilities
   ===================== */
.hidden { display: none !important; }

.section {
  padding: var(--section-pad);
  max-width: var(--max-width);
  margin: 0 auto;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 400;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: 0.03em;
}

/* =====================
   Language Toggle
   ===================== */
.lang-toggle {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 100;
  background: var(--text);
  color: var(--bg);
  border: none;
  border-radius: 2rem;
  padding: 0.5rem 1rem;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* =====================
   Hero Section
   ===================== */
.section-hero {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6rem 1.5rem;
  position: relative;
  max-width: 100%;
}

.ornament { width: 100%; max-width: 280px; margin: 0 auto; }
.ornament-top { margin-bottom: 2rem; }
.ornament-bottom { margin-top: 2rem; }

.hero-to {
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.hero-label {
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.hero-names {
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 10vw, 4rem);
  font-weight: 400;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.hero-ampersand {
  font-style: italic;
  color: var(--accent2);
  font-size: 0.7em;
}

.hero-date {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.7;
}

.hero-city {
  font-size: 0.85rem;
  opacity: 0.5;
  margin-top: 0.25rem;
}

/* =====================
   Couple Section
   ===================== */
.couple-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.couple-fullname {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.couple-parents {
  font-size: 0.85rem;
  opacity: 0.65;
  line-height: 1.5;
}

.couple-divider {
  font-family: var(--font-heading);
  font-style: italic;
  font-size: 2rem;
  color: var(--accent2);
}

/* =====================
   Events Section
   ===================== */
.events-list { display: flex; flex-direction: column; gap: 2rem; }

.event-card {
  border-left: 2px solid var(--accent);
  padding-left: 1.25rem;
}

.event-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
}

.event-datetime, .event-venue, .event-address {
  font-size: 0.9rem;
  opacity: 0.75;
  margin-bottom: 0.2rem;
}

.event-calendar-btn {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

/* =====================
   Countdown Section
   ===================== */
.section-countdown {
  background: var(--text);
  color: var(--bg);
  max-width: 100%;
  text-align: center;
}

.section-countdown .section-title { color: var(--bg); }

.countdown-grid {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.countdown-number {
  font-family: var(--font-heading);
  font-size: 3rem;
  line-height: 1;
  font-weight: 400;
}

.countdown-label {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.6;
  margin-top: 0.25rem;
}

.countdown-passed {
  font-size: 1rem;
  opacity: 0.8;
  margin-top: 1rem;
}

/* =====================
   Maps Section
   ===================== */
.maps-list { display: flex; flex-direction: column; gap: 2rem; }

.map-card { display: flex; flex-direction: column; gap: 0.75rem; }

.map-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
}

.map-address { font-size: 0.9rem; opacity: 0.7; }

.map-embed {
  width: 100%;
  height: 240px;
  border: none;
  border-radius: 8px;
}

.map-link {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--accent);
  text-decoration: underline;
  letter-spacing: 0.05em;
}

/* =====================
   RSVP & Wish Forms
   ===================== */
.form { display: flex; flex-direction: column; gap: 1.25rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }

.form-group label {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.65;
}

.form-group input,
.form-group textarea {
  border: 1px solid rgba(44,44,44,0.2);
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  background: transparent;
  color: var(--text);
  width: 100%;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.toggle-group { display: flex; gap: 0.5rem; }

.toggle-btn {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid rgba(44,44,44,0.2);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stepper-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(44,44,44,0.2);
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.stepper-btn:hover { background: var(--accent); color: #fff; }

#party-count { font-size: 1.1rem; min-width: 1.5rem; text-align: center; }

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--text);
  color: var(--bg);
  border: none;
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover { opacity: 0.8; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.form-feedback {
  font-size: 0.85rem;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
}

.form-feedback.success { color: var(--accent); }
.form-feedback.error { color: #c0392b; }

.rsvp-closed {
  text-align: center;
  padding: 1.5rem;
  border: 1px dashed rgba(44,44,44,0.2);
  border-radius: 8px;
  font-size: 0.9rem;
  opacity: 0.7;
}

/* =====================
   Wishes List
   ===================== */
.wishes-list {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wish-card {
  padding: 1rem 1.25rem;
  border-left: 2px solid var(--accent2);
  background: rgba(201,168,76,0.05);
  border-radius: 0 6px 6px 0;
}

.wish-name {
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.wish-message { font-size: 0.9rem; opacity: 0.8; }
.wish-time { font-size: 0.75rem; opacity: 0.4; margin-top: 0.4rem; }

/* =====================
   Closing Section
   ===================== */
.section-closing { text-align: center; }

.closing-text {
  font-size: 0.9rem;
  opacity: 0.7;
  max-width: 360px;
  margin: 0 auto 1.5rem;
  line-height: 1.8;
}

.closing-names {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 400;
  font-style: italic;
}

.closing-footer {
  margin-top: 2rem;
  font-size: 0.75rem;
  opacity: 0.35;
}

/* =====================
   Section Divider
   ===================== */
.section + .section { border-top: 1px solid rgba(44,44,44,0.08); }
.section-countdown + .section { border-top: none; }
```

**Step 2: Commit**
```bash
git add style.css
git commit -m "feat: add CSS foundation"
git push
```

**Verify:** Open `index.html` in browser. Sections are styled, readable on mobile viewport (375px wide).

---

## Phase 4 — Language Engine (i18n)

### Task 4.1: Write i18n.js with all string keys

**Objective:** Centralize all UI text in Indonesian and English.

**File:** `i18n.js`

**Step 1: Write i18n.js**

```javascript
const I18N = {
  id: {
    "hero.label": "Bismillah, kami mengundang",
    "couple.title": "Mempelai",
    "events.title": "Detail Acara",
    "events.addCalendar": "Tambah ke Kalender",
    "countdown.title": "Menghitung Hari",
    "countdown.days": "Hari",
    "countdown.hours": "Jam",
    "countdown.minutes": "Menit",
    "countdown.seconds": "Detik",
    "countdown.passed": "Alhamdulillah, hari bahagia telah tiba.",
    "maps.title": "Lokasi",
    "maps.openMaps": "Buka di Google Maps →",
    "rsvp.title": "Konfirmasi Kehadiran",
    "rsvp.closed": "RSVP telah ditutup. Terima kasih atas perhatian Anda.",
    "rsvp.name": "Nama",
    "rsvp.attendance": "Kehadiran",
    "rsvp.attending": "Hadir",
    "rsvp.notAttending": "Tidak Hadir",
    "rsvp.partySize": "Jumlah yang hadir",
    "rsvp.note": "Pesan (opsional)",
    "rsvp.submit": "Konfirmasi",
    "rsvp.success": "Terima kasih! Kami tunggu kehadiranmu 🎉",
    "rsvp.successAbsent": "Terima kasih, doa kamu berarti untuk kami 🤍",
    "rsvp.error": "Gagal mengirim. Silakan coba lagi.",
    "rsvp.already": "Kamu sudah mengkonfirmasi kehadiran. Terima kasih!",
    "wishes.title": "Ucapan & Doa",
    "wishes.name": "Nama",
    "wishes.message": "Ucapan",
    "wishes.submit": "Kirim Ucapan",
    "wishes.loading": "Memuat ucapan...",
    "wishes.empty": "Belum ada ucapan. Jadilah yang pertama!",
    "wishes.success": "Ucapan terkirim. Terima kasih! 🤍",
    "wishes.error": "Gagal mengirim ucapan. Silakan coba lagi.",
    "closing.text": "Terima kasih telah menjadi bagian dari perjalanan kami. Doa kalian adalah hadiah terbaik."
  },
  en: {
    "hero.label": "With love, we invite you",
    "couple.title": "The Couple",
    "events.title": "Event Details",
    "events.addCalendar": "Add to Calendar",
    "countdown.title": "Counting Down",
    "countdown.days": "Days",
    "countdown.hours": "Hours",
    "countdown.minutes": "Minutes",
    "countdown.seconds": "Seconds",
    "countdown.passed": "Alhamdulillah, the day has arrived.",
    "maps.title": "Venue",
    "maps.openMaps": "Open in Google Maps →",
    "rsvp.title": "RSVP",
    "rsvp.closed": "RSVP is now closed. Thank you for your attention.",
    "rsvp.name": "Name",
    "rsvp.attendance": "Will you attend?",
    "rsvp.attending": "Attending",
    "rsvp.notAttending": "Not Attending",
    "rsvp.partySize": "Number of attendees",
    "rsvp.note": "Message (optional)",
    "rsvp.submit": "Confirm",
    "rsvp.success": "Thank you! We look forward to seeing you 🎉",
    "rsvp.successAbsent": "Thank you, your prayers mean a lot to us 🤍",
    "rsvp.error": "Failed to submit. Please try again.",
    "rsvp.already": "You have already confirmed. Thank you!",
    "wishes.title": "Wishes & Prayers",
    "wishes.name": "Name",
    "wishes.message": "Your wish",
    "wishes.submit": "Send Wish",
    "wishes.loading": "Loading wishes...",
    "wishes.empty": "No wishes yet. Be the first!",
    "wishes.success": "Wish sent. Thank you! 🤍",
    "wishes.error": "Failed to send. Please try again.",
    "closing.text": "Thank you for being part of our journey. Your prayers are the greatest gift."
  }
};
```

**Step 2: Commit**
```bash
git add i18n.js
git commit -m "feat: add i18n language strings"
git push
```

---

## Phase 5 — URL Param & Mode Detection

### Task 5.1: Write app initialization in script.js

**Objective:** Read URL param, detect mode, set language, bootstrap app.

**File:** `script.js`

**Step 1: Write initialization block**

```javascript
// =====================
// App State
// =====================
const App = {
  lang: CONFIG.defaultLanguage || "id",
  mode: CONFIG.defaultMode || "announce",
  guestName: null,
};

// =====================
// Init
// =====================
document.addEventListener("DOMContentLoaded", () => {
  initMode();
  initLang();
  renderConfig();
  renderI18n();
  renderCountdown();
  renderMaps();
  renderCalendarButtons();
  loadWishes();
  initRSVPForm();
  initWishForm();
  initLangToggle();
});

// Detect mode from URL param
function initMode() {
  const params = new URLSearchParams(window.location.search);
  const to = params.get("to");
  if (to && to.trim() !== "") {
    App.mode = "invite";
    App.guestName = decodeURIComponent(to.trim());
  } else {
    App.mode = "announce";
  }
}

// Detect language from localStorage or config default
function initLang() {
  const saved = localStorage.getItem("wedding_lang");
  if (saved && I18N[saved]) {
    App.lang = saved;
  }
  document.documentElement.lang = App.lang;
}
```

**Step 2: Commit**
```bash
git add script.js
git commit -m "feat: add app init and mode detection"
git push
```

**Verify:** In browser console, `App.mode` reflects URL param correctly.

---

## Phase 6 — Hero Section

### Task 6.1: Render hero section from config

**Objective:** Populate hero with couple names, date, personalized greeting.

**File:** `script.js` — add to existing file

**Step 1: Write renderConfig()**

```javascript
function renderConfig() {
  const { couple, events } = CONFIG;
  const target = events.find(e => e.isCountdownTarget) || events[0];

  // Names
  document.getElementById("groom-name").textContent = couple.groom.name;
  document.getElementById("bride-name").textContent = couple.bride.name;
  document.getElementById("groom-fullname").textContent = couple.groom.fullName;
  document.getElementById("bride-fullname").textContent = couple.bride.fullName;
  document.getElementById("groom-parents").textContent = couple.groom.parents;
  document.getElementById("bride-parents").textContent = couple.bride.parents;
  document.getElementById("closing-groom").textContent = couple.groom.name;
  document.getElementById("closing-bride").textContent = couple.bride.name;

  // Hero date and city
  if (target) {
    const d = new Date(target.date + "T00:00:00");
    const opts = { year: "numeric", month: "long", day: "numeric" };
    document.getElementById("hero-date").textContent =
      d.toLocaleDateString(App.lang === "id" ? "id-ID" : "en-US", opts);
    document.getElementById("hero-city").textContent = target.venue;
  }

  // Personalized greeting
  const heroTo = document.getElementById("hero-to");
  if (App.mode === "invite" && App.guestName) {
    heroTo.textContent = `Kepada: ${App.guestName}`;
    heroTo.classList.remove("hidden");
  }

  // Show/hide RSVP section
  const rsvpSection = document.getElementById("rsvp");
  if (App.mode === "invite" && CONFIG.rsvp.enabled) {
    rsvpSection.classList.remove("hidden");
    // Pre-fill name
    if (App.guestName) {
      document.getElementById("rsvp-name").value = App.guestName;
      document.getElementById("wish-name").value = App.guestName;
    }
  }
}
```

**Step 2: Commit**
```bash
git add script.js
git commit -m "feat: render hero and couple section from config"
git push
```

**Verify:** Open `index.html?to=Budi` — hero shows "Kepada: Budi". RSVP section visible.

---

## Phase 7 — Event / Timeline Section

### Task 7.1: Render events list dynamically

**Objective:** Build event cards from `CONFIG.events` array.

**File:** `script.js` — add function

```javascript
function renderCalendarButtons() {
  const container = document.getElementById("events-list");
  container.innerHTML = "";

  CONFIG.events.forEach(event => {
    const title = typeof event.title === "object"
      ? event.title[App.lang]
      : event.title;

    const card = document.createElement("div");
    card.className = "event-card";
    card.innerHTML = `
      <p class="event-title">${title}</p>
      <p class="event-datetime">${event.date} · ${event.time}</p>
      <p class="event-venue">${event.venue}</p>
      <p class="event-address">${event.address}</p>
      ${buildCalendarLinks(event)}
    `;
    container.appendChild(card);
  });
}

function buildCalendarLinks(event) {
  const label = I18N[App.lang]["events.addCalendar"];
  const start = event.date.replace(/-/g, "");
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.venue)}&dates=${start}/${start}&details=${encodeURIComponent(event.address)}`;
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${event.venue}`,
    `DTSTART:${start}`,
    `DTEND:${start}`,
    `LOCATION:${event.address}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\n");
  const icsBlob = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  return `
    <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:0.75rem;">
      <a href="${gcalUrl}" target="_blank" rel="noopener" class="event-calendar-btn">Google Calendar</a>
      <a href="${icsBlob}" download="wedding.ics" class="event-calendar-btn">iCal (.ics)</a>
    </div>
  `;
}
```

**Commit:**
```bash
git add script.js
git commit -m "feat: render events and calendar links"
git push
```

**Verify:** Events section shows event cards. Calendar links are clickable.

---

## Phase 8 — Countdown Section

### Task 8.1: Implement countdown timer

**Objective:** Real-time countdown to target event date, show "passed" message after.

**File:** `script.js` — add function

```javascript
function renderCountdown() {
  const target = CONFIG.events.find(e => e.isCountdownTarget) || CONFIG.events[0];
  if (!target) return;

  const targetDate = new Date(target.date + "T00:00:00");

  function tick() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      document.getElementById("cd-days").textContent = "00";
      document.getElementById("cd-hours").textContent = "00";
      document.getElementById("cd-minutes").textContent = "00";
      document.getElementById("cd-seconds").textContent = "00";
      document.getElementById("countdown-passed").classList.remove("hidden");
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    document.getElementById("cd-days").textContent = String(days).padStart(2, "0");
    document.getElementById("cd-hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("cd-minutes").textContent = String(mins).padStart(2, "0");
    document.getElementById("cd-seconds").textContent = String(secs).padStart(2, "0");
  }

  tick();
  setInterval(tick, 1000);
}
```

**Commit:**
```bash
git add script.js
git commit -m "feat: add countdown timer"
git push
```

**Verify:** Countdown ticks every second. Set date to past — "passed" message appears.

---

## Phase 9 — Maps Section

### Task 9.1: Render maps from config

**Objective:** Show embedded map and direct link for each event.

**File:** `script.js` — add function

```javascript
function renderMaps() {
  const container = document.getElementById("maps-list");
  container.innerHTML = "";
  const label = I18N[App.lang]["maps.openMaps"];

  CONFIG.events.forEach(event => {
    const title = typeof event.title === "object"
      ? event.title[App.lang]
      : event.title;

    const card = document.createElement("div");
    card.className = "map-card";
    card.innerHTML = `
      <p class="map-title">${title}</p>
      <p class="map-address">${event.address}</p>
      ${event.mapEmbedUrl
        ? `<iframe class="map-embed" src="${event.mapEmbedUrl}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
        : ""}
      ${event.mapDirectUrl
        ? `<a href="${event.mapDirectUrl}" target="_blank" rel="noopener" class="map-link">${label}</a>`
        : ""}
    `;
    container.appendChild(card);
  });
}
```

**Commit:**
```bash
git add script.js
git commit -m "feat: render maps section"
git push
```

**Verify:** Maps section renders. Embed shows if `mapEmbedUrl` is set. Link works.

---

## Phase 10 — Language Toggle

### Task 10.1: Implement language toggle and i18n rendering

**Objective:** Switch all UI text between ID and EN without page reload.

**File:** `script.js` — add functions

```javascript
function renderI18n() {
  const strings = I18N[App.lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (strings[key]) el.textContent = strings[key];
  });
  document.getElementById("lang-label").textContent =
    App.lang === "id" ? "EN" : "ID";
}

function initLangToggle() {
  document.getElementById("lang-toggle").addEventListener("click", () => {
    App.lang = App.lang === "id" ? "en" : "id";
    localStorage.setItem("wedding_lang", App.lang);
    document.documentElement.lang = App.lang;
    renderI18n();
    renderConfig();
    renderCalendarButtons();
    renderMaps();
  });
}
```

**Commit:**
```bash
git add script.js
git commit -m "feat: add language toggle"
git push
```

**Verify:** Click toggle — all labeled text switches language. Reload — preference persists.

---

## Phase 11 — RSVP Form

### Task 11.1: Implement RSVP form logic

**Objective:** Handle attendance toggle, party size stepper, deadline check, submit to Apps Script.

**File:** `script.js` — add function

```javascript
function initRSVPForm() {
  if (App.mode !== "invite" || !CONFIG.rsvp.enabled) return;

  // Check if already submitted
  if (localStorage.getItem("rsvp_submitted")) {
    document.getElementById("rsvp-form").classList.add("hidden");
    const closed = document.getElementById("rsvp-closed");
    closed.classList.remove("hidden");
    closed.querySelector("p").textContent = I18N[App.lang]["rsvp.already"];
    return;
  }

  // Check deadline
  const target = CONFIG.events.find(e => e.isCountdownTarget) || CONFIG.events[0];
  if (target) {
    const deadline = new Date(target.date + "T00:00:00");
    deadline.setDate(deadline.getDate() - CONFIG.rsvp.deadlineDays);
    if (new Date() > deadline) {
      document.getElementById("rsvp-form").classList.add("hidden");
      document.getElementById("rsvp-closed").classList.remove("hidden");
      return;
    }
  }

  // Attendance toggle
  let attendance = "attending";
  const btnAttend = document.getElementById("btn-attend");
  const btnNotAttend = document.getElementById("btn-not-attend");
  const partySizeGroup = document.getElementById("party-size-group");

  btnAttend.addEventListener("click", () => {
    attendance = "attending";
    document.getElementById("rsvp-attendance").value = attendance;
    btnAttend.classList.add("active");
    btnNotAttend.classList.remove("active");
    partySizeGroup.classList.remove("hidden");
  });

  btnNotAttend.addEventListener("click", () => {
    attendance = "not_attending";
    document.getElementById("rsvp-attendance").value = attendance;
    btnNotAttend.classList.add("active");
    btnAttend.classList.remove("active");
    partySizeGroup.classList.add("hidden");
  });

  // Party size stepper
  let partySize = 1;
  const max = CONFIG.rsvp.maxPartySize || 10;

  document.getElementById("party-minus").addEventListener("click", () => {
    if (partySize > 1) partySize--;
    document.getElementById("party-count").textContent = partySize;
    document.getElementById("rsvp-party-size").value = partySize;
  });

  document.getElementById("party-plus").addEventListener("click", () => {
    if (partySize < max) partySize++;
    document.getElementById("party-count").textContent = partySize;
    document.getElementById("rsvp-party-size").value = partySize;
  });

  // Submit
  document.getElementById("rsvp-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("rsvp-name").value.trim();
    if (!name) return;

    const submitBtn = document.getElementById("rsvp-submit");
    const feedback = document.getElementById("rsvp-feedback");
    submitBtn.disabled = true;

    const payload = {
      type: "rsvp",
      guest_name: name,
      attendance_status: document.getElementById("rsvp-attendance").value,
      party_size: attendance === "attending"
        ? parseInt(document.getElementById("rsvp-party-size").value)
        : 0,
      note: document.getElementById("rsvp-note").value.trim(),
      source_url: window.location.href,
      language: App.lang,
      mode: App.mode
    };

    try {
      await fetch(CONFIG.rsvp.endpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      localStorage.setItem("rsvp_submitted", "1");
      document.getElementById("rsvp-form").classList.add("hidden");
      feedback.textContent = attendance === "attending"
        ? I18N[App.lang]["rsvp.success"]
        : I18N[App.lang]["rsvp.successAbsent"];
      feedback.className = "form-feedback success";
      feedback.classList.remove("hidden");
    } catch {
      submitBtn.disabled = false;
      feedback.textContent = I18N[App.lang]["rsvp.error"];
      feedback.className = "form-feedback error";
      feedback.classList.remove("hidden");
    }
  });
}
```

**Commit:**
```bash
git add script.js
git commit -m "feat: implement RSVP form with deadline check and submit"
git push
```

**Verify:**
- Open with `?to=Budi` — RSVP shows, name pre-filled
- Toggle "Tidak Hadir" — party size hidden
- Submit — feedback shown, form hidden
- Reload — "already confirmed" shown

---

## Phase 12 — Guest Wish Section

### Task 12.1: Load and render wishes from Apps Script

**Objective:** Fetch wishes on page load and render as cards.

**File:** `script.js` — add function

```javascript
async function loadWishes() {
  if (!CONFIG.guestWish.enabled) return;

  const container = document.getElementById("wishes-list");
  const loadingEl = document.getElementById("wishes-loading");

  try {
    const res = await fetch(`${CONFIG.guestWish.endpointUrl}?type=wishes`);
    const data = await res.json();
    loadingEl.remove();

    if (!data.wishes || data.wishes.length === 0) {
      container.innerHTML = `<p style="opacity:0.5;font-size:0.9rem">${I18N[App.lang]["wishes.empty"]}</p>`;
      return;
    }

    data.wishes.forEach(w => {
      const card = document.createElement("div");
      card.className = "wish-card";
      card.innerHTML = `
        <p class="wish-name">${escapeHtml(w.guest_name)}</p>
        <p class="wish-message">${escapeHtml(w.message)}</p>
        <p class="wish-time">${w.timestamp || ""}</p>
      `;
      container.appendChild(card);
    });
  } catch {
    loadingEl.textContent = "";
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

### Task 12.2: Implement wish form submit

**File:** `script.js` — add function

```javascript
function initWishForm() {
  if (!CONFIG.guestWish.enabled) return;

  document.getElementById("wish-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("wish-name").value.trim();
    const message = document.getElementById("wish-message").value.trim();
    if (!name || !message) return;

    const submitBtn = document.getElementById("wish-submit");
    const feedback = document.getElementById("wish-feedback");
    submitBtn.disabled = true;

    const payload = {
      type: "wish",
      guest_name: name,
      message,
      source_url: window.location.href,
      language: App.lang,
      mode: App.mode
    };

    try {
      await fetch(CONFIG.guestWish.endpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      feedback.textContent = I18N[App.lang]["wishes.success"];
      feedback.className = "form-feedback success";
      feedback.classList.remove("hidden");
      document.getElementById("wish-form").reset();
      submitBtn.disabled = false;
    } catch {
      submitBtn.disabled = false;
      feedback.textContent = I18N[App.lang]["wishes.error"];
      feedback.className = "form-feedback error";
      feedback.classList.remove("hidden");
    }
  });
}
```

**Commit:**
```bash
git add script.js
git commit -m "feat: implement guest wish load and submit"
git push
```

---

## Phase 13 — Google Apps Script Backend

### Task 13.1: Write Apps Script Code.gs

**Objective:** Single Apps Script handles both RSVP and wish POST, and wish GET.

**File:** `apps-script/Code.gs`

```javascript
// Google Apps Script — Wedding Invitation Backend
// Deploy as: Web App | Execute as: Me | Access: Anyone

const SHEET_ID = "YOUR_GOOGLE_SHEET_ID"; // Replace with actual Sheet ID
const RSVP_SHEET = "RSVP";
const WISH_SHEET = "Wishes";

function doGet(e) {
  const type = e.parameter.type;
  if (type === "wishes") {
    return getWishes();
  }
  return jsonResponse({ error: "Unknown type" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.type === "rsvp") return saveRSVP(data);
    if (data.type === "wish") return saveWish(data);
    return jsonResponse({ error: "Unknown type" });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function saveRSVP(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(RSVP_SHEET);
  sheet.appendRow([
    new Date().toISOString(),
    data.guest_name || "",
    data.attendance_status || "",
    data.party_size || 0,
    data.note || "",
    data.source_url || "",
    data.language || "",
    data.mode || ""
  ]);
  return jsonResponse({ success: true });
}

function saveWish(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(WISH_SHEET);
  sheet.appendRow([
    new Date().toISOString(),
    data.guest_name || "",
    data.message || "",
    data.relation || "",
    data.source_url || "",
    data.language || "",
    data.mode || ""
  ]);
  return jsonResponse({ success: true });
}

function getWishes() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(WISH_SHEET);
  const rows = sheet.getDataRange().getValues();
  const wishes = rows.slice(1).map(row => ({
    timestamp: row[0],
    guest_name: row[1],
    message: row[2],
    relation: row[3]
  })).reverse(); // Newest first
  return jsonResponse({ wishes });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Task 13.2: Setup Google Sheet

**Objective:** Create Google Sheet with correct tab names and headers.

**Steps:**

1. Buka https://sheets.google.com → buat sheet baru
2. Rename Sheet1 → `RSVP`
3. Tambah tab baru → rename → `Wishes`
4. Tab `RSVP`, baris 1 isi header:
   ```
   timestamp | guest_name | attendance_status | party_size | note | source_url | language | mode
   ```
5. Tab `Wishes`, baris 1 isi header:
   ```
   timestamp | guest_name | message | relation | source_url | language | mode
   ```
6. Salin Sheet ID dari URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
7. Paste ke `Code.gs` pada `SHEET_ID`

### Task 13.3: Deploy Apps Script as Web App

**Steps:**

1. Buka https://script.google.com → buat project baru
2. Paste isi `apps-script/Code.gs`
3. Klik **Deploy → New deployment**
4. Type: **Web app**
5. Execute as: **Me**
6. Who has access: **Anyone**
7. Klik **Deploy**
8. Salin URL endpoint yang diberikan
9. Paste ke `config.js`:
   ```javascript
   rsvp: { endpointUrl: "https://script.google.com/macros/s/.../exec" },
   guestWish: { endpointUrl: "https://script.google.com/macros/s/.../exec" }
   ```

**Verify:**
- Buka endpoint URL di browser → response JSON muncul
- Test POST via browser console atau curl:
```bash
curl -X POST "ENDPOINT_URL" \
  -H "Content-Type: application/json" \
  -d '{"type":"wish","guest_name":"Test","message":"Selamat!"}'
```
Expected: `{"success":true}`

**Commit:**
```bash
git add apps-script/Code.gs config.js
git commit -m "feat: add Apps Script backend and update config with endpoint"
git push
```

---

## Phase 14 — GitHub Pages Deployment

### Task 14.1: Enable GitHub Pages

**Steps:**

1. Push semua perubahan ke `main`:
```bash
git add .
git commit -m "chore: final pre-deploy check"
git push
```

2. Buka repo di GitHub → **Settings → Pages**
3. Source: **Deploy from branch**
4. Branch: `main` → folder: `/ (root)`
5. Klik **Save**
6. Tunggu 1-2 menit → URL muncul: `https://<username>.github.io/wedding-invitation/`

**Verify:**
- Buka URL di browser mobile (375px)
- Buka `URL?to=NamaTamu` → personalized greeting tampil
- Countdown berjalan
- Maps tampil

---

## Phase 15 — Final QA Checklist

### Task 15.1: Run full QA

Checklist sebelum dinyatakan selesai:

**Mode & URL**
- [ ] `URL` (tanpa param) → Announcement Mode, no RSVP
- [ ] `URL?to=Budi` → Invitation Mode, "Kepada: Budi", RSVP visible

**RSVP**
- [ ] Form tampil di Invitation Mode
- [ ] Toggle Hadir/Tidak Hadir berfungsi
- [ ] Party size stepper berfungsi
- [ ] Submit → data masuk Google Sheet
- [ ] Setelah submit → form hilang, success message tampil
- [ ] Reload setelah submit → "already confirmed"
- [ ] Ubah tanggal ke masa lalu H-7 → form closed

**Guest Wish**
- [ ] Wishes load saat page load
- [ ] Submit wish → data masuk Google Sheet
- [ ] Hapus baris di Sheet → refresh → wish hilang
- [ ] Empty state tampil jika belum ada ucapan

**Countdown**
- [ ] Timer berjalan real-time
- [ ] Tanggal lewat → pesan "hari telah tiba"

**Maps**
- [ ] Embed tampil
- [ ] Tombol "Buka di Google Maps" berfungsi

**Calendar**
- [ ] Google Calendar link buka halaman calendar
- [ ] .ics download berfungsi

**Language Toggle**
- [ ] Toggle ID → EN → semua teks berubah
- [ ] Reload → preferensi tersimpan

**Mobile**
- [ ] Tampil baik di 375px (iPhone SE)
- [ ] Tampil baik di 390px (iPhone 14)
- [ ] Tidak ada horizontal scroll

**Performance**
- [ ] Page load < 3 detik di simulasi 4G (Chrome DevTools → Throttling)

---

## Notes untuk Implementer

- Semua content diatur di `config.js` — tidak perlu ubah `index.html` atau `script.js`
- Untuk tambah event resepsi: uncomment blok di `CONFIG.events`
- Apps Script endpoint **satu URL** untuk RSVP dan Wish (dibedakan oleh field `type`)
- Jika Apps Script cold start terasa lambat, pertimbangkan re-deploy untuk refresh instance
- Untuk domain custom: tambahkan `CNAME` file di root berisi nama domain, lalu set DNS di registrar
