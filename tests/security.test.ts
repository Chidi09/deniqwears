import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { isSafeUrl, sanitizePlainText } from '../server/sanitize';
import { parseBody } from '../server/http';
import {
  AdminLoginSchema,
  CheckoutPayloadSchema,
  DiscountValidateSchema,
  NewsletterSubscribeSchema,
  ProductCreateUpdateSchema,
  StoreSettingsUpdateSchema,
} from '../src/lib/schemas';

describe('sanitizePlainText', () => {
  it('removes tags and script content', () => {
    expect(sanitizePlainText('Hello <script>alert(1)</script>world')).toBe('Hello world');
    expect(sanitizePlainText('<img src=x onerror=alert(1)>Nice')).toBe('Nice');
    expect(sanitizePlainText('<b>bold</b> <i>text</i>')).toBe('bold text');
    expect(sanitizePlainText('<style>body{display:none}</style>Hi')).toBe('Hi');
  });

  it('removes markup that is hidden behind entities', () => {
    expect(sanitizePlainText('&lt;script&gt;alert(1)&lt;/script&gt;')).not.toContain('<script');
    expect(sanitizePlainText('&lt;img src=x onerror=alert(1)&gt;')).not.toContain('<img');
  });

  it('keeps ordinary text intact, including ampersands and apostrophes', () => {
    expect(sanitizePlainText("Tom & Jerry's  linen   set")).toBe("Tom & Jerry's linen set");
    expect(sanitizePlainText('5 < 7 and 9 > 2')).toBe('5 < 7 and 9 > 2');
    expect(sanitizePlainText('Crème brûlée, José, 日本語')).toBe('Crème brûlée, José, 日本語');
  });

  it('drops control, zero-width and bidirectional-override characters', () => {
    expect(sanitizePlainText('ad​min\u0000')).toBe('admin');
    expect(sanitizePlainText('safe‮text')).toBe('safetext');
    expect(sanitizePlainText('a\u0007b')).toBe('ab');
  });

  it('keeps line breaks only for multiline fields', () => {
    expect(sanitizePlainText('one\ntwo')).toBe('one two');
    expect(sanitizePlainText('one\n\n\n\ntwo', { multiline: true })).toBe('one\n\ntwo');
  });
});

describe('isSafeUrl', () => {
  it('accepts https, http and site paths', () => {
    for (const url of ['https://cdn.example.com/a.jpg', 'http://example.com/a.png', '/products/iris-gown.webp']) {
      expect(isSafeUrl(url)).toBe(true);
    }
  });

  it('rejects script, data and file schemes, protocol-relative and credentialed links', () => {
    for (const url of [
      'javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'file:///etc/passwd',
      'vbscript:msgbox(1)',
      '//evil.example.com/x.jpg',
      'https://user:pass@example.com/x.jpg',
      'https://example.com/a b.jpg',
      '/path\\evil',
      '',
    ]) {
      expect(isSafeUrl(url)).toBe(false);
    }
  });
});

const validProduct = {
  name: 'The Test Gown',
  priceInKobo: 12_800,
  category: 'dresses',
  status: 'live',
  colors: [{ name: 'Teal', hex: '#1A9A96' }],
  sizes: ['10'],
  variants: [{ color: 'Teal', size: '10', stock: 5, active: true }],
  primaryImage: '/products/test.webp',
};

