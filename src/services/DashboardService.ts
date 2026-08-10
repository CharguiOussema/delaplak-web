import { apiService } from "./api";
import type { DashboardStats } from "../models/entities";

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>("/api/dashboard/stats");
  }
}

export const dashboardService = new DashboardService();
