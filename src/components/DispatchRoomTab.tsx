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
  Landmark,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Users,
  CheckCheck,
  Sparkles,
  ShieldAlert,
  Calendar,
  Filter,
  ArrowRight
} from 'lucide-react';
import { DailyRitual, OperationalRole, RoutineBlockWithExecution, VoteChoice } from '@/lib/types';
import { isRitualScheduledForDate, isWeekend, formatRitualFrequency, getNextBusinessDay } from '@/lib/frequency';

interface DispatchRoomTabProps {
  roles: OperationalRole[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  rituals: DailyRitual[];
  blocks: RoutineBlockWithExecution[];
  selectedDate: string;
  onSelectDate?: (date: string) => void;
  onOpenMinuteModal: () => void;
}

export const DispatchRoomTab: React.FC<DispatchRoomTabProps> = ({
  roles,
  selectedRoleId,
  rituals,
  blocks,
  selectedDate,
  onSelectDate,
  onOpenMinuteModal
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

  // Board Council Voting State (Ativo estritamente para pautas de conselho)
  const [boardVotes, setBoardVotes] = useState<{ [agendaIndex: number]: { [voterName: string]: VoteChoice } }>({});
  const [resolutionNotes, setResolutionNotes] = useState<{ [agendaIndex: number]: string }>({});
  
  // Board Voters (Conselheiros Votantes)
  const [councilMembers, setCouncilMembers] = useState<string[]>([
    'Cristiano Silva (Presidente do Conselho)',
    'Carlos Mendes (Diretor de Operações)',
    'Mariana Costa (Relatora Financeira)'
  ]);

  // Frequency & Calendar Filtering (Entende finais de semana e frequências específicas)
  const isCurrentWeekend = isWeekend(selectedDate);
  const scheduledRituals = rituals.filter(r => isRitualScheduledForDate(r, selectedDate));
  const [showAllRituals, setShowAllRituals] = useState<boolean>(false);
  const effectiveRituals = showAllRituals ? rituals : scheduledRituals;

  useEffect(() => {
    if (effectiveRituals.length > 0 && (!selectedRitualId || !effectiveRituals.some(r => r.id === selectedRitualId))) {
      setSelectedRitualId(effectiveRituals[0].id);
      setTimerSeconds((effectiveRituals[0].durationMinutes || 15) * 60);
    }
  }, [effectiveRituals, selectedRitualId]);

  useEffect(() => {
    if (!selectedRitualId) return;
    
    fetch(`/api/dispatch?ritualId=${selectedRitualId}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setNotes(data.notes || '');
        setChecklist(data.checklist || {});
        setBoardVotes(data.boardVotes || {});
        setResolutionNotes(data.resolutionNotes || {});
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

  // Identifica se este rito é ESTRITAMENTE de Conselho Deliberativo ou Cadência Operacional
  const isBoardCouncil = Boolean(
    activeRitual?.type === 'board_council' || 
    activeRitual?.title?.toLowerCase().includes('conselho') || 
    activeRitual?.code?.startsWith('CON')
  );

  const handleSelectRitual = (ritual: DailyRitual) => {
    setSelectedRitualId(ritual.id);
    setIsTimerRunning(false);
    setTimerSeconds((ritual.durationMinutes || 15) * 60);
  };

  const toggleChecklistItem = (index: number) => {
    const updated = { ...checklist, [index]: !checklist[index] };
    setChecklist(updated);
  };

  // Voting handler for Board Council
  const handleVote = (agendaIdx: number, voter: string, choice: VoteChoice) => {
    setBoardVotes(prev => {
      const itemVotes = prev[agendaIdx] || {};
      const currentChoice = itemVotes[voter];
      const newChoice = currentChoice === choice ? undefined : choice;
      const updatedItem = { ...itemVotes };
      if (newChoice) {
        updatedItem[voter] = newChoice;
      } else {
        delete updatedItem[voter];
      }
      return { ...prev, [agendaIdx]: updatedItem };
    });
  };

  // Calculate vote tally and quorum for a council item
  const getVotingSummary = (agendaIdx: number) => {
    const votes = boardVotes[agendaIdx] || {};
    let favorable = 0;
    let contrary = 0;
    let abstention = 0;

    councilMembers.forEach(m => {
      const v = votes[m];
      if (v === 'favorable') favorable++;
      else if (v === 'contrary') contrary++;
      else if (v === 'abstention') abstention++;
    });

    const votedCount = favorable + contrary + abstention;
    const totalVoters = councilMembers.length;

    let badgeText = `Votação Pendente (${votedCount}/${totalVoters})`;
    let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';

    if (votedCount === totalVoters && totalVoters > 0) {
      if (favorable === totalVoters) {
        badgeText = 'Aprovado por Unanimidade';
        badgeClass = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold';
      } else if (favorable > contrary) {
        badgeText = `Aprovado por Maioria (${favorable} a ${contrary})`;
        badgeClass = 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold';
      } else if (contrary > favorable) {
        badgeText = `Rejeitado pelo Conselho (${contrary} a ${favorable})`;
        badgeClass = 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-bold';
      } else {
        badgeText = `Empate (${favorable} a ${contrary}) - Voto de Minerva`;
        badgeClass = 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold';
      }
    } else if (votedCount > 0) {
      badgeText = `Em Votação (${votedCount}/${totalVoters} votos)`;
      badgeClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700';
    }

    return { favorable, contrary, abstention, votedCount, totalVoters, badgeText, badgeClass };
  };

  // Sync Board Votes to Deliberations Textarea
  const syncVotesToNotes = () => {
    if (!activeRitual) return;
    let transcript = `=== EXTRATO DE DELIBERAÇÕES E VOTAÇÃO NOMINAL DO CONSELHO (${selectedDate}) ===\n\n`;
    activeRitual.agendaItems.forEach((item, idx) => {
      const summary = getVotingSummary(idx);
      transcript += `PAUTA ${idx + 1}.0: "${item}"\n`;
      transcript += `• DESFECHO DO QUÓRUM: ${summary.badgeText.toUpperCase()}\n`;
      transcript += `• VOTOS NOMINAIS:\n`;
      councilMembers.forEach(m => {
        const v = boardVotes[idx]?.[m];
        const vLabel = v === 'favorable' ? 'A Favor' : v === 'contrary' ? 'Contra' : v === 'abstention' ? 'Abstenção' : 'Não Votou';
        transcript += `  - ${m}: [${vLabel}]\n`;
      });
      if (resolutionNotes[idx]) {
        transcript += `• PARECER / RESSALVAS: ${resolutionNotes[idx]}\n`;
      }
      transcript += '\n';
    });

    setNotes(prev => {
      if (prev.includes('=== EXTRATO DE DELIBERAÇÕES')) {
        return transcript;
      }
      return prev ? `${prev}\n\n${transcript}` : transcript;
    });
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
          checklist,
          boardVotes,
          resolutionNotes
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
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              isBoardCouncil
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/80 flex items-center gap-1'
                : 'bg-blue-50 dark:bg-[#172338] text-blue-700 dark:text-blue-300 border-blue-200 dark:border-[#233552]'
            }`}>
              {isBoardCouncil && <Landmark className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
              {activeRitual?.code || 'RIT-01'}
            </span>

            {/* Date & Weekend / Business Day Badge */}
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
              isCurrentWeekend
                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#233552]'
            }`}>
              <Calendar className="w-3 h-3 text-slate-500" />
              {selectedDate} {isCurrentWeekend ? '• Final de Semana' : '• Dia Útil'}
            </span>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isBoardCouncil ? 'Sessão Deliberativa de Conselho (Boardroom)' : 'Sessão de Cadência Operacional'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{isBoardCouncil ? 'Mesa de Votação do Conselho' : 'Mesa de Despacho Operacional'}</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Cadeira Relatora: <strong className="text-slate-800 dark:text-slate-200">{currentRole?.title}</strong> ({currentRole?.code})
          </p>
        </div>

        {/* Ritual Switcher & Executive Timer */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Filter Toggle Pill if there are rituals outside today */}
            {rituals.length > 0 && (
              <button
                onClick={() => setShowAllRituals(!showAllRituals)}
                className={`px-2 py-1 rounded flex items-center gap-1 text-[10px] font-semibold border transition-all ${
                  showAllRituals
                    ? 'bg-blue-50 dark:bg-[#192b45] text-blue-700 dark:text-blue-300 border-blue-300'
                    : 'bg-slate-100 dark:bg-[#141d2e] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border-slate-200 dark:border-[#202c42]'
                }`}
                title="Alternar entre ver apenas ritos agendados para a data ativa ou todos os ritos cadastrados"
              >
                <Filter className="w-3 h-3" />
                <span>{showAllRituals ? `Todos (${rituals.length})` : `Hoje (${scheduledRituals.length}/${rituals.length})`}</span>
              </button>
            )}

            <div className="flex items-center bg-slate-100 dark:bg-[#141d2e] border border-slate-200 dark:border-[#223048] p-1 rounded-md overflow-x-auto max-w-full">
              {effectiveRituals.map(rit => {
                const isCouncilRitual = rit.type === 'board_council' || rit.code?.startsWith('CON') || rit.title?.toLowerCase().includes('conselho');
                const isSelected = selectedRitualId === rit.id;
                const freqText = formatRitualFrequency(rit);
                return (
                  <button
                    key={rit.id}
                    onClick={() => handleSelectRitual(rit)}
                    className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? isCouncilRitual
                          ? 'bg-amber-600 dark:bg-amber-700 text-white shadow-sm'
                          : 'bg-blue-600 dark:bg-[#1e3a5f] text-white shadow-sm'
                        : isCouncilRitual
                          ? 'text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 bg-amber-500/10'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isCouncilRitual ? <Landmark className="w-3 h-3" /> : <Clock className="w-3 h-3 opacity-60" />}
                    <span>{rit.timeSlot} • {rit.title.replace('Despacho', '').replace('Alinhamento', '').replace('Sessão Deliberativa do', '').slice(0, 16)}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {freqText.includes('(') ? freqText.split('(')[1].replace(')', '') : freqText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timekeeper */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#141d2e] border border-slate-200 dark:border-[#223048] px-3 py-1.5 rounded-md shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Tempo:</span>
            <span className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-wider">
              {formatTimer(timerSeconds)}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ml-1"
              title={isTimerRunning ? 'Pausar' : 'Iniciar'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds((activeRitual?.durationMinutes || 15) * 60);
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              title="Resetar"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>

      {effectiveRituals.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-xl p-8 text-center max-w-xl mx-auto my-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {isCurrentWeekend 
              ? 'Final de Semana: Sem Ritos Operacionais Agendados' 
              : 'Nenhum Rito Programado para Esta Data'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {isCurrentWeekend
              ? `A data selecionada (${selectedDate}) é um final de semana. Por protocolo de governança do RGR, ritos operacionais diários ocorrem exclusivamente em dias úteis (Segunda a Sexta).`
              : `Nenhum rito operacional ou de conselho possui frequência configurada para ${selectedDate}.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isCurrentWeekend && onSelectDate && (
              <button
                onClick={() => onSelectDate(getNextBusinessDay(selectedDate))}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>Avançar para Próximo Dia Útil ({getNextBusinessDay(selectedDate)})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setShowAllRituals(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141d2e] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
            >
              Visualizar Todos os Ritos ({rituals.length})
            </button>
          </div>
        </div>
      ) : activeRitual ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Agenda (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header of Agenda */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-lg p-5 shadow-sm transition-colors">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-200 dark:border-[#1c2638] mb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
                      {isBoardCouncil ? 'Pautas Deliberativas de Conselho' : 'Pauta da Sessão'} • {activeRitual.durationMinutes} minutos
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeRitual.title}
                  </h2>
                </div>

                {/* Right controls: Distinct badge per nature */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isBoardCouncil ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      <Landmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Votação Nominal do Conselho</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-[#172033] text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-[#223048]">
                      {checkedCount} / {totalAgendaCount} Concluídos
                    </span>
                  )}
                </div>
              </div>

              {/* Council Quorum Notice */}
              {isBoardCouncil && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50/70 dark:bg-[#141a24] border border-amber-200/80 dark:border-amber-900/40 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      Membros Votantes do Conselho (Quórum Presente):
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 font-semibold">
                      {councilMembers.length} Conselheiros Aptos
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {councilMembers.map(m => (
                      <span key={m} className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-[#24334d] font-medium text-slate-700 dark:text-slate-300">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* RENDERING AGENDAS: Council Voting vs Standard Operational Checklist */}
              <div className="space-y-3">
                {activeRitual.agendaItems.map((item, idx) => {
                  
                  // ==========================================
                  // 1. MODO CONSELHO: VOTAÇÃO NOMINAL FORMAL
                  // ==========================================
                  if (isBoardCouncil) {
                    const summary = getVotingSummary(idx);
                    const itemVotes = boardVotes[idx] || {};

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-slate-200 dark:border-[#1f293d] bg-white dark:bg-[#0f1726] shadow-sm transition-all space-y-3"
                      >
                        {/* Title of Council Agenda */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-[#1a2333]">
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              PAUTA {idx + 1}.0
                            </span>
                            <span className="font-bold text-xs text-slate-900 dark:text-white leading-relaxed">
                              {item}
                            </span>
                          </div>
                          
                          {/* Real-time Tally Badge */}
                          <span className={`text-[10px] px-2.5 py-1 rounded border uppercase tracking-wider shrink-0 ${summary.badgeClass}`}>
                            {summary.badgeText}
                          </span>
                        </div>

                        {/* Nominal Voter Buttons */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Votação Nominal por Membro:
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {councilMembers.map(member => {
                              const choice = itemVotes[member];

                              return (
                                <div 
                                  key={member}
                                  className="p-2.5 rounded-lg border border-slate-200 dark:border-[#1a2333] bg-slate-50 dark:bg-[#0a0f1a] flex flex-col justify-between gap-2"
                                >
                                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate" title={member}>
                                    {member.split('(')[0].trim()}
                                  </span>

                                  {/* 3 Buttons */}
                                  <div className="grid grid-cols-3 gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleVote(idx, member, 'favorable')}
                                      className={`py-1 rounded text-[10px] font-bold transition-all border flex items-center justify-center gap-0.5 ${
                                        choice === 'favorable'
                                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-1 ring-emerald-500'
                                          : 'bg-white dark:bg-[#141d2e] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#223048] hover:border-emerald-400'
                                      }`}
                                      title="Votar A Favor da Matéria"
                                    >
                                      <ThumbsUp className="w-2.5 h-2.5" />
                                      <span>A Favor</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleVote(idx, member, 'contrary')}
                                      className={`py-1 rounded text-[10px] font-bold transition-all border flex items-center justify-center gap-0.5 ${
                                        choice === 'contrary'
                                          ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-1 ring-rose-500'
                                          : 'bg-white dark:bg-[#141d2e] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#223048] hover:border-rose-400'
                                      }`}
                                      title="Votar Contra a Matéria"
                                    >
                                      <ThumbsDown className="w-2.5 h-2.5" />
                                      <span>Contra</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleVote(idx, member, 'abstention')}
                                      className={`py-1 rounded text-[10px] font-bold transition-all border flex items-center justify-center gap-0.5 ${
                                        choice === 'abstention'
                                          ? 'bg-slate-700 text-white border-slate-800 shadow-sm ring-1 ring-slate-500'
                                          : 'bg-white dark:bg-[#141d2e] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#223048] hover:border-slate-400'
                                      }`}
                                      title="Abster-se da votação"
                                    >
                                      <MinusCircle className="w-2.5 h-2.5" />
                                      <span>Abster</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Optional resolution / dissent notes */}
                        <div className="pt-2">
                          <input
                            type="text"
                            placeholder="Ressalva ou parecer da deliberação desta pauta (opcional)..."
                            value={resolutionNotes[idx] || ''}
                            onChange={(e) => setResolutionNotes({ ...resolutionNotes, [idx]: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-[11px] bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1a2333] rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                      </div>
                    );
                  }

                  // ==========================================
                  // 2. MODO OPERACIONAL COMUM: CHECKLIST ÁGIL
                  // ==========================================
                  const isChecked = !!checklist[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleChecklistItem(idx)}
                      className={`p-3 rounded-md border cursor-pointer transition-all flex items-start gap-3 shadow-sm ${
                        isChecked
                          ? 'bg-emerald-50/40 dark:bg-[#0d161a] border-emerald-300 dark:border-[#1b3a2f] text-slate-700 dark:text-slate-300'
                          : 'bg-slate-50/80 dark:bg-[#141d2e]/80 border-slate-200 dark:border-[#202b3f] hover:border-slate-300 dark:hover:border-[#2e3e59] text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <button className="mt-0.5 shrink-0 text-slate-400">
                        {isChecked ? (
                          <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded border border-slate-400 dark:border-slate-600 hover:border-slate-600 dark:hover:border-slate-400" />
                        )}
                      </button>
                      <div className="flex-1 text-xs">
                        <span className="font-mono text-slate-400 dark:text-slate-400 mr-2 font-bold">
                          {idx + 1}.0
                        </span>
                        <span className={isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100 font-medium'}>
                          {item}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Council Quick Sync Action */}
              {isBoardCouncil && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#1f293d] flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ao concluir as votações, sincronize o extrato nominal direto na Ata.
                  </span>
                  <button
                    type="button"
                    onClick={syncVotesToNotes}
                    className="px-3 py-1.5 rounded bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sincronizar Votações com o Parecer</span>
                  </button>
                </div>
              )}

            </div>

            {/* Deliberações da Diretoria & Próximos Passos */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-lg p-5 shadow-sm transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1c2638] mb-3">
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isBoardCouncil ? 'Deliberações Oficiais do Conselho & Parecer Final' : 'Deliberações Oficiais da Diretoria & Próximos Passos'}
                  </h3>
                </div>
                {savedSuccess && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Salvo no Livro
                  </span>
                )}
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder={
                  isBoardCouncil
                    ? "Registre as resoluções finais do Conselho. Utilize o botão acima para sincronizar automaticamente os votos nominais com quórum oficial."
                    : "Registre deliberações formais da presidência (ex: 'Lote de pagamentos aprovado no valor de R$ 42.350,00. Retenção de boleto de químicos até conferência da mercadoria no posto X. Faturamento do contrato Solar adiado para D+1.')."
                }
                className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#202b3f] rounded-md p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-sans leading-relaxed"
              />

              <div className="flex items-center justify-between mt-3 pt-2">
                <button
                  onClick={onOpenMinuteModal}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>{isBoardCouncil ? 'Lavrar Ata Oficial do Conselho' : 'Formalizar como Ata Oficial'}</span>
                </button>

                <button
                  onClick={handleSaveState}
                  disabled={isSaving}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 dark:bg-[#1e3a5f] dark:hover:bg-[#254673] disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 border border-blue-700 dark:border-[#2d558b] transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Salvando...' : 'Salvar Deliberação'}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Entregáveis Anteriores sob Auditoria (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-lg p-5 shadow-sm transition-colors">
              <div className="pb-3 border-b border-slate-200 dark:border-[#1c2638] mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Auditoria Pré-Reunião
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Entregáveis Exigidos até {activeRitual.timeSlot}
                </h3>
              </div>

              <div className="space-y-2.5">
                {priorBlocks.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    Nenhum entregável programado antes das {activeRitual.timeSlot}.
                  </p>
                ) : (
                  priorBlocks.map(block => {
                    const isDone = block.execution?.status === 'completed';
                    const isBlocked = block.execution?.status === 'blocked';

                    return (
                      <div
                        key={block.id}
                        className={`p-3 rounded-md border text-xs shadow-sm ${
                          isDone 
                            ? 'bg-emerald-50/30 dark:bg-[#0d161a] border-emerald-200 dark:border-[#1b3a2f]' 
                            : isBlocked
                            ? 'bg-rose-50/30 dark:bg-[#1a0f0f] border-rose-200 dark:border-[#3f1c1c]'
                            : 'bg-slate-50 dark:bg-[#141d2e] border-slate-200 dark:border-[#202b3f]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {block.timeWindow}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isDone 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                              : isBlocked
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                          }`}>
                            {isDone ? 'Conforme' : isBlocked ? 'Impedimento' : 'Pendente'}
                          </span>
                        </div>

                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {block.title}
                        </p>

                        <div className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Entregável: </span>
                          {block.deliverable}
                        </div>

                        {block.execution?.observation && (
                          <div className="mt-1.5 text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-[#0c121e] p-1.5 rounded border border-blue-200 dark:border-[#1b263b]">
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
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-[#0e1524] border border-slate-200 dark:border-[#1b2538] text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block font-mono">
                {isBoardCouncil ? 'Rito Deliberativo do Conselho' : 'Protocolo de Governança'}
              </span>
              <p className="leading-relaxed">
                {isBoardCouncil
                  ? 'As pautas de conselho possuem efeito deliberativo formal. O voto de cada conselheiro e o quórum apurado são registrados digitalmente com validade jurídica estatutária.'
                  : 'As sessões de despacho possuem validade jurídica interna de aprovação em bloco. Toda deliberação registrada é indexada à Ata do Dia.'}
              </p>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
};
