/**
 * Cart service: all backend calls for the cart microservice.
 * Replace baseURL with your cart service URL (e.g. from env).
 * Set NEXT_PUBLIC_MOCK_CART=true to use mock data when backend is not ready.
 */

import axios from "axios";
import type {
  Cart,
  UpdateQuantityRequest,
  ApplyPromoRequest,
  ApplyPromoResponse,
} from "@/models/cart";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_CART_SERVICE_URL ?? "http://localhost:8080";

const useMockCart = () => process.env.NEXT_PUBLIC_MOCK_CART === "true";

const cartClient = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// When auth is done, add: cartClient.interceptors.request.use((config) => { config.headers.Authorization = `Bearer ${token}`; return config; });

function getMockCart(): Cart {
  return {
    id: "mock-cart-1",
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        name: "Classic Sourdough Boule",
        description: "Wild yeast, Handcrafted",
        unit: "500g",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAeU8vvks9bJYJdeN3Yy98t4QjZc-aO0q2pVdnzTklt9LqYLKC5mvA3vDhWAuIHVQkEtCWKxzY_TQuBsrUozkBxnY-qV__KO0Ok_vgYiX4kjIJsQJYjzIIBPb56nUATYfyTtqPhbcWhunF2qzGbumN0H3EcHNFcVtMoWX3HJz1dpEuf3xcX4ZoaQNvOc1zmxkdjNa84gjfe7N84pa1tgBLLFhC-dwPTS0-PQdbZjRBaMoXMubnxpnRvTQ8iD-z27lzgIfhY_XloJ2U",
        price: 8.5,
        quantity: 1,
      },
      {
        id: "item-2",
        productId: "prod-2",
        name: "Artisanal Cinnamon Rolls",
        description: "Organic Ceylon Cinnamon",
        unit: "4-Pack",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC3rAxzY8jugPPcCCv5HxU0YAURD9w8tS6qfrUIbeKMH3cPB4ipfnLLJHQWipqxdWubFF1oVXyqQ4cUI99Hf53uJUk91D-03EH89NQntn4oVYdmQSKvkVJYfT5Hm3IBdpe1ZF-dstz8RJGup8-BzXsoVY-ALRiEw3dJZy3uWa9g7TjQk9_BxtL-sjknu_llITm4XqjYy6rgf5BxvwpZiRRBx93S09JNgVec4LVQUKD-LjPdgDYOxs0ZWjEofOuWQc9nV3hT6Ru0S_U",
        price: 12,
        quantity: 2,
      },
      {
        id: "item-3",
        productId: "prod-3",
        name: "Pain au Chocolat",
        description: "70% Dark Chocolate",
        unit: "Single",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB_Rj0EZvsT6zci387qAfX_mfIe0HGDLApwajsXopzGFzrOMaGrlX1TLgkRuGeoIdrFcQHHyM4edM0LRYjINrAGx2te3POa-gyVJsnTfOOXPowAL69ClPYfQrjoM2WEeX1K8GFXj7GI649Vd1MOPX8VIIPTOxDAbjbp-1fLBqqHZQLV2gPuIHy5BEMIYl_dM1T7xRqXz6RHMPbvJQ1hwwZCcecBMD6iHso2vJZfvsycs-2QGQludwL9IFsWg2QwqRRQ5RwErBfCVhY",
        price: 4.5,
        quantity: 3,
      },
    ],
    summary: {
      subtotal: 46,
      delivery: 5.5,
      tax: 2.3,
      total: 53.8,
      message: "Free delivery for orders over $60. Add $14.00 more to qualify!",
    },
  };
}

/** Fetch current cart (e.g. GET /cart or /api/cart). */
export async function getCart(): Promise<Cart> {
  if (useMockCart()) return Promise.resolve(getMockCart());
  const { data } = await cartClient.get<Cart>("/cart");
  return data;
}

/** Update item quantity (e.g. PATCH /cart/items/:id or PUT body). */
export async function updateItemQuantity(
  payload: UpdateQuantityRequest
): Promise<Cart> {
  const { data } = await cartClient.patch<Cart>(
    `/cart/items/${payload.itemId}/quantity`,
    { quantity: payload.quantity }
  );
  return data;
}

/** Remove item from cart (e.g. DELETE /cart/items/:id). */
export async function removeItem(itemId: string): Promise<Cart> {
  const { data } = await cartClient.delete<Cart>(`/cart/items/${itemId}`);
  return data;
}

/** Apply promo code (e.g. POST /cart/promo). */
export async function applyPromoCode(
  payload: ApplyPromoRequest
): Promise<ApplyPromoResponse> {
  try {
    const { data } = await cartClient.post<{
      success: boolean;
      message?: string;
      summary?: Cart["summary"];
    }>("/cart/promo", payload);
    if (data.success && data.summary)
      return { success: true, summary: data.summary };
    return { success: false, message: data.message ?? "Invalid code" };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.message)
      return { success: false, message: err.response.data.message };
    return { success: false, message: "Invalid or expired code" };
  }
}
