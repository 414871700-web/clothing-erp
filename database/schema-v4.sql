-- 服装ERP第四阶段：财务模块
-- 自有生产模式 - 不包含采购相关功能

-- ============================================
-- 1. 生产入库单表 (production_inbound_orders)
-- ============================================
CREATE TABLE IF NOT EXISTS production_inbound_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    sku_id UUID NOT NULL REFERENCES product_skus(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    production_batch_no VARCHAR(50),
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE production_inbound_orders IS '生产入库单表';
COMMENT ON COLUMN production_inbound_orders.order_no IS '入库单号';
COMMENT ON COLUMN production_inbound_orders.sku_id IS 'SKU ID';
COMMENT ON COLUMN production_inbound_orders.quantity IS '入库数量';
COMMENT ON COLUMN production_inbound_orders.production_batch_no IS '生产批次号';

-- ============================================
-- 2. 生产成本表 (production_costs)
-- ============================================
CREATE TABLE IF NOT EXISTS production_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id UUID NOT NULL REFERENCES product_skus(id),
    batch_no VARCHAR(50),
    material_cost DECIMAL(10, 2) DEFAULT 0,
    labor_cost DECIMAL(10, 2) DEFAULT 0,
    other_cost DECIMAL(10, 2) DEFAULT 0,
    total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (material_cost + labor_cost + other_cost) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE production_costs IS '生产成本表';
COMMENT ON COLUMN production_costs.material_cost IS '原料成本';
COMMENT ON COLUMN production_costs.labor_cost IS '人工成本';
COMMENT ON COLUMN production_costs.other_cost IS '其他成本';

-- ============================================
-- 3. 财务流水表 (finance_transactions)
-- ============================================
CREATE TABLE IF NOT EXISTS finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('销售收入', '退款', '运营支出')),
    related_order_no VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('现金', '银行转账', '微信', '支付宝', '其他')),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('收入', '支出')),
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE finance_transactions IS '财务流水表';
COMMENT ON COLUMN finance_transactions.transaction_type IS '交易类型';
COMMENT ON COLUMN finance_transactions.related_order_no IS '关联单号';
COMMENT ON COLUMN finance_transactions.amount IS '金额';
COMMENT ON COLUMN finance_transactions.direction IS '方向：收入/支出';

-- ============================================
-- 4. 费用记录表 (expense_records)
-- ============================================
CREATE TABLE IF NOT EXISTS expense_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE expense_records IS '费用记录表';
COMMENT ON COLUMN expense_records.expense_type IS '费用类型';

-- ============================================
-- 5. 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_production_inbound_orders_order_no ON production_inbound_orders(order_no);
CREATE INDEX IF NOT EXISTS idx_production_inbound_orders_sku_id ON production_inbound_orders(sku_id);
CREATE INDEX IF NOT EXISTS idx_production_inbound_orders_batch_no ON production_inbound_orders(production_batch_no);

CREATE INDEX IF NOT EXISTS idx_production_costs_sku_id ON production_costs(sku_id);
CREATE INDEX IF NOT EXISTS idx_production_costs_batch_no ON production_costs(batch_no);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_type ON finance_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_direction ON finance_transactions(direction);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_created_at ON finance_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_expense_records_type ON expense_records(expense_type);
CREATE INDEX IF NOT EXISTS idx_expense_records_created_at ON expense_records(created_at);

-- ============================================
-- 6. RLS策略
-- ============================================
ALTER TABLE production_inbound_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on production_inbound_orders" ON production_inbound_orders;
DROP POLICY IF EXISTS "Allow all on production_costs" ON production_costs;
DROP POLICY IF EXISTS "Allow all on finance_transactions" ON finance_transactions;
DROP POLICY IF EXISTS "Allow all on expense_records" ON expense_records;

CREATE POLICY "Allow all on production_inbound_orders" ON production_inbound_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on production_costs" ON production_costs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on finance_transactions" ON finance_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on expense_records" ON expense_records FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 7. 示例数据
-- ============================================
-- 生产入库示例
INSERT INTO production_inbound_orders (order_no, sku_id, quantity, production_batch_no, remark)
SELECT 
    'PI' || TO_CHAR(NOW(), 'YYYYMMDD') || '001',
    id,
    100,
    'BATCH-2024-001',
    '首批生产入库'
FROM product_skus 
WHERE id IN (SELECT id FROM product_skus LIMIT 2)
LIMIT 1
ON CONFLICT DO NOTHING;

-- 费用类型示例
INSERT INTO expense_records (expense_type, amount, remark) VALUES
('租金', 5000, '办公室租金'),
('水电费', 800, '月度水电费'),
('工资', 15000, '员工工资'),
('营销费', 2000, '广告推广费')
ON CONFLICT DO NOTHING;
