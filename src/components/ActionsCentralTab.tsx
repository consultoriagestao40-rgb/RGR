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
  MoreHorizontal, 
  Trash2, 
  MessageSquare, 
  ExternalLink, 
  Building2, 
  Briefcase, 
  Layers, 
  Kanban, 
  ListFilter, 
  AlertCircle,
  FileCheck2,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GovernanceAction, ActionStatus, ActionPriority, OperationalRole, ActionNote } from '@/lib/types';
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
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all'); // 'all' | 'overdue' | 'today' | 'this_week' | 'this_month'

  // Follow-up Notes Drawer / Modal
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

  // Add follow-up note (Locação de anotações)
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
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = action.title.toLowerCase().includes(q);
        const matchNotes = action.notes?.toLowerCase().includes(q);
        const matchAssignee = action.assigneeName?.toLowerCase().includes(q);
        const matchCategory = action.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchNotes && !matchAssignee && !matchCategory) return false;
      }

      // 2. Role Filter
      if (selectedRoleFilter !== 'all' && action.roleId !== selectedRoleFilter) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategoryFilter !== 'all' && action.category !== selectedCategoryFilter) {
        return false;
      }

      // 4. Status Filter
      if (selectedStatusFilter === 'overdue') {
        if (action.status === 'completed' || action.dueDate >= todayStr) return false;
      } else if (selectedStatusFilter !== 'all' && action.status !== selectedStatusFilter) {
        return false;
      }

      // 5. Date Filter
      if (selectedDateFilter === 'today') {
        if (action.dueDate !== todayStr) return false;
      } else if (selectedDateFilter === 'overdue') {
        if (action.status === 'completed' || action.dueDate >= todayStr) return false;
      } else if (selectedDateFilter === 'this_week') {
        // Próximos 7 dias
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
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
              onClick={onOpenMeetingAiModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-atlas-600 to-emerald-600 hover:from-atlas-700 hover:to-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>Agente de Reunião com IA</span>
            </button>
          )}

          <button
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
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total de Ações</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-slate-400">100%</span>
          </div>
        </div>

        {/* Em Atraso */}
        <div 
          onClick={() => { setSelectedStatusFilter('overdue'); setSelectedDateFilter('all'); }}
          className={`cursor-pointer transition-all border rounded-xl p-3.5 shadow-xs ${
            stats.overdue > 0 
              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60' 
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
        </div>

        {/* Vencendo Hoje */}
        <div 
          onClick={() => { setSelectedDateFilter('today'); setSelectedStatusFilter('all'); }}
          className={`cursor-pointer transition-all border rounded-xl p-3.5 shadow-xs ${
            stats.dueToday > 0 
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60' 
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
        </div>

        {/* Em Andamento */}
        <div 
          onClick={() => { setSelectedStatusFilter('in_progress'); setSelectedDateFilter('all'); }}
          className="cursor-pointer transition-all bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-3.5 shadow-xs"
        >
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Em Andamento</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{stats.inProgress}</span>
            <span className="text-xs text-slate-400">Ativas</span>
          </div>
        </div>

        {/* Pendentes */}
        <div 
          onClick={() => { setSelectedStatusFilter('pending'); setSelectedDateFilter('all'); }}
          className="cursor-pointer transition-all bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-3.5 shadow-xs"
        >
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">A Fazer</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-slate-700 dark:text-slate-200">{stats.pending}</span>
            <span className="text-xs text-slate-400">Fila</span>
          </div>
        </div>

        {/* Concluídas */}
        <div 
          onClick={() => { setSelectedStatusFilter('completed'); setSelectedDateFilter('all'); }}
          className="cursor-pointer transition-all bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3.5 shadow-xs"
        >
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Concluídas</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{stats.completed}</span>
            <span className="text-[10px] font-bold text-emerald-600">{stats.completionRate}%</span>
          </div>
        </div>

      </div>

      {/* Visual Mode Selector Tabs (Abas Separadas para Visualização) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          
          <button
            onClick={() => setActiveViewTab('table')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeViewTab === 'table'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Tabela Geral 5W2H ({filteredActions.length})</span>
          </button>

          <button
            onClick={() => setActiveViewTab('by_role')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeViewTab === 'by_role'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Por Cadeira / Responsável</span>
          </button>

          <button
            onClick={() => setActiveViewTab('deadline_alerts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeViewTab === 'deadline_alerts'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Alertas de Prazos</span>
            {stats.overdue > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {stats.overdue}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveViewTab('kanban')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeViewTab === 'kanban'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Quadro Kanban</span>
          </button>

        </div>

        {/* Clear Filters Button if any active */}
        {(selectedRoleFilter !== 'all' || selectedCategoryFilter !== 'all' || selectedStatusFilter !== 'all' || selectedDateFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedRoleFilter('all');
              setSelectedCategoryFilter('all');
              setSelectedStatusFilter('all');
              setSelectedDateFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-3.5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ação, notas ou responsável..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="all">Todas as Cadeiras / Responsáveis</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.code || 'CAD'})
              </option>
            ))}
          </select>
        </div>

        {/* Category / Theme Filter */}
        <div>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="all">Todos os Temas / Ritos</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">🟡 Pendente (A Fazer)</option>
            <option value="in_progress">🔵 Em Andamento</option>
            <option value="completed">🟢 Concluído</option>
            <option value="overdue">🔴 Em Atraso Crítico</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="all">Todas as Datas</option>
            <option value="today">Vencendo Hoje</option>
            <option value="overdue">Em Atraso</option>
            <option value="this_week">Próximos 7 Dias</option>
            <option value="this_month">Este Mês</option>
          </select>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: TABELA GERAL 5W2H                                     */}
      {/* ------------------------------------------------------------- */}
      {activeViewTab === 'table' && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">O Quê (Ação / Tarefa 5W2H)</th>
                  <th className="py-3 px-4">Quem (Cadeira / Responsável)</th>
                  <th className="py-3 px-4">Tema / Rito</th>
                  <th className="py-3 px-4">Quando (Prazo)</th>
                  <th className="py-3 px-4">Locação para Anotações (Follow-up)</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredActions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Nenhuma ação encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredActions.map((action) => {
                    const isOverdue = action.status !== 'completed' && action.dueDate < todayStr;
                    const isToday = action.status !== 'completed' && action.dueDate === todayStr;

                    return (
                      <tr 
                        key={action.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors ${
                          action.status === 'completed' ? 'opacity-70 bg-slate-50/30 dark:bg-slate-900/10' : ''
                        }`}
                      >
                        {/* Status Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus: ActionStatus = 
                                action.status === 'pending' ? 'in_progress' :
                                action.status === 'in_progress' ? 'completed' : 'pending';
                              handleUpdateStatus(action.id, nextStatus);
                            }}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer mx-auto ${
                              action.status === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : action.status === 'in_progress'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-slate-400'
                            }`}
                            title={`Status atual: ${action.status}. Clique para avançar.`}
                          >
                            {action.status === 'completed' ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : action.status === 'in_progress' ? (
                              <Clock className="w-3.5 h-3.5" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* Title & Priority */}
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="flex items-start gap-2">
                            {action.priority === 'urgent' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 shrink-0 mt-0.5">
                                URGENTE
                              </span>
                            )}
                            <div>
                              <span className={`font-medium text-xs block ${
                                action.status === 'completed' 
                                  ? 'line-through text-slate-400 dark:text-slate-500' 
                                  : 'text-slate-900 dark:text-white'
                              }`}>
                                {action.title}
                              </span>
                              {action.minuteTitle && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <FileCheck2 className="w-3 h-3 text-slate-400" />
                                  <span>{action.minuteTitle}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role & Assignee */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {action.roleCode || 'CAD'}
                            </span>
                            <span className="text-xs text-slate-800 dark:text-slate-200 truncate">
                              {action.assigneeName || action.roleTitle}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 inline-block">
                            {action.category || 'Geral'}
                          </span>
                        </td>

                        {/* Due Date & Overdue Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-xs font-medium ${
                              isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' :
                              isToday ? 'text-amber-600 dark:text-amber-400 font-bold' :
                              'text-slate-700 dark:text-slate-300'
                            }`}>
                              {formatDateBR(action.dueDate)}
                            </span>

                            {isOverdue && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                Atrasada
                              </span>
                            )}
                            {isToday && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                                Hoje
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Locação para Anotações de Acompanhamento */}
                        <td className="py-3.5 px-4 max-w-md">
                          <div 
                            onClick={() => setActiveActionForNotes(action)}
                            className="group p-2 rounded-lg bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
                            title="Clique para abrir histórico e registrar anotação"
                          >
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {action.notes || 'Sem anotações registradas. Clique para adicionar.'}
                            </p>
                            <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400">
                              <span className="flex items-center gap-1 group-hover:text-atlas-600 dark:group-hover:text-atlas-400 font-medium">
                                <MessageSquare className="w-2.5 h-2.5" />
                                {action.historyNotes && action.historyNotes.length > 0 
                                  ? `${action.historyNotes.length} nota(s)` 
                                  : 'Adicionar nota'}
                              </span>
                              <span>{action.updatedAt ? 'Atualizado' : ''}</span>
                            </div>
                          </div>
                        </td>

                        {/* Delete / Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setActiveActionForNotes(action)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Histórico de Anotações"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAction(action.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Excluir ação"
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

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: POR CADEIRA / RESPONSÁVEL                             */}
      {/* ------------------------------------------------------------- */}
      {activeViewTab === 'by_role' && (
        <div className="space-y-6">
          {roles.map(role => {
            const roleActions = filteredActions.filter(a => a.roleId === role.id);
            const roleCompleted = roleActions.filter(a => a.status === 'completed').length;
            const roleOverdue = roleActions.filter(a => a.status !== 'completed' && a.dueDate < todayStr).length;

            return (
              <div 
                key={role.id}
                className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs transition-colors"
              >
                {/* Role Header */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
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
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {roleOverdue} em atraso
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-mono">
                      {roleCompleted}/{roleActions.length} concluídas ({roleActions.length > 0 ? Math.round((roleCompleted / roleActions.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                {/* Role Actions List */}
                <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {roleActions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      Nenhuma ação pendente para esta cadeira.
                    </p>
                  ) : (
                    roleActions.map(action => (
                      <div key={action.id} className="py-3 flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
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
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold ${
                                action.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                              }`}>
                                {action.title}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {action.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {action.notes}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                            Prazo: {formatDateBR(action.dueDate)}
                          </span>
                          <button
                            onClick={() => setActiveActionForNotes(action)}
                            className="text-xs text-atlas-600 dark:text-atlas-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Anotações</span>
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

      {/* ------------------------------------------------------------- */}
      {/* VIEW 3: ALERTAS DE PRAZOS & VENCIMENTOS                       */}
      {/* ------------------------------------------------------------- */}
      {activeViewTab === 'deadline_alerts' && (
        <div className="space-y-6">
          
          {/* Card Atrasadas */}
          <div className="bg-white dark:bg-[#111827] border-l-4 border-l-rose-500 border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ações em Atraso Crítico ({filteredActions.filter(a => a.status !== 'completed' && a.dueDate < todayStr).length})
                </h3>
              </div>
              <span className="text-[10px] font-semibold uppercase text-rose-600 tracking-wider">Ação Imediata</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredActions.filter(a => a.status !== 'completed' && a.dueDate < todayStr).length === 0 ? (
                <p className="text-xs text-emerald-600 py-2 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Nenhuma ação em atraso neste momento. Governança em dia!
                </p>
              ) : (
                filteredActions
                  .filter(a => a.status !== 'completed' && a.dueDate < todayStr)
                  .map(action => (
                    <div key={action.id} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {action.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="font-semibold text-rose-600 font-mono">Venceu em: {formatDateBR(action.dueDate)}</span>
                          <span>•</span>
                          <span>Responsável: {action.assigneeName}</span>
                          <span>•</span>
                          <span>{action.category}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                          <strong>Última anotação:</strong> {action.notes}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveActionForNotes(action)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
                      >
                        Cobrar & Anotar
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Card Vencendo Hoje */}
          <div className="bg-white dark:bg-[#111827] border-l-4 border-l-amber-500 border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs">
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
                  Nenhuma ação prevista para vencer hoje.
                </p>
              ) : (
                filteredActions
                  .filter(a => a.status !== 'completed' && a.dueDate === todayStr)
                  .map(action => (
                    <div key={action.id} className="py-3 flex items-start justify-between gap-4">
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
                        onClick={() => handleUpdateStatus(action.id, 'completed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
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

      {/* ------------------------------------------------------------- */}
      {/* VIEW 4: QUADRO KANBAN POR STATUS                              */}
      {/* ------------------------------------------------------------- */}
      {activeViewTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Coluna 1: Pendentes */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
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
                    className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {action.roleCode || 'CAD'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDateBR(action.dueDate)}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                      {action.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-900/40 p-1.5 rounded">
                      {action.notes}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {action.assigneeName}
                      </span>
                      <button
                        onClick={() => handleUpdateStatus(action.id, 'in_progress')}
                        className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Iniciar →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Coluna 2: Em Andamento */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Em Andamento
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
                    className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-2 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {action.roleCode || 'CAD'}
                      </span>
                      <span className="text-[10px] text-blue-600 font-mono font-bold">
                        {formatDateBR(action.dueDate)}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                      {action.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-900/40 p-1.5 rounded">
                      {action.notes}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setActiveActionForNotes(action)}
                        className="text-[10px] text-atlas-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>Anotar</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(action.id, 'completed')}
                        className="text-[10px] font-semibold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
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
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
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
                    className="p-3.5 rounded-xl bg-white/70 dark:bg-[#111827]/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 opacity-80"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
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
                        onClick={() => handleUpdateStatus(action.id, 'in_progress')}
                        className="hover:underline cursor-pointer"
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

      {/* ------------------------------------------------------------- */}
      {/* MODAL: LOCAÇÃO PARA ANOTAÇÕES DE ACOMPANHAMENTO (FOLLOW-UP)   */}
      {/* ------------------------------------------------------------- */}
      {activeActionForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300">
                  {activeActionForNotes.roleCode || 'CAD'} • {activeActionForNotes.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {activeActionForNotes.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Responsável: <strong>{activeActionForNotes.assigneeName}</strong> • Prazo: <strong>{formatDateBR(activeActionForNotes.dueDate)}</strong>
                </p>
              </div>

              <button
                onClick={() => setActiveActionForNotes(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Histórico de Anotações */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Histórico de Acompanhamento & Deliberações:
              </span>

              {(!activeActionForNotes.historyNotes || activeActionForNotes.historyNotes.length === 0) ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs text-slate-500">
                  {activeActionForNotes.notes || 'Nenhuma anotação registrada ainda.'}
                </div>
              ) : (
                activeActionForNotes.historyNotes.map(hn => (
                  <div key={hn.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-1">
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

            {/* Input Nova Anotação */}
            <form onSubmit={handleAddNote} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Registrar Nova Anotação de Acompanhamento:
              </label>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={3}
                placeholder="Ex: Alinhado no despacho da tarde: fornecedor enviou nota fiscal corrigida e já foi programado o pagamento no DDA..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveActionForNotes(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNoteContent.trim()}
                  className="px-4 py-1.5 rounded-lg bg-atlas-600 hover:bg-atlas-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingNote ? 'Salvando...' : 'Salvar Anotação'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CRIAR AÇÃO MANUAL                                      */}
      {/* ------------------------------------------------------------- */}
      {isCreateActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cadastrar Nova Ação 5W2H
              </h3>
              <button
                onClick={() => setIsCreateActionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualAction} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  O Quê (Ação a ser executada) *
                </label>
                <input
                  type="text"
                  required
                  value={newActionForm.title}
                  onChange={(e) => setNewActionForm({ ...newActionForm, title: e.target.value })}
                  placeholder="Ex: Auditar 10 contratos críticos no Checklist Fácil"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.code || 'CAD'})
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100"
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newActionForm.priority}
                    onChange={(e) => setNewActionForm({ ...newActionForm, priority: e.target.value as ActionPriority })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 cursor-pointer"
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
                  Locação para Anotações Iniciais
                </label>
                <textarea
                  value={newActionForm.notes}
                  onChange={(e) => setNewActionForm({ ...newActionForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Contexto da deliberação ou observações de entrega..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateActionModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-atlas-600 hover:bg-atlas-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Salvar Ação
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
