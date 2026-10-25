export type Frequency = 'daily' | 'weekly' | 'monthly';
export type ExecutionStatus = 'pending' | 'completed' | 'blocked';

export interface OperationalRole {
  id: string;
  title: string;
  department: string;
  description: string;
  code?: string; // Ex: CAD-FIN-01
  createdAt: string;
}

export interface RoutineBlock {
  id: string;
  roleId: string;
  timeWindow: string; // Ex: "08:00 - 08:30"
  title: string;
  deliverable: string;
  sopMarkdown: string;
  frequency: Frequency;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  orderIndex: number;
  code?: string; // Ex: POP-FIN-001
  version?: string; // Ex: v1.4
  homologatedBy?: string; // Ex: Diretoria de Operações
  createdAt?: string;
  role?: OperationalRole;
}

export type VoteChoice = 'favorable' | 'contrary' | 'abstention';

export interface BoardAgendaVote {
  agendaIndex: number;
  agendaTitle: string;
  votes: { [voterName: string]: VoteChoice };
  result?: 'approved_unanimous' | 'approved_majority' | 'rejected' | 'tied' | 'pending';
  resolutionNote?: string;
}

export type RitualType = 'operational_cadence' | 'board_council';
export type RitualFrequency = 'daily' | 'weekly' | 'monthly';
export type MonthlyScheduleType = 'specific_day' | 'first_business_day' | 'fifth_business_day' | 'last_business_day';

export interface DailyRitual {
  id: string;
  roleId: string;
  timeSlot: string; // Ex: "08:30"
  title: string;
  durationMinutes: number;
  agendaItems: string[];
  code?: string; // Ex: RIT-01
  type?: RitualType; // 'operational_cadence' (default) ou 'board_council' (votação nominal)
  
  // Governança de Periodicidade e Frequência
  frequency?: RitualFrequency; // 'daily' (default) | 'weekly' | 'monthly'
  weekDays?: number[]; // [1, 2, 3, 4, 5] (1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb, 0=Dom)
  includeWeekends?: boolean; // default false (quando diário, executa apenas de Seg a Sex)
  monthDay?: number; // 1 a 31 quando mensal
  monthlyType?: MonthlyScheduleType; // 'specific_day' | 'first_business_day' | 'last_business_day'
  
  createdAt?: string;
  role?: OperationalRole;
}

export interface RoutineExecution {
  id: string;
  routineBlockId: string;
  date: string; // YYYY-MM-DD
  status: ExecutionStatus;
  observation?: string | null;
  completedAt?: string | null;
  verifiedBy?: string | null;
  // Campos de Governança de Pontualidade & Atraso
  isDelayed?: boolean;
  delayMinutes?: number;
  delayReason?: string | null;
  delayCategory?: string | null;
}

export interface RoutineBlockWithExecution extends RoutineBlock {
  execution?: RoutineExecution;
}

export interface GovernanceMinute {
  id: string;
  ritualId: string;
  roleId: string;
  date: string; // YYYY-MM-DD
  title: string;
  deliberations: string;
  agendaCheckedCount: number;
  agendaTotalCount: number;
  signedBy: string;
  signedAt: string;
  participants: string[];
}

export interface RolePerformanceStats {
  totalBlocks: number;
  completedBlocks: number;
  onTimeBlocks: number;
  delayedBlocks: number;
  blockedBlocks: number;
  completionRate: number; // %
  punctualityRate: number; // %
  governanceScore: number; // 0 - 100
  ratingTier: 'EXCELLENT' | 'STABLE' | 'ATTENTION' | 'CRITICAL';
}

// Controle de Acessos & Usuários (RBAC / IAM)
export type UserAccessRole = 'admin' | 'manager' | 'operator';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  mustChangePassword?: boolean;
  roleType: UserAccessRole; // 'admin' (Diretoria/Audit), 'manager' (Coordenação), 'operator' (Operador da Cadeira)
  jobTitle: string; // Ex: "Diretoria Executiva / CEO", "Auxiliar Financeiro", etc.
  department: string;
  allowedRoleIds: string[]; // IDs das cadeiras que o usuário pode acessar. Se roleType === 'admin', pode conter ['*']
  defaultRoleId?: string;
  active: boolean;
  avatarColor?: string;
  createdAt?: string;
}

// 5W2H • Central de Ações & Planos de Governança
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ActionPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ActionNote {
  id: string;
  authorName: string;
  content: string;
  createdAt: string; // ISO string
}

export interface GovernanceAction {
  id: string;
  title: string;              // O que fazer (Ação 5W2H)
  roleId: string;             // Cadeira Responsável
  roleTitle?: string;         // Nome amigável da cadeira
  roleCode?: string;          // Código CAD-OPE-04, etc.
  assigneeName: string;       // Quem (Responsável Nominal)
  dueDate: string;            // Quando (Prazo YYYY-MM-DD)
  status: ActionStatus;       // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: ActionPriority;   // 'low' | 'medium' | 'high' | 'urgent'
  category: string;           // Tema (Operações, Ponto/Folha, Finanças, Compras, etc.)
  notes: string;              // Locação principal de anotações e acompanhamento
  historyNotes?: ActionNote[];// Histórico de anotações datadas
  minuteId?: string;          // Vínculo com a Ata Oficial no Livro de Atas
  minuteTitle?: string;       // Título da reunião/Ata de origem
  ritualId?: string;          // Rito de origem
  meetingDate?: string;       // Data em que foi deliberada
  createdAt: string;
  updatedAt?: string;
}

