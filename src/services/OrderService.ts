import { apiService } from "./api";
import { QueryBuilder } from "./QueryBuilder";
import type { PaginationResponse } from "../models/ResponseType";
import type { Order, Invoice } from "../models/entities";
import type { ORDER_STATUS } from "../models/consts";

class OrderService {
  private readonly base = "/api/orders";

  async create(): Promise<Order> {
    return apiService.post<Order>(this.base, {});
  }

  async getAll(params: { page?: number; limit?: number; status?: ORDER_STATUS }): Promise<PaginationResponse<Order>> {
    const url = QueryBuilder.generateURL(this.base)
      .setQueryParam("page", params.page)
      .setQueryParam("limit", params.limit)
      .setQueryParam("status", params.status)
      .build();
    return apiService.get<PaginationResponse<Order>>(url);
  }

  async getById(id: string): Promise<Order> {
    return apiService.get<Order>(`${this.base}/${id}`);
  }

  async confirm(id: string): Promise<{ order: Order; invoice: Invoice }> {
    return apiService.patch<{ order: Order; invoice: Invoice }>(`${this.base}/${id}/confirm`);
  }

  async cancel(id: string): Promise<Order> {
    return apiService.patch<Order>(`${this.base}/${id}/cancel`);
  }
}

export const orderService = new OrderService();
