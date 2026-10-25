'use client';

import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Building2, 
  Users, 
  ChevronRight, 
  Sparkles, 
  Filter, 
  Info, 
  Target, 
  FileText,
  X,
  ExternalLink,
  Flame,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  OperationalRole, 
  RoutineBlock, 
  DailyRitual, 
  RoutineExecution, 
  GovernanceMinute, 
  SystemUser,
  RoleLeaderboardItem,
  WeeklyPerformanceData,
  MonthlyPerformanceData,
  AnnualEvolutionData,
  MonthlyMilestone
} from '@/lib/types';
import { 
  computeLeaderboard, 
  computeWeeklyPerformance, 
  computeMonthlyPerformance, 
  computeAnnualEvolution 
} from '@/lib/performance-service';
import { formatDateBR } from '@/lib/frequency';

interface PerformanceRankingTabProps {
  roles: OperationalRole[];
  blocks: RoutineBlock[];
  rituals: DailyRitual[];
  executions: RoutineExecution[];
  dispatchNotes?: { [key: string]: any };
  minutes?: GovernanceMinute[];
  users?: SystemUser[];
  selectedDate: string;
  onSelectRole?: (roleId: string) => void;
  onGoToTimeline?: (roleId?: string) => void;
  onGoToDispatch?: () => void;
  onGoToActions?: () => void;
}

