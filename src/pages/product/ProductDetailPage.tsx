import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Spin, Result, Button, InputNumber, Tag, Radio, App as AntdApp, Breadcrumb } from "antd";
import { ShoppingCartOutlined, LeftOutlined, PictureOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { productService } from "../../services/ProductService";
import { cartService } from "../../services/CartService";
import { queryKeys } from "../../services/QueryClientManager";
import { useApp, useAuth } from "../../hooks";
import { RoomPreviewModal } from "../../components/product-preview/RoomPreviewModal";
import { localize, formatPrice, imageUrl } from "../../utils/i18nText";
import { API_URL } from "../../constants";
import { getErrorMessage } from "../../utils/errorHandling";
import { USER_ROLES } from "../../models/consts";
import type { Category, Cart, Product, ProductAttribute } from "../../models/entities";

interface AttributeGroup {
  attribute: ProductAttribute;
  options: { option: string; priceAdjustment: number }[];
}

// Product.attributeOptions is a flat list of (attribute, option, priceAdjustment) rows —
// group it back by attribute type so the client picks one option per setting, the way the
// admin configured it (Texture / Thickness / Dimensions, each with its own price deltas).
function groupByAttribute(product: Product): AttributeGroup[] {
  const groups = new Map<string, AttributeGroup>();
  for (const selection of product.attributeOptions) {
    if (typeof selection.attribute !== "object") continue;
    const attribute = selection.attribute;
    if (!groups.has(attribute._id)) groups.set(attribute._id, { attribute, options: [] });
    groups.get(attribute._id)!.options.push({ option: selection.option, priceAdjustment: selection.priceAdjustment });
  }
  return [...groups.values()];
}

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
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: [queryKeys.PRODUCTS, id],
    queryFn: () => productService.getById(id!),
    enabled: !!id,
  });

  const attributeGroups = useMemo(() => (product ? groupByAttribute(product) : []), [product]);

  // Defaults to the first configured option per setting, mirroring how the admin lists
  // them — the client can still change it before adding to cart.
  useEffect(() => {
    if (attributeGroups.length === 0) return;
    setSelections((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const group of attributeGroups) {
        if (!next[group.attribute._id]) {
          next[group.attribute._id] = group.options[0].option;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [attributeGroups]);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    return attributeGroups.reduce((sum, group) => {
      const selectedOption = selections[group.attribute._id];
      const match = group.options.find((o) => o.option === selectedOption);
      return sum + (match?.priceAdjustment ?? 0);
    }, product.price);
  }, [product, attributeGroups, selections]);

  const addToCart = useMutation<Cart, unknown, void>({
    mutationFn: () =>
      cartService.addItem(
        id!,
        quantity,
        attributeGroups.map((group) => ({ attribute: group.attribute._id, option: selections[group.attribute._id] })),
      ),
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

  const category = product.categories.find((c): c is Category => typeof c === "object") ?? null;
  const isClient = user?.role === USER_ROLES.CLIENT;
  const allSelected = attributeGroups.every((group) => !!selections[group.attribute._id]);

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
          {isClient && product.images.length > 0 && (
            <Button
              block
              icon={<PictureOutlined />}
              className="mt-3"
              onClick={() => setPreviewOpen(true)}
            >
              {t("product.preview.cta")}
            </Button>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{localize(product.name, language)}</h1>
          <div className="text-2xl font-semibold text-primary mb-4">{formatPrice(unitPrice, product.currency)}</div>

          <div className="flex flex-wrap gap-2 mb-6">
            {product.applicationDomains.map((d) => (
              <Tag color="blue" key={d}>
                {d}
              </Tag>
            ))}
          </div>

          <p className="text-foreground/80 leading-relaxed mb-6 whitespace-pre-line">{localize(product.description, language)}</p>

          {attributeGroups.length > 0 && (
            <div className="space-y-4 mb-6">
              {attributeGroups.map((group) => (
                <div key={group.attribute._id}>
                  <div className="text-sm font-medium mb-1.5">{localize(group.attribute.name, language)}</div>
                  <Radio.Group
                    value={selections[group.attribute._id]}
                    onChange={(e) => setSelections((prev) => ({ ...prev, [group.attribute._id]: e.target.value }))}
                  >
                    {group.options.map(({ option, priceAdjustment }) => {
                      const optionInfo = group.attribute.options.find((o) => o._id === option);
                      const label = optionInfo ? localize(optionInfo.name, language) : option;
                      const suffix =
                        priceAdjustment > 0 ? ` (+${formatPrice(priceAdjustment, product.currency)})` : priceAdjustment < 0 ? ` (${formatPrice(priceAdjustment, product.currency)})` : "";
                      return (
                        <Radio.Button key={option} value={option}>
                          {label}
                          {suffix}
                        </Radio.Button>
                      );
                    })}
                  </Radio.Group>
                </div>
              ))}
            </div>
          )}

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
                disabled={product.stock <= 0 || !allSelected}
                onClick={() => addToCart.mutate()}
              >
                {product.stock > 0 ? t("product.addToCart") : t("product.outOfStock")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <RoomPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        productImageUrl={imageUrl(API_URL, product.images[activeImage])}
        productName={localize(product.name, language)}
      />
    </div>
  );
};
