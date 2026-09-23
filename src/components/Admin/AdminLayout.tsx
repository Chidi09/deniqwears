import React, { useState, useEffect } from 'react';
import { Product, Order } from '../../types';
import { api } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminProductsQuery, useAdminOrdersQuery, QUERY_KEYS } from '../../hooks/queries';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminPromotions } from './AdminPromotions';
import { AdminProductModal } from './AdminProductModal';
import { AdminLogin } from './AdminLogin';
import {
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  Settings,
  ShieldAlert,
  Megaphone,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

type AdminTab = 'overview' | 'products' | 'orders' | 'promotions' | 'settings' | 'logs';

interface AdminLayoutProps {
  onExitToStore: () => void;
  initialSection?: AdminTab;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onExitToStore,
  initialSection = 'overview',
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>(initialSection);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Selected order for drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mobile nav toggle
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorObj,
    refetch: refetchProducts,
  } = useAdminProductsQuery(!!isAuthenticated);
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useAdminOrdersQuery(!!isAuthenticated);
  const loading = productsLoading || ordersLoading;
  const loadError = productsError || ordersError;

  // A 401 from any admin query means the session is gone. Derived during
  // render rather than pushed through an effect, so there's no extra
  // render cycle and no setState-in-effect.
  const sessionExpired =
    productsErrorObj instanceof Error && /session expired/i.test(productsErrorObj.message);

  const queryClient = useQueryClient();

  /**
   * Admin forms call the api layer directly, then call this. Refetching the
   * admin lists alone left the storefront caches (products, settings, a
   * specific product page) stale for the rest of the session, so returning to
   * the store showed old prices, stock or archived products.
   */
  const loadData = () => {
    refetchProducts();
    refetchOrders();
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOverview });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettings });
  };

  useEffect(() => {
    api
      .getAdminSession()
      .then((session) => setIsAuthenticated(session.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleLogout = async () => {
    await api.adminLogout();
    // Drop every cached admin/customer record so the next person at this
    // browser can't read the previous session's orders out of the cache.
    queryClient.clear();
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#171714] flex items-center justify-center text-xs text-[#8A8780]">
        Verifying session...
      </div>
    );
  }

  if (!isAuthenticated || sessionExpired) {
    return (
      <AdminLogin
        onSuccess={() => {
          queryClient.clear();
          setIsAuthenticated(true);
        }}
        onExit={onExitToStore}
      />
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.status === 'PAID').length;

  return (
    <div className="min-h-screen bg-[#F4F1EB] text-[#171714] flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="bg-[#171714] text-[#FAF9F6] border-b border-[#3A3935] px-4 sm:px-8 py-3.5 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden text-[#8A8780] hover:text-[#FAF9F6]"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-lg tracking-wide text-[#FAF9F6]">DENIQWEARS</span>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C4828E]">
              Store Admin
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onExitToStore}
            className="inline-flex items-center space-x-1.5 text-xs text-[#8A8780] hover:text-[#FAF9F6] transition-colors"
          >
            <span>View website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 text-xs text-[#C4828E] hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-Bar */}
      <nav className="bg-[#FAF9F6] border-b border-[#D8D4CC] px-4 sm:px-8 overflow-x-auto">
        <div className="flex space-x-6 sm:space-x-8 text-sm font-semibold">
          {(
            [
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'products', label: `Products (${products.length})`, icon: Shirt },
              {
                id: 'orders',
                label: `Orders (${orders.length})`,
                badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
                icon: ShoppingBag,
              },
              { id: 'promotions', label: 'Promotions', icon: Megaphone },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'logs', label: 'Activity', icon: ShieldAlert },
            ] as Array<{ id: AdminTab; label: string; badge?: number; icon: typeof LayoutDashboard }>
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#681F2C] text-[#681F2C]'
                    : 'border-transparent text-[#56554F] hover:text-[#171714]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className="px-1.5 min-w-[20px] h-5 bg-[#681F2C] text-white text-xs rounded-full flex items-center justify-center"
                    title={`${tab.badge} paid ${tab.badge === 1 ? 'order' : 'orders'} waiting to be sent`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content View */}
      <main className="flex-1 max-w-[1344px] w-full mx-auto px-4 sm:px-8 py-8">
        {loading && (
          <div className="py-20 text-center text-xs text-[#8A8780]">
            Loading your store…
          </div>
        )}

        {!loading && loadError && (
          <div className="py-16 text-center space-y-4">
            <p className="text-sm text-[#681F2C] font-semibold">
              Could not load your store data.
            </p>
            <p className="text-xs text-[#56554F]">
              This is usually a connection problem. Your products and orders are safe. Please try again.
            </p>
            <button
              onClick={loadData}
              className="px-5 py-2.5 bg-[#171714] text-white text-xs uppercase tracking-wider font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && activeTab === 'overview' && (
          <AdminOverview
            onNavigateTab={(t) => setActiveTab(t)}
            onAddProduct={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onViewWebsite={onExitToStore}
            onSelectOrder={(ord) => {
              setSelectedOrder(ord);
              setActiveTab('orders');
            }}
          />
        )}

        {!loading && !loadError && activeTab === 'products' && (
          <AdminProducts
            products={products}
            onRefresh={loadData}
            onOpenCreate={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onOpenEdit={(p) => {
              setEditingProduct(p);
              setIsProductModalOpen(true);
            }}
          />
        )}

        {!loading && !loadError && activeTab === 'orders' && (
          <AdminOrders
            orders={orders}
            onRefresh={loadData}
            selectedOrder={selectedOrder}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
          />
        )}

        {!loading && !loadError && activeTab === 'promotions' && <AdminPromotions onSaved={loadData} />}

        {!loading && !loadError && activeTab === 'settings' && <AdminSettings />}

        {!loading && !loadError && activeTab === 'logs' && <AdminAuditLogs />}
      </main>

      {/* Product Create / Edit Modal */}
      {isProductModalOpen && (
        <AdminProductModal
          product={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSaved={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
