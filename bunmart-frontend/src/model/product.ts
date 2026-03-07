/**
 * Product and category types (mirrors backend DTOs).
 */

export interface Product {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  weight: string | null;
  availability: boolean | null;
  categoryId: number | null;
  hasImage: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface AddProductRequest {
  categoryId: number;
  name: string;
  imageBase64: string;
  description?: string;
  tags?: string[];
  weight?: string;
  availability?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  tags?: string[];
  weight?: string;
  availability?: boolean;
  categoryId?: number;
}

export interface UpdateImageRequest {
  imageBase64: string;
}
