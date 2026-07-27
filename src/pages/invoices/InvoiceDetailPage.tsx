import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import { Spin, Result, Button, Card, Table, App as AntdApp } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { invoiceService } from "../../services/InvoiceService";
import { queryKeys } from "../../services/QueryClientManager";
import { useApp } from "../../hooks";
import { formatPrice } from "../../utils/i18nText";
import { getErrorMessage } from "../../utils/errorHandling";
import type { InvoiceLine } from "../../models/entities";

export const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useApp();
  const { message } = AntdApp.useApp();
  const [downloading, setDownloading] = useState(false);

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: [queryKeys.INVOICES, id],
    queryFn: () => invoiceService.getById(id!),
    enabled: !!id,
  });

  const handleDownload = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await invoiceService.downloadPdf(invoice._id, invoice.number);
    } catch (err) {
      message.error(getErrorMessage(err, t("invoices.downloadError") as string));
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !invoice) {
    return <Result status="404" title={t("invoices.notFound")} extra={<Link to="/orders">{t("orders.title")}</Link>} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{invoice.number}</h1>
        <Button type="primary" icon={<DownloadOutlined />} loading={downloading} onClick={handleDownload}>
          {t("invoices.downloadPdf")}
        </Button>
      </div>

      <Card className="mb-6">
        <p className="text-sm text-muted-foreground">
          {t("invoices.issuedAt")}: {new Date(invoice.issuedAt).toLocaleString(language)}
        </p>
      </Card>

      <Card title={t("invoices.lines")}>
        <Table<InvoiceLine>
          rowKey="description"
          dataSource={invoice.lines}
          pagination={false}
          columns={[
            { title: t("invoices.description"), dataIndex: "description" },
            { title: t("invoices.quantity"), dataIndex: "quantity" },
            { title: t("invoices.unitPrice"), dataIndex: "unitPrice", render: (v: number) => formatPrice(v, "MAD") },
            { title: t("invoices.lineTotal"), dataIndex: "lineTotal", render: (v: number) => formatPrice(v, "MAD") },
          ]}
        />
        <div className="flex justify-end gap-8 pt-4 mt-2 border-t border-border text-sm">
          <div className="text-end">
            <div className="text-muted-foreground">{t("invoices.subtotal")}</div>
            <div className="font-semibold text-base">{formatPrice(invoice.subtotal, "MAD")}</div>
          </div>
          <div className="text-end">
            <div className="text-muted-foreground">{t("invoices.total")}</div>
            <div className="font-semibold text-base text-primary">{formatPrice(invoice.total, "MAD")}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
