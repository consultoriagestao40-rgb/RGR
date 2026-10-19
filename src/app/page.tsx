'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { TimelineTab } from '@/components/TimelineTab';
import { DispatchRoomTab } from '@/components/DispatchRoomTab';
import { PlaybookTab } from '@/components/PlaybookTab';
import { MinutesTab } from '@/components/MinutesTab';
import { AdminTab } from '@/components/AdminTab';
import { UsersManagementSection } from '@/components/UsersManagementSection';
import { SopDrawer } from '@/components/SopDrawer';
import { ObservationModal } from '@/components/ObservationModal';
import { MinuteDraftModal } from '@/components/MinuteDraftModal';
import { CreateRoleModal } from '@/components/CreateRoleModal';
import { DelayJustificationModal } from '@/components/DelayJustificationModal';
import { AddAgendaModal } from '@/components/AddAgendaModal';
import { LoginScreen } from '@/components/LoginScreen';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { OperationalRole, RoutineBlockWithExecution, DailyRitual, ExecutionStatus, SystemUser } from '@/lib/types';
import { INITIAL_ROLES, INITIAL_BLOCKS, INITIAL_RITUALS, INITIAL_USERS } from '@/lib/seed-data';
import { evaluateDelay } from '@/lib/timeline-utils';
import { SYSTEM_START_DATE, isWeekend } from '@/lib/frequency';

