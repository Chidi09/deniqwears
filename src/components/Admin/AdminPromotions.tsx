import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, Megaphone, Plus, Save, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { getErrorMessage } from '../../lib/errors';
import {
  DEFAULT_PROMOTIONS,
  PROMO_LINK_LABELS,
  PROMO_LINK_TARGETS,
  PromotionsSchema,
  PromoLinkTarget,
  StorePromotions,
} from '../../lib/promotions';
import { PromoBanner } from '../PromoBanner';

const MAX_MESSAGES = 5;

const inputClass =
  'w-full bg-white border border-[#D8D4CC] px-3 py-2.5 text-sm text-[#171714] focus:border-[#171714] focus:outline-none';
const labelClass = 'block text-xs font-semibold text-[#171714] mb-1.5';
const hintClass = 'text-xs text-[#8A8780] mt-1';

interface AdminPromotionsProps {
  onSaved: () => void;
}

/**
 * Plain-language editor for the top-bar messages and homepage banner, with a
 * live preview so the owner sees exactly what customers will see.
 */
export const AdminPromotions: React.FC<AdminPromotionsProps> = ({ onSaved }) => {
  const [promotions, setPromotions] = useState<StorePromotions | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAdminSettings()
      .then((s) => setPromotions(s.promotions ?? DEFAULT_PROMOTIONS))
      .catch(() => setPromotions(DEFAULT_PROMOTIONS));
  }, []);

  if (!promotions) {
    return <div className="py-20 text-center text-sm text-[#8A8780]">Loading promotions…</div>;
  }

  const { announcements, banner } = promotions;

  const setBanner = (patch: Partial<StorePromotions['banner']>) =>
    setPromotions({ ...promotions, banner: { ...banner, ...patch } });

  const setMessages = (next: string[]) => setPromotions({ ...promotions, announcements: next });

  const moveMessage = (from: number, to: number) => {
    if (to < 0 || to >= announcements.length) return;
    const next = [...announcements];
    [next[from], next[to]] = [next[to], next[from]];
    setMessages(next);
  };

  const handleSave = async () => {
    setError(null);
    const cleaned = { ...promotions, announcements: announcements.map((m) => m.trim()).filter(Boolean) };
    const result = PromotionsSchema.safeParse(cleaned);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Please check the highlighted fields.');
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateAdminSettings({ promotions: result.data });
      setPromotions(updated.promotions);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save promotions. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="font-serif text-3xl text-[#171714]">Promotions</h2>
        <p className="text-sm text-[#56554F] mt-1">
          Change the messages at the top of your website and the sale banner on your homepage. Press{' '}
          <strong>Save</strong> when you are done — changes go live straight away.
        </p>
      </div>

      {/* Top bar messages */}
      <section className="bg-[#FAF9F6] border border-[#D8D4CC] p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 shrink-0 rounded-full bg-[#171714] text-[#FAF9F6] flex items-center justify-center">
            <Megaphone className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-serif text-xl text-[#171714]">Top bar messages</h3>
            <p className="text-sm text-[#56554F]">
              Short messages that rotate in the dark strip above your menu. Up to {MAX_MESSAGES}.
            </p>
          </div>
        </div>

        {/* Preview of the bar */}
        <div className="bg-[#171714] text-[#FAF9F6] text-xs uppercase tracking-[0.16em] text-center py-2.5 px-3 truncate">
          {announcements.find((m) => m.trim()) || 'Your message will appear here'}
        </div>

        <ol className="space-y-2">
          {announcements.map((message, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-6 text-xs font-semibold text-[#8A8780] text-right">{i + 1}.</span>
              <input
                value={message}
                maxLength={120}
                onChange={(e) => setMessages(announcements.map((m, j) => (j === i ? e.target.value : m)))}
                placeholder="e.g. New designs every Friday"
                className={inputClass}
              />
              <button
                onClick={() => moveMessage(i, i - 1)}
                disabled={i === 0}
                className="p-2 text-[#56554F] hover:text-[#171714] disabled:opacity-25"
                aria-label="Move up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveMessage(i, i + 1)}
                disabled={i === announcements.length - 1}
                className="p-2 text-[#56554F] hover:text-[#171714] disabled:opacity-25"
                aria-label="Move down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMessages(announcements.filter((_, j) => j !== i))}
                className="p-2 text-[#681F2C] hover:bg-[#681F2C]/10"
                aria-label="Remove message"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ol>

        {announcements.length < MAX_MESSAGES && (
          <button
            onClick={() => setMessages([...announcements, ''])}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#171714] text-sm font-medium text-[#171714] hover:bg-white"
          >
            <Plus className="w-4 h-4" />
            Add a message
          </button>
        )}
      </section>

      {/* Homepage banner */}
      <section className="bg-[#FAF9F6] border border-[#D8D4CC] p-5 sm:p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl text-[#171714]">Homepage banner</h3>
            <p className="text-sm text-[#56554F]">
              A large banner on your homepage — great for a sale, a new drop or a discount code.
            </p>
          </div>
          <button
            onClick={() => setBanner({ enabled: !banner.enabled })}
            aria-pressed={banner.enabled}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border ${
              banner.enabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-neutral-100 text-neutral-600 border-neutral-300'
            }`}
          >
            {banner.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {banner.enabled ? 'Showing on website' : 'Hidden from website'}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="promo-headline">Headline</label>
              <input
                id="promo-headline"
                value={banner.headline}
                maxLength={80}
                onChange={(e) => setBanner({ headline: e.target.value })}
                placeholder="e.g. 20% off all sets this weekend"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="promo-eyebrow">Small label above headline</label>
              <input
                id="promo-eyebrow"
                value={banner.eyebrow}
                maxLength={40}
                onChange={(e) => setBanner({ eyebrow: e.target.value })}
                placeholder="e.g. Weekend sale"
                className={inputClass}
              />
              <p className={hintClass}>Optional.</p>
            </div>
            <div>
              <label className={labelClass} htmlFor="promo-body">Description</label>
              <textarea
                id="promo-body"
                value={banner.body}
                maxLength={240}
                rows={3}
                onChange={(e) => setBanner({ body: e.target.value })}
                placeholder="One or two sentences about the offer."
                className={inputClass}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="promo-cta">Button text</label>
                <input
                  id="promo-cta"
                  value={banner.ctaLabel}
                  maxLength={30}
                  onChange={(e) => setBanner({ ctaLabel: e.target.value })}
                  placeholder="e.g. Shop the sale"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="promo-target">Button takes shoppers to</label>
                <select
                  id="promo-target"
                  value={banner.ctaTarget}
                  onChange={(e) => setBanner({ ctaTarget: e.target.value as PromoLinkTarget })}
                  className={inputClass}
                >
                  {PROMO_LINK_TARGETS.map((t) => (
                    <option key={t} value={t}>
                      {PROMO_LINK_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="promo-code">Discount code to show</label>
              <input
                id="promo-code"
                value={banner.discountCode}
                maxLength={30}
                onChange={(e) => setBanner({ discountCode: e.target.value.toUpperCase() })}
                placeholder="e.g. WELCOME10"
                className={`${inputClass} uppercase tracking-wider`}
              />
              <p className={hintClass}>
                Optional. Shoppers can tap to copy it. The code must also exist in your discount codes to work at
                checkout.
              </p>
            </div>
            <div>
              <label className={labelClass} htmlFor="promo-image">Banner photo link (optional)</label>
              <input
                id="promo-image"
                value={banner.image}
                onChange={(e) => setBanner({ image: e.target.value })}
                placeholder="https://…"
                className={inputClass}
              />
              <p className={hintClass}>Optional. Paste a photo web address, or leave empty for a clean text-only banner.</p>
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#56554F]">Preview</p>
            <div className={`transition-opacity ${banner.enabled ? '' : 'opacity-40'}`}>
              <PromoBanner banner={banner} onNavigate={() => {}} preview />
            </div>
            {!banner.enabled && (
              <p className="text-xs text-[#8A8780]">This banner is hidden. Switch it on to show it on your homepage.</p>
            )}
          </div>
        </div>
      </section>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-[#FAF9F6]/95 backdrop-blur border-t border-[#D8D4CC]">
        <div className="max-w-[1344px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-end gap-4">
          {error && <p className="text-sm text-[#681F2C] mr-auto">{error}</p>}
          {saved && (
            <p className="text-sm text-emerald-700 flex items-center gap-1.5 mr-auto">
              <Check className="w-4 h-4" /> Saved — your website is updated.
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[#171714] hover:bg-[#681F2C] text-[#FAF9F6] text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save promotions'}
          </button>
        </div>
      </div>
    </div>
  );
};
