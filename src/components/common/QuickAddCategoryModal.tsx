import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { Modal, Button, Alert } from "antd";
import { useTranslation } from "react-i18next";
import { categoryService } from "../../services/CategoryService";
import { queryKeys } from "../../services/QueryClientManager";
import { getErrorMessage } from "../../utils/errorHandling";
import { I18nFieldGroup, cleanI18nText } from "./I18nFieldGroup";
import type { Category, I18nText } from "../../models/entities";

interface QuickAddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (category: Category) => void;
}

interface QuickAddCategoryValues {
  name: I18nText;
  description: I18nText;
}

const EMPTY_I18N: I18nText = { en: "", fr: "", ar: "" };

/** Compact category creation form used from within other forms (e.g. Product's category
 * select), so admins don't have to leave the page to add a missing category. Reuses the
 * same relaxed (at-least-one-language) validation as the standalone Category form. */
export function QuickAddCategoryModal({ open, onClose, onCreated }: QuickAddCategoryModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<QuickAddCategoryValues>({
    defaultValues: { name: EMPTY_I18N, description: EMPTY_I18N },
  });

  const mutation = useMutation({
    mutationFn: (values: QuickAddCategoryValues) =>
      categoryService.create({
        name: cleanI18nText(values.name) ?? {},
        description: cleanI18nText(values.description),
      }),
    onSuccess: (category) => {
      queryClient.invalidateQueries([queryKeys.CATEGORIES_FILTER]);
      queryClient.invalidateQueries([queryKeys.CATEGORIES_TREE]);
      queryClient.invalidateQueries([queryKeys.CATEGORIES]);
      reset({ name: EMPTY_I18N, description: EMPTY_I18N });
      setServerError(null);
      onCreated(category);
    },
    onError: (err) => setServerError(getErrorMessage(err)),
  });

  const handleCancel = () => {
    setServerError(null);
    reset({ name: EMPTY_I18N, description: EMPTY_I18N });
    onClose();
  };

  return (
    <Modal title={t("categories.quickAddTitle")} open={open} onCancel={handleCancel} footer={null} destroyOnClose>
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
        <div className="flex gap-3 pt-2 justify-end">
          <Button onClick={handleCancel}>{t("common.cancel")}</Button>
          <Button type="primary" htmlType="submit" loading={mutation.isLoading}>
            {t("categories.quickAddSubmit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
