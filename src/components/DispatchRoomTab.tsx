'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  FileEdit, 
  Save, 
  FileCheck2,
  Check,
  CheckCheck,
  Sparkles,
  ShieldAlert,
  Calendar,
  Filter,
  ArrowRight
} from 'lucide-react';
import { DailyRitual, OperationalRole, RoutineBlockWithExecution, SystemUser } from '@/lib/types';
import { isRitualScheduledForDate, isWeekend, formatRitualFrequency, getNextBusinessDay, formatDateBR } from '@/lib/frequency';

interface DispatchRoomTabProps {
  roles: OperationalRole[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  rituals: DailyRitual[];
  blocks: RoutineBlockWithExecution[];
  selectedDate: string;
  onSelectDate?: (date: string) => void;
  onOpenMinuteModal: () => void;
  onOpenMeetingAiModal?: () => void;
  users?: SystemUser[];
  onRefreshRituals?: () => void;
}

export const DispatchRoomTab: React.FC<DispatchRoomTabProps> = ({
  roles,
  selectedRoleId,
  rituals,
  blocks,
  selectedDate,
  onSelectDate,
  onOpenMinuteModal,
  onOpenMeetingAiModal,
  users = [],
  onRefreshRituals
}) => {
  const currentRole = roles.find(r => r.id === selectedRoleId) || roles[0];
  const [selectedRitualId, setSelectedRitualId] = useState<string>('');
  
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Agenda checklist & notes state
  const [checklist, setChecklist] = useState<{ [index: number]: boolean }>({});
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Ritos operacionais da cadeira (sem conselho)
  const operationalRituals = React.useMemo(() => {
    return rituals.filter(r => r.type !== 'board_council' && !r.code?.startsWith('CON') && !r.title?.toLowerCase().includes('conselho'));
  }, [rituals]);

  // Ritos programados para a data ativa vs demais ritos da cadeira
  const isCurrentWeekend = isWeekend(selectedDate);
  const scheduledTodayRituals = React.useMemo(() => {
    return operationalRituals.filter(r => isRitualScheduledForDate(r, selectedDate));
  }, [operationalRituals, selectedDate]);

  const otherChairRituals = React.useMemo(() => {
    return operationalRituals.filter(r => !isRitualScheduledForDate(r, selectedDate));
  }, [operationalRituals, selectedDate]);

  const effectiveRituals = operationalRituals;

  useEffect(() => {
    if (effectiveRituals.length > 0 && (!selectedRitualId || !effectiveRituals.some(r => r.id === selectedRitualId))) {
      const firstDefault = scheduledTodayRituals[0] || effectiveRituals[0];
      setSelectedRitualId(firstDefault.id);
      setTimerSeconds((firstDefault.durationMinutes || 15) * 60);
    }
  }, [effectiveRituals, scheduledTodayRituals, selectedRitualId]);

  useEffect(() => {
    if (!selectedRitualId) return;
    
    fetch(`/api/dispatch?ritualId=${selectedRitualId}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setNotes(data.notes || '');
        setChecklist(data.checklist || {});
      })
      .catch(err => console.error('Error fetching dispatch state:', err));
  }, [selectedRitualId, selectedDate]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const activeRitual = effectiveRituals.find(r => r.id === selectedRitualId) || effectiveRituals[0];

  const handleSelectRitual = (ritual: DailyRitual) => {
    setSelectedRitualId(ritual.id);
    setIsTimerRunning(false);
    setTimerSeconds((ritual.durationMinutes || 15) * 60);
  };

  const toggleChecklistItem = (index: number) => {
    const updated = { ...checklist, [index]: !checklist[index] };
    setChecklist(updated);
  };

  const handleSaveState = async () => {
    if (!selectedRitualId) return;
    setIsSaving(true);
    try {
      await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ritualId: selectedRitualId,
          date: selectedDate,
          notes,
          checklist
        })
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving dispatch state:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const priorBlocks = blocks.filter(b => {
    if (!activeRitual) return true;
    const blockStart = b.timeWindow.split(' - ')[0];
    return blockStart <= activeRitual.timeSlot;
  });

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalAgendaCount = activeRitual?.agendaItems?.length || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Boardroom Session Banner */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs transition-colors space-y-4">
        
        {/* Row 1: Session Title & Badges on Left, AI Assistant & Timer on Right */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                {activeRitual?.code || 'RIT-01'}
              </span>

              {/* Date in Brazilian DD/MM/AAAA format */}
              <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{formatDateBR(selectedDate)} {isCurrentWeekend ? '• Fim de Semana' : '• Dia Útil'}</span>
              </span>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                Sessão de Cadência Operacional
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Mesa de Despacho Operacional
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cadeira Relatora: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentRole?.title}</span> ({currentRole?.code})
            </p>
          </div>

          {/* Right Header Controls: AI Meeting Assistant + Timer */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {onOpenMeetingAiModal && (
              <button
                type="button"
                onClick={onOpenMeetingAiModal}
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-atlas-600 to-emerald-600 hover:from-atlas-700 hover:to-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Gravar reunião presencial ou colar transcrição para gerar relatório e tarefas com IA"
              >
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>Agente de Reunião com IA</span>
              </button>
            )}

            {/* Timekeeper */}
            <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3 py-1.5 rounded-lg shrink-0">
              <span className="text-[11px] font-medium text-slate-400 font-mono">Tempo:</span>
              <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white tracking-wider">
                {formatTimer(timerSeconds)}
              </span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                title={isTimerRunning ? 'Pausar' : 'Iniciar'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds((activeRitual?.durationMinutes || 15) * 60);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                title="Resetar"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

        {/* Row 2: Lista Suspensa de Ritos Operacionais da Cadeira */}
        {effectiveRituals.length > 0 && (
          <div className="flex items-center justify-between gap-3 w-full pt-1">
            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <Clock className="w-3.5 h-3.5 text-atlas-500 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 font-mono">
                  Rito Operacional:
                </span>
                <select
                  value={selectedRitualId}
                  onChange={(e) => {
                    const chosen = effectiveRituals.find(r => r.id === e.target.value);
                    if (chosen) handleSelectRitual(chosen);
                  }}
                  className="w-full bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs"
                >
                  {scheduledTodayRituals.length > 0 && (
                    <optgroup label={`Programados para a Data (${formatDateBR(selectedDate)})`} className="dark:bg-slate-900">
                      {scheduledTodayRituals.map(rit => {
                        const freqText = formatRitualFrequency(rit);
                        const shortFreq = freqText.includes('(') ? freqText.split('(')[1].replace(')', '') : freqText;
                        return (
                          <option key={rit.id} value={rit.id} className="dark:bg-slate-900">
                            {rit.timeSlot} • {rit.title} [{shortFreq}]
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                  {otherChairRituals.length > 0 && (
                    <optgroup label="Demais Ritos da Cadeira" className="dark:bg-slate-900">
                      {otherChairRituals.map(rit => {
                        const freqText = formatRitualFrequency(rit);
                        const shortFreq = freqText.includes('(') ? freqText.split('(')[1].replace(')', '') : freqText;
                        return (
                          <option key={rit.id} value={rit.id} className="dark:bg-slate-900">
                            {rit.timeSlot} • {rit.title} [{shortFreq}]
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                </select>
              </div>

              {activeRitual && (
                <span className="hidden xl:inline-flex text-[10px] font-mono px-2.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-semibold whitespace-nowrap shrink-0">
                  {activeRitual.durationMinutes} min
                </span>
              )}
            </div>
          </div>
        )}

      </div>

      {effectiveRituals.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-8 text-center max-w-xl mx-auto my-8 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
            <Calendar className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            {isCurrentWeekend 
              ? 'Final de Semana: Sem Ritos Operacionais Agendados' 
              : 'Nenhum Rito Programado para Esta Data'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {isCurrentWeekend
              ? `A data selecionada (${formatDateBR(selectedDate)}) é um final de semana. Por protocolo de governança do RGR, ritos operacionais diários ocorrem exclusivamente em dias úteis (Segunda a Sexta).`
              : `Nenhum rito diário, semanal ou mensal está configurado para ${formatDateBR(selectedDate)}. Os ritos executivos ocorrem estritamente nas datas e frequências programadas.`}
          </p>
          {isCurrentWeekend && onSelectDate && (
            <div className="flex items-center justify-center">
              <button
                onClick={() => onSelectDate(getNextBusinessDay(selectedDate))}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-atlas-600 hover:bg-atlas-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Avançar para Próximo Dia Útil ({formatDateBR(getNextBusinessDay(selectedDate))})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : activeRitual ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Agenda (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header of Agenda */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs transition-colors">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#1c2638] mb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-400 font-mono">
                      Pauta da Sessão • {activeRitual.durationMinutes} minutos
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                    {activeRitual.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {checkedCount} / {totalAgendaCount} Concluídos
                  </span>
                </div>
              </div>

              {/* Checklist Operacional Ágil */}
              <div className="space-y-2.5">
                {activeRitual.agendaItems.map((item, idx) => {
                  const isChecked = !!checklist[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleChecklistItem(idx)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-3 shadow-xs ${
                        isChecked
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-slate-600 dark:text-slate-400'
                          : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <button className="mt-0.5 shrink-0 text-slate-400 cursor-pointer">
                        {isChecked ? (
                          <div className="w-4 h-4 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-600 hover:border-slate-500" />
                        )}
                      </button>
                      <div className="flex-1 text-xs">
                        <span className="font-mono text-slate-400 dark:text-slate-500 mr-2 font-medium">
                          {idx + 1}.0
                        </span>
                        <span className={isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200 font-normal'}>
                          {item}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Deliberações da Diretoria & Próximos Passos */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1c2638] mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Deliberações Oficiais da Diretoria
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {onOpenMeetingAiModal && (
                    <button
                      type="button"
                      onClick={onOpenMeetingAiModal}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-atlas-600 to-emerald-600 hover:from-atlas-700 hover:to-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      title="Gravar reunião presencial ou colar transcrição para gerar relatório e tarefas automáticas"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                      <span>Agente de Reunião com IA</span>
                    </button>
                  )}
                  {savedSuccess && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Salvo no Livro
                    </span>
                  )}
                </div>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder="Registre deliberações formais da presidência (ex: 'Lote de pagamentos aprovado no valor de R$ 42.350,00. Retenção de boleto de químicos até conferência da mercadoria no posto X. Faturamento do contrato Solar adiado para D+1.')."
                className="w-full bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors font-sans leading-relaxed"
              />

              <div className="flex items-center justify-between mt-3 pt-2">
                <button
                  onClick={onOpenMinuteModal}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Formalizar como Ata Oficial</span>
                </button>

                <button
                  onClick={handleSaveState}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-atlas-600 hover:bg-atlas-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Salvando...' : 'Salvar Deliberação'}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Entregáveis Anteriores sob Auditoria (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs transition-colors">
              <div className="pb-3 border-b border-slate-100 dark:border-[#1c2638] mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Auditoria Pré-Reunião
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  Entregáveis Exigidos até {activeRitual.timeSlot}
                </h3>
              </div>

              <div className="space-y-2.5">
                {priorBlocks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Nenhum entregável programado antes das {activeRitual.timeSlot}.
                  </p>
                ) : (
                  priorBlocks.map(block => {
                    const isDone = block.execution?.status === 'completed';
                    const isBlocked = block.execution?.status === 'blocked';

                    return (
                      <div
                        key={block.id}
                        className={`p-3.5 rounded-lg border text-xs shadow-xs transition-colors ${
                          isDone 
                            ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800 border-l-[3.5px] border-l-emerald-500' 
                            : isBlocked
                            ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800 border-l-[3.5px] border-l-rose-500'
                            : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800 border-l-[3.5px] border-l-slate-300 dark:border-l-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {block.timeWindow}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            isDone 
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                              : isBlocked
                              ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}>
                            {isDone ? 'Conforme' : isBlocked ? 'Impedimento' : 'Pendente'}
                          </span>
                        </div>

                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {block.title}
                        </p>

                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-600 dark:text-slate-300">Entregável: </span>
                          {block.deliverable}
                        </div>

                        {block.execution?.observation && (
                          <div className="mt-2 text-[11px] text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/60 p-2 rounded-md border border-slate-200/70 dark:border-slate-700">
                            <strong>Evidência:</strong> {block.execution.observation}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Protocolo da Reunião */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#0e1524] border border-slate-200/80 dark:border-[#1b2538] text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 block font-mono">
                Protocolo de Governança
              </span>
              <p className="leading-relaxed">
                As sessões de despacho possuem validade jurídica interna de aprovação em bloco. Toda deliberação registrada é indexada à Ata do Dia.
              </p>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
};
