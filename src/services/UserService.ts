import { apiService } from "./api";
import { QueryBuilder } from "./QueryBuilder";
import type { PaginationResponse } from "../models/ResponseType";
import type { User } from "../models/entities";
import type { USER_ROLES } from "../models/consts";

export interface CreateUserPayload {
  email: string;
  password: string;
  role?: USER_ROLES;
}

export interface UpdateUserPayload {
  email?: string;
  role?: USER_ROLES;
  isActive?: boolean;
}

class UserService {
  private readonly base = "/api/users";

  async getAll(params: { page?: number; limit?: number; search?: string }): Promise<PaginationResponse<User>> {
    const url = QueryBuilder.generateURL(this.base)
      .setQueryParam("page", params.page)
      .setQueryParam("limit", params.limit)
      .setQueryParam("search", params.search)
      .build();
    return apiService.get<PaginationResponse<User>>(url);
  }

  async getById(id: string): Promise<User> {
    return apiService.get<User>(`${this.base}/${id}`);
  }

  async create(payload: CreateUserPayload): Promise<User> {
    return apiService.post<User>(this.base, payload);
  }

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    return apiService.patch<User>(`${this.base}/${id}`, payload);
  }

  async deactivate(id: string): Promise<User> {
    return apiService.patch<User>(`${this.base}/${id}/deactivate`);
  }
}

export const userService = new UserService();
