// =====================
// App State
// =====================
const App = {
  lang: CONFIG.defaultLanguage || "id",
  mode: CONFIG.defaultMode || "announce",
  guestName: null,
  guestTitle: "",
  guestSuffix: "",
};



// =====================
// Init
// =====================
document.addEventListener("DOMContentLoaded", () => {
  initMode();
  initLang();
  applyTheme();
  renderI18n();
  renderConfig();
  renderEvents();
  renderCountdown();
  renderMaps();
  initRSVPForm();
  initWishForm();
  loadWishes();
  initLangToggle();
  initScrollSpy();
  initScrollAnim();
  initOpeningCover();
});

// =====================
// Mode Detection
// =====================
function initMode() {
  const params = new URLSearchParams(window.location.search);
  const to = params.get("to");
  const title = params.get("title");
  const suffix = params.get("suffix");

  if (to && to.trim() !== "") {
    App.mode = "invite";
    App.guestName = decodeURIComponent(to.trim());
    App.guestTitle = title && title.trim() !== "" ? decodeURIComponent(title.trim()) : "";
    App.guestSuffix = suffix && suffix.trim() !== "" ? decodeURIComponent(suffix.trim()) : "";
  } else {
    App.mode = "announce";
  }
}

// =====================
// Language Init
// =====================
function initLang() {
  const saved = localStorage.getItem("wedding_lang");
  if (saved && I18N[saved]) {
    App.lang = saved;
  }
  document.documentElement.lang = App.lang;
}

// =====================
// Theme from Config
// =====================
function applyTheme() {
  const t = CONFIG.theme;
  if (!t) return;
  const root = document.documentElement;
  if (t.bgColor)         root.style.setProperty("--bg", t.bgColor);
  if (t.primaryColor)    root.style.setProperty("--text", t.primaryColor);
  if (t.accentColor)     root.style.setProperty("--accent", t.accentColor);
  if (t.secondaryAccent) root.style.setProperty("--accent2", t.secondaryAccent);
  if (t.fontHeading)     root.style.setProperty("--font-heading", `'${t.fontHeading}', Georgia, serif`);
  if (t.fontBody)        root.style.setProperty("--font-body", `'${t.fontBody}', system-ui, sans-serif`);
}

// =====================
// i18n Render
// =====================
function renderI18n() {
  const strings = I18N[App.lang] || I18N["id"];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (strings[key] !== undefined) el.textContent = strings[key];
  });

  const heroLine1 = document.querySelector('[data-i18n="hero.label.line1"]');
  const heroLine2 = document.querySelector('[data-i18n="hero.label.line2"]');
  if (heroLine1 && heroLine2) {
    const announce = App.mode === "announce";
    heroLine1.textContent = announce ? strings["hero.announce.line1"] || strings["hero.label.line1"] : strings["hero.label.line1"];
    heroLine2.textContent = announce ? strings["hero.announce.line2"] || strings["hero.label.line2"] : strings["hero.label.line2"];
    heroLine1.classList.add('hero-label-line');
    heroLine2.classList.add('hero-label-line');
  }

  document.getElementById("lang-label").textContent =
    App.lang === "id" ? "EN" : "ID";

  // Update wishes empty state teks langsung tanpa re-fetch
  const wishesEmpty = document.querySelector(".wishes-empty");
  if (wishesEmpty) wishesEmpty.textContent = I18N[App.lang]["wishes.empty"];
}

// =====================
// Render Config Data
// =====================
function renderConfig() {
  const { couple, events } = CONFIG;
  const target = events.find(e => e.isCountdownTarget) || events[0];

  // Couple names
  document.getElementById("groom-name").textContent = couple.groom.name;
  document.getElementById("bride-name").textContent = couple.bride.name;
  document.getElementById("groom-fullname").textContent = couple.groom.fullName;
  document.getElementById("bride-fullname").textContent = couple.bride.fullName;
  document.getElementById("groom-parents").textContent = couple.groom.parents;
  document.getElementById("bride-parents").textContent = couple.bride.parents;
  document.getElementById("closing-groom").textContent = couple.groom.name;
  document.getElementById("closing-bride").textContent = couple.bride.name;

  // Hero date & city
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
    const namePart = App.guestTitle ? `${App.guestTitle} ${App.guestName}`.trim() : App.guestName;
    const suffixPart = App.guestSuffix || "";
    const prefix = I18N[App.lang]["hero.toPrefix"] || (App.lang === "id" ? "Kepada:" : "Dear:");
    const heroStr = suffixPart
      ? `${escapeHtml(prefix)} <span class="hero-to-name">${escapeHtml(namePart)}</span> <span class="hero-to-suffix">${escapeHtml(suffixPart)}</span>`
      : `${escapeHtml(prefix)} <span class="hero-to-name">${escapeHtml(namePart)}</span>`;
    heroTo.innerHTML = heroStr;
    heroTo.classList.remove("hidden");
  } else {
    heroTo.classList.add("hidden");
  }

  // Show RSVP section and nav item in invite mode only
  const rsvpSection = document.getElementById("rsvp");
  const rsvpNav = document.querySelector(".nav-invite-only");
  if (App.mode === "invite" && CONFIG.rsvp.enabled) {
    rsvpSection.classList.remove("hidden");
    if (rsvpNav) rsvpNav.style.display = "inline-block";
  } else {
    rsvpSection.classList.add("hidden");
    if (rsvpNav) rsvpNav.style.display = "none";
  }

  // Pre-fill name fields from URL param
  if (App.guestName) {
    document.getElementById("rsvp-name").value = App.guestName;
    document.getElementById("wish-name").value = App.guestName;
  }
}

