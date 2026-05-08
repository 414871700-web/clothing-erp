-- 服装ERP权限系统
-- 基于Supabase Auth

-- ============================================
-- 1. 用户档案表 (user_profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT '仓库',
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS '用户档案表';
COMMENT ON COLUMN user_profiles.role IS '角色：老板/仓库/销售/财务/管理员';

-- ============================================
-- 2. 权限表 (permissions)
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE permissions IS '权限表';
COMMENT ON COLUMN permissions.code IS '权限代码';

-- ============================================
-- 3. 角色权限关联表 (role_permissions)
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

COMMENT ON TABLE role_permissions IS '角色权限关联表';

-- ============================================
-- 4. 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);

-- ============================================
-- 5. RLS策略
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- 用户档案：登录用户可以查看自己的档案，管理员可以查看所有
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = '管理员'
        )
    );

-- 权限表：只有管理员可以管理
DROP POLICY IF EXISTS "Everyone can view permissions" ON permissions;
DROP POLICY IF EXISTS "Only admins can manage permissions" ON permissions;

CREATE POLICY "Everyone can view permissions" ON permissions
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage permissions" ON permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('管理员', '老板')
        )
    );

-- 角色权限表：只有管理员可以管理
DROP POLICY IF EXISTS "Everyone can view role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Only admins can manage role permissions" ON role_permissions;

CREATE POLICY "Everyone can view role permissions" ON role_permissions
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage role permissions" ON role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('管理员', '老板')
        )
    );

-- ============================================
-- 6. 权限数据初始化
-- ============================================
INSERT INTO permissions (name, code, description) VALUES
-- 产品相关权限
('查看商品', 'products:view', '查看商品列表和详情'),
('管理商品', 'products:manage', '新增、编辑、删除商品'),

-- SKU相关权限
('查看SKU', 'skus:view', '查看SKU列表和详情'),
('管理SKU', 'skus:manage', '新增、编辑、删除SKU'),

-- 仓库相关权限
('查看仓库', 'warehouses:view', '查看仓库列表'),
('管理仓库', 'warehouses:manage', '新增、编辑、删除仓库'),

-- 库存相关权限
('查看库存', 'inventory:view', '查看库存数据'),
('管理库存', 'inventory:manage', '调整库存'),

-- 生产入库权限
('查看生产入库', 'production_inbound:view', '查看生产入库记录'),
('管理生产入库', 'production_inbound:manage', '新增、删除生产入库'),

-- 生产成本权限
('查看生产成本', 'production_cost:view', '查看生产成本记录'),
('管理生产成本', 'production_cost:manage', '新增、编辑、删除生产成本'),

-- 入库相关权限
('查看入库', 'inbound:view', '查看入库记录'),
('管理入库', 'inbound:manage', '新增、删除入库单'),

-- 库存流水权限
('查看库存流水', 'inventory_logs:view', '查看库存变动记录'),
('管理库存流水', 'inventory_logs:manage', '调整库存流水'),

-- 客户相关权限
('查看客户', 'customers:view', '查看客户列表'),
('管理客户', 'customers:manage', '新增、编辑、删除客户'),

-- 销售相关权限
('查看销售', 'sales:view', '查看销售订单'),
('管理销售', 'sales:manage', '新增、编辑销售订单'),
('删除销售', 'sales:delete', '删除销售订单'),

-- 收款相关权限
('查看收款', 'payments:view', '查看收款记录'),
('管理收款', 'payments:manage', '新增收款记录'),

-- 财务相关权限
('查看财务流水', 'finance_transactions:view', '查看财务流水'),
('管理财务流水', 'finance_transactions:manage', '新增、删除财务流水'),

-- 费用相关权限
('查看费用', 'expenses:view', '查看费用记录'),
('管理费用', 'expenses:manage', '新增、删除费用'),

-- 报表相关权限
('查看报表', 'reports:view', '查看财务报表和统计'),
('管理报表', 'reports:manage', '导出和管理报表'),

-- 应收账款权限
('查看应收', 'receivables:view', '查看应收账款'),
('管理应收', 'receivables:manage', '管理应收账款'),

-- 用户管理权限
('查看用户', 'users:view', '查看用户列表'),
('管理用户', 'users:manage', '新增、编辑、删除用户'),

-- 系统管理权限
('系统设置', 'system:settings', '访问系统设置')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 7. 角色权限初始化
-- ============================================

-- 老板（全部权限）
INSERT INTO role_permissions (role, permission_id)
SELECT '老板', id FROM permissions
ON CONFLICT DO NOTHING;

-- 管理员（系统管理 + 用户管理 + 全部权限）
INSERT INTO role_permissions (role, permission_id)
SELECT '管理员', id FROM permissions
WHERE code IN (
    'system:settings',
    'users:view',
    'users:manage'
)
ON CONFLICT DO NOTHING;

-- 管理员也需要有所有业务权限
INSERT INTO role_permissions (role, permission_id)
SELECT '管理员', id FROM permissions
ON CONFLICT DO NOTHING;

-- 仓库（库存相关）
INSERT INTO role_permissions (role, permission_id)
SELECT '仓库', id FROM permissions
WHERE code IN (
    'products:view',
    'skus:view',
    'warehouses:view',
    'inventory:view',
    'inventory:manage',
    'production_inbound:view',
    'production_inbound:manage',
    'inbound:view',
    'inbound:manage',
    'inventory_logs:view'
)
ON CONFLICT DO NOTHING;

-- 销售（销售相关）
INSERT INTO role_permissions (role, permission_id)
SELECT '销售', id FROM permissions
WHERE code IN (
    'products:view',
    'skus:view',
    'warehouses:view',
    'inventory:view',
    'customers:view',
    'customers:manage',
    'sales:view',
    'sales:manage',
    'sales:delete',
    'payments:view',
    'payments:manage',
    'receivables:view',
    'reports:view'
)
ON CONFLICT DO NOTHING;

-- 财务（财务相关）
INSERT INTO role_permissions (role, permission_id)
SELECT '财务', id FROM permissions
WHERE code IN (
    'products:view',
    'skus:view',
    'customers:view',
    'sales:view',
    'payments:view',
    'payments:manage',
    'production_cost:view',
    'production_cost:manage',
    'finance_transactions:view',
    'finance_transactions:manage',
    'expenses:view',
    'expenses:manage',
    'reports:view',
    'reports:manage',
    'receivables:view',
    'receivables:manage'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. 创建管理员用户的函数
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        '仓库'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器：当auth.users有新用户时自动创建user_profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
