import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Dropdown, Avatar, Button, Drawer, type MenuProps } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  GlobalOutlined,
  LogoutOutlined,
  LockOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuth, useApp, useAccess } from "../../hooks";
import { useQuery } from "react-query";
import { cartService } from "../../services/CartService";
import { queryKeys } from "../../services/QueryClientManager";
import { USER_ROLES } from "../../models/consts";

const LANGUAGE_LABELS: Record<string, string> = { en: "English", fr: "Français", ar: "العربية" };

export const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { language, setLanguage, isRTL } = useApp();
  const { isStaff } = useAccess();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: cart } = useQuery({
    queryKey: [queryKeys.CART],
    queryFn: () => cartService.getCart(),
    enabled: !!user && user.role === USER_ROLES.CLIENT,
    staleTime: 1000 * 30,
  });
  const cartCount = cart?.items?.reduce((sum, it) => sum + it.quantity, 0) ?? 0;

  const langMenu: MenuProps = {
    items: Object.entries(LANGUAGE_LABELS).map(([code, label]) => ({ key: code, label })),
    onClick: ({ key }) => setLanguage(key as "en" | "fr" | "ar"),
  };

  const userMenu: MenuProps = {
    items: [
      { key: "email", label: <span className="text-muted-foreground text-xs">{user?.email}</span>, disabled: true },
      { type: "divider" },
      { key: "orders", icon: <SettingOutlined />, label: t("navigation.myOrders") },
      { key: "profile", icon: <UserOutlined />, label: t("navigation.profile") },
      { key: "logout", icon: <LogoutOutlined />, label: t("auth.logout") },
    ],
    onClick: async ({ key }) => {
      if (key === "orders") navigate("/orders");
      if (key === "profile") navigate("/profile");
      if (key === "logout") {
        await logout();
        navigate("/login");
      }
    },
  };

  const navLinks = (
    <>
      <Link to="/" className="hover:text-primary transition-colors font-medium">
        {t("navigation.catalog")}
      </Link>
      <Link to="/orders" className="hover:text-primary transition-colors font-medium">
        {t("navigation.orders")}
      </Link>
      {isStaff && (
        <Dropdown
          menu={{
            items: [
              { key: "/users", label: <Link to="/users">{t("navigation.users")}</Link> },
              { key: "/categories", label: <Link to="/categories">{t("navigation.categories")}</Link> },
              { key: "/products", label: <Link to="/products">{t("navigation.products")}</Link> },
              { key: "/product-attributes", label: <Link to="/product-attributes">{t("navigation.productAttributes")}</Link> },
              { key: "/invoices", label: <Link to="/invoices">{t("navigation.invoices")}</Link> },
            ],
          }}
        >
          <span className="hover:text-primary transition-colors font-medium cursor-pointer flex items-center gap-1">
            {t("navigation.admin")} <SettingOutlined className="text-xs" />
          </span>
        </Dropdown>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold tracking-tight text-primary">DeLAPLAK</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">{navLinks}</nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Dropdown menu={langMenu} trigger={["click"]}>
            <Button type="text" icon={<GlobalOutlined />} className="hidden sm:inline-flex">
              {LANGUAGE_LABELS[language]}
            </Button>
          </Dropdown>

          {!isStaff && user && (
            <Link to="/cart">
              <Badge count={cartCount} size="small" offset={[-2, 2]}>
                <Button type="text" shape="circle" icon={<ShoppingCartOutlined className="text-lg" />} />
              </Badge>
            </Link>
          )}

          {user ? (
            <Dropdown menu={userMenu} trigger={["click"]}>
              <Avatar icon={<UserOutlined />} className="cursor-pointer bg-primary" />
            </Dropdown>
          ) : (
            <Link to="/login">
              <Button type="primary" icon={<LockOutlined />}>
                {t("auth.login.title")}
              </Button>
            </Link>
          )}

          <Button
            type="text"
            className="md:hidden"
            icon={<MenuOutlined />}
            onClick={() => setMobileOpen(true)}
          />
        </div>
      </div>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} placement={isRTL ? "left" : "right"} title="DeLAPLAK">
        <div className="flex flex-col gap-4 text-base" onClick={() => setMobileOpen(false)}>
          {navLinks}
        </div>
      </Drawer>
    </header>
  );
};
