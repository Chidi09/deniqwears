import { tokens, escapeHtml } from './components';

const t = tokens;

export interface StoreContact {
  storeName: string;
  supportEmail: string;
  supportWhatsApp: string;
}

export const DEFAULT_STORE: StoreContact = {
  storeName: 'Deniqwears',
  supportEmail: 'concierge@deniqwears.com',
  supportWhatsApp: '+234 818 000 3344',
};

export interface EmailLayoutOptions {
  /** Hidden inbox preview line. */
  preheader: string;
  /** Small caps line above the headline, e.g. "Payment Confirmed". */
  eyebrow: string;
  /** Serif headline. */
  headline: string;
  /** Optional lead paragraph under the headline. */
  intro?: string;
  /** Composed component blocks (see components.ts). */
  blocks: string[];
  cta?: { href: string; label: string };
  store?: StoreContact;
}

/**
 * The shell every transactional email shares: canvas background, wordmark,
 * bordered card, headline, caller-supplied blocks, then the concierge footer.
 * Scenario templates (emails.ts) only compose blocks — they never repeat
 * chrome, so branding changes land in exactly one place.
 */
export function renderEmailLayout(options: EmailLayoutOptions): string {
  const store = options.store ?? DEFAULT_STORE;

  const blocks = options.blocks
    .filter(Boolean)
    .map((block) => `<tr><td style="padding-top:30px;">${block}</td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(options.eyebrow)}</title>
<style>
  @media only screen and (max-width:620px) {
    .wrap { padding:16px !important; }
    .card { padding:28px 22px !important; }
    .h1 { font-size:26px !important; }
    .stack { display:block !important; width:100% !important; padding-right:0 !important; padding-bottom:18px !important; text-align:left !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${t.canvas};">
<div style="display:none;font-size:1px;color:${t.canvas};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(options.preheader)}</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${t.canvas};">
  <tr>
    <td class="wrap" align="center" style="padding:40px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">

        <tr>
          <td align="center" style="padding-bottom:24px;">
            <div style="font-family:${t.sans};font-size:12px;letter-spacing:0.42em;text-transform:uppercase;color:${t.ink};font-weight:600;">${escapeHtml(store.storeName)}</div>
          </td>
        </tr>

        <tr>
          <td class="card" style="background-color:${t.paper};border:1px solid ${t.rule};padding:44px 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td>
                  <div style="font-family:${t.sans};font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:${t.oxblood};font-weight:700;padding-bottom:14px;">${escapeHtml(options.eyebrow)}</div>
                  <h1 class="h1" style="margin:0 0 ${options.intro ? '14px' : '0'} 0;font-family:${t.serif};font-size:32px;line-height:1.2;font-weight:400;color:${t.ink};">${options.headline}</h1>
                  ${options.intro ? `<p style="margin:0;font-family:${t.sans};font-size:14px;line-height:1.65;color:${t.graphite};">${options.intro}</p>` : ''}
                </td>
              </tr>
              ${blocks}
              ${
                options.cta
                  ? `<tr><td style="padding-top:34px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td bgcolor="${t.ink}" style="background-color:${t.ink};">
                            <a href="${escapeHtml(options.cta.href)}" style="display:inline-block;padding:14px 30px;font-family:${t.sans};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;color:${t.paper};text-decoration:none;">${escapeHtml(options.cta.label)}</a>
                          </td>
                        </tr>
                      </table>
                    </td></tr>`
                  : ''
              }
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 8px 0 8px;">
            <p style="margin:0 0 10px 0;font-family:${t.sans};font-size:12px;line-height:1.7;color:${t.graphite};">
              Questions about this order? Reach the concierge at
              <a href="mailto:${escapeHtml(store.supportEmail)}" style="color:${t.oxblood};text-decoration:none;">${escapeHtml(store.supportEmail)}</a>
              or WhatsApp ${escapeHtml(store.supportWhatsApp)}.
            </p>
            <p style="margin:0;font-family:${t.sans};font-size:11px;line-height:1.6;color:${t.muted};">
              ${escapeHtml(store.storeName)} &middot; Victoria Island Atelier, Lagos &middot; Nigeria
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
