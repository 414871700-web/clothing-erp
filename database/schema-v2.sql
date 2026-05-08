-- 服装ERP第二阶段：库存管理模块
-- 新增表结构

-- ============================================
-- 1. 仓库表 (warehouses)
-- ============================================
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(200),
    status VARCHAR(20) DEFAULT '启用' CHECK (status IN ('启用', '停用')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE warehouses IS '仓库表';
COMMENT ON COLUMN warehouses.name IS '仓库名称';
COMMENT ON COLUMN warehouses.code IS '仓库编码';
COMMENT ON COLUMN warehouses.location IS '仓库地址';
COMMENT ON COLUMN warehouses.status IS '状态：启用/停用';

-- ============================================
-- 2. 库存表 (inventory)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id UUID NOT NULL REFERENCES product_skus(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0 NOT NULL,
    locked_quantity INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sku_id, warehouse_id)
);

COMMENT ON TABLE inventory IS '库存表';
COMMENT ON COLUMN inventory.sku_id IS 'SKU ID';
COMMENT ON COLUMN inventory.warehouse_id IS '仓库ID';
COMMENT ON COLUMN inventory.quantity IS '可用库存';
COMMENT ON COLUMN inventory.locked_quantity IS '锁定库存';

-- ============================================
-- 3. 入库单表 (inbound_orders)
-- ============================================
CREATE TABLE IF NOT EXISTS inbound_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE inbound_orders IS '入库单表';
COMMENT ON COLUMN inbound_orders.order_no IS '入库单号';
COMMENT ON COLUMN inbound_orders.warehouse_id IS '仓库ID';
COMMENT ON COLUMN inbound_orders.remark IS '备注';

-- ============================================
-- 4. 入库明细表 (inbound_items)
-- ============================================
CREATE TABLE IF NOT EXISTS inbound_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inbound_order_id UUID NOT NULL REFERENCES inbound_orders(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES product_skus(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE inbound_items IS '入库明细表';
COMMENT ON COLUMN inbound_items.inbound_order_id IS '入库单ID';
COMMENT ON COLUMN inbound_items.sku_id IS 'SKU ID';
COMMENT ON COLUMN inbound_items.quantity IS '入库数量';

-- ============================================
-- 5. 库存流水表 (inventory_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id UUID NOT NULL REFERENCES product_skus(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    change_type VARCHAR(50) NOT NULL,
    quantity_change INTEGER NOT NULL,
    before_quantity INTEGER NOT NULL,
    after_quantity INTEGER NOT NULL,
    reference_no VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE inventory_logs IS '库存流水表';
COMMENT ON COLUMN inventory_logs.change_type IS '变动类型：入库/出库/调整';
COMMENT ON COLUMN inventory_logs.quantity_change IS '变动数量（正数增加，负数减少）';
COMMENT ON COLUMN inventory_logs.before_quantity IS '变动前库存';
COMMENT ON COLUMN inventory_logs.after_quantity IS '变动后库存';
COMMENT ON COLUMN inventory_logs.reference_no IS '关联单号';

-- ============================================
-- 6. 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON warehouses(status);

CREATE INDEX IF NOT EXISTS idx_inventory_sku_id ON inventory(sku_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON inventory(warehouse_id);

CREATE INDEX IF NOT EXISTS idx_inbound_orders_order_no ON inbound_orders(order_no);
CREATE INDEX IF NOT EXISTS idx_inbound_orders_warehouse_id ON inbound_orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inbound_orders_created_at ON inbound_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_inbound_items_order_id ON inbound_items(inbound_order_id);
CREATE INDEX IF NOT EXISTS idx_inbound_items_sku_id ON inbound_items(sku_id);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_sku_id ON inventory_logs(sku_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_warehouse_id ON inventory_logs(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_change_type ON inventory_logs(change_type);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);

-- ============================================
-- 7. RLS策略
-- ============================================
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on warehouses" ON warehouses;
DROP POLICY IF EXISTS "Allow all on inventory" ON inventory;
DROP POLICY IF EXISTS "Allow all on inbound_orders" ON inbound_orders;
DROP POLICY IF EXISTS "Allow all on inbound_items" ON inbound_items;
DROP POLICY IF EXISTS "Allow all on inventory_logs" ON inventory_logs;

CREATE POLICY "Allow all on warehouses" ON warehouses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on inbound_orders" ON inbound_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on inbound_items" ON inbound_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on inventory_logs" ON inventory_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 8. 示例数据
-- ============================================
INSERT INTO warehouses (name, code, location, status) VALUES
('主仓库', 'WH001', '北京市朝阳区仓库路1号', '启用'),
('分仓库A', 'WH002', '上海市浦东新区仓库路2号', '启用'),
('分仓库B', 'WH003', '广州市天河区仓库路3号', '停用')
ON CONFLICT (code) DO NOTHING;

-- 初始化库存（如果需要的话）
-- 这里假设已有SKU数据，为第一个SKU在各仓库创建库存记录
INSERT INTO inventory (sku_id, warehouse_id, quantity, locked_quantity)
SELECT 
    ps.id as sku_id,
    w.id as warehouse_id,
    CASE 
        WHEN w.code = 'WH001' THEN 100
        ELSE 50
    END as quantity,
    0 as locked_quantity
FROM product_skus ps
CROSS JOIN warehouses w
WHERE w.status = '启用'
ON CONFLICT (sku_id, warehouse_id) DO NOTHING;
