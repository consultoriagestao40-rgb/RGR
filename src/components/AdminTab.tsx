'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRight,
  Landmark,
  CheckSquare,
  Calendar,
  Clock
} from 'lucide-react';
import { OperationalRole, RoutineBlock, DailyRitual, SystemUser, RitualType, RitualFrequency, MonthlyScheduleType } from '@/lib/types';
import { WEEK_DAYS, formatRitualFrequency } from '@/lib/frequency';

interface AdminTabProps {
  roles: OperationalRole[];
  selectedRoleId: string;
  blocks: RoutineBlock[];
  rituals: DailyRitual[];
  onRefreshData: () => void;
  onSelectRole: (roleId: string) => void;
  triggerNewRoleModal?: boolean;
  onResetTrigger?: () => void;
  defaultSection?: 'blocks' | 'rituals' | 'roles';
  onOpenRoleProfile?: (roleId: string) => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  roles,
  selectedRoleId,
  blocks,
  rituals,
  onRefreshData,
  onSelectRole,
  triggerNewRoleModal,
  onResetTrigger,
  defaultSection,
  onOpenRoleProfile
}) => {
  const currentRole = roles.find(r => r.id === selectedRoleId) || roles[0];
  const [activeSection, setActiveSection] = useState<'blocks' | 'rituals' | 'roles'>(defaultSection || 'blocks');

  // Role form
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<OperationalRole | null>(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [roleDept, setRoleDept] = useState('');
  const [roleDesc, setRoleDesc] = useState('');

  // Block form
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<RoutineBlock | null>(null);
  const [blockCode, setBlockCode] = useState('');
  const [blockTimeWindow, setBlockTimeWindow] = useState('');
  const [blockTitle, setBlockTitle] = useState('');
  const [blockDeliverable, setBlockDeliverable] = useState('');
  const [blockSopMarkdown, setBlockSopMarkdown] = useState('');
  const [blockFrequency, setBlockFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [blockVersion, setBlockVersion] = useState('v1.0');
  const [blockHomologated, setBlockHomologated] = useState('Diretoria Executiva');

  // Ritual form
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

  // Trigger from outside
  useEffect(() => {
    if (triggerNewRoleModal) {
      setActiveSection('roles');
      handleOpenRoleModal();
      if (onResetTrigger) onResetTrigger();
    }
  }, [triggerNewRoleModal]);

  useEffect(() => {
    if (defaultSection) {
      setActiveSection(defaultSection);
    }
  }, [defaultSection]);

  // Role Actions
  const handleOpenRoleModal = (role?: OperationalRole) => {
    if (role) {
      setEditingRole(role);
      setRoleCode(role.code || '');
      setRoleTitle(role.title);
      setRoleDept(role.department);
      setRoleDesc(role.description);
    } else {
      setEditingRole(null);
      setRoleCode(`CAD-${(roles.length + 1).toString().padStart(2, '0')}`);
      setRoleTitle('');
      setRoleDept('Operações & Facilities');
      setRoleDesc('');
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle || !roleDept) return;

    if (editingRole) {
      await fetch(`/api/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: roleTitle,
          code: roleCode,
          department: roleDept,
          description: roleDesc
        })
      });
    } else {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: roleTitle,
          code: roleCode,
          department: roleDept,
          description: roleDesc
        })
      });
      const created = await res.json();
      if (created.id) onSelectRole(created.id);
    }
    setIsRoleModalOpen(false);
    onRefreshData();
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Deseja excluir esta cadeira operacional e todos os seus blocos normativos?')) return;
    await fetch(`/api/roles/${id}`, { method: 'DELETE' });
    onRefreshData();
  };

  // Block Actions
  const handleOpenBlockModal = (block?: RoutineBlock) => {
    if (block) {
      setEditingBlock(block);
      setBlockCode(block.code || '');
      setBlockTimeWindow(block.timeWindow);
      setBlockTitle(block.title);
      setBlockDeliverable(block.deliverable);
      setBlockSopMarkdown(block.sopMarkdown);
      setBlockFrequency(block.frequency);
      setBlockVersion(block.version || 'v1.0');
      setBlockHomologated(block.homologatedBy || 'Diretoria Executiva');
    } else {
      setEditingBlock(null);
      setBlockCode(`POP-FAC-00${blocks.length + 1}`);
      setBlockTimeWindow('08:00 - 08:30');
      setBlockTitle('');
      setBlockDeliverable('');
      setBlockSopMarkdown('### Procedimento Operacional Padrão (POP)\n\n**Objetivo:** ...\n\n1. Passo um\n2. Passo dois');
      setBlockFrequency('daily');
      setBlockVersion('v1.0');
      setBlockHomologated('Diretoria Executiva');
    }
    setIsBlockModalOpen(true);
  };

  const handleSaveBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle || !blockDeliverable || !blockTimeWindow || !currentRole) return;

    if (editingBlock) {
      await fetch(`/api/blocks/${editingBlock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: blockCode,
          timeWindow: blockTimeWindow,
          title: blockTitle,
          deliverable: blockDeliverable,
          sopMarkdown: blockSopMarkdown,
          frequency: blockFrequency,
          version: blockVersion,
          homologatedBy: blockHomologated
        })
      });
    } else {
      await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: currentRole.id,
          code: blockCode,
          timeWindow: blockTimeWindow,
          title: blockTitle,
          deliverable: blockDeliverable,
          sopMarkdown: blockSopMarkdown,
          frequency: blockFrequency,
          version: blockVersion,
          homologatedBy: blockHomologated
        })
      });
    }
    setIsBlockModalOpen(false);
    onRefreshData();
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('Deseja excluir este procedimento operacional?')) return;
    await fetch(`/api/blocks/${id}`, { method: 'DELETE' });
    onRefreshData();
  };

  // Ritual Actions
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
      setRitualCode(`RIT-0${rituals.length + 1}`);
      setRitualTimeSlot('08:30');
      setRitualTitle('Despacho Matinal com Diretoria');
      setRitualDuration(15);
      setRitualItemsText('Validação de saldos e liquidez\nHomologação do lote de pagamentos\nDeliberação executiva');
      setRitualType('operational_cadence');
      setRitualFreq('daily');
      setRitualWeekDays([1, 2, 3, 4, 5]);
      setRitualIncludeWeekends(false);
      setRitualMonthDay(1);
      setRitualMonthlyType('specific_day');
    }
    setIsRitualModalOpen(true);
  };

  const handleSaveRitual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ritualTitle || !ritualTimeSlot || !currentRole) return;

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
          roleId: currentRole.id,
          ...ritualPayload
        })
      });
    }
    setIsRitualModalOpen(false);
    onRefreshData();
  };

  const handleDeleteRitual = async (id: string) => {
    if (!confirm('Deseja excluir este rito de despacho?')) return;
    await fetch(`/api/rituals/${id}`, { method: 'DELETE' });
    onRefreshData();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Administração
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Arquitetura de Governança
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Matriz de Cadeiras, POPs e Ritos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Parametrização formal de papéis, janelas de horário e procedimentos homologados.
          </p>
        </div>

        {/* Section switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setActiveSection('blocks')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeSection === 'blocks'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            POPs & Rotinas ({blocks.length})
          </button>
          <button
            onClick={() => setActiveSection('rituals')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeSection === 'rituals'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Ritos ({rituals.length})
          </button>
          <button
            onClick={() => setActiveSection('roles')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeSection === 'roles'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Cadeiras ({roles.length})
          </button>
        </div>
      </div>

      {/* SECTION: BLOCKS */}
      {activeSection === 'blocks' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Procedimentos de: <strong className="text-slate-900 dark:text-white">{currentRole?.title}</strong> ({currentRole?.code})
            </span>
            <button
              onClick={() => handleOpenBlockModal()}
              className="px-3.5 py-1.5 bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Procedimento (POP)</span>
            </button>
          </div>

          <div className="space-y-2">
            {blocks.map(block => (
              <div
                key={block.id}
                className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 flex items-center justify-between text-xs shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {block.code || 'POP-01'}
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">{block.timeWindow}</span>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{block.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300">Entregável:</strong> {block.deliverable}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                    {block.version || 'v1.0'}
                  </span>
                  <button
                    onClick={() => handleOpenBlockModal(block)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Editar POP"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Excluir POP"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: RITUALS */}
      {activeSection === 'rituals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Ritos de: <strong className="text-slate-900 dark:text-white">{currentRole?.title}</strong>
            </span>
            <button
              onClick={() => handleOpenRitualModal()}
              className="px-3.5 py-1.5 bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Rito</span>
            </button>
          </div>

          <div className="space-y-2">
            {rituals.map(rit => (
              <div
                key={rit.id}
                className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 flex items-center justify-between text-xs shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
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
                    {rit.agendaItems.length} {rit.type === 'board_council' ? 'pautas com votação nominal deliberativa' : 'itens de verificação diária'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenRitualModal(rit)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Editar Rito"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRitual(rit.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Excluir Rito"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: ROLES */}
      {activeSection === 'roles' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Cadeiras Operacionais Cadastradas
            </span>
            <button
              onClick={() => handleOpenRoleModal()}
              className="px-3.5 py-1.5 bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Cadeira</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {roles.map(role => (
              <div
                key={role.id}
                className={`p-4 rounded-xl border text-xs flex flex-col justify-between shadow-xs transition-all ${
                  selectedRoleId === role.id 
                    ? 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-900 dark:border-blue-500/80 ring-1 ring-slate-900/20 dark:ring-blue-500/20' 
                    : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-[#1e293b] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {role.code || 'CAD-01'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (onOpenRoleProfile) {
                            onOpenRoleProfile(role.id);
                          } else {
                            handleOpenRoleModal(role);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Editar Perfil da Cadeira"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Excluir Cadeira"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{role.title}</h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium block mt-0.5">
                    {role.department}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  {onOpenRoleProfile && (
                    <button
                      onClick={() => onOpenRoleProfile(role.id)}
                      className="text-xs text-atlas-600 dark:text-atlas-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Editar Perfil</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectRole(role.id)}
                    className="text-slate-900 dark:text-blue-400 hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer group ml-auto"
                  >
                    <span>Ativar Cadeira</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-xs text-slate-800 dark:text-white shadow-2xl animate-in fade-in">
            <h3 className="text-sm font-bold mb-3">{editingRole ? 'Editar Cadeira' : 'Cadastrar Nova Cadeira'}</h3>
            <form onSubmit={handleSaveRole} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Código da Cadeira</label>
                  <input
                    type="text"
                    value={roleCode}
                    onChange={(e) => setRoleCode(e.target.value)}
                    placeholder="Ex: CAD-SUP-04"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Departamento</label>
                  <input
                    type="text"
                    value={roleDept}
                    onChange={(e) => setRoleDept(e.target.value)}
                    placeholder="Ex: Suprimentos, Operações..."
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Título do Cargo / Cadeira</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="Ex: Supervisor Operacional de Postos"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Escopo de Atuação e Responsabilidade</label>
                <textarea
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  rows={3}
                  placeholder="Descreva o objetivo da cadeira e a missão do profissional..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-atlas-600 hover:bg-atlas-700 rounded-lg text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  Salvar Cadeira
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-xs text-slate-800 dark:text-white shadow-2xl my-8 animate-in fade-in">
            <h3 className="text-sm font-bold mb-3">{editingBlock ? 'Editar POP & Bloco' : 'Novo POP & Bloco'}</h3>
            <form onSubmit={handleSaveBlock} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Código</label>
                  <input
                    type="text"
                    value={blockCode}
                    onChange={(e) => setBlockCode(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Janela de Horário</label>
                  <input
                    type="text"
                    value={blockTimeWindow}
                    onChange={(e) => setBlockTimeWindow(e.target.value)}
                    placeholder="08:00 - 08:30"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Versão</label>
                  <input
                    type="text"
                    value={blockVersion}
                    onChange={(e) => setBlockVersion(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Título do Macroprocesso</label>
                <input
                  type="text"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Entregável Obrigatório (Critério de Aceite)</label>
                <input
                  type="text"
                  value={blockDeliverable}
                  onChange={(e) => setBlockDeliverable(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Texto Normativo do POP (Markdown)</label>
                <textarea
                  value={blockSopMarkdown}
                  onChange={(e) => setBlockSopMarkdown(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-atlas-600 hover:bg-atlas-700 rounded-lg text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  Salvar Procedimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ritual Modal */}
      {isRitualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-xs text-slate-800 dark:text-white shadow-2xl animate-in fade-in">
            <h3 className="text-sm font-bold mb-3">{editingRitual ? 'Editar Rito' : 'Novo Rito de Despacho'}</h3>
            <form onSubmit={handleSaveRitual} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Horário</label>
                  <input
                    type="text"
                    value={ritualTimeSlot}
                    onChange={(e) => setRitualTimeSlot(e.target.value)}
                    placeholder="08:30"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Duração (Minutos)</label>
                  <input
                    type="number"
                    value={ritualDuration}
                    onChange={(e) => setRitualDuration(Number(e.target.value))}
                    min={5}
                    max={60}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Título do Rito</label>
                <input
                  type="text"
                  value={ritualTitle}
                  onChange={(e) => setRitualTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Natureza do Rito</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRitualType('operational_cadence')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      ritualType === 'operational_cadence'
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-900 dark:border-blue-500 text-slate-900 dark:text-blue-300 ring-1 ring-slate-900/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="font-semibold text-xs flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      Cadência Operacional
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight">Checklist diário de rotina e pendências</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRitualType('board_council')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      ritualType === 'board_council'
                        ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="font-semibold text-xs flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-amber-500" />
                      Pauta de Conselho
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight">Votação nominal e ata deliberativa</span>
                  </button>
                </div>
              </div>
              {/* Periodicidade & Frequência de Execução */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    Periodicidade & Frequência
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium font-mono">
                    {ritualFreq === 'daily' && (!ritualIncludeWeekends ? 'Dias Úteis (Seg a Sex)' : 'Todos os Dias')}
                    {ritualFreq === 'weekly' && `${ritualWeekDays.length}x na semana`}
                    {ritualFreq === 'monthly' && (ritualMonthlyType === 'specific_day' ? `Dia ${ritualMonthDay}` : ritualMonthlyType === 'first_business_day' ? '1º dia útil' : 'Último dia útil')}
                  </span>
                </div>

                {/* Frequency Type Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setRitualFreq('daily');
                      setRitualWeekDays([1, 2, 3, 4, 5]);
                    }}
                    className={`py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      ritualFreq === 'daily'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Diário
                  </button>
                  <button
                    type="button"
                    onClick={() => setRitualFreq('weekly')}
                    className={`py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      ritualFreq === 'weekly'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Semanal
                  </button>
                  <button
                    type="button"
                    onClick={() => setRitualFreq('monthly')}
                    className={`py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      ritualFreq === 'monthly'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Mensal
                  </button>
                </div>

                {/* Sub-options for Daily */}
                {ritualFreq === 'daily' && (
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={!ritualIncludeWeekends}
                        onChange={(e) => setRitualIncludeWeekends(!e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      />
                      <span>
                        <strong>Apenas dias úteis</strong> (Segunda a Sexta — <em>não roda aos finais de semana</em>)
                      </span>
                    </label>
                    {ritualIncludeWeekends && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 pl-5">
                        ⚠️ Atenção: Rito configurado para rodar inclusive aos Sábados e Domingos.
                      </p>
                    )}
                  </div>
                )}

                {/* Sub-options for Weekly */}
                {ritualFreq === 'weekly' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Selecione os dias da semana em que este rito ocorre:
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {WEEK_DAYS.map(day => {
                        const isSelected = ritualWeekDays.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleWeekDay(day.value)}
                            className={`py-1 px-1 rounded-md text-[11px] font-semibold border transition-all text-center cursor-pointer ${
                              isSelected
                                ? 'bg-atlas-600 text-white border-atlas-600 shadow-xs'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                            title={day.fullName}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Ocorrência: {ritualWeekDays.length}x na semana ({ritualWeekDays.map(d => WEEK_DAYS.find(w => w.value === d)?.label).join(', ')})
                    </p>
                  </div>
                )}

                {/* Sub-options for Monthly */}
                {ritualFreq === 'monthly' && (
                  <div className="space-y-2 pt-1 text-[11px]">
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRitualMonthlyType('specific_day')}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          ritualMonthlyType === 'specific_day'
                            ? 'bg-atlas-600 text-white border-atlas-600 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Dia Fixo do Mês
                      </button>
                      <button
                        type="button"
                        onClick={() => setRitualMonthlyType('first_business_day')}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          ritualMonthlyType === 'first_business_day'
                            ? 'bg-atlas-600 text-white border-atlas-600 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        1º Dia Útil
                      </button>
                      <button
                        type="button"
                        onClick={() => setRitualMonthlyType('last_business_day')}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          ritualMonthlyType === 'last_business_day'
                            ? 'bg-atlas-600 text-white border-atlas-600 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Último Dia Útil
                      </button>
                    </div>

                    {ritualMonthlyType === 'specific_day' && (
                      <div className="flex items-center gap-2">
                        <label className="text-slate-600 dark:text-slate-400">Todo dia:</label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={ritualMonthDay}
                          onChange={(e) => setRitualMonthDay(Number(e.target.value))}
                          className="w-16 px-2 py-1 text-center font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                        />
                        <span className="text-slate-500">de cada mês</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Pauta Obrigatória (1 item por linha)</label>
                <textarea
                  value={ritualItemsText}
                  onChange={(e) => setRitualItemsText(e.target.value)}
                  rows={4}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRitualModalOpen(false)}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-atlas-600 hover:bg-atlas-700 rounded-lg text-white font-semibold text-xs shadow-xs cursor-pointer"
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
