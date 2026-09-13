import React, { useState } from 'react';
import { Product } from '../../types';
import { formatPrice } from '../../data/products';
import { api } from '../../services/api';
import {
  Search,
  Plus,
  Edit2,
  Archive,
  Check,
  X,
  SlidersHorizontal,
  Save,
  AlertCircle,
} from 'lucide-react';

interface AdminProductsProps {
  products: Product[];
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (product: Product) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'live' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickEditMode, setQuickEditMode] = useState(false);

  // Quick edit scratchpad
  const [modifiedItems, setModifiedItems] = useState<{
    [productId: string]: { priceInKobo?: number; totalStock?: number; status?: any };
  }>({});

  // Inline price editing state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [inlinePriceInput, setInlinePriceInput] = useState<string>('');

  const [savingQuickEdit, setSavingQuickEdit] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (filterTab !== 'all' && p.status !== filterTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.collection && p.collection.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Handle inline price click
  const handleStartInlinePrice = (product: Product) => {
    setEditingPriceId(product.id);
    setInlinePriceInput(String(Math.round(product.priceInKobo / 100)));
  };

  const handleSaveInlinePrice = async (productId: string) => {
    const num = parseInt(inlinePriceInput, 10);
    if (isNaN(num) || num <= 0) {
      setEditingPriceId(null);
      return;
    }

    try {
      await api.updateAdminProduct(productId, { priceInKobo: num * 100 });
      setNotice('Price updated successfully');
      setTimeout(() => setNotice(null), 3000);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to update price');
    } finally {
      setEditingPriceId(null);
    }
  };

  // Quick edit value changes
  const handleQuickChange = (
    productId: string,
    field: 'priceInKobo' | 'totalStock' | 'status',
    val: any
  ) => {
    setModifiedItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: val,
      },
    }));
  };

  const handleSaveQuickEdit = async () => {
    const items = Object.entries(modifiedItems).map(([productId, changesRaw]) => {
      const changes = changesRaw as { priceInKobo?: number; totalStock?: number; status?: any };
      return {
        productId,
        priceInKobo: changes.priceInKobo,
        totalStock: changes.totalStock,
        status: changes.status,
      };
    });

    if (items.length === 0) {
      setQuickEditMode(false);
      return;
    }

    setSavingQuickEdit(true);
    try {
      await api.quickEditProducts(items);
      setModifiedItems({});
      setQuickEditMode(false);
      setNotice(`Saved batch updates for ${items.length} garments`);
      setTimeout(() => setNotice(null), 3500);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to batch update');
    } finally {
      setSavingQuickEdit(false);
    }
  };

  const handleArchive = async (productId: string) => {
    if (!window.confirm('Archive this garment? It will be removed from the storefront while preserving past order history.')) {
      return;
    }
    try {
      await api.archiveAdminProduct(productId);
      setNotice('Garment archived');
      setTimeout(() => setNotice(null), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Archive failed');
    }
  };

  const changesCount = Object.keys(modifiedItems).length;

  return (
    <div className="space-y-6">
      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FAF9F6] border border-[#D8D4CC] p-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#56554F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search garment name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F4F1EB] border border-[#D8D4CC] pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#171714]"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={() => {
              if (quickEditMode) {
                setModifiedItems({});
              }
              setQuickEditMode(!quickEditMode);
            }}
            className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider border flex items-center space-x-1.5 transition-colors ${
              quickEditMode
                ? 'bg-[#681F2C] text-white border-[#681F2C]'
                : 'bg-white text-[#171714] border-[#D8D4CC] hover:border-[#171714]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{quickEditMode ? 'Exit Quick Edit' : 'Quick Edit Mode'}</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 bg-[#171714] hover:bg-[#681F2C] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Garment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D8D4CC] space-x-6 text-xs uppercase tracking-wider">
        {(['all', 'live', 'draft', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`pb-2.5 font-semibold transition-colors ${
              filterTab === tab
                ? 'text-[#681F2C] border-b-2 border-[#681F2C]'
                : 'text-[#56554F] hover:text-[#171714]'
            }`}
          >
            {tab} ({products.filter((p) => (tab === 'all' ? true : p.status === tab)).length})
          </button>
        ))}
      </div>

      {/* Products Table (Desktop) / Cards (Mobile) */}
      <div className="bg-[#FAF9F6] border border-[#D8D4CC] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D8D4CC] bg-[#F4F1EB] text-[#56554F] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Garment</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Units</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D4CC]">
              {filteredProducts.map((p) => {
                const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
                const isPriceEditing = editingPriceId === p.id;
                const pendingChanges = modifiedItems[p.id];

                return (
                  <tr key={p.id} className="hover:bg-[#F4F1EB]/50 transition-colors">
                    {/* Garment details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.primaryImage}
                          alt={p.name}
                          className="w-10 h-14 object-cover border border-[#D8D4CC] flex-shrink-0"
                        />
                        <div>
                          <p className="font-serif text-sm text-[#171714] font-medium">{p.name}</p>
                          <p className="text-[11px] text-[#56554F]">
                            {p.variants?.length || 0} variant combinations
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 uppercase tracking-wider text-[11px] text-[#56554F]">
                      {p.category}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {quickEditMode ? (
                        <select
                          value={pendingChanges?.status || p.status}
                          onChange={(e) => handleQuickChange(p.id, 'status', e.target.value)}
                          className="bg-white border border-[#D8D4CC] px-2 py-1 text-[11px] uppercase tracking-wider font-semibold"
                        >
                          <option value="live">Live</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${
                            p.status === 'live'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : p.status === 'draft'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      )}
                    </td>

                    {/* Price with inline quick edit */}
                    <td className="py-3 px-4">
                      {quickEditMode ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-[#56554F]">₦</span>
                          <input
                            type="number"
                            defaultValue={Math.round(p.priceInKobo / 100)}
                            onChange={(e) =>
                              handleQuickChange(
                                p.id,
                                'priceInKobo',
                                parseInt(e.target.value, 10) * 100
                              )
                            }
                            className="w-24 px-2 py-1 bg-white border border-[#D8D4CC] text-xs font-semibold focus:outline-none focus:border-[#171714]"
                          />
                        </div>
                      ) : isPriceEditing ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-[#56554F]">₦</span>
                          <input
                            type="number"
                            autoFocus
                            value={inlinePriceInput}
                            onChange={(e) => setInlinePriceInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveInlinePrice(p.id)}
                            className="w-24 px-1.5 py-0.5 bg-white border border-[#171714] text-xs font-semibold"
                          />
                          <button
                            onClick={() => handleSaveInlinePrice(p.id)}
                            className="p-1 bg-[#171714] text-white hover:bg-[#681F2C]"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartInlinePrice(p)}
                          className="group text-xs font-semibold text-[#171714] hover:text-[#681F2C] flex items-center space-x-1 text-left"
                          title="Click to edit price directly"
                        >
                          <span>{formatPrice(p.priceInKobo)}</span>
                          <Edit2 className="w-3 h-3 text-[#8A8780] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      {quickEditMode ? (
                        <input
                          type="number"
                          defaultValue={totalStock}
                          onChange={(e) =>
                            handleQuickChange(
                              p.id,
                              'totalStock',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-16 px-2 py-1 bg-white border border-[#D8D4CC] text-xs font-semibold focus:outline-none focus:border-[#171714]"
                        />
                      ) : (
                        <span
                          className={`text-xs font-medium ${
                            totalStock <= 2 ? 'text-[#681F2C] font-semibold' : 'text-[#171714]'
                          }`}
                        >
                          {totalStock} units
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onOpenEdit(p)}
                          className="p-1.5 text-[#56554F] hover:text-[#171714] hover:bg-[#E6E1D7] transition-colors"
                          title="Full Edit Drawer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {p.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(p.id)}
                            className="p-1.5 text-[#56554F] hover:text-[#681F2C] hover:bg-red-50 transition-colors"
                            title="Archive Garment"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Save Changes Bar for Quick Edit Mode */}
      {quickEditMode && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171714] text-[#FAF9F6] px-5 py-3.5 border border-[#3A3935] shadow-2xl flex items-center space-x-4 animate-in slide-in-from-bottom-3 duration-200">
          <div className="text-xs">
            <span className="font-semibold text-white">{changesCount}</span> garment{changesCount === 1 ? '' : 's'} modified
          </div>
          <button
            onClick={handleSaveQuickEdit}
            disabled={savingQuickEdit || changesCount === 0}
            className="px-4 py-2 bg-[#681F2C] hover:bg-[#832637] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingQuickEdit ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
