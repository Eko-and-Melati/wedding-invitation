# Wedding Invitation — Static Site

## Project Layout
```
├── index.html          — main page
├── generate.html       — generate individual invitation links
├── style.css           — all styles (Cormorant + Inter fonts)
├── script.js           — all client-side JS (config, RSVP, wishes, nav, cover, map)
├── config.js           — CONFIG object (dates, endpoints, toggle flags)
├── apps-script/
│   └── Code.gs         — Google Apps Script backend (RSVP + wishes sheet ops)
├── assets/
│   ├── og-image.jpg    — OG preview (1200×630)
│   ├── ornament-top.svg
│   └── ornament-bottom.svg
├── POTENTIAL-ISSUES.md — 14 issues tracked, ALL [✓ FIXED]
└── CLAUDE.md           — this file
```

## Tech Stack
- Plain static HTML/CSS/JS — no build step, no framework
- Hosted on GitHub Pages
- Backend: Google Apps Script Web App (POST/form data)
- Data: Google Sheets (RSVP tab, Wishes tab)
- Sheet ID: `1-ksha8Y-DCOilyJ5DiI9d8wr24vdOYtAUlVAWvucVqg`

## Key Code Rules
- `?to=GuestName` query param for personalized invite
- `?mode=announce` skips cover, hero, couple sections — direct to info
- No localStorage block for RSVP (re-submit allowed)
- RSVP form stays visible after submit
- Wish form pre-filled guest name is readOnly
- Cover click → 600ms fade-out → hero-reveal animation
- Names from URL decodeURIComponent wrapped in try-catch
- Wish fetch has 3-attempt exponential backoff retry
- Server dedup: check lowercase guest_name → update existing row or append

## RSVP + Wish Backend
- POST to Apps Script Web App (`endpointUrl` in config.js)
- Content-Type: text/plain (no-cors)
- Payload: multipart/form-data
- `action=saveRSVP` or `action=saveWish` or `action=getWishes`
- `getWishes` returns JSON array sorted by timestamp desc

## Nav Items (must be exactly 5)
1. Home — scroll to hero
2. Acara — event details
3. Map — embedded Google Maps
4. RSVP — RSVP form
5. Ucapan — wishes/greetings section
