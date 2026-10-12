import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

/**
 * Input hygiene for everything customers and admins type.
 *
 * Output is always escaped anyway (React escapes text; emails go through
 * escapeHtml), so this is defence in depth: nothing that looks like markup or
 * script is ever stored, and invisible characters used to spoof text are removed.
 * Prisma parameterises every query, so SQL injection is not possible through
 * these fields; the length limits below bound the size of what gets stored.
 */

// Control characters, zero-width characters and bidirectional overrides
// (the "Trojan Source" trick that makes text display differently from what it is).
// eslint-disable-next-line no-control-regex
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

const STRIP_ALL_HTML: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

// sanitize-html escapes & < > " ' in the text it returns. We store plain text,
// so turn those back (we always escape again on the way out).
const decodeBasicEntities = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

/** Plain text only: tags and script removed, odd characters dropped, whitespace tidied. */
export function sanitizePlainText(input: string, options: { multiline?: boolean } = {}): string {
  let text = input.normalize('NFC').replace(INVISIBLE, '');

  // Repeat until stable, so encoded markup that decodes into a tag
  // (for example "&lt;script&gt;") is removed too.
  for (let i = 0; i < 3; i++) {
    const next = decodeBasicEntities(sanitizeHtml(text, STRIP_ALL_HTML));
    if (next === text) break;
    text = next;
  }

  text = options.multiline
    ? text.replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n')
    : text.replace(/\s+/g, ' ');
  return text.trim();
}

interface TextOptions {
  min?: number;
  multiline?: boolean;
  /** Shown when the field is empty or too short. */
  label?: string;
}

/**
 * A Zod string that is length-limited before any processing (so a huge input
 * is rejected cheaply), sanitised, then checked again.
 */
export function text(
  max: number,
  { min = 0, multiline = false, label = 'This field' }: TextOptions = {}
): z.ZodType<string, string> {
  // The cast restores the true type: Zod types a field that passes through a
  // transform as "optional" in the object output, but the value is always a string.
  return z
    .string()
    .max(max * 2, `${label} is too long`)
    .transform((value) => sanitizePlainText(value, { multiline }))
    .pipe(
      z
        .string()
        .min(min, min > 0 ? `${label} is required` : undefined)
        .max(max, `${label} must be ${max} characters or fewer`)
    ) as unknown as z.ZodType<string, string>;
}

/** http(s) addresses and site-relative paths only. Blocks javascript:, data:, file: and the like. */
export function isSafeUrl(value: string): boolean {
  // eslint-disable-next-line no-control-regex
  if (value.length > 2000 || /[\u0000-\u001F\u007F\s\\]/.test(value)) return false;
  if (value.startsWith('/')) return !value.startsWith('//');
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password;
  } catch {
    return false;
  }
}

export const safeUrl = (message = 'Enter a valid web address starting with https://') =>
  z.string().trim().refine(isSafeUrl, message);

export const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SKU = /^[A-Za-z0-9._-]{1,40}$/;
export const ID = /^[A-Za-z0-9_-]{1,64}$/;
