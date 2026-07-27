import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { Table, type TableProps } from "antd";
import { useTranslation } from "react-i18next";
import { invoiceService } from "../../services/InvoiceService";
import { queryKeys } from "../../services/QueryClientManager";
import { useApp } from "../../hooks";
import { formatPrice } from "../../utils/i18nText";
import type { Invoice } from "../../models/entities";

export const InvoicesListPage = () => {
  const { t } = useTranslation();
  const { language } = useApp();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.INVOICES, page],
    queryFn: () => invoiceService.getAll({ page, limit: 10 }),
    keepPreviousData: true,
  });

  const columns: TableProps<Invoice>["columns"] = [
    { title: t("invoices.number"), dataIndex: "number", render: (n: string, r) => <Link to={`/invoices/${r._id}`}>{n}</Link> },
    { title: t("invoices.total"), dataIndex: "total", render: (v: number) => formatPrice(v, "MAD") },
    { title: t("invoices.issuedAt"), dataIndex: "issuedAt", render: (d: string) => new Date(d).toLocaleDateString(language) },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("navigation.invoices")}</h1>
      <Table<Invoice>
        rowKey="_id"
        columns={columns}
        dataSource={data?.docs ?? []}
        loading={isLoading}
        pagination={{ current: data?.page, total: data?.totalDocs, pageSize: data?.limit, onChange: setPage }}
        scroll={{ x: true }}
      />
    </div>
  );
};
