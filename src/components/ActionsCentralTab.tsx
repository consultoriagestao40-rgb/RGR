'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  User, 
  Check, 
  Trash2, 
  MessageSquare, 
  Building2, 
  Briefcase, 
  Layers, 
  Kanban, 
  ListFilter, 
  FileCheck2,
  Send,
  Sparkles,
  X,
  ArrowUpRight,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { GovernanceAction, ActionStatus, ActionPriority, OperationalRole } from '@/lib/types';
import { formatDateBR } from '@/lib/frequency';

interface ActionsCentralTabProps {
  roles: OperationalRole[];
  currentRole: OperationalRole | null;
  onOpenMeetingAiModal?: () => void;
  onSelectRole?: (roleId: string) => void;
}

export const ActionsCentralTab: React.FC<ActionsCentralTabProps> = ({
  roles,
  currentRole,
  onOpenMeetingAiModal,
  onSelectRole
}) => {
  const [actions, setActions] = useState<GovernanceAction[]>([]);
  const [loading, setLoading] = useState(true);

  // Visual Tabs (Abas Separadas de Visualização)
  const [activeViewTab, setActiveViewTab] = useState<'table' | 'by_role' | 'deadline_alerts' | 'kanban'>('table');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Follow-up Notes Modal
  const [activeActionForNotes, setActiveActionForNotes] = useState<GovernanceAction | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // New Manual Action Modal
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);
  const [newActionForm, setNewActionForm] = useState({
    title: '',
    roleId: roles[0]?.id || '',
    assigneeName: roles[0]?.title || '',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Operações & Postos',
    priority: 'medium' as ActionPriority,
    notes: ''
  });

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch actions from API
  const loadActions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/actions');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setActions(data);
        }
      }
    } catch (err) {
      console.error('Error fetching actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  // Unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    actions.forEach(a => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [actions]);

  // Quick Stats
  const stats = useMemo(() => {
    const total = actions.length;
    const completed = actions.filter(a => a.status === 'completed').length;
    const pending = actions.filter(a => a.status === 'pending').length;
    const inProgress = actions.filter(a => a.status === 'in_progress').length;
    const overdue = actions.filter(a => a.status !== 'completed' && a.dueDate < todayStr).length;
    const dueToday = actions.filter(a => a.status !== 'completed' && a.dueDate === todayStr).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, inProgress, overdue, dueToday, completionRate };
  }, [actions, todayStr]);

  // Role badge styling helper
  const getRoleBadgeStyle = (roleCode?: string) => {
    const code = (roleCode || '').toUpperCase();
    if (code.includes('FIN')) {
      return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80';
    }
    if (code.includes('DP') || code.includes('RH')) {
      return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80';
    }
    if (code.includes('OPE') || code.includes('HEAD')) {
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80';
    }
    return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80';
  };

  // Update action status
  const handleUpdateStatus = async (actionId: string, newStatus: ActionStatus) => {
    try {
      setActions(prev => prev.map(a => a.id === actionId ? { ...a, status: newStatus } : a));
      await fetch('/api/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: actionId, status: newStatus })
      });
    } catch (err) {
      console.error('Error updating status:', err);
      loadActions();
    }
  };

  // Add follow-up note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionForNotes || !newNoteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeActionForNotes.id,
          note: {
            authorName: 'Cristiano Silva (CEO)',
            content: newNoteContent.trim()
          }
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setActions(prev => prev.map(a => a.id === updated.id ? updated : a));
        setActiveActionForNotes(updated);
        setNewNoteContent('');
      }
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Delete action
  const handleDeleteAction = async (id: string) => {
    if (!confirm('Deseja realmente remover esta ação do plano de governança?')) return;
    try {
      setActions(prev => prev.filter(a => a.id !== id));
      await fetch(`/api/actions?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting action:', err);
      loadActions();
    }
  };

  // Create manual action
  const handleCreateManualAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionForm.title.trim()) return;

    const role = roles.find(r => r.id === newActionForm.roleId) || roles[0];

    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newActionForm.title.trim(),
          roleId: role.id,
          roleTitle: role.title,
          roleCode: role.code || 'CAD',
          assigneeName: newActionForm.assigneeName || role.title,
          dueDate: newActionForm.dueDate,
          category: newActionForm.category,
          priority: newActionForm.priority,
          status: 'pending',
          notes: newActionForm.notes.trim() || 'Criada diretamente na Central de Ações pelo CEO.'
        })
      });

      if (res.ok) {
        const created = await res.json();
        setActions(prev => [created, ...prev]);
        setIsCreateActionModalOpen(false);
        setNewActionForm({
          title: '',
          roleId: roles[0]?.id || '',
          assigneeName: roles[0]?.title || '',
          dueDate: todayStr,
          category: 'Operações & Postos',
          priority: 'medium',
          notes: ''
        });
      }
    } catch (err) {
      console.error('Error creating action:', err);
    }
  };

  // Filtered Actions
  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = action.title.toLowerCase().includes(q);
        const matchNotes = action.notes?.toLowerCase().includes(q);
        const matchAssignee = action.assigneeName?.toLowerCase().includes(q);
        const matchCategory = action.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchNotes && !matchAssignee && !matchCategory) return false;
      }

      if (selectedRoleFilter !== 'all' && action.roleId !== selectedRoleFilter) {
        return false;
      }

      if (selectedCategoryFilter !== 'all' && action.category !== selectedCategoryFilter) {
        return false;
      }

      if (selectedStatusFilter === 'overdue') {
        if (action.status === 'completed' || action.dueDate >= todayStr) return false;
      } else if (selectedStatusFilter !== 'all' && action.status !== selectedStatusFilter) {
        return false;
      }

      if (selectedDateFilter === 'today') {
        if (action.dueDate !== todayStr) return false;
      } else if (selectedDateFilter === 'overdue') {
        if (action.status === 'completed' || action.dueDate >= todayStr) return false;
      } else if (selectedDateFilter === 'this_week') {
        const actionDate = new Date(action.dueDate);
        const now = new Date(todayStr);
        const diffDays = Math.ceil((actionDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (diffDays < 0 || diffDays > 7) return false;
      } else if (selectedDateFilter === 'this_month') {
        const monthPrefix = todayStr.substring(0, 7);
        if (!action.dueDate.startsWith(monthPrefix)) return false;
      }

      return true;
    });
  }, [actions, searchQuery, selectedRoleFilter, selectedCategoryFilter, selectedStatusFilter, selectedDateFilter, todayStr]);

  const hasActiveFilters = selectedRoleFilter !== 'all' || selectedCategoryFilter !== 'all' || selectedStatusFilter !== 'all' || selectedDateFilter !== 'all' || Boolean(searchQuery);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE COMMAND HEADER & METRICS                                     */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800">
              GOVERNANÇA 5W2H
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Central Unificada de Ações, Deliberações & Prazos
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Central Executiva de Ações & Planos</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {stats.total} cadastradas
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhe o que foi deliberado com a Diretoria, gerencie responsáveis, monitore prazos e registre o histórico contínuo de anotações.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          {onOpenMeetingAiModal && (
            <button
              type="button"
              onClick={onOpenMeetingAiModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-atlas-600 to-emerald-600 hover:from-atlas-700 hover:to-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>Agente de Reunião com IA</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCreateActionModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ação</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total */}
        <button
          type="button"
          onClick={() => { setSelectedStatusFilter('all'); setSelectedDateFilter('all'); }}
          className={`text-left transition-all border rounded-xl p-3.5 shadow-xs cursor-pointer ${
            selectedStatusFilter === 'all' && selectedDateFilter === 'all'
              ? 'bg-slate-50 dark:bg-slate-800 border-slate-400 dark:border-slate-600 ring-1 ring-slate-400/40'
              : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-[#1e293b] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total de Ações</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-slate-400">100%</span>
          </div>
        </button>

        {/* Em Atraso */}
        <button 
          type="button"
          onClick={() => { setSelectedStatusFilter('overdue'); setSelectedDateFilter('all'); }}
          className={`text-left cursor-pointer transition-all border rounded-xl p-3.5 shadow-xs ${
            selectedStatusFilter === 'overdue'
              ? 'bg-rose-100/80 dark:bg-rose-950/60 border-rose-400 dark:border-rose-600 ring-1 ring-rose-400/40'
              : stats.overdue > 0 
              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 hover:border-rose-300' 
              : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-[#1e293b]'
          }`}
        >
          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Em Atraso
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">{stats.overdue}</span>
            <span className="text-[10px] font-medium text-rose-500">Crítico</span>
          </div>
        </button>

        {/* Vencendo Hoje */}
        <button 
          type="button"
          onClick={() => { setSelectedDateFilter('today'); setSelectedStatusFilter('all'); }}
          className={`text-left cursor-pointer transition-all border rounded-xl p-3.5 shadow-xs ${
            selectedDateFilter === 'today'
              ? 'bg-amber-100/80 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/40'
              : stats.dueToday > 0 
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 hover:border-amber-300' 
              : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-[#1e293b]'
          }`}
        >
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3 h-3" /> Vence Hoje
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{stats.dueToday}</span>
            <span className="text-[10px] font-medium text-amber-500">Atenção</span>
          </div>
        </button>

        {/* Em Andamento */}
        <button 
          type="button"
          onClick={() => { setSelectedStatusFilter('in_progress'); setSelectedDateFilter('all'); }}
          className={`text-left cursor-pointer transition-all border rounded-xl p-3.5 shadow-xs ${
            selectedStatusFilter === 'in_progress'
              ? 'bg-blue-100/80 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 ring-1 ring-blue-400/40'
              : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-[#1e293b] hover:border-blue-300'
          }`}
        >
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Em Andamento</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{stats.inProgress}</span>
            <span className="text-xs text-slate-400">Ativas</span>
          </div>
        </button>

        {/* Pendentes */}
        <button 
          type="button"
          onClick={() => { setSelectedStatusFilter('pending'); setSelectedDateFilter('all'); }}
          className={`text-left cursor-pointer transition-all border rounded-xl p-3.5 shadow-xs ${
            selectedStatusFilter === 'pending'
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 ring-1 ring-slate-400/40'
              : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-[#1e293b] hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">A Fazer</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-slate-700 dark:text-slate-200">{stats.pending}</span>
            <span className="text-xs text-slate-400">Fila</span>
          </div>
        </button>

        {/* Concluídas */}
        <button 
          type="button"
          onClick={() => { setSelectedStatusFilter('completed'); setSelectedDateFilter('all'); }}
          className={`text-left cursor-pointer transition-all border rounded-xl p-3.5 shadow-xs ${
            selectedStatusFilter === 'completed'
              ? 'bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400/40'
              : 'bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-300'
          }`}
        >
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Concluídas</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{stats.completed}</span>
            <span className="text-[10px] font-bold text-emerald-600">{stats.completionRate}%</span>
          </div>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 2. UNIFIED VIEW SWITCHER & DROPDOWN FILTERS TOOLBAR                       */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5">
        
        {/* Top Row: View Mode Switcher + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveViewTab('table')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeViewTab === 'table'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-atlas-500" />
              <span>Matriz Geral 5W2H ({filteredActions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('by_role')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeViewTab === 'by_role'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Por Cadeira / Titular</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('deadline_alerts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeViewTab === 'deadline_alerts'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Alertas de SLA</span>
              {stats.overdue > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                  {stats.overdue}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('kanban')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeViewTab === 'kanban'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Quadro Kanban</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar diretriz, responsável ou anotação..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-atlas-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Dropdown Filters (Lista Suspensa) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            
            {/* Chair Filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <Building2 className="w-3.5 h-3.5 text-atlas-500 shrink-0" />
              <span className="text-slate-500 font-medium shrink-0">Cadeira:</span>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="all" className="dark:bg-slate-900">Todas as Cadeiras ({roles.length})</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id} className="dark:bg-slate-900">
                    {r.code || 'CAD'} • {r.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Category / Theme Filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 font-medium shrink-0">Tema:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="all" className="dark:bg-slate-900">Todos os Temas / Ritos</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="dark:bg-slate-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 font-medium shrink-0">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="all" className="dark:bg-slate-900">Todos os Status</option>
                <option value="pending" className="dark:bg-slate-900">A Fazer (Pendente)</option>
                <option value="in_progress" className="dark:bg-slate-900">Em Execução</option>
                <option value="completed" className="dark:bg-slate-900">Concluída</option>
                <option value="overdue" className="dark:bg-slate-900">Em Atraso Crítico</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 font-medium shrink-0">Prazo:</span>
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="all" className="dark:bg-slate-900">Todas as Datas</option>
                <option value="today" className="dark:bg-slate-900">Vencendo Hoje</option>
                <option value="overdue" className="dark:bg-slate-900">Em Atraso</option>
                <option value="this_week" className="dark:bg-slate-900">Próximos 7 Dias</option>
                <option value="this_month" className="dark:bg-slate-900">Este Mês</option>
              </select>
            </div>

          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSelectedRoleFilter('all');
                setSelectedCategoryFilter('all');
                setSelectedStatusFilter('all');
                setSelectedDateFilter('all');
                setSearchQuery('');
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold flex items-center gap-1 hover:bg-rose-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: MATRIZ EXECUTIVA 5W2H (TABELA DE ALTA DENSIDADE)                  */}
      {/* ========================================================================= */}
      {activeViewTab === 'table' && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4">O Quê (Diretriz / Tarefa 5W2H)</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Quem (Cadeira & Responsável)</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Quando (Prazo & SLA)</th>
                  <th className="py-3.5 px-4">Acompanhamento & Follow-up</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredActions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400">
                      Nenhuma diretriz 5W2H encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredActions.map((action) => {
                    const isOverdue = action.status !== 'completed' && action.dueDate < todayStr;
                    const isToday = action.status !== 'completed' && action.dueDate === todayStr;

                    return (
                      <tr 
                        key={action.id}
                        className={`group hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors ${
                          action.status === 'completed' ? 'opacity-70 bg-slate-50/30 dark:bg-slate-900/10' : ''
                        }`}
                      >
                        {/* 1. Interactive Status Pill */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus: ActionStatus = 
                                action.status === 'pending' ? 'in_progress' :
                                action.status === 'in_progress' ? 'completed' : 'pending';
                              handleUpdateStatus(action.id, nextStatus);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                              action.status === 'completed'
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : action.status === 'in_progress'
                                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                            title="Clique para alternar o status (A Fazer → Em Execução → Concluída)"
                          >
                            {action.status === 'completed' ? (
                              <>
                                <Check className="w-3.5 h-3.5 shrink-0" />
                                <span>Concluída</span>
                              </>
                            ) : action.status === 'in_progress' ? (
                              <>
                                <Clock className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                                <span>Em Execução</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                                <span>A Fazer</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* 2. O Quê (Title, Priority, Category & Origin Minute) */}
                        <td className="py-4 px-4 align-top min-w-[260px] max-w-md">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {action.priority === 'urgent' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap">
                                  <Flame className="w-3 h-3" /> URGENTE
                                </span>
                              ) : action.priority === 'high' ? (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                                  ALTA PRIORIDADE
                                </span>
                              ) : null}

                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 whitespace-nowrap">
                                {action.category || 'Governança'}
                              </span>
                            </div>

                            <p className={`text-xs font-bold leading-snug ${
                              action.status === 'completed' 
                                ? 'line-through text-slate-400 dark:text-slate-500' 
                                : 'text-slate-900 dark:text-white'
                            }`}>
                              {action.title}
                            </p>

                            {action.minuteTitle && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                                <FileCheck2 className="w-3.5 h-3.5 text-atlas-500 shrink-0" />
                                <span className="truncate">{action.minuteTitle}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 3. Quem (Cadeira & Responsável - Sem quebra de linha no código!) */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <div className="flex items-start gap-2.5">
                            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap shrink-0 ${getRoleBadgeStyle(action.roleCode)}`}>
                              {action.roleCode || 'CAD-01'}
                            </span>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                {(action.assigneeName || action.roleTitle || 'Responsável').split('(')[0].trim()}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                                {action.roleTitle || 'Governança'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Quando (Prazo & SLA Status) */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar className={`w-3.5 h-3.5 shrink-0 ${
                                isOverdue ? 'text-rose-500' : isToday ? 'text-amber-500' : 'text-slate-400'
                              }`} />
                              <span className={`font-mono text-xs font-bold ${
                                isOverdue ? 'text-rose-600 dark:text-rose-400' :
                                isToday ? 'text-amber-600 dark:text-amber-400' :
                                'text-slate-800 dark:text-slate-200'
                              }`}>
                                {formatDateBR(action.dueDate)}
                              </span>
                            </div>

                            {action.status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                                <ShieldCheck className="w-3 h-3" /> Entregue
                              </span>
                            ) : isOverdue ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap">
                                <AlertTriangle className="w-3 h-3" /> Em Atraso
                              </span>
                            ) : isToday ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                                <Clock className="w-3 h-3" /> Vence Hoje
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                No Prazo
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Acompanhamento & Follow-up */}
                        <td className="py-4 px-4 align-top min-w-[260px] max-w-sm">
                          <div 
                            onClick={() => setActiveActionForNotes(action)}
                            className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:border-atlas-400 dark:hover:border-atlas-600 transition-all cursor-pointer"
                            title="Clique para abrir o histórico e registrar novo despacho de acompanhamento"
                          >
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {action.notes || 'Sem anotações registradas. Clique para registrar follow-up.'}
                            </p>
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 text-[10px]">
                              <span className="inline-flex items-center gap-1 font-semibold text-atlas-600 dark:text-atlas-400">
                                <MessageSquare className="w-3 h-3" />
                                {action.historyNotes && action.historyNotes.length > 0 
                                  ? `${action.historyNotes.length} registro(s) de follow-up` 
                                  : 'Registrar follow-up'}
                              </span>
                              <ArrowUpRight className="w-3 h-3 text-slate-400" />
                            </div>
                          </div>
                        </td>

                        {/* 6. Ações */}
                        <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveActionForNotes(action)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Abrir Histórico de Follow-up"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Notas</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAction(action.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Excluir diretriz"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: POR CADEIRA / RESPONSÁVEL                                         */}
      {/* ========================================================================= */}
      {activeViewTab === 'by_role' && (
        <div className="space-y-6">
          {roles.map(role => {
            const roleActions = filteredActions.filter(a => a.roleId === role.id);
            const roleCompleted = roleActions.filter(a => a.status === 'completed').length;
            const roleOverdue = roleActions.filter(a => a.status !== 'completed' && a.dueDate < todayStr).length;

            return (
              <div 
                key={role.id}
                className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl overflow-hidden shadow-xs transition-colors"
              >
                <div className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap ${getRoleBadgeStyle(role.code)}`}>
                      {role.code || 'CAD'}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {role.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {role.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {roleOverdue > 0 && (
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1 whitespace-nowrap">
                        <AlertTriangle className="w-3.5 h-3.5" /> {roleOverdue} em atraso
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                      {roleCompleted}/{roleActions.length} concluídas ({roleActions.length > 0 ? Math.round((roleCompleted / roleActions.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {roleActions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      Nenhuma diretriz pendente para esta cadeira.
                    </p>
                  ) : (
                    roleActions.map(action => (
                      <div key={action.id} className="py-3.5 flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus: ActionStatus = 
                                action.status === 'pending' ? 'in_progress' :
                                action.status === 'in_progress' ? 'completed' : 'pending';
                              handleUpdateStatus(action.id, nextStatus);
                            }}
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                              action.status === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : 'border border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {action.status === 'completed' && <Check className="w-3 h-3" />}
                          </button>
                          
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold ${
                                action.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                              }`}>
                                {action.title}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {action.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              {action.notes}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            Prazo: {formatDateBR(action.dueDate)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveActionForNotes(action)}
                            className="px-2.5 py-1 rounded-lg bg-atlas-50 dark:bg-atlas-950/50 text-xs text-atlas-700 dark:text-atlas-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer whitespace-nowrap"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Follow-up</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ALERTAS DE PRAZOS & VENCIMENTOS                                   */}
      {/* ========================================================================= */}
      {activeViewTab === 'deadline_alerts' && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-[#111827] border-l-4 border-l-rose-500 border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Diretrizes em Atraso Crítico ({filteredActions.filter(a => a.status !== 'completed' && a.dueDate < todayStr).length})
                </h3>
              </div>
              <span className="text-[10px] font-semibold uppercase text-rose-600 tracking-wider">Ação Imediata</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredActions.filter(a => a.status !== 'completed' && a.dueDate < todayStr).length === 0 ? (
                <p className="text-xs text-emerald-600 py-2 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Nenhuma diretriz em atraso neste momento. Governança em dia!
                </p>
              ) : (
                filteredActions
                  .filter(a => a.status !== 'completed' && a.dueDate < todayStr)
                  .map(action => (
                    <div key={action.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {action.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                          <span className="font-bold text-rose-600 font-mono">Venceu em: {formatDateBR(action.dueDate)}</span>
                          <span>•</span>
                          <span>Responsável: {action.assigneeName}</span>
                          <span>•</span>
                          <span>{action.category}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          <strong>Último follow-up:</strong> {action.notes}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveActionForNotes(action)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        Cobrar & Anotar
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border-l-4 border-l-amber-500 border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Vencendo Hoje ({filteredActions.filter(a => a.status !== 'completed' && a.dueDate === todayStr).length})
                </h3>
              </div>
              <span className="text-[10px] font-semibold uppercase text-amber-600 tracking-wider">Atenção</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredActions.filter(a => a.status !== 'completed' && a.dueDate === todayStr).length === 0 ? (
                <p className="text-xs text-slate-400 py-2">
                  Nenhuma diretriz prevista para vencer hoje.
                </p>
              ) : (
                filteredActions
                  .filter(a => a.status !== 'completed' && a.dueDate === todayStr)
                  .map(action => (
                    <div key={action.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {action.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="font-semibold text-amber-600 font-mono">Vence Hoje</span>
                          <span>•</span>
                          <span>Responsável: {action.assigneeName}</span>
                          <span>•</span>
                          <span>{action.category}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(action.id, 'completed')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Concluir</span>
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: QUADRO KANBAN POR STATUS                                          */}
      {/* ========================================================================= */}
      {activeViewTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Coluna 1: Pendentes */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  A Fazer / Pendentes
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {filteredActions.filter(a => a.status === 'pending').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {filteredActions
                .filter(a => a.status === 'pending')
                .map(action => (
                  <div 
                    key={action.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${getRoleBadgeStyle(action.roleCode)}`}>
                        {action.roleCode || 'CAD'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {formatDateBR(action.dueDate)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {action.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                      {action.notes}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {action.assigneeName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(action.id, 'in_progress')}
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Iniciar →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Coluna 2: Em Execução */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Em Execução
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600">
                {filteredActions.filter(a => a.status === 'in_progress').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {filteredActions
                .filter(a => a.status === 'in_progress')
                .map(action => (
                  <div 
                    key={action.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-2.5 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${getRoleBadgeStyle(action.roleCode)}`}>
                        {action.roleCode || 'CAD'}
                      </span>
                      <span className="text-[10px] text-blue-600 font-mono font-bold whitespace-nowrap">
                        {formatDateBR(action.dueDate)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {action.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                      {action.notes}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveActionForNotes(action)}
                        className="text-[11px] text-atlas-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Follow-up</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(action.id, 'completed')}
                        className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Concluir</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Coluna 3: Concluídas */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Concluídas
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">
                {filteredActions.filter(a => a.status === 'completed').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {filteredActions
                .filter(a => a.status === 'completed')
                .map(action => (
                  <div 
                    key={action.id}
                    className="p-4 rounded-xl bg-white/70 dark:bg-[#111827]/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 opacity-80"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                        {action.roleCode || 'CAD'}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>

                    <h4 className="text-xs font-medium line-through text-slate-500 dark:text-slate-400 leading-snug">
                      {action.title}
                    </h4>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                      <span>{action.assigneeName}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(action.id, 'in_progress')}
                        className="hover:underline cursor-pointer font-semibold"
                      >
                        Reabrir
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ACOMPANHAMENTO & FOLLOW-UP                                         */}
      {/* ========================================================================= */}
      {activeActionForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800 whitespace-nowrap">
                  {activeActionForNotes.roleCode || 'CAD'} • {activeActionForNotes.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                  {activeActionForNotes.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Responsável: <strong>{activeActionForNotes.assigneeName}</strong> • Prazo: <strong>{formatDateBR(activeActionForNotes.dueDate)}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveActionForNotes(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Histórico de Acompanhamento & Follow-up:
              </span>

              {(!activeActionForNotes.historyNotes || activeActionForNotes.historyNotes.length === 0) ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs text-slate-500 border border-slate-200/70 dark:border-slate-800">
                  {activeActionForNotes.notes || 'Nenhuma anotação registrada ainda.'}
                </div>
              ) : (
                activeActionForNotes.historyNotes.map(hn => (
                  <div key={hn.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{hn.authorName}</span>
                      <span className="text-slate-400 font-mono">
                        {new Date(hn.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {hn.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Registrar Novo Follow-up / Despacho:
              </label>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={3}
                placeholder="Ex: Alinhado no despacho da tarde: fornecedor enviou nota fiscal corrigida e já foi programado o pagamento..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-atlas-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveActionForNotes(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNoteContent.trim()}
                  className="px-4 py-2 rounded-xl bg-atlas-600 hover:bg-atlas-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingNote ? 'Salvando...' : 'Salvar Follow-up'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CRIAR DIRETRIZ 5W2H MANUAL                                         */}
      {/* ========================================================================= */}
      {isCreateActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cadastrar Nova Diretriz 5W2H
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateActionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualAction} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  O Quê (Diretriz / Ação a ser executada) *
                </label>
                <input
                  type="text"
                  required
                  value={newActionForm.title}
                  onChange={(e) => setNewActionForm({ ...newActionForm, title: e.target.value })}
                  placeholder="Ex: Auditar 10 contratos críticos no Checklist Fácil"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-atlas-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Cadeira Responsável
                  </label>
                  <select
                    value={newActionForm.roleId}
                    onChange={(e) => {
                      const r = roles.find(ro => ro.id === e.target.value);
                      setNewActionForm({ 
                        ...newActionForm, 
                        roleId: e.target.value,
                        assigneeName: r?.title || ''
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.code || 'CAD'} • {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Prazo Limite (Quando)
                  </label>
                  <input
                    type="date"
                    required
                    value={newActionForm.dueDate}
                    onChange={(e) => setNewActionForm({ ...newActionForm, dueDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Tema / Rito
                  </label>
                  <input
                    type="text"
                    value={newActionForm.category}
                    onChange={(e) => setNewActionForm({ ...newActionForm, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newActionForm.priority}
                    onChange={(e) => setNewActionForm({ ...newActionForm, priority: e.target.value as ActionPriority })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Anotações Iniciais de Follow-up
                </label>
                <textarea
                  value={newActionForm.notes}
                  onChange={(e) => setNewActionForm({ ...newActionForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Contexto da deliberação ou observações de entrega..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateActionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-atlas-600 hover:bg-atlas-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Salvar Diretriz
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
