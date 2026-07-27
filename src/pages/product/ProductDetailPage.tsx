import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Spin, Result, Button, InputNumber, Tag, App as AntdApp, Breadcrumb } from "antd";
import { ShoppingCartOutlined, LeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { productService } from "../../services/ProductService";
import { cartService } from "../../services/CartService";
import { queryKeys } from "../../services/QueryClientManager";
import { useApp, useAuth } from "../../hooks";
import { localize, formatPrice, imageUrl } from "../../utils/i18nText";
import { API_URL } from "../../constants";
import { getErrorMessage } from "../../utils/errorHandling";
import { USER_ROLES } from "../../models/consts";
import type { Category, Cart } from "../../models/entities";

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: [queryKeys.PRODUCTS, id],
    queryFn: () => productService.getById(id!),
    enabled: !!id,
  });

  const addToCart = useMutation<Cart, unknown, void>({
    mutationFn: () => cartService.addItem(id!, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.CART]);
      message.success(t("product.addedToCart"));
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

  if (error || !product) {
    return <Result status="404" title={t("product.notFound")} extra={<Link to="/">{t("catalog.title")}</Link>} />;
  }

  const category = typeof product.category === "object" ? (product.category as Category) : null;
  const isClient = user?.role === USER_ROLES.CLIENT;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Breadcrumb
        className="mb-6"
        items={[
          { title: <Link to="/">{t("catalog.title")}</Link> },
          ...(category ? [{ title: <Link to={`/?category=${category._id}`}>{localize(category.name, language)}</Link> }] : []),
          { title: localize(product.name, language) },
        ]}
      />

      <Button type="text" icon={<LeftOutlined />} onClick={() => navigate(-1)} className="mb-4 ps-0">
        {t("common.back")}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3 border border-border">
            {product.images.length > 0 ? (
              <img
                src={imageUrl(API_URL, product.images[activeImage])}
                alt={localize(product.name, language)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">{t("catalog.noImage")}</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 ${
                    idx === activeImage ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={imageUrl(API_URL, img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{localize(product.name, language)}</h1>
          <div className="text-2xl font-semibold text-primary mb-4">{formatPrice(product.price, product.currency)}</div>

          <div className="flex flex-wrap gap-2 mb-6">
            {product.texture && <Tag color="green">{product.texture}</Tag>}
            {product.dimensions && <Tag>{product.dimensions}</Tag>}
            {product.thickness && <Tag>{product.thickness}</Tag>}
            {product.applicationDomains.map((d) => (
              <Tag color="blue" key={d}>
                {d}
              </Tag>
            ))}
          </div>

          <p className="text-foreground/80 leading-relaxed mb-6 whitespace-pre-line">{localize(product.description, language)}</p>

          <div className="text-sm text-muted-foreground mb-6">
            {t("product.stock")}: <span className="font-medium text-foreground">{product.stock}</span>
          </div>

          {isClient && (
            <div className="flex items-center gap-3">
              <InputNumber min={1} max={Math.max(product.stock, 1)} value={quantity} onChange={(v) => setQuantity(v || 1)} size="large" />
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                loading={addToCart.isLoading}
                disabled={product.stock <= 0}
                onClick={() => addToCart.mutate()}
              >
                {product.stock > 0 ? t("product.addToCart") : t("product.outOfStock")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
