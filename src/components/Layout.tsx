import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Tags, 
  Warehouse as WarehouseIcon,
  Package2,
  ArrowDownToLine,
  History,
  Users,
  ShoppingCart,
  FileText,
  Receipt,
  Factory,
  DollarSign,
  ReceiptIcon,
  BarChart3,
  CreditCard,
  Menu,
  LogOut,
  Settings,
  Shield,
  ChevronRight,
  X,
  Home
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { MENU_PERMISSIONS } from '@/types/auth';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, permissions, isAuthenticated, hasPermission, signOut } = useAuthStore();

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      if (width >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const isActive = (path: string) => {
    if (path === '/sales/new') {
      return location.pathname === '/sales/new';
    }
    return location.pathname.startsWith(path);
  };

  const canAccessMenu = (path: string) => {
    const menuPermission = MENU_PERMISSIONS.find(m => m.path === path);
    if (!menuPermission) return true;
    return hasPermission(menuPermission.permission);
  };

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await signOut();
      navigate('/login');
    }
  };

  const allMenuItems = [
    { path: '/products', label: '商品管理', icon: Package, permission: 'products:view' },
    { path: '/skus', label: 'SKU管理', icon: Tags, permission: 'skus:view' },
    { path: '/warehouses', label: '仓库管理', icon: WarehouseIcon, permission: 'warehouses:view' },
    { path: '/inventory', label: '库存管理', icon: Package2, permission: 'inventory:view' },
    { path: '/production-inbound', label: '生产入库', icon: Factory, permission: 'production_inbound:view' },
    { path: '/production-costs', label: '生产成本', icon: DollarSign, permission: 'production_cost:view' },
    { path: '/inbound', label: '入库管理', icon: ArrowDownToLine, permission: 'inbound:view' },
    { path: '/inventory-logs', label: '库存流水', icon: History, permission: 'inventory_logs:view' },
    { path: '/customers', label: '客户管理', icon: Users, permission: 'customers:view' },
    { path: '/sales/new', label: '销售开单', icon: ShoppingCart, permission: 'sales:view' },
    { path: '/sales', label: '销售订单', icon: FileText, permission: 'sales:view' },
    { path: '/payments', label: '收款记录', icon: Receipt, permission: 'payments:view' },
    { path: '/finance-transactions', label: '财务流水', icon: CreditCard, permission: 'finance_transactions:view' },
    { path: '/expenses', label: '费用管理', icon: ReceiptIcon, permission: 'expenses:view' },
    { path: '/finance-report', label: '财务报表', icon: BarChart3, permission: 'reports:view' },
    { path: '/receivables', label: '应收账款', icon: Users, permission: 'receivables:view' },
  ];

  const adminMenuItems = [
    { path: '/users', label: '用户管理', icon: Shield, permission: 'users:view' },
    { path: '/roles', label: '角色权限', icon: Settings, permission: 'users:manage' },
    { path: '/logs', label: '操作日志', icon: FileText, permission: 'logs:view' },
  ];

  const visibleMenuItems = allMenuItems.filter(item => hasPermission(item.permission));
  const visibleAdminItems = adminMenuItems.filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* 移动端遮罩层 */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* 侧边栏 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 to-slate-800 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
            <h1 className="text-xl font-bold text-white tracking-tight">服装ERP</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 用户信息 */}
          {user && (
            <div className="px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  {user.full_name?.[0] || user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user.full_name || '用户'}</p>
                  <p className="text-slate-400 text-xs truncate">{user.email}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-600/20 text-blue-300 text-xs rounded border border-blue-500/30">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* 快速导航 */}
          <div className="px-4 py-2">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">首页概览</span>
            </Link>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive(item.path) && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              );
            })}

            {/* 管理员菜单 */}
            {visibleAdminItems.length > 0 && (
              <>
                <div className="my-4">
                  <div className="border-t border-slate-700/50"></div>
                </div>
                <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  系统管理
                </p>
                {visibleAdminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => isMobile && setSidebarOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-all ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                          : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {isActive(item.path) && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* 底部信息 */}
          <div className="p-4 border-t border-slate-700/50 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2.5 text-slate-400 hover:text-white hover:bg-red-600/20 hover:text-red-300 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-sm">退出登录</span>
            </button>
            <div className="text-xs text-slate-500 text-center">
              <p>服装ERP v5.0</p>
              <p className="mt-0.5">权限管理系统</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen && !isMobile ? 'lg:ml-72' : ''
      }`}>
        {/* 顶部栏 */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base lg:text-lg font-semibold text-slate-900">
              {visibleMenuItems.find(item => isActive(item.path))?.label ||
               visibleAdminItems.find(item => isActive(item.path))?.label ||
               '服装ERP'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                  {user.full_name?.[0] || user.email[0].toUpperCase()}
                </div>
                <div className="hidden sm:block text-sm">
                  <p className="font-medium text-slate-900">{user.full_name || '用户'}</p>
                  <p className="text-slate-500 text-xs">{user.role}</p>
                </div>
              </div>
            )}
            <span className="text-xs sm:text-sm text-slate-500 hidden sm:block">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
