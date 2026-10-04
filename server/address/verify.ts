import {
  VerifiedAddress,
  VerifyAddressRequest,
  VerifyAddressResult,
} from '../../src/lib/address';

/**
 * Address verification, in two layers:
 *
 * 1. Street verification via Smarty's US Street API (a CASS-certified USPS
 *    data provider) when SMARTY_AUTH_ID and SMARTY_AUTH_TOKEN are set. It
 *    confirms the exact delivery point exists and returns the standardised form.
 * 2. Otherwise a ZIP check against the free zippopotam.us dataset: it catches
 *    ZIP codes that don't exist and ZIP/state mismatches, but can't confirm a
 *    street.
 *
 * Verification never blocks checkout on its own failure: if a service is down
 * or slow the result is `unverified` and the customer continues with the
 * format checks, because losing a sale to someone else's outage is worse than
 * an occasional unverifiable address.
 */

const TIMEOUT_MS = 4000;

/** Compare addresses ignoring case, punctuation and spacing. */
const norm = (s: string | undefined) => (s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

interface SmartyCandidate {
  delivery_line_1: string;
  last_line: string;
  components: {
    city_name: string;
    state_abbreviation: string;
    zipcode: string;
    plus4_code?: string;
  };
  analysis?: { dpv_match_code?: string };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function verifyWithSmarty(input: VerifyAddressRequest): Promise<VerifyAddressResult> {
  const params = new URLSearchParams({
    'auth-id': process.env.SMARTY_AUTH_ID as string,
    'auth-token': process.env.SMARTY_AUTH_TOKEN as string,
    street: input.address,
    city: input.city,
    state: input.state,
    zipcode: input.postalCode,
    candidates: '1',
  });
  if (input.apartment?.trim()) params.set('street2', input.apartment.trim());

  const results = await fetchJson<SmartyCandidate[]>(`https://us-street.api.smarty.com/street-address?${params}`);
  const match = results?.[0];

  if (!match) {
    return {
      status: 'invalid',
      message: 'We couldn’t find that address. Check the street number, street name and ZIP code.',
    };
  }

  const c = match.components;
  const plus4 = c.plus4_code ? `-${c.plus4_code}` : '';
  const suggestion: VerifiedAddress = {
    address: match.delivery_line_1,
    // Smarty folds the apartment into the delivery line when one was supplied.
    apartment: '',
    city: c.city_name,
    state: c.state_abbreviation,
    postalCode: `${c.zipcode}${plus4}`,
  };

  const enteredStreet = norm(`${input.address}${input.apartment ?? ''}`);
  const sameAsTyped =
    norm(suggestion.address) === enteredStreet &&
    norm(suggestion.city) === norm(input.city) &&
    suggestion.state === input.state &&
    c.zipcode === input.postalCode.slice(0, 5);

  const needsUnit = match.analysis?.dpv_match_code === 'D' || match.analysis?.dpv_match_code === 'S';
  if (needsUnit && !input.apartment?.trim()) {
    return {
      status: 'corrected',
      message: 'This looks like a building with several units. Add your apartment or suite number so the courier can find you.',
      suggestion,
    };
  }

  return sameAsTyped ? { status: 'verified' } : { status: 'corrected', suggestion };
}

interface ZippopotamResponse {
  places?: { 'place name': string; 'state abbreviation': string }[];
}

async function verifyZipOnly(input: VerifyAddressRequest): Promise<VerifyAddressResult> {
  const zip5 = input.postalCode.slice(0, 5);
  const data = await fetchJson<ZippopotamResponse>(`https://api.zippopotam.us/us/${zip5}`);

  if (!data?.places?.length) {
    return { status: 'invalid', message: `${zip5} isn’t a ZIP code we can find. Please check it.` };
  }

  const states = new Set(data.places.map((p) => p['state abbreviation']));
  if (!states.has(input.state)) {
    const actual = [...states].join(' / ');
    return {
      status: 'invalid',
      message: `ZIP code ${zip5} is in ${actual}, not ${input.state}. Check your state and ZIP code.`,
    };
  }

  // Postal city names vary (neighbourhoods, "Houston" vs "Katy"), so a city
  // mismatch is flagged as a suggestion rather than an error.
  const cities = data.places.map((p) => p['place name']);
  const cityMatches = cities.some((name) => norm(name) === norm(input.city));
  if (!cityMatches) {
    return {
      status: 'corrected',
      message: `ZIP code ${zip5} is usually ${cities[0]}, ${input.state}. If ${input.city} is right for your address, you can keep it.`,
      suggestion: {
        address: input.address,
        apartment: input.apartment ?? '',
        city: cities[0],
        state: input.state,
        postalCode: input.postalCode,
      },
    };
  }

  // The ZIP and state agree with the city, but without a street database we
  // can't say the street exists.
  return { status: 'unverified' };
}

export const hasStreetVerification = () => !!(process.env.SMARTY_AUTH_ID && process.env.SMARTY_AUTH_TOKEN);

export async function verifyAddress(input: VerifyAddressRequest): Promise<VerifyAddressResult> {
  try {
    return hasStreetVerification() ? await verifyWithSmarty(input) : await verifyZipOnly(input);
  } catch {
    // Service down, timed out, or credentials rejected.
    return { status: 'unverified' };
  }
}
