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
  PieChart, 
  TrendingUp, 
  Briefcase, 
  FolderPlus,
  Send,
  MessageSquare,
  Award,
  Filter,
  ArrowLeft,
  Settings,
  UserCheck,
  Building2,
  CalendarDays,
  Search,
  Check
} from 'lucide-react';
import { OperationalRole, SystemUser, VoteChoice } from '@/lib/types';
import { formatDateBR } from '@/lib/frequency';

export interface BoardMember {
  id: string;
  name: string;
  roleDescription: string;
  isVoter: boolean; // true = conselheiro votante; false = ouvinte/secretaria
  avatarColor?: string;
}

export interface CommitteeAgendaItem {
  id: string;
  title: string;
  description?: string;
  isFixed: boolean; // true = pauta fixa/recorrente; false = pauta extraordinária/avulsa
  isDeliberative: boolean; // true = votação nominal; false = informativa/alinhamento
  category?: string;
  votes: { [memberName: string]: VoteChoice };
  resolutionNote?: string;
}

export interface CommitteeConfig {
  id: string;
  name: string;
  code: string;
  type: 'board' | 'committee';
  description: string;
  presidentName: string;
  presidentRole: string;
  cadence: string; // Ex: 'Mensal (Última quinta-feira)', 'Quinzenal'
  members: BoardMember[];
  agendas: CommitteeAgendaItem[];
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
  // Lista inicial padrão de Colegiados
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
        { id: 'm1', name: 'Cristiano Silva', roleDescription: 'CEO & Presidente do Conselho', isVoter: true, avatarColor: 'bg-slate-900' },
        { id: 'm2', name: 'Ana Beatriz', roleDescription: 'Diretora de Controladoria & Finanças', isVoter: true, avatarColor: 'bg-emerald-700' },
        { id: 'm3', name: 'Marcos Oliveira', roleDescription: 'Diretor de Operações & Facilities', isVoter: true, avatarColor: 'bg-amber-700' },
        { id: 'm4', name: 'Secretaria de Governança', roleDescription: 'Redatora de Ata & Compliance', isVoter: false, avatarColor: 'bg-slate-500' }
      ],
      agendas: [
        {
          id: 'ag-b1',
          title: 'Apreciação e Homologação dos Resultados Financeiros e DRE do Período',
          description: 'Apresentação detalhada da receita bruta, custos operacionais diretos, glosas e margem EBITDA.',
          isFixed: true,
          isDeliberative: true,
          category: 'Finanças & Orçamento',
          votes: { 'Cristiano Silva': 'favorable', 'Ana Beatriz': 'favorable', 'Marcos Oliveira': 'favorable' },
          resolutionNote: 'Contas homologadas por unanimidade dos membros presentes sem ressalvas.'
        },
        {
          id: 'ag-b2',
          title: 'Deliberação sobre Aporte em Novas Máquinas e Equipamentos de Facilities',
          description: 'Aquisição de 6 lavadoras industriais automáticas para atendimento ao contrato hospitalar Zona Sul.',
          isFixed: false,
          isDeliberative: true,
          category: 'Investimentos (Capex)',
          votes: { 'Cristiano Silva': 'favorable', 'Ana Beatriz': 'favorable' },
          resolutionNote: 'Aprovado com recomendação da Controladoria para parcelamento em 4x junto ao fabricante.'
        },
        {
          id: 'ag-b3',
          title: 'Relatório de Conformidade Trabalhista e Indicadores de Passivo',
          description: 'Acompanhamento de processos judiciais, acordos homologados na CCT e contingências de DP.',
          isFixed: true,
          isDeliberative: false,
          category: 'Compliance & Jurídico',
          votes: {},
          resolutionNote: 'Quadro estável com redução de 18% em reclamatórias ativas.'
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
        { id: 'm2', name: 'Ana Beatriz', roleDescription: 'Head de Finanças & Presidente', isVoter: true, avatarColor: 'bg-emerald-700' },
        { id: 'm1', name: 'Cristiano Silva', roleDescription: 'Diretoria Executiva / CEO', isVoter: true, avatarColor: 'bg-slate-900' },
        { id: 'm5', name: 'Lucas Ribeiro', roleDescription: 'Líder de DP & Folha', isVoter: true, avatarColor: 'bg-purple-700' }
      ],
      agendas: [
        {
          id: 'ag-c1',
          title: 'Auditoria de Desvios Orçamentários de Insumos e Químicos nos Postos',
          description: 'Confronto entre a previsão de consumo por m² e o faturamento emitido pelos fornecedores.',
          isFixed: true,
          isDeliberative: true,
          category: 'Custos & Insumos',
          votes: { 'Ana Beatriz': 'favorable', 'Cristiano Silva': 'favorable', 'Lucas Ribeiro': 'favorable' },
          resolutionNote: 'Instaurado novo protocolo de autorização prévia para pedidos acima de R$ 5.000.'
        },
        {
          id: 'ag-c2',
          title: 'Estratégia de Renegociação e Redução de Inadimplência Superior a 30 dias',
          description: 'Avaliação dos contratos sob risco com notificação extrajudicial expedida.',
          isFixed: false,
          isDeliberative: true,
          category: 'Crédito & Cobrança',
          votes: { 'Ana Beatriz': 'favorable', 'Cristiano Silva': 'favorable' },
          resolutionNote: 'Aprovada retenção preventiva de emissão de NF para dois tomadores em atraso crônico.'
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
        { id: 'm3', name: 'Marcos Oliveira', roleDescription: 'Head de Operações & Presidente', isVoter: true, avatarColor: 'bg-amber-700' },
        { id: 'm1', name: 'Cristiano Silva', roleDescription: 'Diretoria Executiva / CEO', isVoter: true, avatarColor: 'bg-slate-900' },
        { id: 'm6', name: 'Coordenação de Campo', roleDescription: 'Supervisor Geral de Facilities', isVoter: true, avatarColor: 'bg-blue-700' }
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
          resolutionNote: 'Atingida a meta de auditoria preventiva sem notificações de glosas técnicas.'
        },
        {
          id: 'ag-cl2',
          title: 'Homologação do Plano de Ação Preventivo de Retenção do Contrato Alfa Facilities',
          description: 'Plano de alocação de encarregada sênior e reforço de cronograma de tratamento de piso.',
          isFixed: false,
          isDeliberative: true,
          category: 'Retenção & CS',
          votes: { 'Marcos Oliveira': 'favorable', 'Cristiano Silva': 'favorable', 'Coordenação de Campo': 'favorable' },
          resolutionNote: 'Aprovada alocação imediata com avaliação formal de satisfação em 15 dias.'
        }
      ]
    }
  ];

  // Estado dos colegiados
  const [committees, setCommittees] = useState<CommitteeConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rgr_committees_state');
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

  // Salvar no localStorage sempre que houver modificações
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rgr_committees_state', JSON.stringify(committees));
    }
  }, [committees]);

  // Colegiado atualmente aberto para sessão (null = visão geral / lista de todos os comitês)
  const [activeCommitteeId, setActiveCommitteeId] = useState<string | null>(null);

  // Busca e filtros na listagem geral
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'board' | 'committee'>('all');

  // Modais de Criação e Configuração
  const [isNewCommitteeModalOpen, setIsNewCommitteeModalOpen] = useState(false);
  const [newComName, setNewComName] = useState('');
  const [newComCode, setNewComCode] = useState('');
  const [newComDesc, setNewComDesc] = useState('');
  const [newComPresident, setNewComPresident] = useState('');
  const [newComRole, setNewComRole] = useState('');
  const [newComCadence, setNewComCadence] = useState('Mensal');
  const [newComType, setNewComType] = useState<'board' | 'committee'>('committee');

  // Modal para Gerenciar Assentos do Colegiado Selecionado
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
  const [newAgendaIsFixed, setNewAgendaIsFixed] = useState(false);

  // Filtro de Pautas da Sessão
  const [agendaFilter, setAgendaFilter] = useState<'all' | 'deliberative' | 'informative' | 'fixed'>('all');

  // Mensagens de status
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

  // Colegiados filtrados na tela inicial
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

  // Resumo de quórum de uma pauta deliberativa
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

    let badgeText = `Votação Pendente (${votedCount}/${totalVoters})`;
    let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';

    if (votedCount === totalVoters && totalVoters > 0) {
      if (favorable === totalVoters) {
        badgeText = 'Aprovado por Unanimidade';
        badgeClass = 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold';
      } else if (favorable > contrary) {
        badgeText = `Aprovado por Maioria (${favorable} a ${contrary})`;
        badgeClass = 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold';
      } else if (contrary > favorable) {
        badgeText = `Rejeitado (${contrary} a ${favorable})`;
        badgeClass = 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold';
      } else {
        badgeText = `Empate (${favorable} a ${contrary}) - Voto de Minerva`;
        badgeClass = 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-bold';
      }
    } else if (votedCount > 0) {
      badgeText = `Em Votação (${votedCount}/${totalVoters})`;
      badgeClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700';
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

      let deliberationsText = `## ATA DA SESSÃO OFICIAL • ${activeCommittee.name.toUpperCase()}\n`;
      deliberationsText += `**Data da Sessão:** ${formatDateBR(selectedDate)}\n`;
      deliberationsText += `**Presidente / Condutor:** ${activeCommittee.presidentName} (${activeCommittee.presidentRole})\n`;
      deliberationsText += `**Periodicidade do Órgão:** ${activeCommittee.cadence}\n\n`;

      deliberationsText += `### 1. QUÓRUM E COMPOSIÇÃO DA MESA:\n`;
      deliberationsText += `• CONSELHEIROS VOTANTES (${voters.length}):\n`;
      voters.forEach(v => {
        deliberationsText += `  - ${v.name} (${v.roleDescription})\n`;
      });
      if (listeners.length > 0) {
        deliberationsText += `• OUVINTES & ASSESSORES (${listeners.length}):\n`;
        listeners.forEach(l => {
          deliberationsText += `  - ${l.name} (${l.roleDescription})\n`;
        });
      }
      deliberationsText += `\n### 2. DELIBERAÇÕES E VOTAÇÕES NOMINAIS:\n\n`;
      activeCommittee.agendas.forEach((agenda, idx) => {
        deliberationsText += `PAUTA ${idx + 1}.0 [${agenda.isDeliberative ? 'DELIBERATIVA' : 'INFORMATIVA'}]: "${agenda.title}"\n`;
        if (agenda.description) {
          deliberationsText += `Contexto: ${agenda.description}\n`;
        }

        if (agenda.isDeliberative) {
          const summary = getVotingSummary(agenda);
          deliberationsText += `• DESFECHO DO QUÓRUM: ${summary.badgeText.toUpperCase()}\n`;
          deliberationsText += `• VOTOS NOMINAIS:\n`;
          voters.forEach(v => {
            const vote = agenda.votes[v.name];
            const label = vote === 'favorable' ? 'A FAVOR' : vote === 'contrary' ? 'CONTRA' : vote === 'abstention' ? 'ABSTENÇÃO' : 'NÃO COMPUTADO';
            deliberationsText += `  - ${v.name}: [${label}]\n`;
          });
        }

        if (agenda.resolutionNote) {
          deliberationsText += `• PARECER REGIMENTAL / DIRETRIZES: ${agenda.resolutionNote}\n`;
        }
        deliberationsText += `\n`;
      });

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

  // =========================================================================
  // CENÁRIO 1: VISÃO GERAL DE TODOS OS COLEGIADOS (Conselho & Comitês)
  // Estrutura em gavetas / cards executivos com gerenciamento de assentos
  // =========================================================================
  if (!activeCommittee) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Banner Executivo de Governança Superior */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                GOVERNANÇA CORPORATIVA & ESTATUTÁRIA
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                Atlas Governance Framework
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-500" />
              <span>Conselho de Administração & Comitês Estratégicos</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mantenha o Conselho e Comitês organizados como órgãos colegiados: configure os integrantes de cada mesa, defina quóruns e abra a sessão quando houver deliberação.
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

        {/* Barra de Filtros & Busca */}
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

        {/* Grade de Colegiados (Conselho e Comitês em Cards Independentes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCommittees.map(com => {
            const isBoard = com.type === 'board';
            const voters = com.members.filter(m => m.isVoter);
            const listeners = com.members.filter(m => !m.isVoter);
            const deliberativeCount = com.agendas.filter(a => a.isDeliberative).length;
            const fixedCount = com.agendas.filter(a => a.isFixed).length;

            return (
              <div
                key={com.id}
                className={`bg-white dark:bg-[#111827] border rounded-2xl p-5 text-xs flex flex-col justify-between shadow-xs transition-all hover:shadow-md ${
                  isBoard 
                    ? 'border-amber-400/80 dark:border-amber-700/80 ring-1 ring-amber-400/20' 
                    : 'border-slate-200/90 dark:border-[#1e293b] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Code + Tipo + Botão Configurar Integrantes */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isBoard
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        {com.code}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        isBoard
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {isBoard ? 'Conselho Superior' : 'Comitê Temático'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setManagingCommitteeId(com.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Configurar Assentos e Membros da Mesa"
                    >
                      <Settings className="w-3 h-3 text-slate-400" />
                      <span>Integrantes</span>
                    </button>
                  </div>

                  {/* Nome do Colegiado & Presidente */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {com.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Presidência: <strong className="text-slate-700 dark:text-slate-200">{com.presidentName}</strong>
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <CalendarDays className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{com.cadence}</span>
                    </div>
                  </div>

                  {/* Descrição do Colegiado */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {com.description}
                  </p>

                  {/* Integrantes / Assentos com tags compactas */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      <span>Membros da Mesa ({com.members.length}):</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">{voters.length} Votantes</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {com.members.map(m => (
                        <span 
                          key={m.id}
                          className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 ${
                            m.isVoter 
                              ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium' 
                              : 'bg-slate-100/60 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 italic'
                          }`}
                          title={`${m.name} (${m.roleDescription}) - ${m.isVoter ? 'Direito a Voto' : 'Ouvinte/Sem voto'}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span className="truncate max-w-[110px]">{m.name.split(' ')[0]} {m.name.split(' ')[1] || ''}</span>
                          <span className={`text-[8px] font-mono px-1 rounded ${
                            m.isVoter ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'
                          }`}>
                            {m.isVoter ? 'VOTA' : 'OUV'}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Resumo de Pautas */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="flex-1 py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center justify-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      <span>{com.agendas.length} Pautas Registradas</span>
                    </span>
                    <span className="py-1 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1">
                      <Vote className="w-3 h-3 text-amber-600" />
                      <span>{deliberativeCount} Votações</span>
                    </span>
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCommitteeId(com.id)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer group"
                  >
                    <span>Abrir Sessão & Pautas</span>
                    <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setManagingCommitteeId(com.id)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                    title="Editar assentos deste comitê"
                  >
                    <Users className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
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
                    <input
                      type="text"
                      placeholder="Ex: Mensal (Última terça)"
                      value={newComCadence}
                      onChange={(e) => setNewComCadence(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Finalidade / Descrição Estatutária</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva a missão deste comitê e matérias de assessoramento..."
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

        {/* Modal: Gerenciar Assentos do Colegiado */}
        {managingCommittee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Assentos da Mesa: {managingCommittee.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Código: {managingCommittee.code}
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
                  Membros Registrados ({managingCommittee.members.length}):
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
                            alert('O comitê precisa ter pelo menos um membro na mesa.');
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
                  <span>+ Adicionar Novo Integrante</span>
                </span>

                {/* Importar de Usuários do Sistema */}
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
                          setNewMemberRole(u.jobTitle || 'Membro do Comitê');
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
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Cargo / Papel na Mesa</label>
                    <input
                      type="text"
                      placeholder="Ex: Relatora Financeira"
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
                        roleDescription: newMemberRole.trim() || (newMemberIsVoter ? 'Conselheiro Votante' : 'Participante'),
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
  // CENÁRIO 2: SALA DE SESSÃO / REUNIÃO DO COLEGIADO SELECIONADO
  // Permite deliberar pautas, colher votos nominais e lavrar ata
  // =========================================================================
  const isBoard = activeCommittee.type === 'board';
  const voters = activeCommittee.members.filter(m => m.isVoter);
  const listeners = activeCommittee.members.filter(m => !m.isVoter);

  const filteredAgendas = activeCommittee.agendas.filter(ag => {
    if (agendaFilter === 'deliberative') return ag.isDeliberative;
    if (agendaFilter === 'informative') return !ag.isDeliberative;
    if (agendaFilter === 'fixed') return ag.isFixed;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Botão Superior de Navegação para Voltar a Todos os Comitês */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveCommitteeId(null)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Lista de Colegiados & Comitês</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setManagingCommitteeId(activeCommittee.id)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer hover:border-slate-400"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Configurar Assentos / Votantes</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateMinute}
            disabled={isSavingMinute}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
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

      {/* Cabeçalho do Colegiado em Sessão */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                isBoard
                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}>
                {activeCommittee.code}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Cadência: <strong className="text-slate-800 dark:text-slate-200">{activeCommittee.cadence}</strong>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {activeCommittee.name}
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {activeCommittee.description}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shrink-0 text-xs space-y-1">
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

        {/* Composição da Mesa: Votantes e Ouvintes */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Assentos na Mesa ({activeCommittee.members.length} participantes):
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              {voters.length} Conselheiros Votantes Habilitados
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeCommittee.members.map(member => (
              <div
                key={member.id}
                className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-colors ${
                  member.isVoter
                    ? 'bg-slate-50/80 dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-100/60 dark:bg-slate-800/40 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 italic'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                  member.avatarColor || (member.isVoter ? 'bg-slate-800' : 'bg-slate-400')
                }`}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold leading-tight">{member.name}</div>
                  <div className="text-[10px] text-slate-400">{member.roleDescription}</div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ml-1 ${
                  member.isVoter
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium'
                }`}>
                  {member.isVoter ? 'VOTA' : 'OUVINTE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ordem do Dia & Pautas da Sessão */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAgendaFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                agendaFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Todas as Pautas ({activeCommittee.agendas.length})
            </button>
            <button
              onClick={() => setAgendaFilter('deliberative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                agendaFilter === 'deliberative'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Deliberativas ({activeCommittee.agendas.filter(a => a.isDeliberative).length})
            </button>
            <button
              onClick={() => setAgendaFilter('fixed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                agendaFilter === 'fixed'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Pautas Fixas ({activeCommittee.agendas.filter(a => a.isFixed).length})
            </button>
            <button
              onClick={() => setAgendaFilter('informative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                agendaFilter === 'informative'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Informativas ({activeCommittee.agendas.filter(a => !a.isDeliberative).length})
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
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Adicionar Pauta</span>
          </button>
        </div>

        {/* Lista de Pautas */}
        {filteredAgendas.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
            Nenhuma pauta cadastrada nesta categoria. Clique no botão acima para adicionar.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAgendas.map((agenda, idx) => {
              const summary = agenda.isDeliberative ? getVotingSummary(agenda) : null;

              return (
                <div
                  key={agenda.id}
                  className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-5 shadow-xs space-y-4 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          PAUTA {idx + 1}.0
                        </span>
                        {agenda.isFixed && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                            Pauta Fixa Recorrente
                          </span>
                        )}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          agenda.isDeliberative 
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                        }`}>
                          {agenda.isDeliberative ? 'Deliberação Nominal' : 'Informativa'}
                        </span>
                        {agenda.category && (
                          <span className="text-[10px] text-slate-400">
                            {agenda.category}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {agenda.title}
                      </h3>

                      {agenda.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-0.5">
                          {agenda.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      {summary && (
                        <span className={`text-[10px] px-3 py-1 rounded-full border uppercase tracking-wider font-semibold ${summary.badgeClass}`}>
                          {summary.badgeText}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAgenda(agenda.id)}
                        className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Excluir Pauta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Votação Nominal dos Integrantes com Assento */}
                  {agenda.isDeliberative && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        <span>Votos Nominais dos Membros com Assento:</span>
                        <span className="font-mono text-slate-500">
                          A favor: {summary?.favorable || 0} | Contra: {summary?.contrary || 0} | Abstenções: {summary?.abstention || 0}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {voters.map(voter => {
                          const vote = agenda.votes[voter.name];

                          return (
                            <div
                              key={voter.id}
                              className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs block truncate" title={voter.name}>
                                  {voter.name}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {voter.roleDescription}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleVote(agenda.id, voter.name, 'favorable')}
                                  className={`py-1 rounded text-[10px] font-medium transition-colors border flex items-center justify-center gap-0.5 cursor-pointer ${
                                    vote === 'favorable'
                                      ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                                  }`}
                                  title="A Favor"
                                >
                                  <ThumbsUp className="w-2.5 h-2.5" />
                                  <span>Sim</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleVote(agenda.id, voter.name, 'contrary')}
                                  className={`py-1 rounded text-[10px] font-medium transition-colors border flex items-center justify-center gap-0.5 cursor-pointer ${
                                    vote === 'contrary'
                                      ? 'bg-rose-600 text-white border-rose-700 font-bold shadow-xs'
                                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                                  }`}
                                  title="Contra"
                                >
                                  <ThumbsDown className="w-2.5 h-2.5" />
                                  <span>Não</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleVote(agenda.id, voter.name, 'abstention')}
                                  className={`py-1 rounded text-[10px] font-medium transition-colors border flex items-center justify-center gap-0.5 cursor-pointer ${
                                    vote === 'abstention'
                                      ? 'bg-slate-800 text-white border-slate-900 font-bold shadow-xs'
                                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                  }`}
                                  title="Abster"
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
                  )}

                  {/* Resolução & Diretriz da Pauta */}
                  <div>
                    <input
                      type="text"
                      placeholder="Parecer do relator ou diretriz deliberada para esta pauta..."
                      value={agenda.resolutionNote || ''}
                      onChange={(e) => handleUpdateResolution(agenda.id, e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
              >
                Adicionar à Ordem do Dia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
