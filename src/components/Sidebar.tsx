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
  Briefcase,
  LogOut,
  KeyRound,
  ChevronLeft,
  ChevronRight
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
  onSelectAdminSection?: (section: 'blocks' | 'rituals' | 'roles') => void;
  completedCount: number;
  totalCount: number;
  currentUser?: SystemUser | null;
  onLogout?: () => void;
  onOpenChangePassword?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isWeekend?: boolean;
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
  onLogout,
  onOpenChangePassword,
  isCollapsed: propIsCollapsed,
  onToggleCollapse,
  isWeekend = false
}) => {
  const currentRole = roles.find(r => r.id === selectedRoleId) || roles[0];
  const complianceRate = isWeekend ? 100 : (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);
  
  // Collapse state with persistence in localStorage
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rgr_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(prev => {
        const next = !prev;
        try {
          localStorage.setItem('rgr_sidebar_collapsed', String(next));
        } catch (e) {}
        return next;
      });
    }
  };

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
    <aside className={`${isCollapsed ? 'w-16' : 'w-72'} bg-slate-50 dark:bg-[#0c121e] border-r border-slate-200 dark:border-[#1a2333] flex flex-col shrink-0 select-none transition-all duration-300 ease-in-out relative`}>
      
      {/* Setinha discreta na linha de divisa entre menu e tela */}
      <button
        type="button"
        onClick={handleToggleCollapse}
        className="absolute -right-3 top-5 z-40 w-6 h-6 rounded-full bg-white dark:bg-[#162235] border border-slate-300 dark:border-[#2a3c5a] text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 shadow-sm hover:shadow flex items-center justify-center transition-all cursor-pointer hover:scale-110"
        title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
        aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Top Brand: RGR - Gerenciamento da Rotina */}
      <div className={`h-16 border-b border-slate-200/80 dark:border-[#1a2333] flex items-center transition-colors shrink-0 bg-white dark:bg-[#0c121e] ${
        isCollapsed ? 'justify-center px-2' : 'px-4'
      }`}>
        <div 
          onClick={isCollapsed ? handleToggleCollapse : undefined}
          className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'cursor-pointer' : ''}`}
          title={isCollapsed ? 'Clique para expandir o menu lateral' : undefined}
        >
          <div 
            className={`h-9 w-9 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-xs tracking-wider shadow-xs shrink-0 ${
              isCollapsed ? 'hover:scale-105 transition-transform' : ''
            }`}
            title="RGR Governança Operacional"
          >
            RGR
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
                  RGR <span className="text-slate-500 dark:text-slate-400 font-normal">Rotina</span>
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                  Facilities
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal truncate whitespace-nowrap">
                Gerenciamento da Rotina
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cadeira Ativa com Limitação de Acesso por Usuário */}
      <div className={`border-b border-slate-200/80 dark:border-[#1a2333] bg-white/50 dark:bg-[#0f1726]/40 ${isCollapsed ? 'p-2 flex flex-col items-center' : 'p-3.5'}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Cadeira Ativa
                </span>
                {isOperator && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <Lock className="w-2.5 h-2.5" /> Titular
                  </span>
                )}
              </div>

              {/* Action button visible to Admins/Directors */}
              {isAdmin && (
                <button
                  onClick={onOpenCreateRoleModal}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
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
                className={`w-full bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors cursor-pointer appearance-none pr-8 shadow-xs ${
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
                <div className="absolute right-2.5 top-2.5 pointer-events-none text-slate-400 text-xs">
                  ▾
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 truncate">
              {currentRole?.department}
            </p>
          </>
        ) : (
          <div className="relative group w-full flex justify-center">
            <div 
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#111827] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center font-mono font-medium text-[10px] shadow-xs cursor-pointer"
              title={`Cadeira em Sessão:\n${currentRole?.title} (${currentRole?.code || 'CAD'})\n${currentRole?.department}`}
            >
              <span className="leading-none text-[8px] text-slate-400 font-sans">CAD</span>
              <span className="leading-tight text-[10px] font-bold truncate max-w-[34px]">
                {currentRole?.code ? currentRole.code.replace('CAD-', '').slice(0, 3) : 'FIN'}
              </span>
            </div>
            {!(isOperator && allowedRoles.length <= 1) && (
              <select
                value={selectedRoleId}
                onChange={(e) => handleSelectChange(e.target.value)}
                title={`Alternar cadeira (atual: ${currentRole?.title})`}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              >
                {allowedRoles.map(r => (
                  <option key={r.id} value={r.id} className="text-slate-900 dark:text-white dark:bg-slate-900">
                    {r.title} ({r.code || 'CAD'})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-3 space-y-4' : 'px-3 py-4 space-y-5'}`}>
        
        {/* Group 1: Rotina & Ritos */}
        <div>
          {!isCollapsed && (
            <span className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Cadência & Despacho
            </span>
          )}
          <div className="space-y-1">
            
            {/* Timeline */}
            <button
              onClick={() => onSelectTab('timeline')}
              title={isCollapsed ? (isWeekend ? 'Meu Dia (Timeline) • Fim de Semana (Pausa de Rotina)' : `Meu Dia (Timeline) • ${totalCount} entregas`) : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-lg text-xs transition-colors relative cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className={`w-4 h-4 shrink-0 ${activeTab === 'timeline' ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Meu Dia (Timeline)</span>}
              </div>
              {!isCollapsed ? (
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                  activeTab === 'timeline' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {isWeekend ? '—' : totalCount}
                </span>
              ) : (
                !isWeekend && totalCount > 0 && (
                  <span className="absolute top-1 right-1 font-mono text-[8px] w-3.5 h-3.5 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                    {totalCount > 9 ? '9+' : totalCount}
                  </span>
                )
              )}
            </button>

            {/* Dispatch Room */}
            <button
              onClick={() => onSelectTab('dispatch')}
              title={isCollapsed ? 'Mesa de Despacho (CEO / Boardroom)' : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-lg text-xs transition-colors relative cursor-pointer ${
                activeTab === 'dispatch'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className={`w-4 h-4 shrink-0 ${activeTab === 'dispatch' ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Mesa de Despacho (CEO)</span>}
              </div>
              <span className={`${isCollapsed ? 'absolute top-1.5 right-1.5' : ''} w-2 h-2 rounded-full bg-emerald-500`} />
            </button>

          </div>
        </div>

        {/* Group 2: Governança & Conhecimento */}
        <div>
          {!isCollapsed && (
            <span className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Governança & Padrões
            </span>
          )}
          <div className="space-y-1">
            
            {/* Playbook */}
            <button
              onClick={() => onSelectTab('playbook')}
              title={isCollapsed ? 'Playbook & POPs (Procedimentos Operacionais Padrão)' : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-lg text-xs transition-colors cursor-pointer ${
                activeTab === 'playbook'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'playbook' ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Playbook & POPs</span>}
              </div>
              {!isCollapsed && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  activeTab === 'playbook' ? 'bg-white/20 text-white' : 'text-slate-400'
                }`}>SOP</span>
              )}
            </button>

            {/* Minutes */}
            <button
              onClick={() => onSelectTab('minutes')}
              title={isCollapsed ? 'Livro Oficial de Atas Homologadas' : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-lg text-xs transition-colors cursor-pointer ${
                activeTab === 'minutes'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className={`w-4 h-4 shrink-0 ${activeTab === 'minutes' ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Livro de Atas</span>}
              </div>
              {!isCollapsed && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  activeTab === 'minutes' ? 'bg-white/20 text-white' : 'text-slate-400'
                }`}>Oficial</span>
              )}
            </button>

          </div>
        </div>

        {/* Group 3: Administração (Somente Diretoria e Gestão) */}
        {!isOperator && (
          <div>
            {!isCollapsed && (
              <span className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                Administração & IAM
              </span>
            )}
            <div className="space-y-1">
              
              {/* Cadeiras */}
              <button
                onClick={() => {
                  if (onSelectAdminSection) onSelectAdminSection('roles');
                  onSelectTab('admin');
                }}
                title={isCollapsed ? `Cadeiras & Governança (${roles.length})` : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-lg text-xs transition-colors cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-medium shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-normal'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className={`w-4 h-4 shrink-0 ${activeTab === 'admin' ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && <span>Cadeiras & Governança</span>}
                </div>
                {!isCollapsed && (
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                    activeTab === 'admin' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {roles.length}
                  </span>
                )}
              </button>

              {/* IAM Users */}
              <button
                onClick={() => onSelectTab('users')}
                title={isCollapsed ? 'Usuários & Acessos (IAM)' : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-lg text-xs transition-colors cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-medium shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-normal'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 shrink-0 ${activeTab === 'users' ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && <span>Usuários & Acessos (IAM)</span>}
                </div>
                {!isCollapsed && (
                  <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md ${
                    activeTab === 'users' ? 'bg-white/20 text-white' : 'text-slate-400'
                  }`}>
                    RBAC
                  </span>
                )}
              </button>

            </div>
          </div>
        )}

      </div>

      {/* Bottom Compliance Gauge */}
      {!isCollapsed ? (
        <div className="p-3.5 border-t border-slate-200/80 dark:border-[#1a2333] bg-white/40 dark:bg-[#0c121e]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {isWeekend ? 'Pausa Semanal' : 'Taxa de Execução'}
            </span>
            <span className={`font-mono text-xs font-semibold ${complianceRate === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {complianceRate}%
            </span>
          </div>
          <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                complianceRate === 100 ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-blue-600'
              }`}
              style={{ width: `${complianceRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>{isWeekend ? 'Sem rotina aos fins de semana' : `${completedCount} de ${totalCount} entregues`}</span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
              <Shield className="w-3 h-3 text-slate-400" /> Auditado
            </span>
          </div>
        </div>
      ) : (
        <div 
          className="p-2 border-t border-slate-200/80 dark:border-[#1a2333] bg-white/40 dark:bg-[#0c121e] flex flex-col items-center justify-center cursor-pointer"
          title={isWeekend ? 'Fim de Semana: Rotina em pausa' : `Compliance do Dia: ${complianceRate}% (${completedCount}/${totalCount})`}
        >
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-mono font-medium ${
            complianceRate === 100 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30' 
              : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900'
          }`}>
            {isWeekend ? '100%' : `${complianceRate}%`}
          </div>
        </div>
      )}

      {/* Bottom User Profile & Switcher */}
      {currentUser && (
        <div className={`border-t border-slate-200/80 dark:border-[#1a2333] bg-white/60 dark:bg-[#0a0f1a] relative ${isCollapsed ? 'p-2 flex flex-col items-center gap-1.5' : 'p-3'}`} ref={userMenuRef}>
          
          {!isCollapsed ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex-1 flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left border border-slate-200/90 dark:border-[#1e2a3f] group shadow-xs min-w-0 cursor-pointer"
                title="Opções da conta e perfil de acesso"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${currentUser.avatarColor || 'bg-slate-900 text-white dark:bg-slate-700'}`}>
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-xs text-slate-900 dark:text-white truncate block">
                        {currentUser.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
                        {currentUser.jobTitle}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Encerrar sessão (Sair)"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/90 dark:border-[#1e2a3f] hover:border-rose-200 dark:hover:border-rose-800 transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:ring-1 hover:ring-slate-400 transition-all shadow-xs cursor-pointer"
              title={`Perfil: ${currentUser.name}\n${currentUser.jobTitle}\nClique para ver opções`}
            >
              <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold ${currentUser.avatarColor || 'bg-slate-900 text-white dark:bg-slate-700'}`}>
                {getInitials(currentUser.name)}
              </div>
            </button>
          )}

          {/* Upward / Popover Dropdown Menu */}
          {isUserMenuOpen && (
            <div className={`absolute z-50 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-xl shadow-xl overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in duration-150 ${
              isCollapsed 
                ? 'left-16 bottom-2 w-72' 
                : 'bottom-full mb-2 left-3 right-3'
            }`}>
              
              {/* Header */}
              <div className="p-3 bg-slate-50/80 dark:bg-[#0c121e] border-b border-slate-200/80 dark:border-[#1a2333]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Key className="w-3 h-3 text-slate-500" />
                    Sessão Ativa
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0 ${currentUser.avatarColor || 'bg-slate-900 text-white dark:bg-slate-700'}`}>
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block font-mono">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-[#1c273a]">
                  <span className="text-[10px] font-medium text-slate-400 block mb-1">
                    Cadeiras Autorizadas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentUser.allowedRoleIds.includes('*') ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        Acesso Total (*)
                      </span>
                    ) : (
                      currentUser.allowedRoleIds.map(rId => (
                        <span key={rId} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1a2333] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-[#24334d]">
                          {getChairName(rId)}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* IAM Management button */}
              {!isOperator && (
                <div className="p-1.5 border-t border-slate-100 dark:border-[#1a2333]">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSelectTab('users');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Gerenciar Usuários & Cadeiras (IAM)</span>
                  </button>
                </div>
              )}

              {/* Change Password button */}
              {onOpenChangePassword && (
                <div className="p-1.5 border-t border-slate-100 dark:border-[#1a2333]">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenChangePassword();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Alterar Minha Senha</span>
                  </button>
                </div>
              )}

              {/* Logout button in dropdown */}
              {onLogout && (
                <div className="p-1.5 border-t border-slate-100 dark:border-[#1a2333]">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Encerrar Sessão (Sair)</span>
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
