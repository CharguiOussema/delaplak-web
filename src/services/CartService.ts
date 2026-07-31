import { apiService } from "./api";
import type { Cart, SelectedOption } from "../models/entities";

class CartService {
  private readonly base = "/api/cart";

  async getCart(): Promise<Cart> {
    return apiService.get<Cart>(this.base);
  }

  async addItem(productId: string, quantity: number, selectedOptions?: SelectedOption[]): Promise<Cart> {
    // Backend's AddCartItemDto field is `product`, not `productId`.
    return apiService.post<Cart>(`${this.base}/items`, { product: productId, quantity, selectedOptions });
  }

  // `itemId` targets a specific cart line — a product with several option combinations in
  // the cart occupies several lines, so productId alone can't disambiguate which to update.
  async setItemQuantity(itemId: string, quantity: number): Promise<Cart> {
    return apiService.patch<Cart>(`${this.base}/items/${itemId}`, { quantity });
  }

  async removeItem(itemId: string): Promise<Cart> {
    return apiService.delete<Cart>(`${this.base}/items/${itemId}`);
  }

  async clear(): Promise<Cart> {
    return apiService.delete<Cart>(this.base);
  }
}

export const cartService = new CartService();
