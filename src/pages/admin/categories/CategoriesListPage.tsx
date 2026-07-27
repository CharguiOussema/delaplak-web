import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Tree, Button, Popconfirm, App as AntdApp, Empty } from "antd";
import type { DataNode } from "antd/es/tree";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { categoryService } from "../../../services/CategoryService";
import { queryKeys } from "../../../services/QueryClientManager";
import { useApp, useAccess } from "../../../hooks";
import { localize } from "../../../utils/i18nText";
import { getErrorMessage } from "../../../utils/errorHandling";
import type { CategoryTreeNode } from "../../../models/entities";

export const CategoriesListPage = () => {
  const { t } = useTranslation();
  const { language } = useApp();
  const { canWrite } = useAccess();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();

  const { data: tree, isLoading } = useQuery({
    queryKey: [queryKeys.CATEGORIES_TREE],
    queryFn: () => categoryService.tree(),
  });

  const remove = useMutation<void, unknown, string>({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.CATEGORIES_TREE]);
      queryClient.invalidateQueries([queryKeys.CATEGORIES]);
      message.success(t("categories.deleteSuccess"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const toDataNode = (node: CategoryTreeNode): DataNode => ({
    key: node._id,
    title: (
      <div className="flex items-center justify-between gap-3 py-0.5">
        <span>
          {localize(node.name, language)} <span className="text-xs text-muted-foreground">/{node.slug}</span>
        </span>
        {canWrite("categories") && (
          <div className="flex gap-1">
            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => navigate(`/categories/${node._id}/edit`)} />
            <Popconfirm title={t("categories.deleteConfirm")} onConfirm={() => remove.mutate(node._id)}>
              <Button size="small" type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        )}
      </div>
    ),
    children: node.children?.map(toDataNode),
  });

  const treeData = useMemo(() => tree?.map(toDataNode) ?? [], [tree, language, canWrite]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{t("navigation.categories")}</h1>
        {canWrite("categories") && (
          <Link to="/categories/add">
            <Button type="primary" icon={<PlusOutlined />}>
              {t("categories.add")}
            </Button>
          </Link>
        )}
      </div>

      {!isLoading && (!tree || tree.length === 0) ? (
        <Empty description={t("categories.empty")} />
      ) : (
        <Tree treeData={treeData} defaultExpandAll showLine blockNode className="bg-card border border-border rounded-lg p-4" />
      )}
    </div>
  );
};
