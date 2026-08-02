import { ConfigProvider, App as AntdApp } from "antd";
import enUS from "antd/locale/en_US";
import frFR from "antd/locale/fr_FR";
import arEG from "antd/locale/ar_EG";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "react-query";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProtectedModuleRoute } from "./components/ProtectedModuleRoute";
import { MainLayout } from "./components/layout/MainLayout";
import { useApp } from "./hooks";
import { queryClientManager } from "./services/QueryClientManager";
import { palette, radius, shadow } from "./theme/tokens";

import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
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
import { NotFoundPage } from "./pages/errors/NotFoundPage";

const queryClient = queryClientManager.getQueryClient();

const ANTD_LOCALES = { en: enUS, fr: frFR, ar: arEG };

// Deviation 6: original DeLAPLAK design system — vivid rose/violet primary,
// layered on the CSS-variable tokens in index.css. Not a copy of
// delaplak.com's palette. Values come from ./theme/tokens.ts (single source
// of truth, also mirrored as CSS vars in index.css for Tailwind utilities).
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
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
          fontSize: 14,
          colorBgLayout: palette.slate[50],
        },
        components: {
          Button: {
            fontWeight: 500,
            borderRadius: radius.pill,
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
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedRoute requireAuth={false}>
                <SignupPage />
              </ProtectedRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<CatalogPage />} />
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
                <ProtectedModuleRoute module="cart">
                  <CheckoutPage />
                </ProtectedModuleRoute>
              }
            />

            <Route path="/orders" element={<OrdersListPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />

            <Route path="/invoices" element={<InvoicesListPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

            <Route path="/profile" element={<ProfilePage />} />

            {/* users (ADMIN only) */}
            <Route
              path="/users"
              element={
                <ProtectedModuleRoute module="users">
                  <UsersListPage />
                </ProtectedModuleRoute>
              }
            />
            <Route
              path="/users/add"
              element={
                <ProtectedModuleRoute module="users" writeOnly>
                  <UserFormPage />
                </ProtectedModuleRoute>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <ProtectedModuleRoute module="users" writeOnly>
                  <UserFormPage />
                </ProtectedModuleRoute>
              }
            />

            {/* categories */}
            <Route
              path="/categories"
              element={
                <ProtectedModuleRoute module="categories">
                  <CategoriesListPage />
                </ProtectedModuleRoute>
              }
            />
            <Route
              path="/categories/add"
              element={
                <ProtectedModuleRoute module="categories" writeOnly>
                  <CategoryFormPage />
                </ProtectedModuleRoute>
              }
            />
            <Route
              path="/categories/:id/edit"
              element={
                <ProtectedModuleRoute module="categories" writeOnly>
                  <CategoryFormPage />
                </ProtectedModuleRoute>
              }
            />

            {/* products admin list */}
            <Route
              path="/products"
              element={
                <ProtectedModuleRoute module="products">
                  <ProductsListPage />
                </ProtectedModuleRoute>
              }
            />
            <Route
              path="/products/add"
              element={
                <ProtectedModuleRoute module="products" writeOnly>
                  <ProductFormPage />
                </ProtectedModuleRoute>
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <ProtectedModuleRoute module="products" writeOnly>
                  <ProductFormPage />
                </ProtectedModuleRoute>
              }
            />

            {/* product settings: attribute types (Texture/Thickness/Dimensions...) + options */}
            <Route
              path="/product-attributes"
              element={
                <ProtectedModuleRoute module="productAttributes">
                  <ProductAttributesPage />
                </ProtectedModuleRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
            <AppContent />
          </AuthProvider>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
