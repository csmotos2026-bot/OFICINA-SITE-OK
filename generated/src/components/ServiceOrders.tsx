import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Plus, Search, Edit, Trash2, CheckCircle2, 
  X, AlertCircle, Printer, Send, User, Car, ShoppingBag, 
  Wrench, DollarSign, Calendar, Clock, Edit3, HelpCircle, Save, Share2
} from 'lucide-react';
import { ServiceOrder, Client, Vehicle, InventoryItem, OSPart, OSLabor, OSStatus } from '../types';
import { apiFetch, formatCurrency, formatDate } from '../utils';

export default function ServiceOrders() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parts, setParts] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal OS State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<ServiceOrder | null>(null);

  // Form State
  const [clientId, setClientId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [mechanicId, setMechanicId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<OSStatus>('ORCAMENTO');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO' | 'BOLETO' | 'FATURADO'>('PIX');
  const [paymentStatus, setPaymentStatus] = useState<'PENDENTE' | 'PAGO' | 'CANCELADO'>('PENDENTE');
  const [observations, setObservations] = useState('');

  // Selected components lists
  const [addedParts, setAddedParts] = useState<OSPart[]>([]);
  const [addedLabor, setAddedLabor] = useState<OSLabor[]>([]);

  // Temp part and labor states
  const [selectedPartId, setSelectedPartId] = useState('');
  const [selectedPartQty, setSelectedPartQty] = useState<number>(1);
  const [tempLaborDesc, setTempLaborDesc] = useState('');
  const [tempLaborPrice, setTempLaborPrice] = useState<number>(0);

  // Signature state
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Print invoice state
  const [activeInvoice, setActiveInvoice] = useState<ServiceOrder | null>(null);

  // Error/Success
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mechanics List
  const mechanics = [
    { id: 'u-mecanico1', name: 'Pedro Santos' },
    { id: 'u-mecanico2', name: 'Julio Silva' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const ordersData = await apiFetch('/api/service-orders');
      const clientsData = await apiFetch('/api/clients');
      const vehiclesData = await apiFetch('/api/vehicles');
      const partsData = await apiFetch('/api/inventory');
      setOrders(ordersData);
      setClients(clientsData);
      setVehicles(vehiclesData);
      setParts(partsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingOS(null);
    setClientId(clients[0]?.id || '');
    setVehicleId(vehicles[0]?.id || '');
    setMechanicId(mechanics[0].id);
    setDescription('');
    setStatus('ORCAMENTO');
    setDiscount(0);
    setPaymentMethod('PIX');
    setPaymentStatus('PENDENTE');
    setObservations('');
    setAddedParts([]);
    setAddedLabor([]);
    setSignatureDataUrl('');
    setSelectedPartId('');
    setSelectedPartQty(1);
    setTempLaborDesc('');
    setTempLaborPrice(0);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (os: ServiceOrder) => {
    setEditingOS(os);
    setClientId(os.clientId);
    setVehicleId(os.vehicleId);
    setMechanicId(os.mechanicId);
    setDescription(os.description);
    setStatus(os.status);
    setDiscount(os.discount);
    setPaymentMethod(os.paymentMethod || 'PIX');
    setPaymentStatus(os.paymentStatus);
    setObservations(os.observations || '');
    setAddedParts(os.parts);
    setAddedLabor(os.labor);
    setSignatureDataUrl(os.signature || '');
    setSelectedPartId('');
    setSelectedPartQty(1);
    setTempLaborDesc('');
    setTempLaborPrice(0);
    setError('');
    setModalOpen(true);
  };

  // Handle Client Selection side effects (update vehicles selection to client-owned)
  const availableVehiclesForClient = vehicles.filter(v => v.clientId === clientId);

  useEffect(() => {
    if (availableVehiclesForClient.length > 0 && !editingOS) {
      setVehicleId(availableVehiclesForClient[0].id);
    }
  }, [clientId]);

  // Inventory Part Adding logic
  const handleAddPart = () => {
    if (!selectedPartId) return;
    const item = parts.find(p => p.id === selectedPartId);
    if (!item) return;

    if (item.currentStock < selectedPartQty) {
      alert(`Quantidade em falta no estoque! Apenas ${item.currentStock} unidades disponíveis.`);
      return;
    }

    // Check if already added, merge quantities
    const existsIndex = addedParts.findIndex(p => p.partId === selectedPartId);
    if (existsIndex !== -1) {
      const updated = [...addedParts];
      updated[existsIndex].quantity += selectedPartQty;
      updated[existsIndex].totalPrice = updated[existsIndex].quantity * updated[existsIndex].unitPrice;
      setAddedParts(updated);
    } else {
      const newPart: OSPart = {
        partId: selectedPartId,
        name: item.name,
        quantity: selectedPartQty,
        unitPrice: item.salePrice,
        totalPrice: selectedPartQty * item.salePrice
      };
      setAddedParts([...addedParts, newPart]);
    }
    
    setSelectedPartId('');
    setSelectedPartQty(1);
  };

  const handleRemovePart = (index: number) => {
    setAddedParts(addedParts.filter((_, i) => i !== index));
  };

  // Labor Addition Logic
  const handleAddLabor = () => {
    if (!tempLaborDesc || tempLaborPrice <= 0) return;
    const newLabor: OSLabor = {
      description: tempLaborDesc,
      price: tempLaborPrice,
      quantity: 1,
      totalPrice: tempLaborPrice
    };
    setAddedLabor([...addedLabor, newLabor]);
    setTempLaborDesc('');
    setTempLaborPrice(0);
  };

  const handleRemoveLabor = (index: number) => {
    setAddedLabor(addedLabor.filter((_, i) => i !== index));
  };

  // Calculate Totals
  const partsSubtotal = addedParts.reduce((sum, p) => sum + p.totalPrice, 0);
  const laborSubtotal = addedLabor.reduce((sum, l) => sum + l.totalPrice, 0);
  const subtotal = partsSubtotal + laborSubtotal;
  const total = Math.max(0, subtotal - discount);

  // Digital Signature Canvas Operations
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setSignatureDataUrl(dataUrl);
    alert('Assinatura digital gravada com sucesso!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedClient = clients.find(c => c.id === clientId);
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    const selectedMechanic = mechanics.find(m => m.id === mechanicId);

    if (!selectedClient || !selectedVehicle || !selectedMechanic) {
      setError('Por favor, certifique-se de preencher Cliente, Veículo e Mecânico.');
      return;
    }

    const payload = {
      clientId,
      clientName: selectedClient.name,
      vehicleId,
      vehiclePlate: selectedVehicle.plate,
      vehicleModel: `${selectedVehicle.brand} ${selectedVehicle.model}`,
      description,
      mechanicId,
      mechanicName: selectedMechanic.name,
      status,
      parts: addedParts,
      labor: addedLabor,
      discount,
      paymentMethod,
      paymentStatus,
      signature: signatureDataUrl || undefined,
      observations,
      photos: []
    };

    try {
      if (editingOS) {
        await apiFetch(`/api/service-orders/${editingOS.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showSuccess('Ordem de serviço atualizada com sucesso!');
      } else {
        await apiFetch('/api/service-orders', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showSuccess('Ordem de serviço aberta e faturada!');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar Ordem de Serviço.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta Ordem de Serviço? Isso restaurará o estoque de peças utilizado.')) return;
    try {
      await apiFetch(`/api/service-orders/${id}`, { method: 'DELETE' });
      showSuccess('Ordem de serviço excluída com sucesso!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir OS.');
    }
  };

  // WhatsApp and Email Integration Links Generation
  const handleSendWhatsApp = (os: ServiceOrder) => {
    const client = clients.find(c => c.id === os.clientId);
    const phone = client?.whatsapp || client?.phone.replace(/\D/g, '') || '';
    
    const message = `Olá, ${os.clientName}! Sua Ordem de Serviço #${os.osNumber} para o veículo ${os.vehicleModel} (Placa ${os.vehiclePlate}) está com o status: *${os.status}*. Valor Total: *${formatCurrency(os.total)}*. Obrigado pela preferência!`;
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = (os: ServiceOrder) => {
    const client = clients.find(c => c.id === os.clientId);
    const emailAddress = client?.email || '';
    const subject = `Ordem de Serviço #${os.osNumber} - Oficina360`;
    const body = `Olá, ${os.clientName}.\n\nSeguem os detalhes de sua Ordem de Serviço #${os.osNumber} para o veículo ${os.vehicleModel} (Placa ${os.vehiclePlate}):\nStatus Atual: ${os.status}\nValor Total: ${formatCurrency(os.total)}\n\nObrigado pela confiança!\nOficina360 ERP`;
    
    const url = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ORCAMENTO': return 'Orçamento';
      case 'APROVADO': return 'Aprovado';
      case 'EM_ANDAMENTO': return 'Em Execução';
      case 'AGUARDANDO_PECA': return 'Aguard. Peça';
      case 'PRONTO': return 'Pronto para Retirada';
      case 'CONCLUIDO': return 'Concluido / Entregue';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ORCAMENTO': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'APROVADO': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'EM_ANDAMENTO': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'AGUARDANDO_PECA': return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'PRONTO': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CONCLUIDO': return 'bg-green-50 text-green-700 border-green-100';
      case 'CANCELADO': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredOrders = orders.filter(o => 
    o.osNumber.toString().includes(searchTerm) ||
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto no-print">
      {/* Normal View Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">Ordens de Serviço</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Emissão de orçamentos, faturamento de peças, mão de obra e termo de aceite do cliente</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>Nova OS / Orçamento</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter box */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar por Número da OS, Nome do Cliente ou Placa do Veículo..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-500">Buscando Ordens de Serviço...</span>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Nº OS</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Veículo / Placa</th>
                  <th className="p-4">Data Abertura</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Financeiro</th>
                  <th className="p-4">Valor Total</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((os) => (
                  <tr key={os.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300">
                    <td className="p-4 font-black font-display text-slate-900 dark:text-white">#{os.osNumber}</td>
                    <td className="p-4 font-semibold">{os.clientName}</td>
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/10 px-1.5 py-0.5 rounded-md text-[10px] tracking-wider">{os.vehiclePlate}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{os.vehicleModel}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{formatDate(os.createdAt)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(os.status)}`}>
                        {getStatusLabel(os.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${os.paymentStatus === 'PAGO' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                        {os.paymentStatus === 'PAGO' ? 'PAGO' : 'PENDENTE'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white font-display text-sm">{formatCurrency(os.total)}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(os)}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg cursor-pointer"
                          title="Editar / Faturar OS"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => { setActiveInvoice(os); setTimeout(() => window.print(), 100); }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                          title="Imprimir OS / PDF"
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          onClick={() => handleSendWhatsApp(os)}
                          className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg cursor-pointer"
                          title="Enviar WhatsApp"
                        >
                          <Send size={14} className="rotate-45" />
                        </button>
                        <button
                          onClick={() => handleDelete(os.id)}
                          className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer"
                          title="Excluir OS"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 py-12 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 flex flex-col items-center">
          <HelpCircle size={40} className="stroke-[1.5] text-slate-400 mb-3" />
          <h4 className="font-bold text-sm text-slate-700 dark:text-white">Nenhuma Ordem de Serviço encontrada</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">Refine seus termos de busca ou inicie uma nova Ordem de Serviço.</p>
        </div>
      )}

      {/* Add / Edit OS Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold font-display text-slate-800 dark:text-white text-base sm:text-lg">
                {editingOS ? `Faturar Ordem de Serviço #${editingOS.osNumber}` : 'Abrir Nova Ordem de Serviço / Orçamento'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Cliente e Veículo */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1">
                  <User size={12} />
                  <span>1. Responsáveis & Equipamento</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Cliente Proprietário *</label>
                    <select
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Veículo Associado *</label>
                    <select
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                    >
                      {availableVehiclesForClient.length > 0 ? (
                        availableVehiclesForClient.map(v => (
                          <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
                        ))
                      ) : (
                        <option value="">Nenhum veículo cadastrado para este cliente</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Mecânico Responsável *</label>
                    <select
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      value={mechanicId}
                      onChange={(e) => setMechanicId(e.target.value)}
                    >
                      {mechanics.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Reclamação do Cliente / Diagnóstico Inicial *</label>
                  <textarea
                    required
                    placeholder="Descreva detalhadamente o problema relatado pelo cliente ou o escopo do serviço desejado..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 h-20"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Step 2: Faturamento de Peças e Serviços */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                  <ShoppingBag size={12} />
                  <span>2. Orçamento & Itens Faturados</span>
                </h4>

                {/* Sub-grid: Adding Parts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Add Parts Column */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4">
                    <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                      <ShoppingBag size={12} />
                      <span>Peças do Estoque</span>
                    </span>

                    <div className="flex gap-2">
                      <select
                        className="flex-1 px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                        value={selectedPartId}
                        onChange={(e) => setSelectedPartId(e.target.value)}
                      >
                        <option value="">-- Selecione a Peça --</option>
                        {parts.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} - Est: {p.currentStock} - ({formatCurrency(p.salePrice)})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        className="w-16 px-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center focus:outline-none text-slate-800 dark:text-white"
                        value={selectedPartQty}
                        onChange={(e) => setSelectedPartQty(Math.max(1, Number(e.target.value)))}
                      />
                      <button
                        type="button"
                        onClick={handleAddPart}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Incluir
                      </button>
                    </div>

                    {/* Added parts list */}
                    <ul className="space-y-2 max-h-36 overflow-y-auto text-xs">
                      {addedParts.map((p, i) => (
                        <li key={i} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg">
                          <span className="truncate max-w-[150px] font-medium">{p.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-400 font-semibold text-[11px]">x{p.quantity} ({formatCurrency(p.totalPrice)})</span>
                            <button type="button" onClick={() => handleRemovePart(i)} className="text-rose-500 hover:text-rose-400 cursor-pointer">
                              <X size={14} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Add Labor Column */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4">
                    <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5">
                      <Wrench size={12} />
                      <span>Mão de Obra / Serviços Mecânicos</span>
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Alinhamento, Troca de Freio..."
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                        value={tempLaborDesc}
                        onChange={(e) => setTempLaborDesc(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="R$ Preço"
                        className="w-24 px-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center focus:outline-none text-slate-800 dark:text-white"
                        value={tempLaborPrice || ''}
                        onChange={(e) => setTempLaborPrice(Number(e.target.value))}
                      />
                      <button
                        type="button"
                        onClick={handleAddLabor}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Incluir
                      </button>
                    </div>

                    {/* Added Labor list */}
                    <ul className="space-y-2 max-h-36 overflow-y-auto text-xs">
                      {addedLabor.map((l, i) => (
                        <li key={i} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg">
                          <span className="truncate max-w-[150px] font-medium">{l.description}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-400 font-semibold text-[11px]">{formatCurrency(l.totalPrice)}</span>
                            <button type="button" onClick={() => handleRemoveLabor(i)} className="text-rose-500 hover:text-rose-400 cursor-pointer">
                              <X size={14} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3: Status, Financeiro e Assinatura */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                  <DollarSign size={12} />
                  <span>3. Status, Termos & Aceite Digital</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Status da OS *</label>
                    <select
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-bold"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as OSStatus)}
                    >
                      <option value="ORCAMENTO">Orçamento</option>
                      <option value="APROVADO">Aprovado</option>
                      <option value="EM_ANDAMENTO">Em Execução</option>
                      <option value="AGUARDANDO_PECA">Aguardando Peça</option>
                      <option value="PRONTO">Pronto para Retirada</option>
                      <option value="CONCLUIDO">Concluido / Entregue</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Forma de Pagamento</label>
                    <select
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    >
                      <option value="PIX">Pix</option>
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="CREDITO">Cartão de Crédito</option>
                      <option value="DEBITO">Cartão de Débito</option>
                      <option value="BOLETO">Boleto Bancário</option>
                      <option value="FATURADO">Faturado Corporativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Status Financeiro</label>
                    <select
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-bold"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as any)}
                    >
                      <option value="PENDENTE">PENDENTE</option>
                      <option value="PAGO">PAGO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Desconto Concedido</label>
                    <input
                      type="number"
                      placeholder="Ex: 50"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      value={discount || ''}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Digital Signature Drawing Area */}
                  <div className="bg-slate-50 dark:bg-slate-800/20 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5 mb-2 w-full text-left">
                      <Edit3 size={13} />
                      <span>Assinatura Digital (Aceite Eletrônico de Termos)</span>
                    </span>

                    {/* Canvas drawing box */}
                    <div className="bg-white rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden shadow-xs w-full">
                      <canvas
                        ref={canvasRef}
                        width={350}
                        height={120}
                        className="w-full bg-white touch-none cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    </div>

                    <div className="flex gap-2 mt-3 w-full justify-end">
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Limpar Desenho
                      </button>
                      <button
                        type="button"
                        onClick={saveSignature}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Confirmar Assinatura
                      </button>
                    </div>

                    {signatureDataUrl && (
                      <div className="mt-3.5 w-full p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} className="shrink-0" />
                        <span>Assinatura digitalizada gravada!</span>
                      </div>
                    )}
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Detalhamento dos Valores</span>
                      <div className="space-y-2 mt-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Subtotal Peças:</span>
                          <span className="font-mono">{formatCurrency(partsSubtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Subtotal Serviços:</span>
                          <span className="font-mono">{formatCurrency(laborSubtotal)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-2">
                          <span className="text-slate-400">Subtotal Geral:</span>
                          <span className="font-mono">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-rose-400">
                          <span>Desconto Concedido:</span>
                          <span className="font-mono">- {formatCurrency(discount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 flex justify-between items-center mt-4">
                      <span className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Total a Pagar</span>
                      <h4 className="text-2xl font-black font-display text-blue-400">{formatCurrency(total)}</h4>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Observações Técnicas / Garantias (Opcional)</label>
                  <textarea
                    placeholder="Ex: Garantia de 90 dias nas pastilhas. Recomenda-se revisões a cada 10.000km..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                  />
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
                  {editingOS ? 'Salvar Alterações / Finalizar' : 'Registrar OS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Polish Invoice Receipt for window.print() */}
      {activeInvoice && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 text-black font-sans z-50">
          <div className="flex justify-between items-start border-b-[2px] border-black pb-4">
            <div>
              <h2 className="text-2xl font-black font-display">OFICINA360 ERP</h2>
              <p className="text-xs">São Paulo, SP | CNPJ: 12.345.678/0001-99</p>
              <p className="text-xs">Fone: (11) 98765-4321 | contato@oficina360.com.br</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold">COMPROVANTE DE SERVIÇO</h3>
              <p className="text-sm font-black mt-1">OS Nº #{activeInvoice.osNumber}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Abertura: {formatDate(activeInvoice.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 my-6 text-xs border-b pb-4">
            <div>
              <h4 className="font-bold border-b pb-1 uppercase text-[10px] mb-2">Cliente / Proprietário</h4>
              <p className="font-bold text-sm">{activeInvoice.clientName}</p>
              <p className="mt-1">Documento: {clients.find(c => c.id === activeInvoice.clientId)?.cpfCnpj || '-'}</p>
              <p>Fone: {clients.find(c => c.id === activeInvoice.clientId)?.phone || '-'}</p>
            </div>
            <div>
              <h4 className="font-bold border-b pb-1 uppercase text-[10px] mb-2">Veículo / Frota</h4>
              <p className="font-bold text-sm">{activeInvoice.vehicleModel}</p>
              <p className="mt-1">Placa: <strong className="font-mono">{activeInvoice.vehiclePlate}</strong></p>
              <p>KM: {vehicles.find(v => v.id === activeInvoice.vehicleId)?.mileage || activeInvoice.total} KM</p>
            </div>
          </div>

          {/* Description of Service */}
          <div className="my-6 p-3 bg-slate-50 border rounded-lg text-xs">
            <h5 className="font-bold uppercase text-[9px] text-slate-500 mb-1">Diagnóstico / Escopo do Serviço</h5>
            <p className="font-mono">"{activeInvoice.description}"</p>
          </div>

          {/* Parts & Services Tables */}
          <div className="space-y-6 my-6">
            {activeInvoice.parts.length > 0 && (
              <div>
                <h4 className="font-bold text-xs uppercase mb-2">Peças Utilizadas</h4>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b font-bold text-slate-500 bg-slate-50">
                      <th className="py-1">Nome da Peça</th>
                      <th className="py-1 text-center">Qtd</th>
                      <th className="py-1 text-right">Unitário</th>
                      <th className="py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activeInvoice.parts.map((p, idx) => (
                      <tr key={idx} className="py-1.5">
                        <td className="py-1.5">{p.name}</td>
                        <td className="py-1.5 text-center font-mono">{p.quantity}</td>
                        <td className="py-1.5 text-right font-mono">{formatCurrency(p.unitPrice)}</td>
                        <td className="py-1.5 text-right font-mono">{formatCurrency(p.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeInvoice.labor.length > 0 && (
              <div>
                <h4 className="font-bold text-xs uppercase mb-2">Mão de Obra & Serviços</h4>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b font-bold text-slate-500 bg-slate-50">
                      <th className="py-1">Descrição do Serviço</th>
                      <th className="py-1 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activeInvoice.labor.map((l, idx) => (
                      <tr key={idx} className="py-1.5">
                        <td className="py-1.5">{l.description}</td>
                        <td className="py-1.5 text-right font-mono">{formatCurrency(l.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Totals, Signature, Obs */}
          <div className="grid grid-cols-2 gap-8 my-8 text-xs border-t pt-6">
            <div className="space-y-4">
              {activeInvoice.observations && (
                <div>
                  <h5 className="font-bold uppercase text-[9px]">Garantias e Observações Técnicas</h5>
                  <p className="text-slate-600 italic mt-1">"{activeInvoice.observations}"</p>
                </div>
              )}
              {activeInvoice.signature && (
                <div>
                  <h5 className="font-bold uppercase text-[9px] mb-2">Assinatura do Cliente</h5>
                  <img src={activeInvoice.signature} alt="Assinatura" className="h-16 border rounded bg-white" />
                </div>
              )}
            </div>

            <div className="text-right space-y-2">
              <div className="flex justify-between max-w-xs ml-auto">
                <span className="text-slate-500">Subtotal Peças:</span>
                <span className="font-mono">{formatCurrency(activeInvoice.parts.reduce((sum, p) => sum + p.totalPrice, 0))}</span>
              </div>
              <div className="flex justify-between max-w-xs ml-auto">
                <span className="text-slate-500">Subtotal Serviços:</span>
                <span className="font-mono">{formatCurrency(activeInvoice.labor.reduce((sum, l) => sum + l.totalPrice, 0))}</span>
              </div>
              <div className="flex justify-between max-w-xs ml-auto text-rose-500">
                <span>Desconto:</span>
                <span className="font-mono">- {formatCurrency(activeInvoice.discount)}</span>
              </div>
              <div className="flex justify-between max-w-xs ml-auto font-bold border-t pt-2 text-sm">
                <span>Valor Final Pago:</span>
                <span className="font-mono text-base">{formatCurrency(activeInvoice.total)}</span>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-slate-500 uppercase">Status Financeiro: <strong>{activeInvoice.paymentStatus}</strong></p>
                <p className="text-[10px] text-slate-500 uppercase">Responsável: <strong>{activeInvoice.mechanicName}</strong></p>
              </div>
            </div>
          </div>

          {/* Termos de Aceite */}
          <div className="text-[9px] text-slate-400 text-center border-t pt-4 mt-8">
            Comprovante gerado eletronicamente em conformidade aos termos de aceite digital em {new Date().toLocaleString()}.
          </div>
        </div>
      )}
    </div>
  );
}
