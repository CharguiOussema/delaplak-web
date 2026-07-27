import { apiService } from "./api";
import type { Cart } from "../models/entities";

class CartService {
  private readonly base = "/api/cart";

  async getCart(): Promise<Cart> {
    return apiService.get<Cart>(this.base);
  }

  async addItem(productId: string, quantity: number): Promise<Cart> {
    // Backend's AddCartItemDto field is `product`, not `productId`.
    return apiService.post<Cart>(`${this.base}/items`, { product: productId, quantity });
  }

  async setItemQuantity(productId: string, quantity: number): Promise<Cart> {
    return apiService.patch<Cart>(`${this.base}/items/${productId}`, { quantity });
  }

  async removeItem(productId: string): Promise<Cart> {
    return apiService.delete<Cart>(`${this.base}/items/${productId}`);
  }

  async clear(): Promise<Cart> {
    return apiService.delete<Cart>(this.base);
  }
}

export const cartService = new CartService();
