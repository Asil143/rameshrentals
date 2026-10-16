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

/**
 * A pickup/return pair from the URL, or null unless both are valid "YYYY-MM-DD"
 * dates with the return on or after the pickup and the pickup not in the past (IST).
 */
export function parseDateRange(start?: string, end?: string): { start: string; end: string } | null {
  const isDate = (value?: string): value is string => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
  if (!isDate(start) || !isDate(end) || end < start) return null;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return start < today ? null : { start, end };
}
