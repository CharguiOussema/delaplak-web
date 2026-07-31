import type { USER_ROLES, LANGUAGES, ORDER_STATUS } from "./consts";

export interface I18nText {
  en: string;
  fr: string;
  ar: string;
}

export interface User {
  _id: string;
  email: string;
  role: USER_ROLES;
  isActive: boolean;
  preferredLanguage: LANGUAGES;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: I18nText;
  description?: I18nText | null;
  slug: string;
  parent: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeNode {
  _id: string;
  name: I18nText;
  slug: string;
  children: CategoryTreeNode[];
}

export interface AttributeOption {
  _id: string;
  name: I18nText;
}

// Admin-managed vocabulary (e.g. Texture, Thickness, Dimensions). Carries no price — the
// price impact of an option is product-specific, see Product.attributeOptions below.
export interface ProductAttribute {
  _id: string;
  name: I18nText;
  slug: string;
  options: AttributeOption[];
  createdAt: string;
  updatedAt: string;
}

// One entry per option this product offers, with the price it adds (or, if negative,
// subtracts) when a client selects it. `attribute` is populated by the API.
export interface ProductAttributeSelection {
  attribute: ProductAttribute | string;
  option: string;
  priceAdjustment: number;
}

export interface Product {
  _id: string;
  name: I18nText;
  description: I18nText;
  images: string[];
  price: number;
  currency: string;
  attributeOptions: ProductAttributeSelection[];
  applicationDomains: string[];
  categories: (Category | string)[];
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface SelectedOption {
  attribute: string;
  option: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  selectedOptions: SelectedOption[];
  // Computed by the API (base price + matching attributeOptions adjustments); not stored.
  unitPrice: number;
}

export interface Cart {
  _id: string;
  client: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemSelectedOption {
  attributeName: I18nText;
  optionName: I18nText;
  priceAdjustment: number;
}

export interface OrderItem {
  product: string;
  name: I18nText;
  price: number;
  currency: string;
  quantity: number;
  selectedOptions: OrderItemSelectedOption[];
}

export interface Order {
  _id: string;
  client: User | string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: ORDER_STATUS;
  confirmedBy: User | string | null;
  confirmedAt: string | null;
  cancelledBy?: User | string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice {
  _id: string;
  // GET /:id populates both; GET / (list) leaves them as bare ids.
  order: Order | string;
  client: User | string;
  number: string;
  lines: InvoiceLine[];
  subtotal: number;
  total: number;
  currency: string;
  pdfPath: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}
