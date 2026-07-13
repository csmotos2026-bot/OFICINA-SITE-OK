import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Download, Calendar, Printer, TrendingUp, 
  TrendingDown, CheckCircle2, Wrench, ShieldAlert, FileText, User
} from 'lucide-react';
import { apiFetch, formatCurrency, formatDateOnly } from '../utils';

export default function Reports() {
  const [orders, setOrders] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'FATURAMENTO' | 'SERVICOS' | 'CUSTOS'>('FATURAMENTO');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const ordersData = await apiFetch('/api/service-orders');
      const financialData = await apiFetch('/api/financial');
      setOrders(ordersData);
      setFinancials(financialData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtering Logic based on period
  const filterByPeriod = (dateStr: string) => {
    return dateStr >= startDate && dateStr <= endDate;
  };

  const filteredOrders = orders.filter(o => filterByPeriod(o.createdAt.split('T')[0]));
  const filteredFinancials = financials.filter(f => filterByPeriod(f.date));

  // Metrics Calculations for selected period
  const totalFaturadoPeriodo = filteredFinancials
    .filter(f => f.type === 'RECEITA' && f.status === 'PAGO')
    .reduce((sum, f) => sum + f.value, 0);

  const totalDespesasPeriodo = filteredFinancials
    .filter(f => f.type === 'DESPESA' && f.status === 'PAGO')
    .reduce((sum, f) => sum + f.value, 0);

  const totalServicosRealizados = filteredOrders
    .filter(o => o.status === 'CONCLUIDO')
    .length;

  const ticketMedio = totalServicosRealizados > 0 
    ? (filteredOrders.filter(o => o.status === 'CONCLUIDO').reduce((sum, o) => sum + o.total, 0) / totalServicosRealizados) 
    : 0;

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto no-print">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">Central de Relatórios ERP</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Gere demonstrativos fiscais, desempenho de faturamento, serviços mecânicos e imprima relatórios consolidados</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-white px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-md cursor-pointer"
        >
          <Printer size={15} />
          <span>Imprimir Relatório Consolidado</span>
        </button>
      </div>

      {/* Date filter selector */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Calendar size={15} />
          <span>Filtrar Competência:</span>
        </div>
        
        <div className="flex flex-1 gap-3 w-full">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Início do Período</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-mono"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fim do Período</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-mono"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
          {['FATURAMENTO', 'SERVICOS', 'CUSTOS'].map((t) => (
            <button
              key={t}
              onClick={() => setReportType(t as any)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                reportType === t 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview for selected period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Receita Líquida Período</span>
          <h4 className="text-xl font-black font-display text-emerald-600 mt-1">{formatCurrency(totalFaturadoPeriodo)}</h4>
          <span className="text-[9px] text-slate-400 block mt-0.5">Lançamentos recebidos faturados</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Custos / Despesas Período</span>
          <h4 className="text-xl font-black font-display text-rose-600 mt-1">{formatCurrency(totalDespesasPeriodo)}</h4>
          <span className="text-[9px] text-slate-400 block mt-0.5">Despesas fixas e variáveis quitadas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">OS Concluídas</span>
          <h4 className="text-xl font-black font-display text-slate-900 dark:text-white mt-1">{totalServicosRealizados} Ordens</h4>
          <span className="text-[9px] text-slate-400 block mt-0.5">Veículos entregues no período</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Ticket Médio de OS</span>
          <h4 className="text-xl font-black font-display text-blue-600 mt-1">{formatCurrency(ticketMedio)}</h4>
          <span className="text-[9px] text-slate-400 block mt-0.5">Faturamento / quantidade faturada</span>
        </div>
      </div>

      {/* Dynamic Content Table depending on Report Type */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-500" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-white font-display">
              {reportType === 'FATURAMENTO' && 'Detalhamento de Faturamento e Entradas'}
              {reportType === 'SERVICOS' && 'Histórico de Serviços Prestados por Mecânicos'}
              {reportType === 'CUSTOS' && 'Análise de Despesas e Saídas de Caixa'}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Exibindo registros de {startDate} até {endDate}</span>
        </div>

        {reportType === 'FATURAMENTO' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Emissão</th>
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Valor bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFinancials.filter(f => f.type === 'RECEITA').map((item) => (
                  <tr key={item.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50">
                    <td className="p-4 text-slate-400">{formatDateOnly(item.date)}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{item.description}</td>
                    <td className="p-4 text-slate-400">{item.category}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded-md font-bold text-[10px]">{item.status}</span>
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600 font-mono">+{formatCurrency(item.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'SERVICOS' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">OS nº</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Veículo/Placa</th>
                  <th className="p-4">Mecânico Responsável</th>
                  <th className="p-4">Peças</th>
                  <th className="p-4">Mão de Obra</th>
                  <th className="p-4 text-right">Valor OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((item) => (
                  <tr key={item.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50">
                    <td className="p-4 font-bold">#{item.osNumber}</td>
                    <td className="p-4 font-semibold">{item.clientName}</td>
                    <td className="p-4 font-mono font-bold text-blue-600">{item.vehiclePlate}</td>
                    <td className="p-4">{item.mechanicName}</td>
                    <td className="p-4 text-slate-400">{item.parts.length} itens</td>
                    <td className="p-4 text-slate-400">{item.labor.length} serviços</td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'CUSTOS' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Emissão</th>
                  <th className="p-4">Despesa / Custo faturado</th>
                  <th className="p-4">Categoria fiscal</th>
                  <th className="p-4">Data Vencimento</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Valor Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFinancials.filter(f => f.type === 'DESPESA').map((item) => (
                  <tr key={item.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50">
                    <td className="p-4 text-slate-400">{formatDateOnly(item.date)}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{item.description}</td>
                    <td className="p-4 text-slate-400">{item.category}</td>
                    <td className="p-4 text-slate-400 font-mono">{formatDateOnly(item.dueDate)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${item.status === 'PAGO' ? 'bg-green-500/10 text-green-600' : 'bg-rose-500/10 text-rose-600'}`}>{item.status}</span>
                    </td>
                    <td className="p-4 text-right font-bold text-rose-600 font-mono">-{formatCurrency(item.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Polish Print Report Sheet (hides in UI, displays when calling window.print) */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 text-black text-xs space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-xl font-black font-display uppercase">CSMOTOS ERP - Relatório Gerencial</h2>
            <p className="text-[10px] text-slate-500">Período de Competência: {startDate} até {endDate}</p>
          </div>
          <p className="text-[10px] text-slate-500 text-right">Emissão em: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-4 gap-4 border p-4 rounded-xl">
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold">Faturamento Total:</p>
            <p className="text-sm font-black mt-0.5">{formatCurrency(totalFaturadoPeriodo)}</p>
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold">Despesas Totais:</p>
            <p className="text-sm font-black mt-0.5">{formatCurrency(totalDespesasPeriodo)}</p>
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold">Fluxo Líquido:</p>
            <p className="text-sm font-black mt-0.5 text-emerald-600">{formatCurrency(totalFaturadoPeriodo - totalDespesasPeriodo)}</p>
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold">Total Serviços:</p>
            <p className="text-sm font-black mt-0.5">{totalServicosRealizados} OS Concluídas</p>
          </div>
        </div>

        <div className="border rounded-xl p-4">
          <h4 className="font-extrabold uppercase border-b pb-2 mb-3 text-[10px] tracking-wider">Detalhamento Físico de Serviços Realizados</h4>
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b font-bold text-slate-500 bg-slate-50">
                <th className="py-1">OS</th>
                <th className="py-1">Cliente</th>
                <th className="py-1">Placa</th>
                <th className="py-1">Mecânico</th>
                <th className="py-1 text-right">Valor Final</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id} className="border-b">
                  <td className="py-1.5 font-bold">#{o.osNumber}</td>
                  <td className="py-1.5">{o.clientName}</td>
                  <td className="py-1.5 font-mono">{o.vehiclePlate}</td>
                  <td className="py-1.5">{o.mechanicName}</td>
                  <td className="py-1.5 text-right font-mono font-bold">{formatCurrency(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center text-[10px] text-slate-400 border-t pt-4">
          Comprovante fiscal administrativo consolidado do sistema ERP CSMOTOS.
        </div>
      </div>
    </div>
  );
}
