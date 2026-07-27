import { useAuth } from './useAuth';
import { USER_ROLES } from '../models/consts';

// Extended per deviation: every admin-facing module registered here.
// There is now a single staff role (ADMIN) — no tiered SUPER_ADMIN distinction.
export type AccessModule = 'users' | 'categories' | 'products' | 'cart' | 'orders' | 'invoices';

const ADMIN_ONLY_WRITE_MODULES: AccessModule[] = ['users', 'categories', 'products', 'orders'];

export const useAccess = () => {
  const { user } = useAuth();

  const isStaff = (): boolean => !!user && user.role === USER_ROLES.ADMIN;
  const isAdmin = (): boolean => !!user && user.role === USER_ROLES.ADMIN;

  const hasAccess = (module: AccessModule): boolean => {
    if (!user) return false;
    if (module === 'cart') {
      // Backend's cart router is CLIENT_ONLY — staff get a 403 there.
      return user.role === USER_ROLES.CLIENT;
    }
    if (module === 'orders' || module === 'invoices') {
      // All authenticated roles can read these (ownership/staff scoping handled server-side).
      return true;
    }
    // users / categories / products: staff-only browse+manage areas.
    return isStaff();
  };

  const canWrite = (module: AccessModule): boolean => {
    if (!user) return false;
    if (ADMIN_ONLY_WRITE_MODULES.includes(module)) {
      return isAdmin();
    }
    return false;
  };

  return { hasAccess, canWrite, isStaff: isStaff(), isAdmin: isAdmin() };
};