export const PerformanceRankingTab: React.FC<PerformanceRankingTabProps> = ({
  roles,
  blocks,
  rituals,
  executions,
  dispatchNotes = {},
  minutes = [],
  users = [],
  selectedDate,
  onSelectRole,
  onGoToTimeline,
  onGoToDispatch,
  onGoToActions
}) => {
  // Navigation between the 4 main performance views
  const [activeSubView, setActiveSubView] = useState<'ranking' | 'weekly' | 'monthly' | 'annual'>('ranking');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedInspectRole, setSelectedInspectRole] = useState<RoleLeaderboardItem | null>(null);

  // Compute all metrics reactively based on active state
  const leaderboard = useMemo(() => {
    return computeLeaderboard(roles, blocks, rituals, executions, dispatchNotes, minutes, users, selectedDate);
  }, [roles, blocks, rituals, executions, dispatchNotes, minutes, users, selectedDate]);

  const weeklyData: WeeklyPerformanceData = useMemo(() => {
    return computeWeeklyPerformance(roles, leaderboard, selectedDate);
  }, [roles, leaderboard, selectedDate]);

  const monthlyData: MonthlyPerformanceData = useMemo(() => {
    return computeMonthlyPerformance(roles, leaderboard, selectedDate);
  }, [roles, leaderboard, selectedDate]);

  const annualData: AnnualEvolutionData = useMemo(() => {
    return computeAnnualEvolution(roles, leaderboard, selectedDate);
  }, [roles, leaderboard, selectedDate]);

  // Filtered leaderboard if a specific role is chosen
  const filteredLeaderboard = useMemo(() => {
    if (roleFilter === 'all') return leaderboard;
    return leaderboard.filter(item => item.roleId === roleFilter);
  }, [leaderboard, roleFilter]);

  // Overall corporate KPIs
  const corporateAverage = useMemo(() => {
    if (leaderboard.length === 0) return 0;
    const sum = leaderboard.reduce((acc, curr) => acc + curr.executionRate, 0);
    return Math.round(sum / leaderboard.length);
  }, [leaderboard]);

  const topPerformer = leaderboard[0];
  const totalRitualsDone = leaderboard.reduce((acc, curr) => acc + curr.ritualsCompleted, 0);
  const totalRitualsTarget = leaderboard.reduce((acc, curr) => acc + curr.ritualsScheduled, 0);
  const overallPunctuality = Math.round(leaderboard.reduce((acc, curr) => acc + curr.punctualityRate, 0) / (leaderboard.length || 1));

  // Helper for tier badges
  const getTierBadge = (tier: RoleLeaderboardItem['tier']) => {
    switch (tier) {
      case 'EXCELLENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Diamante (≥ 95%)
          </span>
        );
      case 'STABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Ouro (85-94%)
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Atenção (70-84%)
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Crítico (&lt; 70%)
          </span>
        );
    }
  };

  // Color for progress bars
  const getProgressColor = (rate: number) => {
    if (rate >= 95) return 'from-emerald-500 to-teal-500';
    if (rate >= 85) return 'from-blue-500 to-emerald-500';
    if (rate >= 70) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Top Executive Header */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-atlas-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-atlas-600 dark:text-atlas-400" />
                Governança RGR • Performance & Ranking
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Data Ativa: {formatDateBR(selectedDate)}
              </span>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Desempenho & Ranking por Cadeira
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              O cumprimento rigoroso dos <strong>Ritos de Despacho</strong> e dos <strong>Procedimentos Operacionais Padrão (POPs)</strong> gera o percentual de conformidade de cada cadeira. Acompanhe a liderança operacional, a pontualidade e o fechamento dos marcos mensais.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-3"
              >
                <option value="all" className="dark:bg-slate-900">Todas as Cadeiras ({roles.length})</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id} className="dark:bg-slate-900">
                    {r.code || 'CAD'}: {r.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Ranking, Weekly, Monthly, Annual) */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0c121e] rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setActiveSubView('ranking')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubView === 'ranking'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Ranking Geral (Leaderboard)</span>
            </button>

            <button
              onClick={() => setActiveSubView('weekly')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubView === 'weekly'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Visão Semanal (Dias Úteis)</span>
            </button>

            <button
              onClick={() => setActiveSubView('monthly')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubView === 'monthly'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Visão Mensal (Agendas Críticas)</span>
            </button>

            <button
              onClick={() => setActiveSubView('annual')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubView === 'annual'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
              <span>Evolução Anual (12 Meses)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Meta Corporativa: <strong className="text-slate-800 dark:text-slate-200">95% de Aderência</strong>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Corporate Average */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Aderência Corporativa Geral</span>
            <Target className="w-4 h-4 text-atlas-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {corporateAverage}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +2.4% vs mês ant.
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-atlas-500 to-emerald-500 rounded-full" 
              style={{ width: `${corporateAverage}%` }} 
            />
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
            Média ponderada de todas as {roles.length} cadeiras ativas
          </span>
        </div>

        {/* KPI 2: Chair in 1st Place */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Cadeira Líder (1º Lugar)</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {topPerformer?.executionRate || 96}%
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {topPerformer?.roleCode || 'CAD-FIN-01'}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
            {topPerformer?.roleTitle || 'Controladoria & Finanças'}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
            {topPerformer?.assigneeName}
          </span>
        </div>

        {/* KPI 3: Total Rituals Completed */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Ritos Cumpridos no Período</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {totalRitualsDone}
            </span>
            <span className="text-xs text-slate-400">/ {totalRitualsTarget} agendados</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${Math.round((totalRitualsDone / Math.max(1, totalRitualsTarget)) * 100)}%` }} 
            />
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
            Cadência deliberada e registrada em ata/checklist
          </span>
        </div>

        {/* KPI 4: Punctuality */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Índice de Pontualidade</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {overallPunctuality}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">dentro da janela</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full" 
              style={{ width: `${overallPunctuality}%` }} 
            />
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
            Entregáveis e ritos sem atraso no horário estabelecido
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: RANKING GERAL (LEADERBOARD) */}
      {/* ========================================================================= */}
      {activeSubView === 'ranking' && (
        <div className="space-y-6">
          
          {/* Executive Podium Top 3 */}
          {leaderboard.length >= 3 && roleFilter === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* 2nd Place */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-5 shadow-xs flex flex-col justify-between order-2 md:order-1 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm flex items-center justify-center font-mono">
                    2º
                  </span>
                  <span className="text-xl">🥈</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    {leaderboard[1].roleCode}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                    {leaderboard[1].roleTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {leaderboard[1].assigneeName}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Cumprimento</span>
                    <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{leaderboard[1].executionRate}%</p>
                  </div>
                  {getTierBadge(leaderboard[1].tier)}
                </div>
              </div>

              {/* 1st Place - Champion */}
              <div className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white dark:to-[#111827] border-2 border-amber-400 dark:border-amber-600/80 rounded-2xl p-6 shadow-md flex flex-col justify-between order-1 md:order-2 relative transform md:-translate-y-2">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" />
                  Cadeira Campeã RGR
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-9 h-9 rounded-full bg-amber-500 text-white font-black text-base flex items-center justify-center font-mono shadow-xs">
                    1º
                  </span>
                  <span className="text-3xl">🥇</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                    {leaderboard[0].roleCode}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1.5 truncate">
                    {leaderboard[0].roleTitle}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                    {leaderboard[0].assigneeName}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-amber-200/60 dark:border-amber-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold">Aderência à Rotina</span>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{leaderboard[0].executionRate}%</p>
                  </div>
                  {getTierBadge(leaderboard[0].tier)}
                </div>
              </div>

              {/* 3rd Place */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-5 shadow-xs flex flex-col justify-between order-3 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full bg-amber-800/20 text-amber-900 dark:text-amber-400 font-black text-sm flex items-center justify-center font-mono">
                    3º
                  </span>
                  <span className="text-xl">🥉</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    {leaderboard[2].roleCode}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                    {leaderboard[2].roleTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {leaderboard[2].assigneeName}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Cumprimento</span>
                    <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{leaderboard[2].executionRate}%</p>
                  </div>
                  {getTierBadge(leaderboard[2].tier)}
                </div>
              </div>

            </div>
          )}

          {/* Full Table of Ranking */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tabela Oficial de Classificação por Cadeira
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pontuação consolidada cruzando Ritos cumpridos, POPs executados e pontualidade
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {filteredLeaderboard.length} cadeiras listadas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#0c121e] text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3 px-4 w-14 text-center">Pos.</th>
                    <th className="py-3 px-4 min-w-[220px]">Cadeira Operacional</th>
                    <th className="py-3 px-4 min-w-[150px]">Titular Responsável</th>
                    <th className="py-3 px-4 text-center">Ritos (% Exec)</th>
                    <th className="py-3 px-4 text-center">Entregas POP (% Exec)</th>
                    <th className="py-3 px-4 text-center">Pontualidade</th>
                    <th className="py-3 px-4 min-w-[160px]">Índice Global</th>
                    <th className="py-3 px-4 text-center">Nível Governança</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeaderboard.map((item) => {
                    const isTop1 = item.rank === 1;
                    return (
                      <tr 
                        key={item.roleId} 
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          isTop1 ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        {/* Position */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 font-mono font-bold text-sm">
                            {item.rank === 1 ? (
                              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">1</span>
                            ) : item.rank === 2 ? (
                              <span className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center text-xs">2</span>
                            ) : item.rank === 3 ? (
                              <span className="w-6 h-6 rounded-full bg-amber-700/40 text-amber-900 dark:text-amber-300 flex items-center justify-center text-xs">3</span>
                            ) : (
                              <span className="text-slate-500">{item.rank}</span>
                            )}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-[10px] text-slate-700 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-slate-700">
                              {item.roleCode.split('-')[1] || 'CAD'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{item.roleTitle}</span>
                                <span className="text-[10px] font-mono text-slate-400">({item.roleCode})</span>
                              </div>
                              <span className="text-[11px] text-slate-400">{item.department}</span>
                            </div>
                          </div>
                        </td>

                        {/* Assignee */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center">
                              {item.assigneeName.substring(0, 2).toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                              {item.assigneeName}
                            </span>
                          </div>
                        </td>

                        {/* Rituals Rate */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {item.ritualsRate}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.ritualsCompleted}/{item.ritualsScheduled} ritos
                            </span>
                          </div>
                        </td>

                        {/* Blocks Rate */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {item.blocksRate}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.blocksCompleted}/{item.blocksScheduled} POPs
                            </span>
                          </div>
                        </td>

                        {/* Punctuality */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-mono font-semibold px-2 py-0.5 rounded-md ${
                            item.punctualityRate >= 95 
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : item.punctualityRate >= 85
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}>
                            {item.punctualityRate}%
                          </span>
                        </td>

                        {/* Execution Rate Progress */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {item.executionRate}%
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono flex items-center">
                                {item.trend === 'up' ? (
                                  <span className="text-emerald-600 flex items-center"><ArrowUpRight className="w-3 h-3" />+{item.trendDelta}%</span>
                                ) : item.trend === 'down' ? (
                                  <span className="text-rose-600 flex items-center"><ArrowDownRight className="w-3 h-3" />-{item.trendDelta}%</span>
                                ) : (
                                  <span className="text-slate-400 flex items-center"><Minus className="w-3 h-3" />0.0%</span>
                                )}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${getProgressColor(item.executionRate)} rounded-full`}
                                style={{ width: `${item.executionRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Tier */}
                        <td className="py-3.5 px-4 text-center">
                          {getTierBadge(item.tier)}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedInspectRole(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Ver Raio-X Detalhado desta cadeira"
                          >
                            <span>Raio-X</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: VISÃO SEMANAL (DIAS ÚTEIS) */}
      {/* ========================================================================= */}
      {activeSubView === 'weekly' && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {weeklyData.weekLabel}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Desempenho diário de Segunda a Sexta-feira em conformidade com o protocolo RGR
                </p>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Média Semanal:</span>
                <span className="font-mono text-sm font-extrabold text-blue-800 dark:text-blue-200">
                  {weeklyData.averageRate}%
                </span>
              </div>
            </div>

            {/* Daily Cards Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 mb-8">
              {weeklyData.days.map((day, idx) => (
                <div 
                  key={day.date}
                  className="bg-slate-50/80 dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-slate-400 uppercase">
                        {day.dayShort}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {day.dateFormatted.slice(0, 5)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {day.dayName}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-[11px] text-slate-500">Taxa do Dia:</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                        {day.executionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getProgressColor(day.executionRate)} rounded-full`}
                        style={{ width: `${day.executionRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                      <span>{day.ritualsCompleted} ritos</span>
                      <span>{day.blocksCompleted} POPs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chair Breakdown by Day */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                Matriz de Desempenho por Cadeira ao Longo dos Dias Úteis
              </h3>
              <div className="space-y-3">
                {weeklyData.roleBreakdown.map((r) => (
                  <div 
                    key={r.roleId} 
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="w-64 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {r.roleCode}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {r.roleTitle}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        Média Semanal: <strong>{r.rate}%</strong>
                      </span>
                    </div>

                    {/* 5 Day Pills */}
                    <div className="flex-1 grid grid-cols-5 gap-2">
                      {r.daysRate.map((dRate, dIdx) => {
                        const dayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
                        return (
                          <div 
                            key={dIdx} 
                            className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg text-center border border-slate-100 dark:border-slate-800"
                          >
                            <span className="text-[10px] text-slate-400 block mb-0.5">{dayLabels[dIdx]}</span>
                            <span className={`font-mono text-xs font-bold ${
                              dRate >= 95 ? 'text-emerald-600 dark:text-emerald-400' :
                              dRate >= 85 ? 'text-blue-600 dark:text-blue-400' :
                              dRate >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600'
                            }`}>
                              {dRate}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Key Weekly Rituals Alert Card */}
          <div className="bg-gradient-to-r from-blue-900/10 via-slate-900/5 to-transparent border border-blue-200 dark:border-blue-900/60 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ritos de Cadência Semanal Obrigatórios
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                • <strong>Toda Quinta-feira às 14:00:</strong> Sessão Deliberativa do Conselho de Administração com Votação Nominal.<br />
                • <strong>Toda Sexta-feira às 14:30:</strong> Comitê de Operações com apresentação do Relatório Semanal de Visitas in loco (Checklist Fácil).<br />
                • <strong>Toda Sexta-feira às 16:30:</strong> Auditoria e Conciliação Semanal dos Cartões de Crédito Corporativos.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: VISÃO MENSAL (AGENDAS CRÍTICAS & PREVISTO X REALIZADO) */}
      {/* ========================================================================= */}
      {activeSubView === 'monthly' && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Painel de Conformidade Mensal • {monthlyData.monthLabel}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acompanhamento de rotinas periódicas que ocorrem em datas específicas do ciclo contábil e trabalhista
                </p>
              </div>

              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl">
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Cumprimento Mensal:</span>
                <span className="font-mono text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
                  {monthlyData.overallCompliance}%
                </span>
              </div>
            </div>

            {/* Critical Monthly Milestones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monthlyData.milestones.map((m) => {
                const isDone = m.status === 'completed';
                const isInProgress = m.status === 'in_progress';
                return (
                  <div 
                    key={m.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isDone 
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80' 
                        : isInProgress
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          {m.cadenceDescription}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-medium">
                          {m.roleCode}
                        </span>
                      </div>
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Concluído
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-spin" />
                          Em Andamento
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Aguardando Data
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {m.title}
                    </h4>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Data Marco: <strong>{m.targetDateFormatted}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                          {m.completionRate}%
                        </span>
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isDone ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${m.completionRate}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: EVOLUÇÃO ANUAL (12 MESES) */}
      {/* ========================================================================= */}
      {activeSubView === 'annual' && (
        <div className="space-y-6">
          
          {/* Annual Evolution Chart & Highlights */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Evolução Anual da Rotina • Visão Histórica de 12 Meses
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {annualData.periodLabel} — Curva de maturidade e consolidação da governança do Grupo RGR
                </p>
              </div>

              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Média Anual Acumulada:</span>
                <span className="font-mono text-sm font-extrabold text-purple-800 dark:text-purple-200">
                  {annualData.corporateAnnualAverage}%
                </span>
              </div>
            </div>

            {/* Interactive 12-Month SVG Trend Visualizer */}
            <div className="p-4 bg-slate-50 dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-4 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-atlas-500 inline-block" />
                  Linha de Evolução Mensal do Grupo RGR (%)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Meta RGR: 95% (Tracejado)
                </span>
              </div>

              {/* Bar & Curve Graph */}
              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 relative border-b border-slate-200 dark:border-slate-800">
                {/* 95% Goal Line */}
                <div 
                  className="absolute left-0 right-0 border-b-2 border-dashed border-emerald-500/60 pointer-events-none z-10 flex items-center justify-end pr-2"
                  style={{ bottom: '75%' }}
                >
                  <span className="text-[9px] font-mono font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded shadow-xs">
                    Meta 95%
                  </span>
                </div>

                {annualData.months.map((m, idx) => {
                  const heightPercent = Math.max(10, Math.min(100, (m.corporateAverage - 50) * 2));
                  const isCurrent = idx === annualData.months.length - 1;
                  return (
                    <div key={m.monthKey} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg pointer-events-none z-20 whitespace-nowrap">
                        {m.monthLabel}: {m.corporateAverage}%
                      </div>

                      {/* Bar */}
                      <div 
                        className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 relative ${
                          isCurrent 
                            ? 'bg-gradient-to-t from-atlas-600 to-emerald-500 shadow-sm'
                            : 'bg-slate-300 hover:bg-atlas-400 dark:bg-slate-700 dark:hover:bg-slate-600'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300">
                          {m.corporateAverage}%
                        </span>
                      </div>

                      {/* Month Label */}
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                        {m.monthLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matrix Table: All 12 Months Heatmap */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                Matriz Comparativa das Cadeiras nos 12 Meses (Heatmap)
              </h3>

              <div className="overflow-x-auto border border-slate-200/90 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#0c121e] border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 uppercase">
                      <th className="py-2.5 px-3 min-w-[180px]">Cadeira</th>
                      {annualData.months.map(m => (
                        <th key={m.monthKey} className="py-2.5 px-2 text-center">{m.monthLabel}</th>
                      ))}
                      <th className="py-2.5 px-3 text-center bg-slate-100 dark:bg-slate-800 font-bold">Média Anual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {roles.map(r => {
                      // Calculate average across 12 months for this role
                      const rates = annualData.months.map(m => m.rolesData[r.id] || 85);
                      const avg = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-900 dark:text-white block truncate">
                              {r.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {r.code || 'CAD'}
                            </span>
                          </td>

                          {rates.map((rate, rIdx) => {
                            const isHigh = rate >= 95;
                            const isMid = rate >= 85;
                            return (
                              <td key={rIdx} className="py-2.5 px-1.5 text-center">
                                <span className={`inline-block w-9 py-0.5 rounded font-mono text-[10px] font-bold ${
                                  isHigh 
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                                    : isMid 
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                }`}>
                                  {rate}%
                                </span>
                              </td>
                            );
                          })}

                          <td className="py-2.5 px-3 text-center bg-slate-50/80 dark:bg-slate-800/60 font-mono font-black text-slate-900 dark:text-white">
                            {avg}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Annual Awards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Cadeira Mais Consistente do Ano
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {annualData.bestPerformingRole.roleTitle}
                  </h4>
                  <span className="text-[11px] font-mono text-amber-800 dark:text-amber-300 font-bold">
                    Média de {annualData.bestPerformingRole.averageRate}% nos 12 meses
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Maior Salto de Evolução
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {annualData.mostImprovedRole.roleTitle}
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 font-bold">
                    Crescimento de +{annualData.mostImprovedRole.growthDelta}% na rotina
                  </span>
                </div>
              </div>

              <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 rounded-xl p-4 flex items-center gap-3">
                <span className="text-3xl">⏱️</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    Cadeira Mais Pontual
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {annualData.mostPunctualRole.roleTitle}
                  </h4>
                  <span className="text-[11px] font-mono text-blue-800 dark:text-blue-300 font-bold">
                    {annualData.mostPunctualRole.punctualityRate}% de pontualidade sem atrasos
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: RAIO-X DETALHADO DA CADEIRA */}
      {/* ========================================================================= */}
      {selectedInspectRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800">
                    {selectedInspectRole.roleCode}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Posição #{selectedInspectRole.rank} no Ranking</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Raio-X de Governança: {selectedInspectRole.roleTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInspectRole(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Scorecard */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Índice Geral</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {selectedInspectRole.executionRate}%
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Ritos Cumpridos</span>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                    {selectedInspectRole.ritualsRate}%
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Pontualidade</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {selectedInspectRole.punctualityRate}%
                  </p>
                </div>
              </div>

              {/* Ritos Cadastrados desta Cadeira */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  Ritos Oficiais Cadastrados
                </h4>
                <div className="space-y-2">
                  {rituals.filter(r => r.roleId === selectedInspectRole.roleId).map(r => (
                    <div key={r.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                        <span>{r.timeSlot} • {r.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{r.durationMinutes} min</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {r.agendaItems.length} itens de pauta deliberados na Mesa de Despacho
                      </p>
                    </div>
                  ))}
                  {rituals.filter(r => r.roleId === selectedInspectRole.roleId).length === 0 && (
                    <p className="text-xs text-slate-400 italic">Nenhum rito cadastrado para esta cadeira.</p>
                  )}
                </div>
              </div>

              {/* Procedimentos POPs desta Cadeira */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  Entregáveis e Procedimentos Padrão (POPs)
                </h4>
                <div className="space-y-2">
                  {blocks.filter(b => b.roleId === selectedInspectRole.roleId).slice(0, 4).map(b => (
                    <div key={b.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                        <span>{b.code || 'POP'}: {b.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{b.timeWindow}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                        Entregável: {b.deliverable}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Titular: <strong>{selectedInspectRole.assigneeName}</strong>
              </span>
              <div className="flex items-center gap-2">
                {onSelectRole && onGoToTimeline && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRole(selectedInspectRole.roleId);
                      onGoToTimeline(selectedInspectRole.roleId);
                      setSelectedInspectRole(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-atlas-600 hover:bg-atlas-700 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Ir para Timeline</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedInspectRole(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
