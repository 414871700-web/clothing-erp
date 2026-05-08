-- 服装ERP操作日志系统

-- ============================================
-- 操作日志表 (operation_logs)
-- ============================================
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

COMMENT ON TABLE operation_logs IS '操作日志表';
COMMENT ON COLUMN operation_logs.operation_type IS '操作类型：新增/修改/删除/审核/财务修改/库存修改';
COMMENT ON COLUMN operation_logs.module IS '操作模块';
COMMENT ON COLUMN operation_logs.record_id IS '操作记录ID';
COMMENT ON COLUMN operation_logs.record_name IS '操作记录名称';
COMMENT ON COLUMN operation_logs.old_value IS '修改前的值';
COMMENT ON COLUMN operation_logs.new_value IS '修改后的值';

-- ============================================
-- 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_operation_type ON operation_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_operation_logs_module ON operation_logs(module);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_operation_logs_record_id ON operation_logs(record_id);

-- ============================================
-- RLS策略
-- ============================================
ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;

-- 老板和管理员可以查看所有日志
DROP POLICY IF EXISTS "Boss and admin can view all logs" ON operation_logs;
CREATE POLICY "Boss and admin can view all logs" ON operation_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('老板', '管理员')
        )
    );

-- 用户可以查看自己的操作日志
DROP POLICY IF EXISTS "Users can view their own logs" ON operation_logs;
CREATE POLICY "Users can view their own logs" ON operation_logs
    FOR SELECT USING (auth.uid() = user_id);

-- 所有登录用户可以插入日志
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON operation_logs;
CREATE POLICY "Authenticated users can insert logs" ON operation_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 操作类型枚举
-- ============================================
INSERT INTO permissions (name, code, description) VALUES
('查看操作日志', 'logs:view', '查看操作日志'),
('管理操作日志', 'logs:manage', '管理操作日志')
ON CONFLICT (code) DO NOTHING;

-- 为老板和管理员添加日志权限
INSERT INTO role_permissions (role, permission_id)
SELECT '老板', id FROM permissions WHERE code = 'logs:view'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT '管理员', id FROM permissions WHERE code = 'logs:view'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT '老板', id FROM permissions WHERE code = 'logs:manage'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT '管理员', id FROM permissions WHERE code = 'logs:manage'
ON CONFLICT DO NOTHING;
