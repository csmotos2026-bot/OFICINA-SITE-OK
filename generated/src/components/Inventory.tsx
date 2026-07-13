import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Package, ArrowUpRight, 
  ArrowDownRight, AlertTriangle, ShieldCheck, DollarSign, HelpCircle, X, Check, Settings, AlertCircle
} from 'lucide-react';
import { InventoryItem } from '../types';
import { apiFetch, formatCurrency } from '../utils';

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal Stock State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Quick Adjustment State
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/inventory');
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setCode(`P-00${items.length + 1}`);
    setName('');
    setDescription('');
    setSupplier('');
    setCostPrice(0);
    setSalePrice(0);
    setCurrentStock(10);
    setMinStock(3);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setDescription(item.description || '');
    setSupplier(item.supplier);
    setCostPrice(item.costPrice);
    setSalePrice(item.salePrice);
    setCurrentStock(item.currentStock);
    setMinStock(item.minStock);
    setError('');
    setModalOpen(true);
  };

  const handleQuickAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;

    let newStock = adjustItem.currentStock;
    if (adjustType === 'ENTRADA') {
      newStock += adjustQty;
    } else {
      newStock = Math.max(0, newStock - adjustQty);
    }

    try {
      await apiFetch(`/api/inventory/${adjustItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ currentStock: newStock })
      });
      showSuccess(`Ajuste de estoque efetuado para ${adjustItem.name}! Novo saldo: ${newStock}`);
      setAdjustItem(null);
      loadItems();
    } catch (err: any) {
      alert(err.message || 'Erro ao reajustar estoque.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || costPrice <= 0 || salePrice <= 0) {
      setError('Por favor, preencha os campos obrigatórios (Código, Nome, Preço de Custo e Venda).');
      return;
    }

    const payload = {
      code,
      name,
      description,
      supplier,
      costPrice,
      salePrice,
      currentStock,
      minStock
    };

    try {
      if (editingItem) {
        await apiFetch(`/api/inventory/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showSuccess('Item atualizado com sucesso!');
      } else {
        await apiFetch('/api/inventory', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showSuccess('Nova peça adicionada ao catálogo!');
      }
      setModalOpen(false);
      loadItems();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar peça.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este item do estoque?')) return;
    try {
      await apiFetch(`/api/inventory/${id}`, { method: 'DELETE' });
      showSuccess('Item excluído!');
      loadItems();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir item.');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Metrics
  const totalCatalogValueCost = items.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0);
  const totalCatalogValueSale = items.reduce((sum, item) => sum + (item.currentStock * item.salePrice), 0);
  const lowStockCount = items.filter(item => item.currentStock <= item.minStock).length;

  const filteredItems = items.filter(i => 
    i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">Controle de Estoque</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Gerenciamento de peças, fornecedores, entradas, saídas e alertas de estoque crítico</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>Cadastrar Peça</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Patrimônio em Estoque (Custo)</span>
            <p className="text-lg font-black font-display text-slate-900 dark:text-white mt-1">{formatCurrency(totalCatalogValueCost)}</p>
          </div>
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
            <Package size={18} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Potencial Faturamento Venda</span>
            <p className="text-lg font-black font-display text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalCatalogValueSale)}</p>
          </div>
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-600">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase font-bold text-rose-500">Alertas Ativos</span>
            <p className="text-lg font-black font-display text-rose-600 dark:text-rose-400 mt-1">{lowStockCount} Itens Críticos</p>
          </div>
          <div className="p-2.5 bg-rose-500/10 rounded-lg text-rose-600">
            <AlertTriangle size={18} />
          </div>
        </div>
      </div>

      {/* Filter and Adjustment Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Filter input */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Pesquisar por Código, Nome da Peça ou Fornecedor..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Quick adjustment panel */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowUpRight size={14} className="text-blue-500" />
            <span>Ajuste Rápido de Saldo</span>
          </h4>
          {adjustItem ? (
            <form onSubmit={handleQuickAdjustmentSubmit} className="space-y-3">
              <p className="text-[10px] font-bold text-slate-500 truncate">Ajustando: {adjustItem.name}</p>
              <div className="grid grid-cols-3 gap-2">
                <select
                  className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-bold focus:outline-none text-slate-700 dark:text-white"
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                >
                  <option value="ENTRADA">Entrada</option>
                  <option value="SAIDA">Saída</option>
                </select>
                <input
                  type="number"
                  min={1}
                  required
                  className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs text-center font-semibold text-slate-700 dark:text-white"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                >
                  Gravar
                </button>
              </div>
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                className="text-[10px] text-slate-400 hover:underline block mx-auto cursor-pointer"
              >
                Cancelar Ajuste
              </button>
            </form>
          ) : (
            <p className="text-[11px] text-slate-400 leading-relaxed py-2 text-center">
              Selecione o ícone <Settings size={12} className="inline mx-0.5" /> de ajuste na tabela ao lado para adicionar ou retirar itens rapidamente.
            </p>
          )}
        </div>
      </div>

      {/* Parts Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-500">Buscando catálogo de peças...</span>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Cód.</th>
                  <th className="p-4">Peça / Produto</th>
                  <th className="p-4">Fornecedor</th>
                  <th className="p-4">Custo</th>
                  <th className="p-4">Venda</th>
                  <th className="p-4">Margem %</th>
                  <th className="p-4 text-center">Estoque</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => {
                  const margin = ((item.salePrice - item.costPrice) / item.costPrice) * 100;
                  const isLow = item.currentStock <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300">
                      <td className="p-4 font-mono font-bold bg-slate-50 dark:bg-slate-800/20 text-slate-500 text-[10px]">{item.code}</td>
                      <td className="p-4">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.description || 'Sem descrição'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">{item.supplier}</td>
                      <td className="p-4 font-mono">{formatCurrency(item.costPrice)}</td>
                      <td className="p-4 font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(item.salePrice)}</td>
                      <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400 font-mono">+{margin.toFixed(0)}%</td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className={`font-mono font-bold text-xs ${isLow ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-md animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                            {item.currentStock} Un
                          </span>
                          <span className="text-[9px] text-slate-400 mt-1">min: {item.minStock}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { setAdjustItem(item); setAdjustQty(1); setAdjustType('ENTRADA'); }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-500 rounded-lg cursor-pointer"
                            title="Ajuste Rápido de Saldo"
                          >
                            <Settings size={14} />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg cursor-pointer"
                            title="Editar Dados da Peça"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer"
                            title="Excluir Peça"
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
          <h4 className="font-bold text-sm text-slate-700 dark:text-white">Nenhum item localizado</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">Refine seus termos ou adicione uma nova peça de estoque no botão superior.</p>
        </div>
      )}

      {/* Create / Edit Piece Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold font-display text-slate-800 dark:text-white text-base sm:text-lg">
                {editingItem ? 'Editar Cadastro da Peça' : 'Cadastrar Nova Peça / Produto'}
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
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Código SKU / Referência *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: P-001"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Nome do Item / Produto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amortecedor Traseiro Gol"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Fornecedor Preferencial</label>
                  <input
                    type="text"
                    placeholder="Ex: Distribuidora AutoPeças Paulista"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Preço de Compra (Custo) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="R$ 0,00"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none font-mono"
                    value={costPrice || ''}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Preço de Venda (Final) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="R$ 0,00"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none font-mono"
                    value={salePrice || ''}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Estoque Inicial Atual *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 10"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none font-mono"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Estoque Mínimo de Alerta *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 3"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none font-mono"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Descrição Física / Aplicações</label>
                  <textarea
                    placeholder="Ex: pastilha para freio a disco ventilado, Gol G5/G6 motor EA111..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none h-16"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Form actions */}
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
                  {editingItem ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
