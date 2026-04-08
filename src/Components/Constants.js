export const MONTH_THEMES = [
  { img: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=900&q=85", accent: "#3b82f6", pin: "#93c5fd", label: "January",   mood: "❄️ Deep Winter",     quote: "New beginnings await." },
  { img: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900&q=85", accent: "#ec4899", pin: "#f9a8d4", label: "February",  mood: "💕 Valentine's Air",  quote: "Love is in every detail." },
  { img: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=900&q=85", accent: "#22c55e", pin: "#86efac", label: "March",     mood: "🌱 First Bloom",      quote: "Everything is waking up." },
  { img: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=900&q=85", accent: "#f59e0b", pin: "#fcd34d", label: "April",     mood: "🌸 Cherry Season",    quote: "Bloom where you are planted." },
  { img: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=85", accent: "#10b981", pin: "#6ee7b7", label: "May",       mood: "🔥 Peak Summer",      quote: "The sun blazes at its brightest." },
  { img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=85", accent: "#06b6d4", pin: "#67e8f9", label: "June",      mood: "🌦️ Monsoon Begins",   quote: "The first rains bring relief." },
  { img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=85", accent: "#f97316", pin: "#fdba74", label: "July",      mood: "🌧️ Full Monsoon",     quote: "Rain washes the world anew." },
  { img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=85", accent: "#8b5cf6", pin: "#c4b5fd", label: "August",    mood: "🌅 Late Warmth",      quote: "Hold summer a little longer." },
  { img: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=900&q=85", accent: "#ef4444", pin: "#fca5a5", label: "September", mood: "🍂 First Fall",       quote: "Change is beautiful." },
  { img: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=85", accent: "#d97706", pin: "#fbbf24", label: "October",   mood: "🎃 Harvest Moon",     quote: "Magic lives in the mundane." },
  { img: "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=900&q=85", accent: "#6366f1", pin: "#a5b4fc", label: "November",  mood: "🍁 Golden Decay",     quote: "Gratitude transforms everything." },
  { img: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=900&q=85", accent: "#14b8a6", pin: "#5eead4", label: "December",  mood: "🎄 Winter Warmth",    quote: "Cherish every gathering." },
];

export const HOLIDAYS = {
  "08-15": "🇮🇳 Independence Day",
  "10-02": "🇮🇳 Gandhi Jayanti",
  "01-01": "New Year's Day",
  "05-01": "Labour Day / Maharashtra Day",
  "12-25": "Christmas Day",
  "01-15": "Pongal / Makar Sankranti",
  "04-14": "Ambedkar Jayanti / Tamil New Year",
  "08-29": "Onam",
  "11-14": "Children's Day (Nehru Jayanti)",
  "01-26": "🇮🇳 Republic Day",
};

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const EVENT_COLORS = [
  "#3b82f6", "#ec4899", "#22c55e", "#f97316",
  "#8b5cf6", "#ef4444", "#14b8a6", "#f59e0b",
];

export const LS_NOTES   = "wall_calendar_notes_v3";
export const LS_EVENTS  = "wall_calendar_events_v3";
export const LS_CROSSED = "wall_calendar_crossed_v3";

export const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
export const getFirstDay    = (y, m) => new Date(y, m, 1).getDay();
export const pad            = (n)    => String(n).padStart(2, "0");
export const toKey          = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const holKey         = (m, d)    => `${pad(m + 1)}-${pad(d)}`;
export const keyToDate      = (k) => {
  const [y, mo, d] = k.split("-").map(Number);
  return new Date(y, mo - 1, d);
};