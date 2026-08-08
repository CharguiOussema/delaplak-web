import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button, Card, Input, Select, Switch, Alert, Spin, App as AntdApp } from "antd";
import { useTranslation } from "react-i18next";
import { userService } from "../../../services/UserService";
import { queryKeys } from "../../../services/QueryClientManager";
import { getErrorMessage } from "../../../utils/errorHandling";
import { USER_ROLES } from "../../../models/consts";

const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,19}$/;

interface UserFormValues {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: USER_ROLES;
  isActive: boolean;
}

export const UserFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: [queryKeys.USERS, id],
    queryFn: () => userService.getById(id!),
    enabled: isEdit,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: { email: "", password: "", fullName: "", phone: "", role: USER_ROLES.CLIENT, isActive: true },
  });

  useEffect(() => {
    if (existing) {
      reset({
        email: existing.email,
        password: "",
        fullName: existing.fullName,
        phone: existing.phone,
        role: existing.role,
        isActive: existing.isActive,
      });
    }
  }, [existing, reset]);

  const roleOptions = [USER_ROLES.CLIENT, USER_ROLES.ADMIN].map((r) => ({ label: r, value: r }));

  const mutation = useMutation({
    mutationFn: (values: UserFormValues) =>
      isEdit
        ? userService.update(id!, {
            email: values.email,
            fullName: values.fullName,
            phone: values.phone,
            role: values.role,
            isActive: values.isActive,
          })
        : userService.create({
            email: values.email,
            password: values.password,
            fullName: values.fullName,
            phone: values.phone,
            role: values.role,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.USERS]);
      message.success(isEdit ? t("users.updateSuccess") : t("users.createSuccess"));
      navigate("/users");
    },
    onError: (err) => setServerError(getErrorMessage(err)),
  });

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? t("users.edit") : t("users.add")}</h1>

      <Card>
        {serverError && <Alert type="error" message={serverError} showIcon className="mb-4" />}

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("users.fullName")}</label>
            <Controller
              name="fullName"
              control={control}
              rules={{ required: t("validation.required") as string }}
              render={({ field }) => <Input {...field} />}
            />
            {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("users.phone")}</label>
            <Controller
              name="phone"
              control={control}
              rules={{
                required: t("validation.required") as string,
                pattern: { value: PHONE_PATTERN, message: t("validation.invalidPhone") as string },
              }}
              render={({ field }) => <Input {...field} placeholder="+212600000000" />}
            />
            {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("users.email")}</label>
            <Controller
              name="email"
              control={control}
              rules={{ required: t("validation.required") as string }}
              render={({ field }) => <Input {...field} />}
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1">{t("auth.login.passwordLabel")}</label>
              <Controller
                name="password"
                control={control}
                rules={{ required: t("validation.required") as string, minLength: { value: 8, message: t("validation.minLength", { count: 8 }) as string } }}
                render={({ field }) => <Input.Password {...field} />}
              />
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">{t("users.role")}</label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => <Select {...field} options={roleOptions} className="w-full" />}
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{t("users.active")}</span>
              <Controller name="isActive" control={control} render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="primary" htmlType="submit" loading={mutation.isLoading}>
              {t("common.save")}
            </Button>
            <Button onClick={() => navigate("/users")}>{t("common.cancel")}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
