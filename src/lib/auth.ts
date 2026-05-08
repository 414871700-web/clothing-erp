import { supabase } from './supabase';
import type { User, UserFormData, Permission, LoginCredentials, SignupCredentials } from '@/types/auth';

export const authApi = {
  async signIn(credentials: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user!.id)
      .single();

    if (profileError) throw profileError;

    await supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user!.id);

    return profile as User;
  },

  async signUp(credentials: SignupCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.full_name,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return null;
    return profile as User;
  },

  async getUserPermissions(role: string) {
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        *,
        permission:permissions(*)
      `)
      .eq('role', role);

    if (error) throw error;
    return data || [];
  },
};

export const userApi = {
  async getUsers() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUser(id: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<UserFormData>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserRole(id: string, role: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUser(id: string) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
  },

  async toggleUserStatus(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const permissionApi = {
  async getAllPermissions() {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getRolePermissions(role: string) {
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        *,
        permission:permissions(*)
      `)
      .eq('role', role);

    if (error) throw error;
    return data || [];
  },

  async assignPermissions(role: string, permissionIds: string[]) {
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role', role);

    const insertData = permissionIds.map(permissionId => ({
      role,
      permission_id: permissionId,
    }));

    if (insertData.length > 0) {
      const { error } = await supabase
        .from('role_permissions')
        .insert(insertData);

      if (error) throw error;
    }
  },
};