describe('product schema', () => {
  it('accepts a normal product', () => {
    expect(ProductCreateUpdateSchema.safeParse(validProduct).success).toBe(true);
  });

  it('strips HTML from text fields instead of storing it', () => {
    const parsed = ProductCreateUpdateSchema.parse({
      ...validProduct,
      name: '<b>The</b> Gown<script>x()</script>',
      description: 'Soft <a href="javascript:alert(1)">linen</a> fabric',
    });
    expect(parsed.name).toBe('The Gown');
    expect(parsed.description).toBe('Soft linen fabric');
  });

  it('rejects dangerous image links', () => {
    for (const primaryImage of ['javascript:alert(1)', 'data:image/svg+xml,<svg onload=alert(1)>']) {
      expect(ProductCreateUpdateSchema.safeParse({ ...validProduct, primaryImage }).success).toBe(false);
    }
    expect(ProductCreateUpdateSchema.safeParse({ ...validProduct, galleryImages: ['javascript:1'] }).success).toBe(false);
  });

  it('rejects bad colours, slugs and SKUs', () => {
    const colors = [{ name: 'Teal', hex: 'red;background:url(//evil)' }];
    expect(ProductCreateUpdateSchema.safeParse({ ...validProduct, colors }).success).toBe(false);
    expect(ProductCreateUpdateSchema.safeParse({ ...validProduct, slug: 'Bad Slug!' }).success).toBe(false);
    const variants = [{ color: 'Teal', size: '10', stock: 1, active: true, sku: "x'; DROP TABLE" }];
    expect(ProductCreateUpdateSchema.safeParse({ ...validProduct, variants }).success).toBe(false);
  });

  it('bounds numbers and lengths', () => {
    expect(ProductCreateUpdateSchema.safeParse({ ...validProduct, priceInKobo: -1 }).success).toBe(false);
    expect(ProductCreateUpdateSchema.safeParse({ ...validProduct, priceInKobo: 1e12 }).success).toBe(false);
    expect(ProductCreateUpdateSchema.safeParse({ ...validProduct, name: 'x'.repeat(500) }).success).toBe(false);
    expect(ProductCreateUpdateSchema.safeParse({ ...validProduct, description: 'x'.repeat(20_000) }).success).toBe(false);
  });

  it('drops fields it does not know about', () => {
    const parsed = ProductCreateUpdateSchema.parse({ ...validProduct, id: 'hacked', isAdmin: true, __proto__: { x: 1 } });
    expect(parsed).not.toHaveProperty('id');
    expect(parsed).not.toHaveProperty('isAdmin');
  });
});

describe('checkout schema', () => {
  const base = {
    items: [{ productId: 'prod_1', variantId: 'var_1', quantity: 1 }],
    customer: { firstName: 'Ada', lastName: 'Okafor', email: 'Ada@Gmail.com', phone: '713-555-0142' },
    shippingAddress: {
      firstName: 'Ada',
      lastName: 'Okafor',
      email: 'ada@gmail.com',
      phone: '7135550142',
      address: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'Houston',
      state: 'TX',
      postalCode: '77002',
      country: 'United States',
    },
    deliveryZoneId: 'zone-us-standard',
    paymentMethod: 'stripe',
    idempotencyKey: 'idemp_123456789',
  };

  it('normalises email case and phone format', () => {
    const parsed = CheckoutPayloadSchema.parse(base);
    expect(parsed.customer.email).toBe('ada@gmail.com');
    expect(parsed.customer.phone).toBe('(713) 555-0142');
  });

  it('rejects markup in names, and strips it from address, city and apartment', () => {
    const address = (patch: object) => ({ ...base, shippingAddress: { ...base.shippingAddress, ...patch } });
    expect(CheckoutPayloadSchema.safeParse(address({ firstName: '<script>alert(1)</script>' })).success).toBe(false);
    expect(CheckoutPayloadSchema.safeParse(address({ lastName: 'Okafor"><img src=x>' })).success).toBe(false);

    const cleaned = CheckoutPayloadSchema.parse(
      address({ city: 'Houston<script>alert(1)</script>', apartment: '<b>4B</b>', address: '<i>123</i> Main Street' })
    ).shippingAddress;
    expect(cleaned.city).toBe('Houston');
    expect(cleaned.apartment).toBe('4B');
    expect(cleaned.address).toBe('123 Main Street');
    for (const value of Object.values(cleaned)) expect(String(value)).not.toMatch(/[<>]/);
  });

  it('rejects header-injection and oversized values', () => {
    const email = 'a@b.co\r\nBcc: victim@example.com';
    expect(CheckoutPayloadSchema.safeParse({ ...base, customer: { ...base.customer, email } }).success).toBe(false);
    const huge = 'x'.repeat(5_000);
    expect(CheckoutPayloadSchema.safeParse({ ...base, shippingAddress: { ...base.shippingAddress, address: huge } }).success).toBe(false);
  });

  it('rejects odd ids, quantities and codes', () => {
    expect(CheckoutPayloadSchema.safeParse({ ...base, items: [{ productId: "x' OR 1=1 --", variantId: 'v', quantity: 1 }] }).success).toBe(false);
    expect(CheckoutPayloadSchema.safeParse({ ...base, items: [{ productId: 'p', variantId: 'v', quantity: 1e9 }] }).success).toBe(false);
    expect(CheckoutPayloadSchema.safeParse({ ...base, discountCode: '<script>' }).success).toBe(false);
    expect(CheckoutPayloadSchema.parse({ ...base, discountCode: 'welcome10' }).discountCode).toBe('WELCOME10');
  });
});

