import { useQuery } from "react-query";
import { Card, Spin, Statistic, Table } from "antd";
import {
  ShoppingOutlined,
  AppstoreOutlined,
  TagsOutlined,
  FileTextOutlined,
  UserOutlined,
  WarningOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { dashboardService } from "../../../services/DashboardService";
import { queryKeys } from "../../../services/QueryClientManager";
import { useApp } from "../../../hooks";
import { BarList } from "../../../components/charts/BarList";
import { TrendBars } from "../../../components/charts/TrendBars";
import { CATEGORICAL_CHART_COLORS, SEQUENTIAL_CHART_COLOR, STATUS_CHART_COLORS } from "../../../theme/chartColors";
import { localize, formatPrice } from "../../../utils/i18nText";
import { palette } from "../../../theme/tokens";
import type { I18nText } from "../../../models/entities";

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: STATUS_CHART_COLORS.warning,
  CONFIRMED: STATUS_CHART_COLORS.good,
  CANCELLED: STATUS_CHART_COLORS.critical,
};

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { language } = useApp();

  const { data: stats, isLoading } = useQuery({
    queryKey: [queryKeys.DASHBOARD_STATS],
    queryFn: () => dashboardService.getStats(),
  });

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const kpis = [
    { key: "products", title: t("dashboard.kpi.products"), value: stats.products.total, icon: <AppstoreOutlined /> },
    { key: "stock", title: t("dashboard.kpi.totalStock"), value: stats.products.totalStock, icon: <ShoppingOutlined /> },
    {
      key: "lowStock",
      title: t("dashboard.kpi.lowStock"),
      value: stats.products.lowStockCount,
      icon: <WarningOutlined />,
      valueColor: stats.products.lowStockCount > 0 ? palette.warning[500] : undefined,
    },
    { key: "categories", title: t("dashboard.kpi.categories"), value: stats.categories.total, icon: <TagsOutlined /> },
    { key: "orders", title: t("dashboard.kpi.orders"), value: stats.orders.total, icon: <ShoppingOutlined /> },
    {
      key: "revenue",
      title: t("dashboard.kpi.revenue"),
      value: formatPrice(stats.orders.totalRevenue, stats.orders.currency),
      icon: <DollarOutlined />,
    },
    { key: "users", title: t("dashboard.kpi.users"), value: stats.users.total, icon: <UserOutlined /> },
    {
      key: "invoices",
      title: t("dashboard.kpi.invoices"),
      value: `${stats.invoices.total} · ${formatPrice(stats.invoices.totalAmount, stats.invoices.currency)}`,
      icon: <FileTextOutlined />,
    },
  ];

  const orderStatusItems = stats.orders.byStatus.map((s) => ({
    key: s.status,
    label: t(`orders.status.${s.status}`),
    value: s.count,
    color: ORDER_STATUS_COLORS[s.status] ?? SEQUENTIAL_CHART_COLOR,
  }));

  const categoryItems = stats.products.byCategory.map((c, i) => ({
    key: c.label,
    label: c.label,
    value: c.value,
    color: CATEGORICAL_CHART_COLORS[i % CATEGORICAL_CHART_COLORS.length],
  }));

  const roleItems = stats.users.byRole.map((r, i) => ({
    key: r.role,
    label: r.role,
    value: r.count,
    color: CATEGORICAL_CHART_COLORS[i % CATEGORICAL_CHART_COLORS.length],
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("navigation.dashboard")}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <Card key={kpi.key} size="small">
            <Statistic
              title={kpi.title}
              value={kpi.value}
              prefix={kpi.icon}
              valueStyle={kpi.valueColor ? { color: kpi.valueColor } : undefined}
            />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card title={t("dashboard.ordersTrend")}>
          <TrendBars data={stats.orders.trend} color={SEQUENTIAL_CHART_COLOR} />
        </Card>
        <Card title={t("dashboard.ordersByStatus")}>
          <BarList items={orderStatusItems} emptyLabel={t("dashboard.noData") as string} />
        </Card>
        <Card title={t("dashboard.productsByCategory")}>
          <BarList items={categoryItems} emptyLabel={t("dashboard.noData") as string} />
        </Card>
        <Card title={t("dashboard.usersByRole")}>
          <BarList items={roleItems} emptyLabel={t("dashboard.noData") as string} />
        </Card>
      </div>

      <Card title={t("dashboard.lowStockProducts")}>
        <Table
          rowKey="_id"
          size="small"
          pagination={false}
          dataSource={stats.lowStockProducts}
          locale={{ emptyText: t("dashboard.noLowStock") as string }}
          columns={[
            { title: t("products.name"), dataIndex: "name", render: (name: I18nText) => localize(name, language) },
            {
              title: t("products.stock"),
              dataIndex: "stock",
              width: 120,
              render: (stock: number) => <span style={{ color: palette.danger[500], fontWeight: 600 }}>{stock}</span>,
            },
          ]}
        />
      </Card>
    </div>
  );
};
