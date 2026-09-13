import express, { Request, Response, NextFunction } from 'express';
import { db } from '../db';

const router = express.Router();

// Simple admin token map for secure session enforcement
const VALID_TOKENS = new Set<string>(['deniq_admin_sess_2026_master']);

// Middleware: Enforce admin authorization on the SERVER
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);

  if (!token || !VALID_TOKENS.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: Valid admin authentication token required' });
  }

  // Attach admin email
  (req as any).adminEmail = 'admin@deniqwears.com';
  next();
}

// 1. Admin Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Simple secure hardcoded showroom admin credentials
  if (email === 'admin@deniqwears.com' && (password === 'deniq2026' || password === 'admin')) {
    const token = 'deniq_admin_sess_2026_master';
    VALID_TOKENS.add(token);

    db.logActivity({
      adminEmail: email,
      action: 'Admin signed in',
      entityType: 'settings',
      details: 'Showroom manager authenticated to back-office',
    });

    return res.json({
      success: true,
      token,
      admin: {
        email,
        name: 'Deniq Showroom Manager',
        role: 'ADMIN',
      },
    });
  }

  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// Protected routes below
router.use(requireAdmin);

// 2. Admin Overview Dashboard
router.get('/overview', (req, res) => {
  const orders = db.getOrders();
  const products = db.getProducts(true);

  // Total paid revenue in kobo
  const paidOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'FULFILLED');
  const totalRevenueInKobo = paidOrders.reduce((sum, o) => sum + o.totalInKobo, 0);

  // Status counts (Paid, waiting for dispatch)
  const pendingOrdersCount = orders.filter((o) => o.status === 'PAID').length;

  // Low stock variants (< 3 units)
  const lowStockAlerts: Array<{ product: string; color: string; size: string; stock: number }> = [];
  for (const p of products) {
    if (p.status !== 'archived') {
      for (const v of p.variants) {
        if (v.active && v.stock <= 2) {
          lowStockAlerts.push({
            product: p.name,
            color: v.color,
            size: v.size,
            stock: v.stock,
          });
        }
      }
    }
  }

  res.json({
    totalRevenueInKobo,
    totalOrdersCount: orders.length,
    pendingFulfillmentCount: pendingOrdersCount,
    lowStockCount: lowStockAlerts.length,
    lowStockAlerts: lowStockAlerts.slice(0, 5),
    recentOrders: orders.slice(0, 5),
    recentActivity: db.getActivityLogs().slice(0, 6),
  });
});

// 3. Products List (including drafts and archived)
router.get('/products', (req, res) => {
  const products = db.getProducts(true);
  res.json({ products });
});

// 4. Create Product
router.post('/products', (req, res) => {
  const adminEmail = (req as any).adminEmail;
  const productData = req.body;

  if (!productData.name || !productData.priceInKobo) {
    return res.status(400).json({ error: 'Name and price in kobo are required' });
  }

  const newProduct = db.createProduct(productData, adminEmail);
  res.status(201).json({ product: newProduct });
});

// 5. Update Product
router.put('/products/:id', (req, res) => {
  const adminEmail = (req as any).adminEmail;
  const updated = db.updateProduct(req.params.id, req.body, adminEmail);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product: updated });
});

// 6. Archive Product (Preserves order history!)
router.post('/products/:id/archive', (req, res) => {
  const adminEmail = (req as any).adminEmail;
  const archived = db.archiveProduct(req.params.id, adminEmail);
  if (!archived) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product: archived });
});

// 7. Quick Edit Mode: Batch price & stock changes
router.post('/products/quick-edit', (req, res) => {
  const adminEmail = (req as any).adminEmail;
  const { items } = req.body; // array of { productId, priceInKobo, totalStock, status }

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  db.quickUpdatePricesAndStock(items, adminEmail);
  res.json({ success: true, count: items.length });
});

// 8. Orders List
router.get('/orders', (req, res) => {
  const orders = db.getOrders();
  res.json({ orders });
});

// 9. Order Status Update (e.g. MARK AS DISPATCHED)
router.put('/orders/:id/status', (req, res) => {
  const adminEmail = (req as any).adminEmail;
  const { status, reason } = req.body;

  const order = db.updateOrderStatus(req.params.id, status, reason, adminEmail);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order });
});

// 10. Store Settings
router.get('/settings', (req, res) => {
  res.json({ settings: db.getSettings() });
});

router.put('/settings', (req, res) => {
  const adminEmail = (req as any).adminEmail;
  const updated = db.updateSettings(req.body, adminEmail);
  res.json({ settings: updated });
});

// 11. Activity Logs
router.get('/audit-logs', (req, res) => {
  res.json({ logs: db.getActivityLogs() });
});

export default router;
