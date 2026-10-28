import React from 'react';
import { 
  FileText, 
  CheckSquare, 
  FileSpreadsheet, 
  Users, 
  Layers, 
  CreditCard, 
  Archive, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const navigationItems = [
  { id: 'credential-applications', label: 'Credential Applications', icon: FileText, path: '/' },
  { id: 'document-verification', label: 'Document Verification', icon: CheckSquare, path: '/verification' },
  { id: 'enrollment-applications', label: 'Enrollment Applications', icon: FileSpreadsheet, path: '/enrollment-application' },
  { id: 'users-accounts', label: 'Users & Accounts', icon: Users, path: '/users' },
  { id: 'plans-pricing', label: 'Plans & Pricing', icon: Layers, path: '/plans' },
  { id: 'credits-management', label: 'Credits Management', icon: CreditCard, path: '/credits' },
  { id: 'subscriptions-orders', label: 'Subscriptions & Orders', icon: Archive, path: '/orders' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  return (
    <aside 
      className={`relative flex flex-col justify-between bg-white border-r border-slate-200 transition-all duration-300 select-none z-20 min-h-screen ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Toggle button on border */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors z-30 cursor-pointer"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Top Logo and Navigation */}
      <div>
        {/* Brand Logo */}
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab('credential-applications')}>
            {!collapsed ? (
              <div className="text-2xl font-bold tracking-tight">
                <span className="text-[#0097DA]">Mantra</span>
                <span className="text-[#0A2540]">Comply</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0097DA] to-[#0A2540] flex items-center justify-center text-white font-bold text-xl shadow-sm">
                M
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 space-y-1.5 mt-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50/70 border border-blue-400 text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon 
                  size={19} 
                  className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} 
                />
                {!collapsed && (
                  <span className="truncate text-left">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sign Out */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => alert("Sign out clicked")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

