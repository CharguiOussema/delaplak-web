import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button, Card, Input, InputNumber, Select, Alert, Spin, App as AntdApp, Upload, Image, type UploadProps } from "antd";
import { UploadOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useApp } from "../../../hooks";
import { productService } from "../../../services/ProductService";
import { categoryService } from "../../../services/CategoryService";
import { queryKeys } from "../../../services/QueryClientManager";
import { I18nFieldGroup } from "../../../components/common/I18nFieldGroup";
import { QuickAddCategoryModal } from "../../../components/common/QuickAddCategoryModal";
import { getErrorMessage } from "../../../utils/errorHandling";
import { imageUrl, localize } from "../../../utils/i18nText";
import { API_URL } from "../../../constants";
import type { I18nText, Product, Category } from "../../../models/entities";
import type { FilterOption } from "../../../models/ResponseType";

interface ProductFormValues {
  name: I18nText;
  description: I18nText;
  price: number;
  currency: string;
  dimensions: string;
  thickness: string;
  texture: string;
  applicationDomains: string;
  categories: string[];
  stock: number;
}

export const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { t } = useTranslation();
  const { language } = useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [serverError, setServerError] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [extraCategoryOptions, setExtraCategoryOptions] = useState<FilterOption[]>([]);

  const { data: existing, isLoading } = useQuery({
    queryKey: [queryKeys.PRODUCTS, id],
    queryFn: () => productService.getById(id!),
    enabled: isEdit,
  });

  const { data: categoryOptions } = useQuery({
    queryKey: [queryKeys.CATEGORIES_FILTER],
    queryFn: () => categoryService.filter(),
  });

  // A product can reference a category that was later renamed/soft-deleted — categoryService.filter()
  // only returns non-deleted categories, so without this an already-selected-but-now-deleted category
  // would have no matching option and rc-select would fall back to showing its raw id.
  const existingCategoryOptions: FilterOption[] = (existing?.categories ?? [])
    .filter((c): c is Category => typeof c === "object")
    .map((c) => ({ label: c.isDeleted ? `${localize(c.name, language)} (${t("categories.deleted")})` : localize(c.name, language), value: c._id }));

  const allCategoryOptions = [categoryOptions, extraCategoryOptions, existingCategoryOptions].reduce<FilterOption[]>(
    (acc, list) => [...acc, ...(list ?? []).filter((o) => !acc.some((existingOpt) => existingOpt.value === o.value))],
    [],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: { en: "", fr: "", ar: "" },
      description: { en: "", fr: "", ar: "" },
      price: 0,
      currency: "TND",
      dimensions: "",
      thickness: "",
      texture: "",
      applicationDomains: "",
      categories: [],
      stock: 0,
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description,
        price: existing.price,
        currency: existing.currency,
        dimensions: existing.dimensions,
        thickness: existing.thickness,
        texture: existing.texture,
        applicationDomains: existing.applicationDomains.join(", "),
        categories: existing.categories.map((c) => (typeof c === "object" ? c._id : c)),
        stock: existing.stock,
      });
    }
  }, [existing, reset]);

  const mutation = useMutation<Product, unknown, ProductFormValues>({
    mutationFn: (values: ProductFormValues) => {
      const payload = {
        name: values.name,
        description: values.description,
        price: values.price,
        currency: values.currency,
        dimensions: values.dimensions,
        thickness: values.thickness,
        texture: values.texture,
        applicationDomains: values.applicationDomains
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        categories: values.categories,
        stock: values.stock,
      };
      return isEdit ? productService.update(id!, payload) : productService.create(payload);
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries([queryKeys.PRODUCTS]);
      message.success(isEdit ? t("products.updateSuccess") : t("products.createSuccess"));
      if (isEdit) {
        queryClient.invalidateQueries([queryKeys.PRODUCTS, id]);
      } else {
        navigate(`/products/${product._id}/edit`);
        return;
      }
      navigate("/products");
    },
    onError: (err) => setServerError(getErrorMessage(err)),
  });

  const uploadImages = useMutation<Product, unknown, File[]>({
    mutationFn: (files: File[]) => productService.addImages(id!, files),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.PRODUCTS, id]);
      message.success(t("products.imagesUploaded"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const removeImage = useMutation<Product, unknown, string>({
    mutationFn: (path: string) => productService.removeImage(id!, path),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.PRODUCTS, id]);
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const customUpload: NonNullable<UploadProps["customRequest"]> = ({ file, onSuccess, onError }) => {
    uploadImages.mutate([file as File], {
      onSuccess: () => onSuccess?.({}),
      onError: (err) => onError?.(err as unknown as Error),
    });
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? t("products.edit") : t("products.add")}</h1>

      <Card>
        {serverError && <Alert type="error" message={serverError} showIcon className="mb-4" />}

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <I18nFieldGroup control={control} namePrefix="name" label={t("products.name") as string} />
          <I18nFieldGroup control={control} namePrefix="description" label={t("products.description") as string} multiline />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("products.price")}</label>
              <Controller
                name="price"
                control={control}
                rules={{ required: true, min: 0 }}
                render={({ field }) => <InputNumber {...field} min={0} className="w-full" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("products.currency")}</label>
              <Controller name="currency" control={control} render={({ field }) => <Input {...field} />} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("products.dimensions")}</label>
              <Controller name="dimensions" control={control} render={({ field }) => <Input {...field} />} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("products.thickness")}</label>
              <Controller name="thickness" control={control} render={({ field }) => <Input {...field} />} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("products.texture")}</label>
              <Controller name="texture" control={control} render={({ field }) => <Input {...field} />} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("products.stock")}</label>
              <Controller name="stock" control={control} render={({ field }) => <InputNumber {...field} min={0} className="w-full" />} />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{t("products.applicationDomains")}</label>
            <Controller
              name="applicationDomains"
              control={control}
              render={({ field }) => <Input {...field} placeholder="habitat, offices, restaurants" />}
            />
            <p className="text-xs text-muted-foreground mt-1">{t("products.applicationDomainsHint")}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{t("products.category")}</label>
            <div className="flex gap-2">
              <Controller
                name="categories"
                control={control}
                rules={{ validate: (v) => (v && v.length > 0) || (t("validation.required") as string) }}
                render={({ field }) => (
                  <Select
                    // Remounts once category options finish loading — otherwise a value set
                    // before its matching option exists gets permanently rendered as the raw
                    // id (rc-select caches the label the first time it sees an unmatched value).
                    key={categoryOptions ? "loaded" : "loading"}
                    {...field}
                    mode="multiple"
                    className="w-full"
                    loading={!categoryOptions}
                    placeholder={t("products.selectCategory") as string}
                    options={allCategoryOptions}
                  />
                )}
              />
              <Button icon={<PlusOutlined />} onClick={() => setQuickAddOpen(true)}>
                {t("categories.quickAddButton")}
              </Button>
            </div>
            {errors.categories && <p className="text-destructive text-xs mt-1">{errors.categories.message ?? t("validation.required")}</p>}
          </div>

          <QuickAddCategoryModal
            open={quickAddOpen}
            onClose={() => setQuickAddOpen(false)}
            onCreated={(category: Category) => {
              setExtraCategoryOptions((prev) => [...prev, { label: localize(category.name, language), value: category._id }]);
              setValue("categories", [...watch("categories"), category._id], { shouldValidate: true });
              message.success(t("categories.quickAddSuccess"));
              setQuickAddOpen(false);
            }}
          />

          <div className="flex gap-3 pt-2">
            <Button type="primary" htmlType="submit" loading={mutation.isLoading}>
              {t("common.save")}
            </Button>
            <Button onClick={() => navigate("/products")}>{t("common.cancel")}</Button>
          </div>
        </form>

        {isEdit && existing && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-semibold mb-3">{t("products.images")}</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {existing.images.map((img) => (
                <div key={img} className="relative">
                  <Image src={imageUrl(API_URL, img)} width={80} height={80} className="object-cover rounded-md" />
                  <Button
                    size="small"
                    danger
                    shape="circle"
                    icon={<DeleteOutlined />}
                    className="!absolute -top-2 -end-2"
                    onClick={() => removeImage.mutate(img)}
                  />
                </div>
              ))}
            </div>
            <Upload customRequest={customUpload} showUploadList={false} multiple accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploadImages.isLoading}>
                {t("products.uploadImages")}
              </Button>
            </Upload>
          </div>
        )}
      </Card>
    </div>
  );
};
