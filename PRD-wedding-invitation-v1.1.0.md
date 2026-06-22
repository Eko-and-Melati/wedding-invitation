# PRD: Digital Wedding Invitation Web App
**Version:** 1.1.0  
**Status:** Final Draft  
**Owner:** Boss Eko  
**Platform Target:** GitHub Pages  
**Last Updated:** 2026-06-21

---

## Changelog

### v1.1.0
- Added expected guest count (150 guests) to constraints
- Added CORS requirement for Apps Script endpoints
- Added `?to=NamaTamu` URL param as Functional Requirement
- Clarified RSVP not available in Announcement Mode
- Clarified Guest Wish fetch behavior: page load only
- Removed ambiguous Hybrid Mode
- Merged redundant section 6.9 into 6.4
- Resolved config.json vs config.js ambiguity → config.js
- Added Apps Script rate limit as known constraint
- Added performance target: < 3 seconds on 4G
- Added Apps Script endpoint URL as required config field

---

## 1. Overview

This project is a lightweight, mobile-friendly digital wedding invitation web app for personal use.

The app must be deployable on **GitHub Pages only**, without paid hosting, without a custom backend server, and without a self-managed database. All dynamic data handling must use client-side JavaScript, Google Apps Script, and Google Sheets.

The app supports two usage modes:
- **Invitation** — full experience including RSVP
- **Announcement** — informational only, no RSVP

The app must support RSVP collection, guest wishes, countdown, maps, calendar reminders, and bilingual content in Indonesian and English.

Expected guest count: **~150 guests**.

---

## 2. Goals

### 2.1 Primary Goals
- Provide a beautiful and simple wedding invitation web page.
- Allow guests to RSVP (Invitation Mode only).
- Allow guests to send wishes/messages.
- Store RSVP and guest wishes in Google Sheets.
- Display moderated guest wishes from Google Sheets on the web page.
- Allow the host to remove inappropriate wishes by deleting rows in Google Sheets.
- Support maps, countdown, calendar reminder, and language switching.
- Deploy fully on GitHub Pages.

### 2.2 Secondary Goals
- Keep the page lightweight and fast (target: < 3 seconds on 4G).
- Make the design mobile-first.
- Keep the implementation simple to maintain.
- Avoid paid infrastructure.

---

## 3. Non-Goals

This project will **not** include:
- Paid hosting
- Custom backend server
- Database server
- User accounts or login system
- Payment/monetization features
- Admin dashboard
- Heavy animations
- Photo-heavy design as a requirement
- Real-time chat
- Auto-refresh / polling for guest wishes

---

## 4. Target Users

### 4.1 Guest
A recipient of the wedding link shared via WhatsApp. The guest should be able to:
- read the invitation or announcement
- view the map
- add the event to calendar
- RSVP (Invitation Mode only)
- send a wish/message
- switch language

### 4.2 Host
The wedding organizer / owner of the website. The host should be able to:
- configure event details via `config.js`
- send personalized links manually via WhatsApp
- view RSVP data in Google Sheets
- moderate guest wishes by editing Google Sheets
- estimate attendance based on RSVP submissions

---

## 5. Product Scope

### 5.1 Supported Modes

#### Invitation Mode
For direct wedding invitation use. Activated via URL param `?to=NamaTamu`.

Includes:
- personalized greeting ("Kepada: [Nama Tamu]") in hero section
- full invitation content
- RSVP form with guest name pre-filled from URL param
- guest wishes
- map
- countdown
- calendar reminder

#### Announcement Mode
For general wedding announcement. Default mode when no `?to=` param is present.

Includes:
- short announcement content
- countdown
- guest wishes
- map
- calendar reminder

**Does not include:**
- RSVP form

---

## 6. Functional Requirements

### 6.1 Static Hosting Compatibility
The app must be deployable as a static site on GitHub Pages.

#### Requirements
- Must not require server-side rendering.
- Must not require Node.js runtime in production.
- Must not require API routes hosted on a paid server.
- Must work from static HTML/CSS/JS files only.

---

### 6.2 Configuration-Based Content
Core content must be configurable without changing application logic.

#### Implementation
- All configurable data stored in `config.js`
- The app reads `config.js` on page load
- No rebuild or recompile required after editing `config.js`

#### Configurable fields include:
1. Couple names and parents names
2. Event date, time, and type
3. Venue and location details
4. Mode behavior (invitation / announcement)
5. RSVP settings: deadline, max party size
6. Guest wish behavior: enabled / disabled
7. Theme colors and font preferences
8. Copy text per language (Indonesian / English)
9. **Apps Script endpoint URL** (required for RSVP and guest wish submission)
10. Google Maps embed URL and direct Maps link

