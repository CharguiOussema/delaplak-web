import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button, Card, Popconfirm, Spin, Upload, App as AntdApp, Empty, type UploadProps } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { siteSettingsService } from "../../../services/SiteSettingsService";
import { queryKeys } from "../../../services/QueryClientManager";
import { useApp } from "../../../hooks";
import { I18nFieldGroup } from "../../../components/common/I18nFieldGroup";
import { NameFormModal } from "../../../components/common/NameFormModal";
import { localize, imageUrl } from "../../../utils/i18nText";
import { API_URL } from "../../../constants";
import { getErrorMessage } from "../../../utils/errorHandling";
import type { DecorItem, I18nText, SiteSettings, StrengthItem } from "../../../models/entities";

const EMPTY_I18N: I18nText = { en: "", fr: "", ar: "" };

interface ContentFormValues {
  hero: {
    eyebrow: I18nText;
    titleLine1: I18nText;
    titleAccent: I18nText;
    intro: I18nText;
    ctaPrimaryLabel: I18nText;
    ctaSecondaryLabel: I18nText;
  };
  strengthsSection: { eyebrow: I18nText; title: I18nText };
  decorsSection: { eyebrow: I18nText; title: I18nText; discoverLabel: I18nText };
  cta: { title: I18nText; actionLabel: I18nText };
}

