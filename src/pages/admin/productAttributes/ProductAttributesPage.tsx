import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Table, Button, Popconfirm, App as AntdApp, Empty, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { productAttributeService } from "../../../services/ProductAttributeService";
import { queryKeys } from "../../../services/QueryClientManager";
import { useApp, useAccess } from "../../../hooks";
import { cleanI18nText } from "../../../components/common/I18nFieldGroup";
import { NameFormModal } from "../../../components/common/NameFormModal";
import { localize } from "../../../utils/i18nText";
import { getErrorMessage } from "../../../utils/errorHandling";
import type { ProductAttribute, AttributeOption, I18nText } from "../../../models/entities";

const EMPTY_I18N: I18nText = { en: "", fr: "", ar: "" };

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
        fieldLabel={t("productAttributes.name") as string}
        initialValue={EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={createAttribute.isLoading}
        serverError={serverError}
        onSubmit={(name) => createAttribute.mutate(name)}
        onClose={() => { setAddAttributeOpen(false); setServerError(null); }}
      />

      <NameFormModal
        open={!!renameAttribute}
        title={t("productAttributes.edit") as string}
        fieldLabel={t("productAttributes.name") as string}
        initialValue={renameAttribute?.name ?? EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={updateAttribute.isLoading}
        serverError={serverError}
        onSubmit={(name) => renameAttribute && updateAttribute.mutate({ id: renameAttribute._id, name })}
        onClose={() => { setRenameAttribute(null); setServerError(null); }}
      />

      <NameFormModal
        open={!!addOptionFor}
        title={t("productAttributes.addOption") as string}
        fieldLabel={t("productAttributes.name") as string}
        initialValue={EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={addOption.isLoading}
        serverError={serverError}
        onSubmit={(name) => addOptionFor && addOption.mutate({ id: addOptionFor._id, name })}
        onClose={() => { setAddOptionFor(null); setServerError(null); }}
      />

      <NameFormModal
        open={!!renameOption}
        title={t("productAttributes.editOption") as string}
        fieldLabel={t("productAttributes.name") as string}
        initialValue={renameOption?.option.name ?? EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={updateOption.isLoading}
        serverError={serverError}
        onSubmit={(name) => renameOption && updateOption.mutate({ id: renameOption.attribute._id, optionId: renameOption.option._id, name })}
        onClose={() => { setRenameOption(null); setServerError(null); }}
      />
    </div>
  );
};
