'use client';

import React from 'react';
import { 
  Calendar, 
  ChevronRight, 
  FileCheck2, 
  RotateCcw, 
  Building,
  Pencil
} from 'lucide-react';
import { OperationalRole } from '@/lib/types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentRole: OperationalRole | null;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  activeTab: string;
  onOpenMinuteModal: () => void;
  onResetData: () => void;
  onOpenEditRoleModal?: () => void;
  canEditRole?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  selectedDate,
  onSelectDate,
  activeTab,
  onOpenMinuteModal,
  onResetData,
  onOpenEditRoleModal,
  canEditRole = true
}) => {
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'timeline': return 'Cadência Diária';
      case 'dispatch': return 'Mesa de Despacho (Boardroom)';
      case 'playbook': return 'Playbook Normativo de POPs';
      case 'minutes': return 'Livro Oficial de Atas';
      case 'admin': return 'Matriz de Governança';
      case 'users': return 'Gestão de Usuários & Acessos (IAM)';
      default: return 'Visão Executiva';
    }
  };

  const handleSetToday = () => {
    onSelectDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <header className="h-16 bg-white dark:bg-[#0f1726] border-b border-slate-200 dark:border-[#1a2333] px-6 flex items-center justify-between shrink-0 select-none transition-colors">
      
      {/* Left: Formal Corporate Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-blue-600 dark:text-slate-400" />
          Governança Operacional
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
        <span className="text-slate-600 dark:text-slate-400 font-medium">
          {currentRole?.department || 'Departamento'}
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
        <span className="text-slate-900 dark:text-white font-semibold flex items-center gap-1.5">
          {getTabLabel(activeTab)}
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#1e2c40] text-blue-700 dark:text-blue-300 border border-slate-300 dark:border-[#2b3e59]">
            {currentRole?.code || 'CAD-01'}
          </span>
        </span>

        {currentRole && canEditRole && onOpenEditRoleModal && (
          <button
            onClick={onOpenEditRoleModal}
            className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#162236] hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300 rounded border border-slate-200 dark:border-[#243754] transition-colors"
            title="Editar cadastro, código e atribuições desta cadeira"
          >
            <Pencil className="w-2.5 h-2.5" />
            <span>Editar Cadeira</span>
          </button>
        )}
      </div>

      {/* Right: Date control, Actions, Theme Toggle */}
      <div className="flex items-center gap-2.5">
        
        {/* Date Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#141d2e] border border-slate-300 dark:border-[#223048] rounded-md px-2.5 py-1.5 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
          />
          <button
            onClick={handleSetToday}
            className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline ml-1 pl-1.5 border-l border-slate-300 dark:border-slate-700"
          >
            Hoje
          </button>
        </div>

        {/* Action Button: Formal Meeting Minute */}
        <button
          onClick={onOpenMinuteModal}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-[#1e3a5f] dark:hover:bg-[#254673] border border-blue-700 dark:border-[#2d558b] text-white dark:text-blue-100 px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0"
        >
          <FileCheck2 className="w-3.5 h-3.5 text-blue-100 dark:text-blue-300" />
          <span>Lavrar Ata do Despacho</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <ThemeToggle />

        {/* Reset button */}
        <button
          onClick={onResetData}
          title="Restaurar dados originais de fábrica"
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182338] border border-slate-300 dark:border-[#223048] rounded-md transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

      </div>

    </header>
  );
};
