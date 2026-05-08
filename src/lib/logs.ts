import { supabase } from './supabase';
import type { OperationLog, CreateLogParams, OperationType, ModuleType } from '@/types/logs';

export const logsApi = {
  async createLog(params: CreateLogParams) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('[日志] 未登录用户，跳过记录操作日志');
        return null;
      }

      let userName = user.email || '未知用户';
      
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.warn('[日志] 获取用户信息失败:', profileError);
        } else if (profile?.full_name) {
          userName = profile.full_name;
        }
      } catch (profileErr) {
        console.warn('[日志] 获取用户信息异常:', profileErr);
      }

      const logData = {
        user_id: user.id,
        user_name: userName,
        operation_type: params.operationType,
        module: params.module,
        record_id: params.recordId || null,
        record_name: params.recordName || null,
        description: params.description || null,
        old_value: params.oldValue || null,
        new_value: params.newValue || null,
        ip_address: null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      };

      console.log('[日志] 准备插入日志:', logData);

      const { data, error } = await supabase
        .from('operation_logs')
        .insert(logData)
        .select()
        .single();

      if (error) {
        console.error('[日志] 插入操作日志失败:', error);
        throw error;
      }

      console.log('[日志] 操作日志记录成功:', data.id);
      return data;
    } catch (err) {
      console.error('[日志] 记录操作日志时发生异常:', err);
      return null;
    }
  },

  async getLogs(filters: {
    userId?: string;
    operationType?: OperationType;
    module?: ModuleType;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    let query = supabase
      .from('operation_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.operationType) {
      query = query.eq('operation_type', filters.operationType);
    }

    if (filters.module) {
      query = query.eq('module', filters.module);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate + 'T23:59:59');
    }

    if (filters.searchTerm) {
      query = query.or(
        `user_name.ilike.%${filters.searchTerm}%,` +
        `record_name.ilike.%${filters.searchTerm}%,` +
        `description.ilike.%${filters.searchTerm}%`
      );
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('[日志] 获取操作日志失败:', error);
      throw error;
    }

    return {
      logs: data || [],
      total: count || 0,
    };
  },

  async getLogById(id: string) {
    const { data, error } = await supabase
      .from('operation_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLog(id: string) {
    const { error } = await supabase
      .from('operation_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getModules() {
    const { data, error } = await supabase
      .from('operation_logs')
      .select('module')
      .limit(1000);

    if (error) throw error;
    const modules = data?.map(item => item.module).filter(Boolean) || [];
    return [...new Set(modules)];
  },

  async getUsers() {
    const { data, error } = await supabase
      .from('operation_logs')
      .select('user_id, user_name')
      .limit(1000);

    if (error) throw error;
    const uniqueUsers = new Map();
    data?.forEach(item => {
      if (!uniqueUsers.has(item.user_id)) {
        uniqueUsers.set(item.user_id, item.user_name);
      }
    });
    return Array.from(uniqueUsers, ([user_id, user_name]) => ({ user_id, user_name }));
  },
};
