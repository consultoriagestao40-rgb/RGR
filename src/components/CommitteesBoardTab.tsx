'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Filter
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
  // Lista inicial padrão de Colegiados (Conselho Superior + Comitês de Apoio)
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
          title: 'Acompanhamento do Prazo Médio de Recebimento e Cobrança de Faturas',
          description: 'Posição de títulos em aberto e negociação com clientes corporativos em atraso.',
          isFixed: true,
          isDeliberative: false,
          category: 'Tesouraria',
          votes: {},
          resolutionNote: 'Taxa de inadimplência mantida abaixo da meta corporativa de 1,8%.'
        }
      ]
    },
    {
      id: 'com-02',
      name: 'Comitê de Gestão de Clientes & Qualidade',
      code: 'COM-CLI',
      type: 'committee',
      description: 'Comitê focado no nível de serviço (SLA), retenção de contratos, resolução de notificações de clientes e expansão de escopo.',
      presidentName: 'Marcos Oliveira',
      presidentRole: 'Presidente do Comitê de Clientes & Operações',
      cadence: 'Semanal (Segundas-feiras às 10:00)',
      members: [
        { id: 'm3', name: 'Marcos Oliveira', roleDescription: 'Head de Operações & Presidente', isVoter: true, avatarColor: 'bg-amber-700' },
        { id: 'm1', name: 'Cristiano Silva', roleDescription: 'Diretoria Executiva / CEO', isVoter: true, avatarColor: 'bg-slate-900' },
        { id: 'm6', name: 'Supervisores Regionais', roleDescription: 'Ouvintes Operacionais', isVoter: false, avatarColor: 'bg-slate-600' }
      ],
      agendas: [
        {
          id: 'ag-cli1',
          title: 'Avaliação dos Resultados das Auditorias de Checklist Fácil nos Postos',
          description: 'Apresentação do índice de conformidade dos 14 contratos de alta complexidade.',
          isFixed: true,
          isDeliberative: false,
          category: 'Qualidade & SLA',
          votes: {},
          resolutionNote: 'Índice de conformidade atingiu 96,4% na última amostragem.'
        },
        {
          id: 'ag-cli2',
          title: 'Homologação de Plano de Ação para Posto Crítico Hospitalar',
          description: 'Readequação de escala e reforço de encarregada para blindagem contra notificações.',
          isFixed: false,
          isDeliberative: true,
          category: 'Contingência Operacional',
          votes: { 'Marcos Oliveira': 'favorable', 'Cristiano Silva': 'favorable' },
          resolutionNote: 'Aprovado remanejamento imediato de 2 colaboradores da reserva técnica.'
        }
      ]
    }
  ];

  // Estado dos Comitês com persistência local
  const [committees, setCommittees] = useState<CommitteeConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rgr_committees_state');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return defaultCommittees;
  });

  const [activeCommitteeId, setActiveCommitteeId] = useState<string>(() => {
    return committees[0]?.id || 'board-01';
  });

  // Salvar no localStorage sempre que houver alteração
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rgr_committees_state', JSON.stringify(committees));
    }
  }, [committees]);

  const activeCommittee = useMemo(() => {
    return committees.find(c => c.id === activeCommitteeId) || committees[0];
  }, [committees, activeCommitteeId]);

  // Modais de Criação e Edição
  const [isNewCommitteeModalOpen, setIsNewCommitteeModalOpen] = useState(false);
  const [newComName, setNewComName] = useState('');
  const [newComCode, setNewComCode] = useState('');
  const [newComDesc, setNewComDesc] = useState('');
  const [newComPresident, setNewComPresident] = useState('');
  const [newComCadence, setNewComCadence] = useState('Mensal');

  // Modal para Adicionar Pauta
  const [isAddAgendaModalOpen, setIsAddAgendaModalOpen] = useState(false);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaDesc, setNewAgendaDesc] = useState('');
  const [newAgendaCategory, setNewAgendaCategory] = useState('Governança');
  const [newAgendaIsDeliberative, setNewAgendaIsDeliberative] = useState(true);
  const [newAgendaIsFixed, setNewAgendaIsFixed] = useState(false);

  // Modal de Membros
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberIsVoter, setNewMemberIsVoter] = useState(true);

  // Mensagem de sucesso ao lavrar ata
  const [minuteSuccessMessage, setMinuteSuccessMessage] = useState(false);
  const [isSavingMinute, setIsSavingMinute] = useState(false);

  // Filtro de Pautas (Todas / Deliberativas / Informativas / Fixas)
  const [agendaFilter, setAgendaFilter] = useState<'all' | 'deliberative' | 'informative' | 'fixed'>('all');

  const filteredAgendas = useMemo(() => {
    if (!activeCommittee) return [];
    return activeCommittee.agendas.filter(ag => {
      if (agendaFilter === 'deliberative') return ag.isDeliberative;
      if (agendaFilter === 'informative') return !ag.isDeliberative;
      if (agendaFilter === 'fixed') return ag.isFixed;
      return true;
    });
  }, [activeCommittee, agendaFilter]);

  // Votação Nominal em uma pauta
  const handleVote = (agendaId: string, voterName: string, choice: VoteChoice) => {
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
    if (!confirm('Deseja excluir esta pauta da ordem do dia?')) return;
    setCommittees(prev => prev.map(com => {
      if (com.id !== activeCommittee.id) return com;
      return {
        ...com,
        agendas: com.agendas.filter(ag => ag.id !== agendaId)
      };
    }));
  };

  // Apuração de Quórum
  const getVotingSummary = (agenda: CommitteeAgendaItem) => {
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

    const votedCount = favorable + contrary + abstention;
    const totalVoters = voters.length;

    let badgeText = `Em Votação (${votedCount}/${totalVoters})`;
    let badgeClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700';

    if (votedCount === totalVoters && totalVoters > 0) {
      if (contrary === 0 && abstention === 0) {
        badgeText = 'Aprovado por Unanimidade';
        badgeClass = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold';
      } else if (favorable > contrary) {
        badgeText = 'Aprovado por Maioria';
        badgeClass = 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-semibold';
      } else if (contrary > favorable) {
        badgeText = 'Rejeitado pelo Colegiado';
        badgeClass = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-semibold';
      } else {
        badgeText = 'Empate na Votação';
        badgeClass = 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      }
    } else if (votedCount === 0) {
      badgeText = `Votação Pendente (${totalVoters} votantes)`;
      badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';
    }

    return { favorable, contrary, abstention, votedCount, totalVoters, badgeText, badgeClass };
  };

  // Lavrar Ata Oficial do Colegiado
  const handleGenerateMinute = async () => {
    setIsSavingMinute(true);
    try {
      const voters = activeCommittee.members.filter(m => m.isVoter);
      const listeners = activeCommittee.members.filter(m => !m.isVoter);

      let deliberationsText = `=== ATA OFICIAL • ${activeCommittee.name.toUpperCase()} ===\n`;
      deliberationsText += `Data da Sessão: ${formatDateBR(selectedDate)}\n`;
      deliberationsText += `Presidente da Mesa: ${activeCommittee.presidentName} (${activeCommittee.presidentRole})\n`;
      deliberationsText += `Cadência Regimental: ${activeCommittee.cadence}\n\n`;

      deliberationsText += `### 1. MEMBROS PRESENTES NA SESSÃO:\n`;
      deliberationsText += `• CONSELHEIROS VOTANTES (${voters.length}):\n`;
      voters.forEach(v => {
        deliberationsText += `  - ${v.name} (${v.roleDescription})\n`;
      });
      if (listeners.length > 0) {
        deliberationsText += `• OUVIENTES & ASSESSORES (${listeners.length}):\n`;
        listeners.forEach(l => {
          deliberationsText += `  - ${l.name} (${l.roleDescription})\n`;
        });
      }
      deliberationsText += `\n`;

      deliberationsText += `### 2. DELIBERAÇÕES E VOTAÇÕES NOMINAIS:\n\n`;
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

      // Gravar na API de Atas
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* ========================================================================= */}
      {/* 1. SELETOR DE ÓRGÃO COLEGIADO (CONSELHO + COMITÊS)                         */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                GOVERNANÇA SUPERIOR
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Órgãos Colegiados, Deliberações Estratégicas & Quórum
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Conselho & Comitês Estratégicos</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsNewCommitteeModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Novo Comitê</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateMinute}
              disabled={isSavingMinute}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isSavingMinute ? 'Lavrando Ata...' : 'Lavrar Ata do Colegiado'}</span>
            </button>
          </div>
        </div>

        {/* Abas dos Colegiados (Conselho e Comitês) */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto no-scrollbar">
          {committees.map(com => {
            const isActive = com.id === activeCommittee.id;
            const isBoard = com.type === 'board';
            return (
              <button
                key={com.id}
                type="button"
                onClick={() => setActiveCommitteeId(com.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? isBoard
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs font-bold'
                      : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {isBoard ? (
                  <Landmark className="w-4 h-4" />
                ) : (
                  <Briefcase className="w-3.5 h-3.5" />
                )}
                <span>{com.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  isActive 
                    ? isBoard ? 'bg-slate-950/20 text-slate-950' : 'bg-white/20 text-white dark:text-slate-900' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {com.agendas.length}
                </span>
              </button>
            );
          })}
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

      {/* ========================================================================= */}
      {/* 2. CABEÇALHO DO COLEGIADO ATIVO & MEMBROS DA MESA                         */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                activeCommittee.type === 'board'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                  : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800'
              }`}>
                {activeCommittee.code}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Cadência: <strong>{activeCommittee.cadence}</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeCommittee.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {activeCommittee.description}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 min-w-[240px]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Presidência da Mesa
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
              {activeCommittee.presidentName}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              {activeCommittee.presidentRole}
            </span>
          </div>
        </div>

        {/* Faixa de Membros da Mesa */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Assentos na Mesa:
            </span>
            {activeCommittee.members.map(member => (
              <span
                key={member.id}
                className={`px-2.5 py-1 rounded-lg text-xs border flex items-center gap-1.5 ${
                  member.isVoter
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-500 italic'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${member.avatarColor || 'bg-slate-400'}`} />
                <span className="font-semibold not-italic">{member.name}</span>
                <span className="text-[10px] text-slate-400">({member.roleDescription})</span>
                <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                  member.isVoter ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {member.isVoter ? 'VOTA' : 'OUVINTE'}
                </span>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsMembersModalOpen(true)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Editar Assentos
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ORDEM DO DIA (PAUTAS FIXAS & DELIBERATIVAS)                             */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Barra de Filtro de Pautas e Botão de Adição */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAgendaFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                agendaFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas as Pautas ({activeCommittee.agendas.length})
            </button>
            <button
              type="button"
              onClick={() => setAgendaFilter('deliberative')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                agendaFilter === 'deliberative'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ⚖️ Deliberativas ({activeCommittee.agendas.filter(a => a.isDeliberative).length})
            </button>
            <button
              type="button"
              onClick={() => setAgendaFilter('fixed')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                agendaFilter === 'fixed'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📌 Pautas Fixas ({activeCommittee.agendas.filter(a => a.isFixed).length})
            </button>
            <button
              type="button"
              onClick={() => setAgendaFilter('informative')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                agendaFilter === 'informative'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📢 Informativas ({activeCommittee.agendas.filter(a => !a.isDeliberative).length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddAgendaModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-atlas-600 hover:bg-atlas-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Adicionar Pauta</span>
          </button>
        </div>

        {/* Lista de Cards das Pautas */}
        {filteredAgendas.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400">
            Nenhuma pauta cadastrada com este filtro.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAgendas.map((agenda, index) => {
              const voters = activeCommittee.members.filter(m => m.isVoter);
              const summary = agenda.isDeliberative ? getVotingSummary(agenda) : null;

              return (
                <div
                  key={agenda.id}
                  className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs space-y-4 transition-colors"
                >
                  {/* Topo da Pauta */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          PAUTA {index + 1}.0
                        </span>
                        
                        {agenda.isFixed ? (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            📌 Pauta Fixa Recorrente
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            ⚡ Pauta Extraordinária
                          </span>
                        )}

                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          agenda.isDeliberative 
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {agenda.isDeliberative ? '⚖️ Deliberação Nominal' : '📢 Pauta Informativa'}
                        </span>

                        <span className="text-[10px] font-semibold text-slate-400">
                          {agenda.category || 'Geral'}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {agenda.title}
                      </h3>
                      {agenda.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {agenda.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start">
                      {summary && (
                        <span className={`px-2.5 py-1 text-xs rounded-lg border ${summary.badgeClass}`}>
                          {summary.badgeText}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAgenda(agenda.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-md transition-colors"
                        title="Remover pauta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Painel de Votação Nominal (Se Deliberativa) */}
                  {agenda.isDeliberative && (
                    <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Vote className="w-4 h-4 text-atlas-500" />
                          Votos Nominais dos Membros com Assento:
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          A favor: {summary?.favorable} | Contra: {summary?.contrary} | Abstenções: {summary?.abstention}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {voters.map(member => {
                          const userVote = agenda.votes[member.name];
                          return (
                            <div
                              key={member.id}
                              className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                    {member.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">
                                    {member.roleDescription}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  userVote === 'favorable' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                  userVote === 'contrary' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                  userVote === 'abstention' ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                                  'bg-slate-100 text-slate-400'
                                }`}>
                                  {userVote === 'favorable' ? 'A FAVOR' : userVote === 'contrary' ? 'CONTRA' : userVote === 'abstention' ? 'ABSTEVE' : 'PENDENTE'}
                                </span>
                              </div>

                              {/* Botões de Voto para o Membro */}
                              <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => handleVote(agenda.id, member.name, 'favorable')}
                                  className={`py-1 rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                                    userVote === 'favorable'
                                      ? 'bg-emerald-600 text-white border-emerald-700'
                                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>Favor</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVote(agenda.id, member.name, 'contrary')}
                                  className={`py-1 rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                                    userVote === 'contrary'
                                      ? 'bg-rose-600 text-white border-rose-700'
                                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-50'
                                  }`}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                  <span>Contra</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVote(agenda.id, member.name, 'abstention')}
                                  className={`py-1 rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                                    userVote === 'abstention'
                                      ? 'bg-slate-800 text-white border-slate-900'
                                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <MinusCircle className="w-3 h-3" />
                                  <span>Abster</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Campo de Parecer / Ressalvas / Deliberações */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      {agenda.isDeliberative ? 'Parecer Oficial da Mesa / Ressalvas Deliberadas:' : 'Anotações da Pauta / Deliberações Informativas:'}
                    </label>
                    <textarea
                      rows={2}
                      value={agenda.resolutionNote || ''}
                      onChange={(e) => handleUpdateResolution(agenda.id, e.target.value)}
                      placeholder="Registre os desfechos, ressalvas e prazos definidos pelo colegiado..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-atlas-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CRIAR NOVO COMITÊ                                                  */}
      {/* ========================================================================= */}
      {isNewCommitteeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-atlas-600" />
                Criar Novo Comitê Estratégico
              </h3>
              <button
                type="button"
                onClick={() => setIsNewCommitteeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nome do Comitê</label>
                <input
                  type="text"
                  placeholder="Ex: Comitê de Gente & Cultura"
                  value={newComName}
                  onChange={(e) => setNewComName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Código</label>
                  <input
                    type="text"
                    placeholder="Ex: COM-RH"
                    value={newComCode}
                    onChange={(e) => setNewComCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Cadência</label>
                  <input
                    type="text"
                    placeholder="Ex: Quinzenal"
                    value={newComCadence}
                    onChange={(e) => setNewComCadence(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Presidente / Coordenador</label>
                <input
                  type="text"
                  placeholder="Ex: Lucas Ribeiro (Líder de DP)"
                  value={newComPresident}
                  onChange={(e) => setNewComPresident(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Objetivo & Escopo de Governança</label>
                <textarea
                  rows={2}
                  placeholder="Descreva o propósito técnico e o escopo de atuação deste comitê..."
                  value={newComDesc}
                  onChange={(e) => setNewComDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewCommitteeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newComName.trim()) return alert('Informe o nome do comitê');
                  const newCom: CommitteeConfig = {
                    id: `com-${Date.now()}`,
                    name: newComName.trim(),
                    code: newComCode.trim().toUpperCase() || 'COM',
                    type: 'committee',
                    description: newComDesc.trim() || 'Comitê estratégico de governança da RGR.',
                    presidentName: newComPresident.trim() || 'Diretoria Executiva',
                    presidentRole: 'Presidente do Comitê',
                    cadence: newComCadence.trim() || 'Mensal',
                    members: [
                      { id: 'm-default', name: newComPresident.trim() || 'Presidente', roleDescription: 'Líder', isVoter: true }
                    ],
                    agendas: [
                      {
                        id: `ag-${Date.now()}-1`,
                        title: 'Acompanhamento dos Indicadores Chave de Desempenho',
                        isFixed: true,
                        isDeliberative: false,
                        votes: {}
                      }
                    ]
                  };
                  setCommittees(prev => [...prev, newCom]);
                  setActiveCommitteeId(newCom.id);
                  setIsNewCommitteeModalOpen(false);
                  setNewComName('');
                  setNewComCode('');
                  setNewComDesc('');
                  setNewComPresident('');
                }}
                className="px-4 py-2 text-xs font-semibold bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg"
              >
                Criar Comitê
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADICIONAR PAUTA NA ORDEM DO DIA                                    */}
      {/* ========================================================================= */}
      {isAddAgendaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-atlas-600" />
                Incluir Pauta na Ordem do Dia
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAgendaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Título da Pauta</label>
                <input
                  type="text"
                  placeholder="Ex: Aprovação do Novo Fornecedor de EPIs e Uniformes"
                  value={newAgendaTitle}
                  onChange={(e) => setNewAgendaTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Contexto & Justificativa Técnica</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes para embasar os conselheiros e apoiar a decisão..."
                  value={newAgendaDesc}
                  onChange={(e) => setNewAgendaDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Categoria / Tema</label>
                  <input
                    type="text"
                    placeholder="Ex: Suprimentos / Capex"
                    value={newAgendaCategory}
                    onChange={(e) => setNewAgendaCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tipo de Pauta</label>
                  <select
                    value={newAgendaIsDeliberative ? 'deliberative' : 'informative'}
                    onChange={(e) => setNewAgendaIsDeliberative(e.target.value === 'deliberative')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-semibold"
                  >
                    <option value="deliberative">⚖️ Deliberativa (Exige Votação Nominal)</option>
                    <option value="informative">📢 Informativa (Apenas Alinhamento)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAgendaIsFixed}
                    onChange={(e) => setNewAgendaIsFixed(e.target.checked)}
                    className="rounded text-atlas-600"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    📌 Definir como Pauta Fixa Recorrente (entrará em todas as sessões)
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddAgendaModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newAgendaTitle.trim()) return alert('Informe o título da pauta');
                  const newItem: CommitteeAgendaItem = {
                    id: `ag-${Date.now()}`,
                    title: newAgendaTitle.trim(),
                    description: newAgendaDesc.trim() || undefined,
                    category: newAgendaCategory.trim() || 'Geral',
                    isDeliberative: newAgendaIsDeliberative,
                    isFixed: newAgendaIsFixed,
                    votes: {}
                  };
                  setCommittees(prev => prev.map(com => {
                    if (com.id !== activeCommittee.id) return com;
                    return {
                      ...com,
                      agendas: [...com.agendas, newItem]
                    };
                  }));
                  setIsAddAgendaModalOpen(false);
                  setNewAgendaTitle('');
                  setNewAgendaDesc('');
                }}
                className="px-4 py-2 text-xs font-semibold bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg"
              >
                Incluir Pauta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GERENCIAR MEMBROS DA MESA                                          */}
      {/* ========================================================================= */}
      {isMembersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-atlas-600" />
                Assentos na Mesa • {activeCommittee.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsMembersModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {activeCommittee.members.map(m => (
                <div key={m.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {m.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {m.roleDescription}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      m.isVoter ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {m.isVoter ? 'Votante' : 'Ouvinte'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCommittees(prev => prev.map(com => {
                          if (com.id !== activeCommittee.id) return com;
                          return {
                            ...com,
                            members: com.members.filter(mem => mem.id !== m.id)
                          };
                        }));
                      }}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Adicionar novo membro */}
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                + Designar Novo Assento:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome do Membro"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Cargo / Papel na Mesa"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMemberIsVoter}
                    onChange={(e) => setNewMemberIsVoter(e.target.checked)}
                    className="rounded text-atlas-600"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Direito a Voto (Conselheiro Votante)
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (!newMemberName.trim()) return alert('Informe o nome');
                    const newMem: BoardMember = {
                      id: `mem-${Date.now()}`,
                      name: newMemberName.trim(),
                      roleDescription: newMemberRole.trim() || 'Membro da Mesa',
                      isVoter: newMemberIsVoter
                    };
                    setCommittees(prev => prev.map(com => {
                      if (com.id !== activeCommittee.id) return com;
                      return {
                        ...com,
                        members: [...com.members, newMem]
                      };
                    }));
                    setNewMemberName('');
                    setNewMemberRole('');
                  }}
                  className="px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded-lg"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMembersModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
