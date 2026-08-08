import { Link, useNavigate } from "react-router-dom";
import { Button, Empty, InputNumber, Spin, App as AntdApp, Popconfirm, Tag } from "antd";
import { DeleteOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useApp, useAuth, useAuthModal, useCart } from "../../hooks";
import { localize, formatPrice, imageUrl } from "../../utils/i18nText";
import { API_URL } from "../../constants";
import { getErrorMessage } from "../../utils/errorHandling";
import type { CartItem, ProductAttribute } from "../../models/entities";
import type { Language } from "../../contexts/AppContext";

// Selected options only carry (attribute, option) ids — their display names live on the
// populated product.attributeOptions[].attribute (a ProductAttribute doc with its options).
function describeSelectedOptions(item: CartItem, language: Language): string[] {
  return item.selectedOptions.map((selection) => {
    const configured = item.product.attributeOptions.find(
      (entry) => (typeof entry.attribute === "object" ? entry.attribute._id : entry.attribute) === selection.attribute,
    );
    const attribute = typeof configured?.attribute === "object" ? (configured.attribute as ProductAttribute) : undefined;
    const option = attribute?.options.find((o) => o._id === selection.option);
    return option ? localize(option.name, language) : selection.option;
  });
}

export const CartPage = () => {
  const { t } = useTranslation();
  const { language } = useApp();
  const { isAuthenticated } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();

  const { cart, isLoading, setItemQuantity, removeItem, clear } = useCart();
  const onError = (err: unknown) => { message.error(getErrorMessage(err)); };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      openAuthModal("login", () => navigate("/checkout"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const items = cart?.items ?? [];
  const total = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("cart.title")}</h1>

      {items.length === 0 ? (
        <Empty description={t("cart.empty")}>
          <Link to="/">
            <Button type="primary">{t("cart.continueShopping")}</Button>
          </Link>
        </Empty>
      ) : (
        <>
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 p-4">
                <Link to={`/products/${item.product._id}`} className="w-20 h-20 shrink-0 bg-muted rounded-md overflow-hidden">
                  {item.product.images[0] && (
                    <img src={imageUrl(API_URL, item.product.images[0])} alt="" className="w-full h-full object-cover" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product._id}`} className="font-medium hover:text-primary line-clamp-1">
                    {localize(item.product.name, language)}
                  </Link>
                  <div className="text-sm text-muted-foreground">{formatPrice(item.unitPrice, item.product.currency)}</div>
                  {item.selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {describeSelectedOptions(item, language).map((label, i) => (
                        <Tag key={i}>{label}</Tag>
                      ))}
                    </div>
                  )}
                </div>
                <InputNumber
                  min={1}
                  max={item.product.stock}
                  value={item.quantity}
                  onChange={(v) => v && setItemQuantity.mutate({ itemId: item._id, quantity: v }, { onError })}
                />
                <div className="w-24 text-end font-semibold">{formatPrice(item.unitPrice * item.quantity, item.product.currency)}</div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeItem.mutate(item._id, { onError })}
                  loading={removeItem.isLoading}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <Popconfirm title={t("cart.clearConfirm")} onConfirm={() => clear.mutate(undefined, { onError })}>
              <Button danger>{t("cart.clear")}</Button>
            </Popconfirm>
            <div className="text-end">
              <div className="text-lg font-semibold mb-2">
                {t("cart.total")}: {formatPrice(total, items[0]?.product.currency || "MAD")}
              </div>
              <Button type="primary" size="large" icon={<ShoppingOutlined />} onClick={handleCheckout}>
                {t("cart.checkout")}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
