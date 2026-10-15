'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Building2, 
  BookOpen, 
  Sliders, 
  Shield, 
  FileCheck2,
  Plus,
  Users,
  Lock,
  ChevronDown,
  Check,
  Key,
  ShieldCheck,
  UserCheck,
  Pencil,
  Briefcase
} from 'lucide-react';
import { OperationalRole, SystemUser } from '@/lib/types';

interface SidebarProps {
  activeTab: 'timeline' | 'dispatch' | 'playbook' | 'minutes' | 'admin' | 'users';
  onSelectTab: (tab: 'timeline' | 'dispatch' | 'playbook' | 'minutes' | 'admin' | 'users') => void;
  roles: OperationalRole[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  onOpenCreateRoleModal: () => void;
  onOpenEditRoleModal?: () => void;
  onSelectAdminSection?: (section: 'blocks' | 'rituals' | 'roles' | 'users') => void;
  completedCount: number;
  totalCount: number;
  currentUser?: SystemUser;
  users?: SystemUser[];
  onSelectUser?: (user: SystemUser) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  roles,
  selectedRoleId,
  onSelectRole,
  onOpenCreateRoleModal,
  onOpenEditRoleModal,
  onSelectAdminSection,
  completedCount,
  totalCount,
  currentUser,
  users = [],
  onSelectUser
}) => {
  const currentRole = roles.find(r => r.id === selectedRoleId) || roles[0];
  const complianceRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getChairName = (roleId: string) => {
    if (roleId === '*') return 'Todas as Cadeiras';
    const found = roles.find(r => r.id === roleId);
    return found ? `${found.code || 'CAD'}: ${found.title}` : roleId;
  };

  const isOperator = currentUser?.roleType === 'operator';
  const isAdmin = !currentUser || currentUser.roleType === 'admin';

  // Filter roles accessible to this user
  const allowedRoles = React.useMemo(() => {
    if (!currentUser || currentUser.roleType === 'admin' || currentUser.allowedRoleIds.includes('*')) {
      return roles;
    }
    const filtered = roles.filter(r => currentUser.allowedRoleIds.includes(r.id));
    return filtered.length > 0 ? filtered : [currentRole];
  }, [roles, currentUser, currentRole]);

  const handleSelectChange = (value: string) => {
    onSelectRole(value);
  };

  return (
    <aside className="w-72 bg-slate-50 dark:bg-[#0c121e] border-r border-slate-200 dark:border-[#1a2333] flex flex-col shrink-0 select-none transition-colors">
      
      {/* Top Brand: RGR - Gerenciamento da Rotina */}
      <div className="p-5 border-b border-slate-200 dark:border-[#1a2333]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded bg-blue-600 dark:bg-[#1e2d42] border border-blue-500 dark:border-[#2c3e59] flex items-center justify-center text-white dark:text-slate-100 font-black text-sm tracking-wider shadow-sm">
            RGR
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                RGR <span className="text-blue-600 dark:text-[#3b82f6] font-semibold">Rotina</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#1a2638] text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-[#263750]">
                Operacional
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[170px]">
              Gerenciamento da Rotina do Dia a Dia
            </p>
          </div>
        </div>
      </div>

      {/* Cadeira Ativa com Limitação de Acesso por Usuário */}
      <div className="p-4 border-b border-slate-200 dark:border-[#1a2333] bg-white/70 dark:bg-[#0f1726]/60">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Cadeira em Sessão
            </span>
            {isOperator && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Lock className="w-2.5 h-2.5" /> Titular
              </span>
            )}
          </div>

          {/* Action button visible to Admins/Directors */}
          {isAdmin && (
            <button
              onClick={onOpenCreateRoleModal}
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-[#18263d] text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-[#20324f] border border-blue-200 dark:border-[#29426b] transition-colors flex items-center gap-1"
              title="Cadastrar nova cadeira operacional"
            >
              <Plus className="w-3 h-3" />
              <span>Nova</span>
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={selectedRoleId}
            onChange={(e) => handleSelectChange(e.target.value)}
            disabled={isOperator && allowedRoles.length <= 1}
            className={`w-full bg-slate-100 dark:bg-[#141d2e] hover:bg-slate-200 dark:hover:bg-[#182338] border border-slate-300 dark:border-[#223048] rounded-md px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none pr-8 ${
              isOperator && allowedRoles.length <= 1 ? 'opacity-85 cursor-not-allowed' : ''
            }`}
          >
            {allowedRoles.map(r => (
              <option key={r.id} value={r.id} className="text-slate-900 dark:text-white dark:bg-slate-900">
                {r.title} ({r.code || 'CAD'})
              </option>
            ))}
          </select>
          {!(isOperator && allowedRoles.length <= 1) && (
            <div className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 dark:text-slate-400 text-xs">
              ▾
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
          {currentRole?.department}
        </p>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* Group 1: Rotina & Ritos */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Cadência & Despacho
          </span>
          <div className="space-y-0.5">
            
            <button
              onClick={() => onSelectTab('timeline')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'timeline'
                  ? 'bg-white dark:bg-[#18263d] text-blue-700 dark:text-white font-semibold shadow-sm border border-slate-300 dark:border-[#243959]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#131c2d]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className={`w-4 h-4 ${activeTab === 'timeline' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>Meu Dia (Timeline)</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('dispatch')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'dispatch'
                  ? 'bg-white dark:bg-[#18263d] text-blue-700 dark:text-white font-semibold shadow-sm border border-slate-300 dark:border-[#243959]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#131c2d]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className={`w-4 h-4 ${activeTab === 'dispatch' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>Mesa de Despacho (CEO)</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

          </div>
        </div>

        {/* Group 2: Governança & Conhecimento */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Governança & Padrões
          </span>
          <div className="space-y-0.5">
            
            <button
              onClick={() => onSelectTab('playbook')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'playbook'
                  ? 'bg-white dark:bg-[#18263d] text-blue-700 dark:text-white font-semibold shadow-sm border border-slate-300 dark:border-[#243959]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#131c2d]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className={`w-4 h-4 ${activeTab === 'playbook' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>Playbook & POPs</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">SOP</span>
            </button>

            <button
              onClick={() => onSelectTab('minutes')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'minutes'
                  ? 'bg-white dark:bg-[#18263d] text-blue-700 dark:text-white font-semibold shadow-sm border border-slate-300 dark:border-[#243959]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#131c2d]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className={`w-4 h-4 ${activeTab === 'minutes' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>Livro de Atas</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Oficial</span>
            </button>

          </div>
        </div>

        {/* Group 3: Administração (Somente Diretoria e Gestão) */}
        {!isOperator && (
          <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Administração & IAM
            </span>
            <div className="space-y-0.5">
              
              <button
                onClick={() => {
                  if (onSelectAdminSection) onSelectAdminSection('roles');
                  onSelectTab('admin');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#131c2d]"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>Cadeiras & Governança</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {roles.length}
                </span>
              </button>

              <button
                onClick={() => {
                  if (onSelectAdminSection) onSelectAdminSection('blocks');
                  onSelectTab('admin');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white dark:bg-[#18263d] text-blue-700 dark:text-white font-semibold shadow-sm border border-slate-300 dark:border-[#243959]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#131c2d]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className={`w-4 h-4 ${activeTab === 'admin' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>Matriz de POPs & Ritos</span>
                </div>
              </button>

              <button
                onClick={() => onSelectTab('users')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'users'
                    ? 'bg-white dark:bg-[#18263d] text-blue-700 dark:text-white font-semibold shadow-sm border border-slate-300 dark:border-[#243959]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#131c2d]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 ${activeTab === 'users' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>Usuários & Acessos (IAM)</span>
                </div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold font-mono">
                  RBAC
                </span>
              </button>

            </div>
          </div>
        )}

      </div>

      {/* Bottom Compliance Gauge */}
      <div className="p-4 border-t border-slate-200 dark:border-[#1a2333] bg-slate-100/80 dark:bg-[#0c121e]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Compliance do Dia</span>
          <span className={`font-mono font-bold ${complianceRate === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {complianceRate}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-[#182333] h-1.5 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              complianceRate === 100 ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
            style={{ width: `${complianceRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{completedCount} de {totalCount} entregues</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <Shield className="w-3 h-3" /> Auditado
          </span>
        </div>
      </div>

      {/* Bottom User Profile & Switcher (Menu Lateral Esquerdo Inferior) */}
      {currentUser && (
        <div className="p-3 border-t border-slate-200 dark:border-[#1a2333] bg-white/80 dark:bg-[#0a0f1a] relative" ref={userMenuRef}>
          
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#151f30] transition-colors text-left border border-slate-200 dark:border-[#1e2a3f] group shadow-sm"
            title="Alternar perfil de acesso"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${currentUser.avatarColor || 'bg-blue-600 text-white'}`}>
                {getInitials(currentUser.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white truncate block">
                    {currentUser.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1 rounded border ${
                    currentUser.roleType === 'admin' 
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : currentUser.roleType === 'manager'
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {currentUser.roleType === 'admin' ? 'Diretoria' : currentUser.roleType === 'manager' ? 'Gestor' : 'Operador'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
                    {currentUser.jobTitle}
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0 ml-1 transition-transform" />
          </button>

          {/* Upward Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full mb-2 left-3 right-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-xl shadow-2xl z-50 overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="p-3 bg-slate-50 dark:bg-[#0c121e] border-b border-slate-200 dark:border-[#1a2333]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                    <Key className="w-3 h-3 text-blue-500" />
                    Sessão Ativa
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${currentUser.avatarColor || 'bg-blue-600 text-white'}`}>
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block font-mono">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-[#1c273a]">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">
                    Cadeiras Autorizadas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentUser.allowedRoleIds.includes('*') ? (
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Acesso Total (*)
                      </span>
                    ) : (
                      currentUser.allowedRoleIds.map(rId => (
                        <span key={rId} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#1a2333] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#24334d]">
                          {getChairName(rId)}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* List to Switch */}
              <div className="p-1.5 max-h-56 overflow-y-auto space-y-1">
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Simular Acesso Como:
                </span>
                {users.map(u => {
                  const isActive = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        if (onSelectUser) onSelectUser(u);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition-colors ${
                        isActive 
                          ? 'bg-blue-50 dark:bg-[#18263d] text-blue-900 dark:text-white font-medium border border-blue-200 dark:border-[#273a5a]'
                          : 'hover:bg-slate-100 dark:hover:bg-[#151f30] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${u.avatarColor || 'bg-slate-500 text-white'}`}>
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold block truncate text-[11px] leading-tight">
                            {u.name}
                          </span>
                          <span className="text-[9px] text-slate-400 block truncate">
                            {u.jobTitle}
                          </span>
                        </div>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {/* IAM Management button */}
              {!isOperator && (
                <div className="p-1.5 bg-slate-50 dark:bg-[#0a0f1a] border-t border-slate-200 dark:border-[#1a2333]">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSelectTab('users');
                    }}
                    className="w-full text-center py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Gerenciar Usuários & Cadeiras (IAM)</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </aside>
  );
};
