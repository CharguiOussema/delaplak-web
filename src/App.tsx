import { ConfigProvider, App as AntdApp } from "antd";
import enUS from "antd/locale/en_US";
import frFR from "antd/locale/fr_FR";
import arEG from "antd/locale/ar_EG";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "react-query";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthModalProvider } from "./contexts/AuthModalContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProtectedModuleRoute } from "./components/ProtectedModuleRoute";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthModal } from "./components/auth/AuthModal";
import { useApp } from "./hooks";
import { queryClientManager } from "./services/QueryClientManager";
import { palette, radius, shadow } from "./theme/tokens";

import { HomePage } from "./pages/home/HomePage";
import { CatalogPage } from "./pages/catalog/CatalogPage";
import { ProductDetailPage } from "./pages/product/ProductDetailPage";
import { CartPage } from "./pages/cart/CartPage";
import { CheckoutPage } from "./pages/checkout/CheckoutPage";
import { OrdersListPage } from "./pages/orders/OrdersListPage";
import { OrderDetailPage } from "./pages/orders/OrderDetailPage";
import { InvoicesListPage } from "./pages/invoices/InvoicesListPage";
import { InvoiceDetailPage } from "./pages/invoices/InvoiceDetailPage";
import { UsersListPage } from "./pages/admin/users/UsersListPage";
import { UserFormPage } from "./pages/admin/users/UserFormPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { CategoriesListPage } from "./pages/admin/categories/CategoriesListPage";
import { CategoryFormPage } from "./pages/admin/categories/CategoryFormPage";
import { ProductsListPage } from "./pages/admin/products/ProductsListPage";
import { ProductFormPage } from "./pages/admin/products/ProductFormPage";
import { ProductAttributesPage } from "./pages/admin/productAttributes/ProductAttributesPage";
import { SettingsHubPage } from "./pages/admin/settings/SettingsHubPage";
import { HomeContentFormPage } from "./pages/admin/settings/HomeContentFormPage";
import { NotFoundPage } from "./pages/errors/NotFoundPage";

const queryClient = queryClientManager.getQueryClient();

const ANTD_LOCALES = { en: enUS, fr: frFR, ar: arEG };

// DeLAPLAK design system — warm ivory/brass palette inspired by the "Atelier"
// reference template, extended with the brand logo's blue accent, layered on
// the CSS-variable tokens in index.css. Values come from ./theme/tokens.ts
// (single source of truth, also mirrored as CSS vars in index.css).
const AntdThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { isRTL, language } = useApp();

  return (
    <ConfigProvider
      direction={isRTL ? "rtl" : "ltr"}
      locale={ANTD_LOCALES[language]}
      theme={{
        token: {
          colorPrimary: palette.primary[500],
          colorInfo: palette.info[500],
          colorSuccess: palette.success[500],
          colorWarning: palette.warning[500],
          colorError: palette.danger[500],
          colorLink: palette.primary[500],
          borderRadius: radius.md,
          controlHeight: 38,
          fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
          fontSize: 14,
          colorBgLayout: palette.slate[50],
        },
        components: {
          Button: {
            fontWeight: 500,
            borderRadius: radius.md,
            primaryShadow: shadow.softPrimary,
          },
          Card: {
            borderRadiusLG: radius.lg,
            boxShadowTertiary: shadow.card,
          },
          Menu: { itemSelectedBg: palette.primary[100] },
          Input: { activeShadow: `0 0 0 3px ${palette.primary[500]}26` },
          Select: { optionSelectedBg: palette.primary[100] },
          Tag: { borderRadiusSM: radius.pill },
          Table: {
            headerBg: palette.slate[50],
            headerColor: palette.slate[900],
            cellPaddingBlock: 14,
            rowHoverBg: palette.primary[100],
            borderRadius: radius.lg,
          },
          Modal: { titleFontSize: 18, borderRadiusLG: radius.lg },
          Alert: { borderRadiusLG: radius.md },
          Typography: { titleMarginBottom: "0.4em", fontWeightStrong: 700 },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};

const AppContent = () => {
  return (
    <AntdThemeProvider>
      <Router>
        <Routes>
          {/* Home, catalog, product detail and cart are public — anyone can browse and
              add to cart without an account. Sign in/up happen in a modal (AuthModal),
              triggered from the Navbar or from a protected action like Checkout. */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route
              path="/cart"
              element={
                <ProtectedModuleRoute module="cart">
                  <CartPage />
                </ProtectedModuleRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="cart">
                    <CheckoutPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />

            <Route path="/orders" element={<ProtectedRoute><OrdersListPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

            <Route path="/invoices" element={<ProtectedRoute><InvoicesListPage /></ProtectedRoute>} />
            <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* users (ADMIN only) */}
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="users">
                    <UsersListPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/add"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="users" writeOnly>
                    <UserFormPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="users" writeOnly>
                    <UserFormPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />

            {/* categories */}
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="categories">
                    <CategoriesListPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories/add"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="categories" writeOnly>
                    <CategoryFormPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories/:id/edit"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="categories" writeOnly>
                    <CategoryFormPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />

            {/* products admin list */}
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="products">
                    <ProductsListPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/add"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="products" writeOnly>
                    <ProductFormPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="products" writeOnly>
                    <ProductFormPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />

            {/* product settings: attribute types (Texture/Thickness/Dimensions...) + options */}
            <Route
              path="/product-attributes"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="productAttributes">
                    <ProductAttributesPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />

            {/* settings hub: home page content + a link into product settings above */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="siteSettings">
                    <SettingsHubPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/home"
              element={
                <ProtectedRoute>
                  <ProtectedModuleRoute module="siteSettings" writeOnly>
                    <HomeContentFormPage />
                  </ProtectedModuleRoute>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AuthModal />
      </Router>
    </AntdThemeProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <AuthProvider>
            <AuthModalProvider>
              <AppContent />
            </AuthModalProvider>
          </AuthProvider>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
