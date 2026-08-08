import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Input, Alert } from "antd";
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { authService } from "../../services/AuthService";
import { mergeGuestCartIntoServer } from "../../hooks/useCart";
import { useAuth } from "../../hooks";
import { getErrorMessage } from "../../utils/errorHandling";

const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,19}$/;

interface SignupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
}

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const SignupForm = ({ onSuccess, onSwitchToLogin }: SignupFormProps) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: { email: "", password: "", confirmPassword: "", fullName: "", phone: "" },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await authService.signup({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
      });
      login(res.accessToken);
      await mergeGuestCartIntoServer();
      onSuccess();
    } catch (error) {
      setServerError(getErrorMessage(error, t("auth.signup.error")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-1">DeLAPLAK</h2>
        <p className="text-muted-foreground text-sm">{t("auth.signup.subtitle")}</p>
      </div>

      {serverError && <Alert type="error" message={serverError} showIcon className="mb-4" />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("auth.signup.fullNameLabel")}</label>
          <Controller
            name="fullName"
            control={control}
            rules={{ required: t("validation.required") as string }}
            render={({ field }) => <Input {...field} size="large" prefix={<UserOutlined />} />}
          />
          {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("auth.signup.phoneLabel")}</label>
          <Controller
            name="phone"
            control={control}
            rules={{
              required: t("validation.required") as string,
              pattern: { value: PHONE_PATTERN, message: t("validation.invalidPhone") as string },
            }}
            render={({ field }) => <Input {...field} size="large" prefix={<PhoneOutlined />} placeholder="+212600000000" />}
          />
          {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("auth.login.emailLabel")}</label>
          <Controller
            name="email"
            control={control}
            rules={{ required: t("validation.required") as string }}
            render={({ field }) => <Input {...field} size="large" prefix={<MailOutlined />} placeholder="you@example.com" />}
          />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("auth.login.passwordLabel")}</label>
          <Controller
            name="password"
            control={control}
            rules={{
              required: t("validation.required") as string,
              minLength: { value: 8, message: t("validation.minLength", { count: 8 }) as string },
            }}
            render={({ field }) => <Input.Password {...field} size="large" prefix={<LockOutlined />} />}
          />
          {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("auth.signup.confirmPasswordLabel")}</label>
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: t("validation.required") as string,
              validate: (value) => value === watch("password") || (t("auth.signup.passwordMismatch") as string),
            }}
            render={({ field }) => <Input.Password {...field} size="large" prefix={<LockOutlined />} />}
          />
          {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
          {t("auth.signup.submit")}
        </Button>
      </form>

      <div className="text-center mt-6 text-sm text-muted-foreground">
        {t("auth.signup.haveAccount")}{" "}
        <button type="button" onClick={onSwitchToLogin} className="text-primary font-medium">
          {t("auth.login.title")}
        </button>
      </div>
    </div>
  );
};