// =====================
// Events & Calendar
// =====================
function renderEvents() {
  const container = document.getElementById("events-list");
  container.innerHTML = "";

  CONFIG.events.forEach(event => {
    const title = typeof event.title === "object"
      ? (event.title[App.lang] || event.title["id"])
      : event.title;

    const card = document.createElement("div");
    card.className = "event-card";
    card.innerHTML = `
      <p class="event-title">${escapeHtml(title)}</p>
      <p class="event-datetime">${escapeHtml(formatDate(event.date, App.lang))} &middot; ${escapeHtml(event.time)}</p>
      <p class="event-venue">${escapeHtml(event.venue)}</p>
      <p class="event-address">${escapeHtml(event.address)}</p>
      <div class="event-calendar-links">
        ${buildGCalLink(event)}
        ${buildICSLink(event)}
      </div>
    `;
    container.appendChild(card);
  });
}

function buildGCalLink(event) {
  const label = I18N[App.lang]["events.addCalendar"] || "Add to Calendar";
  const title = typeof event.title === "object"
    ? (event.title[App.lang] || event.title["id"])
    : event.title;
  const start = event.date.replace(/-/g, "");
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(title + " - " + event.venue)}` +
    `&dates=${start}/${start}` +
    `&details=${encodeURIComponent(event.address)}` +
    `&location=${encodeURIComponent(event.address)}`;
  return `<a href="${url}" target="_blank" rel="noopener" class="event-calendar-btn">${I18N[App.lang]["events.googleCalendar"] || "Google Calendar"}</a>`;
}

function buildICSLink(event) {
  const label = I18N[App.lang]["events.ical"] || "iCal (.ICS)";
  const title = typeof event.title === "object"
    ? (event.title[App.lang] || event.title["id"])
    : event.title;
  const start = event.date.replace(/-/g, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${title} - ${event.venue}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${start}`,
    `LOCATION:${event.address}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  const blob = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  return `<a href="${blob}" download="wedding-${event.id}.ics" class="event-calendar-btn">${label}</a>`;
}

// =====================
// Countdown
// =====================
function renderCountdown() {
  const target = CONFIG.events.find(e => e.isCountdownTarget) || CONFIG.events[0];
  if (!target) return;

  const targetDate = new Date(target.date + "T00:00:00");
  const passedEl = document.getElementById("countdown-passed");

  function tick() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      document.getElementById("cd-days").textContent = "00";
      document.getElementById("cd-hours").textContent = "00";
      document.getElementById("cd-minutes").textContent = "00";
      document.getElementById("cd-seconds").textContent = "00";
      passedEl.classList.remove("hidden");
      return;
    }

    passedEl.classList.add("hidden");
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);

    document.getElementById("cd-days").textContent    = String(days).padStart(2, "0");
    document.getElementById("cd-hours").textContent   = String(hours).padStart(2, "0");
    document.getElementById("cd-minutes").textContent = String(mins).padStart(2, "0");
    document.getElementById("cd-seconds").textContent = String(secs).padStart(2, "0");
  }

  tick();
  setInterval(tick, 1000);
}

// =====================
// Maps
// =====================
function renderMaps() {
  const container = document.getElementById("maps-list");
  container.innerHTML = "";
  const openLabel = I18N[App.lang]["maps.openMaps"] || "Open in Google Maps →";

  CONFIG.events.forEach(event => {
    const title = typeof event.title === "object"
      ? (event.title[App.lang] || event.title["id"])
      : event.title;

    const card = document.createElement("div");
    card.className = "map-card";
    card.innerHTML = `
      <p class="map-title">${escapeHtml(title)}</p>
      <p class="map-address">${escapeHtml(event.address)}</p>
      ${event.mapEmbedUrl
        ? `<iframe class="map-embed" src="${event.mapEmbedUrl}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map ${escapeHtml(event.venue)}"></iframe>`
        : ""}
      ${event.mapDirectUrl
        ? `<a href="${event.mapDirectUrl}" target="_blank" rel="noopener" class="map-link">${openLabel}</a>`
        : ""}
    `;
    container.appendChild(card);
  });
}

// =====================
// Language Toggle
// =====================
function initLangToggle() {
  document.getElementById("lang-toggle").addEventListener("click", () => {
    App.lang = App.lang === "id" ? "en" : "id";
    localStorage.setItem("wedding_lang", App.lang);
    document.documentElement.lang = App.lang;
    renderI18n();
    renderConfig();
    renderEvents();
    renderMaps();
    renderHero();
  });
}

// =====================
// RSVP Form
// =====================
function initRSVPForm() {
  if (App.mode !== "invite" || !CONFIG.rsvp.enabled) return;

  const form     = document.getElementById("rsvp-form");
  const closedEl = document.getElementById("rsvp-closed");
  const feedback = document.getElementById("rsvp-feedback");

  // Already submitted?
  if (localStorage.getItem("rsvp_submitted")) {
    form.classList.add("hidden");
    closedEl.classList.remove("hidden");
    closedEl.querySelector("p").textContent = I18N[App.lang]["rsvp.already"];
    return;
  }

  // Deadline check
  const target = CONFIG.events.find(e => e.isCountdownTarget) || CONFIG.events[0];
  if (target) {
    const deadline = new Date(target.date + "T00:00:00");
    deadline.setDate(deadline.getDate() - CONFIG.rsvp.deadlineDays);
    if (new Date() > deadline) {
      form.classList.add("hidden");
      closedEl.classList.remove("hidden");
      return;
    }
  }

  // Attendance toggle
  let attendance = "attending";
  const btnAttend    = document.getElementById("btn-attend");
  const btnNotAttend = document.getElementById("btn-not-attend");
  const partySizeGrp = document.getElementById("party-size-group");

  btnAttend.addEventListener("click", () => {
    attendance = "attending";
    document.getElementById("rsvp-attendance").value = attendance;
    btnAttend.classList.add("active");
    btnNotAttend.classList.remove("active");
    partySizeGrp.classList.remove("hidden");
  });

  btnNotAttend.addEventListener("click", () => {
    attendance = "not_attending";
    document.getElementById("rsvp-attendance").value = attendance;
    btnNotAttend.classList.add("active");
    btnAttend.classList.remove("active");
    partySizeGrp.classList.add("hidden");
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
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("rsvp-name").value.trim();
    if (!name) return;

    const submitBtn = document.getElementById("rsvp-submit");
    submitBtn.disabled = true;
    feedback.className = "form-feedback hidden";
    feedback.textContent = "";

    const payload = {
      type: "rsvp",
      guest_name: name,
      attendance_status: document.getElementById("rsvp-attendance").value,
      party_size: attendance === "attending"
        ? parseInt(document.getElementById("rsvp-party-size").value, 10)
        : 0,
      note: document.getElementById("rsvp-note").value.trim(),
      source_url: window.location.href,
      language: App.lang,
      mode: App.mode
    };

    try {
      if (CONFIG.rsvp.endpointUrl) {
        await fetch(CONFIG.rsvp.endpointUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload)
        });
      }
      localStorage.setItem("rsvp_submitted", "1");
      form.classList.add("hidden");
      const msg = attendance === "attending"
        ? I18N[App.lang]["rsvp.success"]
        : I18N[App.lang]["rsvp.successAbsent"];
      showToast(msg);
    } catch {
      submitBtn.disabled = false;
      feedback.textContent = I18N[App.lang]["rsvp.error"];
      feedback.className = "form-feedback error";
      feedback.classList.remove("hidden");
    }
  });
}

// =====================
// Guest Wish — Load
// =====================
async function loadWishes() {
  if (!CONFIG.guestWish.enabled) return;

  const container = document.getElementById("wishes-list");
  const loadingEl = document.getElementById("wishes-loading");

  if (!CONFIG.guestWish.endpointUrl) {
    if (loadingEl) loadingEl.remove();
    container.innerHTML = `<p class="wishes-empty" style="opacity:0.5;font-size:0.9rem">${I18N[App.lang]["wishes.empty"]}</p>`;
    return;
  }

  try {
    const res = await fetch(`${CONFIG.guestWish.endpointUrl}?type=wishes`);
    const data = await res.json();
    if (loadingEl) loadingEl.remove();

    if (!data.wishes || data.wishes.length === 0) {
      container.innerHTML = `<p style="opacity:0.5;font-size:0.9rem">${I18N[App.lang]["wishes.empty"]}</p>`;
      return;
    }

    data.wishes.forEach(w => {
      const card = document.createElement("div");
      card.className = "wish-card";
      card.innerHTML = `
        <p class="wish-name">${escapeHtml(w.guest_name || "")}</p>
        <p class="wish-message">${escapeHtml(w.message || "")}</p>
        <p class="wish-time">${escapeHtml(w.timestamp || "")}</p>
      `;
      container.appendChild(card);
    });
  } catch {
    if (loadingEl) loadingEl.remove();
  }
}

// =====================
// Guest Wish — Submit
// =====================
function initWishForm() {
  if (!CONFIG.guestWish.enabled) return;

  const form     = document.getElementById("wish-form");
  const feedback = document.getElementById("wish-feedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name    = document.getElementById("wish-name").value.trim();
    const message = document.getElementById("wish-message").value.trim();
    if (!name || !message) return;

    const submitBtn = document.getElementById("wish-submit");
    submitBtn.disabled = true;
    feedback.className = "form-feedback hidden";
    feedback.textContent = "";

    const payload = {
      type: "wish",
      guest_name: name,
      message,
      source_url: window.location.href,
      language: App.lang,
      mode: App.mode
    };

    try {
      if (CONFIG.guestWish.endpointUrl) {
        // Apps Script redirects POST — use no-cors to skip CORS/redirect issues
        // Data still saves even if response is unreadable
        await fetch(CONFIG.guestWish.endpointUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload)
        });
      }
      // Prepend wish to list immediately without re-fetch
      const list = document.getElementById("wishes-list");
      const emptyEl = list.querySelector(".wishes-empty");
      if (emptyEl) emptyEl.remove();
      const card = document.createElement("div");
      card.className = "wish-card";
      card.style.animation = "heroFadeIn 0.4s ease-out";
      card.innerHTML = `
        <p class="wish-name">${escapeHtml(name)}</p>
        <p class="wish-message">${escapeHtml(message)}</p>
        <p class="wish-time">${escapeHtml(I18N[App.lang]["wishes.justNow"] || "Baru saja")}</p>
      `;
      list.insertBefore(card, list.firstChild);
      feedback.textContent = I18N[App.lang]["wishes.success"];
      feedback.className = "form-feedback success";
      feedback.classList.remove("hidden");
      form.reset();
      if (App.guestName) {
        document.getElementById("wish-name").value = App.guestName;
      }
    } catch {
      feedback.textContent = I18N[App.lang]["wishes.error"];
      feedback.className = "form-feedback error";
      feedback.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// =====================
// Scroll Spy
// =====================
function initScrollSpy() {
  const navLinks = Array.from(document.querySelectorAll('.top-nav a[href^="#"]'));
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (!navLinks.length || !sections.length) return;

  let lockedId = null;
  let lockTimer = null;
  let scrollTimer = null;

  const setActive = (id) => {
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
  };

  const getClosestSection = () => {
    const centerY = window.scrollY + (window.innerHeight * 0.38);
    let closest = sections[0];
    let minDist = Infinity;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const dist = Math.abs(top - centerY);
      if (dist < minDist) {
        minDist = dist;
        closest = section;
      }
    });

    return closest;
  };

  navLinks.forEach(a => {
    a.addEventListener('click', () => {
      const id = a.getAttribute('href').slice(1);
      setActive(id);
      lockedId = id;
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => { lockedId = null; }, 1400);
    });
  });

  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (lockedId) return;
      const closest = getClosestSection();
      if (closest?.id) setActive(closest.id);
    }, 120);
  }, { passive: true });

  setActive('hero');
}

// =====================
// Scroll Animation
// =====================
function initScrollAnim() {
  const sections = document.querySelectorAll("section:not(#hero)");
  if (!sections.length) return;

  sections.forEach(s => s.classList.add("section-hidden"));

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("section-hidden");
          entry.target.classList.add("section-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  sections.forEach(s => obs.observe(s));
}

// =====================
// Opening Cover
// =====================
function initOpeningCover() {
  const cover = document.getElementById("opening-cover");
  const btn = document.getElementById("opening-btn");
  if (!cover || !btn) return;

  // Skip opening cover in announce mode
  if (App.mode !== "invite") {
    cover.remove();
    return;
  }

  // Skip if already opened before
  if (localStorage.getItem("wedding_opened")) {
    cover.remove();
    return;
  }

  cover.classList.remove("hidden");

  btn.addEventListener("click", () => {
    cover.classList.add("fade-out");
    setTimeout(() => cover.remove(), 600);
    localStorage.setItem("wedding_opened", "1");
  });
}

// =====================
// Date Formatter
// =====================
function formatDate(dateStr, lang) {
  const months = {
    id: ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],
    en: ["January","February","March","April","May","June","July","August","September","October","November","December"]
  };
  const [y, m, d] = dateStr.split("-").map(Number);
  const monthList = months[lang] || months["id"];
  return `${d} ${monthList[m - 1]} ${y}`;
}

// =====================
// Utility
// =====================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =====================
// Toast Notification
// =====================
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast-notif";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove("toast-hide");
  toast.classList.add("toast-show");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hide");
  }, 3500);
}
