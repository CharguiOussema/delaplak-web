import type { I18nText } from "../models/entities";
import type { Language } from "../contexts/AppContext";

export function localize(text: I18nText | undefined | null, lang: Language): string {
  if (!text) return "";
  return text[lang] || text.en || "";
}

export function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}

export function imageUrl(apiUrl: string, path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${apiUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}
