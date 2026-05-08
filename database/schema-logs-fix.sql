-- 操作日志系统修复脚本
-- 运行此脚本修复RLS策略问题

-- 1. 确保 operation_logs 表存在
CREATE TABLE IF NOT EXISTS operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    record_id UUID,
    record_name VARCHAR(255),
    description TEXT,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_operation_type ON operation_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_operation_logs_module ON operation_logs(module);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operation_logs_record_id ON operation_logs(record_id);

-- 3. 删除旧策略
DROP POLICY IF EXISTS "Boss and admin can view all logs" ON operation_logs;
DROP POLICY IF EXISTS "Users can view their own logs" ON operation_logs;
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON operation_logs;

-- 4. 启用RLS
ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;

-- 5. 创建新策略：允许所有登录用户查看日志
CREATE POLICY "Allow authenticated users to view logs" ON operation_logs
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- 6. 创建新策略：允许所有登录用户插入日志
CREATE POLICY "Allow authenticated users to insert logs" ON operation_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 7. 创建新策略：允许用户更新自己的日志（如果需要）
CREATE POLICY "Allow users to update own logs" ON operation_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 8. 创建新策略：允许用户删除自己的日志（如果需要）
CREATE POLICY "Allow users to delete own logs" ON operation_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- 9. 确保 user_profiles 表可以被查询（禁用RLS或添加策略）
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 10. 添加日志权限到角色表
INSERT INTO permissions (name, code, description) VALUES
('查看操作日志', 'logs:view', '查看操作日志'),
('管理操作日志', 'logs:manage', '管理操作日志')
ON CONFLICT (code) DO NOTHING;

-- 11. 为所有角色添加日志查看权限（方便测试）
INSERT INTO role_permissions (role, permission_id)
SELECT '老板', id FROM permissions WHERE code = 'logs:view'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT '管理员', id FROM permissions WHERE code = 'logs:view'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT '仓库', id FROM permissions WHERE code = 'logs:view'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT '销售', id FROM permissions WHERE code = 'logs:view'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT '财务', id FROM permissions WHERE code = 'logs:view'
ON CONFLICT DO NOTHING;

-- 12. 验证：测试插入一条日志
-- INSERT INTO operation_logs (user_id, user_name, operation_type, module, description)
-- VALUES (auth.uid(), 'Test User', '测试', '系统', '测试日志记录功能');
