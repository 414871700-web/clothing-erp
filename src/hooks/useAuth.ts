import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLocation, Navigate } from 'react-router-dom';
import { PERMISSION_CODES, MENU_PERMISSIONS } from '@/types/auth';

export function useAuth() {
  const { user, permissions, isAuthenticated, checkAuth, hasPermission } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    permissions,
    isAuthenticated,
    hasPermission,
  };
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return null;
}

export function useRequirePermission(permission: string) {
  const { hasPermission, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return false;
  }

  return hasPermission(permission);
}

export function useCanAccessMenu(path: string) {
  const { hasPermission, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return false;
  }

  const menuPermission = MENU_PERMISSIONS.find(m => m.path === path);
  
  if (!menuPermission) {
    return true;
  }

  return hasPermission(menuPermission.permission);
}

export function useCanEdit() {
  const { hasPermission, isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return false;
  }

  if (user?.role === '老板' || user?.role === '管理员') {
    return true;
  }

  return hasPermission(PERMISSION_CODES.USERS_MANAGE);
}

export function useCanDelete() {
  const { hasPermission, isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return false;
  }

  if (user?.role === '老板' || user?.role === '管理员') {
    return true;
  }

  return false;
}

export function usePagePermissions(pagePermissions: string[]) {
  const { hasAnyPermission, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return false;
  }

  return hasAnyPermission(pagePermissions);
}
