import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { Input, Empty, Pagination, Spin, Tag, Card } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { categoryService } from "../../services/CategoryService";
import { productService } from "../../services/ProductService";
import { queryKeys } from "../../services/QueryClientManager";
import { useApp } from "../../hooks";
import { localize, formatPrice, imageUrl } from "../../utils/i18nText";
import { API_URL } from "../../constants";
import type { CategoryTreeNode } from "../../models/entities";

const CategoryTreeItem = ({
  node,
  activeId,
  onSelect,
  depth = 0,
}: {
  node: CategoryTreeNode;
  activeId: string | null;
  onSelect: (id: string | null) => void;
  depth?: number;
}) => {
  const { language } = useApp();
  return (
    <div>
      <button
        onClick={() => onSelect(node._id)}
        style={{ paddingInlineStart: 12 + depth * 14 }}
        className={`w-full text-start py-1.5 pe-3 rounded-md text-sm transition-colors ${
          activeId === node._id ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted text-foreground"
        }`}
      >
        {localize(node.name, language)}
      </button>
      {node.children?.map((child) => (
        <CategoryTreeItem key={child._id} node={child} activeId={activeId} onSelect={onSelect} depth={depth + 1} />
      ))}
    </div>
  );
};

export const CatalogPage = () => {
  const { t } = useTranslation();
  const { language } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category");
  const search = searchParams.get("search") || "";
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(search);

  const { data: tree, isLoading: treeLoading } = useQuery({
    queryKey: [queryKeys.CATEGORIES_TREE],
    queryFn: () => categoryService.tree(),
    staleTime: 1000 * 60 * 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.PRODUCTS, category, search, page],
    queryFn: () => productService.getAll({ page, limit: 12, search: search || undefined, category: category || undefined }),
    keepPreviousData: true,
  });

  const setCategory = (id: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("category", id);
    else next.delete("category");
    setSearchParams(next);
    setPage(1);
  };

  const submitSearch = () => {
    const next = new URLSearchParams(searchParams);
    if (searchInput) next.set("search", searchInput);
    else next.delete("search");
    setSearchParams(next);
    setPage(1);
  };

  const activeCategoryLabel = useMemo(() => {
    if (!category || !tree) return null;
    const find = (nodes: CategoryTreeNode[]): CategoryTreeNode | undefined => {
      for (const n of nodes) {
        if (n._id === category) return n;
        const found = find(n.children);
        if (found) return found;
      }
      return undefined;
    };
    const node = find(tree);
    return node ? localize(node.name, language) : null;
  }, [category, tree, language]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("catalog.title")}</h1>
        <p className="text-muted-foreground">{t("catalog.subtitle")}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 shrink-0">
          <div className="sticky top-20">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
              {t("catalog.categories")}
            </h3>
            {treeLoading ? (
              <Spin size="small" />
            ) : (
              <div className="space-y-0.5">
                <button
                  onClick={() => setCategory(null)}
                  className={`w-full text-start px-3 py-1.5 rounded-md text-sm transition-colors ${
                    !category ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted"
                  }`}
                >
                  {t("catalog.allCategories")}
                </button>
                {tree?.map((node) => <CategoryTreeItem key={node._id} node={node} activeId={category} onSelect={setCategory} />)}
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={submitSearch}
              placeholder={t("catalog.searchPlaceholder") as string}
              prefix={<SearchOutlined />}
              size="large"
              allowClear
              onClear={() => {
                setSearchInput("");
                const next = new URLSearchParams(searchParams);
                next.delete("search");
                setSearchParams(next);
              }}
            />
          </div>

          {activeCategoryLabel && (
            <div className="mb-4">
              <Tag color="blue" closable onClose={() => setCategory(null)}>
                {activeCategoryLabel}
              </Tag>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Spin size="large" />
            </div>
          ) : data && data.docs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.docs.map((product) => (
                  <Link key={product._id} to={`/products/${product._id}`}>
                    <Card
                      hoverable
                      className="product-card h-full overflow-hidden"
                      cover={
                        <div className="aspect-square bg-muted overflow-hidden">
                          {product.images[0] ? (
                            <img
                              src={imageUrl(API_URL, product.images[0])}
                              alt={localize(product.name, language)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                              {t("catalog.noImage")}
                            </div>
                          )}
                        </div>
                      }
                    >
                      <Card.Meta
                        title={<span className="line-clamp-1">{localize(product.name, language)}</span>}
                        description={
                          <div className="space-y-1">
                            <div className="font-semibold text-primary text-base">{formatPrice(product.price, product.currency)}</div>
                          </div>
                        }
                      />
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <Pagination
                  current={data.page}
                  total={data.totalDocs}
                  pageSize={data.limit}
                  onChange={setPage}
                  showSizeChanger={false}
                />
              </div>
            </>
          ) : (
            <Empty description={t("catalog.empty")} className="py-24" />
          )}
        </div>
      </div>
    </div>
  );
};
