// Google Apps Script — Wedding Invitation Backend
// Deploy as: Web App | Execute as: Me | Who has access: Anyone
//
// Setup:
// 1. Buat Google Sheet baru
// 2. Rename tab pertama → "RSVP"
// 3. Tambah tab baru → rename → "Wishes"
// 4. Isi SHEET_ID di bawah dengan ID dari URL sheet kamu
// 5. Deploy → New Deployment → Web App → Execute as: Me → Anyone

const SHEET_ID   = "YOUR_GOOGLE_SHEET_ID"; // Ganti dengan Sheet ID kamu
const RSVP_SHEET = "RSVP";
const WISH_SHEET = "Wishes";

// Header rows untuk inisialisasi sheet
const RSVP_HEADERS = ["timestamp","guest_name","attendance_status","party_size","note","source_url","language","mode"];
const WISH_HEADERS = ["timestamp","guest_name","message","relation","source_url","language","mode"];

function doGet(e) {
  const type = e && e.parameter ? e.parameter.type : null;
  if (type === "wishes") {
    return getWishes();
  }
  return jsonResponse({ error: "Unknown type" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.type === "rsvp")  return saveRSVP(data);
    if (data.type === "wish")  return saveWish(data);
    return jsonResponse({ error: "Unknown type" });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function saveRSVP(data) {
  const sheet = getOrCreateSheet(RSVP_SHEET, RSVP_HEADERS);
  sheet.appendRow([
    new Date().toISOString(),
    data.guest_name        || "",
    data.attendance_status || "",
    data.party_size        || 0,
    data.note              || "",
    data.source_url        || "",
    data.language          || "",
    data.mode              || ""
  ]);
  return jsonResponse({ success: true });
}

function saveWish(data) {
  const sheet = getOrCreateSheet(WISH_SHEET, WISH_HEADERS);
  sheet.appendRow([
    new Date().toISOString(),
    data.guest_name || "",
    data.message    || "",
    data.relation   || "",
    data.source_url || "",
    data.language   || "",
    data.mode       || ""
  ]);
  return jsonResponse({ success: true });
}

function getWishes() {
  const sheet = getOrCreateSheet(WISH_SHEET, WISH_HEADERS);
  const rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return jsonResponse({ wishes: [] });
  }
  const wishes = rows.slice(1)
    .filter(row => row[1] && row[2]) // skip empty rows
    .map(row => ({
      timestamp:  formatTimestamp(row[0]),
      guest_name: row[1],
      message:    row[2],
      relation:   row[3] || ""
    }))
    .reverse(); // newest first
  return jsonResponse({ wishes });
}

// =====================
// Helpers
// =====================

function getOrCreateSheet(name, headers) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  let sheet   = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sheet;
}

function formatTimestamp(raw) {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    return d.toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });
  } catch {
    return String(raw);
  }
}

function jsonResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
