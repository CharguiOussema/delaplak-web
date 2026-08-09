import { useForm } from "react-hook-form";
import { Modal, Button, Alert } from "antd";
import { useTranslation } from "react-i18next";
import { I18nFieldGroup } from "./I18nFieldGroup";
import type { I18nText } from "../../models/entities";

interface NameFormValues {
  value: I18nText;
}

/** A single i18n text field in a modal, submitted through one mutation — shared by every
 * "add/rename this one thing" flow (product attribute types + options, site settings
 * strengths + décor titles). */
export function NameFormModal({
  open,
  title,
  fieldLabel,
  initialValue,
  submitLabel,
  loading,
  serverError,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  fieldLabel: string;
  initialValue: I18nText;
  submitLabel: string;
  loading: boolean;
  serverError?: string | null;
  onSubmit: (value: I18nText) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<NameFormValues>({ defaultValues: { value: initialValue } });

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      afterOpenChange={(isOpen) => isOpen && reset({ value: initialValue })}
    >
      {serverError && <Alert type="error" message={serverError} showIcon className="mb-4" />}
      <form onSubmit={handleSubmit((v) => onSubmit(v.value))}>
        <I18nFieldGroup control={control} namePrefix="value" label={fieldLabel} minRequired={1} />
        <div className="flex gap-3 pt-2 justify-end">
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
