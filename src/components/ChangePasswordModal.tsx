'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Check, 
  X,
  ShieldAlert
} from 'lucide-react';
import { SystemUser } from '@/lib/types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: SystemUser;
  isFirstAccess?: boolean;
  onSuccess: (updatedUser: SystemUser) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isFirstAccess = false,
  onSuccess
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If voluntary change, check current password
    if (!isFirstAccess) {
      const expectedPassword = currentUser.password || '123456';
      if (!currentPassword) {
        setError('Por favor, informe sua senha atual.');
        return;
      }
      if (currentPassword !== expectedPassword) {
        setError('A senha atual informada está incorreta.');
        return;
      }
    }

    // Validate new password length
    if (!newPassword || newPassword.length < 6) {
      setError('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    // Do not allow default temporary password
    if (newPassword === '123456') {
      setError('Por razões de segurança, a nova senha não pode ser "123456". Crie uma senha pessoal.');
      return;
    }

    // Validate confirmation
    if (newPassword !== confirmPassword) {
      setError('A confirmação não coincide com a nova senha digitada.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          password: newPassword,
          mustChangePassword: false
        })
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar a senha no servidor.');
      }

      const updatedUserData = await res.json();
      
      const mergedUser: SystemUser = {
        ...currentUser,
        password: newPassword,
        mustChangePassword: false,
        ...(typeof updatedUserData === 'object' && updatedUserData !== null ? updatedUserData : {})
      };

      // Update localStorage session
      try {
        localStorage.setItem('rgr_session_user', JSON.stringify(mergedUser));
      } catch (e) {
        console.error('Error saving updated session:', e);
      }

      onSuccess(mergedUser);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err?.message || 'Erro ao salvar nova senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={isFirstAccess ? undefined : onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-2xl shadow-2xl p-6 text-slate-900 dark:text-slate-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500" />

        {/* Top Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isFirstAccess 
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' 
                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
            }`}>
              {isFirstAccess ? <ShieldAlert className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isFirstAccess ? 'Definição de Nova Senha' : 'Alterar Minha Senha'}
                </h3>
                {isFirstAccess && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Obrigatório
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isFirstAccess 
                  ? 'Primeiro acesso detectado. Crie sua senha corporativa pessoal.' 
                  : 'Atualize suas credenciais de acesso à plataforma.'}
              </p>
            </div>
          </div>

          {!isFirstAccess && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notice for First Access */}
        {isFirstAccess && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Olá <strong className="font-semibold text-slate-900 dark:text-white">{currentUser.name}</strong>, para prosseguir com a governança da sua cadeira, é obrigatório substituir a senha temporária inicial por uma nova senha de sua escolha.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Voluntary Change: Current Password */}
          {!isFirstAccess && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Senha Atual
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700/80 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Password Validation Requirements */}
          <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
              <span>Mínimo de 6 caracteres</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${newPassword && newPassword !== '123456' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
              <span>Diferente da senha padrão (123456)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
              <span>Confirmação idêntica</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2">
            {!isFirstAccess && onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm shadow-blue-600/20 border border-blue-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isFirstAccess ? 'Salvar Nova Senha & Acessar' : 'Salvar Alteração'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
