import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Table, Button, Tag, Input, Popconfirm, App as AntdApp, type TableProps } from "antd";
import { PlusOutlined, EditOutlined, StopOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { userService } from "../../../services/UserService";
import { queryKeys } from "../../../services/QueryClientManager";
import { useAccess } from "../../../hooks";
import { getErrorMessage } from "../../../utils/errorHandling";
import { USER_ROLES } from "../../../models/consts";
import type { User } from "../../../models/entities";

const ROLE_COLOR: Record<USER_ROLES, string> = {
  [USER_ROLES.ADMIN]: "blue",
  [USER_ROLES.CLIENT]: "default",
};

export const UsersListPage = () => {
  const { t } = useTranslation();
  const { canWrite } = useAccess();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.USERS, page, search],
    queryFn: () => userService.getAll({ page, limit: 10, search: search || undefined }),
    keepPreviousData: true,
  });

  const deactivate = useMutation<User, unknown, string>({
    mutationFn: (id: string) => userService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.USERS]);
      message.success(t("users.deactivateSuccess"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const canManage = () => canWrite("users");

  const columns: TableProps<User>["columns"] = [
    { title: t("users.fullName"), dataIndex: "fullName" },
    { title: t("users.email"), dataIndex: "email" },
    { title: t("users.phone"), dataIndex: "phone" },
    { title: t("users.role"), dataIndex: "role", render: (role: USER_ROLES) => <Tag color={ROLE_COLOR[role]}>{role}</Tag> },
    {
      title: t("users.status"),
      dataIndex: "isActive",
      render: (active: boolean) => <Tag color={active ? "green" : "red"}>{active ? t("users.active") : t("users.inactive")}</Tag>,
    },
    { title: t("users.createdAt"), dataIndex: "createdAt", render: (d: string) => new Date(d).toLocaleDateString() },
    {
      title: t("common.actions"),
      render: (_: unknown, row: User) => (
        <div className="flex gap-2">
          <Button
            size="small"
            icon={<EditOutlined />}
            disabled={!canManage()}
            onClick={() => navigate(`/users/${row._id}/edit`)}
          />
          {row.isActive && (
            <Popconfirm title={t("users.deactivateConfirm")} onConfirm={() => deactivate.mutate(row._id)} disabled={!canManage()}>
              <Button size="small" danger icon={<StopOutlined />} disabled={!canManage()} />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{t("navigation.users")}</h1>
        {canWrite("users") && (
          <Link to="/users/add">
            <Button type="primary" icon={<PlusOutlined />}>
              {t("users.add")}
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

      <Table<User>
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
