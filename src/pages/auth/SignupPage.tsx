import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { Button, Card, Input, Alert, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { authService } from "../../services/AuthService";
import { useAuth } from "../../hooks";
import { getErrorMessage } from "../../utils/errorHandling";

interface SignupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignupPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({ defaultValues: { email: "", password: "", confirmPassword: "" } });

  const onSubmit = async (values: SignupFormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await authService.signup({ email: values.email, password: values.password });
      login(res.accessToken);
      navigate("/", { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error, t("auth.signup.error")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <Typography.Title level={2} className="!mb-1 !text-primary">
            DeLAPLAK
          </Typography.Title>
          <Typography.Text type="secondary">{t("auth.signup.subtitle")}</Typography.Text>
        </div>

        {serverError && <Alert type="error" message={serverError} showIcon className="mb-4" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Link to="/login" className="text-primary font-medium">
            {t("auth.login.title")}
          </Link>
        </div>
      </Card>
    </div>
  );
};
