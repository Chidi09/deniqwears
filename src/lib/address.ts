/**
 * US checkout validation. Shared by the browser (inline errors as people type)
 * and the server (the checkout schema and the address-verify endpoint), so the
 * two can never disagree about what a valid order looks like.
 */

/** All 50 states plus DC, as [postal abbreviation, name]. */
export const US_STATES: ReadonlyArray<readonly [string, string]> = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
  ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
  ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
];

export const US_STATE_CODES: ReadonlySet<string> = new Set(US_STATES.map(([code]) => code));

export const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;
// Letters from any language, so "José", "Nguyễn" and "O'Neil" all pass.
const NAME_PATTERN = /^[\p{L}][\p{L}\p{M}'’. -]*$/u;
// Letters plus the punctuation real US place names use ("St. Louis", "Winston-Salem").
const CITY_PATTERN = /^[\p{L}][\p{L}\p{M}'’. -]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Digits only, with a leading US country code removed: "+1 (713) 555-0142" becomes "7135550142". */
export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

/** "7135550142" becomes "(713) 555-0142"; anything incomplete is returned as typed. */
export function formatPhone(value: string): string {
  const d = phoneDigits(value);
  if (d.length !== 10) return value;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** US area codes and exchanges never start with 0 or 1. */
export function isValidUsPhone(value: string): boolean {
  const d = phoneDigits(value);
  return d.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(d);
}

export function isValidEmail(value: string): boolean {
  const v = value.trim();
  return v.length <= 254 && EMAIL_PATTERN.test(v);
}

export type ContactFields = { firstName: string; lastName: string; email: string; phone: string };
export type AddressFields = {
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
};
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validateContact(c: ContactFields): FieldErrors<ContactFields> {
  const errors: FieldErrors<ContactFields> = {};
  const first = c.firstName.trim();
  const last = c.lastName.trim();
  if (!first) errors.firstName = 'Enter your first name.';
  else if (!NAME_PATTERN.test(first)) errors.firstName = 'Names can only contain letters, spaces, hyphens and apostrophes.';
  if (!last) errors.lastName = 'Enter your last name.';
  else if (!NAME_PATTERN.test(last)) errors.lastName = 'Names can only contain letters, spaces, hyphens and apostrophes.';
  if (!c.email.trim()) errors.email = 'Enter your email address.';
  else if (!isValidEmail(c.email)) errors.email = 'That email doesn’t look right. Check for typos, for example name@gmail.com.';
  if (!c.phone.trim()) errors.phone = 'Enter a phone number for delivery updates.';
  else if (!isValidUsPhone(c.phone)) errors.phone = 'Enter a 10-digit US phone number, for example (713) 555-0142.';
  return errors;
}

export function validateAddress(a: AddressFields): FieldErrors<AddressFields> {
  const errors: FieldErrors<AddressFields> = {};
  const street = a.address.trim();
  if (!street) errors.address = 'Enter your street address.';
  else if (street.length < 5 || !/\d/.test(street)) errors.address = 'Include your house or building number, for example 123 Main Street.';
  const city = a.city.trim();
  if (!city) errors.city = 'Enter your city.';
  else if (!CITY_PATTERN.test(city)) errors.city = 'City names can only contain letters, spaces, hyphens and periods.';
  if (!a.state) errors.state = 'Choose your state.';
  else if (!US_STATE_CODES.has(a.state)) errors.state = 'Choose a state from the list.';
  const zip = a.postalCode.trim();
  if (!zip) errors.postalCode = 'Enter your ZIP code.';
  else if (!ZIP_PATTERN.test(zip)) errors.postalCode = 'Enter a 5-digit ZIP code, for example 77002.';
  return errors;
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;

// ---- Address verification contract (browser <-> /api/address/verify) ----

export interface VerifyAddressRequest {
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface VerifiedAddress {
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
}

/**
 * - verified:   the address exists exactly as typed
 * - corrected:  it exists, but the standard form differs (spelling, ZIP+4, suffix); `suggestion` has it
 * - invalid:    the address, or its ZIP/state combination, doesn't exist
 * - unverified: the check couldn't run (service down, or no provider configured); proceed with format checks only
 */
export interface VerifyAddressResult {
  status: 'verified' | 'corrected' | 'invalid' | 'unverified';
  message?: string;
  suggestion?: VerifiedAddress;
}

/** One row in the street-address dropdown. */
export interface AddressSuggestion {
  placeId: string;
  /** The whole line, for screen readers. */
  text: string;
  main: string;
  secondary: string;
}
