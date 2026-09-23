import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { formatMoney } from '../../lib/money';
import { Order, AdminActivityLog } from '../../types';
import { RevenueTrendChart, RevenuePoint } from './RevenueTrendChart';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Undo2,
  Plus,
  PackageCheck,
  Megaphone,
  ExternalLink,
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigateTab: (tab: 'products' | 'orders' | 'promotions' | 'settings' | 'logs') => void;
  onAddProduct: () => void;
  onViewWebsite: () => void;
  onSelectOrder: (order: Order) => void;
}

interface LowStockAlert {
  product: string;
  color: string;
  size: string;
  stock: number;
}

interface AdminOverviewData {
  totalRevenueInKobo: number;
  totalOrdersCount: number;
  pendingFulfillmentCount: number;
  lowStockCount: number;
  lowStockAlerts: LowStockAlert[];
  recentOrders: Order[];
  recentActivity: AdminActivityLog[];
}

interface FinanceSummary {
  grossSalesInKobo: number;
  refundedInKobo: number;
  netRevenueInKobo: number;
  merchandiseInKobo: number;
  deliveryFeesInKobo: number;
  discountsGivenInKobo: number;
  paidOrdersCount: number;
  averageOrderValueInKobo: number;
  pendingCollectionInKobo: number;
  pendingCollectionCount: number;
  awaitingDispatchCount: number;
  failedOrCancelledCount: number;
}

interface AnalyticsData {
  period: string;
  summary: FinanceSummary;
  series: RevenuePoint[];
  paymentMethods: Array<{ method: string; netInKobo: number; ordersCount: number }>;
  topProducts: Array<{ productId: string; name: string; unitsSold: number; revenueInKobo: number }>;
}

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: 'all', label: 'All Time' },
];

