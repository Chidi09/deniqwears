import React, { useState } from 'react';
import { Product, ProductVariant, GARMENT_SIZES } from '../../types';
import { api } from '../../services/api';
import { getErrorMessage } from '../../lib/errors';
import {
  X,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Archive,
  Check,
  AlertCircle,
} from 'lucide-react';

interface AdminProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  product,
  onClose,
  onSaved,
}) => {
  const isEditing = !!product;

  // Form State
  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [priceInDollars, setPriceInDollars] = useState(product ? product.priceInKobo / 100 : 0);
  const [status, setStatus] = useState<'live' | 'draft' | 'archived'>(product?.status || 'live');
  const [category, setCategory] = useState<'dresses' | 'sets' | 'tops' | 'bottoms' | 'occasion'>(
    product?.category || 'dresses'
  );
  const [collection, setCollection] = useState(product?.collection || 'COLLECTION 01');
  const [description, setDescription] = useState(product?.description || '');
  const [fitAndSize, setFitAndSize] = useState(
    product?.fitAndSize || 'Architectural fit through the bodice. Model is 5\'10" wearing size S.'
  );
  const [delivery, setDelivery] = useState(
    product?.delivery || 'Ships within 1–2 business days.'
  );
  const [care, setCare] = useState(product?.care || 'Dry clean only. Store on wide padded hanger.');

  // Image Manager State
  const [images, setImages] = useState<string[]>(
    product
      ? [product.primaryImage, product.secondaryImage, ...product.galleryImages].filter(
          (v, i, a) => v && a.indexOf(v) === i
        )
      : [
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
        ]
  );
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Variants Matrix
  const [variants, setVariants] = useState<ProductVariant[]>(
    product?.variants && product.variants.length > 0
      ? product.variants
      : [
          { id: 'v-1', color: 'Black', size: '12', stock: 4, active: true },
          { id: 'v-2', color: 'Black', size: '14', stock: 5, active: true },
          { id: 'v-3', color: 'Black', size: '16', stock: 3, active: true },
          { id: 'v-4', color: 'Ivory', size: '12', stock: 2, active: true },
          { id: 'v-5', color: 'Ivory', size: '14', stock: 3, active: true },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug when name changes if not manually set
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  // Image actions
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleSetPrimaryImage = (idx: number) => {
    setPrimaryImageIdx(idx);
  };

  const handleDeleteImage = (idx: number) => {
    if (images.length <= 1) {
      alert('Please add at least one product photo');
      return;
    }
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
    if (primaryImageIdx >= updated.length) {
      setPrimaryImageIdx(0);
    }
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const copy = [...images];
    const item = copy.splice(from, 1)[0];
    copy.splice(to, 0, item);
    setImages(copy);
  };

  // Variant updates
  const handleUpdateVariantStock = (vId: string, stock: number) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === vId ? { ...v, stock: Math.max(0, stock) } : v))
    );
  };

  const handleToggleVariantActive = (vId: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === vId ? { ...v, active: !v.active } : v))
    );
  };

  const handleAddVariantRow = () => {
    const newVariant: ProductVariant = {
      id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      color: 'Black',
      size: '14',
      stock: 4,
      active: true,
    };
    setVariants([...variants, newVariant]);
  };

  const handleRemoveVariantRow = (vId: string) => {
    setVariants(variants.filter((v) => v.id !== vId));
  };

  // Save product
  const handleSave = async (targetStatus?: 'live' | 'draft') => {
    if (!name.trim()) {
      setError('Please give the product a name');
      return;
    }

    if (images.length === 0) {
      setError('Please add at least one photograph');
      return;
    }

    setSaving(true);
    setError(null);

    const primaryImg = images[primaryImageIdx] || images[0];
    const secondaryImg = images.find((_, i) => i !== primaryImageIdx) || primaryImg;
    // The gallery is the FULL set with the primary first. It previously
    // excluded the primary image, and the PDP renders galleryImages instead of
    // primaryImage whenever the array is non-empty — so the chosen hero shot
    // disappeared from the product page as soon as the product was saved.
    const gallery = [primaryImg, ...images.filter((_, i) => i !== primaryImageIdx)];

    // Derive available colors and sizes from variants
    const colorsMap = new Map<string, string>();
    variants.forEach((v) => {
      if (!colorsMap.has(v.color)) {
        colorsMap.set(
          v.color,
          v.color.toLowerCase() === 'black'
            ? '#171714'
            : v.color.toLowerCase() === 'ivory'
            ? '#FAF9F6'
            : '#681F2C'
        );
      }
    });

    const colors = Array.from(colorsMap.entries()).map(([cName, hex]) => ({
      name: cName,
      hex,
    }));

    const sizes = Array.from(new Set(variants.map((v) => v.size))) as ProductVariant['size'][];

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      priceInKobo: Math.round(priceInDollars * 100), // stored in cents
      status: targetStatus || status,
      category,
      collection,
      colors,
      sizes,
      variants,
      primaryImage: primaryImg,
      secondaryImage: secondaryImg,
      galleryImages: gallery,
      description,
      fitAndSize,
      delivery,
      care,
      rating: product?.rating || 4.9,
      reviewsCount: product?.reviewsCount || 1,
    };

    try {
      if (isEditing && product) {
        await api.updateAdminProduct(product.id, payload);
      } else {
        await api.createAdminProduct(payload);
      }
      onSaved();
      onClose();
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
      alert(getErrorMessage(err, 'Archive failed'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FAF9F6] border border-[#D8D4CC] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#D8D4CC] sticky top-0 bg-[#FAF9F6] z-10">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#681F2C]">
              {isEditing ? 'Edit product' : 'Add a new product'}
            </span>
            <h2 className="font-serif text-2xl text-[#171714]">
              {isEditing ? product.name : 'Catalogue Item Entry'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#56554F] hover:text-[#171714] hover:bg-[#E6E1D7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 space-y-8">
          {/* 1. Core Garment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
                Product name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. The Amara Dress"
                className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#171714]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
                Price ($ USD)
              </label>
              <input
                type="number"
                required
                value={priceInDollars || ''}
                step="0.01"
                min="0"
                placeholder="e.g. 128"
                onChange={(e) => setPriceInDollars(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#171714]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Product['category'])}
                className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold focus:outline-none focus:border-[#171714]"
              >
                <option value="dresses">Dresses</option>
                <option value="sets">Sets</option>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="occasion">Occasion</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
                Collection Name
              </label>
              <input
                type="text"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                placeholder="COLLECTION 01"
                className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3.5 py-2.5 text-xs uppercase tracking-wider focus:outline-none focus:border-[#171714]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'live' | 'draft' | 'archived')}
                className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold focus:outline-none focus:border-[#171714]"
              >
                <option value="live">Live (Purchasable)</option>
                <option value="draft">Draft (Private)</option>
                <option value="archived">Archived (Catalog preserved)</option>
              </select>
            </div>
          </div>

          {/* 2. Photography & Media Manager (Drag, reorder, cover selection) */}
          <div className="space-y-3 border-t border-[#D8D4CC] pt-6">
            <div className="flex justify-between items-baseline">
              <h3 className="font-serif text-lg text-[#171714]">Product photos</h3>
              <span className="text-xs text-[#56554F]">
                First image is Primary Cover on lookbook & cards
              </span>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative border p-1 group bg-white ${
                    primaryImageIdx === idx ? 'border-[#681F2C] ring-2 ring-[#681F2C]/20' : 'border-[#D8D4CC]'
                  }`}
                >
                  <img src={img} alt="Product photo preview" className="w-full h-36 object-cover" />

                  {/* Badges & Actions */}
                  <div className="absolute top-2 left-2">
                    {primaryImageIdx === idx ? (
                      <span className="bg-[#681F2C] text-white text-[10px] uppercase tracking-wider px-1.5 py-0.5 font-semibold">
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="bg-black/70 hover:bg-[#681F2C] text-white text-[10px] uppercase tracking-wider px-1.5 py-0.5 font-medium transition-colors cursor-pointer"
                      >
                        Set Cover
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-1 text-xs px-1 text-[#56554F]">
                    <div className="flex space-x-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, idx - 1)}
                          className="hover:text-[#171714]"
                          title="Move left"
                        >
                          <ArrowUp className="w-3.5 h-3.5 rotate-[-90deg]" />
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, idx + 1)}
                          className="hover:text-[#171714]"
                          title="Move right"
                        >
                          <ArrowDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(idx)}
                      className="text-red-700 hover:text-red-900"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Image URL */}
            <form onSubmit={handleAddImage} className="flex gap-2 pt-2">
              <input
                type="url"
                placeholder="Paste photographic asset URL (Unsplash or CDN link)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 bg-[#F4F1EB] border border-[#D8D4CC] px-3 py-2 text-xs focus:outline-none focus:border-[#171714]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#171714] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider hover:bg-[#681F2C] transition-colors"
              >
                + Add Photo
              </button>
            </form>
          </div>

          {/* 3. Variants Matrix (Stock by Color & Size) */}
          <div className="space-y-3 border-t border-[#D8D4CC] pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg text-[#171714]">Variant Inventory Matrix</h3>
                <p className="text-xs text-[#56554F]">
                  Server source of truth: stock numbers decrement immediately on verified client payment.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariantRow}
                className="px-3 py-1.5 border border-[#D8D4CC] text-xs font-semibold uppercase tracking-wider hover:border-[#171714]"
              >
                + Add Variant Row
              </button>
            </div>

            <div className="border border-[#D8D4CC] overflow-x-auto bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D8D4CC] bg-[#F4F1EB] text-[11px] uppercase tracking-wider text-[#56554F]">
                    <th className="py-2.5 px-3">Color</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Stock Units</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D4CC]">
                  {variants.map((v) => (
                    <tr key={v.id} className="hover:bg-[#F4F1EB]/40">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariants((prev) =>
                              prev.map((item) => (item.id === v.id ? { ...item, color: val } : item))
                            );
                          }}
                          className="w-24 px-2 py-1 border border-[#D8D4CC] bg-[#FAF9F6] text-xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={v.size}
                          onChange={(e) => {
                            const val = e.target.value as ProductVariant['size'];
                            setVariants((prev) =>
                              prev.map((item) => (item.id === v.id ? { ...item, size: val } : item))
                            );
                          }}
                          className="px-2 py-1 border border-[#D8D4CC] bg-[#FAF9F6] text-xs font-semibold"
                        >
                          {GARMENT_SIZES.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) =>
                            handleUpdateVariantStock(v.id, parseInt(e.target.value, 10) || 0)
                          }
                          className="w-20 px-2 py-1 border border-[#D8D4CC] bg-[#FAF9F6] text-xs font-semibold"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleVariantActive(v.id)}
                          className={`px-2 py-0.5 text-[11px] uppercase tracking-wider font-semibold border ${
                            v.active
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                          }`}
                        >
                          {v.active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(v.id)}
                          className="text-red-700 hover:text-red-900"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Editorial Copy & Specs */}
          <div className="space-y-4 border-t border-[#D8D4CC] pt-6">
            <h3 className="font-serif text-lg text-[#171714]">Editorial Specifications</h3>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the piece: the fabric, the fit and when to wear it."
                className="w-full bg-[#F4F1EB] border border-[#D8D4CC] p-3 text-xs focus:outline-none focus:border-[#171714]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
                  Fit & Sizing Guide
                </label>
                <textarea
                  rows={2}
                  value={fitAndSize}
                  onChange={(e) => setFitAndSize(e.target.value)}
                  className="w-full bg-[#F4F1EB] border border-[#D8D4CC] p-2.5 text-xs focus:outline-none focus:border-[#171714]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
                  Delivery information
                </label>
                <textarea
                  rows={2}
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                  className="w-full bg-[#F4F1EB] border border-[#D8D4CC] p-2.5 text-xs focus:outline-none focus:border-[#171714]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
                  Care Instructions
                </label>
                <textarea
                  rows={2}
                  value={care}
                  onChange={(e) => setCare(e.target.value)}
                  className="w-full bg-[#F4F1EB] border border-[#D8D4CC] p-2.5 text-xs focus:outline-none focus:border-[#171714]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="p-6 border-t border-[#D8D4CC] bg-[#F4F1EB] flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0 z-10">
          <div>
            {isEditing && product?.status !== 'archived' && (
              <button
                type="button"
                onClick={handleArchive}
                className="text-xs uppercase tracking-wider text-red-700 hover:text-red-900 font-semibold flex items-center space-x-1"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Remove from website</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-[#D8D4CC] text-xs uppercase tracking-wider font-semibold text-[#56554F] hover:text-[#171714]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="px-4 py-2.5 border border-[#171714] text-xs uppercase tracking-wider font-semibold text-[#171714] hover:bg-[#171714] hover:text-white transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('live')}
              disabled={saving}
              className="px-6 py-2.5 bg-[#171714] hover:bg-[#681F2C] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-colors cursor-pointer"
            >
              {saving ? 'Saving…' : 'Save product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
