import { apiService } from "./api";
import type { CtaSection, DecorsSection, HeroSection, I18nText, SiteSettings, StrengthsSection } from "../models/entities";

export interface UpdateSiteSettingsPayload {
  hero?: Partial<HeroSection>;
  strengthsSection?: Partial<StrengthsSection>;
  decorsSection?: Partial<DecorsSection>;
  cta?: Partial<CtaSection>;
}

class SiteSettingsService {
  private readonly base = "/api/site-settings";

  async get(): Promise<SiteSettings> {
    return apiService.get<SiteSettings>(this.base);
  }

  async update(payload: UpdateSiteSettingsPayload): Promise<SiteSettings> {
    return apiService.patch<SiteSettings>(this.base, payload);
  }

  async setHeroMainImage(file: File): Promise<SiteSettings> {
    const formData = new FormData();
    formData.append("image", file);
    return apiService.post<SiteSettings>(`${this.base}/hero/main-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async setHeroAccentImage(file: File): Promise<SiteSettings> {
    const formData = new FormData();
    formData.append("image", file);
    return apiService.post<SiteSettings>(`${this.base}/hero/accent-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async addStrength(text: I18nText): Promise<SiteSettings> {
    return apiService.post<SiteSettings>(`${this.base}/strengths`, { text });
  }

  async updateStrength(itemId: string, text: I18nText): Promise<SiteSettings> {
    return apiService.patch<SiteSettings>(`${this.base}/strengths/${itemId}`, { text });
  }

  async removeStrength(itemId: string): Promise<SiteSettings> {
    return apiService.delete<SiteSettings>(`${this.base}/strengths/${itemId}`);
  }

  async addDecor(title: I18nText): Promise<SiteSettings> {
    return apiService.post<SiteSettings>(`${this.base}/decors`, { title });
  }

  async updateDecor(itemId: string, title: I18nText): Promise<SiteSettings> {
    return apiService.patch<SiteSettings>(`${this.base}/decors/${itemId}`, { title });
  }

  async removeDecor(itemId: string): Promise<SiteSettings> {
    return apiService.delete<SiteSettings>(`${this.base}/decors/${itemId}`);
  }

  async setDecorImage(itemId: string, file: File): Promise<SiteSettings> {
    const formData = new FormData();
    formData.append("image", file);
    return apiService.post<SiteSettings>(`${this.base}/decors/${itemId}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
}

export const siteSettingsService = new SiteSettingsService();
