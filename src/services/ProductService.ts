import { apiService } from "./api";
import { QueryBuilder } from "./QueryBuilder";
import type { PaginationResponse, FilterOption } from "../models/ResponseType";
import type { Product, I18nText } from "../models/entities";

export interface ProductAttributeSelectionPayload {
  attribute: string;
  option: string;
  priceAdjustment: number;
}

export interface ProductPayload {
  name: I18nText;
  description: I18nText;
  price: number;
  currency?: string;
  attributeOptions?: ProductAttributeSelectionPayload[];
  applicationDomains?: string[];
  categories: string[];
  stock?: number;
}

class ProductService {
  private readonly base = "/api/products";

  async getAll(params: { page?: number; limit?: number; search?: string; category?: string }): Promise<PaginationResponse<Product>> {
    const url = QueryBuilder.generateURL(this.base)
      .setQueryParam("page", params.page)
      .setQueryParam("limit", params.limit)
      .setQueryParam("search", params.search)
      .setQueryParam("category", params.category)
      .build();
    return apiService.get<PaginationResponse<Product>>(url);
  }

  async getById(id: string): Promise<Product> {
    return apiService.get<Product>(`${this.base}/${id}`);
  }

  async filter(): Promise<FilterOption[]> {
    return apiService.get<FilterOption[]>(`${this.base}/filter`);
  }

  async create(payload: ProductPayload): Promise<Product> {
    return apiService.post<Product>(this.base, payload);
  }

  async update(id: string, payload: Partial<ProductPayload>): Promise<Product> {
    return apiService.patch<Product>(`${this.base}/${id}`, payload);
  }

  async remove(id: string): Promise<void> {
    await apiService.delete(`${this.base}/${id}`);
  }

  async addImages(id: string, files: File[]): Promise<Product> {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return apiService.post<Product>(`${this.base}/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async removeImage(id: string, path: string): Promise<Product> {
    return apiService.delete<Product>(`${this.base}/${id}/images`, { data: { path } });
  }
}

export const productService = new ProductService();
