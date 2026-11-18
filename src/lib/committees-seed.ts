export type VoteChoice = 'sim' | 'nao' | 'abstencao' | null;

export interface BoardMember {
  id: string;
  name: string;
  roleDescription: string;
  isVoter: boolean;
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
  status?: 'pending' | 'concluded';
}

export interface CommitteeSession {
  id: string;
  sessionCode: string; // Ex: SES-01/2026
  title: string;
  date: string;
  status: 'concluded' | 'in_progress' | 'scheduled';
  agendas: CommitteeAgendaItem[];
  minuteRecorded?: boolean;
  minuteRecordedAt?: string;
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

export const INITIAL_COMMITTEES: CommitteeConfig[] = [
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
