'use client';

import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Building, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Target, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  Edit3, 
  Scale, 
  Award, 
  Layers, 
  ArrowRight,
  ArrowLeft,
  Search,
  Sliders,
  Plus,
  Trash2,
  Landmark,
  CheckSquare,
  X
} from 'lucide-react';
import { OperationalRole, RoleProfile, RoutineBlock, DailyRitual, RitualType, RitualFrequency, MonthlyScheduleType } from '@/lib/types';
import { getDefaultRoleProfile } from '@/lib/default-profiles';
import { WEEK_DAYS, formatBlockFrequency, formatRitualFrequency } from '@/lib/frequency';
import { EditRoleProfileModal } from './EditRoleProfileModal';

interface RoleProfileTabProps {
  roles: OperationalRole[];
  currentRole: OperationalRole | null;
  onSelectRole: (roleId: string) => void;
  onRoleUpdated?: (role: OperationalRole) => void;
  initialDetailRoleId?: string | null;
  allBlocks?: RoutineBlock[];
  allRituals?: DailyRitual[];
  onRefreshData?: () => void;
}

export const RoleProfileTab: React.FC<RoleProfileTabProps> = ({
  roles,
  currentRole,
  onSelectRole,
  onRoleUpdated,
  initialDetailRoleId = null,
  allBlocks = [],
  allRituals = [],
  onRefreshData
}) => {
  const [detailRoleId, setDetailRoleId] = useState<string | null>(initialDetailRoleId);
  const [chairSubTab, setChairSubTab] = useState<'profile' | 'blocks' | 'rituals'>('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Block Modal State (Atividades da Cadeira)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<RoutineBlock | null>(null);
  const [blockCode, setBlockCode] = useState('');
  const [blockTimeWindow, setBlockTimeWindow] = useState('');
  const [blockTitle, setBlockTitle] = useState('');
  const [blockDeliverable, setBlockDeliverable] = useState('');
  const [blockSopMarkdown, setBlockSopMarkdown] = useState('');
  const [blockFrequency, setBlockFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [blockDayOfWeek, setBlockDayOfWeek] = useState<number>(5);
  const [blockDayOfMonth, setBlockDayOfMonth] = useState<number>(20);
  const [blockVersion, setBlockVersion] = useState('v1.0');
  const [blockHomologated, setBlockHomologated] = useState('Diretoria Executiva');

  // Ritual Modal State (Ritos da Cadeira)
  const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);
  const [editingRitual, setEditingRitual] = useState<DailyRitual | null>(null);
  const [ritualCode, setRitualCode] = useState('');
  const [ritualTimeSlot, setRitualTimeSlot] = useState('');
  const [ritualTitle, setRitualTitle] = useState('');
  const [ritualDuration, setRitualDuration] = useState(15);
  const [ritualItemsText, setRitualItemsText] = useState('');
  const [ritualType, setRitualType] = useState<RitualType>('operational_cadence');
  const [ritualFreq, setRitualFreq] = useState<RitualFrequency>('daily');
  const [ritualWeekDays, setRitualWeekDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [ritualIncludeWeekends, setRitualIncludeWeekends] = useState<boolean>(false);
  const [ritualMonthDay, setRitualMonthDay] = useState<number>(1);
  const [ritualMonthlyType, setRitualMonthlyType] = useState<MonthlyScheduleType>('specific_day');

  React.useEffect(() => {
    setDetailRoleId(initialDetailRoleId);
  }, [initialDetailRoleId]);

  const activeRole = useMemo(() => {
    if (detailRoleId) {
      return roles.find(r => r.id === detailRoleId) || currentRole || roles[0];
    }
    return currentRole || roles[0];
  }, [roles, detailRoleId, currentRole]);

  const profile: RoleProfile = useMemo(() => {
    if (!activeRole) {
      return getDefaultRoleProfile(roles[0]);
    }
    return getDefaultRoleProfile(activeRole);
  }, [activeRole, roles]);

  // Atividades (POPs) pertencentes a esta cadeira
  const chairBlocks = useMemo(() => {
    if (!activeRole) return [];
    return allBlocks.filter(b => b.roleId === activeRole.id);
  }, [allBlocks, activeRole]);

  // Ritos pertencentes a esta cadeira
  const chairRituals = useMemo(() => {
    if (!activeRole) return [];
    return allRituals.filter(r => r.roleId === activeRole.id);
  }, [allRituals, activeRole]);

  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return roles;
    const term = searchTerm.toLowerCase();
    return roles.filter(r => {
      const p = getDefaultRoleProfile(r);
      const hardSkillsMatch = p.competencies?.hardSkills?.some(h => h.toLowerCase().includes(term));
      const softSkillsMatch = p.competencies?.softSkills?.some(s => s.toLowerCase().includes(term));
      return (
        r.title.toLowerCase().includes(term) ||
        (r.code && r.code.toLowerCase().includes(term)) ||
        r.department.toLowerCase().includes(term) ||
        (r.description && r.description.toLowerCase().includes(term)) ||
        (p.unionAffiliation && p.unionAffiliation.toLowerCase().includes(term)) ||
        hardSkillsMatch ||
        softSkillsMatch
      );
    });
  }, [roles, searchTerm]);

  // Block Modal Actions
  const handleOpenBlockModal = (block?: RoutineBlock) => {
    if (block) {
      setEditingBlock(block);
      setBlockCode(block.code || '');
      setBlockTimeWindow(block.timeWindow);
      setBlockTitle(block.title);
      setBlockDeliverable(block.deliverable);
      setBlockSopMarkdown(block.sopMarkdown);
      setBlockFrequency(block.frequency || 'daily');
      setBlockDayOfWeek(block.dayOfWeek ?? 5);
      setBlockDayOfMonth(block.dayOfMonth ?? 20);
      setBlockVersion(block.version || 'v1.0');
      setBlockHomologated(block.homologatedBy || 'Diretoria Executiva');
    } else {
      setEditingBlock(null);
      setBlockCode(`POP-${activeRole?.code ? activeRole.code.replace('CAD-', '') : '01'}-0${chairBlocks.length + 1}`);
      setBlockTimeWindow('08:00 - 09:30');
      setBlockTitle('');
      setBlockDeliverable('');
      setBlockSopMarkdown('### Procedimento Operacional Padrão (POP)\n\n**Objetivo:** ...\n\n1. Passo um\n2. Passo dois');
      setBlockFrequency('daily');
      setBlockDayOfWeek(5);
      setBlockDayOfMonth(20);
      setBlockVersion('v1.0');
      setBlockHomologated('Diretoria Executiva');
    }
    setIsBlockModalOpen(true);
  };

  const handleSaveBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle || !blockDeliverable || !blockTimeWindow || !activeRole) return;

    const blockPayload = {
      code: blockCode,
      timeWindow: blockTimeWindow,
      title: blockTitle,
      deliverable: blockDeliverable,
      sopMarkdown: blockSopMarkdown,
      frequency: blockFrequency,
      dayOfWeek: blockFrequency === 'weekly' ? Number(blockDayOfWeek) : undefined,
      dayOfMonth: blockFrequency === 'monthly' ? Number(blockDayOfMonth) : undefined,
      version: blockVersion,
      homologatedBy: blockHomologated
    };

    if (editingBlock) {
      await fetch(`/api/blocks/${editingBlock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockPayload)
      });
    } else {
      await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: activeRole.id,
          ...blockPayload
        })
      });
    }
    setIsBlockModalOpen(false);
    if (onRefreshData) onRefreshData();
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('Deseja excluir esta atividade/procedimento operacional da cadeira?')) return;
    await fetch(`/api/blocks/${id}`, { method: 'DELETE' });
    if (onRefreshData) onRefreshData();
  };

  // Ritual Modal Actions
  const handleOpenRitualModal = (ritual?: DailyRitual) => {
    if (ritual) {
      setEditingRitual(ritual);
      setRitualCode(ritual.code || '');
      setRitualTimeSlot(ritual.timeSlot);
      setRitualTitle(ritual.title);
      setRitualDuration(ritual.durationMinutes);
      setRitualItemsText(ritual.agendaItems.join('\n'));
      setRitualType(ritual.type || (ritual.code?.startsWith('CON') || ritual.title.toLowerCase().includes('conselho') ? 'board_council' : 'operational_cadence'));
      setRitualFreq(ritual.frequency || 'daily');
      setRitualWeekDays(ritual.weekDays || [1, 2, 3, 4, 5]);
      setRitualIncludeWeekends(ritual.includeWeekends || false);
      setRitualMonthDay(ritual.monthDay || 1);
      setRitualMonthlyType(ritual.monthlyType || 'specific_day');
    } else {
      setEditingRitual(null);
      setRitualCode(`RIT-${activeRole?.code ? activeRole.code.replace('CAD-', '') : '01'}-0${chairRituals.length + 1}`);
      setRitualTimeSlot('14:30');
      setRitualTitle('Despacho Operacional com a Diretoria');
      setRitualDuration(20);
      setRitualItemsText('Validação de entregáveis do dia\nAnálise de desvios e pendências operacionais\nEncaminhamentos e alinhamento de prioridades');
      setRitualType('operational_cadence');
      setRitualFreq('daily');
      setRitualWeekDays([1, 2, 3, 4, 5]);
      setRitualIncludeWeekends(false);
      setRitualMonthDay(1);
      setRitualMonthlyType('specific_day');
    }
    setIsRitualModalOpen(true);
  };

  const toggleWeekDay = (dayVal: number) => {
    setRitualWeekDays(prev => {
      if (prev.includes(dayVal)) {
        if (prev.length === 1) return prev;
        return prev.filter(d => d !== dayVal);
      } else {
        return [...prev, dayVal].sort((a, b) => a - b);
      }
    });
  };

  const handleSaveRitual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ritualTitle || !ritualTimeSlot || !activeRole) return;

    const items = ritualItemsText.split('\n').map(s => s.trim()).filter(Boolean);

    const ritualPayload = {
      code: ritualCode,
      timeSlot: ritualTimeSlot,
      title: ritualTitle,
      type: ritualType,
      frequency: ritualFreq,
      weekDays: ritualFreq === 'daily' && !ritualIncludeWeekends ? [1, 2, 3, 4, 5] : (ritualFreq === 'weekly' ? ritualWeekDays : undefined),
      includeWeekends: ritualIncludeWeekends,
      monthDay: ritualFreq === 'monthly' ? Number(ritualMonthDay) : undefined,
      monthlyType: ritualFreq === 'monthly' ? ritualMonthlyType : undefined,
      durationMinutes: Number(ritualDuration),
      agendaItems: items
    };

    if (editingRitual) {
      await fetch(`/api/rituals/${editingRitual.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ritualPayload)
      });
    } else {
      await fetch('/api/rituals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: activeRole.id,
          ...ritualPayload
        })
      });
    }
    setIsRitualModalOpen(false);
    if (onRefreshData) onRefreshData();
  };

  const handleDeleteRitual = async (id: string) => {
    if (!confirm('Deseja excluir este rito da cadeira?')) return;
    await fetch(`/api/rituals/${id}`, { method: 'DELETE' });
    if (onRefreshData) onRefreshData();
  };

  const handleCopyProfileText = () => {
    if (!activeRole || !profile) return;

    const responsibilitiesText = profile.responsibilities
      .map(g => `\n### ${g.category}\n` + g.items.map(it => `- ${it}`).join('\n'))
      .join('\n');

    const fullDossier = `=====================================================
RGR • PERFIL DA CADEIRA OPERACIONAL
=====================================================
Cadeira: ${activeRole.title} (${activeRole.code || 'CAD'})
Departamento: ${profile.department}
Reporte Direto: ${profile.directReport}
Enquadramento Sindical: ${profile.unionAffiliation || 'N/A'}
Regime de Contratação: ${profile.contractType || 'CLT'}
Jornada de Trabalho: ${profile.workSchedule || 'N/A'}
Modalidade: ${profile.workMode || 'Presencial'}

1. MISSÃO E OBJETIVO DA CADEIRA
${profile.mission}

2. PRINCIPAIS RESPONSABILIDADES E ATRIBUIÇÕES
${responsibilitiesText}

3. MATRIZ DE COMPETÊNCIAS & HABILIDADES
REQUISITOS FORMAIS:
${profile.competencies.requirements.map(r => `• ${r}`).join('\n')}

HARD SKILLS (TÉCNICAS):
${profile.competencies.hardSkills.map(h => `• ${h}`).join('\n')}

SOFT SKILLS (COMPORTAMENTO):
${profile.competencies.softSkills.map(s => `• ${s}`).join('\n')}

4. ENTREGÁVEIS & SLAS INE GOCIÁVEIS:
${(profile.nonNegotiableSlas || []).map(sla => `[SLA] ${sla}`).join('\n')}
=====================================================`;

    navigator.clipboard.writeText(fullDossier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getExportTitle = () => {
    if (!activeRole) return 'Perfil da Cadeira';
    const chairName = profile.positionTitle?.trim() || activeRole.title;
    const cleanCode = activeRole.code ? ` (${activeRole.code})` : '';
    return `${chairName}${cleanCode} - Perfil da Cadeira`;
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = getExportTitle();
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  if (!roles || roles.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        Nenhuma cadeira cadastrada no sistema.
      </div>
    );
  }

  // TELA DE TODAS AS CADEIRAS (Visão geral de todas as cadeiras)
  if (!detailRoleId) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Banner */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Governança & Padrões
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                Matriz Homologada de Cadeiras & Funções
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Perfil das Cadeiras Operacionais
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Edite diretamente o perfil formal, os POPs (atividades diárias/mensais com horários) e os ritos de despacho de cada cadeira.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {roles.length} {roles.length === 1 ? 'Cadeira' : 'Cadeiras'}
            </span>
          </div>
        </div>

        {/* Search Bar & Visualização */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cadeira por código, título, departamento ou competência..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-xs"
            />
          </div>
        </div>

        {/* Tabela Corporativa de Cadeiras & Funções */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  <th className="py-3.5 px-4">Cadeira & Código</th>
                  <th className="py-3.5 px-4">Departamento</th>
                  <th className="py-3.5 px-4">Missão / Escopo Principal</th>
                  <th className="py-3.5 px-4 text-center">Atividades (POPs)</th>
                  <th className="py-3.5 px-4 text-center">Ritos Diários</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredRoles.map(role => {
                  const rProfile = getDefaultRoleProfile(role);
                  const isActive = role.id === (currentRole?.id);
                  const rBlocks = allBlocks.filter(b => b.roleId === role.id);
                  const rRituals = allRituals.filter(r => r.roleId === role.id);

                  return (
                    <tr 
                      key={role.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors ${
                        isActive ? 'bg-atlas-50/30 dark:bg-atlas-950/20' : ''
                      }`}
                    >
                      {/* Cadeira & Código */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800 shrink-0">
                            {role.code || 'CAD-01'}
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{role.title}</span>
                              {isActive && (
                                <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                                  Ativa
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {rProfile.positionTitle || role.title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Departamento */}
                      <td className="py-3.5 px-4 align-middle text-slate-600 dark:text-slate-300 font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                          {role.department}
                        </span>
                      </td>

                      {/* Missão */}
                      <td className="py-3.5 px-4 align-middle text-slate-500 dark:text-slate-400 max-w-sm">
                        <p className="line-clamp-2 leading-relaxed">
                          {rProfile.mission || role.description}
                        </p>
                      </td>

                      {/* Atividades (POPs) */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailRoleId(role.id);
                            setChairSubTab('blocks');
                            onSelectRole(role.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-medium text-[11px] cursor-pointer transition-colors"
                          title="Gerenciar atividades e POPs desta cadeira"
                        >
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{rBlocks.length} POPs</span>
                        </button>
                      </td>

                      {/* Ritos Diários */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailRoleId(role.id);
                            setChairSubTab('rituals');
                            onSelectRole(role.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-medium text-[11px] cursor-pointer transition-colors"
                          title="Gerenciar ritos executivos desta cadeira"
                        >
                          <Landmark className="w-3 h-3 text-amber-500" />
                          <span>{rRituals.length} Ritos</span>
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setDetailRoleId(role.id);
                              setChairSubTab('profile');
                              onSelectRole(role.id);
                            }}
                            className="px-3 py-1.5 bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                            title="Visualizar e editar perfil detalhado"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Perfil</span>
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
      </div>
    );
  }

  // TELA DETALHADA / EDIÇÃO DA CADEIRA
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner (Hidden in Print) */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs space-y-4 transition-colors no-print">
        
        {/* Top Navigation & Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          
          {/* Left: Voltar + Código da Cadeira + Subtítulo */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setDetailRoleId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
              title="Voltar para a lista de todas as cadeiras"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Todas as Cadeiras</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700 shrink-0">|</span>

            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800 whitespace-nowrap shrink-0">
              {activeRole.code || 'CAD-01'}
            </span>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap hidden sm:inline">
              Edição & Governança da Cadeira
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Chair Selector */}
            <div className="relative">
              <select
                value={activeRole.id}
                onChange={(e) => {
                  setDetailRoleId(e.target.value);
                  onSelectRole(e.target.value);
                }}
                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 pr-8 cursor-pointer whitespace-nowrap"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.code || 'CAD'})
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-2.5 pointer-events-none text-slate-400 text-xs">
                ▾
              </div>
            </div>

            {chairSubTab === 'profile' && (
              <>
                <button
                  onClick={handleCopyProfileText}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Copiar texto formatado do perfil"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Editar informações do perfil"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Editar Dossiê</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-atlas-600 hover:bg-atlas-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                  title="Imprimir documento oficial em A4 ou salvar como PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir A4 / PDF</span>
                </button>
              </>
            )}

            {chairSubTab === 'blocks' && (
              <button
                onClick={() => handleOpenBlockModal()}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-atlas-600 hover:bg-atlas-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                title="Cadastrar nova atividade operacional para esta cadeira"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nova Atividade / POP</span>
              </button>
            )}

            {chairSubTab === 'rituals' && (
              <button
                onClick={() => handleOpenRitualModal()}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                title="Cadastrar novo rito ou reunião de despacho para esta cadeira"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Novo Rito de Despacho</span>
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {activeRole.title} ({activeRole.code || 'CAD'})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Departamento: <strong className="text-slate-700 dark:text-slate-300">{activeRole.department}</strong> • Configure abaixo o perfil da função, as atividades com janelas de horários e os ritos de despacho desta cadeira.
          </p>
        </div>

        {/* 3 Sub-tabs da Cadeira */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setChairSubTab('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              chairSubTab === 'profile'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1. Perfil & Competências (Dossiê)</span>
          </button>

          <button
            onClick={() => setChairSubTab('blocks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              chairSubTab === 'blocks'
                ? 'bg-atlas-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>2. Atividades & Rotinas (POPs)</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              chairSubTab === 'blocks' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {chairBlocks.length}
            </span>
          </button>

          <button
            onClick={() => setChairSubTab('rituals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              chairSubTab === 'rituals'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>3. Ritos de Despacho & Conselho</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              chairSubTab === 'rituals' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {chairRituals.length}
            </span>
          </button>
        </div>

      </div>

      {/* ABA 1: DOSSIÊ & PERFIL FORMAL */}
      {chairSubTab === 'profile' && (
        <div 
          id="printable-role-profile"
          className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-xs text-slate-800 dark:text-slate-200 space-y-7 transition-colors"
        >
          {/* Print-Only Formal Letterhead */}
          <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs font-mono tracking-tight text-center shrink-0">
                RGR
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                  {profile.positionTitle || activeRole.title}
                </h1>
                <p className="text-[11px] text-slate-600">
                  Perfil de Função & Requisitos de Governança • Facilities Brasil S.A.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">CÓDIGO DA CADEIRA</span>
              <span className="text-sm font-mono font-bold text-slate-900">{activeRole.code || 'CAD-01'}</span>
            </div>
          </div>

          {/* Section Header: Role Big Badge & Title */}
          <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800">
                  {activeRole.code || 'CAD'}
                </span>
                <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                  Perfil de Função Homologado
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {profile.positionTitle || activeRole.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Departamento: <span className="font-semibold text-slate-700 dark:text-slate-300">{profile.department}</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shrink-0 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Reporte Direto</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-sans">
                {profile.directReport || 'Diretoria Executiva / CEO'}
              </span>
            </div>
          </div>

          {/* 1. IDENTIFICAÇÃO DA POSIÇÃO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px]">
                1
              </span>
              <span>Identificação da Posição & Enquadramento</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Título do Cargo</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {profile.positionTitle}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Departamento</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {profile.department}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Reporte Direto</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {profile.directReport}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <Scale className="w-3 h-3 text-slate-400" />
                  <span>Enquadramento Sindical</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {profile.unionAffiliation || 'CCT SIEMACO Paraná'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Regime & Modalidade</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {profile.contractType || 'CLT – Efetivo'} • {profile.workMode || 'Presencial'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Jornada de Trabalho</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  {profile.workSchedule || 'Segunda a Sexta-feira, das 08:00 às 17:48 (1h intervalo)'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. MISSÃO E OBJETIVO DA CADEIRA */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px]">
                2
              </span>
              <span>Missão e Objetivo da Cadeira</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-atlas-600 dark:bg-atlas-500" />
              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic pl-1">
                &ldquo;{profile.mission}&rdquo;
              </p>
            </div>
          </div>

          {/* 3. PRINCIPAIS RESPONSABILIDADES E ATRIBUIÇÕES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px]">
                  3
                </span>
                <span>Principais Responsabilidades & Atribuições (Macro-processos)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {profile.responsibilities.length} Blocos
              </span>
            </div>

            <div className="space-y-4">
              {profile.responsibilities.map((group, gIdx) => (
                <div 
                  key={gIdx}
                  className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-atlas-500" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                      {group.category}
                    </h4>
                  </div>

                  <div className="space-y-2 pl-3">
                    {group.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. MATRIZ DE COMPETÊNCIAS & HABILIDADES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px]">
                4
              </span>
              <span>Matriz de Competências & Habilidades (Requisitos da Cadeira)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Requisitos Formais */}
              <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                  <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Requisitos Formais
                  </h5>
                </div>
                <div className="space-y-2">
                  {profile.competencies.requirements.map((req, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-snug">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hard Skills */}
              <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Hard Skills (Técnicas)
                  </h5>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.competencies.hardSkills.map((skill, sIdx) => (
                    <span 
                      key={sIdx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Soft Skills (Comportamento)
                  </h5>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.competencies.softSkills.map((soft, sIdx) => (
                    <span 
                      key={sIdx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200"
                    >
                      {soft}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. ENTREGÁVEIS & SLAS INE GOCIÁVEIS */}
          {profile.nonNegotiableSlas && profile.nonNegotiableSlas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px]">
                  5
                </span>
                <span>Entregáveis & SLAs Inegociáveis da Cadeira</span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-2">
                {profile.nonNegotiableSlas.map((sla, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span className="font-medium">{sla}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. TERMO DE CIÊNCIA E COMPROMISSO */}
          <div className="pt-4 border-t border-slate-200/90 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Termo de Ciência & Acordo de Governança
              </h4>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Declaro ter pleno conhecimento dos requisitos, responsabilidades, competências e entregáveis estabelecidos neste Perfil da Cadeira. Comprometo-me a executar a rotina com disciplina, zelar pela conformidade dos POPs e alimentar o sistema RGR em tempo real.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="border-t border-slate-300 dark:border-slate-700 pt-2 text-center sm:text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Ocupante Responsável pela Cadeira
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {activeRole.title} ({activeRole.code || 'CAD'})
                </p>
              </div>

              <div className="border-t border-slate-300 dark:border-slate-700 pt-2 text-center sm:text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Cristiano Silva (Diretoria Executiva / CEO)
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Homologação RGR • Facilities Brasil S.A.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: ATIVIDADES & ROTINAS (POPs DA CADEIRA COM HORÁRIOS E FREQUÊNCIA) */}
      {chairSubTab === 'blocks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Atividades Operacionais Padrão (POPs) vinculadas a esta cadeira
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Defina os horários de início e término, a frequência (diária, semanal ou mensal) e o entregável obrigatório.
              </p>
            </div>
            <button
              onClick={() => handleOpenBlockModal()}
              className="px-3.5 py-2 bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nova Atividade / POP</span>
            </button>
          </div>

          {chairBlocks.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-8 text-center text-xs text-slate-500 shadow-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">Nenhuma atividade cadastrada para esta cadeira.</p>
              <p className="mt-1">Clique no botão &ldquo;+ Nova Atividade / POP&rdquo; acima para adicionar a rotina diária, semanal ou mensal desta função.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {chairBlocks.map(block => (
                <div
                  key={block.id}
                  className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      {block.code || 'POP-01'}
                    </span>
                    <span className="font-mono font-semibold text-atlas-600 dark:text-atlas-400 whitespace-nowrap">
                      {block.timeWindow}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{block.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                          {formatBlockFrequency(block).label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <strong className="text-slate-700 dark:text-slate-300">Entregável:</strong> {block.deliverable}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                      {block.version || 'v1.0'}
                    </span>
                    <button
                      onClick={() => handleOpenBlockModal(block)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Editar Atividade / POP"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Excluir Atividade / POP"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: RITOS DE DESPACHO & GOVERNANÇA DA CADEIRA */}
      {chairSubTab === 'rituals' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ritos de Despacho & Sessões de Governança
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reuniões de alinhamento com a Diretoria/CEO, cadências operacionais ou pautas deliberativas de conselho.
              </p>
            </div>
            <button
              onClick={() => handleOpenRitualModal()}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Novo Rito de Despacho</span>
            </button>
          </div>

          {chairRituals.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-8 text-center text-xs text-slate-500 shadow-xs">
              <Landmark className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">Nenhum rito de despacho cadastrado para esta cadeira.</p>
              <p className="mt-1">Clique no botão &ldquo;+ Novo Rito de Despacho&rdquo; acima para configurar reuniões periódicas e pautas.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {chairRituals.map(rit => (
                <div
                  key={rit.id}
                  className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {rit.timeSlot} • {rit.durationMinutes} min
                      </span>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{rit.title}</h4>
                      {rit.type === 'board_council' || rit.code?.startsWith('CON') || rit.title.toLowerCase().includes('conselho') ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Landmark className="w-3 h-3 text-amber-500" />
                          Pauta de Conselho
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <CheckSquare className="w-3 h-3 text-slate-400" />
                          Cadência Operacional
                        </span>
                      )}

                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatRitualFrequency(rit)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {rit.agendaItems.length} {rit.type === 'board_council' ? 'pautas deliberativas com votação nominal' : 'itens de pauta e verificação'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenRitualModal(rit)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Editar Rito"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRitual(rit.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Excluir Rito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Role Profile Modal */}
      {isEditModalOpen && (
        <EditRoleProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          role={activeRole}
          onProfileSaved={(updated) => {
            if (onRoleUpdated) onRoleUpdated(updated);
          }}
        />
      )}

      {/* MODAL: CRIAR OU EDITAR ATIVIDADE / POP (COM FREQUÊNCIA E HORÁRIO) */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-xs text-slate-800 dark:text-white shadow-2xl animate-in fade-in my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingBlock ? 'Editar Atividade / POP' : 'Adicionar Nova Atividade / POP'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cadeira: <strong className="text-slate-700 dark:text-slate-300">{activeRole.title} ({activeRole.code})</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Código do POP</label>
                  <input
                    type="text"
                    value={blockCode}
                    onChange={(e) => setBlockCode(e.target.value)}
                    placeholder="Ex: POP-FIN-01"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Janela de Horário</label>
                  <input
                    type="text"
                    value={blockTimeWindow}
                    onChange={(e) => setBlockTimeWindow(e.target.value)}
                    placeholder="Ex: 08:00 - 09:30"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Título da Atividade Operacional</label>
                <input
                  type="text"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  placeholder="Ex: Faturamento Diário de Contratos, Medições & Emissão de NFS-e"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Qual Frequência */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <label className="text-slate-800 dark:text-slate-200 font-bold block">
                  Qual Frequência desta atividade?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBlockFrequency('daily')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                      blockFrequency === 'daily'
                        ? 'bg-atlas-600 text-white border-atlas-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Diária (Seg a Sex)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlockFrequency('weekly')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                      blockFrequency === 'weekly'
                        ? 'bg-atlas-600 text-white border-atlas-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Semanal
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlockFrequency('monthly')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                      blockFrequency === 'monthly'
                        ? 'bg-atlas-600 text-white border-atlas-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Mensal
                  </button>
                </div>

                {blockFrequency === 'weekly' && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Dia da semana de execução:</label>
                    <select
                      value={blockDayOfWeek}
                      onChange={(e) => setBlockDayOfWeek(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium text-slate-900 dark:text-white"
                    >
                      {WEEK_DAYS.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {blockFrequency === 'monthly' && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Dia do mês de execução (1 a 31):</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={blockDayOfMonth}
                      onChange={(e) => setBlockDayOfMonth(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Entregável Exigido (Comprovação da Rotina)</label>
                <input
                  type="text"
                  value={blockDeliverable}
                  onChange={(e) => setBlockDeliverable(e.target.value)}
                  placeholder="Ex: NFS-e e boletos emitidos e enviados para a pasta da Operação"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Procedimento Operacional Padrão (POP em Markdown)</label>
                <textarea
                  rows={4}
                  value={blockSopMarkdown}
                  onChange={(e) => setBlockSopMarkdown(e.target.value)}
                  placeholder="Passo a passo padronizado que o operador deve seguir..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Versão</label>
                  <input
                    type="text"
                    value={blockVersion}
                    onChange={(e) => setBlockVersion(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Homologado por</label>
                  <input
                    type="text"
                    value={blockHomologated}
                    onChange={(e) => setBlockHomologated(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Salvar Atividade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR OU EDITAR RITO / REUNIÃO (COM HORÁRIO E FREQUÊNCIA) */}
      {isRitualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-xs text-slate-800 dark:text-white shadow-2xl animate-in fade-in my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingRitual ? 'Editar Rito de Despacho' : 'Cadastrar Novo Rito de Despacho'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cadeira: <strong className="text-slate-700 dark:text-slate-300">{activeRole.title} ({activeRole.code})</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRitualModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRitual} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Código</label>
                  <input
                    type="text"
                    value={ritualCode}
                    onChange={(e) => setRitualCode(e.target.value)}
                    placeholder="Ex: RIT-01"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Horário de Início</label>
                  <input
                    type="text"
                    value={ritualTimeSlot}
                    onChange={(e) => setRitualTimeSlot(e.target.value)}
                    placeholder="Ex: 14:30"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Duração (min)</label>
                  <input
                    type="number"
                    value={ritualDuration}
                    onChange={(e) => setRitualDuration(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Título do Rito de Despacho</label>
                <input
                  type="text"
                  value={ritualTitle}
                  onChange={(e) => setRitualTitle(e.target.value)}
                  placeholder="Ex: Despacho Financeiro da Tarde & Liberação de Pagamentos (com o CEO)"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Natureza */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Natureza do Rito</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRitualType('operational_cadence')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      ritualType === 'operational_cadence'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Cadência Operacional</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRitualType('board_council')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      ritualType === 'board_council'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Conselho Deliberativo</span>
                  </button>
                </div>
              </div>

              {/* Qual Frequência */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <label className="text-slate-800 dark:text-slate-200 font-bold block">
                  Qual Frequência do Rito?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRitualFreq('daily')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                      ritualFreq === 'daily'
                        ? 'bg-atlas-600 text-white border-atlas-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Diário (Seg a Sex)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRitualFreq('weekly')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                      ritualFreq === 'weekly'
                        ? 'bg-atlas-600 text-white border-atlas-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Semanal
                  </button>
                  <button
                    type="button"
                    onClick={() => setRitualFreq('monthly')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                      ritualFreq === 'monthly'
                        ? 'bg-atlas-600 text-white border-atlas-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Mensal
                  </button>
                </div>

                {ritualFreq === 'weekly' && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-400 block text-[11px] font-medium">Dias da semana em que este rito acontece:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {WEEK_DAYS.map(d => {
                        const isSelected = ritualWeekDays.includes(d.value);
                        return (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => toggleWeekDay(d.value)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                              isSelected
                                ? 'bg-atlas-600 text-white border-atlas-700 font-bold'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {ritualFreq === 'monthly' && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div>
                      <label className="text-slate-600 dark:text-slate-400 block text-[11px] font-medium mb-1">Regra de agendamento mensal:</label>
                      <select
                        value={ritualMonthlyType}
                        onChange={(e) => setRitualMonthlyType(e.target.value as MonthlyScheduleType)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium text-slate-900 dark:text-white"
                      >
                        <option value="specific_day">Dia Fixo do Mês</option>
                        <option value="first_business_day">1º Dia Útil do Mês</option>
                        <option value="fifth_business_day">5º Dia Útil do Mês</option>
                        <option value="last_business_day">Último Dia Útil do Mês</option>
                      </select>
                    </div>

                    {ritualMonthlyType === 'specific_day' && (
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block text-[11px] font-medium mb-1">Dia do mês (1 a 31):</label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={ritualMonthDay}
                          onChange={(e) => setRitualMonthDay(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  Itens da Pauta (uma pauta por linha)
                </label>
                <textarea
                  rows={4}
                  value={ritualItemsText}
                  onChange={(e) => setRitualItemsText(e.target.value)}
                  placeholder="Pauta 1&#10;Pauta 2&#10;Pauta 3"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRitualModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Salvar Rito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
