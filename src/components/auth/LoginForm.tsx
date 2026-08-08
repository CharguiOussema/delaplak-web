import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Input, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { authService } from "../../services/AuthService";
import { mergeGuestCartIntoServer } from "../../hooks/useCart";
import { useAuth } from "../../hooks";
import { getErrorMessage } from "../../utils/errorHandling";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}

export const LoginForm = ({ onSuccess, onSwitchToSignup }: LoginFormProps) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ defaultValues: { email: "", password: "" } });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await authService.login(values);
      login(res.accessToken);
      await mergeGuestCartIntoServer();
      onSuccess();
    } catch (error) {
      setServerError(getErrorMessage(error, t("auth.login.error")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-1">DeLAPLAK</h2>
        <p className="text-muted-foreground text-sm">{t("auth.login.subtitle")}</p>
      </div>

      {serverError && <Alert type="error" message={serverError} showIcon className="mb-4" />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("auth.login.emailLabel")}</label>
          <Controller
            name="email"
            control={control}
            rules={{ required: t("validation.required") as string }}
            render={({ field }) => (
              <Input {...field} size="large" prefix={<MailOutlined />} placeholder="you@example.com" autoComplete="email" />
            )}
          />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("auth.login.passwordLabel")}</label>
          <Controller
            name="password"
            control={control}
            rules={{ required: t("validation.required") as string }}
            render={({ field }) => <Input.Password {...field} size="large" prefix={<LockOutlined />} autoComplete="current-password" />}
          />
          {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
        </div>

        <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
          {t("auth.login.submit")}
        </Button>
      </form>

      <div className="text-center mt-6 text-sm text-muted-foreground">
        {t("auth.login.noAccount")}{" "}
        <button type="button" onClick={onSwitchToSignup} className="text-primary font-medium">
          {t("auth.signup.title")}
        </button>
      </div>
    </div>
  );
};
