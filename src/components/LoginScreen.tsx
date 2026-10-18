'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Users
} from 'lucide-react';
import { SystemUser } from '@/lib/types';
import { ThemeToggle } from './ThemeToggle';

interface LoginScreenProps {
  users: SystemUser[];
  onLogin: (user: SystemUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeUsers = users.filter(u => u.active !== false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Por favor, informe seu e-mail corporativo.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const foundUser = activeUsers.find(
        u => u.email.toLowerCase() === normalizedEmail
      );

      if (!foundUser) {
        // If not found by exact email, check if typed just name or part
        const foundByName = activeUsers.find(
          u => u.name.toLowerCase().includes(normalizedEmail)
        );

        if (foundByName) {
          onLogin(foundByName);
          setIsLoading(false);
          return;
        }

        setError('Credenciais não localizadas no IAM. Verifique seu e-mail ou utilize o Acesso Rápido abaixo.');
        setIsLoading(false);
        return;
      }

      onLogin(foundUser);
      setIsLoading(false);
    }, 400);
  };

  const handleQuickLogin = (user: SystemUser) => {
    setEmail(user.email);
    setPassword('••••••••');
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      onLogin(user);
      setIsLoading(false);
    }, 300);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-900 text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 border border-blue-400/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-wider text-white">
                RGR
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold uppercase tracking-wider">
                Governança Operacional
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Gerenciamento da Rotina & Mesa de Despacho (Boardroom)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ambiente Seguro • TLS 1.3</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md">
          
          {/* Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 p-6 sm:p-8 backdrop-blur-xl relative">
            
            {/* Top Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 mb-3 shadow-inner">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Acesso à Plataforma
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Informe suas credenciais corporativas para entrar na sua rotina
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.nome@empresa.com.br"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Senha de Acesso
                  </label>
                  <span className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                    Esqueceu a senha?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/40"
                  />
                  <span>Lembrar neste navegador</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99] mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Quick Login / RBAC Profiles Selector */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-blue-400" />
                  Acesso Rápido por Perfil (1 Clique):
                </span>
                <span className="text-[9px] font-mono text-slate-500">IAM / RBAC</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeUsers.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-blue-500/40 text-left transition-all group"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm ${u.avatarColor || 'bg-blue-600 text-white'}`}>
                      {getInitials(u.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-blue-300 truncate block">
                          {u.name.split(' ')[0]}
                        </span>
                        <span className={`text-[8px] font-mono px-1 py-0.2 rounded ${
                          u.roleType === 'admin'
                            ? 'bg-blue-500/20 text-blue-300'
                            : u.roleType === 'manager'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {u.roleType === 'admin' ? 'CEO' : u.roleType === 'manager' ? 'Gestor' : 'Op'}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 truncate block leading-tight">
                        {u.jobTitle}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Security & Audit Footer */}
          <div className="text-center mt-5 space-y-1">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Sessões auditadas e registradas com chave SHA-256
            </p>
            <p className="text-[10px] text-slate-600 font-mono">
              RGR Rotina & Governança • v2.4 Enterprise
            </p>
          </div>

        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-slate-800/60 text-center text-xs text-slate-500 bg-slate-900/60 backdrop-blur-md">
        <span>&copy; {new Date().getFullYear()} RGR Governança Corporativa. Todos os direitos reservados.</span>
      </footer>

    </div>
  );
};
