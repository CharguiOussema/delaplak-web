import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button, Card, Select, Alert, Spin, App as AntdApp } from "antd";
import { useTranslation } from "react-i18next";
import { categoryService } from "../../../services/CategoryService";
import { queryKeys } from "../../../services/QueryClientManager";
import { I18nFieldGroup, cleanI18nText } from "../../../components/common/I18nFieldGroup";
import { getErrorMessage } from "../../../utils/errorHandling";
import type { I18nText } from "../../../models/entities";

interface CategoryFormValues {
  name: I18nText;
  description: I18nText;
  parent?: string;
}

export const CategoryFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: [queryKeys.CATEGORIES, id],
    queryFn: () => categoryService.getById(id!),
    enabled: isEdit,
  });

  const { data: options } = useQuery({
    queryKey: [queryKeys.CATEGORIES_FILTER],
    queryFn: () => categoryService.filter(),
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormValues>({
    defaultValues: { name: { en: "", fr: "", ar: "" }, description: { en: "", fr: "", ar: "" }, parent: undefined },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description ?? { en: "", fr: "", ar: "" },
        parent: existing.parent ?? undefined,
      });
    }
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (values: CategoryFormValues) => {
      const payload = {
        name: cleanI18nText(values.name) ?? {},
        description: cleanI18nText(values.description),
        parent: values.parent || null,
      };
      return isEdit ? categoryService.update(id!, payload) : categoryService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.CATEGORIES]);
      queryClient.invalidateQueries([queryKeys.CATEGORIES_TREE]);
      queryClient.invalidateQueries([queryKeys.CATEGORIES_FILTER]);
      message.success(isEdit ? t("categories.updateSuccess") : t("categories.createSuccess"));
      navigate("/categories");
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

  const parentOptions = (options ?? []).filter((o) => o.value !== id);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? t("categories.edit") : t("categories.add")}</h1>

      <Card>
        {serverError && <Alert type="error" message={serverError} showIcon className="mb-4" />}

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <I18nFieldGroup control={control} namePrefix="name" label={t("categories.name") as string} minRequired={1} />
          <I18nFieldGroup
            control={control}
            namePrefix="description"
            label={t("categories.description") as string}
            multiline
            minRequired={0}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{t("categories.parent")}</label>
            <Select
              allowClear
              className="w-full"
              placeholder={t("categories.noParent") as string}
              options={parentOptions}
              value={watch("parent")}
              onChange={(v) => setValue("parent", v)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="primary" htmlType="submit" loading={mutation.isLoading}>
              {t("common.save")}
            </Button>
            <Button onClick={() => navigate("/categories")}>{t("common.cancel")}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
