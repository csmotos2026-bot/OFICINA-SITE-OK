import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Mail, Lock, User, RefreshCw, Car } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha na autenticação');
      }

      localStorage.setItem('oficina_erp_token', data.token);
      localStorage.setItem('oficina_erp_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: 'admin' | 'gerente' | 'atendente' | 'mecanico') => {
    const creds = {
      admin: { email: 'admin@oficina.com', pass: 'admin123' },
      gerente: { email: 'gerente@oficina.com', pass: 'gerente123' },
      atendente: { email: 'atendente@oficina.com', pass: 'atendente123' },
      mecanico: { email: 'pedro.mecanico@oficina.com', pass: 'mecanico123' }
    };
    setEmail(creds[role].email);
    setPassword(creds[role].pass);
    setError('');
  };

  return (
    <div id="login_container" className="flex min-h-screen bg-slate-900 font-sans">
      {/* Left decorative panel (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-radial from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Car size={26} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white tracking-wider">CSMOTOS</h1>
            <p className="text-[10px] text-blue-400 font-mono tracking-widest font-bold">ERP PREMIUM</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="my-auto z-10 max-w-md">
          <h2 className="text-4xl font-extrabold font-display text-white leading-tight mb-4">
            Gestão inteligente de <span className="text-blue-500">alta performance</span> para sua oficina.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Plataforma robusta para emissão de ordens de serviço, controle financeiro completo, inventário inteligente e CRM de clientes em tempo real.
          </p>
        </div>

        {/* Footer */}
        <div className="z-10 text-slate-500 text-xs font-mono">
          © 2026 CSMOTOS ERP. Versão v4.2.1 Pro
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 md:px-20 bg-slate-900 text-white relative">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Car size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display tracking-wider">CSMOTOS</h1>
              <p className="text-[9px] text-blue-400 font-mono tracking-widest font-bold">ERP</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold font-display tracking-tight text-white mb-2">Seja bem-vindo</h3>
            <p className="text-slate-400 text-sm">Insira suas credenciais para gerenciar a oficina</p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs mb-6 fade-in flex items-center gap-2">
              <ShieldCheck className="shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="login_email">
                E-mail Corporativo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  id="login_email"
                  type="email"
                  required
                  placeholder="exemplo@oficina.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-300 text-xs font-semibold" htmlFor="login_password">
                  Senha de Acesso
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Por favor, solicite a alteração de senha junto ao Administrador do ERP.'); }} className="text-[11px] text-blue-400 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  id="login_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              id="login_submit_btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700/50 rounded-xl font-medium text-sm transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin text-white" />
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Entrar no Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Quick login roles */}
          <div className="mt-8 pt-8 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck size={14} className="text-blue-500" />
              Acesso Demonstrativo Rápido
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="p-2.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 rounded-xl text-left text-xs transition-all hover:border-slate-600 flex flex-col gap-0.5 cursor-pointer"
                onClick={() => fillCredentials('admin')}
              >
                <span className="font-bold text-blue-400">Administrador</span>
                <span className="text-[10px] text-slate-500">Acesso Total</span>
              </button>
              <button
                type="button"
                className="p-2.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 rounded-xl text-left text-xs transition-all hover:border-slate-600 flex flex-col gap-0.5 cursor-pointer"
                onClick={() => fillCredentials('gerente')}
              >
                <span className="font-bold text-amber-400">Gerente</span>
                <span className="text-[10px] text-slate-500">Estoque & Financeiro</span>
              </button>
              <button
                type="button"
                className="p-2.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 rounded-xl text-left text-xs transition-all hover:border-slate-600 flex flex-col gap-0.5 cursor-pointer"
                onClick={() => fillCredentials('atendente')}
              >
                <span className="font-bold text-emerald-400">Atendente</span>
                <span className="text-[10px] text-slate-500">Cadastros & OS</span>
              </button>
              <button
                type="button"
                className="p-2.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 rounded-xl text-left text-xs transition-all hover:border-slate-600 flex flex-col gap-0.5 cursor-pointer"
                onClick={() => fillCredentials('mecanico')}
              >
                <span className="font-bold text-indigo-400">Mecânico</span>
                <span className="text-[10px] text-slate-500">Execução & Diagnósticos</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
