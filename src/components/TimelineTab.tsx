'use client';

import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  Check, 
  MessageSquare, 
  ShieldCheck, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  Info,
  Briefcase,
  Plus,
  ArrowRight,
  Calendar,
  Coffee,
  CalendarCheck2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RoutineBlockWithExecution, DailyRitual, OperationalRole } from '@/lib/types';
import { evaluateDelay, calculateRolePerformance } from '@/lib/timeline-utils';
import { 
  isRitualScheduledForDate, 
  isBeforeSystemStart, 
  SYSTEM_START_DATE, 
  isWeekend, 
  parseLocalDate, 
  getNextBusinessDay,
  isBlockScheduledForDate,
  formatBlockFrequency 
} from '@/lib/frequency';

interface TimelineTabProps {
  role: OperationalRole | null;
  blocks: RoutineBlockWithExecution[];
  rituals: DailyRitual[];
  selectedDate: string;
  onOpenSop: (block: RoutineBlockWithExecution) => void;
  onRequestToggleStatus: (block: RoutineBlockWithExecution) => void;
  onOpenObservationModal: (block: RoutineBlockWithExecution) => void;
  onOpenAddAgendaModal?: (targetRitual?: DailyRitual) => void;
  onGoToDispatchRoom?: () => void;
  onSelectDate?: (date: string) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  role,
  blocks,
  rituals,
  selectedDate,
  onOpenSop,
  onRequestToggleStatus,
  onOpenObservationModal,
  onOpenAddAgendaModal,
  onGoToDispatchRoom,
  onSelectDate
}) => {
  if (!role) {
    return (
      <div className="text-center py-20 text-slate-500 font-medium">
        Selecione uma cadeira operacional no menu lateral.
      </div>
    );
  }

  // Prevent retroactive dates before system creation
  if (isBeforeSystemStart(selectedDate)) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-xl text-center shadow-sm">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          Data Anterior ao Início da Operação (Sem Retroativos)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
          A plataforma de Gerenciamento da Rotina (RGR) foi implantada em <strong>15/10/2026</strong>. Por protocolo de governança corporativa, não existem rotinas, ritos ou cobranças retroativas anteriores a esta data.
        </p>
        {onSelectDate && (
          <button
            onClick={() => onSelectDate(SYSTEM_START_DATE)}
            className="px-4 py-2 bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Ir para Início da Plataforma (15/10/2026)
          </button>
        )}
      </div>
    );
  }

  // Check weekend context
  const isCurrentWeekend = isWeekend(selectedDate);
  const [showWeekendConsultation, setShowWeekendConsultation] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'today_scheduled' | 'all_matrix'>('today_scheduled');
  const [showCalendarDossier, setShowCalendarDossier] = React.useState(true);

  // Filter scheduled blocks for selected date
  const scheduledBlocks = React.useMemo(() => {
    return blocks.filter(b => isBlockScheduledForDate(b, selectedDate));
  }, [blocks, selectedDate]);

  const displayBlocks = viewMode === 'today_scheduled' ? scheduledBlocks : blocks;

  // Calculate chair performance metrics based on scheduled blocks for this date
  const stats = calculateRolePerformance(scheduledBlocks, isCurrentWeekend);
  const now = new Date();

  const getTierBadge = (tier: string) => {
    if (isCurrentWeekend) {
      return {
        label: 'Pausa de Fim de Semana',
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        dotColor: 'bg-blue-500'
      };
    }
    switch (tier) {
      case 'EXCELLENT':
        return {
          label: 'Faixa Ouro • Alta Governança',
          className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
          dotColor: 'bg-emerald-500'
        };
      case 'STABLE':
        return {
          label: 'Operação Estável',
          className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          dotColor: 'bg-blue-500'
        };
      case 'ATTENTION':
        return {
          label: 'Atenção Operacional',
          className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
          dotColor: 'bg-amber-500'
        };
      case 'CRITICAL':
      default:
        return {
          label: 'Inadimplência de Rotina',
          className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
          dotColor: 'bg-rose-500'
        };
    }
  };

  const tierInfo = getTierBadge(stats.ratingTier);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      
      {/* Performance & Punctuality Scoreboard (Atlas Governance / RGR Score) */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1f293d] rounded-xl p-5 shadow-xs transition-colors">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-4 border-b border-slate-100 dark:border-[#1c2638]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {role.code || 'CAD-01'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {role.department}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${tierInfo.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tierInfo.dotColor}`} />
                {tierInfo.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {role.title}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {role.description}
            </p>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-3 gap-6 border-l border-slate-100 dark:border-[#1f293d] pl-6 self-start md:self-auto shrink-0">
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Score RGR
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl font-semibold tracking-tight font-sans ${
                  isCurrentWeekend ? 'text-blue-600 dark:text-blue-400' : stats.governanceScore >= 85 ? 'text-emerald-600 dark:text-emerald-400' : stats.governanceScore >= 70 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {isCurrentWeekend ? 100 : stats.governanceScore}
                </span>
                <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Pontualidade
              </span>
              <span className="text-2xl font-semibold tracking-tight font-sans text-slate-900 dark:text-white mt-1 block">
                {isCurrentWeekend ? '100%' : `${stats.punctualityRate}%`}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Entregas
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-semibold tracking-tight font-sans text-slate-900 dark:text-white block">
                  {isCurrentWeekend ? '0' : stats.completedBlocks}
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  / {isCurrentWeekend ? '0' : stats.totalBlocks}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed stats pills */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          {isCurrentWeekend ? (
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <Coffee className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Rotina em pausa de final de semana. Nenhuma entrega exigida hoje.</span>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {stats.onTimeBlocks} No Prazo
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {stats.delayedBlocks} Com Atraso Justificado
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                {stats.totalBlocks - stats.completedBlocks} Pendentes
              </span>
            </div>
          )}

          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Cadência auditada em tempo real com registro de justificativas
          </span>
        </div>

      </div>

      {/* Executive Banner: Despacho & Pautas com o CEO */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Pautas para Despacho com a Diretoria
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                {rituals.filter(r => isRitualScheduledForDate(r, selectedDate)).length} Ritos Agendados Hoje
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Impedimentos, solicitações emergenciais ou alinhamentos prioritários para deliberação na Mesa de Despacho.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenAddAgendaModal && (
            <button
              type="button"
              onClick={() => onOpenAddAgendaModal()}
              className="px-3.5 py-2 rounded-lg bg-atlas-600 hover:bg-atlas-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Pauta</span>
            </button>
          )}
          {onGoToDispatchRoom && (
            <button
              type="button"
              onClick={onGoToDispatchRoom}
              className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Mesa de Despacho</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Weekend Governance Notice Card (Exibido aos sábados e domingos quando não em modo consulta) */}
      {isCurrentWeekend && !showWeekendConsultation && (
        <div className="bg-white dark:bg-[#111827] border border-blue-200 dark:border-[#1f293d] rounded-2xl p-8 text-center shadow-sm relative overflow-hidden">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            {parseLocalDate(selectedDate).getDay() === 0 ? 'Domingo' : 'Sábado'} • Fora da Cadência Operacional
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Fim de Semana — Sem Rotina Operacional Agendada
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
            Conforme diretriz de governança corporativa do RGR, os Procedimentos Operacionais Padrão (POPs) operam de <strong>Segunda a Sexta-feira</strong>. Aos finais de semana não há cobrança de entregas, relógios de atraso ou penalidade de inadimplência.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onSelectDate && (
              <button
                onClick={() => onSelectDate(getNextBusinessDay(selectedDate))}
                className="px-5 py-2.5 bg-atlas-600 hover:bg-atlas-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Ir para o Próximo Dia Útil (Segunda-feira)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowWeekendConsultation(true)}
              className="px-4 py-2.5 border border-slate-300 dark:border-[#223048] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#151f30] rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Consultar Matriz de POPs (Modo Leitura)
            </button>
          </div>
        </div>
      )}

      {/* Dossier Executivo de Calendário & Prazos Críticos */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs">
        <div 
          onClick={() => setShowCalendarDossier(!showCalendarDossier)}
          className="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-atlas-50 dark:bg-atlas-950/60 text-atlas-600 dark:text-atlas-400 border border-atlas-200 dark:border-atlas-800 flex items-center justify-center shrink-0">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span>Calendário Operacional de Fechamentos & Obrigações Mensais</span>
                <span className="text-[10px] font-normal normal-case px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Governança
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Prazos oficiais de ponto, folha, benefícios (VT/VA), encargos (dia 20), rescisões e apuração de resultados (DRE).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px] font-medium hidden sm:inline">
              {showCalendarDossier ? 'Ocultar Prazos' : 'Ver Prazos Oficiais'}
            </span>
            {showCalendarDossier ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {showCalendarDossier && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-[#111827]">
            {/* 5º Dia Útil */}
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                5º Dia Útil do Mês
              </div>
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Salários & Vale-Alimentação (VA)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                Pagamento líquido de salários e liberação simultânea dos créditos de alimentação/refeição (VA/VR).
              </p>
            </div>

            {/* Dia 20 */}
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Todo Dia 20
              </div>
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Encargos Sociais & Tributos
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                Liquidação de FGTS Digital, DCTFWeb (INSS) e tributos retidos no borderô da tarde das 14:30.
              </p>
            </div>

            {/* Dia 25 e Dias 26 a 30 */}
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Dias 25 a 30
              </div>
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Ponto (Dia 25) & Folha (Pós-25)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                Fechamento oficial de ponto no dia 25 (período 26 a 25) e cálculo analítico da folha entre os dias 26 e 30.
              </p>
            </div>

            {/* Fim do Mês & DRE */}
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Fim do Mês / DRE Fechado
              </div>
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Compra VT & Apuração de DRE
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                Recarga de VT no último dia útil e apuração do DRE por contrato/empresa após pagar todas as contas do mês.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* View Mode Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('today_scheduled')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'today_scheduled'
                ? 'bg-atlas-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Rotinas Agendadas para Hoje ({scheduledBlocks.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('all_matrix')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'all_matrix'
                ? 'bg-atlas-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Matriz Completa da Cadeira ({blocks.length} POPs)
          </button>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          {viewMode === 'today_scheduled' ? (
            <span>Rotinas obrigatórias para este dia. {blocks.length - scheduledBlocks.length > 0 && `(${blocks.length - scheduledBlocks.length} rotinas de outras datas ocultas hoje)`}</span>
          ) : (
            <span>Exibindo todos os POPs cadastrados (diários, semanais e mensais).</span>
          )}
        </div>
      </div>

      {/* Cadence Timeline Container (Exibido em dias úteis ou no modo consulta de fim de semana) */}
      {(!isCurrentWeekend || showWeekendConsultation) && (
        <div className="space-y-3">
          {isCurrentWeekend && showWeekendConsultation && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-[#121c2e] border border-blue-200 dark:border-[#1d2f4d] rounded-xl text-xs">
              <span className="text-blue-800 dark:text-blue-300 font-medium flex items-center gap-2">
                <Coffee className="w-4 h-4 text-blue-500" />
                Visualizando matriz de POPs em <strong>Modo Consulta (Fim de Semana)</strong>. Nenhuma entrega é exigida hoje.
              </span>
              <button
                onClick={() => setShowWeekendConsultation(false)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Voltar à tela de final de semana
              </button>
            </div>
          )}

          {displayBlocks.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              Nenhuma rotina operacional programada especificamente para esta data.
            </div>
          ) : (
            displayBlocks.map((block, index) => {
              const status = block.execution?.status || 'pending';
              const isDone = status === 'completed';
              const isBlocked = status === 'blocked';

              // Date context
              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = selectedDate === todayStr;
              const isPast = selectedDate < todayStr;
              const isFuture = selectedDate > todayStr;

              // Live delay state: STRICTLY only for today in real-time, NEVER on weekends
              const delayCheck = evaluateDelay(block.timeWindow, selectedDate, now);
              const isCurrentlyOverdue = !isCurrentWeekend && isToday && !isDone && !isBlocked && delayCheck.isDelayed;
              const isPastUncompleted = !isCurrentWeekend && isPast && !isDone && !isBlocked;

              // Periodicity and schedule check
              const freqInfo = formatBlockFrequency(block);
              const isScheduledForDate = isBlockScheduledForDate(block, selectedDate);

              // Check if this block matches an operational ritual or CEO dispatch
              const matchedRitual = rituals.find(r => 
                isRitualScheduledForDate(r, selectedDate) && (
                  block.title.toLowerCase().includes('rito') || 
                  block.title.toLowerCase().includes('despacho') ||
                  r.timeSlot === block.timeWindow.split(' - ')[0]
                )
              );
              const isRitualBlock = Boolean(matchedRitual);

              // Left-border status accent class
              const getBorderAccent = () => {
                if (isDone && block.execution?.isDelayed) return 'border-l-amber-500';
                if (isDone) return 'border-l-emerald-500';
                if (isCurrentlyOverdue) return 'border-l-rose-500';
                if (isPastUncompleted) return 'border-l-slate-400 dark:border-l-slate-600';
                if (isBlocked) return 'border-l-rose-500';
                return 'border-l-slate-300 dark:border-l-slate-700';
              };

              return (
                <div
                  key={block.id}
                  className={`bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl border-l-[3.5px] ${getBorderAccent()} shadow-xs transition-all`}
                >
                  {/* Card Top Row */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                      
                      {/* Left: Time, Code, Frequency Badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {block.timeWindow}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {block.code || `POP-00${index + 1}`}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${freqInfo.badgeColor}`}>
                          {freqInfo.label}
                        </span>

                        {!isScheduledForDate && viewMode === 'all_matrix' && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                            Não agendado para hoje
                          </span>
                        )}

                        {isRitualBlock && (
                          <button
                            type="button"
                            onClick={() => onOpenAddAgendaModal?.(matchedRitual)}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Clique para ver ou adicionar pautas a este despacho com a Diretoria/CEO"
                          >
                            <Briefcase className="w-3 h-3 text-slate-500" />
                            <span>Rito de Despacho</span>
                            <span className="font-mono text-[9px] bg-slate-200 dark:bg-slate-700 px-1 rounded ml-0.5">
                              {Array.isArray(matchedRitual?.agendaItems) ? matchedRitual.agendaItems.length : 0}
                            </span>
                          </button>
                        )}
                      </div>

                    {/* Right: Formal Status Tag with Delay Information */}
                    <div>
                      {isDone && block.execution?.isDelayed && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Concluído com Atraso (+{block.execution.delayMinutes} min)</span>
                        </span>
                      )}

                      {isDone && !block.execution?.isDelayed && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Pontual / No Prazo</span>
                          {block.execution?.completedAt && (
                            <span className="font-mono text-[10px] text-emerald-600/70 dark:text-emerald-400/70 ml-0.5">
                              {new Date(block.execution.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </span>
                      )}

                      {isCurrentWeekend && !isDone && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <Coffee className="w-3.5 h-3.5 text-slate-400" />
                          <span>Pausa Semanal (Modo Leitura)</span>
                        </span>
                      )}

                      {!isCurrentWeekend && isCurrentlyOverdue && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Janela Expirada (+{delayCheck.delayMinutes} min de atraso)</span>
                        </span>
                      )}

                      {!isCurrentWeekend && isPastUncompleted && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Não Realizado no Prazo</span>
                        </span>
                      )}

                      {!isCurrentWeekend && isFuture && !isDone && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Programado</span>
                        </span>
                      )}

                      {!isCurrentWeekend && isToday && !isDone && !isCurrentlyOverdue && !isBlocked && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Dentro do Horário</span>
                        </span>
                      )}

                      {isBlocked && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Bloqueado</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Macroprocess Title */}
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                    {block.title}
                  </h3>

                  {/* Deliverable Box */}
                  <div className="mt-3.5 p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Entregável Obrigatório (Critério de Aceite)
                      </span>
                      <p className="font-normal text-slate-700 dark:text-slate-300 leading-relaxed">
                        {block.deliverable}
                      </p>
                    </div>

                    <button
                      onClick={() => onRequestToggleStatus(block)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : isCurrentlyOverdue
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : isPastUncompleted
                          ? 'bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
                          : 'bg-atlas-600 hover:bg-atlas-700 text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {isDone 
                          ? 'Concluído' 
                          : isCurrentlyOverdue 
                          ? 'Protocolar c/ Justificativa' 
                          : isPastUncompleted 
                          ? 'Registrar c/ Justificativa' 
                          : 'Protocolar Entrega'}
                      </span>
                    </button>
                  </div>

                  {/* Justification of Delay if present */}
                  {block.execution?.delayReason && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">Motivo do Atraso ({block.execution.delayCategory}):</span>
                          <span className="font-mono text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded font-medium">
                            +{block.execution.delayMinutes} min
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{block.execution.delayReason}</p>
                      </div>
                    </div>
                  )}

                  {/* General observation if present */}
                  {block.execution?.observation && !block.execution?.delayReason && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                      <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-medium text-slate-900 dark:text-white">Nota de Auditoria: </span>
                        <span className="text-slate-600 dark:text-slate-400">{block.execution.observation}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="px-4 sm:px-5 py-2.5 bg-slate-50/60 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onOpenObservationModal(block)}
                      className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{block.execution?.observation ? 'Editar Nota de Auditoria' : 'Adicionar Evidência / Glosa'}</span>
                    </button>

                    {isRitualBlock && onOpenAddAgendaModal && (
                      <button
                        type="button"
                        onClick={() => onOpenAddAgendaModal(matchedRitual)}
                        className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pautar c/ CEO ({Array.isArray(matchedRitual?.agendaItems) ? matchedRitual.agendaItems.length : 0})</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenSop(block)}
                    className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manual de Instrução (POP)</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>

              </div>
            );
          }))}
        </div>
      )}

    </div>
  );
};
