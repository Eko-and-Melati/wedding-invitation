const CONFIG = {
  // App mode — overridden by ?to= URL param at runtime
  // "invite"   = full invitation with RSVP
  // "announce" = announcement only, no RSVP
  defaultMode: "invite",
  defaultLanguage: "id", // "id" | "en"

  // Couple identity
  couple: {
    groom: {
      name: "Eko",
      fullName: "Eko Rudiawan Jamzuri",
      parents: "Alm. Bapak Ruwadi & Ibu Miarsih"
    },
    bride: {
      name: "Melati",
      fullName: "Melati Budiana Putri",
      parents: "Bapak Supomo & Ibu Rini Lestari"
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
      date: "2026-08-08",          // YYYY-MM-DD
      time: "07.00 - 09.00 WIB",
      venue: "Masjid Salman Institut Teknologi Bandung",
      address: "Jl. Ganesha No.7, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132",
      mapEmbedUrl: "https://www.google.com/maps?q=Masjid+Salman+Institut+Teknologi+Bandung&output=embed",
      mapDirectUrl: "https://share.google/8ggM4ijJXK2QEjPp5",
      isCountdownTarget: true
    }
  ],

  // RSVP settings
  rsvp: {
    enabled: true,
    deadlineDays: 7,               // RSVP tutup H-7 sebelum acara
    maxPartySize: 10,
    endpointUrl: "https://script.google.com/macros/s/AKfycbz4v6yJ0r5D9FEjFdeP-8ynEFdCnoFwAoPrShdvBAU2SA3THl-iVw62h5Yp98-7_3LVlg/exec"
  },

  // Guest wish settings
  guestWish: {
    enabled: true,
    endpointUrl: "https://script.google.com/macros/s/AKfycbz4v6yJ0r5D9FEjFdeP-8ynEFdCnoFwAoPrShdvBAU2SA3THl-iVw62h5Yp98-7_3LVlg/exec"
  },

  // Visual theme
  theme: {
    bgColor: "#FAF7F2",
    primaryColor: "#2C2C2C",
    accentColor: "#8A9E85",
    secondaryAccent: "#C9A84C",
    fontHeading: "Cormorant Garamond",
    fontBody: "Inter"
  }
};
