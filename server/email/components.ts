/**
 * Reusable, email-client-safe building blocks. Every component returns a
 * self-contained table so blocks can be composed in any order without
 * layout surprises in Outlook/Gmail.
 *
 * Rules this file follows (and any new component should too):
 *  - tables for layout, never flex/grid
 *  - inline styles only (no class-based styling except the responsive
 *    helpers defined in layout.ts)
 *  - no webfonts; system serif/sans stacks only
 */

export const tokens = {
  ink: '#171714',
  graphite: '#56554F',
  muted: '#8A8780',
  canvas: '#F4F1EB',
  paper: '#FAF9F6',
  rule: '#E4E0D8',
  oxblood: '#681F2C',
  serif: "Georgia, 'Times New Roman', Times, serif",
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
} as const;

const t = tokens;

export function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Formats kobo as Naira, e.g. 4800000 -> ₦48,000 */
export function formatNaira(kobo: number): string {
  return `&#8358;${Math.round(kobo / 100).toLocaleString('en-NG')}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Small letterspaced caps label used above every block. */
export function label(text: string): string {
  return `<div style="font-family:${t.sans};font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:${t.muted};font-weight:600;">${escapeHtml(text)}</div>`;
}

export function paragraph(text: string, options: { color?: string; size?: number } = {}): string {
  const color = options.color ?? t.graphite;
  const size = options.size ?? 14;
  return `<p style="margin:0 0 14px 0;font-family:${t.sans};font-size:${size}px;line-height:1.65;color:${color};">${text}</p>`;
}

export function spacer(height: number): string {
  return `<div style="height:${height}px;line-height:${height}px;font-size:0;">&nbsp;</div>`;
}

export function divider(): string {
  return `<div style="height:1px;line-height:1px;font-size:0;background-color:${t.rule};">&nbsp;</div>`;
}

/** Two-column key/value strip, ruled top and bottom. Used for order meta. */
export function metaStrip(pairs: Array<{ label: string; value: string }>): string {
  const cells = pairs
    .map(
      (pair, index) => `
        <td width="${Math.floor(100 / pairs.length)}%" valign="top" align="${index === pairs.length - 1 && pairs.length > 1 ? 'right' : 'left'}" class="stack" style="padding:18px 0;">
          ${label(pair.label)}
          <div style="font-family:${t.sans};font-size:14px;color:${t.ink};font-weight:600;padding-top:5px;letter-spacing:0.03em;">${pair.value}</div>
        </td>`
    )
    .join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${t.rule};border-bottom:1px solid ${t.rule};">
      <tr>${cells}</tr>
    </table>`;
}

export interface EmailLineItem {
  name: string;
  meta: string;
  amount: string;
  image?: string;
}

/** Product/line-item list with thumbnails. */
export function lineItems(items: EmailLineItem[]): string {
  const rows = items
    .map(
      (item, index) => `
        <tr>
          <td style="padding:${index === 0 ? '0' : '18px'} 0 18px 0;border-bottom:1px solid ${t.rule};" valign="top">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${
                  item.image
                    ? `<td width="56" valign="top" style="padding-right:16px;">
                        <img src="${escapeHtml(item.image)}" width="56" height="72" alt="" style="display:block;width:56px;height:72px;object-fit:cover;border:1px solid ${t.rule};background-color:${t.canvas};" />
                      </td>`
                    : ''
                }
                <td valign="top">
                  <div style="font-family:${t.serif};font-size:16px;line-height:1.3;color:${t.ink};padding-bottom:5px;">${escapeHtml(item.name)}</div>
                  <div style="font-family:${t.sans};font-size:12px;line-height:1.5;color:${t.muted};">${escapeHtml(item.meta)}</div>
                </td>
                <td width="90" valign="top" align="right" style="font-family:${t.sans};font-size:13px;font-weight:600;color:${t.ink};white-space:nowrap;">${item.amount}</td>
              </tr>
            </table>
          </td>
        </tr>`
    )
    .join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${rows}</table>`;
}

export interface SummaryRow {
  label: string;
  value: string;
  /** Renders as the bold ruled total row. */
  emphasis?: boolean;
  /** Tints the value in the brand accent (for discounts, refunds). */
  accent?: boolean;
}

/** Totals panel on the canvas tint. */
export function summary(rows: SummaryRow[]): string {
  const body = rows
    .map((row) => {
      const valueColor = row.accent ? t.oxblood : row.emphasis ? t.ink : t.graphite;
      return `
        <tr>
          <td style="font-family:${t.sans};font-size:${row.emphasis ? '13px' : '12px'};color:${row.emphasis ? t.ink : t.graphite};font-weight:${row.emphasis ? '700' : '400'};padding:${row.emphasis ? '12px 0 0 0' : '0 0 8px 0'};${row.emphasis ? `border-top:1px solid ${t.rule};` : ''}${row.emphasis ? 'letter-spacing:0.08em;text-transform:uppercase;' : ''}">${escapeHtml(row.label)}</td>
          <td align="right" style="font-family:${t.sans};font-size:${row.emphasis ? '15px' : '12px'};color:${valueColor};font-weight:${row.emphasis ? '700' : '500'};padding:${row.emphasis ? '12px 0 0 0' : '0 0 8px 0'};${row.emphasis ? `border-top:1px solid ${t.rule};` : ''}">${row.value}</td>
        </tr>`;
    })
    .join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${t.canvas};">
      <tr>
        <td style="padding:22px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${body}</table>
        </td>
      </tr>
    </table>`;
}

export interface DetailColumn {
  label: string;
  lines: string[];
}

/** Side-by-side detail columns (address / payment), stacking on mobile. */
export function detailColumns(columns: DetailColumn[]): string {
  const cells = columns
    .map(
      (column, index) => `
        <td class="stack" width="${Math.floor(100 / columns.length)}%" valign="top" style="${index < columns.length - 1 ? 'padding-right:20px;' : ''}">
          ${label(column.label)}
          <div style="font-family:${t.sans};font-size:13px;line-height:1.6;color:${t.ink};padding-top:7px;">
            ${column.lines.join('<br />')}
          </div>
        </td>`
    )
    .join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>${cells}</tr></table>`;
}

/** Secondary text within a detail column. */
export function subdued(text: string): string {
  return `<span style="color:${tokens.graphite};">${escapeHtml(text)}</span>`;
}

/** Tinted callout for status messages. */
export function notice(text: string, tone: 'neutral' | 'accent' = 'neutral'): string {
  const background = tone === 'accent' ? '#F7EFF0' : t.canvas;
  const border = tone === 'accent' ? '#E3CDD1' : t.rule;
  const color = tone === 'accent' ? t.oxblood : t.graphite;

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${background};border:1px solid ${border};">
      <tr>
        <td style="padding:16px 18px;font-family:${t.sans};font-size:13px;line-height:1.6;color:${color};">${text}</td>
      </tr>
    </table>`;
}

/** Bulletproof (table-based) button. */
export function button(href: string, text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td bgcolor="${t.ink}" style="background-color:${t.ink};">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 30px;font-family:${t.sans};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;color:${t.paper};text-decoration:none;">${escapeHtml(text)}</a>
        </td>
      </tr>
    </table>`;
}