---

### 6.3 URL Personalization
The app must support personalized links via URL parameters.

#### Requirements
- URL format: `namadomain.com/?to=NamaTamu`
- If `?to=` param is present:
  - Activate Invitation Mode
  - Display guest name in hero section: "Kepada: [Nama Tamu]"
  - Pre-fill guest name in RSVP form
  - Pre-fill guest name in Guest Wish form
- If `?to=` param is absent:
  - Activate Announcement Mode
  - No personalized greeting shown
  - No RSVP form shown

---

### 6.4 RSVP
Guests must be able to confirm attendance. **Available in Invitation Mode only.**

#### RSVP form fields
- Name (pre-filled from `?to=` URL param, editable)
- Attendance status: attending / not attending
- Number of attendees (visible only if attending)
- Optional note/message

#### RSVP behavior
- RSVP must close automatically at **H-7** before the event date
- When RSVP is closed, the form must be replaced with a closed notice
- RSVP submissions must be sent to Google Sheets via Google Apps Script POST endpoint
- The app must prevent duplicate submissions using `localStorage` flag on the client side
- Apps Script endpoint must return CORS-compatible headers to allow requests from GitHub Pages domain

#### RSVP output data
Minimum fields stored in Google Sheets:
- timestamp
- guest_name
- attendance_status
- party_size
- note
- source_url
- language
- mode

---

### 6.5 Guest Wishes
Guests must be able to submit congratulatory messages. **Available in both modes.**

#### Guest wish form fields
- Name (pre-filled from `?to=` URL param if present, editable)
- Message
- Optional relationship or tag

#### Guest wish behavior
- Submissions sent to Google Sheets via Apps Script POST endpoint
- Apps Script endpoint must return CORS-compatible headers
- Guest wishes fetched from Apps Script GET endpoint **on page load only** (no polling)
- Fetched wishes rendered on the page after load
- If host deletes a row in Google Sheets, that wish disappears on next page load/refresh

#### Guest wish moderation
- Google Sheets is the single source of truth for moderation
- No separate moderation dashboard required
- Host deletes unwanted rows directly in Google Sheets

---

### 6.6 Countdown
The app must display a countdown to the main event date.

#### Requirements
- Show days, hours, minutes, and seconds
- Countdown updates dynamically via client-side JS (`setInterval`)
- If event has passed, show a "The day has come" message instead
- If multiple events exist in config, countdown target must be explicitly set in `config.js`

---

### 6.7 Maps
The app must include location details and map access.

#### Requirements
- Map section is mandatory in both modes
- Must include:
  - embedded Google Maps iframe
  - button to open location in Google Maps app
- Location name and address must be readable on mobile

---

### 6.8 Calendar Reminder
The app must allow guests to add the event to their calendar.

#### Requirements
- Support Google Calendar link
- Support downloadable `.ics` file for iCal / Apple Calendar
- Calendar button visible in both modes

---

### 6.9 Language Toggle
The app must support at least:
- Indonesian (`id`)
- English (`en`)

#### Requirements
- Toggle button visible on every section (sticky or fixed position)
- All core UI text updates without page reload
- Language strings stored in `config.js` or a separate `i18n.js` file
- Language preference stored in `localStorage`

---

## 7. Design Requirements

### 7.1 General Style
The interface must be:
- simple
- elegant
- minimal
- mobile-first
- lightweight

### 7.2 Color Direction
The design should avoid:
- pink
- purple

Preferred palette direction:
- ivory / cream as background
- charcoal as primary text
- muted sage green as accent
- muted gold as secondary accent

### 7.3 Typography
- Heading: elegant serif font (e.g. Playfair Display or Cormorant Garamond)
- Body: clean sans-serif font (e.g. Inter or DM Sans)
- Maintain high readability on small mobile screens

### 7.4 Visual Direction
- Avoid heavy photo dependence
- Use simple line-art illustration, silhouette, or floral ornament if needed
- Avoid heavy animations and large media assets
- Maintain ample spacing and clear section separation
- One-page vertical scroll layout

---

## 8. Technical Requirements

### 8.1 Frontend
The frontend must be built using:
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

Not allowed as production dependency:
- SSR frameworks (Next.js, Nuxt, etc.)
- Backend runtime
- Paid CDN or hosting dependency

### 8.2 Hosting
- GitHub Pages only
- Deploy from `main` branch root or `/docs` folder

