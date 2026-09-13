import React, { useState, useEffect } from 'react';
import { Product, Order } from '../../types';
import { api } from '../../services/api';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminProductModal } from './AdminProductModal';
import { AdminLogin } from './AdminLogin';
import {
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Plus,
} from 'lucide-react';

interface AdminLayoutProps {
  onExitToStore: () => void;
  initialSection?: 'overview' | 'products' | 'orders' | 'settings' | 'logs';
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onExitToStore,
  initialSection = 'overview',
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!api.getAdminToken());
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings' | 'logs'>(
    initialSection
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Selected order for drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mobile nav toggle
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        api.getAdminProducts(),
        api.getAdminOrders(),
      ]);
      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    api.clearAdminToken();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} onExit={onExitToStore} />;
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
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C4828E]">
              Atelier Back-Office
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onExitToStore}
            className="inline-flex items-center space-x-1.5 text-xs text-[#8A8780] hover:text-[#FAF9F6] transition-colors"
          >
            <span>Storefront</span>
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
        <div className="flex space-x-8 text-xs uppercase tracking-wider font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: `Garments (${products.length})`, icon: Shirt },
            {
              id: 'orders',
              label: `Orders (${orders.length})`,
              badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
              icon: ShoppingBag,
            },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'logs', label: 'Audit Feed', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#681F2C] text-[#681F2C]'
                    : 'border-transparent text-[#56554F] hover:text-[#171714]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 bg-[#681F2C] text-white text-[10px] rounded-full">
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
            Synchronizing atelier records...
          </div>
        )}

        {!loading && activeTab === 'overview' && (
          <AdminOverview
            onNavigateTab={(t) => setActiveTab(t)}
            onSelectOrder={(ord) => {
              setSelectedOrder(ord);
              setActiveTab('orders');
            }}
          />
        )}

        {!loading && activeTab === 'products' && (
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

        {!loading && activeTab === 'orders' && (
          <AdminOrders
            orders={orders}
            onRefresh={loadData}
            selectedOrder={selectedOrder}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
          />
        )}

        {!loading && activeTab === 'settings' && <AdminSettings />}

        {!loading && activeTab === 'logs' && <AdminAuditLogs />}
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
