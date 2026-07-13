import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ClientsList from './components/ClientsList';
import VehiclesList from './components/VehiclesList';
import QuickSearch from './components/QuickSearch';
import ServiceOrders from './components/ServiceOrders';
import Inventory from './components/Inventory';
import Financial from './components/Financial';
import Reports from './components/Reports';
import { User, Notification } from './types';
import { apiFetch } from './utils';
import { Bell, X, Check, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('oficina_erp_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('oficina_erp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('oficina_erp_dark') === 'true';
  });

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('oficina_erp_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('oficina_erp_dark', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      loadNotifications();
      // Auto refresh notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const loadNotifications = async () => {
    try {
      const data = await apiFetch('/api/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    }
  };

  const handleLoginSuccess = (usr: User, tkn: string) => {
    setUser(usr);
    setToken(tkn);
  };

  const handleLogout = () => {
    localStorage.removeItem('oficina_erp_token');
    localStorage.removeItem('oficina_erp_user');
    setUser(null);
    setToken(null);
    setActiveTab('dashboard');
  };

  const handleMarkNotifAsRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/read/${id}`, { method: 'PUT' });
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen font-sans flex ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      {/* Sidebar Navigation */}
      <Sidebar 
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        notificationsCount={unreadCount}
        onOpenNotifications={() => setNotifOpen(true)}
      />

      {/* Main Content Pane */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto no-print">
        {activeTab === 'dashboard' && <Dashboard onNavigateToTab={setActiveTab} />}
        {activeTab === 'search' && <QuickSearch />}
        {activeTab === 'os' && <ServiceOrders />}
        {activeTab === 'clients' && <ClientsList />}
        {activeTab === 'vehicles' && <VehiclesList />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'financial' && <Financial />}
        {activeTab === 'reports' && <Reports />}
      </main>

      {/* Slide-over Notifications Center Panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden no-print" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Background overlay */}
            <div 
              onClick={() => setNotifOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer" 
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md transform bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-850 shadow-2xl transition-all duration-300">
                <div className="flex h-full flex-col overflow-y-scroll py-6">
                  {/* Panel Header */}
                  <div className="px-4 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <Bell size={18} className="text-blue-500" />
                      <h2 className="text-sm font-bold font-display text-slate-900 dark:text-white uppercase tracking-wider">Central de Alertas ERP</h2>
                    </div>
                    <button 
                      onClick={() => setNotifOpen(false)}
                      className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Notifications Content */}
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">
                    {notifications.length > 0 ? (
                      <div className="space-y-4">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                              notif.read 
                                ? 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800' 
                                : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/40 dark:border-blue-900/30 shadow-xs'
                            }`}
                          >
                            <div className="p-2 bg-blue-100/40 dark:bg-blue-900/10 rounded-xl text-blue-500 shrink-0">
                              {notif.type === 'LOW_STOCK' ? <ShieldAlert size={15} className="text-amber-500" /> : <CheckCircle2 size={15} />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h5 className={`text-xs ${notif.read ? 'text-slate-500' : 'text-slate-900 dark:text-white font-bold'}`}>
                                {notif.message}
                              </h5>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {!notif.read && (
                              <button
                                onClick={() => handleMarkNotifAsRead(notif.id)}
                                className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 rounded-md shrink-0 cursor-pointer"
                                title="Marcar como lida"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <CheckCircle2 size={40} className="text-emerald-500 mb-2 stroke-[1.5]" />
                        <h4 className="font-bold text-sm text-slate-700 dark:text-white">Sem notificações</h4>
                        <p className="text-xs text-slate-400 max-w-xs text-center mt-1">Tudo limpo por aqui! Nenhuma ação crítica recomendada no momento.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