### 8.3 Data Storage
- Google Sheets for RSVP and guest wish storage
- Google Apps Script as the API bridge layer

### 8.4 CORS Requirement
All Apps Script endpoints must be deployed with CORS headers to allow cross-origin requests from the GitHub Pages domain.

Minimum required response headers from Apps Script:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### 8.5 Data Flow

#### RSVP flow
1. Guest fills RSVP form
2. Client validates form (required fields)
3. Client sends POST to Apps Script endpoint
4. Apps Script writes row to RSVP Google Sheet
5. Apps Script returns success/error JSON
6. Client shows success message
7. Client sets `localStorage` flag to prevent re-submit

#### Guest wish flow
1. Page loads → client fetches GET from Apps Script endpoint
2. Apps Script reads Guest Wish sheet and returns JSON array
3. Client renders wishes on page
4. Guest fills wish form and submits
5. Client sends POST to Apps Script endpoint
6. Apps Script writes row to Guest Wish sheet
7. Client shows success message

---

## 9. Data Model

### 9.1 RSVP Sheet Columns
| Column | Type | Notes |
|---|---|---|
| timestamp | datetime | Auto from Apps Script |
| guest_name | string | From form |
| attendance_status | string | `attending` / `not_attending` |
| party_size | integer | 0 if not attending |
| note | string | Optional |
| source_url | string | Full URL of page |
| language | string | `id` / `en` |
| mode | string | `invite` / `announce` |

### 9.2 Guest Wish Sheet Columns
| Column | Type | Notes |
|---|---|---|
| timestamp | datetime | Auto from Apps Script |
| guest_name | string | From form |
| message | string | Required |
| relation | string | Optional |
| source_url | string | Full URL of page |
| language | string | `id` / `en` |
| mode | string | `invite` / `announce` |

### 9.3 config.js Required Fields
```javascript
const CONFIG = {
  mode: "invite",               // invite | announce
  defaultLanguage: "id",        // id | en

  couple: {
    groom: {
      name: "",
      fullName: "",
      parents: ""
    },
    bride: {
      name: "",
      fullName: "",
      parents: ""
    }
  },

  events: [
    {
      id: "akad",
      title: { id: "", en: "" },
      date: "",                  // YYYY-MM-DD
      time: "",
      venue: "",
      address: "",
      mapEmbedUrl: "",
      mapDirectUrl: "",
      isCountdownTarget: true
    }
  ],

  rsvp: {
    enabled: true,
    deadlineDays: 7,             // H-7
    maxPartySize: 10,
    endpointUrl: ""              // Apps Script URL (required)
  },

  guestWish: {
    enabled: true,
    endpointUrl: ""              // Apps Script URL (required)
  },

  theme: {
    bgColor: "#FAF7F2",
    primaryColor: "#2C2C2C",
    accentColor: "#8A9E85",
    secondaryAccent: "#C9A84C",
    fontHeading: "Playfair Display",
    fontBody: "Inter"
  },

  i18n: {
    id: { /* Indonesian strings */ },
    en: { /* English strings */ }
  }
};
```

---

## 10. User Stories

### 10.1 Guest Stories
- As a guest, I want to open the invitation from WhatsApp and see my name so I know it is for me.
- As a guest, I want to RSVP so the host can estimate attendance.
- As a guest, I want to specify how many family members will attend.
- As a guest, I want to send wishes to congratulate the couple.
- As a guest, I want to open the map so I can find the venue.
- As a guest, I want to add the event to my calendar so I do not forget.
- As a guest, I want to switch language so I can read the page comfortably.
- As a guest receiving an announcement, I want to read the event info and send wishes without being asked to RSVP.

### 10.2 Host Stories
- As a host, I want to configure all event details in `config.js` so I can update content without touching logic.
- As a host, I want to send personalized links via WhatsApp so guests feel welcomed.
- As a host, I want RSVP responses in Google Sheets so I can count estimated attendance easily.
- As a host, I want guest wishes in Google Sheets so I can delete inappropriate messages.
- As a host, I want the website free to host so I have zero infrastructure cost.

---

## 11. Constraints

### Hard Constraints
- Must deploy to GitHub Pages
- Must not require paid hosting
- Must not require custom backend server
- Must not require database server
- Must use Google Sheets and Google Apps Script for all data handling
- Apps Script endpoints must support CORS

### Soft Constraints
- Page load target: **< 3 seconds on 4G**
- Keep total page weight minimal (no large unoptimized assets)
- Keep it simple to maintain
- Mobile-first layout

