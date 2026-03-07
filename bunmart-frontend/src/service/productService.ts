import api from "./api";
import type {
  Product,
  Category,
  AddProductRequest,
  UpdateProductRequest,
  UpdateImageRequest,
} from "@/model/product";

const prefix = "/product";

export interface GetProductsParams {
  categoryId?: number;
  availableOnly?: boolean;
  sort?: string;
}

export async function getProducts(params?: GetProductsParams): Promise<Product[]> {
  const { data } = await api.get<Product[]>(`${prefix}/products`, { params });
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>(`${prefix}/categories`);
  return data;
}

export interface AddCategoryRequest {
  name: string;
  description?: string;
}

export async function addCategory(body: AddCategoryRequest): Promise<Category> {
  const { data } = await api.post<Category>(`${prefix}/categories`, body);
  return data;
}

export async function addProduct(body: AddProductRequest): Promise<Product> {
  const { data } = await api.post<Product>(`${prefix}/products`, body);
  return data;
}

export async function updateProduct(productId: string, body: UpdateProductRequest): Promise<Product> {
  const { data } = await api.put<Product>(`${prefix}/products/${productId}`, body);
  return data;
}

export async function deleteProduct(productId: string): Promise<void> {
  await api.delete(`${prefix}/products/${productId}`);
}

export async function updateProductImage(
  productId: string,
  body: UpdateImageRequest
): Promise<Product> {
  const { data } = await api.put<Product>(`${prefix}/products/${productId}/image`, body);
  return data;
}

export interface ProductImageResponse {
  imageBase64: string;
}

export async function getProductImage(productId: string): Promise<ProductImageResponse | null> {
  try {
    const { data } = await api.get<ProductImageResponse>(`${prefix}/products/${productId}/image`);
    return data?.imageBase64 != null ? data : null;
  } catch {
    return null;
  }
}
