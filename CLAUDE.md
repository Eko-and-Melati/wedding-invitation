# Wedding Invitation — Eko & Melati

## Stack
Static HTML/CSS/JS — GitHub Pages. No framework, no build step.
- `index.html` — main page structure
- `script.js` — all JS logic
- `style.css` — all styles
- `i18n.js` — Indonesian + English translations
- `config.js` — data: couple, event, guest

## Key Sections
- **Opening cover** (invite mode only, `?to=Nama`): overlay before clicking "Buka Undangan"
- **Hero** (`#hero`): main top section after cover dismissed
- **Couple** (`#couple`): groom & bride with "putra dari" / "putri dari"
- **Closing** (`#closing`): closing greeting, parents, Wassalam, footer

## UI Patterns
- Animations: `hero-fade` CSS classes with `--order` delay vars
- i18n: `data-i18n` attributes + `I18N` object
- Guest name: `App.guestName`, title: `App.guestTitle` from URL params `?to=X&title=Y`

## Flow — Opening Cover (invite mode)
Bismillah → Assalamu'alaikum → Yth. [name] → "Kami mengundang kehadiran Bapak/Ibu/Saudara/i pada acara akad pernikahan kami" → Buka Undangan button

## Deployment
- Remote: `github.com/Eko-and-Melati/wedding-invitation.git` (master branch)
- Live: `https://eko-and-melati.github.io/wedding-invitation/`
- Test locally: `python3 -m http.server 8080` then `http://localhost:8080?to=Test`
