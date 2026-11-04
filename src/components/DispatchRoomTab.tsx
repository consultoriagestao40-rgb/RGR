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
import { DailyRitual, OperationalRole, RoutineBlockWithExecution, VoteChoice, SystemUser } from '@/lib/types';
import { isRitualScheduledForDate, isWeekend, formatRitualFrequency, getNextBusinessDay, formatDateBR } from '@/lib/frequency';

export interface CouncilMemberConfig {
  id: string;
  name: string;
  roleDescription: string;
  isVoter: boolean; // se true = vota; se false = ouvinte/secretário/assessor
}

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

  // Board Council Voting State (Ativo estritamente para pautas de conselho)
  const [boardVotes, setBoardVotes] = useState<{ [agendaIndex: number]: { [voterName: string]: VoteChoice } }>({});
  const [resolutionNotes, setResolutionNotes] = useState<{ [agendaIndex: number]: string }>({});
  
  // Board Voters (Conselheiros Votantes e Ouvintes da Mesa)
  const [councilMembers, setCouncilMembers] = useState<CouncilMemberConfig[]>([
    { id: '1', name: 'Cristiano Silva', roleDescription: 'Presidente do Conselho', isVoter: true },
    { id: '2', name: 'Carlos Mendes', roleDescription: 'Diretor de Operações', isVoter: true },
    { id: '3', name: 'Mariana Costa', roleDescription: 'Relatora Financeira', isVoter: true },
    { id: '4', name: 'Secretaria de Governança', roleDescription: 'Apoio / Redação de Ata', isVoter: false }
  ]);

  // Modal para Gerenciamento de Membros da Mesa / Conselho
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberIsVoter, setNewMemberIsVoter] = useState(true);

  // Garante que a Sessão Deliberativa do Conselho (Votação Nominal) esteja sempre disponível para deliberação
  const allChairRituals = React.useMemo<DailyRitual[]>(() => {
    const hasCouncil = rituals.some(
      r => r.type === 'board_council' || r.code?.startsWith('CON') || r.title?.toLowerCase().includes('conselho')
    );
    if (hasCouncil) return rituals;

    const defaultCouncilRitual: DailyRitual = {
      id: 'ritual-board-01',
      roleId: selectedRoleId || 'role-fin-01',
      code: 'CON-DIR-01',
      timeSlot: '14:00',
      title: 'Sessão Deliberativa do Conselho de Administração & Diretoria',
      durationMinutes: 45,
      type: 'board_council',
      frequency: 'weekly',
      weekDays: [4],
      includeWeekends: false,
      agendaItems: [
        'Homologação do Orçamento Extraordinário de Suprimentos & Químicos de Facilities',
        'Aprovação do Novo Regulamento Interno de Escalas, Benefícios e Banco de Horas',
        'Deliberação sobre Aporte de Capital para Aquisição de Lavadoras e Enceradeiras Industriais',
        'Aprovação da Rescisão Contratual e Substituição de Fornecedor de Uniformes em Atraso'
      ]
    };
    return [...rituals, defaultCouncilRitual];
  }, [rituals, selectedRoleId]);

  const boardCouncilRitual = React.useMemo(() => {
    return allChairRituals.find(
      r => r.type === 'board_council' || r.code?.startsWith('CON') || r.title?.toLowerCase().includes('conselho')
    );
  }, [allChairRituals]);

  // Ritos programados para a data ativa vs demais ritos (Conselho / Semanais / Mensais)
  const isCurrentWeekend = isWeekend(selectedDate);
  const scheduledTodayRituals = React.useMemo(() => {
    return allChairRituals.filter(r => isRitualScheduledForDate(r, selectedDate));
  }, [allChairRituals, selectedDate]);

  const otherChairRituals = React.useMemo(() => {
    return allChairRituals.filter(r => !isRitualScheduledForDate(r, selectedDate));
  }, [allChairRituals, selectedDate]);

  const effectiveRituals = React.useMemo(() => {
    return allChairRituals;
  }, [allChairRituals]);

  useEffect(() => {
    if (allChairRituals.length > 0 && (!selectedRitualId || !allChairRituals.some(r => r.id === selectedRitualId))) {
      const firstDefault = scheduledTodayRituals[0] || allChairRituals[0];
      setSelectedRitualId(firstDefault.id);
      setTimerSeconds((firstDefault.durationMinutes || 15) * 60);
    }
  }, [allChairRituals, scheduledTodayRituals, selectedRitualId]);

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

  // Calculate vote tally and quorum for a council item (apenas votantes)
  const votingMembers = councilMembers.filter(m => m.isVoter);
  const nonVotingMembers = councilMembers.filter(m => !m.isVoter);

  const getVotingSummary = (agendaIdx: number) => {
    const votes = boardVotes[agendaIdx] || {};
    let favorable = 0;
    let contrary = 0;
    let abstention = 0;

    votingMembers.forEach(m => {
      const v = votes[m.name];
      if (v === 'favorable') favorable++;
      else if (v === 'contrary') contrary++;
      else if (v === 'abstention') abstention++;
    });

    const votedCount = favorable + contrary + abstention;
    const totalVoters = votingMembers.length;

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
    let transcript = `=== EXTRATO DE DELIBERAÇÕES E VOTAÇÃO NOMINAL DO CONSELHO (${formatDateBR(selectedDate)}) ===\n\n`;
    activeRitual.agendaItems.forEach((item, idx) => {
      const summary = getVotingSummary(idx);
      transcript += `PAUTA ${idx + 1}.0: "${item}"\n`;
      transcript += `• DESFECHO DO QUÓRUM: ${summary.badgeText.toUpperCase()}\n`;
      transcript += `• VOTOS NOMINAIS DOS CONSELHEIROS:\n`;
      votingMembers.forEach(m => {
        const v = boardVotes[idx]?.[m.name];
        const vLabel = v === 'favorable' ? 'A Favor' : v === 'contrary' ? 'Contra' : v === 'abstention' ? 'Abstenção' : 'Não Votou';
        transcript += `  - ${m.name} (${m.roleDescription}): [${vLabel}]\n`;
      });
      if (nonVotingMembers.length > 0) {
        transcript += `• PARTICIPANTES OUVIENTES / SECRETARIA: ${nonVotingMembers.map(nv => `${nv.name} (${nv.roleDescription})`).join(', ')}\n`;
      }
      if (resolutionNotes[idx]) {
        transcript += `• PARECER / RESSALVAS: ${resolutionNotes[idx]}\n`;
      }
      transcript += '\n';
    });
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
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs transition-colors space-y-4">
        
        {/* Row 1: Session Title & Badges on Left, AI Assistant & Timer on Right */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                isBoardCouncil
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80 flex items-center gap-1'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}>
                {isBoardCouncil && <Landmark className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                {activeRitual?.code || 'RIT-01'}
              </span>

              {/* Date in Brazilian DD/MM/AAAA format */}
              <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{formatDateBR(selectedDate)} {isCurrentWeekend ? '• Fim de Semana' : '• Dia Útil'}</span>
              </span>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                {isBoardCouncil ? 'Sessão Deliberativa de Conselho' : 'Sessão de Cadência Operacional'}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isBoardCouncil ? 'Mesa de Votação do Conselho' : 'Mesa de Despacho Operacional'}
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

        {/* Row 2: Alternador Direto (Despacho vs Votação do Conselho) + Lista Suspensa de Ritos */}
        {effectiveRituals.length > 0 && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full pt-1">
            
            {/* Quick Mode Switcher: Despacho Operacional vs Pautas Deliberativas (Votação) */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const firstOperational = scheduledTodayRituals.find(
                    r => r.type !== 'board_council' && !r.code?.startsWith('CON') && !r.title?.toLowerCase().includes('conselho')
                  ) || effectiveRituals.find(
                    r => r.type !== 'board_council' && !r.code?.startsWith('CON') && !r.title?.toLowerCase().includes('conselho')
                  );
                  if (firstOperational) handleSelectRitual(firstOperational);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
                  !isBoardCouncil
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Despacho Operacional</span>
              </button>

              {boardCouncilRitual && (
                <button
                  type="button"
                  onClick={() => handleSelectRitual(boardCouncilRitual)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer whitespace-nowrap ${
                    isBoardCouncil
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/70 hover:bg-amber-100/80 dark:hover:bg-amber-900/40'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Pautas Deliberativas • Votação do Conselho</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isBoardCouncil
                      ? 'bg-slate-950/15 text-slate-950 font-extrabold'
                      : 'bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                  }`}>
                    {boardCouncilRitual.agendaItems?.length || 0} Pautas
                  </span>
                </button>
              )}
            </div>

            {/* Dropdown Selector (Lista Suspensa de Todos os Ritos da Cadeira) */}
            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                {isBoardCouncil ? (
                  <Landmark className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-atlas-500 shrink-0" />
                )}
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 font-mono">
                  Rito:
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
                    <optgroup label="Conselho & Ritos Semanais / Mensais da Cadeira" className="dark:bg-slate-900">
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
                      {isBoardCouncil ? 'Pautas Deliberativas de Conselho' : 'Pauta da Sessão'} • {activeRitual.durationMinutes} minutos
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                    {activeRitual.title}
                  </h2>
                </div>

                {/* Right controls: Distinct badge per nature */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isBoardCouncil ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Landmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Votação Nominal</span>
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {checkedCount} / {totalAgendaCount} Concluídos
                    </span>
                  )}
                </div>
              </div>

              {/* Council Quorum Notice & Mesa Management */}
              {isBoardCouncil && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-50/50 dark:bg-[#141a24] border border-amber-200/70 dark:border-amber-900/40 text-xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/50 dark:border-amber-900/30">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Composição da Mesa do Conselho
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                        {votingMembers.length} Votantes
                      </span>
                      {nonVotingMembers.length > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-700">
                          {nonVotingMembers.length} Ouvinte(s)
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMembersModalOpen(true)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                    >
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span>Gerenciar Conselheiros & Votantes</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] text-slate-500 font-medium mr-1">Presentes:</span>
                    {councilMembers.map(m => (
                      <span 
                        key={m.id} 
                        className={`px-2 py-0.5 rounded-md text-[11px] font-normal border flex items-center gap-1 ${
                          m.isVoter 
                            ? 'bg-white dark:bg-[#0c121e] border-amber-200/80 dark:border-amber-900/60 text-slate-800 dark:text-slate-200' 
                            : 'bg-slate-100/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 italic'
                        }`}
                        title={`${m.name} - ${m.roleDescription} (${m.isVoter ? 'Com direito a voto' : 'Ouvinte/Sem voto'})`}
                      >
                        <span className="font-semibold not-italic">{m.name}</span>
                        <span className="text-[10px] text-slate-400">({m.roleDescription})</span>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                          m.isVoter 
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold' 
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 font-medium'
                        }`}>
                          {m.isVoter ? 'VOTA' : 'OUVINTE'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* RENDERING AGENDAS: Council Voting vs Standard Operational Checklist */}
              <div className="space-y-2.5">
                {activeRitual.agendaItems.map((item, idx) => {
                  
                  // 1. MODO CONSELHO: VOTAÇÃO NOMINAL FORMAL
                  if (isBoardCouncil) {
                    const summary = getVotingSummary(idx);
                    const itemVotes = boardVotes[idx] || {};

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200/80 dark:border-[#1f293d] bg-slate-50/40 dark:bg-[#0f1726] shadow-xs transition-colors space-y-3"
                      >
                        {/* Title of Council Agenda */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70 dark:border-[#1a2333]">
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              PAUTA {idx + 1}.0
                            </span>
                            <span className="font-medium text-xs text-slate-900 dark:text-white leading-relaxed">
                              {item}
                            </span>
                          </div>
                          
                          {/* Real-time Tally Badge */}
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0 font-medium ${summary.badgeClass}`}>
                            {summary.badgeText}
                          </span>
                        </div>

                        {/* Nominal Voter Buttons (Apenas Votantes do Conselho) */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                            Votação Nominal ({votingMembers.length} Conselheiros Aptos):
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {votingMembers.map(member => {
                              const choice = itemVotes[member.name];

                              return (
                                <div 
                                  key={member.id}
                                  className="p-2.5 rounded-lg border border-slate-200/80 dark:border-[#1a2333] bg-white dark:bg-[#0a0f1a] flex flex-col justify-between gap-2"
                                >
                                  <div>
                                    <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate block" title={member.name}>
                                      {member.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 truncate block">
                                      {member.roleDescription}
                                    </span>
                                  </div>

                                  {/* 3 Buttons */}
                                  <div className="grid grid-cols-3 gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleVote(idx, member.name, 'favorable')}
                                      className={`py-1 rounded text-[10px] font-medium transition-colors border flex items-center justify-center gap-0.5 cursor-pointer ${
                                        choice === 'favorable'
                                          ? 'bg-atlas-600 text-white border-atlas-700 shadow-xs'
                                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-atlas-400'
                                      }`}
                                      title="A Favor"
                                    >
                                      <ThumbsUp className="w-2.5 h-2.5" />
                                      <span>A Favor</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleVote(idx, member.name, 'contrary')}
                                      className={`py-1 rounded text-[10px] font-medium transition-colors border flex items-center justify-center gap-0.5 cursor-pointer ${
                                        choice === 'contrary'
                                          ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-rose-400'
                                      }`}
                                      title="Contra"
                                    >
                                      <ThumbsDown className="w-2.5 h-2.5" />
                                      <span>Contra</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleVote(idx, member.name, 'abstention')}
                                      className={`py-1 rounded text-[10px] font-medium transition-colors border flex items-center justify-center gap-0.5 cursor-pointer ${
                                        choice === 'abstention'
                                          ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
                                          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                                      }`}
                                      title="Abstenção"
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
                        <div className="pt-1.5">
                          <input
                            type="text"
                            placeholder="Ressalva ou parecer da deliberação desta pauta (opcional)..."
                            value={resolutionNotes[idx] || ''}
                            onChange={(e) => setResolutionNotes({ ...resolutionNotes, [idx]: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                      </div>
                    );
                  }

                  // 2. MODO OPERACIONAL COMUM: CHECKLIST ÁGIL
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

              {/* Council Quick Sync Action */}
              {isBoardCouncil && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-[#1f293d] flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Ao concluir as votações, sincronize o extrato nominal direto na Ata.
                  </span>
                  <button
                    type="button"
                    onClick={syncVotesToNotes}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sincronizar Parecer</span>
                  </button>
                </div>
              )}

            </div>

            {/* Deliberações da Diretoria & Próximos Passos */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1c2638] mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {isBoardCouncil ? 'Deliberações Oficiais do Conselho & Parecer Final' : 'Deliberações Oficiais da Diretoria'}
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
                placeholder={
                  isBoardCouncil
                    ? "Registre as resoluções finais do Conselho. Utilize o botão acima para sincronizar automaticamente os votos nominais com quórum oficial."
                    : "Registre deliberações formais da presidência (ex: 'Lote de pagamentos aprovado no valor de R$ 42.350,00. Retenção de boleto de químicos até conferência da mercadoria no posto X. Faturamento do contrato Solar adiado para D+1.')."
                }
                className="w-full bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors font-sans leading-relaxed"
              />

              <div className="flex items-center justify-between mt-3 pt-2">
                <button
                  onClick={onOpenMinuteModal}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBoardCouncil ? 'Lavrar Ata Oficial do Conselho' : 'Formalizar como Ata Oficial'}</span>
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

      {/* Modal de Gestão da Mesa e Conselheiros (Estilo Atlas Governance) */}
      {isMembersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Composição da Mesa do Conselho
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Defina quem são os membros votantes e os participantes ouvintes da sessão.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMembersModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Lista dos Membros Cadastrados */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Membros Atuais na Mesa ({councilMembers.length}):
              </span>

              {councilMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {member.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        member.isVoter
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {member.isVoter ? 'VOTANTE' : 'OUVINTE'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                      {member.roleDescription}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCouncilMembers(prev =>
                          prev.map(m => m.id === member.id ? { ...m, isVoter: !m.isVoter } : m)
                        );
                      }}
                      className="px-2 py-1 text-[10px] font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400 cursor-pointer"
                      title={member.isVoter ? 'Alterar para Ouvinte (sem voto)' : 'Alterar para Membro Votante'}
                    >
                      {member.isVoter ? 'Tornar Ouvinte' : 'Conceder Voto'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (councilMembers.length <= 1) {
                          alert('A mesa precisa ter pelo menos um membro.');
                          return;
                        }
                        setCouncilMembers(prev => prev.filter(m => m.id !== member.id));
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Remover da mesa"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulário: Adicionar Novo Membro */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>+ Adicionar Conselheiro ou Participante</span>
              </span>

              {/* Seletor rápido de Usuário do Sistema (se houver) */}
              {users && users.length > 0 && (
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">
                    Importar da Base de Usuários:
                  </label>
                  <select
                    onChange={(e) => {
                      const u = users.find(usr => usr.id === e.target.value);
                      if (u) {
                        setNewMemberName(u.name);
                        setNewMemberRole(u.roleName || (u.role === 'admin' ? 'Diretor / Conselheiro' : 'Membro'));
                      }
                    }}
                    defaultValue=""
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="" disabled>Selecionar usuário existente...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.roleName || u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Dra. Helena Vasconcelos"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Cargo / Papel no Conselho</label>
                  <input
                    type="text"
                    placeholder="Ex: Conselheira Independente"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMemberIsVoter}
                    onChange={(e) => setNewMemberIsVoter(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Possui Direito a Voto (Conselheiro Votante)
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (!newMemberName.trim()) {
                      alert('Informe o nome do participante.');
                      return;
                    }
                    const newMember: CouncilMemberConfig = {
                      id: `cm-${Date.now()}`,
                      name: newMemberName.trim(),
                      roleDescription: newMemberRole.trim() || (newMemberIsVoter ? 'Conselheiro' : 'Participante'),
                      isVoter: newMemberIsVoter
                    };
                    setCouncilMembers(prev => [...prev, newMember]);
                    setNewMemberName('');
                    setNewMemberRole('');
                    setNewMemberIsVoter(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  Adicionar à Mesa
                </button>
              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMembersModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                Concluir Composição da Mesa
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
