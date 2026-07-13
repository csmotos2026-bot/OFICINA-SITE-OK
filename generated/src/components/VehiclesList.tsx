import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Car, Calendar, 
  Settings, Key, AlertCircle, X, Check, Eye, HelpCircle, RefreshCcw
} from 'lucide-react';
import { Vehicle, Client } from '../types';
import { apiFetch, maskPlate } from '../utils';

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [chassis, setChassis] = useState('');
  const [renavam, setRenavam] = useState('');
  const [mileage, setMileage] = useState('');
  const [observations, setObservations] = useState('');
  const [clientId, setClientId] = useState('');

  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const vehiclesData = await apiFetch('/api/vehicles');
      const clientsData = await apiFetch('/api/clients');
      setVehicles(vehiclesData);
      setClients(clientsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setPlate('');
    setBrand('');
    setModel('');
    setYear(new Date().getFullYear().toString());
    setColor('');
    setChassis('');
    setRenavam('');
    setMileage('0');
    setObservations('');
    setClientId(clients[0]?.id || '');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setPlate(vehicle.plate);
    setBrand(vehicle.brand);
    setModel(vehicle.model);
    setYear(vehicle.year.toString());
    setColor(vehicle.color);
    setChassis(vehicle.chassis || '');
    setRenavam(vehicle.renavam || '');
    setMileage(vehicle.mileage.toString());
    setObservations(vehicle.observations || '');
    setClientId(vehicle.clientId);
    setError('');
    setModalOpen(true);
  };

  // Real Integration Simulation: Consultar Placa
  const handlePlateLookup = async () => {
    const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleanPlate.length < 7) {
      setError('Insira uma placa com pelo menos 7 caracteres para consultar.');
      return;
    }

    setLookupLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/api/vehicles/plate-lookup/${cleanPlate}`);
      
      setBrand(data.brand);
      setModel(data.model);
      setColor(data.color);
      setYear(data.year.toString());
      setChassis(data.chassis);
      setRenavam(data.renavam);
      setSuccessMsg(`Placa ${cleanPlate} consultada com sucesso via API de Trânsito!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Erro ao consultar placa.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !brand || !model || !clientId) {
      setError('Por favor, preencha os campos obrigatórios (Placa, Marca, Modelo e Proprietário).');
      return;
    }

    const payload = {
      plate: plate.toUpperCase(),
      brand,
      model,
      year: Number(year),
      color,
      chassis,
      renavam,
      mileage: Number(mileage),
      observations,
      clientId
    };

    try {
      if (editingVehicle) {
        await apiFetch(`/api/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showSuccess('Veículo atualizado com sucesso!');
      } else {
        await apiFetch('/api/vehicles', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showSuccess('Veículo cadastrado e vinculado ao proprietário!');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar veículo.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este veículo?')) return;
    try {
      await apiFetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      showSuccess('Veículo removido com sucesso!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Não foi possível excluir o veículo.');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const getOwnerName = (cid: string) => {
    const client = clients.find(c => c.id === cid);
    return client ? client.name : 'Não localizado';
  };

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">Gerenciamento de Veículos</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Controle da frota, vínculos com clientes e consulta de placas em tempo real</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>Cadastrar Veículo</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar veículos por Placa, Marca ou Modelo..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-500">Carregando veículos...</span>
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between overflow-hidden group">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-md font-mono mb-2 tracking-wider">
                      {vehicle.plate}
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 shrink-0">
                    <Car size={16} />
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Proprietário:</span>
                    <span className="font-semibold text-slate-700 dark:text-white truncate max-w-[150px]" title={getOwnerName(vehicle.clientId)}>
                      {getOwnerName(vehicle.clientId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ano:</span>
                    <span className="font-mono">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cor:</span>
                    <span>{vehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quilometragem:</span>
                    <span className="font-mono font-semibold">{vehicle.mileage.toLocaleString()} KM</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-1">
                <button
                  onClick={() => openEditModal(vehicle)}
                  className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all cursor-pointer"
                  title="Editar Veículo"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg transition-all cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 py-12 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 flex flex-col items-center">
          <HelpCircle size={40} className="stroke-[1.5] text-slate-400 mb-3" />
          <h4 className="font-bold text-sm text-slate-700 dark:text-white">Nenhum veículo localizado</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">Refine a busca por placa ou marca no painel de filtros.</p>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold font-display text-slate-800 dark:text-white text-base sm:text-lg">
                {editingVehicle ? 'Editar Dados do Veículo' : 'Cadastrar Veículo na Frota'}
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
                {/* Placa with quick simulated API lookup button */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Placa do Veículo *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ex: ABC1D23"
                      maxLength={7}
                      className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono font-bold tracking-widest uppercase"
                      value={plate}
                      onChange={(e) => setPlate(maskPlate(e.target.value))}
                    />
                    {!editingVehicle && (
                      <button
                        type="button"
                        onClick={handlePlateLookup}
                        disabled={lookupLoading}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer border border-blue-200 dark:border-blue-900/35"
                      >
                        {lookupLoading ? <RefreshCcw size={12} className="animate-spin" /> : <Search size={12} />}
                        <span>API Consultar</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Proprietário (Cliente) *</label>
                  <select
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Marca / Fabricante *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chevrolet, Volkswagen..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Modelo do Veículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Onix Hatch LTZ"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Ano Fabricação / Modelo</label>
                  <input
                    type="number"
                    placeholder="Ex: 2021"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Cor Predominante</label>
                  <input
                    type="text"
                    placeholder="Ex: Branco, Preto..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Chassi (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Número do chassi"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono uppercase"
                    value={chassis}
                    onChange={(e) => setChassis(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Renavam (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Código Renavam"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    value={renavam}
                    onChange={(e) => setRenavam(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Quilometragem Atual (KM) *</label>
                  <input
                    type="number"
                    required
                    placeholder="KM"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Observações Adicionais</label>
                  <textarea
                    placeholder="Ex: Veículo com batidas leves, observações mecânicas específicas..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 h-20"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
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
                  {editingVehicle ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
