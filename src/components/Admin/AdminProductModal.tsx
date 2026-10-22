import React, { useEffect, useRef, useState } from 'react';
import { Product, ProductVariant, GARMENT_SIZES } from '../../types';
import { api } from '../../services/api';
import { getErrorMessage } from '../../lib/errors';
import { X, Plus, Trash2, Archive, AlertCircle, ChevronDown, Check } from 'lucide-react';

interface AdminProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

type Size = ProductVariant['size'];
interface ColourRow {
  name: string;
  hex: string;
}

const DEFAULT_STOCK = 5;
const DEFAULT_HEX = '#681F2C';

/** "The Ember's Gown!" becomes "the-embers-gown": lowercase letters, numbers and single hyphens. */
function toSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const stockKey = (colour: string, size: string) => `${colour.trim().toLowerCase()}|${size}`;

const inputClass =
  'w-full bg-white border border-[#D8D4CC] px-3.5 py-3 text-sm focus:outline-none focus:border-[#171714]';
const labelClass = 'block text-sm font-semibold text-[#171714] mb-1';
const hintClass = 'text-xs text-[#56554F] mt-1';

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-t border-[#D8D4CC] pt-6 first:border-t-0 first:pt-0">
      <h3 className="flex items-center gap-3 font-serif text-xl text-[#171714]">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#681F2C] text-sm font-sans font-semibold text-white">
          {n}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({ product, onClose, onSaved }) => {
  const isEditing = !!product;
  const wasLive = product?.status === 'live';

  const [name, setName] = useState(product?.name || '');
  const [priceInDollars, setPriceInDollars] = useState(product ? product.priceInKobo / 100 : 0);
  const [isNewArrival, setIsNewArrival] = useState(product ? product.isNewArrival : true);
  const [category, setCategory] = useState<Product['category']>(product?.category || 'dresses');
  const [description, setDescription] = useState(product?.description || '');
  const [fitAndSize, setFitAndSize] = useState(
    product?.fitAndSize ||
      'Relaxed, easy fit. Available in sizes 10 to 20. Check the size chart for bust, waist, hip and length measurements.'
  );
  const [delivery, setDelivery] = useState(
    product?.delivery || 'Ships within 1–2 business days. Flat $10 standard shipping across the US.'
  );
  const [care, setCare] = useState(product?.care || 'Hand wash cold or dry clean. Do not tumble dry.');
  const [showMore, setShowMore] = useState(false);

  // Photos
  const [images, setImages] = useState<string[]>(
    product
      ? [product.primaryImage, product.secondaryImage, ...product.galleryImages].filter(
          (v, i, a) => v && a.indexOf(v) === i
        )
      : []
  );
  const [uploading, setUploading] = useState(false);

  // Colours, sizes and stock. The product's variants are rebuilt from these when saving.
  const existingVariants = product?.variants ?? [];
  const [colours, setColours] = useState<ColourRow[]>(() => {
    const rows: ColourRow[] = (product?.colors ?? []).map((c) => ({ name: c.name, hex: c.hex }));
    for (const v of existingVariants) {
      if (!rows.some((r) => r.name.toLowerCase() === v.color.toLowerCase())) {
        rows.push({ name: v.color, hex: DEFAULT_HEX });
      }
    }
    return rows.length > 0 ? rows : [{ name: 'Main colour', hex: DEFAULT_HEX }];
  });
  const [sizes, setSizes] = useState<Size[]>(() => {
    if (existingVariants.length > 0) {
      const active = existingVariants.filter((v) => v.active).map((v) => v.size);
      return GARMENT_SIZES.filter((s) => active.includes(s));
    }
    return [...GARMENT_SIZES];
  });
  const [stock, setStock] = useState<Record<string, number>>(() =>
    Object.fromEntries(existingVariants.map((v) => [stockKey(v.color, v.size), v.stock]))
  );
  const stockFor = (colour: string, size: string) => stock[stockKey(colour, size)] ?? DEFAULT_STOCK;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ status: 'live' | 'draft'; name: string; slug: string; newIn: boolean } | null>(null);

  // A message at the top is useless if she is looking at the bottom of the form.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [error]);

  const checks = [
    { label: 'Photo', ok: images.length > 0, step: 1 },
    { label: 'Name', ok: !!name.trim(), step: 2 },
    { label: 'Price', ok: priceInDollars > 0, step: 2 },
    { label: 'Colour', ok: colours.some((c) => c.name.trim()), step: 3 },
    { label: 'Size', ok: sizes.length > 0, step: 3 },
  ];
  const missing = checks.filter((c) => !c.ok);
  const canPublish = missing.length === 0 && !uploading && !saving;
  const canSaveDraft = checks.slice(0, 3).every((c) => c.ok) && !uploading && !saving;

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    const added: string[] = [];
    for (const file of files) {
      try {
        added.push(await api.uploadAdminPhoto(file));
      } catch (err) {
        setError(`${file.name}: ${getErrorMessage(err, 'Photo upload failed. Please try again.')}`);
      }
    }
    if (added.length > 0) setImages((prev) => [...prev, ...added]);
    setUploading(false);
  };

  const makeMain = (idx: number) => {
    if (idx === 0) return;
    setImages((prev) => [prev[idx], ...prev.filter((_, i) => i !== idx)]);
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const toggleSize = (size: Size) =>
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : GARMENT_SIZES.filter((s) => s === size || prev.includes(s))));

  const updateColour = (idx: number, patch: Partial<ColourRow>) => {
    const old = colours[idx];
    setColours((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
    // Keep the stock numbers already typed when a colour is renamed.
    if (patch.name !== undefined && old) {
      setStock((prev) => {
        const next = { ...prev };
        for (const size of GARMENT_SIZES) {
          const from = stockKey(old.name, size);
          if (from in next) {
            next[stockKey(patch.name as string, size)] = next[from];
            if (stockKey(patch.name as string, size) !== from) delete next[from];
          }
        }
        return next;
      });
    }
  };

  const save = async (status: 'live' | 'draft') => {
    const cleanName = name.trim();
    const cleanColours = colours
      .map((c) => ({ ...c, name: c.name.trim() }))
      .filter((c, i, all) => c.name && all.findIndex((o) => o.name.toLowerCase() === c.name.toLowerCase()) === i);

    if (uploading) return setError('Please wait for the photos to finish uploading.');
    if (!cleanName) return setError('Step 2: please type the product name.');
    if (images.length === 0) return setError('Step 1: please add at least one photo.');
    if (!(priceInDollars > 0)) return setError('Step 2: please type the price, for example 85.');
    if (status === 'live' && cleanColours.length === 0) return setError('Step 3: please type a colour name.');
    if (status === 'live' && sizes.length === 0) return setError('Step 3: please tick at least one size.');

    setSaving(true);
    setError(null);

    const variants: ProductVariant[] = [];
    for (const c of cleanColours) {
      for (const size of sizes) {
        const existing = existingVariants.find(
          (v) => v.size === size && v.color.toLowerCase() === c.name.toLowerCase()
        );
        variants.push({
          ...(existing ?? {}),
          id: existing?.id ?? `v-${size}-${Math.random().toString(36).slice(2, 8)}`,
          color: c.name,
          size,
          stock: Math.max(0, stockFor(c.name, size)),
          active: true,
        });
      }
    }

    const [primary, ...others] = images;
    const payload = {
      name: cleanName,
      slug: product?.slug || toSlug(cleanName),
      priceInKobo: Math.round(priceInDollars * 100), // stored in cents
      status,
      isNewArrival,
      category,
      collection: product?.collection || 'COLLECTION 01',
      colors: cleanColours.map((c) => ({ name: c.name, hex: c.hex })),
      sizes,
      variants,
      primaryImage: primary,
      secondaryImage: others[0] || primary,
      // The gallery is the FULL set with the main photo first; the product page shows it instead of primaryImage.
      galleryImages: images,
      description,
      fitAndSize,
      delivery,
      care,
    };

    try {
      const saved =
        isEditing && product
          ? await api.updateAdminProduct(product.id, payload)
          : await api.createAdminProduct(payload);
      onSaved();
      setDone({ status, name: cleanName, slug: saved?.slug || payload.slug, newIn: isNewArrival });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save the product. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!product) return;
    if (!window.confirm('Remove this product from the website? Past orders will be kept.')) return;
    try {
      await api.archiveAdminProduct(product.id);
      onSaved();
      onClose();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not remove the product'));
    }
  };

  if (done) {
    const live = done.status === 'live';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-[#FAF9F6] border border-[#D8D4CC] w-full max-w-lg p-8 text-center shadow-2xl space-y-5">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white ${
              live ? 'bg-emerald-600' : 'bg-amber-600'
            }`}
          >
            <Check className="w-9 h-9" />
          </div>
          <h2 className="font-serif text-3xl text-[#171714]">
            {live ? (isEditing ? 'Changes saved' : 'Your product is live!') : 'Saved, but not on the website yet'}
          </h2>
          <p className="text-base text-[#171714]">
            {live ? (
              <>
                <strong>{done.name}</strong> is now on your website.
                {done.newIn ? ' It also shows in “New In” on the home page.' : ''}
              </>
            ) : (
              <>
                <strong>{done.name}</strong> is saved privately. Customers cannot see it. When you are ready, open it
                from the Products list and press <strong>Publish to website</strong>.
              </>
            )}
          </p>
          <div className="flex flex-col gap-3 pt-2">
            {live && (
              <a
                href={`/product/${done.slug}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-[#171714] hover:bg-[#681F2C] text-white text-base font-semibold"
              >
                See it on the website
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border border-[#171714] text-base font-semibold text-[#171714] hover:bg-[#171714] hover:text-white"
            >
              Back to my products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div
        ref={scrollRef}
        className="bg-[#FAF9F6] border border-[#D8D4CC] w-full max-w-2xl max-h-[94vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex justify-between items-center p-5 border-b border-[#D8D4CC] sticky top-0 bg-[#FAF9F6] z-10">
          <h2 className="font-serif text-2xl text-[#171714]">
            {isEditing ? `Edit ${product.name}` : 'Add a new product'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-[#56554F] hover:text-[#171714] hover:bg-[#E6E1D7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-5 p-3 bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-5 space-y-8">
          <Step n={1} title="Add photos">
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div key={img + idx} className="relative border border-[#D8D4CC] bg-white p-1">
                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-40 object-cover" />
                    {idx === 0 ? (
                      <span className="absolute top-2 left-2 bg-[#681F2C] text-white text-xs font-semibold px-2 py-0.5">
                        Main photo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makeMain(idx)}
                        className="absolute top-2 left-2 bg-black/70 hover:bg-[#681F2C] text-white text-xs px-2 py-0.5"
                      >
                        Make main photo
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="mt-1 flex items-center gap-1 text-xs text-red-700 hover:text-red-900 px-1 py-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label
              className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed border-[#B9B3A6] bg-white px-4 py-7 text-center ${
                uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:border-[#681F2C]'
              }`}
            >
              <Plus className="w-6 h-6 text-[#681F2C]" />
              <span className="text-sm font-semibold text-[#171714]">
                {uploading ? 'Uploading, please wait…' : images.length > 0 ? 'Add more photos' : 'Tap here to choose photos'}
              </span>
              <span className="text-xs text-[#56554F]">
                From your phone or computer. The first photo is the one customers see first.
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={uploading}
                onChange={handleFiles}
                className="sr-only"
              />
            </label>
          </Step>

          <Step n={2} title="Name and price">
            <div>
              <label className={labelClass} htmlFor="pm-name">
                Product name
              </label>
              <input
                id="pm-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Iris Gown"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="pm-price">
                  Price in US dollars
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#56554F]">$</span>
                  <input
                    id="pm-price"
                    type="number"
                    inputMode="decimal"
                    value={priceInDollars || ''}
                    step="0.01"
                    min="0"
                    placeholder="85"
                    onChange={(e) => setPriceInDollars(parseFloat(e.target.value) || 0)}
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="pm-category">
                  What kind of piece is it?
                </label>
                <select
                  id="pm-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Product['category'])}
                  className={inputClass}
                >
                  <option value="dresses">Dress</option>
                  <option value="sets">Set</option>
                  <option value="tops">Top</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="occasion">Occasion wear</option>
                </select>
              </div>
            </div>
          </Step>

          <Step n={3} title="Sizes, colours and stock">
            <div>
              <span className={labelClass}>Which sizes do you sell?</span>
              <div className="flex flex-wrap gap-2">
                {GARMENT_SIZES.map((size) => {
                  const on = sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      aria-pressed={on}
                      className={`h-11 min-w-11 px-3 border text-sm font-semibold ${
                        on ? 'bg-[#171714] text-white border-[#171714]' : 'bg-white text-[#56554F] border-[#D8D4CC]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <p className={hintClass}>Tap a size to turn it on or off.</p>
            </div>

            <div>
              <span className={labelClass}>Colours</span>
              <div className="space-y-2">
                {colours.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => updateColour(idx, { hex: e.target.value })}
                      aria-label="Pick the colour"
                      className="h-11 w-11 shrink-0 p-0 border border-[#D8D4CC] bg-white cursor-pointer"
                    />
                    <input
                      type="text"
                      value={c.name}
                      maxLength={40}
                      onChange={(e) => updateColour(idx, { name: e.target.value })}
                      placeholder="Colour name, e.g. Indigo"
                      className={inputClass}
                    />
                    {colours.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setColours((prev) => prev.filter((_, i) => i !== idx))}
                        aria-label="Remove this colour"
                        className="p-2 text-red-700 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setColours((prev) => [...prev, { name: '', hex: DEFAULT_HEX }])}
                className="mt-2 text-sm font-semibold text-[#681F2C] hover:underline"
              >
                + Add another colour
              </button>
              <p className={hintClass}>Tap the square to pick the colour, then type its name.</p>
            </div>

            {sizes.length > 0 && colours.some((c) => c.name.trim()) && (
              <div>
                <span className={labelClass}>How many do you have in stock?</span>
                <div className="overflow-x-auto border border-[#D8D4CC] bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F4F1EB] text-xs text-[#56554F]">
                        <th className="py-2 px-3 text-left font-semibold">Colour</th>
                        {sizes.map((size) => (
                          <th key={size} className="py-2 px-1 text-center font-semibold">
                            Size {size}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D4CC]">
                      {colours
                        .filter((c) => c.name.trim())
                        .map((c) => (
                          <tr key={c.name}>
                            <td className="py-2 px-3 font-medium">{c.name}</td>
                            {sizes.map((size) => (
                              <td key={size} className="py-2 px-1 text-center">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min="0"
                                  value={stockFor(c.name, size)}
                                  onChange={(e) =>
                                    setStock((prev) => ({
                                      ...prev,
                                      [stockKey(c.name, size)]: Math.max(0, parseInt(e.target.value, 10) || 0),
                                    }))
                                  }
                                  aria-label={`${c.name} size ${size} in stock`}
                                  className="w-14 border border-[#D8D4CC] px-1 py-2 text-center text-sm"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <p className={hintClass}>
                  The number goes down by itself each time an order is paid. Put 0 if a size is sold out.
                </p>
              </div>
            )}
          </Step>

          <Step n={4} title="Description (optional)">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A few lines about the fabric, the fit and when to wear it."
              className={inputClass}
            />
            <label className="flex items-center gap-3 text-sm text-[#171714]">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="h-5 w-5"
              />
              Show this in &ldquo;New In&rdquo; on the home page
            </label>

            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="flex items-center gap-1 text-sm font-semibold text-[#56554F] hover:text-[#171714]"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
              {showMore ? 'Hide' : 'Edit'} fit, delivery and care wording
            </button>
            {showMore && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Fit and sizing</label>
                  <textarea rows={2} value={fitAndSize} onChange={(e) => setFitAndSize(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Delivery</label>
                  <textarea rows={2} value={delivery} onChange={(e) => setDelivery(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Care</label>
                  <textarea rows={2} value={care} onChange={(e) => setCare(e.target.value)} className={inputClass} />
                </div>
              </div>
            )}
          </Step>
        </div>

        <div className="p-5 border-t border-[#D8D4CC] bg-[#F4F1EB] sticky bottom-0 z-10 space-y-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {checks.map((c) => (
              <span
                key={c.label}
                className={`flex items-center gap-1 font-semibold ${c.ok ? 'text-emerald-700' : 'text-red-700'}`}
              >
                {c.ok ? <Check className="w-4 h-4" /> : <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-red-700" />}
                {c.label}
                {!c.ok && <span className="font-normal text-[#56554F]">(step {c.step})</span>}
              </span>
            ))}
          </div>
          <p className={`text-sm ${canPublish ? 'text-emerald-800 font-semibold' : 'text-[#56554F]'}`}>
            {uploading
              ? 'Uploading your photos, please wait…'
              : canPublish
              ? 'Everything is filled in. Press the black button to put it on your website.'
              : `Still to do: ${missing.map((c) => c.label.toLowerCase()).join(', ')}. The black button switches on when these are done.`}
          </p>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => save('draft')}
              disabled={!canSaveDraft}
              className="px-5 py-3 border border-[#171714] text-sm font-semibold text-[#171714] hover:bg-[#171714] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#171714]"
            >
              {wasLive ? 'Hide from website' : 'Save without publishing'}
            </button>
            <button
              type="button"
              onClick={() => save('live')}
              disabled={!canPublish}
              className="px-6 py-3.5 bg-[#171714] hover:bg-[#681F2C] text-white text-base font-semibold disabled:opacity-40 disabled:hover:bg-[#171714]"
            >
              {saving ? 'Saving…' : wasLive ? 'Save changes' : 'Publish to website'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={onClose} className="text-sm text-[#56554F] hover:text-[#171714]">
              Cancel
            </button>
            {isEditing && product?.status !== 'archived' && (
              <button
                type="button"
                onClick={handleArchive}
                className="flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-900"
              >
                <Archive className="w-4 h-4" /> Remove from website
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
