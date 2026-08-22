// Escapes "<" so a string value containing "</script>" can't break out of
// the <script type="application/ld+json"> tag it's embedded in via
// dangerouslySetInnerHTML. JSON.stringify alone only escapes quotes, not
// this HTML-specific case.
export function toJsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
