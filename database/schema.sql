-- 服装进销存系统数据库表结构
-- 第一阶段：商品管理 + SKU管理

-- ============================================
-- 1. 商品表 (products)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    season VARCHAR(50),
    image_url TEXT,
    status VARCHAR(20) DEFAULT '上架' CHECK (status IN ('上架', '下架')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 商品表注释
COMMENT ON TABLE products IS '商品主表';
COMMENT ON COLUMN products.id IS '商品ID';
COMMENT ON COLUMN products.product_code IS '款号，唯一标识';
COMMENT ON COLUMN products.name IS '商品名称';
COMMENT ON COLUMN products.category IS '分类';
COMMENT ON COLUMN products.brand IS '品牌';
COMMENT ON COLUMN products.season IS '季节';
COMMENT ON COLUMN products.image_url IS '商品图片URL';
COMMENT ON COLUMN products.status IS '状态：上架/下架';
COMMENT ON COLUMN products.created_at IS '创建时间';

-- ============================================
-- 2. SKU表 (product_skus)
-- ============================================
CREATE TABLE IF NOT EXISTS product_skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(50) NOT NULL,
    size VARCHAR(50) NOT NULL,
    barcode VARCHAR(100),
    cost_price DECIMAL(10, 2) DEFAULT 0,
    sale_price DECIMAL(10, 2) DEFAULT 0,
    warning_stock INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, color, size)
);

-- SKU表注释
COMMENT ON TABLE product_skus IS '商品SKU表';
COMMENT ON COLUMN product_skus.id IS 'SKU ID';
COMMENT ON COLUMN product_skus.product_id IS '关联商品ID';
COMMENT ON COLUMN product_skus.color IS '颜色';
COMMENT ON COLUMN product_skus.size IS '尺码';
COMMENT ON COLUMN product_skus.barcode IS '条码';
COMMENT ON COLUMN product_skus.cost_price IS '成本价';
COMMENT ON COLUMN product_skus.sale_price IS '销售价';
COMMENT ON COLUMN product_skus.warning_stock IS '安全库存';
COMMENT ON COLUMN product_skus.current_stock IS '当前库存';
COMMENT ON COLUMN product_skus.created_at IS '创建时间';

-- ============================================
-- 3. 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

CREATE INDEX IF NOT EXISTS idx_skus_product_id ON product_skus(product_id);
CREATE INDEX IF NOT EXISTS idx_skus_barcode ON product_skus(barcode);
CREATE INDEX IF NOT EXISTS idx_skus_color ON product_skus(color);
CREATE INDEX IF NOT EXISTS idx_skus_size ON product_skus(size);
CREATE INDEX IF NOT EXISTS idx_skus_created_at ON product_skus(created_at);

-- ============================================
-- 4. 行级安全策略 (RLS)
-- ============================================
-- 启用RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_skus ENABLE ROW LEVEL SECURITY;

-- 删除已存在的策略（如果存在）
DROP POLICY IF EXISTS "Allow all on products" ON products;
DROP POLICY IF EXISTS "Allow all on product_skus" ON product_skus;

-- 创建允许所有操作的策略（开发阶段）
-- 注意：生产环境应该根据实际业务需求设置更严格的策略
CREATE POLICY "Allow all on products" ON products 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on product_skus" ON product_skus 
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 5. 示例数据（可选）
-- ============================================
-- 插入示例商品
INSERT INTO products (product_code, name, category, brand, season, status) VALUES
('SP2024001', '夏季休闲T恤', 'T恤', '品牌A', '夏季', '上架'),
('SP2024002', '秋季牛仔裤', '裤子', '品牌B', '秋季', '上架'),
('SP2024003', '冬季羽绒服', '外套', '品牌C', '冬季', '上架')
ON CONFLICT (product_code) DO NOTHING;

-- 为第一个商品插入示例SKU
INSERT INTO product_skus (product_id, color, size, barcode, cost_price, sale_price, warning_stock, current_stock)
SELECT 
    id as product_id,
    color,
    size,
    'BAR' || product_code || color || size as barcode,
    50.00 as cost_price,
    99.00 as sale_price,
    10 as warning_stock,
    100 as current_stock
FROM products
CROSS JOIN (VALUES ('白色'), ('黑色'), ('灰色')) AS colors(color)
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL')) AS sizes(size)
WHERE product_code = 'SP2024001'
ON CONFLICT (product_id, color, size) DO NOTHING;
