import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Mail, Phone, MapPin, 
  UserPlus, FileText, Check, AlertCircle, X, ChevronRight, HelpCircle
} from 'lucide-react';
import { Client } from '../types';
import { 
  apiFetch, formatCurrency, formatDateOnly, 
  maskCpfCnpj, maskPhone, maskCep 
} from '../utils';

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  
  // Address state
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/clients');
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingClient(null);
    setName('');
    setCpfCnpj('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setZipCode('');
    setStreet('');
    setNumber('');
    setComplement('');
    setNeighborhood('');
    setCity('');
    setState('');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCpfCnpj(client.cpfCnpj);
    setPhone(client.phone);
    setWhatsapp(client.whatsapp);
    setEmail(client.email);
    setZipCode(client.address.zipCode);
    setStreet(client.address.street);
    setNumber(client.address.number);
    setComplement(client.address.complement || '');
    setNeighborhood(client.address.neighborhood);
    setCity(client.address.city);
    setState(client.address.state);
    setError('');
    setModalOpen(true);
  };

  // Real Integration: ViaCEP Consultation
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawCep = e.target.value;
    const formatted = maskCep(rawCep);
    setZipCode(formatted);

    const cleanCep = formatted.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (response.ok) {
          const addressData = await response.json();
          if (!addressData.erro) {
            setStreet(addressData.logradouro || '');
            setNeighborhood(addressData.bairro || '');
            setCity(addressData.localidade || '');
            setState(addressData.uf || '');
            setError('');
          } else {
            setError('CEP não localizado.');
          }
        }
      } catch (err) {
        console.error('Erro de consulta ViaCEP:', err);
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cpfCnpj || !phone) {
      setError('Por favor, preencha os campos obrigatórios (Nome, CPF/CNPJ e Telefone).');
      return;
    }

    const payload = {
      name,
      cpfCnpj,
      phone,
      whatsapp: whatsapp || phone.replace(/\D/g, ''),
      email,
      address: {
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zipCode
      }
    };

    try {
      if (editingClient) {
        await apiFetch(`/api/clients/${editingClient.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showSuccess('Cliente atualizado com sucesso!');
      } else {
        await apiFetch('/api/clients', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showSuccess('Cliente cadastrado com sucesso!');
      }
      setModalOpen(false);
      loadClients();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar cliente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await apiFetch(`/api/clients/${id}`, { method: 'DELETE' });
      showSuccess('Cliente removido!');
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Não foi possível excluir o cliente.');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpfCnpj.includes(searchTerm) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">Gerenciamento de Clientes</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Cadastro, histórico, contatos e endereçamento ViaCEP</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 fade-in">
          <Check size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar por nome, CPF/CNPJ, telefone ou e-mail..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-700 dark:text-white placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-500 font-medium">Buscando clientes...</span>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {client.name}
                    </h3>
                    <p className="text-[11px] font-mono font-medium text-slate-400 mt-1">Doc: {client.cpfCnpj}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    Cliente
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate line-clamp-2">
                      {client.address.street}, {client.address.number} - {client.address.neighborhood}, {client.address.city}/{client.address.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400">Cadastrado em {formatDateOnly(client.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(client)}
                    className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all cursor-pointer"
                    title="Editar Cliente"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg transition-all cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 py-12 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 flex flex-col items-center">
          <HelpCircle size={40} className="stroke-[1.5] text-slate-400 mb-3 animate-pulse" />
          <h4 className="font-bold text-sm text-slate-700 dark:text-white">Nenhum cliente localizado</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">Refine o filtro ou cadastre um novo cliente no botão superior.</p>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold font-display text-slate-800 dark:text-white text-base sm:text-lg">
                {editingClient ? 'Atualizar Cadastro do Cliente' : 'Cadastrar Novo Cliente'}
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

              {/* Section 1: Dados Pessoais */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">1. Informações Básicas</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Nome Completo / Razão Social *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo de Souza"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">CPF ou CNPJ *</label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      value={cpfCnpj}
                      onChange={(e) => setCpfCnpj(maskCpfCnpj(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Telefone de Contato *</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      value={phone}
                      onChange={(e) => setPhone(maskPhone(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">WhatsApp (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Número com DDD"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">E-mail</label>
                    <input
                      type="email"
                      placeholder="carlos@exemplo.com"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Endereço com busca ViaCEP integrada */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">2. Endereço (Busca ViaCEP)</h4>
                  {cepLoading && <span className="text-[10px] text-blue-500 font-bold animate-pulse">Consultando CEP...</span>}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">CEP</label>
                    <input
                      type="text"
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                      value={zipCode}
                      onChange={handleCepChange}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Logradouro / Rua</label>
                    <input
                      type="text"
                      placeholder="Av. Paulista, Rua Flores..."
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Número</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Complemento</label>
                    <input
                      type="text"
                      placeholder="Apto, Bloco, Sala..."
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Bairro</label>
                    <input
                      type="text"
                      placeholder="Ex: Centro"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Cidade</label>
                    <input
                      type="text"
                      placeholder="Ex: São Paulo"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">UF / Estado</label>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="SP"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  {editingClient ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
