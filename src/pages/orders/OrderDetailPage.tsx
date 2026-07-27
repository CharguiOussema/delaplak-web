import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Spin, Result, Button, Tag, Card, Descriptions, App as AntdApp, Popconfirm } from "antd";
import { CheckCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { orderService } from "../../services/OrderService";
import { queryKeys } from "../../services/QueryClientManager";
import { useApp, useAccess } from "../../hooks";
import { localize, formatPrice } from "../../utils/i18nText";
import { getErrorMessage } from "../../utils/errorHandling";
import { ORDER_STATUS } from "../../models/consts";
import type { Order, Invoice } from "../../models/entities";

const STATUS_COLOR: Record<ORDER_STATUS, string> = {
  [ORDER_STATUS.PENDING]: "gold",
  [ORDER_STATUS.CONFIRMED]: "green",
  [ORDER_STATUS.CANCELLED]: "red",
};

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useApp();
  const { canWrite } = useAccess();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();

  const { data: order, isLoading, error } = useQuery({
    queryKey: [queryKeys.ORDERS, id],
    queryFn: () => orderService.getById(id!),
    enabled: !!id,
  });

  const confirmOrder = useMutation<{ order: Order; invoice: Invoice }, unknown, void>({
    mutationFn: () => orderService.confirm(id!),
    onSuccess: (result) => {
      queryClient.invalidateQueries([queryKeys.ORDERS]);
      message.success(t("orders.confirmSuccess"));
      navigate(`/invoices/${result.invoice._id}`);
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !order) {
    return <Result status="404" title={t("orders.notFound")} extra={<Link to="/orders">{t("orders.title")}</Link>} />;
  }

  const canConfirm = canWrite("orders") && order.status === ORDER_STATUS.PENDING;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">
          {t("orders.orderId")} #{order._id.slice(-8).toUpperCase()}
        </h1>
        <Tag color={STATUS_COLOR[order.status]} className="text-sm px-3 py-1">
          {t(`orders.status.${order.status}`)}
        </Tag>
      </div>

      <Card className="mb-6">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label={t("orders.client")}>
            {typeof order.client === "object" ? order.client.email : order.client}
          </Descriptions.Item>
          <Descriptions.Item label={t("orders.date")}>{new Date(order.createdAt).toLocaleString(language)}</Descriptions.Item>
          {order.confirmedAt && (
            <Descriptions.Item label={t("orders.confirmedAt")}>{new Date(order.confirmedAt).toLocaleString(language)}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title={t("orders.items")} className="mb-6">
        <div className="divide-y divide-border">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{localize(item.name, language)}</div>
                <div className="text-sm text-muted-foreground">
                  {item.quantity} × {formatPrice(item.price, "MAD")}
                </div>
              </div>
              <div className="font-semibold">{formatPrice(item.price * item.quantity, "MAD")}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 mt-2 border-t border-border text-lg font-semibold">
          <span>{t("checkout.total")}</span>
          <span>{formatPrice(order.totalAmount, "MAD")}</span>
        </div>
      </Card>

      <div className="flex gap-3 flex-wrap">
        {canConfirm && (
          <Popconfirm title={t("orders.confirmConfirm")} onConfirm={() => confirmOrder.mutate()}>
            <Button type="primary" icon={<CheckCircleOutlined />} loading={confirmOrder.isLoading}>
              {t("orders.confirm")}
            </Button>
          </Popconfirm>
        )}
        {order.status === ORDER_STATUS.CONFIRMED && (
          <Button icon={<FileTextOutlined />} onClick={() => navigate("/invoices")}>
            {t("navigation.invoices")}
          </Button>
        )}
      </div>
    </div>
  );
};
