import type { Cart, Product, SelectedOption } from "../models/entities";

// Anonymous shoppers get a cart persisted in localStorage instead of the server-backed
// one (backend's /api/cart requires a signed-in CLIENT). Same `Cart` shape so every
// component that renders a cart doesn't need to branch on auth state.
const STORAGE_KEY = "guestCart";

function emptyCart(): Cart {
  return { _id: "guest-cart", client: "guest", items: [], createdAt: "", updatedAt: "" };
}

function sortedOptionsKey(options: SelectedOption[]): string {
  return [...options]
    .map((o) => `${o.attribute}:${o.option}`)
    .sort()
    .join("|");
}

function computeUnitPrice(product: Product, selectedOptions: SelectedOption[]): number {
  return selectedOptions.reduce((sum, selection) => {
    const match = product.attributeOptions.find(
      (entry) =>
        (typeof entry.attribute === "object" ? entry.attribute._id : entry.attribute) === selection.attribute &&
        entry.option === selection.option,
    );
    return sum + (match?.priceAdjustment ?? 0);
  }, product.price);
}

function read(): Cart {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Cart) : emptyCart();
  } catch {
    return emptyCart();
  }
}

function write(cart: Cart): Cart {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  return cart;
}

class GuestCartService {
  getCart(): Cart {
    return read();
  }

  addItem(product: Product, quantity: number, selectedOptions: SelectedOption[] = []): Cart {
    const cart = read();
    const key = sortedOptionsKey(selectedOptions);
    const existing = cart.items.find((item) => item.product._id === product._id && sortedOptionsKey(item.selectedOptions) === key);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        _id: `guest-${product._id}-${key}`,
        product,
        quantity,
        selectedOptions,
        unitPrice: computeUnitPrice(product, selectedOptions),
      });
    }
    return write(cart);
  }

  setItemQuantity(itemId: string, quantity: number): Cart {
    const cart = read();
    cart.items = cart.items.map((item) => (item._id === itemId ? { ...item, quantity } : item));
    return write(cart);
  }

  removeItem(itemId: string): Cart {
    const cart = read();
    cart.items = cart.items.filter((item) => item._id !== itemId);
    return write(cart);
  }

  clear(): Cart {
    return write(emptyCart());
  }
}

export const guestCartService = new GuestCartService();
