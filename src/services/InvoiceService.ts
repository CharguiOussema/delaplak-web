import { apiService } from "./api";
import { QueryBuilder } from "./QueryBuilder";
import type { PaginationResponse } from "../models/ResponseType";
import type { Invoice } from "../models/entities";

class InvoiceService {
  private readonly base = "/api/invoices";

  async getAll(params: { page?: number; limit?: number }): Promise<PaginationResponse<Invoice>> {
    const url = QueryBuilder.generateURL(this.base)
      .setQueryParam("page", params.page)
      .setQueryParam("limit", params.limit)
      .build();
    return apiService.get<PaginationResponse<Invoice>>(url);
  }

  async getById(id: string): Promise<Invoice> {
    return apiService.get<Invoice>(`${this.base}/${id}`);
  }

  async downloadPdf(id: string, fileName: string): Promise<void> {
    const blob = await apiService.getBlob(`${this.base}/${id}/pdf`);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const invoiceService = new InvoiceService();
