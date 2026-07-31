import { apiService } from "./api";
import { QueryBuilder } from "./QueryBuilder";
import type { PaginationResponse, FilterOption } from "../models/ResponseType";
import type { ProductAttribute, I18nText } from "../models/entities";

class ProductAttributeService {
  private readonly base = "/api/product-attributes";

  async getAll(params: { page?: number; limit?: number; search?: string }): Promise<PaginationResponse<ProductAttribute>> {
    const url = QueryBuilder.generateURL(this.base)
      .setQueryParam("page", params.page)
      .setQueryParam("limit", params.limit)
      .setQueryParam("search", params.search)
      .build();
    return apiService.get<PaginationResponse<ProductAttribute>>(url);
  }

  async getById(id: string): Promise<ProductAttribute> {
    return apiService.get<ProductAttribute>(`${this.base}/${id}`);
  }

  async filter(): Promise<FilterOption[]> {
    return apiService.get<FilterOption[]>(`${this.base}/filter`);
  }

  async create(payload: { name: Partial<I18nText>; options?: Partial<I18nText>[] }): Promise<ProductAttribute> {
    return apiService.post<ProductAttribute>(this.base, payload);
  }

  async update(id: string, payload: { name: Partial<I18nText> }): Promise<ProductAttribute> {
    return apiService.patch<ProductAttribute>(`${this.base}/${id}`, payload);
  }

  async remove(id: string): Promise<void> {
    await apiService.delete(`${this.base}/${id}`);
  }

  async addOption(id: string, name: Partial<I18nText>): Promise<ProductAttribute> {
    return apiService.post<ProductAttribute>(`${this.base}/${id}/options`, { name });
  }

  async updateOption(id: string, optionId: string, name: Partial<I18nText>): Promise<ProductAttribute> {
    return apiService.patch<ProductAttribute>(`${this.base}/${id}/options/${optionId}`, { name });
  }

  async removeOption(id: string, optionId: string): Promise<ProductAttribute> {
    return apiService.delete<ProductAttribute>(`${this.base}/${id}/options/${optionId}`);
  }
}

export const productAttributeService = new ProductAttributeService();
