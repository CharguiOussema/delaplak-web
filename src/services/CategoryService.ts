import { apiService } from "./api";
import { QueryBuilder } from "./QueryBuilder";
import type { PaginationResponse, FilterOption } from "../models/ResponseType";
import type { Category, CategoryTreeNode, I18nText } from "../models/entities";

export interface CategoryPayload {
  name: Partial<I18nText>;
  description?: Partial<I18nText>;
  parent?: string | null;
}

class CategoryService {
  private readonly base = "/api/categories";

  async getAll(params: { page?: number; limit?: number; search?: string }): Promise<PaginationResponse<Category>> {
    const url = QueryBuilder.generateURL(this.base)
      .setQueryParam("page", params.page)
      .setQueryParam("limit", params.limit)
      .setQueryParam("search", params.search)
      .build();
    return apiService.get<PaginationResponse<Category>>(url);
  }

  async getById(id: string): Promise<Category> {
    return apiService.get<Category>(`${this.base}/${id}`);
  }

  async tree(): Promise<CategoryTreeNode[]> {
    return apiService.get<CategoryTreeNode[]>(`${this.base}/tree`);
  }

  async filter(): Promise<FilterOption[]> {
    return apiService.get<FilterOption[]>(`${this.base}/filter`);
  }

  async create(payload: CategoryPayload): Promise<Category> {
    return apiService.post<Category>(this.base, payload);
  }

  async update(id: string, payload: Partial<CategoryPayload>): Promise<Category> {
    return apiService.patch<Category>(`${this.base}/${id}`, payload);
  }

  async remove(id: string): Promise<void> {
    await apiService.delete(`${this.base}/${id}`);
  }
}

export const categoryService = new CategoryService();
