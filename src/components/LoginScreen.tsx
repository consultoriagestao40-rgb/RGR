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
  AlertCircle
} from 'lucide-react';
import { SystemUser } from '@/lib/types';
import { ThemeToggle } from './ThemeToggle';
import { RgrLogo } from './RgrLogo';

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
      const targetUser = activeUsers.find(
        u => u.email.toLowerCase() === normalizedEmail
      ) || activeUsers.find(
        u => u.name.toLowerCase().includes(normalizedEmail)
      );

      if (!targetUser) {
        setError('Credenciais corporativas inválidas. Usuário não localizado.');
        setIsLoading(false);
        return;
      }

      const expectedPassword = targetUser.password || '123456';
      if (password !== expectedPassword) {
        setError(
          targetUser.mustChangePassword !== false
            ? 'Senha incorreta. Para o primeiro acesso, utilize a senha padrão inicial: 123456'
            : 'Senha incorreta. Verifique a senha informada ou solicite a redefinição ao administrador.'
        );
        setIsLoading(false);
        return;
      }

      onLogin(targetUser);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#080d17] text-slate-900 dark:text-slate-100 selection:bg-atlas-600 selection:text-white relative overflow-hidden font-sans transition-colors duration-200">
      
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-atlas-100/60 via-slate-50 to-slate-100 dark:from-atlas-950/40 dark:via-[#090d16] dark:to-[#05080f] pointer-events-none transition-colors duration-200" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-atlas-500/10 dark:bg-atlas-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md bg-white/70 dark:bg-[#0b101b]/70 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <RgrLogo variant="horizontal" size="md" showSubtitle={true} />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <ShieldCheck className="w-4 h-4 text-atlas-600 dark:text-atlas-400" />
            <span>Ambiente Seguro • TLS 1.3</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md">
          
          {/* Card */}
          <div className="bg-white dark:bg-[#0f1726]/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl shadow-slate-200/60 dark:shadow-black/60 p-6 sm:p-8 backdrop-blur-xl relative transition-colors duration-200">
            
            {/* Top Badge */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <RgrLogo variant="icon" size="lg" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Acesso à Plataforma
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Informe suas credenciais corporativas para entrar na sua rotina
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.nome@empresa.com.br"
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Senha de Acesso
                  </label>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer transition-colors">
                    Esqueceu a senha?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 focus:ring-blue-500/40"
                  />
                  <span>Lembrar neste navegador</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-atlas-600 hover:bg-atlas-700 active:bg-atlas-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-atlas-600/20 border border-atlas-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99] mt-2 cursor-pointer"
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

          </div>

          {/* Security & Audit Footer */}
          <div className="text-center mt-5 space-y-1">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Sessões auditadas e registradas com chave SHA-256
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
              RGR Rotina & Governança • v2.4 Enterprise
            </p>
          </div>

        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-slate-200 dark:border-slate-800/60 text-center text-xs text-slate-500 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md transition-colors duration-200">
        <span>&copy; {new Date().getFullYear()} RGR Governança Corporativa. Todos os direitos reservados.</span>
      </footer>

    </div>
  );
};
