import { QueryClient } from "react-query";

export const queryKeys = {
  CURRENT_USER: "currentUser",
  FILTERS: "filters",
  USERS: "users",
  CATEGORIES: "categories",
  CATEGORIES_TREE: "categoriesTree",
  CATEGORIES_FILTER: "categoriesFilter",
  PRODUCTS: "products",
  PRODUCTS_FILTER: "productsFilter",
  CART: "cart",
  ORDERS: "orders",
  INVOICES: "invoices",
} as const;

class QueryClientManager {
  private static instance: QueryClientManager;
  private queryClient: QueryClient;

  private constructor() {
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false, retry: 1 },
        mutations: { retry: 0 },
      },
    });
  }

  public static getInstance(): QueryClientManager {
    if (!QueryClientManager.instance) {
      QueryClientManager.instance = new QueryClientManager();
    }
    return QueryClientManager.instance;
  }

  public getQueryClient(): QueryClient {
    return this.queryClient;
  }

  public invalidateQueries(queryKey: string | string[]): Promise<void> {
    return this.queryClient.invalidateQueries(queryKey);
  }

  public refetchQueries(queryKey: string | string[]): Promise<void> {
    return this.queryClient.refetchQueries(queryKey);
  }

  public removeQueries(queryKey: string | string[]): void {
    this.queryClient.removeQueries(queryKey);
  }

  public clear(): void {
    this.queryClient.clear();
  }
}

export const queryClientManager = QueryClientManager.getInstance();
