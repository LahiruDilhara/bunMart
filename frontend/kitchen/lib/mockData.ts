import { ProductionOrder } from '@/types/kitchen';

export const mockOrders: ProductionOrder[] = [
  {
    id: 'po-001',
    userOrderId: 'ord-abc-001',
    phase: 'PREPARING',
    progressPercent: 25,
    notes: 'Customer requested extra sauce. Handle with care.',
    lines: [
      { productId: 'BURGER', quantity: 2 },
      { productId: 'FRIES-LARGE', quantity: 2 },
    ],
    images: [
      { id: 'img-001', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
    ],
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'po-002',
    userOrderId: 'ord-abc-002',
    phase: 'BAKING',
    progressPercent: 65,
    notes: null,
    lines: [
      { productId: 'PIZZA-MARGHERITA', quantity: 1 },
      { productId: 'GARLIC-BREAD', quantity: 1 },
      { productId: 'bun', quantity: 2 },
    ],
    images: [
      { id: 'img-002', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
      { id: 'img-003', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
    ],
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'po-003',
    userOrderId: 'ord-abc-003',
    phase: 'COMPLETED',
    progressPercent: 100,
    notes: 'VIP customer — fast lane priority.',
    lines: [
      { productId: 'STEAK-RIBEYE', quantity: 1 },
      { productId: 'SALAD-CAESAR', quantity: 1 },
    ],
    images: [],
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'po-004',
    userOrderId: 'ord-abc-004',
    phase: 'PREPARING',
    progressPercent: 10,
    notes: null,
    lines: [
      { productId: 'PASTA-CARBONARA', quantity: 3 },
      { productId: 'TIRAMISU', quantity: 3 },
    ],
    images: [],
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  {
    id: 'po-005',
    userOrderId: 'ord-abc-005',
    phase: 'BAKING',
    progressPercent: 80,
    notes: 'No nuts — allergy.',
    lines: [
      { productId: 'CAKE-CHOCOLATE', quantity: 1 },
      { productId: 'ICE-CREAM-VANILLA', quantity: 2 },
    ],
    images: [
      { id: 'img-004', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
    ],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];
