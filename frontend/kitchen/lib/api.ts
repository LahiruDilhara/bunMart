import { ProductionOrder, UpdatePhaseRequest, UpdateNotesRequest, AddImageRequest } from '@/types/kitchen';
import { mockOrders } from './mockData';

const USE_MOCK = true; // Set to false when connecting to real backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// In-memory mock store
let mockStore: ProductionOrder[] = JSON.parse(JSON.stringify(mockOrders));

function delay(ms = 300): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export const kitchenApi = {
  // GET /api/v1/production-orders
  async getAllOrders(): Promise<ProductionOrder[]> {
    if (USE_MOCK) {
      await delay();
      return [...mockStore];
    }
    const res = await fetch(`${BASE_URL}/production-orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  // GET /api/v1/production-orders/:id
  async getOrder(id: string): Promise<ProductionOrder> {
    if (USE_MOCK) {
      await delay();
      const order = mockStore.find(o => o.id === id);
      if (!order) throw new Error(`Order not found: ${id}`);
      return { ...order };
    }
    const res = await fetch(`${BASE_URL}/production-orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },

  // PUT /api/v1/production-orders/:id/phase
  async updatePhase(id: string, body: UpdatePhaseRequest): Promise<ProductionOrder> {
    if (USE_MOCK) {
      await delay();
      const idx = mockStore.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      mockStore[idx] = { ...mockStore[idx], ...body, updatedAt: new Date().toISOString() };
      return { ...mockStore[idx] };
    }
    const res = await fetch(`${BASE_URL}/production-orders/${id}/phase`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to update phase');
    return res.json();
  },

  // PUT /api/v1/production-orders/:id/notes
  async updateNotes(id: string, body: UpdateNotesRequest): Promise<ProductionOrder> {
    if (USE_MOCK) {
      await delay();
      const idx = mockStore.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      mockStore[idx] = { ...mockStore[idx], notes: body.notes, updatedAt: new Date().toISOString() };
      return { ...mockStore[idx] };
    }
    const res = await fetch(`${BASE_URL}/production-orders/${id}/notes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to update notes');
    return res.json();
  },

  // POST /api/v1/production-orders/:id/images
  async addImage(id: string, body: AddImageRequest): Promise<ProductionOrder> {
    if (USE_MOCK) {
      await delay();
      const idx = mockStore.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      const newImage = { id: `img-${Date.now()}`, imageUrl: body.imageUrl };
      mockStore[idx] = {
        ...mockStore[idx],
        images: [...mockStore[idx].images, newImage],
        updatedAt: new Date().toISOString(),
      };
      return { ...mockStore[idx] };
    }
    const res = await fetch(`${BASE_URL}/production-orders/${id}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to add image');
    return res.json();
  },

  // DELETE /api/v1/production-orders/:id/images/:imageId
  async deleteImage(orderId: string, imageId: string): Promise<ProductionOrder> {
    if (USE_MOCK) {
      await delay();
      const idx = mockStore.findIndex(o => o.id === orderId);
      if (idx === -1) throw new Error('Order not found');
      mockStore[idx] = {
        ...mockStore[idx],
        images: mockStore[idx].images.filter(img => img.id !== imageId),
        updatedAt: new Date().toISOString(),
      };
      return { ...mockStore[idx] };
    }
    const res = await fetch(`${BASE_URL}/production-orders/${orderId}/images/${imageId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete image');
    // Re-fetch since DELETE returns 200 with no body
    return this.getOrder(orderId);
  },

  // DELETE /api/v1/production-orders/:id
  async deleteOrder(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay();
      mockStore = mockStore.filter(o => o.id !== id);
      return;
    }
    const res = await fetch(`${BASE_URL}/production-orders/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete order');
  },
};
