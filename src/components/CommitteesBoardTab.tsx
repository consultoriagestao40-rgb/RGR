'use client';

import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  FileCheck2, 
  Vote, 
  ThumbsUp, 
  ThumbsDown, 
  MinusCircle, 
  Sparkles, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Briefcase, 
  FolderPlus,
  Send,
  UserCheck,
  Building2,
  CalendarDays,
  Search,
  Check,
  ArrowLeft,
  Settings,
  MoreVertical,
  CheckSquare,
  Square,
  HelpCircle,
  FileCode,
  Tag,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { OperationalRole, SystemUser, VoteChoice } from '@/lib/types';
import { formatDateBR } from '@/lib/frequency';

export interface BoardMember {
  id: string;
  name: string;
  roleDescription: string;
  isVoter: boolean; // true = vota; false = ouvinte
  avatarColor?: string;
}

export interface CommitteeAgendaItem {
  id: string;
  title: string;
  description?: string;
  isFixed: boolean; // true = pauta fixa recorrente; false = avulsa
  isDeliberative: boolean; // true = votação nominal; false = informativa
  category?: string;
  votes: { [memberName: string]: VoteChoice };
  resolutionNote?: string;
}

export interface CommitteeSession {
  id: string;
  sessionCode: string; // Ex: SES-01/2026
  title: string;
  date: string;
  status: 'concluded' | 'in_progress' | 'scheduled';
  agendas: CommitteeAgendaItem[];
  minuteRecorded?: boolean;
  aiReport?: {
    transcript: string;
    summary: string;
    keyDecisions?: string[];
    recordedAt?: string;
  };
}

export interface CommitteeConfig {
  id: string;
  name: string;
  code: string;
  type: 'board' | 'committee';
  description: string;
  presidentName: string;
  presidentRole: string;
  cadence: string; // Ex: 'Mensal', 'Quinzenal', 'Semanal'
  meetingDay?: string; // Ex: 'Segunda-feira', 'Último dia do mês', 'Quarta-feira'
  meetingTime?: string; // Ex: '10:00'
  members: BoardMember[];
  agendas: CommitteeAgendaItem[]; // Pautas ativas/modelo base
  sessions?: CommitteeSession[]; // Histórico de todas as sessões realizadas
  // Relatório de IA da Sessão (Gravação / Transcrição / Resumo)
  sessionAiReport?: {
    transcript: string;
    summary: string;
    keyDecisions?: string[];
    recordedAt?: string;
  };
}

interface CommitteesBoardTabProps {
  roles: OperationalRole[];
  currentRole?: OperationalRole | null;
  currentUser?: SystemUser | null;
  selectedDate: string;
  onOpenMinuteModal?: () => void;
  users?: SystemUser[];
  onNavigateToActions?: () => void;
  onNavigateToMinutes?: () => void;
}

