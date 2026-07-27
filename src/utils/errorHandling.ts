// Deviation 3: the real backend sends a plain-text string error body
// (`res.status(code).send(error.message)`), not `{message: "..."}`. Every helper below
// checks the string-body shape first, then falls back to the JSON-envelope shape (for
// forward-compat / defensiveness), then statusText, then a generic fallback.
export const getErrorMessage = (error: unknown, fallbackMessage: string = "An unexpected error occurred"): string => {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: unknown; statusText?: string } }).response;
    const data = response?.data;
    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message: unknown }).message;
      if (typeof message === "string" && message.length > 0) return message;
    }
    if (response?.statusText) return response.statusText;
  }

  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") return message;
  }

  return fallbackMessage;
};

export const logError = (error: unknown, context?: string): void => {
  if (import.meta.env.DEV) {
    const prefix = context ? `[${context}]` : "[Error]";
    console.error(prefix, error);
  }
};

export const handleApiError = (error: unknown, operation: string): string => {
  logError(error, operation);
  return getErrorMessage(error, `Failed to ${operation}`);
};
