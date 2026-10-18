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
  Coffee
} from 'lucide-react';
import { RoutineBlockWithExecution, DailyRitual, OperationalRole } from '@/lib/types';
import { evaluateDelay, calculateRolePerformance } from '@/lib/timeline-utils';
import { isRitualScheduledForDate, isBeforeSystemStart, SYSTEM_START_DATE, isWeekend, parseLocalDate, getNextBusinessDay } from '@/lib/frequency';

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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
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

  // Calculate chair performance metrics (pass isCurrentWeekend to pause penalties)
  const stats = calculateRolePerformance(blocks, isCurrentWeekend);
  const now = new Date();

  const getTierBadge = (tier: string) => {
    if (isCurrentWeekend) {
      return {
        label: 'Pausa Semanal • Final de Semana',
        className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-400/30'
      };
    }
    switch (tier) {
      case 'EXCELLENT':
        return {
          label: 'Faixa Ouro • Alta Governança',
          className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-400/30'
        };
      case 'STABLE':
        return {
          label: 'Conforme • Estável',
          className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-400/30'
        };
      case 'ATTENTION':
        return {
          label: 'Atenção • Desvios Recorrentes',
          className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-400/30'
        };
      case 'CRITICAL':
      default:
        return {
          label: 'Crítico • Inadimplência de Rotina',
          className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-400/30'
        };
    }
  };

  const tierInfo = getTierBadge(stats.ratingTier);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Performance & Punctuality Scoreboard (Atlas Governance / RGR Score) */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-xl p-5 shadow-sm transition-colors">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1c2638]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-[#172338] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-[#233552]">
                {role.code || 'CAD-01'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {role.department}
              </span>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${tierInfo.className}`}>
                {tierInfo.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {role.title}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              {role.description}
            </p>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-3 gap-3 border-l border-slate-200 dark:border-[#1f293d] pl-5 self-start md:self-auto">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Score RGR
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-2xl font-mono font-black ${
                  isCurrentWeekend ? 'text-blue-600 dark:text-blue-400' : stats.governanceScore >= 85 ? 'text-emerald-600 dark:text-emerald-400' : stats.governanceScore >= 70 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-500'
                }`}>
                  {isCurrentWeekend ? 100 : stats.governanceScore}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Pontualidade
              </span>
              <span className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-0.5 block">
                {isCurrentWeekend ? '100%' : `${stats.punctualityRate}%`}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Entregas
              </span>
              <span className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-0.5 block">
                {isCurrentWeekend ? '0/0' : `${stats.completedBlocks}/${stats.totalBlocks}`}
              </span>
            </div>
          </div>

        </div>

        {/* Detailed stats pills */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          {isCurrentWeekend ? (
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold">
              <Coffee className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Fim de semana: Cadência de POPs corporativos suspensa aos sábados e domingos. Nenhuma entrega obrigatória hoje.</span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {stats.onTimeBlocks} No Prazo
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {stats.delayedBlocks} Com Atraso Justificado
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                {stats.totalBlocks - stats.completedBlocks} Pendentes
              </span>
            </div>
          )}

          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
            Cadência auditada em tempo real com registro de justificativas
          </span>
        </div>

      </div>

      {/* Executive Banner: Despacho & Pautas com o CEO */}
      <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/80 dark:from-[#0f1b2e] dark:to-[#111c33] border border-blue-200/80 dark:border-[#1d3558] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                Pautas para Reunião com o CEO / Diretoria
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                {rituals.filter(r => isRitualScheduledForDate(r, selectedDate)).length} Ritos Agendados Hoje
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Tem um impedimento, verba emergencial ou alinhamento prioritário? Inclua pautas diretamente na Mesa de Despacho com o CEO.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenAddAgendaModal && (
            <button
              type="button"
              onClick={() => onOpenAddAgendaModal()}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Pauta p/ CEO</span>
            </button>
          )}
          {onGoToDispatchRoom && (
            <button
              type="button"
              onClick={onGoToDispatchRoom}
              className="px-3 py-1.5 rounded-lg border border-blue-300 dark:border-[#2b4c7c] bg-white dark:bg-[#132238] hover:bg-blue-50 dark:hover:bg-[#1a2e4d] text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <span>Mesa de Despacho</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 border border-blue-700 transition-all flex items-center gap-2 cursor-pointer"
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

          {blocks.map((block, index) => {
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

            // Check if this block matches an operational ritual or CEO dispatch
            const matchedRitual = rituals.find(r => 
              isRitualScheduledForDate(r, selectedDate) && (
                block.title.toLowerCase().includes('rito') || 
                block.title.toLowerCase().includes('despacho') ||
                r.timeSlot === block.timeWindow.split(' - ')[0]
              )
            );
            const isRitualBlock = Boolean(matchedRitual);

            return (
              <div
                key={block.id}
                className={`bg-white dark:bg-[#111827] border rounded-lg transition-all shadow-sm ${
                  isDone && block.execution?.isDelayed
                    ? 'border-amber-300 dark:border-amber-600/40 bg-amber-50/20 dark:bg-amber-950/10'
                    : isDone
                    ? 'border-emerald-300 dark:border-[#1b3a2f] bg-emerald-50/20 dark:bg-[#0d161a]/60' 
                    : isCurrentlyOverdue
                    ? 'border-rose-300 dark:border-rose-800/60 bg-rose-50/20 dark:bg-rose-950/10 ring-1 ring-rose-500/20'
                    : isPastUncompleted
                    ? 'border-slate-300 dark:border-slate-700/60 bg-slate-50/40 dark:bg-slate-900/30'
                    : isBlocked
                    ? 'border-rose-300 dark:border-[#3f1c1c] bg-rose-50/20 dark:bg-[#1a0f0f]/60'
                    : 'border-slate-200 dark:border-[#1f293d] hover:border-slate-300 dark:hover:border-[#2b3952]'
                }`}
              >
                {/* Card Top Row */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                    
                    {/* Left: Time and Code */}
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
                        isCurrentlyOverdue
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 animate-pulse'
                          : isPastUncompleted
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                          : 'bg-slate-100 dark:bg-[#172033] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#223048]'
                      }`}>
                        {block.timeWindow}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {block.code || `POP-00${index + 1}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {block.version || 'v1.0'}
                      </span>

                      {isRitualBlock && (
                        <button
                          type="button"
                          onClick={() => onOpenAddAgendaModal?.(matchedRitual)}
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 dark:bg-[#1c2a42] dark:hover:bg-[#253959] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-[#273a5a] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Clique para ver ou adicionar pautas a este despacho com a Diretoria/CEO"
                        >
                          <Briefcase className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>Rito com Diretoria</span>
                          <span className="font-mono text-[9px] bg-blue-200/60 dark:bg-blue-900/60 px-1 rounded ml-0.5">
                            {Array.isArray(matchedRitual?.agendaItems) ? matchedRitual.agendaItems.length : 0} pautas
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Right: Formal Status Tag with Delay Information */}
                    <div>
                      {isDone && block.execution?.isDelayed && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          Concluído com Atraso (+{block.execution.delayMinutes} min)
                        </span>
                      )}

                      {isDone && !block.execution?.isDelayed && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Pontual / No Prazo
                          {block.execution?.completedAt && (
                            <span className="font-mono text-[10px] opacity-75 ml-1">
                              {new Date(block.execution.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </span>
                      )}

                      {isCurrentWeekend && !isDone && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <Coffee className="w-3.5 h-3.5 text-blue-500" />
                          Pausa Semanal (Modo Leitura)
                        </span>
                      )}

                      {!isCurrentWeekend && isCurrentlyOverdue && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          Janela Expirada (+{delayCheck.delayMinutes} min de atraso)
                        </span>
                      )}

                      {!isCurrentWeekend && isPastUncompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Não Realizado no Prazo
                        </span>
                      )}

                      {!isCurrentWeekend && isFuture && !isDone && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-[#162033] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#243350]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Programado
                        </span>
                      )}

                      {!isCurrentWeekend && isToday && !isDone && !isCurrentlyOverdue && !isBlocked && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-[#162033] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#243350]">
                          <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                          Dentro do Horário
                        </span>
                      )}

                      {isBlocked && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          Bloqueado
                        </span>
                      )}
                    </div>
                  </div>

                {/* Macroprocess Title */}
                <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                  {block.title}
                </h3>

                {/* Deliverable Box */}
                <div className={`mt-3 p-3 rounded-md border text-xs flex items-start justify-between gap-3 ${
                  isDone 
                    ? 'bg-emerald-50 dark:bg-[#0b1717] border-emerald-200 dark:border-[#18392b] text-emerald-900 dark:text-emerald-200' 
                    : isCurrentlyOverdue
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200'
                    : 'bg-slate-50 dark:bg-[#0d1422] border-slate-200 dark:border-[#1a2538] text-slate-700 dark:text-slate-300'
                }`}>
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                      Entregável Obrigatório (Critério de Aceite):
                    </span>
                    <p className="font-medium leading-relaxed">
                      {block.deliverable}
                    </p>
                  </div>

                  <button
                    onClick={() => onRequestToggleStatus(block)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 shadow-sm ${
                      isDone
                        ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-white dark:text-emerald-300 border border-emerald-600 dark:border-emerald-700/60'
                        : isCurrentlyOverdue
                        ? 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-700'
                        : isPastUncompleted
                        ? 'bg-slate-600 hover:bg-slate-700 text-white border border-slate-700'
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-[#1e3a5f] dark:hover:bg-[#254673] text-white dark:text-blue-100 border border-blue-700 dark:border-[#2d558b]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isDone 
                      ? 'Concluído' 
                      : isCurrentlyOverdue 
                      ? 'Protocolar c/ Justificativa' 
                      : isPastUncompleted 
                      ? 'Registrar c/ Justificativa' 
                      : 'Protocolar Entrega'}
                  </button>
                </div>

                {/* Justification of Delay if present */}
                {block.execution?.delayReason && (
                  <div className="mt-2.5 p-3 rounded bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Motivo do Atraso ({block.execution.delayCategory}):</span>
                        <span className="font-mono text-[10px] bg-amber-200/50 dark:bg-amber-900/50 px-1.5 py-0.2 rounded font-semibold">
                          +{block.execution.delayMinutes} min
                        </span>
                      </div>
                      <p className="leading-relaxed">{block.execution.delayReason}</p>
                    </div>
                  </div>
                )}

                {/* General observation if present */}
                {block.execution?.observation && !block.execution?.delayReason && (
                  <div className="mt-2.5 p-2.5 rounded bg-blue-50 dark:bg-[#101726] border border-blue-200 dark:border-[#1d293d] text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-200">Nota de Auditoria / Evidência: </span>
                      <span>{block.execution.observation}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="px-4 sm:px-5 py-2.5 bg-slate-50 dark:bg-[#0e1420] border-t border-slate-200 dark:border-[#1a2333] flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onOpenObservationModal(block)}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{block.execution?.observation ? 'Editar Nota de Auditoria' : 'Adicionar Evidência / Glosa'}</span>
                  </button>

                  {isRitualBlock && onOpenAddAgendaModal && (
                    <button
                      type="button"
                      onClick={() => onOpenAddAgendaModal(matchedRitual)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Pautar c/ CEO ({Array.isArray(matchedRitual?.agendaItems) ? matchedRitual.agendaItems.length : 0})</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onOpenSop(block)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Manual de Instrução (POP)</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                </button>
              </div>

            </div>
          );
        })}
      </div>
      )}

    </div>
  );
};
