import { Result, Button } from "antd";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Result
        status="404"
        title="404"
        subTitle={t("errors.notFound")}
        extra={
          <Link to="/">
            <Button type="primary">{t("catalog.title")}</Button>
          </Link>
        }
      />
    </div>
  );
};
