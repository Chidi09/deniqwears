/**
 * JSON-LD is inserted into a native script element. Escape `<` so content
 * originating from the catalog can never terminate that element as HTML.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
