import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Navigate, useLocation } from 'react-router-dom';
import { PERMISSION_CODES } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: string[];
  requireAll?: boolean;
}

export function ProtectedRoute({ children, permissions = [], requireAll = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
          <p className="text-xl font-medium mb-2">权限不足</p>
          <p className="text-sm">您没有权限访问此页面</p>
        </div>
      );
    }
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== '老板' && user?.role !== '管理员') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <p className="text-xl font-medium mb-2">权限不足</p>
        <p className="text-sm">此页面仅管理员可访问</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function CanAccess({ 
  children, 
  permission,
  fallback = null 
}: { 
  children: React.ReactNode; 
  permission: string;
  fallback?: React.ReactNode;
}) {
  const { hasPermission, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

export function CanEdit({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { user, isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (user?.role === '老板' || user?.role === '管理员') {
    return <>{children}</>;
  }

  if (hasPermission(PERMISSION_CODES.USERS_MANAGE)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export function CanDelete({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { user, isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (user?.role === '老板' || user?.role === '管理员') {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
