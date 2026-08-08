import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_URL, CONFIG, isDevelopment } from "../constants";

// -----------------------------------------------------------------------------------
// Deviation 3 (CRITICAL): the real backend's global error handler does
// `res.status(code).send(error.message)` — a *plain text string* body, not a JSON
// envelope like `{ message: "..." }`. ARCHITECTURE.md's ApiService was written for a
// JSON envelope, so `handleApiError`/`getApiErrorMessage` below are adapted to check,
// in order: string body -> JSON-shape `{message}` -> statusText -> generic fallback.
// -----------------------------------------------------------------------------------
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  timeout?: number;
  _retry?: boolean;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface AuthTokenManager {
  setToken(token: string): void;
  getToken(): string | null;
  clearToken(): void;
  hasToken(): boolean;
}

function extractServerMessage(data: unknown): string | undefined {
  if (typeof data === "string" && data.trim().length > 0) {
    return data;
  }
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return undefined;
}

// Requests that must never trigger the refresh-and-retry dance (deviation 4).
const AUTH_BYPASS_PATHS = ["/api/auth/refresh", "/api/auth/login", "/api/auth/signup"];

function isAuthBypassUrl(url?: string): boolean {
  if (!url) return false;
  return AUTH_BYPASS_PATHS.some((p) => url.includes(p));
}

// -----------------------------------------------------------------------------------
// Deviation 4: refresh-token flow. The refresh token itself travels as an httpOnly
// cookie (`refreshToken`, scoped to /api/auth) that JS cannot read, so `withCredentials`
// must be true globally for the cookie to be sent/received. Only the access token is
// kept client-side (memory + localStorage under `accessToken`).
// -----------------------------------------------------------------------------------
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(instance: AxiosInstance): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = instance
      .post<{ accessToken: string }>("/api/auth/refresh", {}, { withCredentials: true })
      .then((res) => {
        const token = res.data?.accessToken;
        if (token) {
          localStorage.setItem("accessToken", token);
          instance.defaults.headers.Authorization = `Bearer ${token}`;
        }
        return token ?? null;
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers && !(config as ApiRequestConfig).skipAuth) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (isDevelopment) {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
      }
      return config;
    },
    (error: AxiosError) => {
      if (isDevelopment) console.error("API Request Error:", error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (isDevelopment) {
        console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as ApiRequestConfig | undefined;

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isAuthBypassUrl(originalRequest.url)
      ) {
        originalRequest._retry = true;
        const newToken = await performRefresh(instance);
        if (newToken) {
          originalRequest.headers = originalRequest.headers || {};
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
          return instance.request(originalRequest);
        }
        // Refresh itself failed — clear session and bounce to the (now public) home page;
        // sign-in is a modal, not a route, so there's no dedicated /login to redirect to.
        localStorage.removeItem("accessToken");
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }

      if (isDevelopment) console.error("API Response Error:", error.response?.data ?? error.message);
      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClient = createApiInstance();

export class ApiService implements AuthTokenManager {
  private static instance: ApiService;
  private readonly api: AxiosInstance;

  private constructor() {
    this.api = apiClient;
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async get<T = unknown>(url: string, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.api.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  public async post<T = unknown, D = unknown>(url: string, data?: D, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  public async put<T = unknown, D = unknown>(url: string, data?: D, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  public async patch<T = unknown, D = unknown>(url: string, data?: D, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  public async delete<T = unknown>(url: string, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  public setToken(token: string): void {
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token provided");
    }
    localStorage.setItem("accessToken", token);
    this.api.defaults.headers.Authorization = `Bearer ${token}`;
  }

  public clearToken(): void {
    localStorage.removeItem("accessToken");
    delete this.api.defaults.headers.Authorization;
  }

  public getToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  public hasToken(): boolean {
    return this.getToken() !== null;
  }

  /** Downloads a binary resource (e.g. invoice PDF) as a Blob, carrying the Bearer header —
   *  needed because a plain `<a href>` cannot attach an Authorization header. */
  public async getBlob(url: string, config?: ApiRequestConfig): Promise<Blob> {
    try {
      const response = await this.api.get(url, { ...config, responseType: "blob" });
      return response.data as Blob;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  private handleApiError(error: AxiosError): Error {
    if (axios.isAxiosError(error)) {
      const serverMessage = extractServerMessage(error.response?.data);
      if (serverMessage) return new Error(serverMessage);
      if (error.response?.statusText) return new Error(error.response.statusText);
      if (error.message) return new Error(error.message);
    }
    return new Error("An unknown API error occurred");
  }

  public async request<T = unknown>(method: HttpMethod, url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    switch (method.toLowerCase()) {
      case "get":
        return this.get<T>(url, config);
      case "post":
        return this.post<T>(url, data, config);
      case "put":
        return this.put<T>(url, data, config);
      case "patch":
        return this.patch<T>(url, data, config);
      case "delete":
        return this.delete<T>(url, config);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}

export const apiService = ApiService.getInstance();
export { CONFIG as API_CONFIG };

export const createApiUrl = (endpoint: string): string => {
  if (!endpoint || typeof endpoint !== "string") {
    throw new Error("Valid endpoint is required");
  }
  return `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
};

export const isApiError = (error: unknown): error is AxiosError => {
  return typeof error === "object" && error !== null && "isAxiosError" in error;
};

// Deviation 3, mirrored here for call sites that catch a raw AxiosError instead of the
// Error thrown by ApiService (e.g. react-query's `error` field before ApiService wraps it).
export const getApiErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    const serverMessage = extractServerMessage(error.response?.data);
    if (serverMessage) return serverMessage;
    if (error.response?.statusText) return error.response.statusText;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unknown error occurred";
};
