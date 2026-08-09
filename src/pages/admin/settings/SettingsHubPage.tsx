import { Link } from "react-router-dom";
import { Card } from "antd";
import { HomeOutlined, SettingOutlined, RightOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export const SettingsHubPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      key: "home",
      to: "/settings/home",
      icon: <HomeOutlined className="text-2xl text-primary" />,
      title: t("settings.homeContent.title"),
      subtitle: t("settings.homeContent.subtitle"),
    },
    {
      key: "products",
      to: "/product-attributes",
      icon: <SettingOutlined className="text-2xl text-primary" />,
      title: t("settings.productSettings.title"),
      subtitle: t("settings.productSettings.subtitle"),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">{t("settings.subtitle")}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.key} to={section.to}>
            <Card hoverable className="h-full">
              <div className="flex items-start gap-3">
                {section.icon}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">{section.title}</h2>
                    <RightOutlined className="text-xs text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{section.subtitle}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
