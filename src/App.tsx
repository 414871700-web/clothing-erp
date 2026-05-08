import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductList } from '@/pages/products/ProductList';
import { ProductForm } from '@/pages/products/ProductForm';
import { ProductDetail } from '@/pages/products/ProductDetail';
import { SkuList } from '@/pages/skus/SkuList';
import { SkuForm } from '@/pages/skus/SkuForm';
import { WarehouseList } from '@/pages/warehouses/WarehouseList';
import { WarehouseForm } from '@/pages/warehouses/WarehouseForm';
import { InventoryList } from '@/pages/inventory/InventoryList';
import { InboundList } from '@/pages/inbound/InboundList';
import { InboundForm } from '@/pages/inbound/InboundForm';
import { InboundDetail } from '@/pages/inbound/InboundDetail';
import { InventoryLogList } from '@/pages/inventory-logs/InventoryLogList';
import { CustomerList } from '@/pages/customers/CustomerList';
import { CustomerForm } from '@/pages/customers/CustomerForm';
import { SalesOrderList } from '@/pages/sales/SalesOrderList';
import { SalesOrderForm } from '@/pages/sales/SalesOrderForm';
import { PaymentList } from '@/pages/payments/PaymentList';
import { ProductionInboundList } from '@/pages/production/ProductionInboundList';
import { ProductionCostList } from '@/pages/production/ProductionCostList';
import { FinanceTransactionList } from '@/pages/finance/FinanceTransactionList';
import { ExpenseList } from '@/pages/finance/ExpenseList';
import { FinanceReportView } from '@/pages/finance/FinanceReportView';
import { ReceivablesView } from '@/pages/finance/ReceivablesView';
import { LoginPage } from '@/pages/auth/LoginPage';
import { UserList } from '@/pages/users/UserList';
import { RoleManagement } from '@/pages/users/RoleManagement';
import { OperationLogList } from '@/pages/logs/OperationLogList';
import { ProtectedRoute, AdminRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 受保护的路由 */}
        <Route path="/" element={<Layout />}>
          {/* 默认重定向到商品管理 */}
          <Route index element={<Navigate to="/products" replace />} />
          
          {/* 商品管理路由 */}
          <Route path="products" element={
            <ProtectedRoute permissions={['products:view']}>
              <ProductList />
            </ProtectedRoute>
          } />
          <Route path="products/new" element={
            <ProtectedRoute permissions={['products:manage']}>
              <ProductForm />
            </ProtectedRoute>
          } />
          <Route path="products/:id" element={
            <ProtectedRoute permissions={['products:view']}>
              <ProductDetail />
            </ProtectedRoute>
          } />
          <Route path="products/:id/edit" element={
            <ProtectedRoute permissions={['products:manage']}>
              <ProductForm />
            </ProtectedRoute>
          } />
          
          {/* SKU管理路由 */}
          <Route path="skus" element={
            <ProtectedRoute permissions={['skus:view']}>
              <SkuList />
            </ProtectedRoute>
          } />
          <Route path="skus/new" element={
            <ProtectedRoute permissions={['skus:manage']}>
              <SkuForm />
            </ProtectedRoute>
          } />
          <Route path="skus/:id/edit" element={
            <ProtectedRoute permissions={['skus:manage']}>
              <SkuForm />
            </ProtectedRoute>
          } />
          
          {/* 仓库管理路由 */}
          <Route path="warehouses" element={
            <ProtectedRoute permissions={['warehouses:view']}>
              <WarehouseList />
            </ProtectedRoute>
          } />
          <Route path="warehouses/new" element={
            <ProtectedRoute permissions={['warehouses:manage']}>
              <WarehouseForm />
            </ProtectedRoute>
          } />
          <Route path="warehouses/:id/edit" element={
            <ProtectedRoute permissions={['warehouses:manage']}>
              <WarehouseForm />
            </ProtectedRoute>
          } />
          
          {/* 库存管理路由 */}
          <Route path="inventory" element={
            <ProtectedRoute permissions={['inventory:view']}>
              <InventoryList />
            </ProtectedRoute>
          } />
          
          {/* 生产入库路由 */}
          <Route path="production-inbound" element={
            <ProtectedRoute permissions={['production_inbound:view']}>
              <ProductionInboundList />
            </ProtectedRoute>
          } />
          
          {/* 生产成本路由 */}
          <Route path="production-costs" element={
            <ProtectedRoute permissions={['production_cost:view']}>
              <ProductionCostList />
            </ProtectedRoute>
          } />
          
          {/* 入库管理路由 */}
          <Route path="inbound" element={
            <ProtectedRoute permissions={['inbound:view']}>
              <InboundList />
            </ProtectedRoute>
          } />
          <Route path="inbound/new" element={
            <ProtectedRoute permissions={['inbound:manage']}>
              <InboundForm />
            </ProtectedRoute>
          } />
          <Route path="inbound/:id" element={
            <ProtectedRoute permissions={['inbound:view']}>
              <InboundDetail />
            </ProtectedRoute>
          } />
          
          {/* 库存流水路由 */}
          <Route path="inventory-logs" element={
            <ProtectedRoute permissions={['inventory_logs:view']}>
              <InventoryLogList />
            </ProtectedRoute>
          } />
          
          {/* 客户管理路由 */}
          <Route path="customers" element={
            <ProtectedRoute permissions={['customers:view']}>
              <CustomerList />
            </ProtectedRoute>
          } />
          <Route path="customers/new" element={
            <ProtectedRoute permissions={['customers:manage']}>
              <CustomerForm />
            </ProtectedRoute>
          } />
          <Route path="customers/:id/edit" element={
            <ProtectedRoute permissions={['customers:manage']}>
              <CustomerForm />
            </ProtectedRoute>
          } />
          
          {/* 销售管理路由 */}
          <Route path="sales" element={
            <ProtectedRoute permissions={['sales:view']}>
              <SalesOrderList />
            </ProtectedRoute>
          } />
          <Route path="sales/new" element={
            <ProtectedRoute permissions={['sales:manage']}>
              <SalesOrderForm />
            </ProtectedRoute>
          } />
          
          {/* 收款记录路由 */}
          <Route path="payments" element={
            <ProtectedRoute permissions={['payments:view']}>
              <PaymentList />
            </ProtectedRoute>
          } />
          
          {/* 财务流水路由 */}
          <Route path="finance-transactions" element={
            <ProtectedRoute permissions={['finance_transactions:view']}>
              <FinanceTransactionList />
            </ProtectedRoute>
          } />
          
          {/* 费用管理路由 */}
          <Route path="expenses" element={
            <ProtectedRoute permissions={['expenses:view']}>
              <ExpenseList />
            </ProtectedRoute>
          } />
          
          {/* 财务报表路由 */}
          <Route path="finance-report" element={
            <ProtectedRoute permissions={['reports:view']}>
              <FinanceReportView />
            </ProtectedRoute>
          } />
          
          {/* 应收账款路由 */}
          <Route path="receivables" element={
            <ProtectedRoute permissions={['receivables:view']}>
              <ReceivablesView />
            </ProtectedRoute>
          } />
          
          {/* 用户管理路由 - 仅管理员 */}
          <Route path="users" element={
            <AdminRoute>
              <UserList />
            </AdminRoute>
          } />
          
          {/* 角色管理路由 - 仅管理员 */}
          <Route path="roles" element={
            <AdminRoute>
              <RoleManagement />
            </AdminRoute>
          } />
          
          {/* 操作日志路由 */}
          <Route path="logs" element={
            <ProtectedRoute permissions={['logs:view']}>
              <OperationLogList />
            </ProtectedRoute>
          } />
          
          {/* 404重定向 */}
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
