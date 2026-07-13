import React, { useState } from 'react';
import { 
  Search, Car, User, FileText, CheckCircle2, Clock, AlertCircle, 
  MapPin, DollarSign, PenTool, HelpCircle, Wrench, Package 
} from 'lucide-react';
import { apiFetch, formatCurrency, formatDateOnly } from '../utils';

export default function QuickSearch() {
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!cleanPlate) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await apiFetch(`/api/vehicles/plate/${cleanPlate}`);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Veículo não localizado pela placa fornecida.');
    } finally {
      setLoading(false);
    }
  };

  const loadPresetPlate = (preset: string) => {
    setPlate(preset);
    setTimeout(() => {
      // Simulate submission
      setLoading(true);
      setError('');
      apiFetch(`/api/vehicles/plate/${preset}`)
        .then(data => setResult(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, 100);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ORCAMENTO': return 'Orçamento';
      case 'APROVADO': return 'Aprovado';
      case 'EM_ANDAMENTO': return 'Em Execução';
      case 'AGUARDANDO_PECA': return 'Aguardando Peça';
      case 'PRONTO': return 'Pronto para Retirada';
      case 'CONCLUIDO': return 'Entregue / Concluído';
      case 'CANCELADO': return 'Cancelado';
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
      case 'CONCLUIDO': return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">Pesquisa Histórica por Placa</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Acesso instantâneo à ficha cadastral do veículo, dados do proprietário e histórico completo de OS realizadas</p>
      </div>

      {/* Plate Input with Brazil Mercosul Styling */}
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="block text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Digite a placa do veículo
          </label>
          
          {/* Brazil Mercosul Plate frame */}
          <div className="border-[4px] border-slate-950 rounded-2xl overflow-hidden shadow-md max-w-sm mx-auto">
            {/* Top blue bar */}
            <div className="bg-blue-600 px-4 py-1.5 flex justify-between items-center text-white text-[9px] font-bold select-none">
              <span>BRASIL</span>
              <span className="w-4 h-2.5 bg-yellow-400 rounded-xs relative">
                <span className="absolute inset-0 bg-blue-800 rounded-full scale-50" />
              </span>
            </div>
            {/* Middle white plate input body */}
            <div className="bg-white p-3 flex items-center justify-center">
              <input
                type="text"
                placeholder="BRA2E19"
                maxLength={7}
                className="w-full text-center text-3xl font-black font-display tracking-widest text-slate-900 focus:outline-none uppercase placeholder:text-slate-300"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !plate}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search size={16} />
                <span>Pesquisar Histórico Completo</span>
              </>
            )}
          </button>
        </form>

        {/* Shortcuts / Presets */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Consultas Frequentes:</span>
          {['BRA2E19', 'MEC1A23', 'ERP4O99'].map((p) => (
            <button
              key={p}
              onClick={() => loadPresetPlate(p)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer font-mono"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="max-w-xl mx-auto p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-2xl flex items-center gap-3 fade-in">
          <AlertCircle size={18} className="shrink-0" />
          <div>
            <h5 className="font-bold">Placa não encontrada no sistema</h5>
            <p className="text-[11px] text-rose-500/80 mt-0.5">Certifique-se de que a placa está cadastrada no menu "Veículos" do ERP antes de realizar a pesquisa histórica.</p>
          </div>
        </div>
      )}

      {/* Full Vehicle & History Profile */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
          {/* Column 1: Ficha Técnica e Proprietário */}
          <div className="space-y-6">
            {/* Vehicle Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                <Car size={18} className="text-blue-500" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white font-display">Ficha Cadastral do Veículo</h4>
              </div>
              <div className="p-5 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-400">Placa Mercosul</span>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-100/40 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-md text-[11px] tracking-wider">
                    {result.vehicle.plate}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-400">Marca / Modelo</span>
                  <span className="font-bold text-slate-700 dark:text-white">{result.vehicle.brand} {result.vehicle.model}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-400">Ano Fabricação/Modelo</span>
                  <span className="font-mono">{result.vehicle.year}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-400">Cor Predominante</span>
                  <span>{result.vehicle.color}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-400">Quilometragem Registrada</span>
                  <span className="font-mono font-semibold">{result.vehicle.mileage.toLocaleString()} KM</span>
                </div>
                {result.vehicle.chassis && (
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <span className="text-slate-400">Chassi</span>
                    <span className="font-mono text-[10px]">{result.vehicle.chassis}</span>
                  </div>
                )}
                {result.vehicle.renavam && (
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <span className="text-slate-400">Renavam</span>
                    <span className="font-mono text-[10px]">{result.vehicle.renavam}</span>
                  </div>
                )}
                {result.vehicle.observations && (
                  <div className="pt-1.5">
                    <span className="text-slate-400 block mb-1">Notas Internas:</span>
                    <p className="text-slate-500 italic p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px]">"{result.vehicle.observations}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                <User size={18} className="text-emerald-500" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white font-display">Proprietário Responsável</h4>
              </div>
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</span>
                  <h5 className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{result.owner.name}</h5>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-400">CPF / CNPJ</span>
                  <span className="font-mono">{result.owner.cpfCnpj}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-400">Telefone / WhatsApp</span>
                  <span>{result.owner.phone}</span>
                </div>
                {result.owner.email && (
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <span className="text-slate-400">E-mail</span>
                    <span className="truncate max-w-[150px]" title={result.owner.email}>{result.owner.email}</span>
                  </div>
                )}
                <div className="pt-1.5 flex items-start gap-2 text-slate-500">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-normal">
                    {result.owner.address.street}, {result.owner.address.number} - {result.owner.address.neighborhood}, {result.owner.address.city}/{result.owner.address.state}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Histórico de Manutenções e Peças */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-full">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText size={18} className="text-blue-500" />
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white font-display">Histórico de Manutenções na Oficina</h4>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                  {result.history.length} Serviços
                </span>
              </div>

              <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto flex-1 max-h-[600px] space-y-6">
                {result.history.length > 0 ? (
                  result.history.map((os: any) => (
                    <div key={os.id} className="pt-6 first:pt-0 space-y-4">
                      {/* OS Header summary */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 text-xs">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white font-display">Ordem de Serviço #{os.osNumber}</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-500 font-medium">{formatDateOnly(os.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(os.status)}`}>
                            {getStatusLabel(os.status)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${os.paymentStatus === 'PAGO' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                            {os.paymentStatus === 'PAGO' ? 'PAGO' : 'PENDENTE'}
                          </span>
                        </div>
                      </div>

                      {/* OS Description */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block">Serviço Solicitado / Reclamação</span>
                        <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">"{os.description}"</p>
                      </div>

                      {/* Items utilized in OS: Parts & Labor */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Parts */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                          <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider flex items-center gap-1 mb-2">
                            <Package size={12} />
                            <span>Peças Utilizadas ({os.parts.length})</span>
                          </span>
                          {os.parts.length > 0 ? (
                            <ul className="space-y-2 text-[11px]">
                              {os.parts.map((p: any, i: number) => (
                                <li key={i} className="flex justify-between text-slate-600 dark:text-slate-300 border-b border-slate-100/40 dark:border-slate-800 pb-1 last:border-none last:pb-0">
                                  <span className="truncate max-w-[150px]">{p.name}</span>
                                  <span className="font-mono text-slate-400 shrink-0 font-medium">x{p.quantity} ({formatCurrency(p.unitPrice)})</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Nenhuma peça faturada</span>
                          )}
                        </div>

                        {/* Labor */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                          <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider flex items-center gap-1 mb-2">
                            <Wrench size={12} />
                            <span>Mão de Obra / Serviços ({os.labor.length})</span>
                          </span>
                          {os.labor.length > 0 ? (
                            <ul className="space-y-2 text-[11px]">
                              {os.labor.map((l: any, i: number) => (
                                <li key={i} className="flex justify-between text-slate-600 dark:text-slate-300 border-b border-slate-100/40 dark:border-slate-800 pb-1 last:border-none last:pb-0">
                                  <span className="truncate max-w-[150px]">{l.description}</span>
                                  <span className="font-mono text-slate-400 shrink-0 font-medium">({formatCurrency(l.price)})</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Nenhum serviço faturado</span>
                          )}
                        </div>
                      </div>

                      {/* Mechanic & Technical Observations */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-slate-50/20 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <PenTool size={13} className="text-slate-400" />
                          <span>Responsável: <strong className="text-slate-700 dark:text-slate-300">{os.mechanicName}</strong></span>
                        </div>
                        {os.observations && (
                          <p className="text-slate-400 italic text-[11px] max-w-sm truncate" title={os.observations}>
                            obs: "{os.observations}"
                          </p>
                        )}
                        <div className="text-right shrink-0">
                          <span className="text-slate-400 text-[10px] block font-semibold uppercase">Valor Total</span>
                          <span className="font-black font-display text-slate-800 dark:text-white text-sm">{formatCurrency(os.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <CheckCircle2 size={40} className="text-emerald-500 mb-2 stroke-[1.5]" />
                    <h5 className="font-bold text-slate-700 dark:text-white text-sm">Sem histórico de manutenção</h5>
                    <p className="text-xs text-slate-400 max-w-xs text-center mt-1">Este veículo está cadastrado na frota, mas ainda não possui nenhuma Ordem de Serviço faturada ou orçamento emitido.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
