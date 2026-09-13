import React, { useState, useEffect } from 'react';
import { StoreSettings, DeliveryZone } from '../../types';
import { api } from '../../services/api';
import { formatPrice } from '../../data/products';
import { Save, Check, Plus, Trash2, Truck, CreditCard } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api
      .getAdminSettings()
      .then((s) => setSettings(s))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateZone = (zoneId: string, field: keyof DeliveryZone, val: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      deliveryZones: settings.deliveryZones.map((z) =>
        z.id === zoneId ? { ...z, [field]: val } : z
      ),
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.updateAdminSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="py-20 text-center text-xs text-[#8A8780]">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>Atelier settings updated successfully</span>
        </div>
      )}

      {/* General Store Info */}
      <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-6 space-y-4">
        <h3 className="font-serif text-xl text-[#171714] border-b border-[#D8D4CC] pb-3">
          Concierge Contact & Branding
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#56554F]">
              Store Name
            </label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#56554F]">
              Client Support Email
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#56554F]">
              Concierge WhatsApp
            </label>
            <input
              type="text"
              value={settings.supportWhatsApp}
              onChange={(e) => setSettings({ ...settings, supportWhatsApp: e.target.value })}
              className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Delivery Zones & Logistics */}
      <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-6 space-y-5">
        <div className="flex justify-between items-baseline border-b border-[#D8D4CC] pb-3">
          <div>
            <h3 className="font-serif text-xl text-[#171714]">Courier Delivery Zones</h3>
            <p className="text-[11px] text-[#56554F]">
              Server fees automatically applied during checkout calculation
            </p>
          </div>
          <div className="text-right">
            <label className="text-[11px] uppercase tracking-wider text-[#56554F] font-semibold block">
              Free Delivery Bag Threshold (₦)
            </label>
            <input
              type="number"
              value={Math.round(settings.freeDeliveryThresholdInKobo / 100)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  freeDeliveryThresholdInKobo: (parseInt(e.target.value, 10) || 0) * 100,
                })
              }
              className="w-36 bg-[#F4F1EB] border border-[#D8D4CC] px-2.5 py-1 text-xs font-semibold text-right"
            />
          </div>
        </div>

        <div className="space-y-3">
          {settings.deliveryZones.map((zone) => (
            <div
              key={zone.id}
              className="p-4 bg-[#F4F1EB] border border-[#D8D4CC] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
            >
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={zone.name}
                  onChange={(e) => handleUpdateZone(zone.id, 'name', e.target.value)}
                  className="w-full bg-white border border-[#D8D4CC] px-2.5 py-1.5 font-semibold text-xs"
                />
                <input
                  type="text"
                  value={zone.description}
                  onChange={(e) => handleUpdateZone(zone.id, 'description', e.target.value)}
                  placeholder="Zone description"
                  className="w-full bg-white border border-[#D8D4CC] px-2.5 py-1 text-[11px] text-[#56554F] mt-1"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-[10px] uppercase text-[#56554F] block">Estimate</label>
                <input
                  type="text"
                  value={zone.estimatedDelivery}
                  onChange={(e) => handleUpdateZone(zone.id, 'estimatedDelivery', e.target.value)}
                  className="w-full bg-white border border-[#D8D4CC] px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] uppercase text-[#56554F] block">Fee (₦)</label>
                <input
                  type="number"
                  value={Math.round(zone.feeInKobo / 100)}
                  onChange={(e) =>
                    handleUpdateZone(
                      zone.id,
                      'feeInKobo',
                      (parseInt(e.target.value, 10) || 0) * 100
                    )
                  }
                  className="w-full bg-white border border-[#D8D4CC] px-2.5 py-1.5 font-semibold text-xs"
                />
              </div>

              <div className="sm:col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => handleUpdateZone(zone.id, 'active', !zone.active)}
                  className={`px-2 py-1 text-[10px] uppercase tracking-wider font-semibold border ${
                    zone.active
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-neutral-100 text-neutral-500 border-neutral-300'
                  }`}
                >
                  {zone.active ? 'Active' : 'Off'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Provider Integrations */}
      <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-6 space-y-4">
        <h3 className="font-serif text-xl text-[#171714] border-b border-[#D8D4CC] pb-3">
          Payment Provider Activations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <label className="flex items-center space-x-3 p-3.5 border border-[#D8D4CC] bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={settings.paymentProviders.paystack}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  paymentProviders: {
                    ...settings.paymentProviders,
                    paystack: e.target.checked,
                  },
                })
              }
              className="accent-[#681F2C]"
            />
            <div>
              <p className="font-semibold text-[#171714]">Paystack</p>
              <p className="text-[11px] text-[#56554F]">Cards, Bank Transfer & USSD</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3.5 border border-[#D8D4CC] bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={settings.paymentProviders.flutterwave}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  paymentProviders: {
                    ...settings.paymentProviders,
                    flutterwave: e.target.checked,
                  },
                })
              }
              className="accent-[#681F2C]"
            />
            <div>
              <p className="font-semibold text-[#171714]">Flutterwave</p>
              <p className="text-[11px] text-[#56554F]">Global Cards & Mobile Money</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3.5 border border-[#D8D4CC] bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={settings.paymentProviders.showroomCollection}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  paymentProviders: {
                    ...settings.paymentProviders,
                    showroomCollection: e.target.checked,
                  },
                })
              }
              className="accent-[#681F2C]"
            />
            <div>
              <p className="font-semibold text-[#171714]">Showroom POS</p>
              <p className="text-[11px] text-[#56554F]">Victoria Island Atelier POS</p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#171714] hover:bg-[#681F2C] text-[#FAF9F6] text-xs font-semibold uppercase tracking-[0.16em] flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
};
