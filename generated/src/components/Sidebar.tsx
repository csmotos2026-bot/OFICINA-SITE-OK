import React from 'react';
import { 
  LayoutDashboard, Users, Car, Search, FileText, 
  Package, DollarSign, BarChart3, LogOut, Shield, 
  Menu, X, Bell, Moon, Sun 
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  notificationsCount: number;
  onOpenNotifications: () => void;
}

export default function Sidebar({ 
  user, activeTab, setActiveTab, onLogout, 
  darkMode, setDarkMode, notificationsCount, onOpenNotifications 
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'GERENTE', 'ATENDENTE', 'MECANICO'] },
    { id: 'search', label: 'Pesquisa por Placa', icon: Search, roles: ['ADMIN', 'GERENTE', 'ATENDENTE', 'MECANICO'] },
    { id: 'os', label: 'Ordens de Serviço', icon: FileText, roles: ['ADMIN', 'GERENTE', 'ATENDENTE', 'MECANICO'] },
    { id: 'clients', label: 'Clientes', icon: Users, roles: ['ADMIN', 'GERENTE', 'ATENDENTE'] },
    { id: 'vehicles', label: 'Veículos', icon: Car, roles: ['ADMIN', 'GERENTE', 'ATENDENTE'] },
    { id: 'inventory', label: 'Estoque de Peças', icon: Package, roles: ['ADMIN', 'GERENTE'] },
    { id: 'financial', label: 'Financeiro', icon: DollarSign, roles: ['ADMIN', 'GERENTE'] },
    { id: 'reports', label: 'Relatórios ERP', icon: BarChart3, roles: ['ADMIN', 'GERENTE'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'GERENTE': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'ATENDENTE': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'MECANICO': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'GERENTE': return 'Gerente';
      case 'ATENDENTE': return 'Atendente';
      case 'MECANICO': return 'Mecânico';
      default: return role;
    }
  };

  return (
    <>
      {/* Mobile top navigation bar */}
      <div id="mobile_navbar" className="lg:hidden w-full h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button 
            id="mobile_menu_toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-1.5 ml-1">
            <Car size={20} className="text-blue-600" />
            <span className="font-bold font-display text-sm text-slate-900 dark:text-white">OFICINA360</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Trigger */}
          <button 
            onClick={onOpenNotifications}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg relative cursor-pointer"
          >
            <Bell size={18} />
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full">
                {notificationsCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg cursor-pointer"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Sidebar background overlay on mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-45 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Component */}
      <aside 
        id="sidebar_nav" 
        className={`fixed lg:sticky top-0 left-0 h-screen w-60 bg-slate-900 dark:bg-slate-950 text-white flex flex-col justify-between z-50 border-r border-slate-800 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 pt-5 overflow-y-auto">
          {/* Brand/Logo */}
          <div className="px-5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-500 rounded mr-1 flex items-center justify-center text-white font-black text-sm">
                C
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white leading-none">CSMOTOS</h1>
                <p className="text-[9px] text-blue-400 font-mono tracking-wider font-bold mt-1">SISTEMA ERP</p>
              </div>
            </div>
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 rounded-l-none' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Settings */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          {/* User profile widget */}
          <div className="flex items-center gap-2.5 p-2 bg-slate-800/20 rounded-md">
            <img 
              src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
              alt={user.name} 
              className="w-8 h-8 rounded bg-slate-700 object-cover border border-slate-700"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate leading-none">{user.name}</h4>
              <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded mt-1.5 ${getRoleBadge(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          {/* Utility buttons */}
          <div className="grid grid-cols-2 gap-2 text-slate-400 text-[10px] font-semibold">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-800/20 hover:bg-slate-800 hover:text-white rounded-md transition-all cursor-pointer"
            >
              {darkMode ? <Sun size={12} className="text-amber-400" /> : <Moon size={12} />}
              <span>{darkMode ? 'Claro' : 'Escuro'}</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-800/20 hover:bg-rose-500/10 hover:text-rose-400 rounded-md transition-all text-slate-400 cursor-pointer"
            >
              <LogOut size={12} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