const PAYMENT_LABELS: Record<string, string> = {
  paystack: 'Paystack',
  flutterwave: 'Flutterwave',
  stripe: 'Stripe',
  showroom: 'Showroom (cash/POS)',
};

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  onNavigateTab,
  onSelectOrder,
  onAddProduct,
  onViewWebsite,
}) => {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminOverview()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminAnalytics(period)
      .then((res) => {
        if (!cancelled) setAnalytics(res);
      })
      .catch((err) => console.error(err));
    return () => {
      cancelled = true;
    };
  }, [period]);

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-xs text-[#8A8780]">
        Loading your dashboard…
      </div>
    );
  }

  const summary = analytics?.summary;
  const maxMethodValue = Math.max(1, ...(analytics?.paymentMethods.map((m) => m.netInKobo) ?? [1]));

  const quickActions = [
    { label: 'Add a product', hint: 'Photos, price and sizes', icon: Plus, onClick: onAddProduct, primary: true },
    {
      label: 'Orders to send',
      hint:
        data.pendingFulfillmentCount > 0
          ? `${data.pendingFulfillmentCount} paid ${data.pendingFulfillmentCount === 1 ? 'order is' : 'orders are'} waiting`
          : 'All caught up',
      icon: PackageCheck,
      onClick: () => onNavigateTab('orders'),
      alert: data.pendingFulfillmentCount > 0,
    },
    { label: 'Change promotions', hint: 'Top bar & homepage banner', icon: Megaphone, onClick: () => onNavigateTab('promotions') },
    { label: 'View my website', hint: 'See what customers see', icon: ExternalLink, onClick: onViewWebsite },
  ];

  return (
    <div className="space-y-8">
      {/* Quick actions — the everyday jobs, one tap away */}
      <div>
        <h2 className="font-serif text-3xl text-[#171714]">Welcome back</h2>
        <p className="text-sm text-[#56554F] mt-1">What would you like to do today?</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {quickActions.map(({ label, hint, icon: Icon, onClick, primary, alert }) => (
            <button
              key={label}
              onClick={onClick}
              className={`group text-left p-4 sm:p-5 border transition-colors flex flex-col gap-3 ${
                primary
                  ? 'bg-[#171714] border-[#171714] text-[#FAF9F6] hover:bg-[#681F2C] hover:border-[#681F2C]'
                  : 'bg-[#FAF9F6] border-[#D8D4CC] text-[#171714] hover:border-[#171714]'
              }`}
            >
              <span
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  primary ? 'bg-[#FAF9F6]/10' : alert ? 'bg-[#681F2C] text-white' : 'bg-[#F4F1EB] text-[#681F2C]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className={`block text-xs mt-0.5 ${primary ? 'text-[#FAF9F6]/70' : alert ? 'text-[#681F2C] font-medium' : 'text-[#56554F]'}`}>
                  {hint}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Period filter — one row above the figures it controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-[#171714]">Sales</h2>
          <p className="text-xs text-[#56554F]">
            Revenue is counted when payment lands, and always shown net of refunds.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {PERIODS.map((option) => (
            <button
              key={option.id}
              onClick={() => setPeriod(option.id)}
              className={`px-3 py-1.5 uppercase tracking-wider font-semibold border transition-colors ${
                period === option.id
                  ? 'bg-[#171714] text-white border-[#171714]'
                  : 'bg-white text-[#56554F] border-[#D8D4CC] hover:text-[#171714]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Money figures. Net revenue is the headline — it's the number that
          actually reflects what the business kept. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#171714] text-[#FAF9F6] p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#C4828E]">
              Net Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-[#C4828E]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl">
            {summary ? formatMoney(summary.netRevenueInKobo) : '…'}
          </p>
          <p className="text-xs text-[#8A8780] mt-1">
            {summary ? `${summary.paidOrdersCount} paid orders · avg ${formatMoney(summary.averageOrderValueInKobo)}` : ' '}
          </p>
        </div>

        <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#56554F] mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Gross Sales</span>
            <Package className="w-4 h-4 text-[#171714]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-[#171714]">
            {summary ? formatMoney(summary.grossSalesInKobo) : '…'}
          </p>
          <p className="text-xs text-[#56554F] mt-1">
            {summary ? `${formatMoney(summary.deliveryFeesInKobo)} of it delivery fees` : ' '}
          </p>
        </div>

        <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#56554F] mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Refunded</span>
            <Undo2 className="w-4 h-4 text-[#681F2C]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-[#681F2C]">
            {summary ? formatMoney(summary.refundedInKobo) : '…'}
          </p>
          <p className="text-xs text-[#56554F] mt-1">Already deducted from net</p>
        </div>

        <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#56554F] mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Awaiting Payment</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-[#171714]">
            {summary ? formatMoney(summary.pendingCollectionInKobo) : '…'}
          </p>
          <p className="text-xs text-[#56554F] mt-1">
            {summary ? `${summary.pendingCollectionCount} orders not yet collected` : ' '}
          </p>
        </div>
      </div>

      {/* Revenue trend */}
      <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-5 sm:p-6">
        <div className="flex justify-between items-baseline border-b border-[#D8D4CC] pb-3 mb-4">
          <div>
            <h3 className="font-serif text-xl text-[#171714]">Daily Net Revenue</h3>
            <p className="text-xs text-[#56554F]">Hover any day for its exact figure</p>
          </div>
        </div>
        {analytics ? (
          <RevenueTrendChart series={analytics.series} />
        ) : (
          <div className="h-[132px] flex items-center text-xs text-[#8A8780]">Loading…</div>
        )}
      </div>

      {/* Where money came in + what sold */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-5 sm:p-6">
          <h3 className="font-serif text-xl text-[#171714] border-b border-[#D8D4CC] pb-3 mb-4">
            Where the Money Came In
          </h3>
          {analytics && analytics.paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {analytics.paymentMethods.map((method) => (
                <div key={method.method}>
                  <div className="flex justify-between items-baseline text-xs mb-1.5">
                    <span className="text-[#171714] font-medium">
                      {PAYMENT_LABELS[method.method] ?? method.method}
                    </span>
                    <span className="text-[#171714] font-semibold">
                      {formatMoney(method.netInKobo)}
                      <span className="text-[#8A8780] font-normal ml-1.5">· {method.ordersCount}</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#E6E1D7]">
                    <div
                      className="h-full bg-[#681F2C]"
                      style={{ width: `${Math.max((method.netInKobo / maxMethodValue) * 100, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-[#8A8780] pt-2">
                Showroom totals are cash or POS taken in person. Reconcile these against the till.
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#8A8780]">No payments collected in this period.</p>
          )}
        </div>

        <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-5 sm:p-6">
          <h3 className="font-serif text-xl text-[#171714] border-b border-[#D8D4CC] pb-3 mb-4">
            Best Sellers
          </h3>
          {analytics && analytics.topProducts.length > 0 ? (
            <table className="w-full text-xs">
              <tbody className="divide-y divide-[#D8D4CC]">
                {analytics.topProducts.map((product) => (
                  <tr key={product.productId}>
                    <td className="py-2.5 text-[#171714] font-medium">{product.name}</td>
                    <td className="py-2.5 text-right text-[#56554F] whitespace-nowrap">
                      {product.unitsSold} {product.unitsSold === 1 ? 'unit' : 'units'}
                    </td>
                    <td className="py-2.5 text-right text-[#171714] font-semibold whitespace-nowrap pl-3">
                      {formatMoney(product.revenueInKobo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-[#8A8780]">Nothing sold in this period yet.</p>
          )}
        </div>
      </div>

      {/* Fulfilment flow */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateTab('orders')}
          className="bg-[#FAF9F6] border border-[#D8D4CC] p-4 text-left hover:border-[#171714] transition-colors"
        >
          <span className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
            Awaiting Dispatch
          </span>
          <p className="font-serif text-2xl text-[#171714] mt-1">{summary?.awaitingDispatchCount ?? '…'}</p>
          <p className="text-xs text-[#56554F]">Paid, needs packing</p>
        </button>

        <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
            Discounts Given
          </span>
          <p className="font-serif text-2xl text-[#171714] mt-1">
            {summary ? formatMoney(summary.discountsGivenInKobo) : '…'}
          </p>
          <p className="text-xs text-[#56554F]">Promo codes redeemed</p>
        </div>

        <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
            Failed / Cancelled
          </span>
          <p className="font-serif text-2xl text-[#171714] mt-1">{summary?.failedOrCancelledCount ?? '…'}</p>
          <p className="text-xs text-[#56554F]">Checkouts that fell through</p>
        </div>

        <button
          onClick={() => onNavigateTab('products')}
          className="bg-[#FAF9F6] border border-[#D8D4CC] p-4 text-left hover:border-[#171714] transition-colors"
        >
          <span className="text-xs uppercase tracking-wider font-semibold text-[#56554F]">
            Low Stock Alerts
          </span>
          <p className="font-serif text-2xl text-[#681F2C] mt-1">{data.lowStockCount}</p>
          <p className="text-xs text-[#56554F]">Variants with ≤ 2 units</p>
        </button>
      </div>

      {/* Low Stock Callout if exists */}
      {data.lowStockAlerts && data.lowStockAlerts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 p-4">
          <div className="flex items-center space-x-2 text-amber-900 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Urgent Inventory Attention Required
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {data.lowStockAlerts.map((alert: LowStockAlert, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 bg-white border border-amber-300 text-xs text-amber-950"
              >
                <span className="font-medium mr-1.5">{alert.product}</span>
                <span className="text-amber-800 text-xs">
                  ({alert.color} · {alert.size}): <strong>{alert.stock} left</strong>
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Section: Recent Orders + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-[#FAF9F6] border border-[#D8D4CC] p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#D8D4CC] pb-3">
            <div>
              <h3 className="font-serif text-xl text-[#171714]">Recent orders</h3>
              <p className="text-xs text-[#56554F]">Real-time client checkout queue</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs uppercase tracking-wider font-semibold text-[#681F2C] hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8D4CC] text-[#56554F] uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D4CC]">
                {data.recentOrders?.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-[#F4F1EB] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-[#171714]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-[#171714]">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-[11px] text-[#56554F]">{order.shippingAddress.city}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] uppercase tracking-wider font-semibold border ${
                          order.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.status === 'FULFILLED'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : order.status === 'PAYMENT_PROCESSING'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#56554F]">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-[#171714]">
                      {formatMoney(order.totalInKobo)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="text-xs font-semibold uppercase tracking-wider text-[#681F2C] hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-4 bg-[#FAF9F6] border border-[#D8D4CC] p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#D8D4CC] pb-3">
            <div>
              <h3 className="font-serif text-xl text-[#171714]">Recent activity</h3>
              <p className="text-xs text-[#56554F]">Recorded administrative actions</p>
            </div>
            <button
              onClick={() => onNavigateTab('logs')}
              className="text-xs uppercase tracking-wider font-semibold text-[#681F2C] hover:underline flex items-center space-x-1"
            >
              <span>Logs</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.recentActivity?.map((log: AdminActivityLog) => (
              <div key={log.id} className="p-3 bg-[#F4F1EB] border border-[#D8D4CC] text-xs space-y-1">
                <div className="flex justify-between items-center text-[11px] text-[#56554F]">
                  <span className="uppercase tracking-wider font-semibold text-[#171714]">
                    {log.action}
                  </span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[#171714] text-xs leading-snug">{log.details}</p>
                <p className="text-[11px] text-[#56554F] pt-0.5">By {log.adminEmail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
