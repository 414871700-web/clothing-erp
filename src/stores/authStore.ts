import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, SignupCredentials } from '@/types/auth';
import { authApi } from '@/lib/auth';

interface AuthState {
  user: User | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignupCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signIn: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.signIn(credentials);
          const permissions = await authApi.getUserPermissions(user.role);
          
          set({
            user,
            permissions: permissions.map((p: any) => p.permission?.code || p.permission_id),
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || '登录失败，请检查邮箱和密码',
          });
          throw error;
        }
      },

      signUp: async (credentials: SignupCredentials) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.signUp(credentials);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || '注册失败',
          });
          throw error;
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await authApi.signOut();
          set({
            user: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || '退出登录失败',
          });
          throw error;
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          
          if (user) {
            const permissions = await authApi.getUserPermissions(user.role);
            set({
              user,
              permissions: permissions.map((p: any) => p.permission?.code || p.permission_id),
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              permissions: [],
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            user: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      hasPermission: (permission: string) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },

      hasAnyPermission: (perms: string[]) => {
        const { permissions } = get();
        return perms.some(p => permissions.includes(p));
      },

      hasAllPermissions: (perms: string[]) => {
        const { permissions } = get();
        return perms.every(p => permissions.includes(p));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
