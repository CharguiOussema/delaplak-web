import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button, Empty, Spin, Card, App as AntdApp } from "antd";
import { useTranslation } from "react-i18next";
import { cartService } from "../../services/CartService";
import { orderService } from "../../services/OrderService";
import { queryKeys } from "../../services/QueryClientManager";
import { useApp, useAuth } from "../../hooks";
import { localize, formatPrice, imageUrl } from "../../utils/i18nText";
import { API_URL } from "../../constants";
import { getErrorMessage } from "../../utils/errorHandling";
import type { Order } from "../../models/entities";

export const CheckoutPage = () => {
  const { t } = useTranslation();
  const { language } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();

  const { data: cart, isLoading } = useQuery({
    queryKey: [queryKeys.CART],
    queryFn: () => cartService.getCart(),
  });

  const placeOrder = useMutation<Order, unknown, void>({
    mutationFn: () => orderService.create(),
    onSuccess: (order) => {
      queryClient.invalidateQueries([queryKeys.CART]);
      message.success(t("checkout.orderPlaced"));
      navigate(`/orders/${order._id}`);
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

  const items = cart?.items ?? [];
  const total = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Empty description={t("cart.empty")}>
          <Link to="/">
            <Button type="primary">{t("cart.continueShopping")}</Button>
          </Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("checkout.title")}</h1>

      <Card title={t("checkout.reviewOrder")} className="mb-6">
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-4 py-3">
              <div className="w-14 h-14 shrink-0 bg-muted rounded-md overflow-hidden">
                {item.product.images[0] && (
                  <img src={imageUrl(API_URL, item.product.images[0])} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{localize(item.product.name, language)}</div>
                <div className="text-sm text-muted-foreground">
                  {item.quantity} × {formatPrice(item.unitPrice, item.product.currency)}
                </div>
              </div>
              <div className="font-semibold">{formatPrice(item.unitPrice * item.quantity, item.product.currency)}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 mt-2 border-t border-border text-lg font-semibold">
          <span>{t("checkout.total")}</span>
          <span>{formatPrice(total, items[0]?.product.currency || "MAD")}</span>
        </div>
      </Card>

      <Card title={t("checkout.customer")} className="mb-6">
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </Card>

      <Button type="primary" size="large" block loading={placeOrder.isLoading} onClick={() => placeOrder.mutate()}>
        {t("checkout.placeOrder")}
      </Button>
    </div>
  );
};
