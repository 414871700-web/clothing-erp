import { create } from 'zustand';
import type { User, UserFormData } from '@/types/auth';
import { userApi } from '@/lib/auth';

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  submitting: boolean;

  fetchUsers: () => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  updateUser: (id: string, data: Partial<UserFormData>) => Promise<void>;
  updateUserRole: (id: string, role: string) => Promise<void>;
  toggleUserStatus: (id: string, isActive: boolean) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUser: null,
  loading: false,
  submitting: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const users = await userApi.getUsers();
      set({ users, loading: false });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  fetchUser: async (id: string) => {
    set({ loading: true });
    try {
      const user = await userApi.getUser(id);
      set({ currentUser: user, loading: false });
    } catch (error) {
      console.error('获取用户详情失败:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateUser: async (id: string, data: Partial<UserFormData>) => {
    set({ submitting: true });
    try {
      await userApi.updateUser(id, data);
      set({ submitting: false });
      await get().fetchUsers();
    } catch (error) {
      console.error('更新用户失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  updateUserRole: async (id: string, role: string) => {
    set({ submitting: true });
    try {
      await userApi.updateUserRole(id, role);
      set({ submitting: false });
      await get().fetchUsers();
    } catch (error) {
      console.error('更新用户角色失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  toggleUserStatus: async (id: string, isActive: boolean) => {
    set({ submitting: true });
    try {
      await userApi.toggleUserStatus(id, isActive);
      set({ submitting: false });
      await get().fetchUsers();
    } catch (error) {
      console.error('切换用户状态失败:', error);
      set({ submitting: false });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ loading: true });
    try {
      await userApi.deleteUser(id);
      set({ loading: false });
      await get().fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
      set({ loading: false });
      throw error;
    }
  },
}));
