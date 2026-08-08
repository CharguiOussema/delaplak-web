import { apiService } from "./api";
import type { User } from "../models/entities";
import type { LANGUAGES } from "../models/consts";

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private readonly base = "/api/auth";

  async signup(payload: { email: string; password: string; fullName: string; phone: string }): Promise<AuthResponse> {
    return apiService.post<AuthResponse>(`${this.base}/signup`, payload, { skipAuth: true });
  }

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    return apiService.post<AuthResponse>(`${this.base}/login`, payload, { skipAuth: true });
  }

  async me(): Promise<User> {
    return apiService.get<User>(`${this.base}/me`);
  }

  async updateProfile(payload: { email?: string; fullName?: string; phone?: string; preferredLanguage?: LANGUAGES }): Promise<User> {
    return apiService.patch<User>(`${this.base}/me`, payload);
  }

  // Web relies solely on the httpOnly cookie for the refresh token (deviation 4) — the
  // interceptor in services/api.ts calls this directly on 401, this method exists for
  // any explicit/manual refresh call sites.
  async refresh(): Promise<{ accessToken: string }> {
    return apiService.post<{ accessToken: string }>(`${this.base}/refresh`, {}, { skipAuth: true });
  }

  async logout(): Promise<void> {
    // Cookie carries the refresh token server-side; body is intentionally empty since
    // web JS cannot read the httpOnly cookie to resend it explicitly.
    await apiService.post(`${this.base}/logout`, {});
  }

  async updatePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiService.patch(`${this.base}/password`, payload);
  }

  async forgotPassword(payload: { email: string }): Promise<void> {
    await apiService.post(`${this.base}/forgot-password`, payload, { skipAuth: true });
  }

  async resetPassword(payload: { token: string; newPassword: string }): Promise<void> {
    await apiService.post(`${this.base}/reset-password`, payload, { skipAuth: true });
  }
}

export const authService = new AuthService();
