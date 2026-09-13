import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { formatPrice } from '../../data/products';
import { Order } from '../../types';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigateTab: (tab: 'products' | 'orders' | 'settings' | 'logs') => void;
  onSelectOrder: (order: Order) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab, onSelectOrder }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminOverview()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-xs text-[#8A8780]">
        Loading atelier metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#56554F] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Settled Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#681F2C]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-[#171714]">
            {formatPrice(data.totalRevenueInKobo)}
          </p>
          <p className="text-[11px] text-[#56554F] mt-1">Verified bank & card payments</p>
        </div>

        <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#56554F] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Pending Fulfillment</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-[#171714]">
            {data.pendingFulfillmentCount}
          </p>
          <p className="text-[11px] text-[#56554F] mt-1">Paid orders ready to dispatch</p>
        </div>

        <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#56554F] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Orders</span>
            <Package className="w-4 h-4 text-[#171714]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-[#171714]">
            {data.totalOrdersCount}
          </p>
          <p className="text-[11px] text-[#56554F] mt-1">Lifetime checkout requests</p>
        </div>

        <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#56554F] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-[#681F2C]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl text-[#681F2C]">
            {data.lowStockCount}
          </p>
          <p className="text-[11px] text-[#56554F] mt-1">Variants with ≤ 2 units</p>
        </div>
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
            {data.lowStockAlerts.map((alert: any, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 bg-white border border-amber-300 text-xs text-amber-950"
              >
                <span className="font-medium mr-1.5">{alert.product}</span>
                <span className="text-amber-800 text-[11px]">
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
              <h3 className="font-serif text-xl text-[#171714]">Recent Atelier Orders</h3>
              <p className="text-[11px] text-[#56554F]">Real-time client checkout queue</p>
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
                <tr className="border-b border-[#D8D4CC] text-[#56554F] uppercase tracking-wider text-[10px]">
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
                      <p className="text-[10px] text-[#56554F]">{order.shippingAddress.city}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${
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
                      {order.items.reduce((s, i) => s + i.quantity, 0)} garments
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-[#171714]">
                      {formatPrice(order.totalInKobo)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="text-[11px] font-semibold uppercase tracking-wider text-[#681F2C] hover:underline"
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
              <h3 className="font-serif text-xl text-[#171714]">Audit Feed</h3>
              <p className="text-[11px] text-[#56554F]">Recorded administrative actions</p>
            </div>
            <button
              onClick={() => onNavigateTab('logs')}
              className="text-xs uppercase tracking-wider font-semibold text-[#681F2C] hover:underline flex items-center space-x-1"
            >
              <span>Logs</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.recentActivity?.map((log: any) => (
              <div key={log.id} className="p-3 bg-[#F4F1EB] border border-[#D8D4CC] text-xs space-y-1">
                <div className="flex justify-between items-center text-[10px] text-[#56554F]">
                  <span className="uppercase tracking-wider font-semibold text-[#171714]">
                    {log.action}
                  </span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[#171714] text-[11px] leading-snug">{log.details}</p>
                <p className="text-[10px] text-[#56554F] pt-0.5">By {log.adminEmail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
