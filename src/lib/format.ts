// Display formatting for dates stored as "YYYY-MM-DD" and times as "HH:MM[:SS]".
// Parsed as local calendar dates so they never shift across time zones.
// `locale` is a BCP 47 tag such as "en-IN" or "te-IN".

function parseDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "26 Oct" */
export function formatShortDate(date: string, locale = "en-IN") {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(parseDate(date));
}

/** "Mon, 26 Oct" */
export function formatDayDate(date: string, locale = "en-IN") {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(parseDate(date));
}

/** "Mon, 26 Oct 2026" */
export function formatLongDate(date: string, locale = "en-IN") {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(parseDate(date));
}

/** "9:00 am" */
export function formatTime(time: string | null, locale = "en-IN") {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, h, m));
}
