import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Table, Button, Input, Popconfirm, App as AntdApp, type TableProps } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { productService } from "../../../services/ProductService";
import { queryKeys } from "../../../services/QueryClientManager";
import { useApp, useAccess } from "../../../hooks";
import { localize, formatPrice, imageUrl } from "../../../utils/i18nText";
import { API_URL } from "../../../constants";
import { getErrorMessage } from "../../../utils/errorHandling";
import type { Product } from "../../../models/entities";

export const ProductsListPage = () => {
  const { t } = useTranslation();
  const { language } = useApp();
  const { canWrite } = useAccess();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.PRODUCTS, "admin", page, search],
    queryFn: () => productService.getAll({ page, limit: 10, search: search || undefined }),
    keepPreviousData: true,
  });

  const remove = useMutation<void, unknown, string>({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.PRODUCTS]);
      message.success(t("products.deleteSuccess"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const columns: TableProps<Product>["columns"] = [
    {
      title: t("products.image"),
      dataIndex: "images",
      render: (images: string[]) =>
        images[0] ? (
          <img src={imageUrl(API_URL, images[0])} alt="" className="w-12 h-12 object-cover rounded-md" />
        ) : (
          <div className="w-12 h-12 bg-muted rounded-md" />
        ),
    },
    { title: t("products.name"), render: (_: unknown, r: Product) => localize(r.name, language) },
    { title: t("products.price"), dataIndex: "price", render: (v: number, r: Product) => formatPrice(v, r.currency) },
    { title: t("products.stock"), dataIndex: "stock" },
    {
      title: t("common.actions"),
      render: (_: unknown, row: Product) => (
        <div className="flex gap-2">
          <Link to={`/products/${row._id}`}>
            <Button size="small">{t("common.view")}</Button>
          </Link>
          {canWrite("products") && (
            <>
              <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/products/${row._id}/edit`)} />
              <Popconfirm title={t("products.deleteConfirm")} onConfirm={() => remove.mutate(row._id)}>
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{t("navigation.products")}</h1>
        {canWrite("products") && (
          <Link to="/products/add">
            <Button type="primary" icon={<PlusOutlined />}>
              {t("products.add")}
            </Button>
          </Link>
        )}
      </div>

      <Input
        placeholder={t("common.search") as string}
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-4 max-w-sm"
        allowClear
      />

      <Table<Product>
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
