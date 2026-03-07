import api from "./api";
import type {
  PricingProduct,
  CreatePricingProductRequest,
  UpdatePricingProductRequest,
  Discount,
  CreateDiscountRequest,
  UpdateDiscountRequest,
  Coupon,
  CreateCouponRequest,
  UpdateCouponRequest,
  CalculatePriceRequest,
  CalculatePriceResponse,
} from "@/model/pricing";

const prefix = "/pricing";

export async function getPricingProducts(): Promise<PricingProduct[]> {
  const { data } = await api.get<PricingProduct[]>(`${prefix}/products`);
  return data;
}

export async function getPricingProduct(id: string): Promise<PricingProduct> {
  const { data } = await api.get<PricingProduct>(`${prefix}/products/${id}`);
  return data;
}

export async function createPricingProduct(
  body: CreatePricingProductRequest
): Promise<PricingProduct> {
  const { data } = await api.post<PricingProduct>(`${prefix}/products`, body);
  return data;
}

export async function updatePricingProduct(
  id: string,
  body: UpdatePricingProductRequest
): Promise<PricingProduct> {
  const { data } = await api.put<PricingProduct>(`${prefix}/products/${id}`, body);
  return data;
}

export async function deletePricingProduct(id: string): Promise<void> {
  await api.delete(`${prefix}/products/${id}`);
}

export async function getDiscounts(): Promise<Discount[]> {
  const { data } = await api.get<Discount[]>(`${prefix}/discounts`);
  return data;
}

export async function getDiscount(id: number): Promise<Discount> {
  const { data } = await api.get<Discount>(`${prefix}/discounts/${id}`);
  return data;
}

export async function createDiscount(
  body: CreateDiscountRequest
): Promise<Discount> {
  const { data } = await api.post<Discount>(`${prefix}/discounts`, body);
  return data;
}

export async function updateDiscount(
  id: number,
  body: UpdateDiscountRequest
): Promise<Discount> {
  const { data } = await api.put<Discount>(`${prefix}/discounts/${id}`, body);
  return data;
}

export async function deleteDiscount(id: number): Promise<void> {
  await api.delete(`${prefix}/discounts/${id}`);
}

export async function getCoupons(): Promise<Coupon[]> {
  const { data } = await api.get<Coupon[]>(`${prefix}/coupons`);
  return data;
}

export async function getCoupon(id: number): Promise<Coupon> {
  const { data } = await api.get<Coupon>(`${prefix}/coupons/${id}`);
  return data;
}

export async function createCoupon(body: CreateCouponRequest): Promise<Coupon> {
  const { data } = await api.post<Coupon>(`${prefix}/coupons`, body);
  return data;
}

export async function updateCoupon(
  id: number,
  body: UpdateCouponRequest
): Promise<Coupon> {
  const { data } = await api.put<Coupon>(`${prefix}/coupons/${id}`, body);
  return data;
}

export async function deleteCoupon(id: number): Promise<void> {
  await api.delete(`${prefix}/coupons/${id}`);
}

export async function calculatePrice(
  body: CalculatePriceRequest
): Promise<CalculatePriceResponse> {
  const { data } = await api.post<CalculatePriceResponse>(`${prefix}/calculate`, body);
  return data;
}
