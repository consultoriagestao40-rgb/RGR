'use client';

import React from 'react';
import { 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  FileCheck2, 
  RotateCcw, 
  Building,
  LogOut
} from 'lucide-react';
import { OperationalRole } from '@/lib/types';
import { SYSTEM_START_DATE, isWeekend, formatDateBR } from '@/lib/frequency';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentRole: OperationalRole | null;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  activeTab: string;
  onOpenMinuteModal: () => void;
  onResetData: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  selectedDate,
  onSelectDate,
  activeTab,
  onOpenMinuteModal,
  onResetData,
  onLogout
}) => {
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'timeline': return 'Cadência Diária';
      case 'dispatch': return 'Mesa de Despacho';
      case 'playbook': return 'Playbook de POPs';
      case 'actions': return 'Central de Ações (5W2H)';
      case 'ranking': return 'Desempenho & Ranking por Cadeira';
      case 'minutes': return 'Livro Oficial de Atas';
      case 'admin': return 'Matriz de Governança';
      case 'users': return 'Gestão de Usuários';
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
    <header className="h-16 bg-white dark:bg-[#0f1726] border-b border-slate-200/90 dark:border-[#1a2333] px-4 sm:px-6 flex items-center justify-between shrink-0 select-none transition-colors">
      
      {/* Left: Clean Non-Breaking Breadcrumbs (Mapa do Site) */}
      <div className="flex items-center gap-2.5 min-w-0">
        <nav aria-label="Mapa do Site" className="flex items-center gap-2 text-xs whitespace-nowrap min-w-0">
          <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap shrink-0">
            {currentRole?.department || 'Departamento'}
          </span>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />

          <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="text-slate-700 dark:text-slate-200 font-medium">
              {currentRole?.title || 'Cadeira'}
            </span>
            <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
              {currentRole?.code || 'CAD-01'}
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />

          <span className="text-slate-900 dark:text-white font-semibold tracking-tight whitespace-nowrap shrink-0">
            {getTabLabel(activeTab)}
          </span>
        </nav>
      </div>

      {/* Right: Date control, Actions, Theme Toggle */}
      <div className="flex items-center gap-2.5">
        
        {/* Date Selector with Previous/Next Arrows */}
        <div className="flex items-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg shrink-0 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={handlePrevDay}
            disabled={isAtMinDate}
            className={`px-2 py-1.5 transition-colors border-r border-slate-100 dark:border-[#1a2333] ${
              isAtMinDate
                ? 'opacity-30 cursor-not-allowed text-slate-300 dark:text-slate-600'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={isAtMinDate ? "Início da plataforma em 15/10/2026 (sem registros retroativos)" : "Voltar 1 dia (D-1)"}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="relative flex items-center gap-1.5 px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white tracking-wide">
              {formatDateBR(selectedDate)}
            </span>
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
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Clique para abrir o calendário e alterar a data"
            />
            <button
              type="button"
              onClick={handleSetToday}
              className="relative z-10 text-[10px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline ml-1 pl-1.5 border-l border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              Hoje
            </button>
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            className="px-2 py-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-l border-slate-100 dark:border-[#1a2333] cursor-pointer"
            title="Avançar 1 dia (D+1)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Weekend Badge */}
        {isWeekend(selectedDate) && (
          <span className="hidden sm:inline-flex items-center text-[10px] font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
            Fim de Semana
          </span>
        )}

        {/* Action Button: Formal Meeting Minute */}
        <button
          onClick={onOpenMinuteModal}
          className="flex items-center gap-1.5 bg-atlas-600 hover:bg-atlas-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FileCheck2 className="w-3.5 h-3.5 text-white/90" />
          <span>Lavrar Ata do Despacho</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <ThemeToggle />

        {/* Reset button */}
        <button
          onClick={onResetData}
          title="Restaurar dados originais de fábrica"
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Logout button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Encerrar sessão e sair da plataforma"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        )}

      </div>

    </header>
  );
};
