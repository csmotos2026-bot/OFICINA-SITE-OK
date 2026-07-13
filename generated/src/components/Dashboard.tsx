import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, FileText, 
  Car, AlertTriangle, CheckCircle2, ShieldCheck, 
  Calendar, ArrowUpRight, Clock, PackageOpen 
} from 'lucide-react';
import { DashboardStats, InventoryItem, ServiceOrder } from '../types';
import { apiFetch, formatCurrency } from '../utils';

interface DashboardProps {
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ onNavigateToTab }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [pendingOS, setPendingOS] = useState<ServiceOrder[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsData = await apiFetch('/api/dashboard');
        setStats(statsData);

        // Load inventory to filter low stock items
        const inventoryData: InventoryItem[] = await apiFetch('/api/inventory');
        setLowStockItems(inventoryData.filter(i => i.currentStock <= i.minStock));

        // Load recent service orders to filter open ones
        const osData: ServiceOrder[] = await apiFetch('/api/service-orders');
        setPendingOS(osData.filter(o => !['CONCLUIDO', 'CANCELADO'].includes(o.status)).slice(0, 5));
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Calculando indicadores ERP...</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Custom colors for OS status graph
  const COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#10b981', '#ef4444'];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ORCAMENTO': return 'Orçamento';
      case 'APROVADO': return 'Aprovado';
      case 'EM_ANDAMENTO': return 'Em Execução';
      case 'AGUARDANDO_PECA': return 'Aguardando Peça';
      case 'PRONTO': return 'Pronto para Retirada';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ORCAMENTO': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'APROVADO': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'EM_ANDAMENTO': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
      case 'AGUARDANDO_PECA': return 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800';
      case 'PRONTO': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">Dashboard do Negócio</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Visão consolidada e saúde financeira da oficina em tempo real</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-xs">
          <Calendar size={14} className="text-blue-500" />
          <span>Competência: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Faturamento Mensal</span>
            <h3 className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white">{formatCurrency(stats.monthlyRevenue)}</h3>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
              <TrendingUp size={12} />
              <span>Receitas de OS Pagas</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <DollarSign size={20} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Despesas do Mês</span>
            <h3 className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white">{formatCurrency(stats.monthlyExpenses)}</h3>
            <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
              <TrendingDown size={12} />
              <span>Fornecedores, aluguel, luz</span>
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
            <TrendingDown size={20} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lucro Líquido Estimado</span>
            <h3 className={`text-lg sm:text-xl font-black font-display ${stats.monthlyProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(stats.monthlyProfit)}
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">
              Faturamento - Despesas
            </span>
          </div>
          <div className={`p-3 rounded-xl ${stats.monthlyProfit >= 0 ? 'bg-blue-500/10 text-blue-600' : 'bg-rose-500/10 text-rose-600'}`}>
            <TrendingUp size={20} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Daily Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Faturamento Hoje</span>
            <h3 className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white">{formatCurrency(stats.dailyRevenue)}</h3>
            <span className="text-[10px] text-slate-400 font-semibold">
              Recebimentos do dia
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Operational Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
          <FileText size={18} className="text-slate-500 mb-2" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Ordens em Aberto</span>
          <p className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">{stats.openOSCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
          <Car size={18} className="text-amber-500 mb-2" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Em Manutenção</span>
          <p className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">{stats.vehiclesInMaintenance}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
          <CheckCircle2 size={18} className="text-emerald-500 mb-2" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">OS Entregues (Mês)</span>
          <p className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">{stats.completedOSCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
          <AlertTriangle size={18} className="text-rose-500 mb-2" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Estoque Baixo</span>
          <p className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">{stats.lowStockCount}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white font-display">Desempenho Financeiro</h4>
              <p className="text-[11px] text-slate-400">Evolução do faturamento, despesas e lucros nos últimos 6 meses</p>
            </div>
            <button 
              onClick={() => onNavigateToTab('financial')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 flex items-center gap-1 text-[10px] font-bold uppercase transition-all"
            >
              <span>Ver Fluxo</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="w-full h-72 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" name="Receita Bruta" dataKey="receita" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" />
                <Area type="monotone" name="Despesas" dataKey="despesa" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesa)" />
                <Area type="monotone" name="Lucro Líquido" dataKey="lucro" stroke="#3b82f6" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* OS Status Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white font-display">Distribuição das OS</h4>
            <p className="text-[11px] text-slate-400">Atividades de ordens de serviço por status</p>
          </div>
          {stats.osStatusChartData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="w-full h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.osStatusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.osStatusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '4px' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white font-display">
                    {stats.openOSCount + stats.completedOSCount}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Total OS</span>
                </div>
              </div>

              {/* Legends */}
              <div className="w-full grid grid-cols-2 gap-2 mt-4 text-[10px] max-h-36 overflow-y-auto">
                {stats.osStatusChartData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-500 dark:text-slate-400 truncate">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <PackageOpen size={36} className="stroke-[1.5] mb-2" />
              <span className="text-xs">Nenhuma OS registrada no período</span>
            </div>
          )}
        </div>
      </div>

      {/* Lower Section: Pending OS & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending/Open Service Orders */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white font-display">Ordens de Serviço Ativas</h4>
              <p className="text-[11px] text-slate-400">Próximos serviços em andamento e diagnóstico</p>
            </div>
            <button 
              onClick={() => onNavigateToTab('os')}
              className="text-[10px] font-bold text-blue-500 hover:underline uppercase"
            >
              Ver Todas
            </button>
          </div>

          <div className="flex-1 space-y-3 max-h-96 overflow-y-auto">
            {pendingOS.length > 0 ? (
              pendingOS.map((os) => (
                <div key={os.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 dark:text-white font-display text-sm">#{os.osNumber}</span>
                      <span className="text-slate-400">|</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-[11px]">{os.vehiclePlate}</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-500 font-medium truncate max-w-xs">{os.vehicleModel}</span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{os.clientName}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 truncate max-w-sm italic mt-1 font-mono text-[11px]">"{os.description}"</p>
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(os.status)}`}>
                      {getStatusLabel(os.status)}
                    </span>
                    <span className="text-xs font-black text-slate-800 dark:text-white font-display">{formatCurrency(os.total)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                <span className="text-xs">Todas as ordens de serviço foram concluídas!</span>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white font-display">Alertas de Estoque Baixo</h4>
              <p className="text-[11px] text-slate-400 font-medium text-rose-500">Itens com nível de estoque abaixo do mínimo de segurança</p>
            </div>
            <button 
              onClick={() => onNavigateToTab('inventory')}
              className="text-[10px] font-bold text-blue-500 hover:underline uppercase"
            >
              Repor Estoque
            </button>
          </div>

          <div className="flex-1 space-y-3 max-h-96 overflow-y-auto">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item.id} className="p-3 bg-rose-500/5 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-950/40 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-md">{item.code}</span>
                      <h5 className="font-bold text-slate-800 dark:text-white truncate max-w-xs">{item.name}</h5>
                    </div>
                    <p className="text-slate-400 text-[10px]">Fornecedor: {item.supplier}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-rose-600 dark:text-rose-400 text-sm">{item.currentStock}</span>
                      <span className="text-slate-400 text-[10px]">/</span>
                      <span className="text-slate-500 text-[10px]">{item.minStock} min</span>
                    </div>
                    <span className="text-[9px] text-rose-400 font-bold uppercase">Repor Imediato</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <ShieldCheck size={36} className="text-emerald-500 mb-2" />
                <span className="text-xs">Estoque saudável. Todos os itens em nível seguro.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
