import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, Search, 
  Download, Filter, CheckCircle2, AlertCircle, X, HelpCircle, Check, ArrowRight, Trash2
} from 'lucide-react';
import { FinancialTransaction } from '../types';
import { apiFetch, formatCurrency, formatDateOnly } from '../utils';

export default function Financial() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'TODOS' | 'RECEITA' | 'DESPESA'>('TODOS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PAGO' | 'PENDENTE' | 'VENCIDO'>('TODOS');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [type, setType] = useState<'RECEITA' | 'DESPESA'>('RECEITA');
  const [category, setCategory] = useState<string>('SERVICO');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentDate, setPaymentDate] = useState('');
  const [status, setStatus] = useState<'PAGO' | 'PENDENTE'>('PAGO');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/financial');
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setType('RECEITA');
    setCategory('SERVICO');
    setDescription('');
    setValue(0);
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date().toISOString().split('T')[0]);
    setPaymentDate('');
    setStatus('PAGO');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || value <= 0 || !date || !dueDate) {
      setError('Por favor, preencha os campos obrigatórios (Descrição, Valor, Data de Emissão e Vencimento).');
      return;
    }

    const payload = {
      type,
      category,
      description,
      value,
      date,
      dueDate,
      paymentDate: status === 'PAGO' ? (paymentDate || date) : undefined,
      status
    };

    try {
      await apiFetch('/api/financial', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showSuccess('Lançamento financeiro registrado com sucesso!');
      setModalOpen(false);
      loadTransactions();
    } catch (err: any) {
      setError(err.message || 'Erro ao lançar transação.');
    }
  };

  const handleMarkAsPaid = async (tx: FinancialTransaction) => {
    try {
      await apiFetch(`/api/financial/${tx.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'PAGO',
          paymentDate: new Date().toISOString().split('T')[0]
        })
      });
      showSuccess(`Lançamento "${tx.description}" marcado como PAGO!`);
      loadTransactions();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar pagamento.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este lançamento financeiro permanentemente?')) return;
    try {
      await apiFetch(`/api/financial/${id}`, { method: 'DELETE' });
      showSuccess('Lançamento financeiro removido.');
      loadTransactions();
    } catch (err: any) {
      alert(err.message || 'Não foi possível excluir.');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Real Integration Feature: EXPORT TO EXCEL CSV RELATÓRIO
  const handleExportCSV = () => {
    if (filteredTx.length === 0) {
      alert('Nenhum dado filtrado para exportação!');
      return;
    }

    // Header row
    let csvContent = 'ID;Tipo;Categoria;Descricao;Valor;Data Emissao;Data Vencimento;Data Pagamento;Status\n';
    
    // Data rows
    filteredTx.forEach((t) => {
      csvContent += `${t.id};${t.type};${t.category};${t.description.replace(/;/g, ',')};${t.value.toFixed(2).replace('.', ',')};${t.date};${t.dueDate};${t.paymentDate || '-'};${t.status}\n`;
    });

    // Create blobs and trigger client-side download
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Financial Indicators Calculations
  const totalReceitasPagas = transactions
    .filter(t => t.type === 'RECEITA' && t.status === 'PAGO')
    .reduce((sum, t) => sum + t.value, 0);

  const totalDespesasPagas = transactions
    .filter(t => t.type === 'DESPESA' && t.status === 'PAGO')
    .reduce((sum, t) => sum + t.value, 0);

  const saldoCaixaReal = totalReceitasPagas - totalDespesasPagas;

  const contasAReceberPendente = transactions
    .filter(t => t.type === 'RECEITA' && t.status === 'PENDENTE')
    .reduce((sum, t) => sum + t.value, 0);

  const contasAPagarPendente = transactions
    .filter(t => t.type === 'DESPESA' && (t.status === 'PENDENTE' || t.status === 'VENCIDO'))
    .reduce((sum, t) => sum + t.value, 0);

  // Filters
  const filteredTx = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'TODOS' || t.type === typeFilter;
    const matchStatus = statusFilter === 'TODOS' || t.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      'SERVICO': 'Serviço Prestado',
      'VENDA_PECA': 'Venda de Peças',
      'SALARIO': 'Salários Equipe',
      'ALUGUEL': 'Aluguel do Galpão',
      'FERRAMENTAS': 'Maquinário / Ferramentas',
      'IMPOSTOS': 'Impostos / DAS',
      'UTILIDADES': 'Água / Luz / Internet',
      'FORNECEDOR': 'Fornecedores de Peças',
      'OUTROS': 'Outros Custos Diversos'
    };
    return labels[cat] || cat;
  };

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto">
      {/* Header and buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">Fluxo de Caixa & Finanças</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Escrituração de despesas fixas, conciliação bancária, contas a pagar e faturamento líquido</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer shadow-xs"
          >
            <Download size={15} />
            <span>Exportar Excel (CSV)</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus size={16} />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Financial Bento Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Real Cash balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo Real em Caixa</span>
            <h3 className={`text-lg sm:text-xl font-black font-display mt-1 ${saldoCaixaReal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(saldoCaixaReal)}
            </h3>
            <span className="text-[9px] text-slate-400 block mt-0.5">Receitas pagas - despesas pagas</span>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 shrink-0">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Total Receivables */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contas a Receber</span>
            <h3 className="text-lg sm:text-xl font-black font-display text-blue-600 mt-1">{formatCurrency(contasAReceberPendente)}</h3>
            <span className="text-[9px] text-slate-400 block mt-0.5">Faturamento de OS em aberto</span>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Total Payables */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-rose-500">Contas a Pagar</span>
            <h3 className="text-lg sm:text-xl font-black font-display text-rose-600 mt-1">{formatCurrency(contasAPagarPendente)}</h3>
            <span className="text-[9px] text-slate-400 block mt-0.5">Fornecedores/custos pendentes</span>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-lg shrink-0">
            <TrendingDown size={18} />
          </div>
        </div>

        {/* Projected flow balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fluxo Projetado</span>
            <h3 className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white mt-1">
              {formatCurrency(saldoCaixaReal + contasAReceberPendente - contasAPagarPendente)}
            </h3>
            <span className="text-[9px] text-slate-400 block mt-0.5">Saldo real + previsões pendentes</span>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 shrink-0">
            <ArrowRight size={18} />
          </div>
        </div>
      </div>

      {/* Advanced Filtering Area */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Filtrar por descrição ou categoria..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Fluxo:</span>
          <select
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-semibold text-slate-700 dark:text-white focus:outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="TODOS">Todos Fluxos</option>
            <option value="RECEITA">Apenas Receitas (+)</option>
            <option value="DESPESA">Apenas Despesas (-)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Status:</span>
          <select
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-semibold text-slate-700 dark:text-white focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="TODOS">Todos Status</option>
            <option value="PAGO">Liquidados (PAGO)</option>
            <option value="PENDENTE">Aberto (PENDENTE)</option>
            <option value="VENCIDO">Vencidos em atraso</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-500">Buscando lançamentos do razão...</span>
        </div>
      ) : filteredTx.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Data Emissão</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Descrição de Lançamento</th>
                  <th className="p-4">Data Vencimento</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTx.map((tx) => {
                  const isRevenue = tx.type === 'RECEITA';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300">
                      <td className="p-4 text-slate-400">{formatDateOnly(tx.date)}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[9px] ${isRevenue ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                          {isRevenue ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-500">{getCategoryLabel(tx.category)}</td>
                      <td className="p-4 font-medium text-slate-800 dark:text-white">{tx.description}</td>
                      <td className="p-4 text-slate-400 font-mono">{formatDateOnly(tx.dueDate)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tx.status === 'PAGO' 
                            ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-850'
                            : tx.status === 'VENCIDO'
                            ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`p-4 font-bold font-mono text-sm ${isRevenue ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isRevenue ? '+' : '-'} {formatCurrency(tx.value)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {tx.status !== 'PAGO' && (
                            <button
                              onClick={() => handleMarkAsPaid(tx)}
                              className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg cursor-pointer"
                              title="Marcar como Pago"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer"
                            title="Excluir Lançamento"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 py-12 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 flex flex-col items-center">
          <HelpCircle size={40} className="stroke-[1.5] text-slate-400 mb-3" />
          <h4 className="font-bold text-sm text-slate-700 dark:text-white">Nenhum lançamento financeiro faturado</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">Nenhum lançamento corresponde aos filtros ativos no painel de competência.</p>
        </div>
      )}

      {/* Add Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold font-display text-slate-800 dark:text-white text-base sm:text-lg">
                Registrar Movimentação de Caixa
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Tipo de Movimentação *</label>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none font-bold"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="RECEITA">(+) Receita / Entrada de Capital</option>
                    <option value="DESPESA">(-) Despesa / Saída de Capital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Categoria de Lançamento *</label>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {type === 'RECEITA' ? (
                      <>
                        <option value="SERVICO">Serviço Prestado</option>
                        <option value="VENDA_PECA">Venda de Peças</option>
                        <option value="OUTROS">Outras Receitas Financeiras</option>
                      </>
                    ) : (
                      <>
                        <option value="SALARIO">Salários e Pró-labore</option>
                        <option value="ALUGUEL">Aluguel do Galpão</option>
                        <option value="FORNECEDOR">Fornecedores de Peças</option>
                        <option value="UTILIDADES">Água / Luz / Internet</option>
                        <option value="FERRAMENTAS">Maquinário / Ferramentas</option>
                        <option value="IMPOSTOS">Impostos / Tributos / Simples</option>
                        <option value="OUTROS">Outras Despesas de Custo</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Descrição do Lançamento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pagamento conta de energia Oficina Norte"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Valor Financeiro (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="R$ 0,00"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none font-mono"
                    value={value || ''}
                    onChange={(e) => setValue(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Data de Emissão *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none font-mono"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none font-mono"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Estado Inicial de Liquidação</label>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none font-bold"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="PAGO">Pago / Liquidado (Compensado)</option>
                    <option value="PENDENTE">Pendente / Em Aberto (Futuro)</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
