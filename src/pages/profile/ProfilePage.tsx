import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Button, Card, Input, Select, Alert, App as AntdApp } from "antd";
import { useTranslation } from "react-i18next";
import { authService } from "../../services/AuthService";
import { useAuth } from "../../hooks";
import { getErrorMessage } from "../../utils/errorHandling";
import { LANGUAGES } from "../../models/consts";

interface ProfileFormValues {
  email: string;
  preferredLanguage: LANGUAGES;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
}

const LANGUAGE_LABELS: Record<LANGUAGES, string> = {
  [LANGUAGES.en]: "English",
  [LANGUAGES.fr]: "Français",
  [LANGUAGES.ar]: "العربية",
};

export const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, refetchUser } = useAuth();
  const { message } = AntdApp.useApp();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    defaultValues: { email: "", preferredLanguage: LANGUAGES.en },
  });

  useEffect(() => {
    if (user) {
      resetProfile({ email: user.email, preferredLanguage: user.preferredLanguage });
    }
  }, [user, resetProfile]);

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const profileMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => authService.updateProfile(values),
    onSuccess: () => {
      setProfileError(null);
      message.success(t("profile.updateSuccess"));
      refetchUser();
    },
    onError: (err) => setProfileError(getErrorMessage(err)),
  });

  const passwordMutation = useMutation({
    mutationFn: (values: PasswordFormValues) => authService.updatePassword(values),
    onSuccess: () => {
      setPasswordError(null);
      message.success(t("profile.passwordUpdateSuccess"));
      resetPassword({ currentPassword: "", newPassword: "" });
    },
    onError: (err) => setPasswordError(getErrorMessage(err)),
  });

  const languageOptions = Object.values(LANGUAGES).map((code) => ({ label: LANGUAGE_LABELS[code], value: code }));

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">{t("profile.title")}</h1>

        <Card>
          {profileError && <Alert type="error" message={profileError} showIcon className="mb-4" />}

          <form onSubmit={handleProfileSubmit((v) => profileMutation.mutate(v))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("profile.email")}</label>
              <Controller
                name="email"
                control={profileControl}
                rules={{ required: t("validation.required") as string }}
                render={({ field }) => <Input {...field} />}
              />
              {profileErrors.email && <p className="text-destructive text-xs mt-1">{profileErrors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("profile.language")}</label>
              <Controller
                name="preferredLanguage"
                control={profileControl}
                render={({ field }) => <Select {...field} options={languageOptions} className="w-full" />}
              />
            </div>

            <div className="pt-2">
              <Button type="primary" htmlType="submit" loading={profileMutation.isLoading}>
                {t("common.save")}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6">{t("profile.changePassword")}</h2>

        <Card>
          {passwordError && <Alert type="error" message={passwordError} showIcon className="mb-4" />}

          <form onSubmit={handlePasswordSubmit((v) => passwordMutation.mutate(v))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("profile.currentPassword")}</label>
              <Controller
                name="currentPassword"
                control={passwordControl}
                rules={{ required: t("validation.required") as string }}
                render={({ field }) => <Input.Password {...field} autoComplete="current-password" />}
              />
              {passwordErrors.currentPassword && (
                <p className="text-destructive text-xs mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("profile.newPassword")}</label>
              <Controller
                name="newPassword"
                control={passwordControl}
                rules={{
                  required: t("validation.required") as string,
                  minLength: { value: 8, message: t("validation.minLength", { count: 8 }) as string },
                }}
                render={({ field }) => <Input.Password {...field} autoComplete="new-password" />}
              />
              {passwordErrors.newPassword && (
                <p className="text-destructive text-xs mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Button type="primary" htmlType="submit" loading={passwordMutation.isLoading}>
                {t("profile.changePassword")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