export default function HomePage() {
  const [roles, setRoles] = useState<OperationalRole[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-fin-01');
  
  // Users & RBAC Session State
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<SystemUser>(INITIAL_USERS[0]);
  const [adminDefaultSection, setAdminDefaultSection] = useState<'blocks' | 'rituals' | 'roles'>('blocks');

  // Authentication & Session Persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSessionLoaded, setIsSessionLoaded] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0];
    return today < SYSTEM_START_DATE ? SYSTEM_START_DATE : today;
  });

  const [blocks, setBlocks] = useState<RoutineBlockWithExecution[]>(() => {
    return INITIAL_BLOCKS.filter(b => b.roleId === 'role-fin-01').map(b => ({ ...b }));
  });
  const [rituals, setRituals] = useState<DailyRitual[]>(() => {
    return INITIAL_RITUALS.filter(r => r.roleId === 'role-fin-01');
  });

  const [activeTab, setActiveTab] = useState<'timeline' | 'dispatch' | 'playbook' | 'minutes' | 'admin' | 'users'>('timeline');

  // Drawers and Modals
  const [activeSopBlock, setActiveSopBlock] = useState<RoutineBlockWithExecution | null>(null);
  const [isSopDrawerOpen, setIsSopDrawerOpen] = useState(false);
  const [activeObsBlock, setActiveObsBlock] = useState<RoutineBlockWithExecution | null>(null);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isMinuteModalOpen, setIsMinuteModalOpen] = useState(false);

  // Global Create / Edit Role Modal
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<OperationalRole | null>(null);

  // Delay Justification Modal
  const [pendingDelayBlock, setPendingDelayBlock] = useState<RoutineBlockWithExecution | null>(null);
  const [pendingDelayInfo, setPendingDelayInfo] = useState<{ delayMinutes: number; deadlineStr: string } | null>(null);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);

  // Agenda for CEO / Boardroom Modal
  const [isAddAgendaModalOpen, setIsAddAgendaModalOpen] = useState(false);
  const [targetAgendaRitual, setTargetAgendaRitual] = useState<DailyRitual | null>(null);

  // Password change modal (voluntary)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Sidebar collapsed state with localStorage persistence
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rgr_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('rgr_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rgr_session_user');
      if (stored) {
        const parsed = JSON.parse(stored) as SystemUser;
        setCurrentUser(parsed);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error('Error loading session from localStorage:', e);
      setIsAuthenticated(false);
    } finally {
      setIsSessionLoaded(true);
    }
  }, []);

  // Fetch users
  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
        // keep current user updated if edited
        setCurrentUser(prev => data.find(u => u.id === prev.id) || prev);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  // Login handler
  const handleLogin = (user: SystemUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('rgr_session_user', JSON.stringify(user));
    } catch (e) {}

    // Adjust selected role based on user permissions
    if (user.defaultRoleId && roles.some(r => r.id === user.defaultRoleId)) {
      setSelectedRoleId(user.defaultRoleId);
    } else if (!user.allowedRoleIds.includes('*') && user.allowedRoleIds.length > 0) {
      const firstValid = roles.find(r => user.allowedRoleIds.includes(r.id));
      if (firstValid) setSelectedRoleId(firstValid.id);
    }
  };

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('rgr_session_user');
    } catch (e) {}
    setIsAuthenticated(false);
  };

  // Fetch roles
  const loadRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setRoles(data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  }, []);

  // Fetch blocks and rituals for the role
  const loadRoleData = useCallback(async (roleId: string, dateStr: string) => {
    if (!roleId) return;
    try {
      const [blocksRes, ritualsRes] = await Promise.all([
        fetch(`/api/blocks?roleId=${roleId}&date=${dateStr}`),
        fetch(`/api/rituals?roleId=${roleId}`)
      ]);

      const [blocksData, ritualsData] = await Promise.all([
        blocksRes.json(),
        ritualsRes.json()
      ]);

      if (Array.isArray(blocksData)) setBlocks(blocksData);
      if (Array.isArray(ritualsData)) setRituals(ritualsData);
    } catch (err) {
      console.error('Error fetching role data:', err);
    }
  }, []);

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, [loadRoles, loadUsers]);

  useEffect(() => {
    if (selectedRoleId) {
      loadRoleData(selectedRoleId, selectedDate);
    }
  }, [selectedRoleId, selectedDate, loadRoleData]);

  // Handle Switch User / RBAC Simulation
  const handleSelectUser = (user: SystemUser) => {
    setCurrentUser(user);

    // If new user does not have permission for the current chair, switch to an authorized chair
    const hasAccess = user.roleType === 'admin' || 
                      user.allowedRoleIds.includes('*') || 
                      user.allowedRoleIds.includes(selectedRoleId);

    if (!hasAccess) {
      const firstAllowed = user.allowedRoleIds.find(id => id !== '*') || user.defaultRoleId || roles[0]?.id;
      if (firstAllowed) {
        setSelectedRoleId(firstAllowed);
      }
    }

    // If operator and currently on admin tab, redirect to timeline
    if (user.roleType === 'operator' && activeTab === 'admin') {
      setActiveTab('timeline');
    }
  };

  const handleOpenUserManagement = () => {
    setActiveTab('users');
  };

  // Handle Role Created or Updated from Modal
  const handleRoleSaved = (savedRole: OperationalRole) => {
    setRoles(prev => {
      const idx = prev.findIndex(r => r.id === savedRole.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedRole;
        return next;
      }
      return [...prev, savedRole];
    });
    setSelectedRoleId(savedRole.id);
    loadRoleData(savedRole.id, selectedDate);
  };

  const handleRoleDeleted = (deletedId: string) => {
    setRoles(prev => {
      const filtered = prev.filter(r => r.id !== deletedId);
      if (selectedRoleId === deletedId && filtered.length > 0) {
        setSelectedRoleId(filtered[0].id);
        loadRoleData(filtered[0].id, selectedDate);
      }
      return filtered;
    });
  };

  const handleOpenCreateRole = () => {
    setRoleToEdit(null);
    setIsCreateRoleModalOpen(true);
  };

  const handleOpenEditRole = (role?: OperationalRole) => {
    setRoleToEdit(role || selectedRole);
    setIsCreateRoleModalOpen(true);
  };

  // Core status changer
  const executeStatusChange = async (
    block: RoutineBlockWithExecution,
    newStatus: ExecutionStatus,
    delayData?: { isDelayed: boolean; delayMinutes: number; delayCategory?: string | null; delayReason?: string | null }
  ) => {
    const isDelayed = delayData?.isDelayed || false;
    const delayMinutes = delayData?.delayMinutes || 0;
    const delayCategory = delayData?.delayCategory || null;
    const delayReason = delayData?.delayReason || null;
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    setBlocks(prev => prev.map(b => {
      if (b.id === block.id) {
        return {
          ...b,
          execution: {
            id: b.execution?.id || `temp-${Date.now()}`,
            routineBlockId: block.id,
            date: selectedDate,
            status: newStatus,
            isDelayed,
            delayMinutes,
            delayCategory,
            delayReason,
            observation: b.execution?.observation || null,
            completedAt
          }
        };
      }
      return b;
    }));

    if (activeSopBlock && activeSopBlock.id === block.id) {
      setActiveSopBlock(prev => prev ? {
        ...prev,
        execution: {
          id: prev.execution?.id || `temp-${Date.now()}`,
          routineBlockId: block.id,
          date: selectedDate,
          status: newStatus,
          isDelayed,
          delayMinutes,
          delayCategory,
          delayReason,
          observation: prev.execution?.observation || null,
          completedAt
        }
      } : null);
    }

    try {
      await fetch('/api/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routineBlockId: block.id,
          date: selectedDate,
          status: newStatus,
          isDelayed,
          delayMinutes,
          delayCategory,
          delayReason
        })
      });
    } catch (err) {
      console.error('Error updating execution:', err);
      loadRoleData(selectedRoleId, selectedDate);
    }
  };

  // Triggered when user attempts to toggle status
  const handleRequestToggleStatus = (block: RoutineBlockWithExecution) => {
    const currentStatus = block.execution?.status || 'pending';

    // If currently completed, re-open without justification
    if (currentStatus === 'completed') {
      executeStatusChange(block, 'pending', { isDelayed: false, delayMinutes: 0 });
      return;
    }

    // If completing: evaluate delay against deadline
    const delayResult = evaluateDelay(block.timeWindow, selectedDate, new Date());
    if (delayResult.isDelayed) {
      // Overdue -> open justification modal
      setPendingDelayBlock(block);
      setPendingDelayInfo({ delayMinutes: delayResult.delayMinutes, deadlineStr: delayResult.deadlineStr });
      setIsDelayModalOpen(true);
    } else {
      // On-time -> direct completion
      executeStatusChange(block, 'completed', { isDelayed: false, delayMinutes: 0 });
    }
  };

  // Called when user submits delay justification
  const handleConfirmDelay = (category: string, reason: string) => {
    if (!pendingDelayBlock) return;
    executeStatusChange(pendingDelayBlock, 'completed', {
      isDelayed: true,
      delayMinutes: pendingDelayInfo?.delayMinutes || 0,
      delayCategory: category,
      delayReason: reason
    });
    setIsDelayModalOpen(false);
    setPendingDelayBlock(null);
    setPendingDelayInfo(null);
  };

  // Save agenda item for CEO meeting / ritual
  const handleSaveAgendaItem = async (ritualId: string, newAgendaTitle: string) => {
    const target = rituals.find(r => r.id === ritualId);
    if (!target) return;
    const currentAgenda = Array.isArray(target.agendaItems) ? target.agendaItems : [];
    const updatedAgenda = [...currentAgenda, newAgendaTitle];

    try {
      const res = await fetch(`/api/rituals/${ritualId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agendaItems: updatedAgenda })
      });
      if (res.ok) {
        const saved = await res.json();
        setRituals(prev => prev.map(r => r.id === ritualId ? { ...r, agendaItems: saved.agendaItems } : r));
      }
    } catch (err) {
      console.error('Error saving agenda item:', err);
    }
  };

  // Remove agenda item
  const handleRemoveAgendaItem = async (ritualId: string, indexToRemove: number) => {
    const target = rituals.find(r => r.id === ritualId);
    if (!target) return;
    const currentAgenda = Array.isArray(target.agendaItems) ? target.agendaItems : [];
    const updatedAgenda = currentAgenda.filter((_, idx) => idx !== indexToRemove);

    try {
      const res = await fetch(`/api/rituals/${ritualId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agendaItems: updatedAgenda })
      });
      if (res.ok) {
        const saved = await res.json();
        setRituals(prev => prev.map(r => r.id === ritualId ? { ...r, agendaItems: saved.agendaItems } : r));
      }
    } catch (err) {
      console.error('Error removing agenda item:', err);
    }
  };

  // Save observation
  const handleSaveObservation = async (blockId: string, status: ExecutionStatus, observation: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          execution: {
            id: b.execution?.id || `temp-${Date.now()}`,
            routineBlockId: blockId,
            date: selectedDate,
            status,
            observation,
            completedAt: status === 'completed' ? (b.execution?.completedAt || new Date().toISOString()) : null
          }
        };
      }
      return b;
    }));

    try {
      await fetch('/api/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routineBlockId: blockId,
          date: selectedDate,
          status,
          observation
        })
      });
    } catch (err) {
      console.error('Error saving observation:', err);
      loadRoleData(selectedRoleId, selectedDate);
    }
  };

  // Reset to default seed
  const handleResetData = async () => {
    if (!confirm('Deseja restaurar todas as cadeiras, POPs e atas para o padrão de governança de fábrica?')) return;
    try {
      await fetch('/api/reset', { method: 'POST' });
      await loadRoles();
      if (selectedRoleId) {
        await loadRoleData(selectedRoleId, selectedDate);
      }
    } catch (err) {
      console.error('Error resetting data:', err);
    }
  };

  const isCurrentWeekend = isWeekend(selectedDate);
  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];
  const completedCount = isCurrentWeekend ? 0 : blocks.filter(b => b.execution?.status === 'completed').length;
  const totalCount = isCurrentWeekend ? 0 : blocks.length;

  if (!isSessionLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Iniciando Governança RGR...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        roles={roles}
        selectedRoleId={selectedRoleId}
        onSelectRole={setSelectedRoleId}
        onOpenCreateRoleModal={handleOpenCreateRole}
        onOpenEditRoleModal={handleOpenEditRole}
        onSelectAdminSection={(section) => {
          setAdminDefaultSection(section);
        }}
        completedCount={completedCount}
        totalCount={totalCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isWeekend={isCurrentWeekend}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Executive Header */}
        <Header
          currentRole={selectedRole}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          activeTab={activeTab}
          onOpenMinuteModal={() => setIsMinuteModalOpen(true)}
          onResetData={handleResetData}
          onLogout={handleLogout}
        />

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/70 dark:bg-[#0a0f1a] transition-colors">
          {activeTab === 'timeline' && (
            <TimelineTab
              role={selectedRole}
              blocks={blocks}
              rituals={rituals}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenSop={(block) => {
                setActiveSopBlock(block);
                setIsSopDrawerOpen(true);
              }}
              onRequestToggleStatus={handleRequestToggleStatus}
              onOpenObservationModal={(block) => {
                setActiveObsBlock(block);
                setIsObsModalOpen(true);
              }}
              onOpenAddAgendaModal={(targetRitual) => {
                setTargetAgendaRitual(targetRitual || null);
                setIsAddAgendaModalOpen(true);
              }}
              onGoToDispatchRoom={() => setActiveTab('dispatch')}
            />
          )}

          {activeTab === 'dispatch' && (
            <DispatchRoomTab
              roles={roles}
              selectedRoleId={selectedRoleId}
              onSelectRole={setSelectedRoleId}
              rituals={rituals}
              blocks={blocks}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenMinuteModal={() => setIsMinuteModalOpen(true)}
            />
          )}

          {activeTab === 'playbook' && (
            <PlaybookTab
              role={selectedRole}
              blocks={blocks}
            />
          )}

          {activeTab === 'minutes' && (
            <MinutesTab
              currentRole={selectedRole}
              onOpenMinuteModal={() => setIsMinuteModalOpen(true)}
            />
          )}

          {activeTab === 'admin' && (
            <AdminTab
              roles={roles}
              selectedRoleId={selectedRoleId}
              blocks={blocks}
              rituals={rituals}
              onRefreshData={() => {
                loadRoles();
                loadRoleData(selectedRoleId, selectedDate);
              }}
              onSelectRole={setSelectedRoleId}
              defaultSection={adminDefaultSection}
            />
          )}

          {activeTab === 'users' && (
            <div className="max-w-5xl mx-auto space-y-5">
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-lg p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-[#172338] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-[#233552]">
                    GOVERNANÇA & IAM
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Controle de Acessos & Usuários
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Gestão de Usuários & Limitação por Cadeira
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Cadastre novos usuários, altere permissões de acesso, edite dados ou exclua acessos do sistema.
                </p>
              </div>

              <UsersManagementSection
                users={users}
                roles={roles}
                onRefreshUsers={loadUsers}
              />
            </div>
          )}
        </main>

      </div>

      {/* Direct Global Create / Edit Role Modal */}
      <CreateRoleModal
        isOpen={isCreateRoleModalOpen}
        onClose={() => {
          setIsCreateRoleModalOpen(false);
          setRoleToEdit(null);
        }}
        onRoleCreated={handleRoleSaved}
        onRoleDeleted={handleRoleDeleted}
        existingCount={roles.length}
        roleToEdit={roleToEdit}
      />

      {/* Delay Justification Modal */}
      <DelayJustificationModal
        isOpen={isDelayModalOpen}
        onClose={() => {
          setIsDelayModalOpen(false);
          setPendingDelayBlock(null);
          setPendingDelayInfo(null);
        }}
        block={pendingDelayBlock}
        delayMinutes={pendingDelayInfo?.delayMinutes || 0}
        deadlineStr={pendingDelayInfo?.deadlineStr || '18:00'}
        onConfirm={handleConfirmDelay}
      />

      {/* Slide-over SOP Drawer */}
      <SopDrawer
        block={activeSopBlock}
        isOpen={isSopDrawerOpen}
        onClose={() => setIsSopDrawerOpen(false)}
        onToggleStatus={(blockId) => {
          const target = blocks.find(b => b.id === blockId);
          if (target) {
            handleRequestToggleStatus(target);
          }
        }}
        onOpenObservationModal={(block) => {
          setActiveObsBlock(block);
          setIsObsModalOpen(true);
        }}
      />

      {/* Observation / Evidence Modal */}
      <ObservationModal
        block={activeObsBlock}
        isOpen={isObsModalOpen}
        onClose={() => setIsObsModalOpen(false)}
        onSave={handleSaveObservation}
      />

      {/* Formal Meeting Minute Drafting Modal */}
      <MinuteDraftModal
        isOpen={isMinuteModalOpen}
        onClose={() => setIsMinuteModalOpen(false)}
        role={selectedRole}
        rituals={rituals}
        selectedDate={selectedDate}
        onSuccess={() => {
          setActiveTab('minutes');
        }}
      />

      {/* Add Agenda Item for CEO Meeting Modal */}
      <AddAgendaModal
        isOpen={isAddAgendaModalOpen}
        onClose={() => {
          setIsAddAgendaModalOpen(false);
          setTargetAgendaRitual(null);
        }}
        rituals={targetAgendaRitual ? [targetAgendaRitual] : rituals}
        currentRole={selectedRole}
        selectedDate={selectedDate}
        onSaveAgendaItem={handleSaveAgendaItem}
        onRemoveAgendaItem={handleRemoveAgendaItem}
        onNavigateToDispatch={() => setActiveTab('dispatch')}
      />

      {/* Change Password Modal (Mandatory on First Access or Voluntary via Profile) */}
      <ChangePasswordModal
        isOpen={Boolean(currentUser?.mustChangePassword) || isChangePasswordModalOpen}
        isFirstAccess={Boolean(currentUser?.mustChangePassword)}
        currentUser={currentUser}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSuccess={(updatedUser) => {
          setCurrentUser(updatedUser);
          setIsChangePasswordModalOpen(false);
          loadUsers();
        }}
      />

    </div>
  );
}
