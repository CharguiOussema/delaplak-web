import { useMutation, useQuery, useQueryClient } from "react-query";
import { cartService } from "../services/CartService";
import { guestCartService } from "../services/GuestCartService";
import { queryKeys } from "../services/QueryClientManager";
import { useAuth } from "./useAuth";
import { USER_ROLES } from "../models/consts";
import type { Cart, Product, SelectedOption } from "../models/entities";

interface AddItemArgs {
  product: Product;
  quantity: number;
  selectedOptions?: SelectedOption[];
}

// Single cart surface used by every screen: server-backed cart for signed-in CLIENTs,
// localStorage-backed cart for guests, empty for staff (backend's cart router is
// CLIENT_ONLY) — so pages don't have to branch on auth state themselves.
export function useCart() {
  const { user } = useAuth();
  const useServerCart = user?.role === USER_ROLES.CLIENT;
  const isStaff = user?.role === USER_ROLES.ADMIN;
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery<Cart>({
    queryKey: [queryKeys.CART, useServerCart],
    queryFn: () => (useServerCart ? cartService.getCart() : Promise.resolve(guestCartService.getCart())),
    enabled: !isStaff,
  });

  const invalidate = () => queryClient.invalidateQueries([queryKeys.CART]);

  const addItem = useMutation<Cart, unknown, AddItemArgs>({
    mutationFn: ({ product, quantity, selectedOptions = [] }) =>
      useServerCart
        ? cartService.addItem(product._id, quantity, selectedOptions)
        : Promise.resolve(guestCartService.addItem(product, quantity, selectedOptions)),
    onSuccess: invalidate,
  });

  const setItemQuantity = useMutation<Cart, unknown, { itemId: string; quantity: number }>({
    mutationFn: ({ itemId, quantity }) =>
      useServerCart ? cartService.setItemQuantity(itemId, quantity) : Promise.resolve(guestCartService.setItemQuantity(itemId, quantity)),
    onSuccess: invalidate,
  });

  const removeItem = useMutation<Cart, unknown, string>({
    mutationFn: (itemId) => (useServerCart ? cartService.removeItem(itemId) : Promise.resolve(guestCartService.removeItem(itemId))),
    onSuccess: invalidate,
  });

  const clear = useMutation<Cart, unknown, void>({
    mutationFn: () => (useServerCart ? cartService.clear() : Promise.resolve(guestCartService.clear())),
    onSuccess: invalidate,
  });

  return { cart, isLoading, addItem, setItemQuantity, removeItem, clear };
}

// Pushes any items added while browsing as a guest into the freshly-authenticated
// user's server cart, then clears local storage. Best-effort: a failed line item is
// skipped rather than blocking login.
export async function mergeGuestCartIntoServer(): Promise<void> {
  const guestCart = guestCartService.getCart();
  if (guestCart.items.length === 0) return;

  for (const item of guestCart.items) {
    try {
      await cartService.addItem(item.product._id, item.quantity, item.selectedOptions);
    } catch {
      // skip items the server rejects (e.g. now out of stock) — don't block login
    }
  }
  guestCartService.clear();
}
