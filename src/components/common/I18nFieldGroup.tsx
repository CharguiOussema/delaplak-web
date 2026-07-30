import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Tabs, Input } from "antd";
import { useTranslation } from "react-i18next";

interface I18nFieldGroupProps<T extends FieldValues> {
  control: Control<T>;
  namePrefix: string;
  label: string;
  multiline?: boolean;
  /**
   * Minimum number of the 3 languages that must be filled in.
   * Defaults to requiring ALL 3 (the historical behavior). Pass 0 to make the whole
   * group optional, or 1 to require at least one language (e.g. Category name/description,
   * where the backend auto-fills the rest from whichever language was provided).
   */
  minRequired?: number;
}

const LANGS = ["en", "fr", "ar"] as const;
const LANG_LABELS: Record<(typeof LANGS)[number], string> = { en: "English", fr: "Français", ar: "العربية" };

export function I18nFieldGroup<T extends FieldValues>({ control, namePrefix, label, multiline, minRequired = 3 }: I18nFieldGroupProps<T>) {
  const { t } = useTranslation();
  const relaxed = minRequired < 3;

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
              rules={
                relaxed
                  ? minRequired > 0
                    ? {
                        validate: (_value, formValues) => {
                          const group = (formValues as Record<string, unknown>)[namePrefix] as
                            | Record<string, unknown>
                            | undefined;
                          const filled = LANGS.filter((l) => String(group?.[l] ?? "").trim().length > 0).length;
                          return filled >= minRequired || (t("validation.atLeastOneLanguage") as string);
                        },
                      }
                    : {}
                  : { required: t("validation.required") as string }
              }
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

/** Converts empty/untouched language inputs to `undefined` so the backend's
 * first-non-empty-wins auto-fill logic works correctly (an explicit "" would defeat it). */
export function cleanI18nText(
  value: Partial<Record<(typeof LANGS)[number], string>> | undefined,
): Partial<Record<(typeof LANGS)[number], string>> | undefined {
  if (!value) return undefined;
  const cleaned: Partial<Record<(typeof LANGS)[number], string>> = {};
  for (const lang of LANGS) {
    const v = value[lang];
    if (typeof v === "string" && v.trim().length > 0) {
      cleaned[lang] = v;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}
