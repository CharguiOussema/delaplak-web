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
  slug: string;
  parent: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeNode {
  _id: string;
  name: I18nText;
  slug: string;
  children: CategoryTreeNode[];
}

export interface Product {
  _id: string;
  name: I18nText;
  description: I18nText;
  images: string[];
  price: number;
  currency: string;
  dimensions: string;
  thickness: string;
  texture: string;
  applicationDomains: string[];
  category: Category | string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  client: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  name: I18nText;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  client: User | string;
  items: OrderItem[];
  totalAmount: number;
  status: ORDER_STATUS;
  confirmedBy: User | string | null;
  confirmedAt: string | null;
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
  pdfPath: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}
