-- 服装ERP第三阶段：销售管理模块
-- 新增表结构

-- ============================================
-- 1. 客户表 (customers)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    customer_type VARCHAR(50) DEFAULT '普通客户' CHECK (customer_type IN ('普通客户', 'VIP客户', '批发商')),
    credit_limit DECIMAL(10, 2) DEFAULT 0,
    current_balance DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE customers IS '客户表';
COMMENT ON COLUMN customers.name IS '客户名称';
COMMENT ON COLUMN customers.phone IS '联系电话';
COMMENT ON COLUMN customers.address IS '客户地址';
COMMENT ON COLUMN customers.customer_type IS '客户类型：普通客户/VIP客户/批发商';
COMMENT ON COLUMN customers.credit_limit IS '信用额度';
COMMENT ON COLUMN customers.current_balance IS '当前欠款';

-- ============================================
-- 2. 销售订单表 (sales_orders)
-- ============================================
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    total_amount DECIMAL(10, 2) DEFAULT 0,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    unpaid_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT '待发货' CHECK (status IN ('待发货', '已发货', '已完成', '已取消')),
    payment_status VARCHAR(20) DEFAULT '未付款' CHECK (payment_status IN ('未付款', '部分付款', '已付清')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE sales_orders IS '销售订单表';
COMMENT ON COLUMN sales_orders.order_no IS '订单号';
COMMENT ON COLUMN sales_orders.customer_id IS '客户ID';
COMMENT ON COLUMN sales_orders.total_amount IS '订单总金额';
COMMENT ON COLUMN sales_orders.paid_amount IS '已付金额';
COMMENT ON COLUMN sales_orders.unpaid_amount IS '未付金额';
COMMENT ON COLUMN sales_orders.status IS '订单状态';
COMMENT ON COLUMN sales_orders.payment_status IS '付款状态';

-- ============================================
-- 3. 销售订单明细表 (sales_order_items)
-- ============================================
CREATE TABLE IF NOT EXISTS sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES product_skus(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE sales_order_items IS '销售订单明细表';
COMMENT ON COLUMN sales_order_items.sales_order_id IS '订单ID';
COMMENT ON COLUMN sales_order_items.sku_id IS 'SKU ID';
COMMENT ON COLUMN sales_order_items.quantity IS '销售数量';
COMMENT ON COLUMN sales_order_items.unit_price IS '单价';
COMMENT ON COLUMN sales_order_items.total_price IS '小计金额';

-- ============================================
-- 4. 收款记录表 (payment_records)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) DEFAULT '现金' CHECK (payment_method IN ('现金', '银行转账', '微信', '支付宝', '其他')),
    amount DECIMAL(10, 2) NOT NULL,
    payment_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE payment_records IS '收款记录表';
COMMENT ON COLUMN payment_records.sales_order_id IS '订单ID';
COMMENT ON COLUMN payment_records.payment_method IS '付款方式';
COMMENT ON COLUMN payment_records.amount IS '付款金额';
COMMENT ON COLUMN payment_records.payment_time IS '付款时间';

-- ============================================
-- 5. 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

CREATE INDEX IF NOT EXISTS idx_sales_orders_order_no ON sales_orders(order_no);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_payment_status ON sales_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_created_at ON sales_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_id ON sales_order_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_sku_id ON sales_order_items(sku_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_order_id ON payment_records(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_time ON payment_records(payment_time);

-- ============================================
-- 6. RLS策略
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on customers" ON customers;
DROP POLICY IF EXISTS "Allow all on sales_orders" ON sales_orders;
DROP POLICY IF EXISTS "Allow all on sales_order_items" ON sales_order_items;
DROP POLICY IF EXISTS "Allow all on payment_records" ON payment_records;

CREATE POLICY "Allow all on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sales_orders" ON sales_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sales_order_items" ON sales_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on payment_records" ON payment_records FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 7. 示例数据
-- ============================================
INSERT INTO customers (name, phone, address, customer_type, credit_limit) VALUES
('张三', '13800138000', '北京市朝阳区某街道1号', 'VIP客户', 10000),
('李四', '13900139000', '上海市浦东新区某街道2号', '普通客户', 5000),
('王五', '13700137000', '广州市天河区某街道3号', '批发商', 20000)
ON CONFLICT DO NOTHING;
