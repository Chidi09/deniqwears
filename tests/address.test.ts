import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatPhone,
  isValidEmail,
  isValidUsPhone,
  validateAddress,
  validateContact,
} from '../src/lib/address';
import { CheckoutPayloadSchema } from '../src/lib/schemas';
import { verifyAddress } from '../server/address/verify';

const goodContact = { firstName: 'Ada', lastName: 'Okafor', email: 'ada@gmail.com', phone: '(713) 555-0142' };
const goodAddress = { address: '123 Main Street', apartment: '', city: 'Houston', state: 'TX', postalCode: '77002' };

describe('contact validation', () => {
  it('accepts a normal contact', () => {
    expect(validateContact(goodContact)).toEqual({});
  });

  it('accepts international and hyphenated names', () => {
    expect(validateContact({ ...goodContact, firstName: 'José', lastName: "O'Neil-Nguyễn" })).toEqual({});
  });

  it('rejects empty and non-letter names', () => {
    const errors = validateContact({ ...goodContact, firstName: '', lastName: '12345' });
    expect(errors.firstName).toBeDefined();
    expect(errors.lastName).toBeDefined();
  });

  it('rejects malformed emails', () => {
    for (const email of ['', 'ada', 'ada@', 'ada@gmail', 'ada @gmail.com', '@gmail.com']) {
      expect(isValidEmail(email)).toBe(false);
    }
    expect(isValidEmail('ada.okafor+shop@mail.co.uk')).toBe(true);
  });

  it('accepts common US phone formats and rejects the rest', () => {
    for (const phone of ['7135550142', '(713) 555-0142', '713-555-0142', '+1 713 555 0142', '1 (713) 555-0142']) {
      expect(isValidUsPhone(phone)).toBe(true);
    }
    for (const phone of ['', '12345', '0135550142', '7131550142', '+234 803 123 4567', '713555014']) {
      expect(isValidUsPhone(phone)).toBe(false);
    }
  });

  it('formats a complete number and leaves a partial one alone', () => {
    expect(formatPhone('+1 713.555.0142')).toBe('(713) 555-0142');
    expect(formatPhone('713 555')).toBe('713 555');
  });
});

describe('address validation', () => {
  it('accepts a normal address', () => {
    expect(validateAddress(goodAddress)).toEqual({});
  });

  it('requires a street number', () => {
    expect(validateAddress({ ...goodAddress, address: 'Main Street' }).address).toBeDefined();
  });

  it('requires a real state code and a 5-digit or ZIP+4 code', () => {
    expect(validateAddress({ ...goodAddress, state: 'ZZ' }).state).toBeDefined();
    expect(validateAddress({ ...goodAddress, state: '' }).state).toBeDefined();
    expect(validateAddress({ ...goodAddress, postalCode: '7700' }).postalCode).toBeDefined();
    expect(validateAddress({ ...goodAddress, postalCode: '77002-1234' })).toEqual({});
  });

  it('allows real place names', () => {
    expect(validateAddress({ ...goodAddress, city: 'St. Louis' })).toEqual({});
    expect(validateAddress({ ...goodAddress, city: 'Winston-Salem' })).toEqual({});
    expect(validateAddress({ ...goodAddress, city: 'Hou$ton' }).city).toBeDefined();
  });
});

describe('checkout schema enforces the same rules on the server', () => {
  const base = {
    items: [{ productId: 'p1', variantId: 'v1', quantity: 1 }],
    customer: goodContact,
    shippingAddress: { ...goodContact, ...goodAddress, country: 'United States' },
    deliveryZoneId: 'zone-us-standard',
    paymentMethod: 'stripe',
    idempotencyKey: 'idemp_1234567890',
  };

  it('accepts a valid US order', () => {
    expect(CheckoutPayloadSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a bad phone, state, ZIP or country', () => {
    const bad = (shippingAddress: object) => CheckoutPayloadSchema.safeParse({ ...base, shippingAddress });
    expect(bad({ ...base.shippingAddress, phone: '123' }).success).toBe(false);
    expect(bad({ ...base.shippingAddress, state: 'Lagos' }).success).toBe(false);
    expect(bad({ ...base.shippingAddress, postalCode: '' }).success).toBe(false);
    expect(bad({ ...base.shippingAddress, country: 'Nigeria' }).success).toBe(false);
    expect(bad({ ...base.shippingAddress, address: 'Main Street' }).success).toBe(false);
  });
});

describe('address verification (ZIP check, no street provider configured)', () => {
  afterEach(() => vi.unstubAllGlobals());
  const stubZip = (body: unknown, status = 200) =>
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), { status })));
  const houston = { places: [{ 'place name': 'Houston', 'state abbreviation': 'TX' }] };

  it('a ZIP that matches the state and city is as good as we can confirm', async () => {
    stubZip(houston);
    expect((await verifyAddress(goodAddress)).status).toBe('unverified');
  });

  it('a ZIP that does not exist is invalid', async () => {
    stubZip({}, 404);
    expect((await verifyAddress({ ...goodAddress, postalCode: '00000' })).status).toBe('invalid');
  });

  it('a ZIP in another state is invalid and says which one', async () => {
    stubZip(houston);
    const result = await verifyAddress({ ...goodAddress, state: 'CA' });
    expect(result.status).toBe('invalid');
    expect(result.message).toContain('TX');
  });

  it('a different city name is a suggestion, not an error', async () => {
    stubZip(houston);
    const result = await verifyAddress({ ...goodAddress, city: 'Katy' });
    expect(result.status).toBe('corrected');
    expect(result.suggestion?.city).toBe('Houston');
  });

  it('never blocks checkout when the lookup service is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down'); }));
    expect((await verifyAddress(goodAddress)).status).toBe('unverified');
  });
});
