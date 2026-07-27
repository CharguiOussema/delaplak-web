import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Tabs, Input } from "antd";
import { useTranslation } from "react-i18next";

interface I18nFieldGroupProps<T extends FieldValues> {
  control: Control<T>;
  namePrefix: string;
  label: string;
  multiline?: boolean;
}

const LANGS = ["en", "fr", "ar"] as const;
const LANG_LABELS: Record<(typeof LANGS)[number], string> = { en: "English", fr: "Français", ar: "العربية" };

export function I18nFieldGroup<T extends FieldValues>({ control, namePrefix, label, multiline }: I18nFieldGroupProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Tabs
        size="small"
        items={LANGS.map((lang) => ({
          key: lang,
          label: LANG_LABELS[lang],
          children: (
            <Controller
              name={`${namePrefix}.${lang}` as Path<T>}
              control={control}
              rules={{ required: t("validation.required") as string }}
              render={({ field, fieldState }) => (
                <div>
                  {multiline ? (
                    <Input.TextArea {...field} rows={3} dir={lang === "ar" ? "rtl" : "ltr"} />
                  ) : (
                    <Input {...field} dir={lang === "ar" ? "rtl" : "ltr"} />
                  )}
                  {fieldState.error && <p className="text-destructive text-xs mt-1">{fieldState.error.message}</p>}
                </div>
              )}
            />
          ),
        }))}
      />
    </div>
  );
}
