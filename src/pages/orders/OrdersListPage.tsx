import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { Table, Tag, type TableProps } from "antd";
import { useTranslation } from "react-i18next";
import { orderService } from "../../services/OrderService";
import { queryKeys } from "../../services/QueryClientManager";
import { useApp } from "../../hooks";
import { formatPrice } from "../../utils/i18nText";
import { ORDER_STATUS } from "../../models/consts";
import type { Order } from "../../models/entities";

const STATUS_COLOR: Record<ORDER_STATUS, string> = {
  [ORDER_STATUS.PENDING]: "gold",
  [ORDER_STATUS.CONFIRMED]: "green",
  [ORDER_STATUS.CANCELLED]: "red",
};

export const OrdersListPage = () => {
  const { t } = useTranslation();
  const { language } = useApp();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.ORDERS, page],
    queryFn: () => orderService.getAll({ page, limit: 10 }),
    keepPreviousData: true,
  });

  const columns: TableProps<Order>["columns"] = [
    {
      title: t("orders.orderId"),
      dataIndex: "_id",
      render: (id: string) => <Link to={`/orders/${id}`}>{id.slice(-8).toUpperCase()}</Link>,
    },
    {
      title: t("orders.client"),
      dataIndex: "client",
      render: (client: Order["client"]) => (typeof client === "object" ? client.email : client),
    },
    {
      title: t("orders.items"),
      dataIndex: "items",
      render: (items: Order["items"]) => items.reduce((sum, it) => sum + it.quantity, 0),
    },
    {
      title: t("orders.total"),
      dataIndex: "totalAmount",
      render: (v: number) => formatPrice(v, "MAD"),
    },
    {
      title: t("orders.status"),
      dataIndex: "status",
      render: (status: ORDER_STATUS) => <Tag color={STATUS_COLOR[status]}>{t(`orders.status.${status}`)}</Tag>,
    },
    {
      title: t("orders.date"),
      dataIndex: "createdAt",
      render: (d: string) => new Date(d).toLocaleDateString(language),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("orders.title")}</h1>
      <Table<Order>
        rowKey="_id"
        columns={columns}
        dataSource={data?.docs ?? []}
        loading={isLoading}
        pagination={{
          current: data?.page,
          total: data?.totalDocs,
          pageSize: data?.limit,
          onChange: setPage,
        }}
        scroll={{ x: true }}
      />
    </div>
  );
};
