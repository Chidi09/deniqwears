import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { formatMoney } from '../../lib/money';
import { api } from '../../services/api';
import { getErrorMessage } from '../../lib/errors';
import { Search, PackageCheck, CheckCircle2, Truck, X, Undo2 } from 'lucide-react';

interface AdminOrdersProps {
  orders: Order[];
  onRefresh: () => void;
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
}


function isRefundedState(status: OrderStatus): boolean {
  return status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED';
}

/** What can still be refunded — drives the form instead of a single status. */
function remainingRefundable(order: Order): number {
  if (!['PAID', 'FULFILLED', 'PARTIALLY_REFUNDED'].includes(order.status)) return 0;
  return Math.max(0, order.totalInKobo - (order.refundedInKobo ?? 0));
}

/**
 * Goods are still owed on a paid order that hasn't shipped — including one
 * that was partially refunded, which previously lost its dispatch button.
 */
function canDispatch(order: Order): boolean {
  return (order.status === 'PAID' || order.status === 'PARTIALLY_REFUNDED') && !order.dispatchedAt;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  onRefresh,
  selectedOrder,
  onSelectOrder,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.firstName.toLowerCase().includes(q) ||
        o.customer.lastName.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.shippingAddress.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus, reason?: string) => {
    setIsUpdating(true);
    try {
      const updated = await api.updateOrderStatus(orderId, nextStatus, reason);
      onSelectOrder(updated);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Status update failed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecordShowroomPayment = async (order: Order) => {
    if (!window.confirm(`Confirm you have collected ${formatMoney(order.totalInKobo)} for order #${order.orderNumber}?`)) {
      return;
    }
    setIsUpdating(true);
    try {
      const updated = await api.recordShowroomPayment(order.id);
      onSelectOrder(updated);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not record payment'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefund = async (order: Order) => {
    const trimmed = refundAmount.trim();
    const amountInKobo = trimmed ? Math.round(parseFloat(trimmed) * 100) : undefined;

    if (trimmed && (!Number.isFinite(amountInKobo) || (amountInKobo as number) <= 0)) {
      alert('Enter a valid refund amount in dollars, or leave blank to refund the remaining balance.');
      return;
    }

    const confirmMsg = amountInKobo
      ? `Refund ${formatMoney(amountInKobo)} for order #${order.orderNumber}?`
      : `Refund the remaining ${formatMoney(remainingRefundable(order))} for order #${order.orderNumber}?`;
    if (!window.confirm(confirmMsg)) return;

    setIsRefunding(true);
    try {
      const { order: updated } = await api.refundOrder(order.id, amountInKobo);
      onSelectOrder(updated);
      onRefresh();
      setRefundAmount('');
    } catch (err) {
      alert(getErrorMessage(err, 'Refund failed'));
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FAF9F6] border border-[#D8D4CC] p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#56554F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F4F1EB] border border-[#D8D4CC] pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#171714]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'PAID', label: 'Paid' },
            { id: 'PAYMENT_PROCESSING', label: 'Processing' },
            { id: 'FULFILLED', label: 'Dispatched' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1.5 uppercase tracking-wider font-semibold border transition-colors ${
                filterStatus === s.id
                  ? 'bg-[#171714] text-white border-[#171714]'
                  : 'bg-white text-[#56554F] border-[#D8D4CC] hover:text-[#171714]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#FAF9F6] border border-[#D8D4CC] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D8D4CC] bg-[#F4F1EB] text-[11px] uppercase tracking-wider text-[#56554F]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Delivery Zone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D4CC]">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className={`hover:bg-[#F4F1EB] cursor-pointer transition-colors ${
                    selectedOrder?.id === order.id ? 'bg-[#F4F1EB]' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-medium text-[#171714]">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-[#56554F]">
                    {new Date(order.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#171714]">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-xs text-[#56554F]">{order.customer.email}</p>
                  </td>
                  <td className="py-3 px-4 text-[#56554F] text-xs">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4 text-[#56554F]">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} units
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-[#171714]">
                    {formatMoney(order.totalInKobo)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(order);
                      }}
                      className="px-2.5 py-1 bg-white border border-[#D8D4CC] hover:border-[#171714] text-xs uppercase tracking-wider font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS DRAWER / MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FAF9F6] border-l border-[#D8D4CC] w-full max-w-xl h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-[#D8D4CC] pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#681F2C]">
                  Order Details
                </span>
                <h2 className="font-serif text-2xl text-[#171714]">
                  #{selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-[#56554F] mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => onSelectOrder(null)}
                className="p-1.5 text-[#56554F] hover:text-[#171714] hover:bg-[#E6E1D7] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dominant Next Action: MARK AS DISPATCHED */}
            {selectedOrder.paymentMethod === 'showroom' &&
              selectedOrder.status !== 'PAID' &&
              selectedOrder.status !== 'FULFILLED' &&
              !isRefundedState(selectedOrder.status) && (
                <div className="p-4 bg-amber-50 border border-amber-300 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
                    <PackageCheck className="w-4 h-4" />
                    <span>Awaiting Showroom Collection</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-snug">
                    This order is reserved but unpaid. Record the payment once the client has settled at the counter —
                    that marks it paid, deducts stock and sends their receipt.
                  </p>
                  <button
                    onClick={() => handleRecordShowroomPayment(selectedOrder)}
                    disabled={isUpdating}
                    className="w-full bg-[#171714] hover:bg-[#681F2C] text-white text-xs uppercase tracking-[0.16em] font-semibold py-3 border border-[#171714] transition-colors cursor-pointer"
                  >
                    Record Payment Collected
                  </button>
                </div>
              )}

            {canDispatch(selectedOrder) && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-900 font-semibold text-xs uppercase tracking-wider">
                  <PackageCheck className="w-4 h-4" />
                  <span>Ready for Courier Dispatch</span>
                </div>
                <p className="text-xs text-emerald-950 leading-snug">
                  Payment received. Click below once the order is packed and handed to the courier.
                </p>
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedOrder.id, 'FULFILLED', 'Handed to express courier')
                  }
                  disabled={isUpdating}
                  className="w-full bg-[#171714] hover:bg-[#681F2C] text-white text-xs uppercase tracking-[0.16em] font-semibold py-3 border border-[#171714] transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Mark as Dispatched</span>
                </button>
              </div>
            )}

            {selectedOrder.status === 'FULFILLED' && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center space-x-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Order fulfilled and dispatched ({selectedOrder.dispatchedAt ? new Date(selectedOrder.dispatchedAt).toLocaleDateString() : 'Active'})</span>
              </div>
            )}

            {remainingRefundable(selectedOrder) > 0 && (
              <div className="p-4 bg-[#FAF9F6] border border-[#D8D4CC] space-y-3">
                <div className="flex items-center space-x-2 text-[#171714] font-semibold text-xs uppercase tracking-wider">
                  <Undo2 className="w-4 h-4" />
                  <span>Issue a Refund</span>
                </div>
                <p className="text-xs text-[#56554F] leading-snug">
                  Refunds go through {selectedOrder.paymentMethod} directly. Leave the amount blank to
                  refund the remaining {formatMoney(remainingRefundable(selectedOrder))}, or enter a partial amount in dollars.
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#56554F]">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={`${remainingRefundable(selectedOrder) / 100} (remaining)`}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="flex-1 bg-white border border-[#D8D4CC] px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#171714]"
                  />
                  <button
                    onClick={() => handleRefund(selectedOrder)}
                    disabled={isRefunding}
                    className="px-3.5 py-1.5 bg-[#171714] hover:bg-[#681F2C] text-white text-xs uppercase tracking-wider font-semibold border border-[#171714] transition-colors cursor-pointer"
                  >
                    {isRefunding ? 'Refunding...' : 'Refund'}
                  </button>
                </div>
              </div>
            )}

            {(selectedOrder.status === 'REFUNDED' || selectedOrder.status === 'PARTIALLY_REFUNDED') && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2 font-medium">
                <Undo2 className="w-4 h-4" />
                <span>
                  {selectedOrder.status === 'REFUNDED' ? 'Fully refunded' : 'Partially refunded'} — see timeline below for details.
                </span>
              </div>
            )}

            {/* Customer & Delivery Address */}
            <div className="grid grid-cols-2 gap-4 border border-[#D8D4CC] p-4 bg-white text-xs">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#56554F] font-semibold mb-1">
                  Customer
                </p>
                <p className="font-semibold text-[#171714]">
                  {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                </p>
                <p className="text-[#56554F] mt-0.5">{selectedOrder.customer.email}</p>
                <p className="text-[#56554F]">{selectedOrder.customer.phone}</p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#56554F] font-semibold mb-1">
                  Courier Destination
                </p>
                <p className="text-[#171714] font-medium">
                  {selectedOrder.shippingAddress.address}
                  {selectedOrder.shippingAddress.apartment && `, ${selectedOrder.shippingAddress.apartment}`}
                </p>
                <p className="text-[#56554F] mt-0.5">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                </p>
              </div>
            </div>

            {/* Itemized Garments */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#171714]">
                Order Items ({selectedOrder.items.length})
              </span>
              <div className="divide-y divide-[#D8D4CC] border-y border-[#D8D4CC]">
                {selectedOrder.items.map((item) => (
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
                          {item.color} · Size {item.size} · Qty: {item.quantity}
                        </p>
                        <p className="text-xs text-[#8A8780]">
                          Unit: {formatMoney(item.unitPriceInKobo)}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#171714]">
                      {formatMoney(item.totalPriceInKobo)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 bg-[#F4F1EB] border border-[#D8D4CC] space-y-2 text-xs uppercase tracking-wider">
              <div className="flex justify-between text-[#56554F]">
                <span>Subtotal</span>
                <span>{formatMoney(selectedOrder.subtotalInKobo)}</span>
              </div>
              <div className="flex justify-between text-[#56554F]">
                <span>Courier Fee</span>
                <span>
                  {selectedOrder.deliveryFeeInKobo === 0
                    ? 'Complimentary'
                    : formatMoney(selectedOrder.deliveryFeeInKobo)}
                </span>
              </div>
              {selectedOrder.discountInKobo > 0 && (
                <div className="flex justify-between text-[#681F2C]">
                  <span>Discount</span>
                  <span>-{formatMoney(selectedOrder.discountInKobo)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#171714] text-sm pt-2 border-t border-[#D8D4CC]">
                <span>Total Settled</span>
                <span>{formatMoney(selectedOrder.totalInKobo)}</span>
              </div>
              <div className="pt-2 text-[11px] text-[#56554F] normal-case">
                Payment Method: <strong className="uppercase">{selectedOrder.paymentMethod}</strong>
                {selectedOrder.paymentReference && ` · Ref: ${selectedOrder.paymentReference}`}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="space-y-3 pt-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#171714]">
                Event History & Timeline
              </span>
              <div className="border-l-2 border-[#D8D4CC] ml-3 pl-4 space-y-4 text-xs">
                {selectedOrder.timeline?.map((event) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-[#171714]" />
                    <p className="font-semibold text-[#171714]">{event.title}</p>
                    <p className="text-[#56554F] text-xs">{event.description}</p>
                    <p className="text-[11px] text-[#8A8780] mt-0.5">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
