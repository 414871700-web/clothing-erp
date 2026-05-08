# 服装进销存系统（第一阶段）

## 项目概述

一款面向服装零售企业的进销存管理系统，第一阶段实现了商品管理和SKU管理功能。

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router DOM
- **后端**: Supabase (PostgreSQL)
- **构建工具**: Vite

## 功能模块

### 1. 商品管理
- ✅ 商品列表（搜索、筛选、分页）
- ✅ 新增商品
- ✅ 编辑商品
- ✅ 删除商品
- ✅ 查看商品详情
- ✅ 商品图片上传

### 2. SKU管理
- ✅ SKU列表（按商品筛选、分页）
- ✅ 新增SKU
- ✅ 编辑SKU
- ✅ 删除SKU
- ✅ 查看商品SKU列表

## 项目结构

```
进销存/
├── database/
│   └── schema.sql              # 数据库表结构
├── src/
│   ├── components/             # 公共组件
│   │   ├── Layout.tsx          # 布局组件
│   │   ├── Pagination.tsx      # 分页组件
│   │   └── ConfirmDialog.tsx   # 确认对话框
│   ├── pages/                  # 页面组件
│   │   ├── products/           # 商品管理页面
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── ProductDetail.tsx
│   │   └── skus/               # SKU管理页面
│   │       ├── SkuList.tsx
│   │       └── SkuForm.tsx
│   ├── stores/                 # Zustand状态管理
│   │   ├── productStore.ts
│   │   └── skuStore.ts
│   ├── lib/                    # 工具库
│   │   ├── supabase.ts         # Supabase客户端
│   │   └── utils.ts            # 工具函数
│   ├── types/                  # TypeScript类型
│   │   └── index.ts
│   ├── App.tsx                 # 应用路由
│   └── main.tsx                # 入口文件
├── .env.example                # 环境变量示例
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

1. 访问 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中执行 `database/schema.sql` 文件中的SQL语句创建表结构
3. 复制 `.env.example` 为 `.env` 并填写你的 Supabase 配置：

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用

## 数据库表结构

### products（商品表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| product_code | varchar(50) | 款号，唯一 |
| name | varchar(200) | 商品名称 |
| category | varchar(100) | 分类 |
| brand | varchar(100) | 品牌 |
| season | varchar(50) | 季节 |
| image_url | text | 商品图片URL |
| status | varchar(20) | 状态（上架/下架）|
| created_at | timestamp | 创建时间 |

### product_skus（SKU表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| product_id | uuid | 关联商品ID |
| color | varchar(50) | 颜色 |
| size | varchar(50) | 尺码 |
| barcode | varchar(100) | 条码 |
| cost_price | decimal(10,2) | 成本价 |
| sale_price | decimal(10,2) | 销售价 |
| warning_stock | int | 安全库存 |
| current_stock | int | 当前库存 |
| created_at | timestamp | 创建时间 |

## 响应式设计

- **桌面端**: 左侧固定导航栏（240px），右侧内容区自适应
- **平板端**: 左侧收缩导航栏
- **手机端**: 顶部导航栏 + 全屏内容，表格支持横向滚动

## 开发计划

### 第一阶段（已完成）
- ✅ 商品管理
- ✅ SKU管理

### 后续阶段（待开发）
- 📋 采购管理（采购订单、入库）
- 📋 销售管理（销售订单、出库）
- 📋 库存管理（库存查询、盘点）
- 📋 报表统计
- 📋 用户权限管理

## 许可证

MIT