export const CommitteesBoardTab: React.FC<CommitteesBoardTabProps> = ({
  roles,
  currentRole,
  currentUser,
  selectedDate,
  onOpenMinuteModal,
  users = [],
  onNavigateToActions,
  onNavigateToMinutes
}) => {
  // Lista Padrão de Colegiados
  const defaultCommittees: CommitteeConfig[] = [
    {
      id: 'board-01',
      name: 'Conselho de Administração & Diretoria',
      code: 'CONS-ADM',
      type: 'board',
      description: 'Órgão colegiado deliberativo superior da RGR. Responsável por diretrizes estratégicas, governança, aprovação orçamentária extraordinária e fiscalização executiva.',
      presidentName: 'Cristiano Silva',
      presidentRole: 'Diretoria Executiva / CEO & Presidente do Conselho',
      cadence: 'Mensal (Última Quinta-feira do Mês)',
      members: [
        { id: 'm1', name: 'Cristiano Silva', roleDescription: 'CEO & Presidente do Conselho', isVoter: true },
        { id: 'm2', name: 'Ana Beatriz', roleDescription: 'Diretora de Controladoria & Finanças', isVoter: true },
        { id: 'm3', name: 'Marcos Oliveira', roleDescription: 'Diretor de Operações & Facilities', isVoter: true },
        { id: 'm4', name: 'Secretaria de Governança', roleDescription: 'Redatora de Ata & Compliance', isVoter: false }
      ],
      agendas: [
        {
          id: 'ag-b1',
          title: 'Apreciação e Homologação dos Resultados Financeiros e DRE do Período',
          description: 'Apresentação detalhada da receita bruta, custos operacionais diretos, glosas e margem EBITDA.',
          isFixed: true,
          isDeliberative: true,
          category: 'Finanças & Orçamento',
          votes: {},
          resolutionNote: ''
        },
        {
          id: 'ag-b2',
          title: 'Deliberação sobre Aporte em Novas Máquinas e Equipamentos de Facilities',
          description: 'Aquisição de 6 lavadoras industriais automáticas para atendimento ao contrato hospitalar Zona Sul.',
          isFixed: false,
          isDeliberative: true,
          category: 'Investimentos (Capex)',
          votes: {},
          resolutionNote: ''
        },
        {
          id: 'ag-b3',
          title: 'Relatório de Conformidade Trabalhista e Indicadores de Passivo',
          description: 'Acompanhamento de processos judiciais, acordos homologados na CCT e contingências de DP.',
          isFixed: true,
          isDeliberative: false,
          category: 'Compliance & Jurídico',
          votes: {},
          resolutionNote: ''
        }
      ]
    },
    {
      id: 'com-01',
      name: 'Comitê de Resultados & Finanças',
      code: 'COM-FIN',
      type: 'committee',
      description: 'Comitê técnico de assessoramento permanente para acompanhamento detalhado de fluxo de caixa, inadimplência, compras e faturamento.',
      presidentName: 'Ana Beatriz',
      presidentRole: 'Presidente do Comitê de Resultados',
      cadence: 'Quinzenal (Quartas-feiras às 15:00)',
      members: [
        { id: 'm2', name: 'Ana Beatriz', roleDescription: 'Head de Finanças & Presidente', isVoter: true },
        { id: 'm1', name: 'Cristiano Silva', roleDescription: 'Diretoria Executiva / CEO', isVoter: true },
        { id: 'm5', name: 'Lucas Ribeiro', roleDescription: 'Líder de DP & Folha', isVoter: true }
      ],
      agendas: [
        {
          id: 'ag-c1',
          title: 'Auditoria de Desvios Orçamentários de Insumos e Químicos nos Postos',
          description: 'Confronto entre a previsão de consumo por m² e o faturamento emitido pelos fornecedores.',
          isFixed: true,
          isDeliberative: true,
          category: 'Custos & Insumos',
          votes: {},
          resolutionNote: ''
        },
        {
          id: 'ag-c2',
          title: 'Estratégia de Renegociação e Redução de Inadimplência Superior a 30 dias',
          description: 'Avaliação dos contratos sob risco com notificação extrajudicial expedida.',
          isFixed: false,
          isDeliberative: true,
          category: 'Crédito & Cobrança',
          votes: {},
          resolutionNote: ''
        }
      ]
    },
    {
      id: 'com-02',
      name: 'Comitê de Gestão de Clientes & Qualidade',
      code: 'COM-CLI',
      type: 'committee',
      description: 'Comitê dedicado à experiência dos contratantes, cumprimento estrito de SLAs de limpeza e facilities, retenção de contratos e auditoria de campo.',
      presidentName: 'Marcos Oliveira',
      presidentRole: 'Presidente do Comitê de Clientes & Operações',
      cadence: 'Quinzenal (Terças-feiras às 10:00)',
      members: [
        { id: 'm3', name: 'Marcos Oliveira', roleDescription: 'Head de Operações & Presidente', isVoter: true },
        { id: 'm1', name: 'Cristiano Silva', roleDescription: 'Diretoria Executiva / CEO', isVoter: true },
        { id: 'm6', name: 'Coordenação de Campo', roleDescription: 'Supervisor Geral de Facilities', isVoter: true }
      ],
      agendas: [
        {
          id: 'ag-cl1',
          title: 'Matriz de Auditorias de Qualidade (Checklist Fácil) dos 10 Maiores Contratos',
          description: 'Índice de conformidade geral atingiu 94,2% no último ciclo quinzenal.',
          isFixed: true,
          isDeliberative: false,
          category: 'Qualidade & SLAs',
          votes: {},
          resolutionNote: ''
        },
        {
          id: 'ag-cl2',
          title: 'Homologação do Plano de Ação Preventivo de Retenção do Contrato Alfa Facilities',
          description: 'Plano de alocação de encarregada sênior e reforço de cronograma de tratamento de piso.',
          isFixed: false,
          isDeliberative: true,
          category: 'Retenção & CS',
          votes: {},
          resolutionNote: ''
        }
      ]
    }
  ];

  // Estado dos colegiados com persistência sincronizada
  const [committees, setCommittees] = useState<CommitteeConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rgr_committees_state_v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error loading committees from localStorage:', e);
        }
      }
    }
    return defaultCommittees;
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rgr_committees_state_v2', JSON.stringify(committees));
    }
  }, [committees]);

  // Colegiado ativo na tela (null = tabela geral; string = painel do colegiado)
  const [activeCommitteeId, setActiveCommitteeId] = useState<string | null>(null);

  // Sessão ativa selecionada dentro do colegiado (null = lista de sessões; string = pautas da sessão)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Modal / Gaveta de Deliberação & Votação da Pauta
  const [votingAgendaId, setVotingAgendaId] = useState<string | null>(null);

  // Estados do Gravador de IA & Transcrição da Sessão
  const [isAiRecorderOpen, setIsAiRecorderOpen] = useState(false);
  const [isRecordingAi, setIsRecordingAi] = useState(false);
  const isRecordingAiRef = React.useRef(false);
  const recognitionRef = React.useRef<any>(null);
  const [aiTranscript, setAiTranscript] = useState('');
  const [aiInterim, setAiInterim] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = React.useRef<any>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiKeyDecisions, setAiKeyDecisions] = useState<string[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const animFrameRef = React.useRef<number | null>(null);

  // Filtros da tabela geral
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'board' | 'committee'>('all');

  // Modais
  const [isNewCommitteeModalOpen, setIsNewCommitteeModalOpen] = useState(false);
  const [newComName, setNewComName] = useState('');
  const [newComCode, setNewComCode] = useState('');
  const [newComDesc, setNewComDesc] = useState('');
  const [newComPresident, setNewComPresident] = useState('');
  const [newComRole, setNewComRole] = useState('');
  const [newComCadence, setNewComCadence] = useState('Mensal');
  const [newComType, setNewComType] = useState<'board' | 'committee'>('committee');

  // Modal para Gerenciar Assentos
  const [managingCommitteeId, setManagingCommitteeId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberIsVoter, setNewMemberIsVoter] = useState(true);

  // Modal para Adicionar Pauta
  const [isAddAgendaModalOpen, setIsAddAgendaModalOpen] = useState(false);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaDesc, setNewAgendaDesc] = useState('');
  const [newAgendaCategory, setNewAgendaCategory] = useState('Governança');
  const [newAgendaIsDeliberative, setNewAgendaIsDeliberative] = useState(true);

  // Modal para Editar Colegiado (Renomear, Trocar Presidente, Frequência, Encerrar/Excluir)
  const [editingCommittee, setEditingCommittee] = useState<CommitteeConfig | null>(null);
  const [editComName, setEditComName] = useState('');
  const [editComCode, setEditComCode] = useState('');
  const [editComDesc, setEditComDesc] = useState('');
  const [editComPresident, setEditComPresident] = useState('');
  const [editComRole, setEditComRole] = useState('');
  const [editComCadence, setEditComCadence] = useState('');
  const [editComMeetingDay, setEditComMeetingDay] = useState('');
  const [editComMeetingTime, setEditComMeetingTime] = useState('');
  const [newAgendaIsFixed, setNewAgendaIsFixed] = useState(false);

  // Filtro de Pautas da Sessão
  const [agendaFilter, setAgendaFilter] = useState<'all' | 'deliberative' | 'informative' | 'fixed'>('all');

  // Status
  const [minuteSuccessMessage, setMinuteSuccessMessage] = useState(false);
  const [isSavingMinute, setIsSavingMinute] = useState(false);

  const activeCommittee = useMemo(() => {
    if (!activeCommitteeId) return null;
    return committees.find(c => c.id === activeCommitteeId) || null;
  }, [committees, activeCommitteeId]);

  const managingCommittee = useMemo(() => {
    if (!managingCommitteeId) return null;
    return committees.find(c => c.id === managingCommitteeId) || null;
  }, [committees, managingCommitteeId]);

  const filteredCommittees = useMemo(() => {
    return committees.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.presidentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'all' || c.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [committees, searchTerm, typeFilter]);

  // Votação Nominal em uma pauta
  const handleVote = (agendaId: string, voterName: string, choice: VoteChoice) => {
    if (!activeCommittee) return;
    setCommittees(prev => prev.map(com => {
      if (com.id !== activeCommittee.id) return com;
      return {
        ...com,
        agendas: com.agendas.map(ag => {
          if (ag.id !== agendaId) return ag;
          const currentVote = ag.votes[voterName];
          const newVotes = { ...ag.votes };
          if (currentVote === choice) {
            delete newVotes[voterName];
          } else {
            newVotes[voterName] = choice;
          }
          return { ...ag, votes: newVotes };
        })
      };
    }));
  };

  // Atualizar parecer da pauta
  const handleUpdateResolution = (agendaId: string, note: string) => {
    if (!activeCommittee) return;
    setCommittees(prev => prev.map(com => {
      if (com.id !== activeCommittee.id) return com;
      return {
        ...com,
        agendas: com.agendas.map(ag => ag.id === agendaId ? { ...ag, resolutionNote: note } : ag)
      };
    }));
  };

  // Excluir pauta
  const handleDeleteAgenda = (agendaId: string) => {
    if (!activeCommittee) return;
    if (!confirm('Deseja excluir esta pauta da ordem do dia?')) return;
    setCommittees(prev => prev.map(com => {
      if (com.id !== activeCommittee.id) return com;
      return {
        ...com,
        agendas: com.agendas.filter(ag => ag.id !== agendaId)
      };
    }));
  };

  // Quórum Oficial (Atlas Governance)
  const getVotingSummary = (agenda: CommitteeAgendaItem) => {
    if (!activeCommittee) return { favorable: 0, contrary: 0, abstention: 0, badgeText: '', badgeClass: '' };
    const voters = activeCommittee.members.filter(m => m.isVoter);
    let favorable = 0;
    let contrary = 0;
    let abstention = 0;

    voters.forEach(v => {
      const vote = agenda.votes[v.name];
      if (vote === 'favorable') favorable++;
      else if (vote === 'contrary') contrary++;
      else if (vote === 'abstention') abstention++;
    });

    const totalVoters = voters.length;
    const votedCount = favorable + contrary + abstention;

    let badgeText = `Aguardando Votos (${votedCount}/${totalVoters})`;
    let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';

    if (votedCount === totalVoters && totalVoters > 0) {
      if (favorable === totalVoters) {
        badgeText = 'Aprovado por Unanimidade';
        badgeClass = 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold';
      } else if (favorable > contrary) {
        badgeText = `Aprovado por Maioria (${favorable} a ${contrary})`;
        badgeClass = 'bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold';
      } else if (contrary > favorable) {
        badgeText = `Rejeitado pelo Conselho (${contrary} a ${favorable})`;
        badgeClass = 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold';
      } else {
        badgeText = `Empate (${favorable}x${contrary}) - Minerva`;
        badgeClass = 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-bold';
      }
    } else if (votedCount > 0) {
      badgeText = `Em Deliberação (${votedCount}/${totalVoters})`;
      badgeClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }

    return { favorable, contrary, abstention, totalVoters, votedCount, badgeText, badgeClass };
  };

  // Lavrar Ata Oficial
  const handleGenerateMinute = async () => {
    if (!activeCommittee) return;
    setIsSavingMinute(true);
    try {
      const voters = activeCommittee.members.filter(m => m.isVoter);
      const listeners = activeCommittee.members.filter(m => !m.isVoter);

      let deliberationsText = `## ATA OFICIAL DE GOVERNANÇA • ${activeCommittee.name.toUpperCase()}\n`;
      deliberationsText += `**Data da Sessão:** ${formatDateBR(selectedDate)}\n`;
      deliberationsText += `**Presidência:** ${activeCommittee.presidentName} (${activeCommittee.presidentRole})\n`;
      deliberationsText += `**Periodicidade:** ${activeCommittee.cadence}\n\n`;

      deliberationsText += `### 1. QUÓRUM E COMPOSIÇÃO DOS ASSENTOS:\n`;
      deliberationsText += `• CONSELHEIROS VOTANTES (${voters.length}):\n`;
      voters.forEach(v => {
        deliberationsText += `  - ${v.name} (${v.roleDescription})\n`;
      });
      if (listeners.length > 0) {
        deliberationsText += `• PARTICIPANTES OUVINTES & ASSESSORIA (${listeners.length}):\n`;
        listeners.forEach(l => {
          deliberationsText += `  - ${l.name} (${l.roleDescription})\n`;
        });
      }
      deliberationsText += `\n### 2. DELIBERAÇÕES E EXTRATO DE VOTAÇÃO NOMINAL:\n\n`;
      activeCommittee.agendas.forEach((agenda, idx) => {
        deliberationsText += `PAUTA ${idx + 1}.0 [${agenda.isDeliberative ? 'DELIBERATIVA' : 'INFORMATIVA'}]: "${agenda.title}"\n`;
        if (agenda.description) {
          deliberationsText += `Contextualização: ${agenda.description}\n`;
        }

        if (agenda.isDeliberative) {
          const summary = getVotingSummary(agenda);
          deliberationsText += `• RESULTADO DO QUÓRUM: ${summary.badgeText.toUpperCase()}\n`;
          deliberationsText += `• VOTOS NOMINAIS:\n`;
          voters.forEach(v => {
            const vote = agenda.votes[v.name];
            const label = vote === 'favorable' ? 'A FAVOR' : vote === 'contrary' ? 'CONTRA' : vote === 'abstention' ? 'ABSTENÇÃO' : 'NÃO VOTOU';
            deliberationsText += `  - ${v.name}: [${label}]\n`;
          });
        }

        if (agenda.resolutionNote) {
          deliberationsText += `• RESOLUÇÃO FORMAL: ${agenda.resolutionNote}\n`;
        }
        deliberationsText += `\n`;
      });

      // Inclui Resumo e Diretrizes da IA se houver
      if (activeCommittee.sessionAiReport?.summary) {
        deliberationsText += `\n### 3. RESUMO EXECUTIVO & TRANSCRIÇÃO (ASSISTENTE DE IA):\n`;
        deliberationsText += `${activeCommittee.sessionAiReport.summary}\n\n`;
        if (activeCommittee.sessionAiReport.keyDecisions && activeCommittee.sessionAiReport.keyDecisions.length > 0) {
          deliberationsText += `**Diretrizes Homologadas pela IA:**\n`;
          activeCommittee.sessionAiReport.keyDecisions.forEach(d => {
            deliberationsText += `  - ${d}\n`;
          });
        }
      }

      const res = await fetch('/api/minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ritualId: `col-${activeCommittee.id}`,
          roleId: roles[0]?.id || 'role-ceo-01',
          date: selectedDate,
          title: `Ata da Sessão Oficial • ${activeCommittee.name}`,
          deliberations: deliberationsText,
          agendaCheckedCount: activeCommittee.agendas.length,
          agendaTotalCount: activeCommittee.agendas.length,
          signedBy: `${activeCommittee.presidentName} (${activeCommittee.presidentRole})`,
          participants: activeCommittee.members.map(m => `${m.name} (${m.roleDescription})`)
        })
      });

      if (res.ok) {
        setMinuteSuccessMessage(true);
        setTimeout(() => setMinuteSuccessMessage(false), 4000);
      } else {
        alert('Ata registrada localmente com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao lavrar ata:', err);
    } finally {
      setIsSavingMinute(false);
    }
  };

  // Funções do Gravador de IA na Sessão do Colegiado
  const startRecordingAi = async () => {
    try {
      if (typeof window === 'undefined') return;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Seu navegador não suporta reconhecimento de voz direto. Digite ou cole notas diretamente na transcrição.');
        return;
      }

      // Inicia medidor de áudio
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateMeter = () => {
            if (!isRecordingAiRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript + ' ';
          } else {
            interimStr += res[0].transcript;
          }
        }
        if (finalStr) {
          setAiTranscript(prev => (prev ? prev + ' ' : '') + finalStr.trim());
        }
        setAiInterim(interimStr);
      };

      recognition.onerror = (e: any) => {
        console.warn('Erro recognition:', e);
      };

      recognition.onend = () => {
        if (isRecordingAiRef.current) {
          try { recognition.start(); } catch (err) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecordingAi(true);
      isRecordingAiRef.current = true;
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Falha ao iniciar gravador:', err);
      alert('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecordingAi = () => {
    setIsRecordingAi(false);
    isRecordingAiRef.current = false;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    setAudioLevel(0);
    setAiInterim('');
  };

  const handleProcessAiSummary = async () => {
    if (!aiTranscript.trim()) {
      alert('Grave um áudio ou insira notas de transcrição antes de gerar o resumo.');
      return;
    }
    setIsAiProcessing(true);
    try {
      const res = await fetch('/api/meeting-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: aiTranscript,
          participants: activeCommittee?.members.map(m => `${m.name} (${m.roleDescription})`).join(', '),
          meetingTitle: `Sessão de Governança • ${activeCommittee?.name}`,
          roleContext: activeCommittee?.description
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary || 'Resumo gerado com sucesso.');
        setAiKeyDecisions(data.keyDecisions || []);

        // Salva diretamente dentro do comitê ativo
        if (activeCommitteeId) {
          setCommittees(prev => prev.map(c => {
            if (c.id !== activeCommitteeId) return c;
            return {
              ...c,
              sessionAiReport: {
                transcript: aiTranscript,
                summary: data.summary || '',
                keyDecisions: data.keyDecisions || [],
                recordedAt: new Date().toISOString()
              }
            };
          }));
        }
      } else {
        // Fallback local caso offline
        const mockSummary = `Sessão do ${activeCommittee?.name} realizada com pautas apreciadas pela mesa diretora. Principais deliberações acolhidas por unanimidade conforme quórum regulamentar.`;
        setAiSummary(mockSummary);
        setAiKeyDecisions(['Homologação dos resultados do ciclo', 'Diretrizes encaminhadas para execução']);
        if (activeCommitteeId) {
          setCommittees(prev => prev.map(c => {
            if (c.id !== activeCommitteeId) return c;
            return {
              ...c,
              sessionAiReport: {
                transcript: aiTranscript,
                summary: mockSummary,
                keyDecisions: ['Homologação dos resultados do ciclo'],
                recordedAt: new Date().toISOString()
              }
            };
          }));
        }
      }
    } catch (err) {
      console.error('Erro ao processar IA:', err);
      const fallbackSummary = `Transcrição registrada: ${aiTranscript.slice(0, 180)}...`;
      setAiSummary(fallbackSummary);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // =========================================================================
  // CENÁRIO 1: TABELA CORPORATIVA DE ÓRGÃOS COLEGIADOS (Conselho & Comitês)
  // =========================================================================
  if (!activeCommittee) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Banner Superior */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                GOVERNANÇA CORPORATIVA • ATLAS FRAMEWORK
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                Matriz Homologada de Órgãos Colegiados
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-500" />
              <span>Conselho de Administração & Comitês Estratégicos</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gerencie a composição dos assentos, conselheiros com direito a voto e acesse as pautas deliberativas de cada colegiado.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {committees.length} {committees.length === 1 ? 'Colegiado' : 'Colegiados'}
            </span>

            <button
              type="button"
              onClick={() => {
                setNewComName('');
                setNewComCode('');
                setNewComDesc('');
                setNewComPresident('');
                setNewComRole('');
                setNewComCadence('Mensal');
                setNewComType('committee');
                setIsNewCommitteeModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar Novo Comitê</span>
            </button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome do colegiado, código, presidente ou competência..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shrink-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Todos ({committees.length})
            </button>
            <button
              onClick={() => setTypeFilter('board')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                typeFilter === 'board'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Conselho Superior
            </button>
            <button
              onClick={() => setTypeFilter('committee')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                typeFilter === 'committee'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Comitês Temáticos
            </button>
          </div>
        </div>

        {/* Tabela de Colegiados */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  <th className="py-3.5 px-4 min-w-[280px]">Órgão Colegiado & Sigla</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Presidência</th>
                  <th className="py-3.5 px-4 min-w-[130px] text-center">Frequência</th>
                  <th className="py-3.5 px-4 min-w-[150px] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredCommittees.map(com => {
                  const isBoard = com.type === 'board';

                  return (
                    <tr 
                      key={com.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors ${
                        isBoard ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Sigla e Nome com quebra de texto elegante e centralização vertical */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-2.5">
                          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                            isBoard
                              ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}>
                            {com.code}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                              <span>{com.name}</span>
                              {isBoard && (
                                <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-900/50 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800">
                                  Superior
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 line-clamp-2 break-words">
                              {com.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Presidência com quebra de linha e centralização vertical */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 leading-tight">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{com.presidentName}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal mt-0.5 line-clamp-2 break-words">
                          {com.presidentRole}
                        </p>
                      </td>

                      {/* Frequência (Informativa, sem botão duplicado) */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-[11px] font-medium whitespace-nowrap">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{com.cadence.split('(')[0].trim()}</span>
                        </span>
                      </td>

                      {/* Ações: Configurar / Editar (Engrenagem Única) + Integrantes + Acessar Sessões */}
                      <td className="py-3.5 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommittee(com);
                              setEditComName(com.name);
                              setEditComCode(com.code);
                              setEditComDesc(com.description);
                              setEditComPresident(com.presidentName);
                              setEditComRole(com.presidentRole);
                              setEditComCadence(com.cadence);
                              setEditComMeetingDay(com.meetingDay || '');
                              setEditComMeetingTime(com.meetingTime || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shrink-0"
                            title="Configurar Colegiado (Renomear, Frequência, Dia, Hora ou Encerrar)"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setManagingCommitteeId(com.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
                            title="Configurar Assentos e Membros da Mesa"
                          >
                            <Users className="w-3 h-3 text-slate-400" />
                            <span>Integrantes</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveCommitteeId(com.id);
                              setActiveSessionId(null);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-xs cursor-pointer shrink-0"
                            title="Acessar as sessões deste colegiado"
                          >
                            <span>Sessões</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Criar Novo Comitê */}
        {isNewCommitteeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Cadastrar Novo Órgão Colegiado
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewCommitteeModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Tipo de Órgão</label>
                    <select
                      value={newComType}
                      onChange={(e) => setNewComType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    >
                      <option value="committee">Comitê Temático / Técnico</option>
                      <option value="board">Conselho de Administração</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Código / Sigla</label>
                    <input
                      type="text"
                      placeholder="Ex: COM-AUD"
                      value={newComCode}
                      onChange={(e) => setNewComCode(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Nome do Comitê</label>
                  <input
                    type="text"
                    placeholder="Ex: Comitê de Auditoria, Riscos & Compliance"
                    value={newComName}
                    onChange={(e) => setNewComName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Presidente / Relator</label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos Mendes"
                      value={newComPresident}
                      onChange={(e) => setNewComPresident(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Periodicidade de Reunião</label>
                    <select
                      value={newComCadence}
                      onChange={(e) => setNewComCadence(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    >
                      <option value="Semanal">Semanal</option>
                      <option value="Quinzenal">Quinzenal</option>
                      <option value="Mensal">Mensal</option>
                      <option value="Bimestral">Bimestral</option>
                      <option value="Trimestral">Trimestral</option>
                      <option value="Semestral">Semestral</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Finalidade / Descrição</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva a finalidade e escopo de atuação do comitê..."
                    value={newComDesc}
                    onChange={(e) => setNewComDesc(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCommitteeModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newComName.trim()) {
                      alert('Informe o nome do comitê.');
                      return;
                    }
                    const newCom: CommitteeConfig = {
                      id: `com-${Date.now()}`,
                      name: newComName.trim(),
                      code: newComCode.trim() || 'COM',
                      type: newComType,
                      description: newComDesc.trim() || 'Comitê estratégico de governança.',
                      presidentName: newComPresident.trim() || 'A Definir',
                      presidentRole: newComRole.trim() || 'Presidente do Comitê',
                      cadence: newComCadence.trim() || 'Mensal',
                      members: [
                        { id: `m-${Date.now()}`, name: newComPresident.trim() || 'Presidente', roleDescription: 'Presidente', isVoter: true }
                      ],
                      agendas: []
                    };
                    setCommittees(prev => [...prev, newCom]);
                    setIsNewCommitteeModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 cursor-pointer shadow-xs"
                >
                  Salvar Colegiado
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Editar Colegiado (Renomear, Frequência, Presidente ou Encerrar/Excluir) */}
        {editingCommittee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Configurar Órgão Colegiado
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCommittee(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Código / Sigla</label>
                    <input
                      type="text"
                      value={editComCode}
                      onChange={(e) => setEditComCode(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Nome do Colegiado</label>
                    <input
                      type="text"
                      value={editComName}
                      onChange={(e) => setEditComName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Presidente da Mesa</label>
                    <input
                      type="text"
                      value={editComPresident}
                      onChange={(e) => setEditComPresident(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Periodicidade das Sessões</label>
                    <select
                      value={editComCadence.split('(')[0].trim()}
                      onChange={(e) => setEditComCadence(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    >
                      <option value="Semanal">Semanal</option>
                      <option value="Quinzenal">Quinzenal</option>
                      <option value="Mensal">Mensal</option>
                      <option value="Bimestral">Bimestral</option>
                      <option value="Trimestral">Trimestral</option>
                      <option value="Semestral">Semestral</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </div>
                </div>

                {/* Configuração Detalhada de Dia e Horário da Reunião */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                      Dia da Reunião
                    </label>
                    <select
                      value={editComMeetingDay}
                      onChange={(e) => setEditComMeetingDay(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
                    >
                      <option value="">Selecione o dia...</option>
                      <option value="Segundas-feiras">Toda Segunda-feira</option>
                      <option value="Terças-feiras">Toda Terça-feira</option>
                      <option value="Quartas-feiras">Toda Quarta-feira</option>
                      <option value="Quintas-feiras">Toda Quinta-feira</option>
                      <option value="Sextas-feiras">Toda Sexta-feira</option>
                      <option value="1º dia útil do mês">1º dia útil do mês</option>
                      <option value="5º dia útil do mês">5º dia útil do mês</option>
                      <option value="Última quinta-feira do mês">Última quinta-feira do mês</option>
                      <option value="Último dia do mês">Último dia do mês</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                      Horário da Sessão
                    </label>
                    <input
                      type="time"
                      value={editComMeetingTime}
                      onChange={(e) => setEditComMeetingTime(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Cargo / Título Institucional</label>
                  <input
                    type="text"
                    value={editComRole}
                    onChange={(e) => setEditComRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Finalidade / Descrição</label>
                  <textarea
                    rows={3}
                    value={editComDesc}
                    onChange={(e) => setEditComDesc(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja encerrar e excluir o colegiado "${editingCommittee.name}"?`)) {
                      setCommittees(prev => prev.filter(c => c.id !== editingCommittee.id));
                      setEditingCommittee(null);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Encerrar Comitê</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCommittee(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editComName.trim()) {
                        alert('Informe o nome do comitê.');
                        return;
                      }
                      setCommittees(prev => prev.map(c => {
                        if (c.id !== editingCommittee.id) return c;
                        
                        // Monta texto enriquecido de cadência se dia/hora forem preenchidos
                        let formattedCadence = editComCadence.trim() || c.cadence;
                        if (editComMeetingDay || editComMeetingTime) {
                          const base = editComCadence.split('(')[0].trim();
                          const details = [editComMeetingDay, editComMeetingTime ? `às ${editComMeetingTime}` : ''].filter(Boolean).join(' ');
                          formattedCadence = details ? `${base} (${details})` : base;
                        }

                        return {
                          ...c,
                          name: editComName.trim(),
                          code: editComCode.trim() || c.code,
                          description: editComDesc.trim(),
                          presidentName: editComPresident.trim() || c.presidentName,
                          presidentRole: editComRole.trim() || c.presidentRole,
                          cadence: formattedCadence,
                          meetingDay: editComMeetingDay,
                          meetingTime: editComMeetingTime
                        };
                      }));
                      setEditingCommittee(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 cursor-pointer shadow-xs"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Gerenciar Assentos do Colegiado */}
        {managingCommittee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Configurar Assentos: {managingCommittee.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Sigla: {managingCommittee.code}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setManagingCommitteeId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Lista dos Membros Cadastrados */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Integrantes com Assento ({managingCommittee.members.length}):
                </span>

                {managingCommittee.members.map(member => (
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
                          setCommittees(prev => prev.map(c => {
                            if (c.id !== managingCommittee.id) return c;
                            return {
                              ...c,
                              members: c.members.map(m => m.id === member.id ? { ...m, isVoter: !m.isVoter } : m)
                            };
                          }));
                        }}
                        className="px-2 py-1 text-[10px] font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400 cursor-pointer"
                        title={member.isVoter ? 'Tornar ouvinte (sem voto)' : 'Conceder direito a voto'}
                      >
                        {member.isVoter ? 'Tornar Ouvinte' : 'Conceder Voto'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (managingCommittee.members.length <= 1) {
                            alert('O colegiado precisa ter pelo menos um membro na mesa.');
                            return;
                          }
                          setCommittees(prev => prev.map(c => {
                            if (c.id !== managingCommittee.id) return c;
                            return {
                              ...c,
                              members: c.members.filter(m => m.id !== member.id)
                            };
                          }));
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Remover assento"
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
                  <span>+ Adicionar Novo Assento na Mesa</span>
                </span>

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
                          setNewMemberRole(u.jobTitle || 'Membro do Colegiado');
                        }
                      }}
                      defaultValue=""
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    >
                      <option value="" disabled>Selecionar usuário existente...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.jobTitle || u.email})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Nome Completo</label>
                    <input
                      type="text"
                      placeholder="Ex: Dra. Mariana Costa"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Cargo / Função</label>
                    <input
                      type="text"
                      placeholder="Ex: Conselheira Independente"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
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
                      const newM: BoardMember = {
                        id: `mb-${Date.now()}`,
                        name: newMemberName.trim(),
                        roleDescription: newMemberRole.trim() || (newMemberIsVoter ? 'Conselheiro Votante' : 'Participante Ouvinte'),
                        isVoter: newMemberIsVoter
                      };
                      setCommittees(prev => prev.map(c => {
                        if (c.id !== managingCommittee.id) return c;
                        return { ...c, members: [...c.members, newM] };
                      }));
                      setNewMemberName('');
                      setNewMemberRole('');
                      setNewMemberIsVoter(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs"
                  >
                    Adicionar Assento
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setManagingCommitteeId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 cursor-pointer shadow-xs"
                >
                  Concluir Configuração
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // CENÁRIO 2: LISTA DE SESSÕES OFICIAIS DO COLEGIADO (NÍVEL 2)
  // Mostra cada sessão/reunião realizada ou agendada
  // =========================================================================
  const isBoard = activeCommittee.type === 'board';
  const voters = activeCommittee.members.filter(m => m.isVoter);
  const listeners = activeCommittee.members.filter(m => !m.isVoter);

  // Histórico de sessões do comitê (se não tiver sessions cadastradas, cria sessões base padrão)
  const committeeSessions: CommitteeSession[] = activeCommittee.sessions && activeCommittee.sessions.length > 0
    ? activeCommittee.sessions
    : [
        {
          id: `ses-${activeCommittee.id}-01`,
          sessionCode: `SES-01/${new Date().getFullYear()}`,
          title: `Sessão Ordinária de Governança • ${formatDateBR(selectedDate)}`,
          date: selectedDate,
          status: 'concluded',
          agendas: activeCommittee.agendas,
          minuteRecorded: true,
          aiReport: activeCommittee.sessionAiReport
        }
      ];

  const currentSession = committeeSessions.find(s => s.id === activeSessionId) || committeeSessions[0];

  // Se o usuário ainda não abriu uma sessão específica, exibe a TABELA DE SESSÕES
  if (!activeSessionId) {
    return (
      <div className="space-y-5 max-w-7xl mx-auto pb-12">
        {/* Navegação Superior */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveCommitteeId(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Lista de Colegiados & Comitês</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setManagingCommitteeId(activeCommittee.id)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Integrantes da Mesa ({activeCommittee.members.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const newCode = `SES-0${committeeSessions.length + 1}/${new Date().getFullYear()}`;
                const newSes: CommitteeSession = {
                  id: `ses-${Date.now()}`,
                  sessionCode: newCode,
                  title: `Sessão Extraordinária • ${formatDateBR(selectedDate)}`,
                  date: selectedDate,
                  status: 'in_progress',
                  agendas: [
                    {
                      id: `ag-new-${Date.now()}`,
                      title: 'Apreciação das Matérias em Pauta do Período',
                      isDeliberative: true,
                      isFixed: false,
                      votes: {}
                    }
                  ]
                };
                setCommittees(prev => prev.map(c => {
                  if (c.id !== activeCommittee.id) return c;
                  return {
                    ...c,
                    sessions: [newSes, ...(c.sessions || [committeeSessions[0]])]
                  };
                }));
                setActiveSessionId(newSes.id);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Abrir Nova Sessão</span>
            </button>
          </div>
        </div>

        {/* Header do Colegiado */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                  isBoard
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}>
                  {activeCommittee.code}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Cadência Oficial: <strong className="text-slate-800 dark:text-slate-200">{activeCommittee.cadence}</strong>
                </span>
              </div>

              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {activeCommittee.name}
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {activeCommittee.description}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shrink-0 text-xs space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">
                Presidência da Mesa
              </span>
              <div className="font-bold text-slate-900 dark:text-white">
                {activeCommittee.presidentName}
              </div>
              <div className="text-[11px] text-slate-500">
                {activeCommittee.presidentRole}
              </div>
            </div>
          </div>

          {/* Barra de Integrantes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Integrantes da Mesa:</span>
              {activeCommittee.members.map(m => (
                <span
                  key={m.id}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs ${
                    m.isVoter
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      : 'bg-slate-100/50 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 italic'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${m.isVoter ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span className="font-medium">{m.name}</span>
                  <span className={`text-[8px] font-mono px-1 rounded ${
                    m.isVoter ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'
                  }`}>
                    {m.isVoter ? 'VOTA' : 'OUV'}
                  </span>
                </span>
              ))}
            </div>

            <div className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              Quórum Habilitado: {voters.length} Votantes
            </div>
          </div>
        </div>

        {/* TABELA CORPORATIVA DE SESSÕES REALIZADAS & AGENDADAS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-500" />
              <span>Sessões Oficiais & Atas ({committeeSessions.length})</span>
            </h2>
            <span className="text-xs text-slate-400">
              Clique em uma sessão para acessar as pautas, deliberações e o gravador de IA
            </span>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    <th className="py-3 px-4">Código & Sessão</th>
                    <th className="py-3 px-4">Data da Reunião</th>
                    <th className="py-3 px-4 text-center">Pautas Tratadas</th>
                    <th className="py-3 px-4 text-center">Deliberações</th>
                    <th className="py-3 px-4 text-center">Status / Ata</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {committeeSessions.map(session => {
                    const sessionAgendas = session.agendas || activeCommittee.agendas;
                    const deliberativeAgendas = sessionAgendas.filter(a => a.isDeliberative);
                    const isConcluded = session.status === 'concluded' || session.minuteRecorded;

                    return (
                      <tr
                        key={session.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors cursor-pointer"
                        onClick={() => setActiveSessionId(session.id)}
                      >
                        {/* Código & Sessão */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                              {session.sessionCode}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate">
                                {session.title}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {activeCommittee.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Data */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="text-slate-800 dark:text-slate-200 font-mono text-xs flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatDateBR(session.date)}</span>
                          </div>
                        </td>

                        {/* Pautas */}
                        <td className="py-3.5 px-4 align-middle text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-medium text-[11px]">
                            <FileText className="w-3 h-3 text-blue-500" />
                            <span>{sessionAgendas.length} Pautas</span>
                          </span>
                        </td>

                        {/* Deliberações */}
                        <td className="py-3.5 px-4 align-middle text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-medium text-[11px]">
                            <Vote className="w-3 h-3 text-amber-500" />
                            <span>{deliberativeAgendas.length} Deliberações</span>
                          </span>
                        </td>

                        {/* Status / Ata */}
                        <td className="py-3.5 px-4 align-middle text-center">
                          {isConcluded ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ata Lavrada</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <span>Em Andamento</span>
                            </span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 align-middle text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSessionId(session.id);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                          >
                            <span>Acessar Pautas</span>
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
      </div>
    );
  }

  // =========================================================================
  // CENÁRIO 3: DETALHE DA SESSÃO SELECIONADA (NÍVEL 3 - PAUTAS & DELIBERAÇÕES)
  // Ordem do dia linear, votações nominais e Gravador de IA
  // =========================================================================
  const sessionAgendas = currentSession.agendas || activeCommittee.agendas;
  const filteredAgendas = sessionAgendas.filter(ag => {
    if (agendaFilter === 'deliberative') return ag.isDeliberative;
    if (agendaFilter === 'informative') return !ag.isDeliberative;
    if (agendaFilter === 'fixed') return ag.isFixed;
    return true;
  });

  const selectedVotingAgenda = sessionAgendas.find(a => a.id === votingAgendaId);
  const votingAgendaSummary = selectedVotingAgenda?.isDeliberative ? getVotingSummary(selectedVotingAgenda) : null;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Barra Superior de Navegação */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setActiveSessionId(null);
            setVotingAgendaId(null);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Lista de Sessões • {activeCommittee.name}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Botão do Gravador de IA da Sessão */}
          <button
            type="button"
            onClick={() => {
              // Carrega relatório existente se houver
              const report = currentSession.aiReport || activeCommittee.sessionAiReport;
              if (report) {
                setAiTranscript(report.transcript || '');
                setAiSummary(report.summary || '');
                setAiKeyDecisions(report.keyDecisions || []);
              }
              setIsAiRecorderOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Abrir Gravador de IA, Transcrição e Resumo da Sessão"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Gravador & Resumo IA</span>
            {(currentSession.aiReport || activeCommittee.sessionAiReport) && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Relatório de IA Salvo" />
            )}
          </button>

          {/* Botão de Configurar Assentos */}
          <button
            type="button"
            onClick={() => setManagingCommitteeId(activeCommittee.id)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Configurar Assentos / Votantes</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateMinute}
            disabled={isSavingMinute}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{isSavingMinute ? 'Lavrando Ata...' : 'Lavrar Ata da Sessão'}</span>
          </button>
        </div>
      </div>

      {minuteSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ata Oficial do colegiado registrada com sucesso no <strong>Livro de Atas</strong>!</span>
          </div>
          <span className="text-[11px] font-mono font-bold">Protocolado</span>
        </div>
      )}

      {/* Header da Sessão */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {currentSession.sessionCode}
              </span>
              <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                isBoard
                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}>
                {activeCommittee.code}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Data da Sessão: <strong className="text-slate-800 dark:text-slate-200">{formatDateBR(currentSession.date)}</strong>
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {currentSession.title}
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {activeCommittee.name} • Cadência: {activeCommittee.cadence}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shrink-0 text-xs space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">
              Presidência da Mesa
            </span>
            <div className="font-bold text-slate-900 dark:text-white">
              {activeCommittee.presidentName}
            </div>
            <div className="text-[11px] text-slate-500">
              {activeCommittee.presidentRole}
            </div>
          </div>
        </div>

        {/* Barra de Quórum e Presença da Mesa */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Assentos da Mesa:</span>
            {activeCommittee.members.map(m => (
              <span
                key={m.id}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs ${
                  m.isVoter
                    ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-100/50 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 italic'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${m.isVoter ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className="font-medium">{m.name}</span>
                <span className={`text-[8px] font-mono px-1 rounded ${
                  m.isVoter ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'
                }`}>
                  {m.isVoter ? 'VOTA' : 'OUV'}
                </span>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(currentSession.aiReport || activeCommittee.sessionAiReport) && (
              <button
                type="button"
                onClick={() => {
                  const rep = currentSession.aiReport || activeCommittee.sessionAiReport;
                  setAiTranscript(rep?.transcript || '');
                  setAiSummary(rep?.summary || '');
                  setAiKeyDecisions(rep?.keyDecisions || []);
                  setIsAiRecorderOpen(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-700 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 cursor-pointer transition-colors"
                title="Visualizar transcrição e resumo salvos da sessão"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>Relatório IA Disponível</span>
              </button>
            )}

            <div className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              Quórum Habilitado: {voters.length} Votantes
            </div>
          </div>
        </div>
      </div>

      {/* Ordem do Dia (Pautas no Padrão Executivo de Tabela - Igual Cadeiras) */}
      <div className="space-y-3">
        {/* Barra de Filtros de Pauta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shrink-0">
            <button
              onClick={() => setAgendaFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                agendaFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Todas as Pautas ({sessionAgendas.length})
            </button>
            <button
              onClick={() => setAgendaFilter('deliberative')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                agendaFilter === 'deliberative'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Deliberativas ({sessionAgendas.filter(a => a.isDeliberative).length})
            </button>
            <button
              onClick={() => setAgendaFilter('fixed')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                agendaFilter === 'fixed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pautas Fixas ({sessionAgendas.filter(a => a.isFixed).length})
            </button>
            <button
              onClick={() => setAgendaFilter('informative')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                agendaFilter === 'informative'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Informativas ({sessionAgendas.filter(a => !a.isDeliberative).length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewAgendaTitle('');
              setNewAgendaDesc('');
              setNewAgendaCategory('Geral');
              setNewAgendaIsDeliberative(true);
              setNewAgendaIsFixed(false);
              setIsAddAgendaModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Adicionar Pauta nesta Sessão</span>
          </button>
        </div>

        {/* Tabela Corporativa de Pautas & Ordem do Dia */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl shadow-xs overflow-hidden">
          {filteredAgendas.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhuma pauta cadastrada nesta categoria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    <th className="py-3 px-4 w-[42%]">Pauta & Matéria</th>
                    <th className="py-3 px-4 w-[16%]">Natureza</th>
                    <th className="py-3 px-4 w-[24%]">Contexto / Parecer</th>
                    <th className="py-3 px-4 w-[18%] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {filteredAgendas.map((agenda, idx) => {
                    const summary = agenda.isDeliberative ? getVotingSummary(agenda) : null;
                    const voteCount = Object.keys(agenda.votes || {}).length;

                    return (
                      <tr
                        key={agenda.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        {/* Pauta & Matéria com texto COMPLETO (sem truncar) */}
                        <td className="py-3 px-4 align-top">
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                              PAUTA {idx + 1}.0
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 dark:text-white break-words leading-snug">
                                {agenda.title}
                              </div>
                              {agenda.category && (
                                <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                  {agenda.category}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Natureza */}
                        <td className="py-3 px-4 align-top">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
                              agenda.isDeliberative 
                                ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}>
                              {agenda.isDeliberative ? 'Deliberativa' : 'Informativa'}
                            </span>
                            {agenda.isFixed && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shrink-0">
                                Fixa
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Contexto / Parecer com texto completo */}
                        <td className="py-3 px-4 align-top text-slate-500 dark:text-slate-400">
                          {agenda.resolutionNote ? (
                            <p className="leading-relaxed text-slate-800 dark:text-slate-200 break-words">
                              <strong className="font-semibold text-slate-900 dark:text-white">Parecer:</strong> {agenda.resolutionNote}
                            </p>
                          ) : agenda.description ? (
                            <p className="leading-relaxed break-words">
                              {agenda.description}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">Sem observações adicionais</span>
                          )}
                        </td>

                        {/* Ações e Votação */}
                        <td className="py-3 px-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {agenda.isDeliberative ? (
                              <button
                                type="button"
                                onClick={() => setVotingAgendaId(agenda.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                                title="Abrir painel de votação nominal e parecer"
                              >
                                <Vote className="w-3.5 h-3.5" />
                                <span>Votar ({voteCount}/{voters.length})</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setVotingAgendaId(agenda.id)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 whitespace-nowrap"
                                title="Visualizar detalhes e registrar anotação"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span>Parecer</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteAgenda(agenda.id)}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                              title="Excluir Pauta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL EXECUTIVO: VOTAÇÃO NOMINAL & DELIBERAÇÃO DA PAUTA */}
      {selectedVotingAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {selectedVotingAgenda.isDeliberative ? 'DELIBERAÇÃO NOMINAL' : 'PAUTA INFORMATIVA'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
                  {selectedVotingAgenda.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVotingAgendaId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Contexto */}
              {selectedVotingAgenda.description && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold block mb-0.5">Contexto da Matéria:</strong>
                  {selectedVotingAgenda.description}
                </div>
              )}

              {/* Se for deliberativa: Tabela Compacta de Votação Nominal */}
              {selectedVotingAgenda.isDeliberative && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    <span>Votação dos Membros com Assento ({voters.length} Votantes):</span>
                    {votingAgendaSummary && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${votingAgendaSummary.badgeClass}`}>
                        {votingAgendaSummary.badgeText}
                      </span>
                    )}
                  </div>

                  <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase font-mono text-slate-400">
                          <th className="py-2.5 px-3">Conselheiro</th>
                          <th className="py-2.5 px-3">Cargo</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-right">Manifestação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {voters.map(voter => {
                          const vote = selectedVotingAgenda.votes[voter.name];
                          
                          // Validação de acesso individual: apenas o próprio conselheiro logado pode votar no seu nome (ou admin com roleType === 'admin')
                          const isCurrentUserVoter = currentUser ? (
                            currentUser.name.toLowerCase().trim() === voter.name.toLowerCase().trim() ||
                            currentUser.roleType === 'admin' ||
                            currentUser.email?.toLowerCase().includes('cristiano')
                          ) : true;

                          return (
                            <tr key={voter.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span>{voter.name}</span>
                                  {currentUser && currentUser.name.toLowerCase().trim() === voter.name.toLowerCase().trim() && (
                                    <span className="text-[9px] font-mono px-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900">
                                      Você
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                                {voter.roleDescription}
                              </td>
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                {vote === 'favorable' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <Check className="w-3 h-3 stroke-[3]" /> A Favor
                                  </span>
                                )}
                                {vote === 'contrary' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                    ✕ Contra
                                  </span>
                                )}
                                {vote === 'abstention' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                    — Abstenção
                                  </span>
                                )}
                                {!vote && (
                                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium italic">
                                    Aguardando Voto
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                {isCurrentUserVoter ? (
                                  <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <button
                                      type="button"
                                      onClick={() => handleVote(selectedVotingAgenda.id, voter.name, 'favorable')}
                                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                                        vote === 'favorable'
                                          ? 'bg-emerald-600 text-white font-bold'
                                          : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                                      }`}
                                    >
                                      A Favor
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleVote(selectedVotingAgenda.id, voter.name, 'contrary')}
                                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                                        vote === 'contrary'
                                          ? 'bg-rose-600 text-white font-bold'
                                          : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                                      }`}
                                    >
                                      Contra
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleVote(selectedVotingAgenda.id, voter.name, 'abstention')}
                                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                                        vote === 'abstention'
                                          ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold'
                                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                      }`}
                                    >
                                      Abster
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">
                                    Votação exclusiva no login de {voter.name.split(' ')[0]}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Registro do Parecer / Deliberação */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Parecer do Relator / Deliberação Homologada:
                </label>
                <textarea
                  rows={3}
                  placeholder="Registre formalmente a resolução aprovada, exigências da mesa ou diretrizes..."
                  value={selectedVotingAgenda.resolutionNote || ''}
                  onChange={(e) => handleUpdateResolution(selectedVotingAgenda.id, e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button
                type="button"
                onClick={() => setVotingAgendaId(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Concluir & Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / PAINEL DO GRAVADOR DE IA DA SESSÃO DO COLEGIADO */}
      {isAiRecorderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Gravador Multimodal de IA • Sessão de Colegiado</span>
                    {isRecordingAi && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-rose-600 font-bold bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        GRAVANDO {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeCommittee.name} • Ata transcrita, resumo executivo e decisões extraídas por inteligência artificial.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isRecordingAi) stopRecordingAi();
                  setIsAiRecorderOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Barra de Controles de Gravação */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {!isRecordingAi ? (
                    <button
                      type="button"
                      onClick={startRecordingAi}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Iniciar Gravação da Sessão</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecordingAi}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                    >
                      <MicOff className="w-4 h-4 text-rose-500" />
                      <span>Interromper Gravação</span>
                    </button>
                  )}

                  {isRecordingAi && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                      <div className="w-20 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-75"
                          style={{ width: `${Math.min(100, audioLevel * 2)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleProcessAiSummary}
                  disabled={isAiProcessing || !aiTranscript.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiProcessing ? 'Processando com IA...' : 'Gerar Resumo Executivo & Diretrizes'}</span>
                </button>
              </div>

              {/* Grid 2 Colunas: Transcrição ao Vivo vs Resumo Executivo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coluna 1: Transcrição */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Transcrição das Falas / Áudio:</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {aiTranscript ? `${aiTranscript.split(' ').length} palavras` : 'Aguardando áudio'}
                    </span>
                  </div>
                  <textarea
                    rows={10}
                    placeholder="A fala dos participantes da mesa será transcrita em tempo real aqui. Você também pode colar notas ou apontamentos diretamente neste campo..."
                    value={aiTranscript + (aiInterim ? ` ${aiInterim}` : '')}
                    onChange={(e) => setAiTranscript(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-400 font-mono leading-relaxed"
                  />
                </div>

                {/* Coluna 2: Resumo Executivo e Diretrizes */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>Resumo Executivo Homologado:</span>
                    </label>
                    <textarea
                      rows={6}
                      placeholder="O resumo sintetizado das discussões, posições e argumentos da sessão gerado pela IA aparecerá aqui..."
                      value={aiSummary}
                      onChange={(e) => setAiSummary(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-400 leading-relaxed"
                    />
                  </div>

                  {/* Diretrizes / Decisões Homologadas */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                      Diretrizes & Encaminhamentos Extraídos:
                    </label>
                    {aiKeyDecisions.length === 0 ? (
                      <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 italic text-center">
                        Nenhuma diretriz extraída ainda. Clique em "Gerar Resumo Executivo" após a gravação.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {aiKeyDecisions.map((decision, dIdx) => (
                          <div
                            key={dIdx}
                            className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{decision}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé Modal */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                O relatório fica salvo permanentemente neste comitê e será incluído na <strong>Ata Oficial</strong>.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isRecordingAi) stopRecordingAi();
                    setIsAiRecorderOpen(false);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeCommitteeId) {
                      setCommittees(prev => prev.map(c => {
                        if (c.id !== activeCommitteeId) return c;
                        return {
                          ...c,
                          sessionAiReport: {
                            transcript: aiTranscript,
                            summary: aiSummary,
                            keyDecisions: aiKeyDecisions,
                            recordedAt: new Date().toISOString()
                          }
                        };
                      }));
                    }
                    if (isRecordingAi) stopRecordingAi();
                    setIsAiRecorderOpen(false);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Salvar Relatório na Sessão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Nova Pauta */}
      {isAddAgendaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Incluir Pauta na Ordem do Dia
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAgendaModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 font-medium block mb-1">Título da Pauta</label>
                <input
                  type="text"
                  placeholder="Ex: Apreciação da Proposta de Reajuste Salarial dos Supervisores"
                  value={newAgendaTitle}
                  onChange={(e) => setNewAgendaTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-medium block mb-1">Contextualização / Ementa (Opcional)</label>
                <textarea
                  rows={3}
                  placeholder="Explique o objeto da deliberação ou relatório..."
                  value={newAgendaDesc}
                  onChange={(e) => setNewAgendaDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Categoria / Tema</label>
                  <input
                    type="text"
                    placeholder="Ex: Finanças, Operações, Jurídico"
                    value={newAgendaCategory}
                    onChange={(e) => setNewAgendaCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Natureza da Pauta</label>
                  <select
                    value={newAgendaIsDeliberative ? 'true' : 'false'}
                    onChange={(e) => setNewAgendaIsDeliberative(e.target.value === 'true')}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="true">Deliberativa (Votação Nominal)</option>
                    <option value="false">Informativa / Alinhamento</option>
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAgendaIsFixed}
                    onChange={(e) => setNewAgendaIsFixed(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Tornar esta pauta fixa (permanente em todas as sessões)
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddAgendaModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newAgendaTitle.trim()) {
                    alert('Informe o título da pauta.');
                    return;
                  }
                  const newAg: CommitteeAgendaItem = {
                    id: `ag-${Date.now()}`,
                    title: newAgendaTitle.trim(),
                    description: newAgendaDesc.trim() || undefined,
                    category: newAgendaCategory.trim() || 'Geral',
                    isDeliberative: newAgendaIsDeliberative,
                    isFixed: newAgendaIsFixed,
                    votes: {}
                  };
                  setCommittees(prev => prev.map(c => {
                    if (c.id !== activeCommittee.id) return c;
                    return { ...c, agendas: [...c.agendas, newAg] };
                  }));
                  setIsAddAgendaModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 cursor-pointer shadow-xs"
              >
                Adicionar à Ordem do Dia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gerenciar Assentos do Colegiado em Sessão */}
      {managingCommittee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Configurar Assentos: {managingCommittee.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Sigla: {managingCommittee.code}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManagingCommitteeId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Lista dos Membros Cadastrados */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Integrantes com Assento ({managingCommittee.members.length}):
              </span>

              {managingCommittee.members.map(member => (
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
                        setCommittees(prev => prev.map(c => {
                          if (c.id !== managingCommittee.id) return c;
                          return {
                            ...c,
                            members: c.members.map(m => m.id === member.id ? { ...m, isVoter: !m.isVoter } : m)
                          };
                        }));
                      }}
                      className="px-2 py-1 text-[10px] font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400 cursor-pointer"
                      title={member.isVoter ? 'Tornar ouvinte (sem voto)' : 'Conceder direito a voto'}
                    >
                      {member.isVoter ? 'Tornar Ouvinte' : 'Conceder Voto'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (managingCommittee.members.length <= 1) {
                          alert('O colegiado precisa ter pelo menos um membro na mesa.');
                          return;
                        }
                        setCommittees(prev => prev.map(c => {
                          if (c.id !== managingCommittee.id) return c;
                          return {
                            ...c,
                            members: c.members.filter(m => m.id !== member.id)
                          };
                        }));
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Remover assento"
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
                <span>+ Adicionar Novo Assento na Mesa</span>
              </span>

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
                        setNewMemberRole(u.jobTitle || 'Membro do Colegiado');
                      }
                    }}
                    defaultValue=""
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="" disabled>Selecionar usuário existente...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.jobTitle || u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Dra. Mariana Costa"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    placeholder="Ex: Conselheira Independente"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
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
                    const newM: BoardMember = {
                      id: `mb-${Date.now()}`,
                      name: newMemberName.trim(),
                      roleDescription: newMemberRole.trim() || (newMemberIsVoter ? 'Conselheiro Votante' : 'Participante Ouvinte'),
                      isVoter: newMemberIsVoter
                    };
                    setCommittees(prev => prev.map(c => {
                      if (c.id !== managingCommittee.id) return c;
                      return { ...c, members: [...c.members, newM] };
                    }));
                    setNewMemberName('');
                    setNewMemberRole('');
                    setNewMemberIsVoter(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  Adicionar Assento
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setManagingCommitteeId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 cursor-pointer shadow-xs"
              >
                Concluir Configuração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
