'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Building2, 
  Landmark, 
  Filter, 
  CheckCircle2, 
  CalendarDays, 
  Star, 
  FileText, 
  ArrowRight, 
  ExternalLink,
  Layers,
  Sparkles,
  Users,
  Eye,
  X,
  Briefcase,
  Coffee,
  Search,
  Check,
  Zap,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Activity,
  TrendingUp,
  BarChart3,
  CalendarCheck,
  ListTodo,
  ShieldCheck
} from 'lucide-react';
import { 
  OperationalRole, 
  RoutineBlock, 
  DailyRitual, 
  RoutineExecution,
  Frequency 
} from '@/lib/types';
import { 
  isRitualScheduledForDate, 
  isBlockScheduledForDate, 
  formatDateBR, 
  parseLocalDate, 
  isWeekend, 
  formatRitualFrequency,
  getNextBusinessDay
} from '@/lib/frequency';

interface CalendarTabProps {
  roles: OperationalRole[];
  blocks: RoutineBlock[];
  rituals: DailyRitual[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectRole: (roleId: string) => void;
  onGoToDispatch: () => void;
  onGoToTimeline: () => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  roles,
  blocks,
  rituals,
  selectedDate,
  onSelectDate,
  onSelectRole,
  onGoToDispatch,
  onGoToTimeline
}) => {
  // View Modes: 'month' (Interactive Month Grid), 'week' (Weekly Timetable), 'day' (Executive Day Feed)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Navigation state (year/month cursor)
  const [currentYear, setCurrentYear] = useState<number>(() => {
    return Number(selectedDate.split('-')[0]) || 2026;
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    return Number(selectedDate.split('-')[1]) || 10; // 1-12
  });

  // Inspected date for side inspector panel & day feed
  const [inspectedDate, setInspectedDate] = useState<string>(selectedDate);

  // Filters & Search
  const [roleFilter, setRoleFilter] = useState<string>('all'); // 'all' or roleId
  const [typeFilter, setTypeFilter] = useState<'all' | 'rituals' | 'blocks'>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Detail Modals
  const [selectedRitualForModal, setSelectedRitualForModal] = useState<DailyRitual | null>(null);
  const [selectedBlockForModal, setSelectedBlockForModal] = useState<RoutineBlock | null>(null);

  // Interactive checklist state for ritual pautas
  const [checkedPautaItems, setCheckedPautaItems] = useState<{ [ritualId: string]: { [index: number]: boolean } }>({});

  const togglePautaItem = (ritualId: string, itemIdx: number) => {
    setCheckedPautaItems(prev => {
      const currentRitualChecks = prev[ritualId] || {};
      return {
        ...prev,
        [ritualId]: {
          ...currentRitualChecks,
          [itemIdx]: !currentRitualChecks[itemIdx]
        }
      };
    });
  };

  // Color & Badge Tokens by Chair / Role
  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    const code = role?.code || '';
    if (code.includes('FIN')) {
      return {
        bg: 'bg-blue-50/90 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200/90 dark:border-blue-800/80',
        dot: 'bg-blue-500 shadow-blue-500/50',
        accent: 'from-blue-600 to-indigo-600',
        tag: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
      };
    }
    if (code.includes('DP') || code.includes('RH')) {
      return {
        bg: 'bg-amber-50/90 dark:bg-amber-950/40',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-200/90 dark:border-amber-800/80',
        dot: 'bg-amber-500 shadow-amber-500/50',
        accent: 'from-amber-600 to-orange-600',
        tag: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
      };
    }
    if (code.includes('OPS') || code.includes('COO')) {
      return {
        bg: 'bg-purple-50/90 dark:bg-purple-950/40',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200/90 dark:border-purple-800/80',
        dot: 'bg-purple-500 shadow-purple-500/50',
        accent: 'from-purple-600 to-pink-600',
        tag: 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200'
      };
    }
    if (code.includes('OPE') || code.includes('DIR') || code.includes('HEAD')) {
      return {
        bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200/90 dark:border-emerald-800/80',
        dot: 'bg-emerald-500 shadow-emerald-500/50',
        accent: 'from-emerald-600 to-teal-600',
        tag: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
      };
    }
    return {
      bg: 'bg-slate-50 dark:bg-slate-800/80',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200/80 dark:border-slate-700/80',
      dot: 'bg-slate-400',
      accent: 'from-slate-600 to-slate-700',
      tag: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    };
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const [y, m] = today.split('-').map(Number);
    setCurrentYear(y);
    setCurrentMonth(m);
    setInspectedDate(today);
    onSelectDate(today);
  };

  const handleQuickJump = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    setCurrentYear(y);
    setCurrentMonth(d.getMonth() + 1);
    setInspectedDate(dateStr);
    onSelectDate(dateStr);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Helper for full Brazilian Portuguese date display
  const getFullDateDisplay = (dateStr: string): string => {
    try {
      const d = parseLocalDate(dateStr);
      const dayOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][d.getDay()];
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `${dayOfWeek}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
    } catch {
      return formatDateBR(dateStr);
    }
  };

  // Helper to match search query
  const matchesSearch = (title: string, code?: string) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return title.toLowerCase().includes(q) || (code && code.toLowerCase().includes(q));
  };

  // Monthly Grid Generation
  const monthGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun

    const days: { 
      dayNumber: number | null; 
      dateStr: string | null; 
      isWeekendDay: boolean; 
      rituals: DailyRitual[]; 
      blocks: RoutineBlock[];
      hasMonthlySpecial: boolean;
      hasCouncilSpecial: boolean;
      hasWeeklySpecial: boolean;
    }[] = [];

    // Empty slots before 1st of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        dayNumber: null,
        dateStr: null,
        isWeekendDay: false,
        rituals: [],
        blocks: [],
        hasMonthlySpecial: false,
        hasCouncilSpecial: false,
        hasWeeklySpecial: false
      });
    }

    // Days in current month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(currentMonth).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      const isWeekendDay = isWeekend(dateStr);

      const dayRituals = rituals.filter(r => {
        if (roleFilter !== 'all' && r.roleId !== roleFilter) return false;
        if (frequencyFilter !== 'all' && r.frequency !== frequencyFilter) return false;
        if (!matchesSearch(r.title, r.code)) return false;
        return isRitualScheduledForDate(r, dateStr);
      });

      const dayBlocks = blocks.filter(b => {
        if (roleFilter !== 'all' && b.roleId !== roleFilter) return false;
        if (frequencyFilter !== 'all' && b.frequency !== frequencyFilter) return false;
        if (!matchesSearch(b.title, b.code)) return false;
        return isBlockScheduledForDate(b, dateStr);
      });

      const hasMonthlySpecial = dayRituals.some(r => r.frequency === 'monthly') || dayBlocks.some(b => b.frequency === 'monthly');
      const hasCouncilSpecial = dayRituals.some(r => r.type === 'board_council' || r.title.toLowerCase().includes('conselho'));
      const hasWeeklySpecial = dayRituals.some(r => r.frequency === 'weekly') || dayBlocks.some(b => b.frequency === 'weekly');

      days.push({
        dayNumber: day,
        dateStr,
        isWeekendDay,
        rituals: dayRituals,
        blocks: dayBlocks,
        hasMonthlySpecial,
        hasCouncilSpecial,
        hasWeeklySpecial
      });
    }

    return days;
  }, [currentYear, currentMonth, rituals, blocks, roleFilter, frequencyFilter, searchQuery]);

  // Weekly Grid Computation
  const weekDays = useMemo(() => {
    const baseDate = parseLocalDate(inspectedDate);
    const dayOfWeek = baseDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday);

    const result = [];
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayNum}`;
      const isWeekendDay = isWeekend(dateStr);

      const dayRituals = rituals.filter(r => {
        if (roleFilter !== 'all' && r.roleId !== roleFilter) return false;
        if (frequencyFilter !== 'all' && r.frequency !== frequencyFilter) return false;
        if (!matchesSearch(r.title, r.code)) return false;
        return isRitualScheduledForDate(r, dateStr);
      });

      const dayBlocks = blocks.filter(b => {
        if (roleFilter !== 'all' && b.roleId !== roleFilter) return false;
        if (frequencyFilter !== 'all' && b.frequency !== frequencyFilter) return false;
        if (!matchesSearch(b.title, b.code)) return false;
        return isBlockScheduledForDate(b, dateStr);
      });

      result.push({
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        dateStr,
        dateFormatted: formatDateBR(dateStr),
        isWeekendDay,
        rituals: dayRituals,
        blocks: dayBlocks
      });
    }
    return result;
  }, [inspectedDate, rituals, blocks, roleFilter, frequencyFilter, searchQuery]);

  // Data for the Inspected Date details
  const inspectedData = useMemo(() => {
    const isWeekendDay = isWeekend(inspectedDate);
    const dayRituals = rituals.filter(r => {
      if (roleFilter !== 'all' && r.roleId !== roleFilter) return false;
      if (!matchesSearch(r.title, r.code)) return false;
      return isRitualScheduledForDate(r, inspectedDate);
    });
    const dayBlocks = blocks.filter(b => {
      if (roleFilter !== 'all' && b.roleId !== roleFilter) return false;
      if (!matchesSearch(b.title, b.code)) return false;
      return isBlockScheduledForDate(b, inspectedDate);
    });

    const nextBusinessDayStr = isWeekendDay ? getNextBusinessDay(inspectedDate) : null;
    const nextBusinessDayFormatted = nextBusinessDayStr ? formatDateBR(nextBusinessDayStr) : null;

    const totalTopics = dayRituals.reduce((acc, r) => acc + (r.agendaItems?.length || 0), 0);

    return {
      dateStr: inspectedDate,
      dateFormatted: formatDateBR(inspectedDate),
      fullDateDisplay: getFullDateDisplay(inspectedDate),
      isWeekendDay,
      nextBusinessDayStr,
      nextBusinessDayFormatted,
      rituals: dayRituals,
      blocks: dayBlocks,
      totalTopics
    };
  }, [inspectedDate, rituals, blocks, roleFilter, searchQuery]);

  // Overall counts for summary
  const summaryCounts = useMemo(() => {
    let monthlyRitualsCount = 0;
    let monthlyBlocksCount = 0;
    let daysWithSpecial = 0;

    monthGrid.forEach(d => {
      if (d.dayNumber) {
        monthlyRitualsCount += d.rituals.length;
        monthlyBlocksCount += d.blocks.length;
        if (d.hasMonthlySpecial || d.hasWeeklySpecial) {
          daysWithSpecial++;
        }
      }
    });

    return {
      monthlyRitualsCount,
      monthlyBlocksCount,
      daysWithSpecial
    };
  }, [monthGrid]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16">
      
      {/* ========================================================================= */}
      {/* 1. HERO CADENCE HEADER (Atlas Executive Glassmorphism) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-white dark:from-[#0f172a] dark:via-[#111c33] dark:to-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden transition-all">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-atlas-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-atlas-50 dark:bg-atlas-950/80 text-atlas-700 dark:text-atlas-300 border border-atlas-200/90 dark:border-atlas-800/80 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Governança RGR • Cadência Executiva
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                {viewMode === 'month' && '📅 Visão Mensal Consolidada'}
                {viewMode === 'week' && '📆 Grade Semanal com Horários'}
                {viewMode === 'day' && '⚡ Pauta & Cadência do Dia'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Agenda de Ritos & Calendário Operacional
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              Consolidação interativa de <strong>Ritos de Despacho</strong>, <strong>Sessões de Conselho & Comitês</strong> e <strong>Entregas Operacionais (POPs)</strong>.
            </p>
          </div>

          {/* Controls: View Switcher & Month Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* View Mode Segmented Control */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Mês</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Semana</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'day'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Dia</span>
              </button>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 px-3 min-w-[130px] text-center font-mono">
                {monthNames[currentMonth - 1]} / {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-xs transition-transform active:scale-95 cursor-pointer ml-1"
              >
                Hoje
              </button>
            </div>
          </div>
        </div>

        {/* Quick Date Jumps (Ontem, Hoje, Amanhã, Próxima Segunda) */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <span className="text-[11px] font-mono uppercase text-slate-400">Atalhos:</span>
            <button
              type="button"
              onClick={() => handleQuickJump(0)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer font-medium"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => handleQuickJump(1)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer font-medium"
            >
              Amanhã
            </button>
            <button
              type="button"
              onClick={() => {
                const nextMon = getNextBusinessDay(new Date().toISOString().split('T')[0]);
                setInspectedDate(nextMon);
                onSelectDate(nextMon);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer font-medium"
            >
              Próx. Dia Útil
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Ritos no Mês: <strong className="text-slate-900 dark:text-white font-bold">{summaryCounts.monthlyRitualsCount}</strong></span>
            <span>•</span>
            <span>Entregas POP: <strong className="text-slate-900 dark:text-white font-bold">{summaryCounts.monthlyBlocksCount}</strong></span>
            <span>•</span>
            <span>Dias Críticos: <strong className="text-amber-600 dark:text-amber-400 font-bold">{summaryCounts.daysWithSpecial}</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTERS & SEARCH TOOLBAR (Lista Suspensa de Cadeiras & Filtros) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Filters Group: Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          
          {/* Chair Dropdown (Lista Suspensa) */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <Building2 className="w-3.5 h-3.5 text-atlas-500 shrink-0" />
            <span className="text-slate-500 font-medium shrink-0">Cadeira:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
            >
              <option value="all" className="dark:bg-slate-900">
                Todas as Cadeiras ({roles.length} Diretorias)
              </option>
              {roles.map(r => (
                <option key={r.id} value={r.id} className="dark:bg-slate-900">
                  {r.code || 'CAD'} • {r.title}
                </option>
              ))}
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium shrink-0">Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
            >
              <option value="all" className="dark:bg-slate-900">Ritos & Entregáveis (POPs)</option>
              <option value="rituals" className="dark:bg-slate-900">Apenas Ritos Executivos</option>
              <option value="blocks" className="dark:bg-slate-900">Apenas Entregáveis (POPs)</option>
            </select>
          </div>

          {/* Frequency Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium shrink-0">Frequência:</span>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
            >
              <option value="all" className="dark:bg-slate-900">Todas as Frequências</option>
              <option value="daily" className="dark:bg-slate-900">Diários (Seg a Sex)</option>
              <option value="weekly" className="dark:bg-slate-900">Semanais (Conselho / Comitês)</option>
              <option value="monthly" className="dark:bg-slate-900">Mensais (Tributos, Ponto, VT, Folha, DRE)</option>
            </select>
          </div>

        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar rito ou POP..."
            className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-atlas-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN INTERACTIVE CONTENT AREA (Grid vs Schedule vs Feed + Inspector) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Calendar Space (8 or 9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          {/* --------------------------------------------------------------------- */}
          {/* VIEW 1: MONTHLY INTERACTIVE GRID */}
          {/* --------------------------------------------------------------------- */}
          {viewMode === 'month' && (
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-all">
              
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-[#090d16] text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-3 tracking-wider uppercase">
                <span className="text-slate-400">Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span className="text-slate-400">Sáb</span>
              </div>

              {/* Month Day Cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
                {monthGrid.map((day, idx) => {
                  if (!day.dayNumber || !day.dateStr) {
                    return (
                      <div key={idx} className="min-h-[125px] p-2 bg-slate-50/30 dark:bg-slate-900/10" />
                    );
                  }

                  const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                  const isSelected = day.dateStr === inspectedDate;
                  const isSystemActiveDate = day.dateStr === selectedDate;

                  const visibleRituals = typeFilter === 'blocks' ? [] : day.rituals;
                  const visibleBlocks = typeFilter === 'rituals' ? [] : day.blocks;
                  const totalItems = visibleRituals.length + visibleBlocks.length;

                  // Workload density (for progress line at cell bottom)
                  const densityScore = Math.min(100, totalItems * 18);

                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => {
                        setInspectedDate(day.dateStr!);
                        onSelectDate(day.dateStr!);
                      }}
                      className={`min-h-[125px] p-2 flex flex-col justify-between transition-all cursor-pointer relative group hover:-translate-y-0.5 hover:shadow-md ${
                        isSelected 
                          ? 'ring-2 ring-atlas-500 bg-atlas-50/30 dark:bg-atlas-950/30 z-10' 
                          : isToday
                          ? 'bg-blue-50/30 dark:bg-blue-950/20'
                          : day.isWeekendDay
                          ? 'bg-slate-50/50 dark:bg-slate-900/30'
                          : 'bg-white dark:bg-[#0f172a] hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Cell Header: Day Number and Indicators */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-transform group-hover:scale-110 ${
                          isToday 
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                            : isSystemActiveDate
                            ? 'bg-atlas-600 text-white'
                            : day.isWeekendDay
                            ? 'text-slate-400 dark:text-slate-500 font-normal'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {day.dayNumber}
                        </span>

                        <div className="flex items-center gap-1">
                          {day.hasCouncilSpecial && (
                            <span 
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs flex items-center gap-0.5" 
                              title="Sessão de Conselho / Comitê Deliberativo"
                            >
                              <Landmark className="w-2.5 h-2.5" />
                              <span>Conselho</span>
                            </span>
                          )}
                          {day.hasMonthlySpecial && !day.hasCouncilSpecial && (
                            <span 
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs" 
                              title="Marco Crítico Mensal (Tributos, Ponto, Salários ou DRE)"
                            >
                              ★ Mensal
                            </span>
                          )}
                          {day.isWeekendDay && (
                            <span className="text-[10px] text-slate-400 font-mono">Pausa</span>
                          )}
                        </div>
                      </div>

                      {/* Content pills inside the day */}
                      <div className="space-y-1 flex-1 overflow-hidden">
                        
                        {/* Weekend State */}
                        {day.isWeekendDay ? (
                          <div className="h-full flex items-center justify-center py-4 opacity-40 group-hover:opacity-80 transition-opacity">
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                              <Coffee className="w-3.5 h-3.5" />
                              <span>Pausa</span>
                            </span>
                          </div>
                        ) : (
                          <>
                            {/* Rituals List: Clickable to open Modal! */}
                            {visibleRituals.slice(0, 2).map((rit) => {
                              const colors = getRoleColor(rit.roleId);
                              const isCouncil = rit.type === 'board_council' || rit.title.toLowerCase().includes('conselho');
                              const cleanTitle = rit.title
                                .replace(/^(Rito de\s+|Mesa de\s+|Sessão Deliberativa do\s+|Comitê Mensal de\s+)/i, '')
                                .trim();

                              return (
                                <button
                                  key={rit.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectedDate(day.dateStr!);
                                    setSelectedRitualForModal(rit);
                                  }}
                                  className="w-full text-left px-1.5 py-0.5 rounded-md text-[10.5px] font-medium flex items-center gap-1.5 border border-slate-200/70 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer group/rit"
                                  title={`Clique para inspecionar pauta: ${rit.timeSlot} • ${rit.title}`}
                                >
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                                  <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                    {rit.timeSlot}
                                  </span>
                                  <span className="truncate text-slate-800 dark:text-slate-200 flex-1">
                                    {cleanTitle}
                                  </span>
                                  <Maximize2 className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover/rit:opacity-100 transition-opacity shrink-0" />
                                </button>
                              );
                            })}

                            {/* More rituals badge if > 2 */}
                            {visibleRituals.length > 2 && (
                              <span className="text-[9px] font-mono text-slate-400 font-semibold pl-1 block">
                                +{visibleRituals.length - 2} outros ritos
                              </span>
                            )}

                            {/* POPs Deliverables Chip */}
                            {typeFilter === 'blocks' ? (
                              visibleBlocks.slice(0, 2).map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBlockForModal(b);
                                  }}
                                  className="w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                                >
                                  <FileText className="w-2.5 h-2.5 shrink-0 opacity-70" />
                                  <span className="truncate">{b.title}</span>
                                </button>
                              ))
                            ) : (
                              visibleBlocks.length > 0 && (
                                <div className="mt-1 px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/80 text-[10px] font-mono text-slate-600 dark:text-slate-300 flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                                  <span className="flex items-center gap-1 font-semibold truncate">
                                    <FileText className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                                    <span>{visibleBlocks.length} POPs</span>
                                  </span>
                                  <span className="text-[9px] text-slate-400 shrink-0">rotina</span>
                                </div>
                              )
                            )}

                            {totalItems === 0 && (
                              <div className="h-full flex items-center justify-center pt-2">
                                <span className="text-[10px] text-slate-300 dark:text-slate-600 italic">
                                  Livre
                                </span>
                              </div>
                            )}
                          </>
                        )}

                      </div>

                      {/* Workload Density Bar at bottom */}
                      {!day.isWeekendDay && totalItems > 0 && (
                        <div className="mt-1 w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              densityScore > 60 
                                ? 'bg-purple-500' 
                                : densityScore > 30 
                                ? 'bg-blue-500' 
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${densityScore}%` }}
                          />
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* VIEW 2: WEEKLY INTERACTIVE TIMETABLE */}
          {/* --------------------------------------------------------------------- */}
          {viewMode === 'week' && (
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-atlas-500" />
                    Grade Semanal: {weekDays[0]?.dateFormatted} a {weekDays[6]?.dateFormatted}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cronograma executivo com horários deliberativos e entregas por dia
                  </p>
                </div>
              </div>

              {/* 7 Columns for the week */}
              <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                {weekDays.map((wDay) => {
                  const isToday = wDay.dateStr === new Date().toISOString().split('T')[0];
                  const isSelected = wDay.dateStr === inspectedDate;

                  return (
                    <div 
                      key={wDay.dateStr}
                      onClick={() => {
                        setInspectedDate(wDay.dateStr);
                        onSelectDate(wDay.dateStr);
                      }}
                      className={`p-3 min-h-[380px] flex flex-col justify-start transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-atlas-50/25 dark:bg-atlas-950/25 ring-2 ring-atlas-500 z-10' 
                          : isToday
                          ? 'bg-blue-50/20 dark:bg-blue-950/20'
                          : wDay.isWeekendDay
                          ? 'bg-slate-50/50 dark:bg-slate-900/30'
                          : 'bg-white dark:bg-[#0f172a] hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Column Header */}
                      <div className="pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          {wDay.dayName}
                        </span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                            isToday 
                              ? 'bg-blue-600 text-white shadow-xs' 
                              : isSelected 
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' 
                              : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {wDay.dayNumber}
                          </span>
                        </div>
                      </div>

                      {/* Events Stack in this Day */}
                      <div className="space-y-2 flex-1">
                        
                        {/* Ritos Header */}
                        {wDay.rituals.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                              Ritos ({wDay.rituals.length})
                            </span>
                            {wDay.rituals.map(rit => {
                              const colors = getRoleColor(rit.roleId);
                              const isCouncil = rit.type === 'board_council' || rit.title.toLowerCase().includes('conselho');
                              return (
                                <button 
                                  key={rit.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectedDate(wDay.dateStr);
                                    setSelectedRitualForModal(rit);
                                  }}
                                  className={`w-full text-left p-2 rounded-xl border text-xs ${colors.bg} ${colors.text} ${colors.border} shadow-2xs hover:shadow-md transition-all cursor-pointer`}
                                >
                                  <div className="flex items-center justify-between font-bold">
                                    <span className="flex items-center gap-1">
                                      {isCouncil ? <Landmark className="w-3 h-3 text-amber-500" /> : <Clock className="w-3 h-3" />}
                                      {rit.timeSlot}
                                    </span>
                                    <span className="text-[9px] font-mono px-1 rounded bg-black/10 dark:bg-white/10">
                                      {rit.code || 'RIT'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] font-semibold mt-1 leading-snug truncate">
                                    {rit.title}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Entregas POPs Header */}
                        {wDay.blocks.length > 0 && typeFilter !== 'rituals' && (
                          <div className="space-y-1.5 pt-2">
                            <span className="text-[9px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                              Entregas ({wDay.blocks.length})
                            </span>
                            {wDay.blocks.slice(0, 4).map(b => {
                              const colors = getRoleColor(b.roleId);
                              return (
                                <div 
                                  key={b.id}
                                  className={`p-1.5 rounded-lg border text-[11px] ${colors.bg} ${colors.text} ${colors.border}`}
                                >
                                  <span className="font-mono text-[9px] block text-slate-400">{b.timeWindow}</span>
                                  <p className="font-medium truncate">{b.title}</p>
                                </div>
                              );
                            })}
                            {wDay.blocks.length > 4 && (
                              <span className="text-[10px] font-mono text-slate-400 block text-center">
                                +{wDay.blocks.length - 4} entregas
                              </span>
                            )}
                          </div>
                        )}

                        {wDay.rituals.length === 0 && wDay.blocks.length === 0 && (
                          <div className="text-center py-8 text-slate-300 dark:text-slate-600 text-xs italic">
                            {wDay.isWeekendDay ? 'Fim de semana' : 'Sem agendamentos'}
                          </div>
                        )}

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* VIEW 3: EXECUTIVE DAY FEED / CADÊNCIA DO DIA */}
          {/* --------------------------------------------------------------------- */}
          {viewMode === 'day' && (
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              
              {/* Day Feed Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800">
                    Cadência Executiva do Dia
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    {inspectedData.fullDateDisplay}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {inspectedData.rituals.length} ritos deliberativos • {inspectedData.blocks.length} entregas de rotina
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDate(inspectedDate);
                      onGoToDispatch();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Despachar Agora</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day Feed Timeline */}
              {inspectedData.isWeekendDay ? (
                <div className="py-12 text-center max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                    <Coffee className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      Fim de Semana Livre
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Não há ritos de governança corporativa agendados para este dia.
                    </p>
                  </div>
                  {inspectedData.nextBusinessDayStr && (
                    <button
                      type="button"
                      onClick={() => {
                        setInspectedDate(inspectedData.nextBusinessDayStr!);
                        onSelectDate(inspectedData.nextBusinessDayStr!);
                      }}
                      className="px-4 py-2 rounded-xl bg-atlas-600 hover:bg-atlas-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <span>Ir para Segunda-feira ({inspectedData.nextBusinessDayFormatted})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {inspectedData.rituals.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                      Nenhum rito corporativo marcado para este dia.
                    </div>
                  ) : (
                    <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {inspectedData.rituals.map(rit => {
                        const colors = getRoleColor(rit.roleId);
                        const isCouncil = rit.type === 'board_council' || rit.title.toLowerCase().includes('conselho');
                        const ritualChecks = checkedPautaItems[rit.id] || {};

                        return (
                          <div key={rit.id} className="relative pl-12">
                            {/* Glowing Timeline Node */}
                            <div className="absolute left-3.5 top-3 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-atlas-500 shadow-sm" />

                            <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs space-y-4 hover:border-slate-300 transition-all">
                              
                              {/* Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-atlas-500" />
                                    {rit.timeSlot}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400">
                                    ({rit.durationMinutes} min)
                                  </span>
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                                    {rit.code || 'RIT'}
                                  </span>
                                  {isCouncil && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                      <Landmark className="w-3 h-3" />
                                      Conselho
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setSelectedRitualForModal(rit)}
                                  className="text-xs font-semibold text-atlas-600 dark:text-atlas-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                                >
                                  <span>Inspecionar Pauta Completa</span>
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Title */}
                              <div>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                  {rit.title}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  {formatRitualFrequency(rit)} • Rito obrigatório de cadência executiva
                                </p>
                              </div>

                              {/* Interactive Pauta Checklist Preview */}
                              {rit.agendaItems && rit.agendaItems.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                                    Pauta Deliberativa ({rit.agendaItems.length} tópicos):
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {rit.agendaItems.map((item, idx) => {
                                      const isChecked = !!ritualChecks[idx];
                                      return (
                                        <div
                                          key={idx}
                                          onClick={() => togglePautaItem(rit.id, idx)}
                                          className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                                            isChecked 
                                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 line-through opacity-75' 
                                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                          }`}
                                        >
                                          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                                            isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                                          }`}>
                                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                          </div>
                                          <span className="leading-snug">{item}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Dispatch CTA */}
                              <div className="pt-2 flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectDate(inspectedDate);
                                    onGoToDispatch();
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span>Despachar este Rito</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Legend Strip */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-atlas-500" />
              <span>Cadeiras & Diretorias:</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {roles.map(r => {
                const colors = getRoleColor(r.id);
                return (
                  <div key={r.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {r.code || 'CAD'}:
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {r.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* --------------------------------------------------------------------- */}
        {/* 4. SIDEBAR INSPECTOR PANEL (Sticky Right Column) */}
        {/* --------------------------------------------------------------------- */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs sticky top-4 space-y-4">
            
            {/* Header of Inspector */}
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-atlas-50 dark:bg-atlas-950/80 text-atlas-700 dark:text-atlas-300 border border-atlas-200/80 dark:border-atlas-800">
                  Data Selecionada
                </span>
                {inspectedData.isWeekendDay ? (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800">
                    Fim de Semana
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                    Dia Útil
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {inspectedData.dateFormatted}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {inspectedData.fullDateDisplay}
                </p>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
                <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block mb-0.5">
                  Ritos
                </span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {inspectedData.rituals.length}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
                <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block mb-0.5">
                  Entregas
                </span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {inspectedData.blocks.length}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
                <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block mb-0.5">
                  Pauta
                </span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {inspectedData.totalTopics}
                </span>
              </div>
            </div>

            {/* Quick Actions to jump to Dispatch or Timeline */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onSelectDate(inspectedDate);
                  onGoToDispatch();
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                title="Abrir Mesa de Despacho com esta data"
              >
                <span>Despachar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectDate(inspectedDate);
                  onGoToTimeline();
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Abrir Linha do Tempo com esta data"
              >
                <span>Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Details Section */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              
              {/* Weekend State Presentation */}
              {inspectedData.isWeekendDay ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-2xs">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Fim de Semana Livre
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Não há ritos de governança ou entregas operacionais obrigatórias aos fins de semana.
                    </p>
                  </div>
                  {inspectedData.nextBusinessDayStr && (
                    <button
                      type="button"
                      onClick={() => {
                        setInspectedDate(inspectedData.nextBusinessDayStr!);
                        onSelectDate(inspectedData.nextBusinessDayStr!);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Ir para Segunda-feira ({inspectedData.nextBusinessDayFormatted})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Rituals of the Inspected Day */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-atlas-500" />
                        Ritos Executivos
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-slate-400">
                        {inspectedData.rituals.length}
                      </span>
                    </h4>
                    
                    {inspectedData.rituals.length > 0 ? (
                      <div className="space-y-2">
                        {inspectedData.rituals.map(rit => {
                          const colors = getRoleColor(rit.roleId);
                          const isCouncil = rit.type === 'board_council' || rit.title.toLowerCase().includes('conselho');
                          return (
                            <div 
                              key={rit.id} 
                              onClick={() => setSelectedRitualForModal(rit)}
                              className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 text-xs space-y-1.5 shadow-2xs hover:border-slate-400 dark:hover:border-slate-700 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                  {isCouncil ? <Landmark className="w-3.5 h-3.5 text-amber-500" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                                  {rit.timeSlot}
                                </span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                                  {rit.code || 'RIT'}
                                </span>
                              </div>

                              <h5 className="font-bold text-slate-900 dark:text-white text-xs leading-snug group-hover:text-atlas-600 dark:group-hover:text-atlas-400 transition-colors">
                                {rit.title}
                              </h5>

                              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                <span>{rit.agendaItems.length} tópicos na pauta</span>
                                <span className="text-atlas-600 dark:text-atlas-400 text-[10px] font-semibold flex items-center gap-0.5">
                                  Ver pauta <ArrowRight className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                        Nenhum rito executivo agendado para esta data.
                      </div>
                    )}
                  </div>

                  {/* Deliverables / POPs of the Inspected Day */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        Entregas POPs
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-slate-400">
                        {inspectedData.blocks.length}
                      </span>
                    </h4>

                    {inspectedData.blocks.length > 0 ? (
                      <div className="space-y-1.5">
                        {inspectedData.blocks.slice(0, 6).map(b => (
                          <div 
                            key={b.id} 
                            onClick={() => setSelectedBlockForModal(b)}
                            className="p-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-0.5">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">{b.code || 'POP'}</span>
                              <span>{b.timeWindow}</span>
                            </div>
                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                              {b.title}
                            </p>
                          </div>
                        ))}
                        {inspectedData.blocks.length > 6 && (
                          <p className="text-[11px] text-slate-400 font-mono text-center pt-1">
                            +{inspectedData.blocks.length - 6} outras entregas cadastradas
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                        Sem entregas operacionais para a data.
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE RITUAL DETAIL MODAL (Glassmorphic Popover) */}
      {/* ========================================================================= */}
      {selectedRitualForModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedRitualForModal(null)}
        >
          <div 
            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-atlas-500 via-blue-500 to-indigo-500" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800">
                    {selectedRitualForModal.code || 'RIT-01'}
                  </span>
                  {selectedRitualForModal.type === 'board_council' ? (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                      <Landmark className="w-3 h-3" />
                      Sessão de Conselho
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Cadência Operacional
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-1">
                  {selectedRitualForModal.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRitualForModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta Tags Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-atlas-500 shrink-0" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Horário & Duração</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedRitualForModal.timeSlot} ({selectedRitualForModal.durationMinutes} min)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                <CalendarCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Frequência</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatRitualFrequency(selectedRitualForModal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Agenda Items Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Pauta Deliberativa ({selectedRitualForModal.agendaItems?.length || 0} tópicos)
                </span>
                <span className="text-[10px] text-slate-400">
                  Clique para marcar como visto
                </span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {selectedRitualForModal.agendaItems && selectedRitualForModal.agendaItems.map((item, idx) => {
                  const isChecked = !!(checkedPautaItems[selectedRitualForModal.id]?.[idx]);
                  return (
                    <div
                      key={idx}
                      onClick={() => togglePautaItem(selectedRitualForModal.id, idx)}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 line-through opacity-75' 
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="leading-snug">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onSelectDate(inspectedDate);
                  setSelectedRitualForModal(null);
                  onGoToDispatch();
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Despachar este Rito</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectDate(inspectedDate);
                  setSelectedRitualForModal(null);
                  onGoToTimeline();
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ver na Linha do Tempo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE POP BLOCK DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedBlockForModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedBlockForModal(null)}
        >
          <div 
            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {selectedBlockForModal.code || 'POP'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 leading-tight">
                  {selectedBlockForModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBlockForModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="font-mono text-slate-400">Janela de Horário:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBlockForModal.timeWindow}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="font-mono text-slate-400">Periodicidade:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBlockForModal.frequency}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBlockForModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
