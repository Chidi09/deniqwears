import type { AddressSuggestion, VerifiedAddress } from '../../src/lib/address';

/**
 * Address autocomplete through Google Places (New). Requests go through our
 * own API routes so the key never reaches the browser.
 *
 * A "session" is the run of keystrokes plus the final pick. Google only bills
 * the session once, as the details lookup, and the keystrokes in between are
 * free, so the browser sends the same sessionToken for the whole run.
 */

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const DETAILS_URL = 'https://places.googleapis.com/v1/places';
const TIMEOUT_MS = 4000;

export const autocompleteEnabled = () => !!process.env.GOOGLE_MAPS_API_KEY;

export async function suggestAddresses(input: string, sessionToken: string): Promise<AddressSuggestion[]> {
  const res = await fetch(AUTOCOMPLETE_URL, {
    method: 'POST',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY as string,
    },
    body: JSON.stringify({
      input,
      sessionToken,
      // US delivery addresses only, not businesses, regions or landmarks.
      includedRegionCodes: ['us'],
      includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
    }),
  });
  if (!res.ok) throw new Error(`Places autocomplete HTTP ${res.status}`);

  const data = (await res.json()) as {
    suggestions?: {
      placePrediction?: {
        placeId: string;
        text: { text: string };
        structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } };
      };
    }[];
  };

  return (data.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter((p): p is NonNullable<typeof p> => !!p)
    .slice(0, 5)
    .map((p) => ({
      placeId: p.placeId,
      text: p.text.text,
      main: p.structuredFormat?.mainText?.text ?? p.text.text,
      secondary: (p.structuredFormat?.secondaryText?.text ?? '').replace(/, USA$/, ''),
    }));
}

interface Component {
  longText: string;
  shortText: string;
  types: string[];
}

/** "apt 12" becomes "Apt 12"; a bare "12" becomes "#12". */
export function formatUnit(unit: string | undefined): string {
  const u = unit?.trim();
  if (!u) return '';
  return /^[A-Za-z]/.test(u) ? u.charAt(0).toUpperCase() + u.slice(1) : `#${u}`;
}

export async function placeToAddress(placeId: string, sessionToken: string): Promise<VerifiedAddress | null> {
  const res = await fetch(`${DETAILS_URL}/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(sessionToken)}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY as string,
      'X-Goog-FieldMask': 'addressComponents',
    },
  });
  if (!res.ok) return null;

  const { addressComponents = [] } = (await res.json()) as { addressComponents?: Component[] };
  const find = (type: string) => addressComponents.find((c) => c.types.includes(type));

  const number = find('street_number')?.longText;
  const route = find('route')?.shortText ?? find('route')?.longText;
  const unit = find('subpremise')?.longText;
  // Boroughs like Brooklyn are a sublocality, not a locality.
  const city = (find('locality') ?? find('postal_town') ?? find('sublocality_level_1') ?? find('neighborhood'))?.longText;
  const state = find('administrative_area_level_1')?.shortText;
  const zip = find('postal_code')?.longText;

  if (!number || !route || !city || !state || !zip) return null;

  return {
    address: `${number} ${route}`,
    apartment: formatUnit(unit),
    city,
    state,
    postalCode: zip,
  };
}
