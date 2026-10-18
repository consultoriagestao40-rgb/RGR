'use client';

import React from 'react';
import { 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  FileCheck2, 
  RotateCcw, 
  Building,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { OperationalRole } from '@/lib/types';
import { SYSTEM_START_DATE, isWeekend } from '@/lib/frequency';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentRole: OperationalRole | null;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  activeTab: string;
  onOpenMinuteModal: () => void;
  onResetData: () => void;
  onLogout?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  selectedDate,
  onSelectDate,
  activeTab,
  onOpenMinuteModal,
  onResetData,
  onLogout,
  isSidebarCollapsed,
  onToggleSidebar
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

  const isAtMinDate = selectedDate <= SYSTEM_START_DATE;

  const handleSetToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    onSelectDate(todayStr < SYSTEM_START_DATE ? SYSTEM_START_DATE : todayStr);
  };

  const handlePrevDay = () => {
    if (selectedDate <= SYSTEM_START_DATE) return;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() - 1);
    const prevStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (prevStr < SYSTEM_START_DATE) {
      onSelectDate(SYSTEM_START_DATE);
      return;
    }
    onSelectDate(prevStr);
  };

  const handleNextDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + 1);
    const nextStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    onSelectDate(nextStr);
  };

  return (
    <header className="h-16 bg-white dark:bg-[#0f1726] border-b border-slate-200 dark:border-[#1a2333] px-6 flex items-center justify-between shrink-0 select-none transition-colors">
      
      {/* Left: Formal Corporate Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1 cursor-pointer"
            title={isSidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-label={isSidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}

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
      </div>

      {/* Right: Date control, Actions, Theme Toggle */}
      <div className="flex items-center gap-2.5">
        
        {/* Date Selector with Previous/Next Arrows */}
        <div className="flex items-center bg-slate-50 dark:bg-[#141d2e] border border-slate-300 dark:border-[#223048] rounded-md shrink-0 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={handlePrevDay}
            disabled={isAtMinDate}
            className={`px-2 py-1.5 transition-colors border-r border-slate-200 dark:border-[#1f2c42] ${
              isAtMinDate
                ? 'opacity-30 cursor-not-allowed text-slate-300 dark:text-slate-600'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-[#1a2638]'
            }`}
            title={isAtMinDate ? "Início da plataforma em 15/10/2026 (sem registros retroativos)" : "Voltar 1 dia (D-1)"}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <input
              type="date"
              min={SYSTEM_START_DATE}
              value={selectedDate}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                if (val < SYSTEM_START_DATE) {
                  onSelectDate(SYSTEM_START_DATE);
                } else {
                  onSelectDate(val);
                }
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
            />
            <button
              onClick={handleSetToday}
              className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline ml-1 pl-1.5 border-l border-slate-300 dark:border-slate-700"
            >
              Hoje
            </button>
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            className="px-2 py-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-[#1a2638] transition-colors border-l border-slate-200 dark:border-[#1f2c42]"
            title="Avançar 1 dia (D+1)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Weekend Badge */}
        {isWeekend(selectedDate) && (
          <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
            Fim de Semana (Pausa)
          </span>
        )}

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

        {/* Logout button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Encerrar sessão e sair da plataforma"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-300 dark:border-[#223048] hover:border-rose-300 dark:hover:border-rose-800 rounded-md transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        )}

      </div>

    </header>
  );
};