describe('other schemas', () => {
  it('limits login input', () => {
    expect(AdminLoginSchema.safeParse({ email: 'a@b.co', password: 'x'.repeat(10_000) }).success).toBe(false);
    expect(AdminLoginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false);
  });

  it('validates promo codes and newsletter emails', () => {
    expect(DiscountValidateSchema.safeParse({ code: "'; DROP TABLE users;--", subtotalInKobo: 100 }).success).toBe(false);
    expect(NewsletterSubscribeSchema.safeParse({ email: 'x@y' }).success).toBe(false);
    expect(NewsletterSubscribeSchema.parse({ email: ' Ada@Gmail.com ' }).email).toBe('ada@gmail.com');
  });

  it('sanitises promotion text and blocks unsafe banner images', () => {
    const settings = {
      promotions: {
        announcements: ['Sale <script>x()</script> today'],
        banner: {
          enabled: true,
          eyebrow: '',
          headline: '<b>Big</b> sale',
          body: 'Body',
          ctaLabel: 'Shop',
          ctaTarget: 'all',
          image: '',
          discountCode: 'sale10',
        },
      },
    };
    const parsed = StoreSettingsUpdateSchema.parse(settings);
    expect(parsed.promotions?.announcements[0]).toBe('Sale today');
    expect(parsed.promotions?.banner.headline).toBe('Big sale');
    expect(parsed.promotions?.banner.discountCode).toBe('SALE10');
    const bad = { promotions: { ...settings.promotions, banner: { ...settings.promotions.banner, image: 'javascript:alert(1)' } } };
    expect(StoreSettingsUpdateSchema.safeParse(bad).success).toBe(false);
  });
});

describe('parseBody', () => {
  const schema = z.object({ name: z.string().max(10) });
  const call = (init: { body?: string; headers?: Record<string, string> }) =>
    parseBody(new NextRequest('http://localhost/api/x', { method: 'POST', ...init }), schema, { maxBytes: 200 });

  it('accepts a small JSON body', async () => {
    const result = await call({ body: '{"name":"Ada"}', headers: { 'content-type': 'application/json' } });
    expect('data' in result && result.data).toEqual({ name: 'Ada' });
  });

  it('refuses the wrong content type, bad JSON and oversized bodies', async () => {
    const status = async (init: Parameters<typeof call>[0]) => {
      const r = await call(init);
      return 'response' in r ? r.response.status : 200;
    };
    expect(await status({ body: '{"name":"Ada"}', headers: { 'content-type': 'text/plain' } })).toBe(415);
    expect(await status({ body: '{nope', headers: { 'content-type': 'application/json' } })).toBe(400);
    expect(await status({ body: JSON.stringify({ name: 'x'.repeat(500) }), headers: { 'content-type': 'application/json' } })).toBe(413);
    expect(await status({ body: '{"name":"much too long for this"}', headers: { 'content-type': 'application/json' } })).toBe(400);
  });
});

describe('admin product form compatibility', () => {
  it('accepts variants read back from the database with null sku and price', () => {
    const parsed = ProductCreateUpdateSchema.safeParse({
      ...validProduct,
      variants: [{ id: 'cmueq5sls00001hp5ampfty2g', color: 'Teal', size: '10', stock: 5, active: true, sku: null, priceInKobo: null }],
    });
    expect(parsed.success).toBe(true);
  });
});
