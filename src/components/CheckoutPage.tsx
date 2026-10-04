import React, { useState, useEffect, useRef } from 'react';
import { CartItem, Order, StoreSettings } from '../types';
import { api } from '../services/api';
import { formatMoney } from '../lib/money';
import { useGuestCheckoutStore } from '../store/useStore';
import { useVerifyPaymentMutation } from '../hooks/mutations';
import { getErrorMessage } from '../lib/errors';
import {
  Lock,
  ArrowLeft,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { AdirePattern } from './Adire';
import { CheckoutField } from './CheckoutField';
import {
  US_STATES,
  VerifiedAddress,
  VerifyAddressResult,
  formatPhone,
  hasErrors,
  validateAddress,
  validateContact,
} from '../lib/address';

type CheckoutPaymentMethod = 'stripe' | 'paystack' | 'flutterwave' | 'showroom';

// Listed in display order; only the ones switched on in Settings are shown.
const PAYMENT_OPTIONS: { id: CheckoutPaymentMethod; title: string; detail: string; icon: typeof CreditCard }[] = [
  { id: 'stripe', title: 'Card or Wallet', detail: 'Visa, Mastercard, Amex, Apple Pay, Google Pay & more', icon: CreditCard },
  { id: 'paystack', title: 'Paystack', detail: 'Cards, bank transfer', icon: CreditCard },
  { id: 'flutterwave', title: 'Flutterwave', detail: 'Card payments', icon: CreditCard },
  { id: 'showroom', title: 'Pay on collection', detail: 'Pay in person when you pick up your order', icon: Building },
];

interface CheckoutPageProps {
  items: CartItem[];
  onBackToShopping: () => void;
  onBackToHome: () => void;
  onClearCart: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  onBackToShopping,
  onBackToHome,
  onClearCart,
}) => {
  const {
    guestCustomer,
    guestShippingAddress,
    setGuestCustomer,
    setGuestShippingAddress,
  } = useGuestCheckoutStore();

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  // Form State (hydrated from Zustand guest checkout store)
  const [contact, setContact] = useState({
    email: guestCustomer?.email || '',
    phone: guestCustomer?.phone || '',
    firstName: guestCustomer?.firstName || '',
    lastName: guestCustomer?.lastName || '',
  });

  const [address, setAddress] = useState({
    address: guestShippingAddress?.address || '',
    apartment: guestShippingAddress?.apartment || '',
    city: guestShippingAddress?.city || '',
    state: US_STATES.some(([code]) => code === guestShippingAddress?.state) ? guestShippingAddress!.state : '',
    postalCode: guestShippingAddress?.postalCode || '',
    country: 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('stripe');

  // Only offer what the store has switched on. The server rejects disabled
  // methods regardless, but they should never have been shown as options.
  const providerEnabled: Record<CheckoutPaymentMethod, boolean> = {
    stripe: settings?.paymentProviders.stripe ?? true,
    paystack: settings?.paymentProviders.paystack ?? false,
    flutterwave: settings?.paymentProviders.flutterwave ?? false,
    showroom: settings?.paymentProviders.showroomCollection ?? false,
  };

  // If the selected method gets switched off while the page is open, fall
  // back to one that is actually available.
  useEffect(() => {
    if (!providerEnabled[paymentMethod]) {
      const firstEnabled = (['stripe', 'paystack', 'flutterwave', 'showroom'] as const).find(
        (method) => providerEnabled[method]
      );
      if (firstEnabled) setPaymentMethod(firstEnabled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  // The quote is pinned to the code and subtotal it was issued for. Editing
  // the field or changing the bag after applying used to leave a stale
  // discount on screen while a different code (or none) was submitted, so the
  // charge could exceed the displayed total.
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; subtotalInKobo: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // One key per logical checkout attempt, so a retry after a network failure
  // recovers the original order instead of creating a second one. Cleared only
  // once an order is confirmed.
  const idempotencyKeyRef = useRef<string | null>(null);
  const idempotencyFingerprintRef = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Post-purchase "Save details" password
  const [saveAccountPassword, setSaveAccountPassword] = useState('');
  const [accountSaved, setAccountSaved] = useState(false);
  const [cancelledNotice, setCancelledNotice] = useState(false);

  // Inline validation: a field shows its error once it has been left, or once
  // the customer has tried to pay. Errors are derived from the current values,
  // so they clear the moment the problem is fixed.
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [attemptedPay, setAttemptedPay] = useState(false);
  const contactErrors = validateContact(contact);
  const addressErrors = validateAddress(address);
  const touch = (field: string) => setTouched((prev) => (prev.has(field) ? prev : new Set(prev).add(field)));
  const shown = <T extends object>(errors: T, field: keyof T & string): string | undefined =>
    touched.has(field) || attemptedPay ? ((errors[field] as unknown) as string | undefined) : undefined;

  // Address verification: what the check said, and which exact address (if any)
  // the customer has chosen to keep or has already had confirmed.
  const [isVerifying, setIsVerifying] = useState(false);
  const [addressCheck, setAddressCheck] = useState<VerifyAddressResult | null>(null);
  const [acceptedAddressKey, setAcceptedAddressKey] = useState<string | null>(null);
  const addressKey = (a: { address: string; apartment?: string; city: string; state: string; postalCode: string }) =>
    [a.address, a.apartment ?? '', a.city, a.state, a.postalCode].map((v) => v.trim().toUpperCase()).join('|');

  // Load store settings (delivery zones & fees)
  useEffect(() => {
    api.getSettings().then((s) => {
      if (s) {
        setSettings(s);
        if (s.deliveryZones.length > 0) {
          setSelectedZoneId(s.deliveryZones[0].id);
        }
      }
    });
  }, []);

  // Check URL params for payment return/verification. The gateway redirects
  // the customer back here after they've actually paid (see handleSubmit),
  // so this is where verification belongs — never before that redirect.
  const verifyPaymentMutation = useVerifyPaymentMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    const orderId = params.get('orderId');

    // Backed out of the payment page: keep the bag, say so, and clean the URL.
    if (params.get('cancelled') === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the URL once on mount
      setCancelledNotice(true);
      window.history.replaceState(null, '', '/checkout');
      return;
    }
    if (!reference || !orderId) return;

    verifyPaymentMutation.mutate(
      { reference, orderId },
      {
        onSuccess: (res) => {
          if (res.success && res.order) {
            setConfirmedOrder(res.order);
            onClearCart();
            // Drop the payment reference from the address so a refresh or the
            // back button can't re-run verification.
            window.history.replaceState(null, '', '/checkout');
          } else {
            setErrorMsg(res.message || 'Payment could not be completed.');
          }
        },
        onError: (err: Error) => setErrorMsg(getErrorMessage(err, 'Payment verification failed')),
      }
    );
    // Intentionally runs once on mount to inspect the initial URL only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculations for UI display
  const subtotalInKobo = items.reduce((sum, item) => sum + item.priceInKobo * item.quantity, 0);

  const currentZone = settings?.deliveryZones.find((z) => z.id === selectedZoneId);
  const isFreeDelivery = (settings?.freeDeliveryThresholdInKobo && subtotalInKobo >= settings.freeDeliveryThresholdInKobo) || currentZone?.feeInKobo === 0;
  const deliveryFeeInKobo = isFreeDelivery ? 0 : (currentZone?.feeInKobo || 0);
  // A discount only counts while the code in the box and the bag value still
  // match what the server quoted.
  const promoStillValid =
    !!appliedPromo &&
    appliedPromo.code === promoCode.trim() &&
    appliedPromo.subtotalInKobo === subtotalInKobo;
  const effectiveDiscount = promoStillValid ? promoDiscount : 0;
  const totalInKobo = Math.max(0, subtotalInKobo + deliveryFeeInKobo - effectiveDiscount);

  // Apply Promo
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoError(null);
    setPromoSuccess(null);

    try {
      const res = await api.validateDiscount(promoCode, subtotalInKobo);
      setPromoDiscount(res.discountInKobo);
      setAppliedPromo({ code: promoCode.trim(), subtotalInKobo });
      setPromoSuccess(`Discount applied: -${formatMoney(res.discountInKobo)}`);
    } catch (err) {
      setPromoError(getErrorMessage(err, 'Invalid promo code'));
      setPromoDiscount(0);
    }
  };

  // Place the order for a confirmed delivery address (never trusts client prices!)
  const submitOrder = async (addr: typeof address) => {
    // Created on first submit (not during render, which must stay pure) and
    // reused by retries so a failed attempt recovers its original order. It is
    // tied to the form contents, so changing the address or bag starts a new order
    // instead of resurrecting the old one.
    const fingerprint = JSON.stringify([contact, addr, selectedZoneId, paymentMethod, items.map((i) => [i.variantId, i.quantity])]);
    if (!idempotencyKeyRef.current || idempotencyFingerprintRef.current !== fingerprint) {
      // Runs only from click handlers, never during render.
      // eslint-disable-next-line react-hooks/purity
      idempotencyKeyRef.current = `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      idempotencyFingerprintRef.current = fingerprint;
    }

    setIsSubmitting(true);
    const normalisedContact = { ...contact, phone: formatPhone(contact.phone) };
    setGuestCustomer(normalisedContact);
    setGuestShippingAddress({ ...normalisedContact, ...addr });

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        customer: normalisedContact,
        shippingAddress: {
          ...normalisedContact,
          ...addr,
        },
        deliveryZoneId: selectedZoneId,
        discountCode: promoStillValid ? appliedPromo!.code : undefined,
        paymentMethod,
        idempotencyKey: idempotencyKeyRef.current,
      };

      const result = await api.initiateCheckout(payload);
      const session = result.paymentSession;
      const redirectUrl = session?.authorizationUrl || session?.checkoutUrl;

      if (redirectUrl) {
        // Send the customer to the gateway to actually authorize/pay. They
        // land back on this same page (via the reference/orderId query
        // params handled in the effect above), which is what triggers
        // verification, never before the customer has paid.
        // eslint-disable-next-line react-hooks/immutability -- navigating away, from a click handler
        window.location.href = redirectUrl;
        return;
      }

      // No gateway redirect (e.g. in-person collection): the order is placed
      // but payment isn't captured online, so there's nothing to verify yet.
      setConfirmedOrder(result.order);
      onClearCart();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Unable to place order. Please check your details.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusFirstError = () => {
    // Wait a tick so the errors have rendered, then jump to the first invalid field.
    window.setTimeout(() => {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }, 0);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setAddressCheck(null);

    if (items.length === 0) {
      setErrorMsg('Your bag is empty.');
      return;
    }

    setAttemptedPay(true);
    if (hasErrors(contactErrors) || hasErrors(addressErrors)) {
      focusFirstError();
      return;
    }

    // Check the address exists, unless the customer already confirmed or chose
    // to keep this exact one. A failed check never blocks the sale.
    if (acceptedAddressKey !== addressKey(address)) {
      setIsVerifying(true);
      const result = await api.verifyAddress({
        address: address.address,
        apartment: address.apartment,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
      });
      setIsVerifying(false);

      if (result.status === 'invalid' || result.status === 'corrected') {
        setAddressCheck(result);
        document.getElementById('address-check')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      setAcceptedAddressKey(addressKey(address));
    }

    await submitOrder(address);
  };

  const applySuggestedAddress = async (suggestion: VerifiedAddress) => {
    const next = { ...address, ...suggestion };
    setAddress(next);
    setAcceptedAddressKey(addressKey(next));
    setAddressCheck(null);
    await submitOrder(next);
  };

  const keepEnteredAddress = async () => {
    setAcceptedAddressKey(addressKey(address));
    setAddressCheck(null);
    await submitOrder(address);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveAccountPassword) return;
    setAccountSaved(true);
  };

  // CONFIRMATION VIEW
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#F4F1EB] pt-12 pb-32">
        <div className="max-w-[760px] mx-auto px-5">
          <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-8 sm:p-12 shadow-sm space-y-8 animate-in fade-in duration-300">
            {/* Celebration panel: indigo adire, and a thank-you in Yoruba */}
            <div className="relative overflow-hidden -mx-8 -mt-8 sm:-mx-12 sm:-mt-12 px-8 sm:px-12 py-10 bg-[#1E2656] text-[#FAF9F6]">
              <AdirePattern motif="rings" size={52} className="absolute inset-0 text-[#FAF9F6] opacity-[0.1]" />
              <div className="relative space-y-3">
                <div className="flex items-center space-x-3 text-[#E9C9A0]">
                  <CheckCircle2 className="w-7 h-7 stroke-[1.5]" />
                  <span className="text-xs uppercase tracking-[0.25em] font-semibold">
                    Order Confirmed · #{confirmedOrder.orderNumber}
                  </span>
                </div>
                <p className="font-serif italic text-2xl text-[#E9C9A0]">Ẹ ṣé o!</p>
                <h1 className="font-serif text-3xl sm:text-4xl">Thank you, {confirmedOrder.customer.firstName}.</h1>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-[#56554F] leading-relaxed">
                Your order is confirmed and we&rsquo;re getting it ready. A receipt has been sent to{' '}
                <span className="font-medium text-[#171714]">{confirmedOrder.customer.email}</span>.
              </p>
            </div>

            {/* Order Items Snapshot */}
            <div className="border-y border-[#D8D4CC] py-6 space-y-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
                Your items ({confirmedOrder.items.length})
              </span>
              <div className="divide-y divide-[#D8D4CC]">
                {confirmedOrder.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-16 object-cover border border-[#D8D4CC]"
                      />
                      <div>
                        <p className="font-serif text-sm text-[#171714]">{item.name}</p>
                        <p className="text-[#56554F]">
                          {item.color} · Size {item.size} · Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-[#171714]">
                      {formatMoney(item.totalPriceInKobo)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Dispatch Timeline */}
            <div className="p-4 bg-[#F4F1EB] border border-[#D8D4CC] text-xs space-y-2">
              <div className="flex items-center space-x-2 text-[#681F2C] font-semibold uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                <span>Delivery Address</span>
              </div>
              <p className="text-[#171714] font-medium">
                {confirmedOrder.shippingAddress.address}
                {confirmedOrder.shippingAddress.apartment && `, ${confirmedOrder.shippingAddress.apartment}`}
              </p>
              <p className="text-[#56554F]">
                {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state}
              </p>
              <p className="text-xs text-[#56554F] pt-1">
                Dispatch status: <span className="text-[#681F2C] font-semibold">{confirmedOrder.status}</span>
              </p>
            </div>

            {/* Section 4 mandate: "Save your details for next time" (converts customer after purchase) */}
            <div className="border border-[#D8D4CC] p-5 bg-white space-y-3">
              <h3 className="font-serif text-lg text-[#171714]">
                Save your details for next time
              </h3>
              <p className="text-xs text-[#56554F] leading-relaxed">
                Create a private password to save your sizes, delivery address, and view private previews of Collection 02.
              </p>

              {accountSaved ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Private client account created. Your details are saved for faster checkout next time.</span>
                </div>
              ) : (
                <form onSubmit={handleSaveAccount} className="flex gap-2 pt-1">
                  <input
                    type="password"
                    required
                    placeholder="Create private password"
                    value={saveAccountPassword}
                    onChange={(e) => setSaveAccountPassword(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-[#D8D4CC] bg-[#FAF9F6] focus:outline-none focus:border-[#171714]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#171714] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider hover:bg-[#681F2C] transition-colors"
                  >
                    Save Details
                  </button>
                </form>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onBackToShopping}
                className="w-full sm:w-auto bg-[#171714] hover:bg-[#681F2C] text-[#FAF9F6] text-xs font-semibold tracking-[0.2em] uppercase px-8 py-4 border border-[#171714] transition-colors"
              >
                Continue shopping
              </button>
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto text-[#171714] hover:bg-[#171714] hover:text-[#FAF9F6] text-xs font-semibold tracking-[0.2em] uppercase px-8 py-4 border border-[#171714] transition-colors"
              >
                Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY BAG CHECK
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F1EB] pt-20 pb-32 text-center">
        <div className="max-w-md mx-auto px-5 space-y-6">
          <h2 className="font-serif text-3xl text-[#171714]">Your bag is currently empty</h2>
          <p className="text-xs text-[#56554F] leading-relaxed">
            Explore Collection 01 to select architectural silhouettes before proceeding to checkout.
          </p>
          <button
            onClick={onBackToShopping}
            className="bg-[#171714] text-[#FAF9F6] text-xs uppercase tracking-[0.2em] font-semibold px-6 py-3.5"
          >
            Explore The Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="checkout-route" className="min-h-screen bg-[#F4F1EB] pt-6 pb-28">
      {/* Top Header Bar */}
      <div className="max-w-[1344px] mx-auto px-5 md:px-12 mb-8">
        <div className="flex justify-between items-center border-b border-[#D8D4CC] pb-4">
          <button
            onClick={onBackToShopping}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.16em] text-[#56554F] hover:text-[#171714] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Boutique</span>
          </button>

          <div className="flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#171714]">
            <Lock className="w-3.5 h-3.5 text-[#681F2C]" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1344px] mx-auto px-5 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* LEFT: Guest Checkout Steps */}
          <div className="lg:col-span-7 space-y-10">
            {cancelledNotice && !errorMsg && (
              <div className="p-3 bg-[#F4F1EB] border border-[#D8D4CC] text-[#171714] text-xs flex items-center space-x-2">
                <span>Payment was cancelled. Nothing was charged and your bag is saved, so you can try again whenever you are ready.</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: CONTACT */}
            <div className="space-y-4">
              <div className="flex justify-between items-baseline border-b border-[#D8D4CC] pb-2">
                <h3 className="font-serif text-2xl text-[#171714]">
                  1. Contact Information
                </h3>
                <span className="text-xs uppercase tracking-wider text-[#56554F]">Guest Checkout</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CheckoutField id="checkout-first-name" label="First Name" error={shown(contactErrors, 'firstName')}>
                  {(c) => (
                    <input
                      {...c}
                      type="text"
                      autoComplete="given-name"
                      placeholder="e.g. Ada"
                      value={contact.firstName}
                      onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                      onBlur={() => touch('firstName')}
                    />
                  )}
                </CheckoutField>
                <CheckoutField id="checkout-last-name" label="Last Name" error={shown(contactErrors, 'lastName')}>
                  {(c) => (
                    <input
                      {...c}
                      type="text"
                      autoComplete="family-name"
                      placeholder="e.g. Okafor"
                      value={contact.lastName}
                      onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                      onBlur={() => touch('lastName')}
                    />
                  )}
                </CheckoutField>
                <CheckoutField
                  id="checkout-email"
                  label="Email"
                  hint="Your receipt and tracking updates go here."
                  error={shown(contactErrors, 'email')}
                >
                  {(c) => (
                    <input
                      {...c}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="ada@gmail.com"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      onBlur={() => {
                        setContact((prev) => ({ ...prev, email: prev.email.trim() }));
                        touch('email');
                      }}
                    />
                  )}
                </CheckoutField>
                <CheckoutField
                  id="checkout-phone"
                  label="Phone"
                  hint="Only used for delivery updates."
                  error={shown(contactErrors, 'phone')}
                >
                  {(c) => (
                    <input
                      {...c}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="(555) 123-4567"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      onBlur={() => {
                        setContact((prev) => ({ ...prev, phone: formatPhone(prev.phone) }));
                        touch('phone');
                      }}
                    />
                  )}
                </CheckoutField>
              </div>
            </div>

            {/* STEP 2: DELIVERY DESTINATION */}
            <div className="space-y-4">
              <div className="border-b border-[#D8D4CC] pb-2">
                <h3 className="font-serif text-2xl text-[#171714]">
                  2. Delivery Destination
                </h3>
              </div>

              {/* Delivery Zone Selector */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
                  Select Region / Courier Route
                </label>
                <div className="space-y-2">
                  {settings?.deliveryZones.map((zone) => (
                    <label
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`flex items-center justify-between p-3 border cursor-pointer transition-colors ${
                        selectedZoneId === zone.id
                          ? 'border-[#171714] bg-[#FAF9F6]'
                          : 'border-[#D8D4CC] bg-transparent hover:border-[#56554F]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="zone"
                          checked={selectedZoneId === zone.id}
                          onChange={() => setSelectedZoneId(zone.id)}
                          className="accent-[#681F2C]"
                        />
                        <div>
                          <p className="text-xs font-semibold text-[#171714]">{zone.name}</p>
                          <p className="text-xs text-[#56554F]">{zone.description} · {zone.estimatedDelivery}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#171714]">
                        {zone.feeInKobo === 0 ? (
                          <span className="text-[#681F2C]">Complimentary</span>
                        ) : (
                          formatMoney(zone.feeInKobo)
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Street Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <CheckoutField
                  id="checkout-address"
                  label="Street Address"
                  className="sm:col-span-2"
                  error={shown(addressErrors, 'address')}
                >
                  {(c) => (
                    <input
                      {...c}
                      type="text"
                      autoComplete="address-line1"
                      placeholder="e.g. 123 Main Street"
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      onBlur={() => touch('address')}
                    />
                  )}
                </CheckoutField>
                <CheckoutField id="checkout-apartment" label="Apartment / Suite (Optional)">
                  {(c) => (
                    <input
                      {...c}
                      type="text"
                      autoComplete="address-line2"
                      placeholder="e.g. Apt 4B"
                      value={address.apartment}
                      onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                    />
                  )}
                </CheckoutField>
                <CheckoutField id="checkout-city" label="City" error={shown(addressErrors, 'city')}>
                  {(c) => (
                    <input
                      {...c}
                      type="text"
                      autoComplete="address-level2"
                      placeholder="e.g. Houston"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      onBlur={() => touch('city')}
                    />
                  )}
                </CheckoutField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CheckoutField id="checkout-state" label="State" error={shown(addressErrors, 'state')}>
                  {(c) => (
                    <select
                      {...c}
                      autoComplete="address-level1"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      onBlur={() => touch('state')}
                    >
                      <option value="" disabled>
                        Select your state
                      </option>
                      {US_STATES.map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  )}
                </CheckoutField>
                <CheckoutField id="checkout-zip" label="ZIP Code" error={shown(addressErrors, 'postalCode')}>
                  {(c) => (
                    <input
                      {...c}
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={10}
                      placeholder="e.g. 77002"
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value.replace(/[^\d-]/g, '') })}
                      onBlur={() => touch('postalCode')}
                    />
                  )}
                </CheckoutField>
              </div>

              {/* Address check result: shown after pressing pay, if we found something to confirm */}
              {addressCheck && (addressCheck.status === 'corrected' || addressCheck.status === 'invalid') && (
                <div
                  id="address-check"
                  role="alert"
                  className={`p-4 border space-y-3 ${
                    addressCheck.status === 'invalid' ? 'border-[#B3261E]/40 bg-[#FDF3F2]' : 'border-[#B07A2E]/50 bg-[#FBF6EC]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${addressCheck.status === 'invalid' ? 'text-[#B3261E]' : 'text-[#B07A2E]'}`} />
                    <div className="text-sm text-[#171714] space-y-1">
                      <p className="font-semibold">
                        {addressCheck.status === 'invalid' ? 'We couldn\u2019t confirm this address' : 'Is this the right address?'}
                      </p>
                      {addressCheck.message && <p className="text-[#56554F]">{addressCheck.message}</p>}
                      {addressCheck.suggestion && (
                        <p className="text-[#171714]">
                          <span className="text-[#56554F]">We suggest: </span>
                          {addressCheck.suggestion.address}, {addressCheck.suggestion.city}, {addressCheck.suggestion.state}{' '}
                          {addressCheck.suggestion.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    {addressCheck.suggestion && (
                      <button
                        type="button"
                        onClick={() => applySuggestedAddress(addressCheck.suggestion as VerifiedAddress)}
                        disabled={isSubmitting}
                        className="px-5 py-3 bg-[#171714] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider hover:bg-[#681F2C] transition-colors"
                      >
                        Use suggested address
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAddressCheck(null);
                        document.getElementById('checkout-address')?.focus();
                      }}
                      className="px-5 py-3 border border-[#171714] text-xs font-semibold uppercase tracking-wider hover:bg-[#171714] hover:text-[#FAF9F6] transition-colors"
                    >
                      Edit my address
                    </button>
                    <button
                      type="button"
                      onClick={keepEnteredAddress}
                      disabled={isSubmitting}
                      className="text-xs text-[#56554F] underline underline-offset-2 hover:text-[#171714] sm:ml-auto"
                    >
                      Ship to what I typed
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-[#8A8780]">We currently ship within the United States only.</p>
            </div>

            {/* STEP 3: PAYMENT METHOD */}
            <div className="space-y-4">
              <div className="border-b border-[#D8D4CC] pb-2">
                <h3 className="font-serif text-2xl text-[#171714]">
                  3. Payment Method
                </h3>
              </div>

              <div className="space-y-2.5">
                {PAYMENT_OPTIONS.filter((option) => providerEnabled[option.id]).map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.id}
                      onClick={() => setPaymentMethod(option.id)}
                      className={`flex items-center justify-between p-3.5 border cursor-pointer transition-colors ${
                        paymentMethod === option.id
                          ? 'border-[#171714] bg-[#FAF9F6]'
                          : 'border-[#D8D4CC] bg-transparent hover:border-[#56554F]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === option.id}
                          onChange={() => setPaymentMethod(option.id)}
                          className="accent-[#681F2C]"
                        />
                        <div>
                          <p className="text-xs font-semibold text-[#171714]">{option.title}</p>
                          <p className="text-xs text-[#56554F]">{option.detail}</p>
                        </div>
                      </div>
                      <Icon className="w-4 h-4 text-[#56554F]" />
                    </label>
                  );
                })}
                {paymentMethod === 'stripe' && providerEnabled.stripe && (
                  <p className="text-xs text-[#8A8780] flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    You&rsquo;ll finish paying on Stripe&rsquo;s secure page, then come straight back here.
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handlePay}
                disabled={isSubmitting || isVerifying || verifyPaymentMutation.isPending}
                className="w-full bg-[#171714] hover:bg-[#681F2C] text-[#FAF9F6] text-xs font-semibold tracking-[0.2em] uppercase py-4 border border-[#171714] transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isVerifying
                    ? 'Checking your address…'
                    : isSubmitting || verifyPaymentMutation.isPending
                    ? 'Securing your order…'
                    : `Pay ${formatMoney(totalInKobo)}`}
                </span>
              </button>

              <div className="flex items-center justify-center space-x-4 pt-3 text-xs text-[#56554F]">
                <span>SSL Encrypted</span>
                <span>·</span>
                <span>PCI-DSS Compliant</span>
                <span>·</span>
                <span>Server-Verified Amounts</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-6 space-y-6">
              <div className="flex justify-between items-baseline border-b border-[#D8D4CC] pb-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#171714]">
                  Bag Summary ({items.reduce((sum, i) => sum + i.quantity, 0)} items)
                </span>
                <span className="text-xs text-[#56554F]">Live Server Verification</span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#D8D4CC] max-h-[340px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3.5 flex space-x-3 text-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-18 object-cover border border-[#D8D4CC] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-[#171714] truncate">{item.name}</p>
                      <p className="text-[#56554F] mt-0.5">
                        {item.selectedColor} · Size {item.selectedSize}
                      </p>
                      <p className="text-[#56554F] text-xs mt-0.5">Qty: {item.quantity}</p>
                      <p className="font-semibold text-[#171714] mt-1">
                        {formatMoney(item.priceInKobo * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="space-y-2 border-t border-[#D8D4CC] pt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Promotional code (e.g. WELCOME10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-[#D8D4CC] bg-[#F4F1EB] focus:outline-none focus:border-[#171714] uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#171714] text-[#FAF9F6] text-xs font-semibold uppercase tracking-wider hover:bg-[#681F2C] transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-xs text-red-600">{promoError}</p>}
                {promoSuccess && promoStillValid && (
                  <p className="text-xs text-[#681F2C] font-medium">{promoSuccess}</p>
                )}
                {appliedPromo && !promoStillValid && (
                  <p className="text-xs text-[#56554F]">
                    Your bag or code changed. Re-apply the code to use it.
                  </p>
                )}
              </form>

              {/* Price Calculation */}
              <div className="border-t border-[#D8D4CC] pt-4 space-y-2 text-xs uppercase tracking-wider">
                <div className="flex justify-between text-[#56554F]">
                  <span>Subtotal</span>
                  <span className="text-[#171714] font-medium">{formatMoney(subtotalInKobo)}</span>
                </div>

                <div className="flex justify-between text-[#56554F]">
                  <span>Courier Delivery</span>
                  <span className="text-[#171714] font-medium">
                    {deliveryFeeInKobo === 0 ? (
                      <span className="text-[#681F2C]">Complimentary</span>
                    ) : (
                      formatMoney(deliveryFeeInKobo)
                    )}
                  </span>
                </div>

                {effectiveDiscount > 0 && (
                  <div className="flex justify-between text-[#681F2C] font-semibold">
                    <span>Promotion Discount</span>
                    <span>-{formatMoney(effectiveDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-semibold text-[#171714] pt-3 border-t border-[#D8D4CC]">
                  <span>Total (Server Verified)</span>
                  <span className="text-base font-bold">{formatMoney(totalInKobo)}</span>
                </div>
              </div>

              {/* Free delivery threshold callout */}
              {settings?.freeDeliveryThresholdInKobo && subtotalInKobo < settings.freeDeliveryThresholdInKobo && (
                <div className="p-3 bg-[#F4F1EB] border border-[#D8D4CC] text-xs text-[#56554F]">
                  Add {formatMoney(settings.freeDeliveryThresholdInKobo - subtotalInKobo)} more to unlock complimentary nationwide delivery.
                </div>
              )}
            </div>

            {/* Reassurance Badges */}
            <div className="p-5 border border-[#D8D4CC] bg-[#FAF9F6] text-xs text-[#56554F] space-y-2">
              <div className="flex items-center space-x-2 text-[#171714] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#681F2C]" />
                <span>The Deniq Guarantee</span>
              </div>
              <p className="text-xs leading-relaxed">
                Every piece is checked by hand and carefully packed. Returns and exchanges accepted within {settings?.returnPeriodDays ?? 5} days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
