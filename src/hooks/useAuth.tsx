import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

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
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return null;
}