export const HomeContentFormPage = () => {
  const { t } = useTranslation();
  const { language } = useApp();
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();

  const [addStrengthOpen, setAddStrengthOpen] = useState(false);
  const [editStrength, setEditStrength] = useState<StrengthItem | null>(null);
  const [addDecorOpen, setAddDecorOpen] = useState(false);
  const [editDecor, setEditDecor] = useState<DecorItem | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: [queryKeys.SITE_SETTINGS],
    queryFn: () => siteSettingsService.get(),
  });

  const setSettings = (updated: SiteSettings) => queryClient.setQueryData([queryKeys.SITE_SETTINGS], updated);

  const { control, handleSubmit, reset } = useForm<ContentFormValues>({
    defaultValues: {
      hero: {
        eyebrow: EMPTY_I18N,
        titleLine1: EMPTY_I18N,
        titleAccent: EMPTY_I18N,
        intro: EMPTY_I18N,
        ctaPrimaryLabel: EMPTY_I18N,
        ctaSecondaryLabel: EMPTY_I18N,
      },
      strengthsSection: { eyebrow: EMPTY_I18N, title: EMPTY_I18N },
      decorsSection: { eyebrow: EMPTY_I18N, title: EMPTY_I18N, discoverLabel: EMPTY_I18N },
      cta: { title: EMPTY_I18N, actionLabel: EMPTY_I18N },
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        hero: {
          eyebrow: settings.hero.eyebrow,
          titleLine1: settings.hero.titleLine1,
          titleAccent: settings.hero.titleAccent,
          intro: settings.hero.intro,
          ctaPrimaryLabel: settings.hero.ctaPrimaryLabel,
          ctaSecondaryLabel: settings.hero.ctaSecondaryLabel,
        },
        strengthsSection: settings.strengthsSection,
        decorsSection: settings.decorsSection,
        cta: settings.cta,
      });
    }
  }, [settings, reset]);

  const saveText = useMutation<SiteSettings, unknown, ContentFormValues>({
    mutationFn: (values: ContentFormValues) => siteSettingsService.update(values),
    onSuccess: (updated) => {
      setSettings(updated);
      message.success(t("settings.home.sectionSaved"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const uploadHeroMain = useMutation<SiteSettings, unknown, File>({
    mutationFn: (file: File) => siteSettingsService.setHeroMainImage(file),
    onSuccess: (updated) => {
      setSettings(updated);
      message.success(t("settings.home.imageUploaded"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const uploadHeroAccent = useMutation<SiteSettings, unknown, File>({
    mutationFn: (file: File) => siteSettingsService.setHeroAccentImage(file),
    onSuccess: (updated) => {
      setSettings(updated);
      message.success(t("settings.home.imageUploaded"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const addStrength = useMutation<SiteSettings, unknown, I18nText>({
    mutationFn: (text: I18nText) => siteSettingsService.addStrength(text),
    onSuccess: (updated) => {
      setSettings(updated);
      setAddStrengthOpen(false);
      message.success(t("settings.home.sectionSaved"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const updateStrength = useMutation<SiteSettings, unknown, { id: string; text: I18nText }>({
    mutationFn: ({ id, text }: { id: string; text: I18nText }) => siteSettingsService.updateStrength(id, text),
    onSuccess: (updated) => {
      setSettings(updated);
      setEditStrength(null);
      message.success(t("settings.home.sectionSaved"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const removeStrength = useMutation<SiteSettings, unknown, string>({
    mutationFn: (id: string) => siteSettingsService.removeStrength(id),
    onSuccess: (updated) => { setSettings(updated); },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const addDecor = useMutation<SiteSettings, unknown, I18nText>({
    mutationFn: (title: I18nText) => siteSettingsService.addDecor(title),
    onSuccess: (updated) => {
      setSettings(updated);
      setAddDecorOpen(false);
      message.success(t("settings.home.sectionSaved"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const updateDecor = useMutation<SiteSettings, unknown, { id: string; title: I18nText }>({
    mutationFn: ({ id, title }: { id: string; title: I18nText }) => siteSettingsService.updateDecor(id, title),
    onSuccess: (updated) => {
      setSettings(updated);
      setEditDecor(null);
      message.success(t("settings.home.sectionSaved"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const removeDecor = useMutation<SiteSettings, unknown, string>({
    mutationFn: (id: string) => siteSettingsService.removeDecor(id),
    onSuccess: (updated) => { setSettings(updated); },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const uploadDecorImage = useMutation<SiteSettings, unknown, { id: string; file: File }>({
    mutationFn: ({ id, file }: { id: string; file: File }) => siteSettingsService.setDecorImage(id, file),
    onSuccess: (updated) => {
      setSettings(updated);
      message.success(t("settings.home.imageUploaded"));
    },
    onError: (err) => { message.error(getErrorMessage(err)); },
  });

  const heroMainUploadProps: UploadProps = {
    showUploadList: false,
    accept: "image/*",
    customRequest: ({ file, onSuccess, onError }) =>
      uploadHeroMain.mutate(file as File, { onSuccess: () => onSuccess?.({}), onError: (err) => onError?.(err as unknown as Error) }),
  };
  const heroAccentUploadProps: UploadProps = {
    showUploadList: false,
    accept: "image/*",
    customRequest: ({ file, onSuccess, onError }) =>
      uploadHeroAccent.mutate(file as File, { onSuccess: () => onSuccess?.({}), onError: (err) => onError?.(err as unknown as Error) }),
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold">{t("settings.home.title")}</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">{t("settings.home.subtitle")}</p>

      <form onSubmit={handleSubmit((values) => saveText.mutate(values))} className="space-y-6">
        <Card title={t("settings.home.heroSection")}>
          <I18nFieldGroup control={control} namePrefix="hero.eyebrow" label={t("settings.home.heroEyebrow") as string} />
          <I18nFieldGroup control={control} namePrefix="hero.titleLine1" label={t("settings.home.heroTitleLine1") as string} />
          <I18nFieldGroup control={control} namePrefix="hero.titleAccent" label={t("settings.home.heroTitleAccent") as string} />
          <I18nFieldGroup control={control} namePrefix="hero.intro" label={t("settings.home.heroIntro") as string} multiline />
          <I18nFieldGroup control={control} namePrefix="hero.ctaPrimaryLabel" label={t("settings.home.heroCtaPrimary") as string} />
          <I18nFieldGroup control={control} namePrefix="hero.ctaSecondaryLabel" label={t("settings.home.heroCtaSecondary") as string} />

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border mt-2">
            <div>
              <p className="text-sm font-medium mb-2">{t("settings.home.heroMainImage")}</p>
              {settings.hero.mainImage && (
                <img src={imageUrl(API_URL, settings.hero.mainImage)} alt="" className="w-full aspect-video object-cover rounded-md mb-2" />
              )}
              <Upload {...heroMainUploadProps}>
                <Button icon={<UploadOutlined />} loading={uploadHeroMain.isLoading} size="small">
                  {settings.hero.mainImage ? t("settings.home.replaceImage") : t("settings.home.uploadImage")}
                </Button>
              </Upload>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">{t("settings.home.heroAccentImage")}</p>
              {settings.hero.accentImage && (
                <img src={imageUrl(API_URL, settings.hero.accentImage)} alt="" className="w-full aspect-video object-cover rounded-md mb-2" />
              )}
              <Upload {...heroAccentUploadProps}>
                <Button icon={<UploadOutlined />} loading={uploadHeroAccent.isLoading} size="small">
                  {settings.hero.accentImage ? t("settings.home.replaceImage") : t("settings.home.uploadImage")}
                </Button>
              </Upload>
            </div>
          </div>
        </Card>

        <Card title={t("settings.home.strengthsSection")}>
          <I18nFieldGroup control={control} namePrefix="strengthsSection.eyebrow" label={t("settings.home.strengthsEyebrow") as string} />
          <I18nFieldGroup control={control} namePrefix="strengthsSection.title" label={t("settings.home.strengthsTitle") as string} />
        </Card>

        <Card title={t("settings.home.decorsSection")}>
          <I18nFieldGroup control={control} namePrefix="decorsSection.eyebrow" label={t("settings.home.decorsEyebrow") as string} />
          <I18nFieldGroup control={control} namePrefix="decorsSection.title" label={t("settings.home.decorsTitle") as string} />
          <I18nFieldGroup control={control} namePrefix="decorsSection.discoverLabel" label={t("settings.home.decorsDiscoverLabel") as string} />
        </Card>

        <Card title={t("settings.home.ctaSection")}>
          <I18nFieldGroup control={control} namePrefix="cta.title" label={t("settings.home.ctaTitle") as string} />
          <I18nFieldGroup control={control} namePrefix="cta.actionLabel" label={t("settings.home.ctaActionLabel") as string} />
        </Card>

        <Button type="primary" htmlType="submit" loading={saveText.isLoading}>
          {t("settings.home.saveSection")}
        </Button>
      </form>

      <Card
        title={t("settings.home.strengthsItems")}
        className="mt-6"
        extra={
          <Button size="small" icon={<PlusOutlined />} onClick={() => setAddStrengthOpen(true)}>
            {t("settings.home.addStrength")}
          </Button>
        }
      >
        {settings.strengths.length === 0 ? (
          <Empty description={false} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <ul className="space-y-2">
            {settings.strengths.map((item) => (
              <li key={item._id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                <span className="text-sm flex-1">{localize(item.text, language)}</span>
                <div className="flex gap-1">
                  <Button size="small" icon={<EditOutlined />} onClick={() => setEditStrength(item)} />
                  <Popconfirm title={t("settings.home.deleteStrengthConfirm")} onConfirm={() => removeStrength.mutate(item._id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title={t("settings.home.decorsItems")}
        className="mt-6"
        extra={
          <Button size="small" icon={<PlusOutlined />} onClick={() => setAddDecorOpen(true)}>
            {t("settings.home.addDecor")}
          </Button>
        }
      >
        {settings.decors.length === 0 ? (
          <Empty description={false} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {settings.decors.map((item) => (
              <div key={item._id} className="rounded-md border border-border p-3">
                {item.image ? (
                  <img src={imageUrl(API_URL, item.image)} alt="" className="w-full aspect-video object-cover rounded-md mb-2" />
                ) : (
                  <div className="w-full aspect-video bg-muted rounded-md mb-2" />
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium flex-1">{localize(item.title, language)}</span>
                  <Button size="small" icon={<EditOutlined />} onClick={() => setEditDecor(item)} />
                  <Popconfirm title={t("settings.home.deleteDecorConfirm")} onConfirm={() => removeDecor.mutate(item._id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
                <Upload
                  showUploadList={false}
                  accept="image/*"
                  customRequest={({ file, onSuccess, onError }) =>
                    uploadDecorImage.mutate(
                      { id: item._id, file: file as File },
                      { onSuccess: () => onSuccess?.({}), onError: (err) => onError?.(err as unknown as Error) },
                    )
                  }
                  className="mt-2 block"
                >
                  <Button size="small" icon={<UploadOutlined />} loading={uploadDecorImage.isLoading} block>
                    {item.image ? t("settings.home.replaceImage") : t("settings.home.uploadImage")}
                  </Button>
                </Upload>
              </div>
            ))}
          </div>
        )}
      </Card>

      <NameFormModal
        open={addStrengthOpen}
        title={t("settings.home.addStrength") as string}
        fieldLabel={t("settings.home.strengthText") as string}
        initialValue={EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={addStrength.isLoading}
        onSubmit={(text) => addStrength.mutate(text)}
        onClose={() => setAddStrengthOpen(false)}
      />
      <NameFormModal
        open={!!editStrength}
        title={t("settings.home.editStrength") as string}
        fieldLabel={t("settings.home.strengthText") as string}
        initialValue={editStrength?.text ?? EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={updateStrength.isLoading}
        onSubmit={(text) => editStrength && updateStrength.mutate({ id: editStrength._id, text })}
        onClose={() => setEditStrength(null)}
      />

      <NameFormModal
        open={addDecorOpen}
        title={t("settings.home.addDecor") as string}
        fieldLabel={t("settings.home.decorTitle") as string}
        initialValue={EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={addDecor.isLoading}
        onSubmit={(title) => addDecor.mutate(title)}
        onClose={() => setAddDecorOpen(false)}
      />
      <NameFormModal
        open={!!editDecor}
        title={t("settings.home.editDecor") as string}
        fieldLabel={t("settings.home.decorTitle") as string}
        initialValue={editDecor?.title ?? EMPTY_I18N}
        submitLabel={t("common.save") as string}
        loading={updateDecor.isLoading}
        onSubmit={(title) => editDecor && updateDecor.mutate({ id: editDecor._id, title })}
        onClose={() => setEditDecor(null)}
      />
    </div>
  );
};