### Known Limitations
- **Apps Script rate limit:** Google Apps Script free tier allows up to 20,000 URL fetch calls per day. For ~150 guests this is well within safe limits.
- **Guest wish display:** Wishes are fetched on page load only. New wishes require a manual refresh to appear.
- **No real-time RSVP deduplication:** Duplicate prevention is client-side only via `localStorage`. Server-side deduplication is out of scope for v1.0.0.
- **Apps Script cold start:** First request after inactivity may take 1–2 seconds longer than usual.

---

## 12. Edge Cases

### 12.1 RSVP Deadline Passed
- RSVP form replaced with a closed notice
- Guest wish form remains open

### 12.2 Duplicate RSVP Submission
- `localStorage` flag set after first successful submit
- Form button disabled on re-visit
- If guest clears storage, duplicate may occur (acceptable for v1.0.0)

### 12.3 Apps Script Temporary Failure
- Show friendly error message on submit failure
- Do not break or freeze the entire page
- Guest wish section shows empty state if fetch fails

### 12.4 Missing or Incomplete config.js
- Show visible fallback text in development
- Avoid broken rendering in production
- Required fields: endpoint URLs, couple names, event date

### 12.5 Deleted Guest Wish
- Deleted row in Google Sheets disappears on next page load/refresh

### 12.6 URL param `?to=` is empty or malformed
- Fall back to Announcement Mode
- Do not show broken personalized greeting
- Do not pre-fill name in forms

### 12.7 Guest opens link after event date
- Countdown shows "The day has come" or equivalent
- RSVP form is closed
- Guest wish form remains open

---

## 13. Success Criteria

The project is considered successful if:
- Deploys correctly on GitHub Pages
- Guests can open the invitation on mobile in < 3 seconds on 4G
- Personalized link shows guest name in hero and pre-fills form
- Guests can RSVP successfully (Invitation Mode)
- RSVP data appears in Google Sheets
- Guests can submit wishes in both modes
- Wishes appear on the page after load
- Host can delete inappropriate wishes in Google Sheets
- Map opens correctly and shows embed
- Calendar reminder works (Google Calendar + .ics)
- Countdown works and updates in real time
- Language toggle works without page reload
- RSVP closes automatically at H-7

---

## 14. Out of Scope (v1.0.0)

- Custom CMS
- Paid domain (optional, not required)
- Authentication system
- Admin dashboard
- Database server
- Real-time messaging or chat
- Heavy visual effects or video background
- Large photo galleries
- Backend microservices
- Auto-refresh / polling for guest wishes
- Server-side RSVP deduplication
- Email notification to host on RSVP submit

---

## 15. Implementation Notes

### Recommended File Structure
```
/
├── index.html
├── style.css
├── script.js
├── config.js
├── i18n.js           (optional, or merged into config.js)
├── assets/
│   ├── ornament.svg
│   └── favicon.ico
└── apps-script/
    └── Code.gs       (Google Apps Script source, not deployed here)
```

### Recommended Deployment Model
- GitHub repository (public)
- GitHub Pages enabled from `main` branch root
- Google Apps Script deployed separately as Web App (anyone can access)
- Google Sheets as data store (private, host access only)

### Google Apps Script Deployment Notes
- Deploy as: **Web App**
- Execute as: **Me**
- Who has access: **Anyone** (required for public form submission)
- Must handle both `GET` and `POST` requests
- Must return JSON response with CORS headers

---

## 16. Open Questions
Configurable at implementation time, does not block PRD:
- Couple names and parents names
- Exact event date, time, and venue
- Number of events (akad only / akad + resepsi)
- Final copy text in Indonesian and English
- Final domain name (GitHub subdomain is acceptable)
- Final color and font preferences within given direction

---

## 17. Version Notes

### v1.1.0
- Added expected guest count (150 guests) to constraints and overview
- Added CORS requirement (Section 8.4)
- Added `?to=NamaTamu` URL personalization (Section 6.3)
- Clarified RSVP not available in Announcement Mode
- Clarified Guest Wish fetch: page load only, no polling
- Removed Hybrid Mode (ambiguous, not needed)
- Merged redundant section 6.9 into 6.4
- Resolved config ambiguity: `config.js` only
- Added Apps Script rate limit to Known Limitations
- Added performance target: < 3 seconds on 4G
- Added Apps Script endpoint URL as required config field
- Added edge cases: empty `?to=` param, post-event date visit
- Expanded data model with full `config.js` schema
- Clarified Apps Script deployment requirements

### v1.0.0
- Initial PRD
- GitHub Pages constraint established
- Core features defined: RSVP, guest wish, maps, countdown, calendar, bilingual
