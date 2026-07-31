import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Table, Button, Modal, Alert, Popconfirm, App as AntdApp, Empty, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { productAttributeService } from "../../../services/ProductAttributeService";
import { queryKeys } from "../../../services/QueryClientManager";
import { useApp, useAccess } from "../../../hooks";
import { I18nFieldGroup, cleanI18nText } from "../../../components/common/I18nFieldGroup";
import { localize } from "../../../utils/i18nText";
import { getErrorMessage } from "../../../utils/errorHandling";
import type { ProductAttribute, AttributeOption, I18nText } from "../../../models/entities";

const EMPTY_I18N: I18nText = { en: "", fr: "", ar: "" };

interface NameFormValues {
  name: I18nText;
}

// Shared by "add attribute type", "rename attribute type", "add option" and "rename option" —
// all four are a single i18n name field, just wired to a different mutation.
function NameFormModal({
  open,
  title,
  initialName,
  submitLabel,
  loading,
  serverError,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  initialName: I18nText;
  submitLabel: string;
  loading: boolean;
  serverError: string | null;
  onSubmit: (name: I18nText) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<NameFormValues>({ defaultValues: { name: initialName } });

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      afterOpenChange={(isOpen) => isOpen && reset({ name: initialName })}
    >
      {serverError && <Alert type="error" message={serverError} showIcon className="mb-4" />}
      <form onSubmit={handleSubmit((v) => onSubmit(v.name))}>
        <I18nFieldGroup control={control} namePrefix="name" label={t("productAttributes.name") as string} minRequired={1} />
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

export const ProductAttributesPage = () => {
  const { t } = useTranslation();
  const { language } = useApp();
  const { canWrite } = useAccess();
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();

  const [addAttributeOpen, setAddAttributeOpen] = useState(false);
  const [renameAttribute, setRenameAttribute] = useState<ProductAttribute | null>(null);
  const [addOptionFor, setAddOptionFor] = useState<ProductAttribute | null>(null);
  const [renameOption, setRenameOption] = useState<{ attribute: ProductAttribute; option: AttributeOption } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.PRODUCT_ATTRIBUTES],
    queryFn: () => productAttributeService.getAll({ limit: 100 }),
  });

  const invalidate = () => queryClient.invalidateQueries([queryKeys.PRODUCT_ATTRIBUTES]);

  const createAttribute = useMutation({
    mutationFn: (name: I18nText) => productAttributeService.create({ name: cleanI18nText(name) ?? {} }),
    onSuccess: () => {
      invalidate();
      message.success(t("productAttributes.createSuccess"));
      setAddAttributeOpen(false);
      setServerError(null);
    },
    onError: (err) => setServerError(getErrorMessage(err)),
  });

  const updateAttribute = useMutation({
    mutationFn: ({ id, name }: { id: string; name: I18nText }) =>
      productAttributeService.update(id, { name: cleanI18nText(name) ?? {} }),
    onSuccess: () => {
      invalidate();
      message.success(t("productAttributes.updateSuccess"));
      setRenameAttribute(null);
      setServerError(null);
    },
    onError: (err) => setServerError(getErrorMessage(err)),
  });

  const removeAttribute = useMutation<void, unknown, string>({
    mutationFn: (id: string) => productAttributeService.remove(id),
    onSuccess: () => {
      invalidate();
      message.success(t("productAttributes.deleteSuccess"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const addOption = useMutation({
    mutationFn: ({ id, name }: { id: string; name: I18nText }) => productAttributeService.addOption(id, cleanI18nText(name) ?? {}),
    onSuccess: () => {
      invalidate();
      message.success(t("productAttributes.optionCreateSuccess"));
      setAddOptionFor(null);
      setServerError(null);
    },
    onError: (err) => setServerError(getErrorMessage(err)),
  });

  const updateOption = useMutation({
    mutationFn: ({ id, optionId, name }: { id: string; optionId: string; name: I18nText }) =>
      productAttributeService.updateOption(id, optionId, cleanI18nText(name) ?? {}),
    onSuccess: () => {
      invalidate();
      message.success(t("productAttributes.optionUpdateSuccess"));
      setRenameOption(null);
      setServerError(null);
    },
    onError: (err) => setServerError(getErrorMessage(err)),
  });

  const removeOption = useMutation({
    mutationFn: ({ id, optionId }: { id: string; optionId: string }) => productAttributeService.removeOption(id, optionId),
    onSuccess: () => {
      invalidate();
      message.success(t("productAttributes.optionDeleteSuccess"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const canManage = canWrite("productAttributes");
  const attributes = data?.docs ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("productAttributes.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("productAttributes.subtitle")}</p>
        </div>
        {canManage && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddAttributeOpen(true)}>
            {t("productAttributes.add")}
          </Button>
        )}
      </div>

      {!isLoading && attributes.length === 0 ? (
        <Empty description={t("productAttributes.empty")} />
      ) : (
        <Table<ProductAttribute>
          rowKey="_id"
          loading={isLoading}
          dataSource={attributes}
          pagination={false}
          expandable={{
            expandedRowRender: (attribute) => (
              <div className="py-2">
                <div className="flex flex-wrap gap-2 mb-3">
                  {attribute.options.length === 0 && <span className="text-sm text-muted-foreground">{t("productAttributes.noOptions")}</span>}
                  {attribute.options.map((option) => (
                    <Tag key={option._id} className="flex items-center gap-1 py-1">
                      {localize(option.name, language)}
                      {canManage && (
                        <>
                          <EditOutlined className="cursor-pointer ms-1" onClick={() => setRenameOption({ attribute, option })} />
                          <Popconfirm title={t("productAttributes.optionDeleteConfirm")} onConfirm={() => removeOption.mutate({ id: attribute._id, optionId: option._id })}>
                            <DeleteOutlined className="cursor-pointer text-destructive" />
                          </Popconfirm>
                        </>
                      )}
                    </Tag>
                  ))}
                </div>
                {canManage && (
                  <Button size="small" icon={<PlusOutlined />} onClick={() => setAddOptionFor(attribute)}>
                    {t("productAttributes.addOption")}
                  </Button>
                )}
              </div>
            ),
          }}
          columns={[
            { title: t("productAttributes.name"), dataIndex: "name", render: (name: I18nText) => localize(name, language) },
            { title: t("productAttributes.optionsCount"), render: (_, attribute) => attribute.options.length },
            ...(canManage
              ? [
                  {
                    title: t("common.actions"),
                    render: (_: unknown, attribute: ProductAttribute) => (
                      <div className="flex gap-2">
                        <Button size="small" icon={<EditOutlined />} onClick={() => setRenameAttribute(attribute)} />
                        <Popconfirm title={t("productAttributes.deleteConfirm")} onConfirm={() => removeAttribute.mutate(attribute._id)}>
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
        />
      )}

      <NameFormModal
        open={addAttributeOpen}
        title={t("productAttributes.add") as string}
        initialName={EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={createAttribute.isLoading}
        serverError={serverError}
        onSubmit={(name) => createAttribute.mutate(name)}
        onClose={() => { setAddAttributeOpen(false); setServerError(null); }}
      />

      <NameFormModal
        open={!!renameAttribute}
        title={t("productAttributes.edit") as string}
        initialName={renameAttribute?.name ?? EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={updateAttribute.isLoading}
        serverError={serverError}
        onSubmit={(name) => renameAttribute && updateAttribute.mutate({ id: renameAttribute._id, name })}
        onClose={() => { setRenameAttribute(null); setServerError(null); }}
      />

      <NameFormModal
        open={!!addOptionFor}
        title={t("productAttributes.addOption") as string}
        initialName={EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={addOption.isLoading}
        serverError={serverError}
        onSubmit={(name) => addOptionFor && addOption.mutate({ id: addOptionFor._id, name })}
        onClose={() => { setAddOptionFor(null); setServerError(null); }}
      />

      <NameFormModal
        open={!!renameOption}
        title={t("productAttributes.editOption") as string}
        initialName={renameOption?.option.name ?? EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={updateOption.isLoading}
        serverError={serverError}
        onSubmit={(name) => renameOption && updateOption.mutate({ id: renameOption.attribute._id, optionId: renameOption.option._id, name })}
        onClose={() => { setRenameOption(null); setServerError(null); }}
      />
    </div>
  );
};
