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
  Info
} from 'lucide-react';
import { RoutineBlockWithExecution, DailyRitual, OperationalRole } from '@/lib/types';
import { evaluateDelay, calculateRolePerformance } from '@/lib/timeline-utils';
import { isRitualScheduledForDate } from '@/lib/frequency';

interface TimelineTabProps {
  role: OperationalRole | null;
  blocks: RoutineBlockWithExecution[];
  rituals: DailyRitual[];
  selectedDate: string;
  onOpenSop: (block: RoutineBlockWithExecution) => void;
  onRequestToggleStatus: (block: RoutineBlockWithExecution) => void;
  onOpenObservationModal: (block: RoutineBlockWithExecution) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  role,
  blocks,
  rituals,
  selectedDate,
  onOpenSop,
  onRequestToggleStatus,
  onOpenObservationModal
}) => {
  if (!role) {
    return (
      <div className="text-center py-20 text-slate-500 font-medium">
        Selecione uma cadeira operacional no menu lateral.
      </div>
    );
  }

  // Calculate chair performance metrics
  const stats = calculateRolePerformance(blocks);
  const now = new Date();

  const getTierBadge = (tier: string) => {
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
                  stats.governanceScore >= 85 ? 'text-emerald-600 dark:text-emerald-400' : stats.governanceScore >= 70 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-500'
                }`}>
                  {stats.governanceScore}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Pontualidade
              </span>
              <span className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-0.5 block">
                {stats.punctualityRate}%
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Entregas
              </span>
              <span className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-0.5 block">
                {stats.completedBlocks}/{stats.totalBlocks}
              </span>
            </div>
          </div>

        </div>

        {/* Detailed stats pills */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
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

          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
            Cadência auditada em tempo real com registro de justificativas
          </span>
        </div>

      </div>

      {/* Cadence Timeline Container */}
      <div className="space-y-3">
        {blocks.map((block, index) => {
          const status = block.execution?.status || 'pending';
          const isDone = status === 'completed';
          const isBlocked = status === 'blocked';

          // Evaluate live delay state
          const delayCheck = evaluateDelay(block.timeWindow, selectedDate, now);
          const isCurrentlyOverdue = !isDone && !isBlocked && delayCheck.isDelayed;

          const isRitualBlock = rituals.some(r => 
            isRitualScheduledForDate(r, selectedDate) && (
              block.title.toLowerCase().includes('rito') || 
              block.title.toLowerCase().includes('despacho') ||
              r.timeSlot === block.timeWindow.split(' - ')[0]
            )
          );

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
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-[#1c2a42] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-[#273a5a]">
                        Rito com Diretoria
                      </span>
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

                    {isCurrentlyOverdue && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        Janela Expirada (+{delayCheck.delayMinutes} min de atraso)
                      </span>
                    )}

                    {!isDone && !isCurrentlyOverdue && !isBlocked && (
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
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-[#1e3a5f] dark:hover:bg-[#254673] text-white dark:text-blue-100 border border-blue-700 dark:border-[#2d558b]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isDone ? 'Concluído' : isCurrentlyOverdue ? 'Protocolar c/ Justificativa' : 'Protocolar Entrega'}
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
                <button
                  onClick={() => onOpenObservationModal(block)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{block.execution?.observation ? 'Editar Nota de Auditoria' : 'Adicionar Evidência / Glosa'}</span>
                </button>

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

    </div>
  );
};
