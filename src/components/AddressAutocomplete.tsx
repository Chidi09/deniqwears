import React, { useEffect, useId, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { api } from '../services/api';
import type { AddressSuggestion, VerifiedAddress } from '../lib/address';

interface AddressAutocompleteProps {
  /** Props from CheckoutField (id, aria-invalid, className, ...). */
  control: React.InputHTMLAttributes<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  /** Called with the full address when the customer picks a suggestion. */
  onPick: (address: VerifiedAddress) => void;
}

const MIN_CHARS = 3;
const DEBOUNCE_MS = 250;

/**
 * The street-address input with suggestions as the customer types. If
 * autocomplete is unavailable (no key, quota, outage) it behaves as a plain
 * text input, so checkout never depends on it.
 */
export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ control, value, onChange, onBlur, onPick }) => {
  const listId = useId();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [picking, setPicking] = useState(false);

  const sessionRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const disabledRef = useRef(false);

  // Don't leave a pending request behind when the field unmounts.
  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      abortRef.current?.abort();
    },
    []
  );

  const newSession = () => {
    sessionRef.current = crypto.randomUUID();
    return sessionRef.current;
  };

  const handleChange = (next: string) => {
    onChange(next);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    abortRef.current?.abort();

    if (disabledRef.current || next.trim().length < MIN_CHARS) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    timerRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      const token = sessionRef.current ?? newSession();
      const result = await api.suggestAddresses(next.trim(), token, controller.signal);
      if (controller.signal.aborted) return;
      if (!result.enabled) {
        disabledRef.current = true;
        return;
      }
      setSuggestions(result.suggestions);
      setActive(-1);
      setOpen(result.suggestions.length > 0);
    }, DEBOUNCE_MS);
  };

  const pick = async (suggestion: AddressSuggestion) => {
    setOpen(false);
    setPicking(true);
    const address = await api.pickSuggestedAddress(suggestion.placeId, sessionRef.current ?? newSession());
    setPicking(false);
    // The session ends with the pick; the next search is billed separately.
    sessionRef.current = null;
    setSuggestions([]);
    if (address) onPick(address);
    else onChange(suggestion.main);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      void pick(suggestions[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        {...control}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder="Start typing your street address"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={onKeyDown}
        // Delay closing so a tap on a suggestion registers before the list disappears.
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
          onBlur();
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      {picking && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8A8780]">Filling in…</span>}

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 bg-[#FAF9F6] border border-[#171714] shadow-lg max-h-72 overflow-auto"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown, not click: it fires before the input loses focus.
              onMouseDown={(e) => {
                e.preventDefault();
                void pick(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-start gap-3 px-3.5 py-3 cursor-pointer ${i === active ? 'bg-[#F4F1EB]' : ''}`}
            >
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#681F2C]" />
              <span className="text-sm text-[#171714]">
                <span className="font-medium">{s.main}</span>
                {s.secondary && <span className="text-[#56554F]">, {s.secondary}</span>}
              </span>
            </li>
          ))}
          <li role="presentation" className="px-3.5 py-1.5 text-[11px] text-[#8A8780] text-right border-t border-[#D8D4CC]">
            Powered by Google
          </li>
        </ul>
      )}
    </div>
  );
};
