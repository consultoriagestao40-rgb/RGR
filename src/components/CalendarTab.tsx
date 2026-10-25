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
  Coffee
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
  // Calendar View Mode: 'month' (Monthly Grid) or 'week' (Weekly Schedule Planner)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Navigation state (month/year or active date cursor)
  const [currentYear, setCurrentYear] = useState<number>(() => {
    return Number(selectedDate.split('-')[0]) || 2026;
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    return Number(selectedDate.split('-')[1]) || 10; // 1-12
  });

  // Selected Day in Calendar to inspect in sidebar drawer
  const [inspectedDate, setInspectedDate] = useState<string>(selectedDate);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('all'); // 'all' or roleId
  const [typeFilter, setTypeFilter] = useState<'all' | 'rituals' | 'blocks'>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  // Filtered Roles
  const activeRoles = useMemo(() => {
    if (roleFilter === 'all') return roles;
    return roles.filter(r => r.id === roleFilter);
  }, [roles, roleFilter]);

  // Color mapper by role
  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    const code = role?.code || '';
    if (code.includes('FIN')) {
      return {
        bg: 'bg-blue-50/80 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200/80 dark:border-blue-800/80',
        dot: 'bg-blue-500'
      };
    }
    if (code.includes('DP') || code.includes('RH')) {
      return {
        bg: 'bg-amber-50/80 dark:bg-amber-950/40',
        text: 'text-amber-750 dark:text-amber-300',
        border: 'border-amber-200/80 dark:border-amber-800/80',
        dot: 'bg-amber-500'
      };
    }
    if (code.includes('OPS') || code.includes('COO')) {
      return {
        bg: 'bg-purple-50/80 dark:bg-purple-950/40',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200/80 dark:border-purple-800/80',
        dot: 'bg-purple-500'
      };
    }
    if (code.includes('OPE') || code.includes('DIR') || code.includes('HEAD')) {
      return {
        bg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200/80 dark:border-emerald-800/80',
        dot: 'bg-emerald-500'
      };
    }
    return {
      bg: 'bg-slate-50 dark:bg-slate-800/80',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200/80 dark:border-slate-700/80',
      dot: 'bg-slate-400'
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

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Helper to generate monthly grid matrix (including leading empty days)
  const monthGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sun, 1 is Mon...

    const days: { 
      dayNumber: number | null; 
      dateStr: string | null; 
      isWeekendDay: boolean; 
      rituals: DailyRitual[]; 
      blocks: RoutineBlock[];
      hasMonthlySpecial: boolean;
      hasWeeklySpecial: boolean;
    }[] = [];

    // Empty padding slots for days before the 1st of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        dayNumber: null,
        dateStr: null,
        isWeekendDay: false,
        rituals: [],
        blocks: [],
        hasMonthlySpecial: false,
        hasWeeklySpecial: false
      });
    }

    // Days of the month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(currentMonth).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      const isWeekendDay = isWeekend(dateStr);

      // Filter rituals scheduled for this date and matching role/frequency filters
      const dayRituals = rituals.filter(r => {
        if (roleFilter !== 'all' && r.roleId !== roleFilter) return false;
        if (frequencyFilter !== 'all' && r.frequency !== frequencyFilter) return false;
        return isRitualScheduledForDate(r, dateStr);
      });

      // Filter blocks scheduled for this date and matching role/frequency filters
      const dayBlocks = blocks.filter(b => {
        if (roleFilter !== 'all' && b.roleId !== roleFilter) return false;
        if (frequencyFilter !== 'all' && b.frequency !== frequencyFilter) return false;
        return isBlockScheduledForDate(b, dateStr);
      });

      const hasMonthlySpecial = dayRituals.some(r => r.frequency === 'monthly') || dayBlocks.some(b => b.frequency === 'monthly');
      const hasWeeklySpecial = dayRituals.some(r => r.frequency === 'weekly') || dayBlocks.some(b => b.frequency === 'weekly');

      days.push({
        dayNumber: day,
        dateStr,
        isWeekendDay,
        rituals: dayRituals,
        blocks: dayBlocks,
        hasMonthlySpecial,
        hasWeeklySpecial
      });
    }

    return days;
  }, [currentYear, currentMonth, rituals, blocks, roleFilter, frequencyFilter]);

  // Compute Weekly Grid for the inspected/selected date
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
        return isRitualScheduledForDate(r, dateStr);
      });

      const dayBlocks = blocks.filter(b => {
        if (roleFilter !== 'all' && b.roleId !== roleFilter) return false;
        if (frequencyFilter !== 'all' && b.frequency !== frequencyFilter) return false;
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
  }, [inspectedDate, rituals, blocks, roleFilter, frequencyFilter]);

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

  // Data for the Inspected Date details
  const inspectedData = useMemo(() => {
    const isWeekendDay = isWeekend(inspectedDate);
    const dayRituals = rituals.filter(r => {
      if (roleFilter !== 'all' && r.roleId !== roleFilter) return false;
      return isRitualScheduledForDate(r, inspectedDate);
    });
    const dayBlocks = blocks.filter(b => {
      if (roleFilter !== 'all' && b.roleId !== roleFilter) return false;
      return isBlockScheduledForDate(b, inspectedDate);
    });

    const nextBusinessDayStr = isWeekendDay ? getNextBusinessDay(inspectedDate) : null;
    const nextBusinessDayFormatted = nextBusinessDayStr ? formatDateBR(nextBusinessDayStr) : null;

    return {
      dateStr: inspectedDate,
      dateFormatted: formatDateBR(inspectedDate),
      fullDateDisplay: getFullDateDisplay(inspectedDate),
      isWeekendDay,
      nextBusinessDayStr,
      nextBusinessDayFormatted,
      rituals: dayRituals,
      blocks: dayBlocks
    };
  }, [inspectedDate, rituals, blocks, roleFilter]);

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
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Top Calendar Executive Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-atlas-50 dark:bg-atlas-950/60 text-atlas-700 dark:text-atlas-300 border border-atlas-200/80 dark:border-atlas-800 flex items-center gap-1.5 shadow-2xs">
                <CalendarDays className="w-3.5 h-3.5 text-atlas-600 dark:text-atlas-400" />
                Governança RGR • Agenda Executiva
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                {viewMode === 'month' ? 'Visão Mensal Consolidada' : 'Grade Semanal Detalhada'}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Agenda de Ritos & Calendário Operacional
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              Cadência integrada de <strong>Ritos de Despacho</strong>, <strong>Comitês Deliberativos</strong> e <strong>Entregas de Rotina (POPs)</strong> de todas as diretorias.
            </p>
          </div>

          {/* Navigation Month/Week & View Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
            {/* View Mode Buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Mensal</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Semanal</span>
              </button>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 px-2.5 min-w-[130px] text-center font-mono">
                {monthNames[currentMonth - 1]} / {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-atlas-600 hover:bg-atlas-700 text-white shadow-xs transition-colors cursor-pointer ml-0.5"
              >
                Hoje
              </button>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Chair Filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Cadeira:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="all" className="dark:bg-slate-900">Visão Geral ({roles.length} Cadeiras)</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id} className="dark:bg-slate-900">
                    {r.code || 'CAD'}: {r.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Tipo:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="all" className="dark:bg-slate-900">Ritos & Entregáveis</option>
                <option value="rituals" className="dark:bg-slate-900">Apenas Ritos Executivos</option>
                <option value="blocks" className="dark:bg-slate-900">Apenas Entregáveis (POPs)</option>
              </select>
            </div>

            {/* Periodicidade Filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Frequência:</span>
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

          {/* Quick Metrics in Header */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white font-bold">{summaryCounts.monthlyRitualsCount}</strong> ritos
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white font-bold">{summaryCounts.monthlyBlocksCount}</strong> entregas POP
            </span>
          </div>

        </div>

      </div>

      {/* Main Calendar View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Grid Container (8 or 9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          {/* ========================================================================= */}
          {/* VIEW MODE 1: MONTHLY GRID */}
          {/* ========================================================================= */}
          {viewMode === 'month' && (
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-[#090d16] text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2.5 tracking-wider uppercase">
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
                      <div key={idx} className="min-h-[118px] p-2 bg-slate-50/30 dark:bg-slate-900/10" />
                    );
                  }

                  const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                  const isSelected = day.dateStr === inspectedDate;
                  const isSystemActiveDate = day.dateStr === selectedDate;

                  // Visible items respecting typeFilter
                  const visibleRituals = typeFilter === 'blocks' ? [] : day.rituals;
                  const visibleBlocks = typeFilter === 'rituals' ? [] : day.blocks;
                  const totalItems = visibleRituals.length + visibleBlocks.length;

                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => {
                        setInspectedDate(day.dateStr!);
                        onSelectDate(day.dateStr!);
                      }}
                      className={`min-h-[120px] p-2 flex flex-col justify-between transition-all cursor-pointer relative group ${
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
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-transform group-hover:scale-105 ${
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
                          {day.hasMonthlySpecial && (
                            <span 
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs" 
                              title="Contém marco mensal crítico (tributos, ponto, salários ou DRE)"
                            >
                              ★ Mensal
                            </span>
                          )}
                          {day.hasWeeklySpecial && !day.hasMonthlySpecial && (
                            <span 
                              className="w-2 h-2 rounded-full bg-purple-500 shrink-0" 
                              title="Contém rito semanal de conselho ou comitê" 
                            />
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
                          <div className="h-full flex items-center justify-center py-3 opacity-40 group-hover:opacity-75 transition-opacity">
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                              <Coffee className="w-3 h-3" />
                              <span>Pausa</span>
                            </span>
                          </div>
                        ) : (
                          <>
                            {/* Rituals List: Clean presentation */}
                            {visibleRituals.slice(0, 2).map((rit) => {
                              const colors = getRoleColor(rit.roleId);
                              const isCouncil = rit.type === 'board_council' || rit.title.toLowerCase().includes('conselho');
                              const cleanTitle = rit.title
                                .replace(/^(Rito de\s+|Mesa de\s+|Sessão Deliberativa do\s+|Comitê Mensal de\s+)/i, '')
                                .trim();

                              return (
                                <div
                                  key={rit.id}
                                  className="px-1.5 py-0.5 rounded-md text-[10.5px] font-medium flex items-center gap-1.5 border border-slate-200/70 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-2xs hover:border-slate-300 transition-colors"
                                  title={`${rit.timeSlot} • ${rit.title}`}
                                >
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                                  <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                    {rit.timeSlot}
                                  </span>
                                  <span className="truncate text-slate-800 dark:text-slate-200">
                                    {cleanTitle}
                                  </span>
                                  {isCouncil && (
                                    <Landmark className="w-2.5 h-2.5 shrink-0 text-amber-500 ml-auto" />
                                  )}
                                </div>
                              );
                            })}

                            {/* More rituals badge if > 2 */}
                            {visibleRituals.length > 2 && (
                              <span className="text-[9px] font-mono text-slate-400 font-semibold pl-1 block">
                                +{visibleRituals.length - 2} outro{visibleRituals.length - 2 > 1 ? 's' : ''} rito{visibleRituals.length - 2 > 1 ? 's' : ''}
                              </span>
                            )}

                            {/* POPs Deliverables: Clean summary badge instead of messy broken list */}
                            {typeFilter === 'blocks' ? (
                              visibleBlocks.slice(0, 3).map((b) => {
                                const colors = getRoleColor(b.roleId);
                                return (
                                  <div
                                    key={b.id}
                                    className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium flex items-center gap-1 border ${colors.bg} ${colors.text} ${colors.border}`}
                                    title={`${b.timeWindow} • ${b.title}`}
                                  >
                                    <FileText className="w-2.5 h-2.5 shrink-0 opacity-70" />
                                    <span className="truncate">{b.title}</span>
                                  </div>
                                );
                              })
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

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW MODE 2: WEEKLY SCHEDULE PLANNER */}
          {/* ========================================================================= */}
          {viewMode === 'week' && (
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-atlas-500" />
                    Grade da Semana: {weekDays[0]?.dateFormatted} a {weekDays[6]?.dateFormatted}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cronograma executivo detalhado dia a dia com horários deliberativos e entregas operacionais
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
                      className={`p-3 min-h-[350px] flex flex-col justify-start transition-colors cursor-pointer ${
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
                                <div 
                                  key={rit.id}
                                  className={`p-2 rounded-lg border text-xs ${colors.bg} ${colors.text} ${colors.border}`}
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
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Entregas POPs Header */}
                        {wDay.blocks.length > 0 && typeFilter !== 'rituals' && (
                          <div className="space-y-1.5 pt-2">
                            <span className="text-[9px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                              Entregáveis ({wDay.blocks.length})
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
                                +{wDay.blocks.length - 4} entregáveis
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

          {/* Legend Strip */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-atlas-500" />
              <span>Cadeiras & Diretorias:</span>
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {roles.map(r => {
                const colors = getRoleColor(r.id);
                return (
                  <div key={r.id} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
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

        {/* Sidebar Panel: Details of Inspected Date */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs sticky top-4 space-y-4">
            
            {/* Header of Inspector */}
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-atlas-50 dark:bg-atlas-950/80 text-atlas-700 dark:text-atlas-300 border border-atlas-200/80 dark:border-atlas-800">
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
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-0.5">
                  Ritos
                </span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {inspectedData.rituals.length}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-0.5">
                  Entregas POP
                </span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {inspectedData.blocks.length}
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
                className="px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
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
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                              className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 text-xs space-y-1.5 shadow-2xs"
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

                              <h5 className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                                {rit.title}
                              </h5>

                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {rit.agendaItems.length} tópicos na pauta deliberativa
                              </p>
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
                            className="p-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs shadow-2xs"
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

    </div>
  );
};
