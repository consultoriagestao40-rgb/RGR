'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserCheck, 
  Shield, 
  Lock, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Search,
  Key,
  KeyRound,
  Building
} from 'lucide-react';
import { SystemUser, OperationalRole, UserAccessRole } from '@/lib/types';

interface UsersManagementSectionProps {
  users: SystemUser[];
  roles: OperationalRole[];
  onRefreshUsers: () => void;
}

export const UsersManagementSection: React.FC<UsersManagementSectionProps> = ({
  users,
  roles,
  onRefreshUsers
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [roleType, setRoleType] = useState<UserAccessRole>('operator');
  const [allowedRoleIds, setAllowedRoleIds] = useState<string[]>([]);
  const [defaultRoleId, setDefaultRoleId] = useState<string>('');
  const [hasAllAccess, setHasAllAccess] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (user?: SystemUser) => {
    if (user) {
      setEditingUser(user);
      setName(user.name);
      setEmail(user.email);
      setJobTitle(user.jobTitle);
      setDepartment(user.department);
      setRoleType(user.roleType);
      const allAccess = user.allowedRoleIds.includes('*');
      setHasAllAccess(allAccess);
      setAllowedRoleIds(allAccess ? [] : user.allowedRoleIds);
      setDefaultRoleId(user.defaultRoleId || (roles[0]?.id || ''));
      setMustChangePassword(user.mustChangePassword !== false);
    } else {
      setEditingUser(null);
      setName('');
      setEmail('');
      setJobTitle('');
      setDepartment('');
      setRoleType('operator');
      setHasAllAccess(false);
      setAllowedRoleIds(roles[0] ? [roles[0].id] : []);
      setDefaultRoleId(roles[0]?.id || '');
      setMustChangePassword(true);
    }
    setIsModalOpen(true);
  };

  const handleResetUserPassword = async (user: SystemUser) => {
    if (!confirm(`Deseja resetar a senha do usuário "${user.name}" para a senha inicial "123456"?\nO usuário será obrigado a cadastrar uma nova senha no próximo login.`)) {
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          password: '123456',
          mustChangePassword: true
        })
      });

      if (res.ok) {
        alert(`Senha do usuário ${user.name} resetada com sucesso para 123456. Troca obrigatória ativada.`);
        onRefreshUsers();
      } else {
        alert('Falha ao resetar senha do usuário.');
      }
    } catch (err) {
      console.error('Error resetting user password:', err);
      alert('Erro de conexão ao resetar senha.');
    }
  };

  const handleToggleRoleSelection = (roleId: string) => {
    setAllowedRoleIds(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Por favor, preencha o nome e e-mail do usuário.');
      return;
    }

    const finalAllowedRoles = hasAllAccess || roleType === 'admin' 
      ? ['*'] 
      : allowedRoleIds;

    if (finalAllowedRoles.length === 0) {
      alert('Selecione pelo menos uma cadeira operacional autorizada para este usuário.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Update
        await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUser.id,
            name: name.trim(),
            email: email.trim(),
            jobTitle: jobTitle.trim(),
            department: department.trim(),
            roleType,
            allowedRoleIds: finalAllowedRoles,
            defaultRoleId: defaultRoleId || finalAllowedRoles[0] || '',
            mustChangePassword
          })
        });
      } else {
        // Create
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            jobTitle: jobTitle.trim() || 'Colaborador',
            department: department.trim() || 'Operações',
            roleType,
            allowedRoleIds: finalAllowedRoles,
            defaultRoleId: defaultRoleId || finalAllowedRoles[0] || '',
            mustChangePassword: true,
            password: '123456'
          })
        });
      }
      setIsModalOpen(false);
      onRefreshUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Erro ao salvar usuário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: SystemUser) => {
    if (user.roleType === 'admin' && users.filter(u => u.roleType === 'admin').length <= 1) {
      alert('Não é permitido excluir o único Administrador do sistema.');
      return;
    }
    if (!confirm(`Deseja revogar o acesso e excluir o usuário "${user.name}"?`)) return;

    try {
      await fetch(`/api/users?id=${user.id}`, { method: 'DELETE' });
      onRefreshUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.jobTitle.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  const getRoleBadge = (type: string) => {
    switch (type) {
      case 'admin':
        return {
          label: 'Diretoria / Admin',
          badgeClass: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/80'
        };
      case 'manager':
        return {
          label: 'Gestor / Coord.',
          badgeClass: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700/80'
        };
      case 'operator':
      default:
        return {
          label: 'Operador de Cadeira',
          badgeClass: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80'
        };
    }
  };

  const getChairName = (roleId: string) => {
    if (roleId === '*') return 'Acesso a Todas as Cadeiras';
    const found = roles.find(r => r.id === roleId);
    return found ? `${found.code || 'CAD'}: ${found.title}` : roleId;
  };

  const getInitials = (userName: string) => {
    return userName
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const totalUsers = users.length;
  const operatorsCount = users.filter(u => u.roleType === 'operator').length;
  const managersCount = users.filter(u => u.roleType === 'manager').length;
  const adminsCount = users.filter(u => u.roleType === 'admin').length;

  return (
    <div className="space-y-5">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
            Total Usuários
          </span>
          <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1 block">
            {totalUsers}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Contas corporativas ativas</span>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Operadores Titulares
          </span>
          <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {operatorsCount}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Restritos à própria cadeira</span>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-purple-600 dark:text-purple-400 block">
            Gestores & Coordenação
          </span>
          <span className="text-2xl font-mono font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            {managersCount}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Supervisão departamental</span>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-700 dark:text-slate-300 block">
            Diretoria / Admin
          </span>
          <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1 block">
            {adminsCount}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Acesso irrestrito total</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors"
          />
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-3.5 py-1.5 bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Novo Usuário</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Cargo / Departamento</th>
                <th className="py-3 px-4">Nível de Acesso</th>
                <th className="py-3 px-4">Cadeiras Autorizadas</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.map(user => {
                const badge = getRoleBadge(user.roleType);
                const hasAll = user.allowedRoleIds.includes('*');

                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    
                    {/* User Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${user.avatarColor || 'bg-slate-700 text-white'}`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {user.name}
                            </span>
                            {user.mustChangePassword !== false && (
                              <span 
                                className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                title="Usuário precisa alterar a senha inicial no próximo acesso"
                              >
                                1º Acesso Pendente
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Job & Dept */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block">
                        {user.jobTitle}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {user.department}
                      </span>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.badgeClass}`}>
                        {user.roleType === 'admin' && <ShieldCheck className="w-3 h-3" />}
                        {user.roleType === 'manager' && <UserCheck className="w-3 h-3" />}
                        {user.roleType === 'operator' && <Lock className="w-3 h-3" />}
                        {badge.label}
                      </span>
                    </td>

                    {/* Allowed Chairs */}
                    <td className="py-3 px-4">
                      {hasAll ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          <Shield className="w-3 h-3 text-slate-500" />
                          Acesso Irrestrito (Todas as Cadeiras)
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {user.allowedRoleIds.map(rId => {
                            const r = roles.find(item => item.id === rId);
                            return (
                              <span 
                                key={rId} 
                                className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                                title={r?.title}
                              >
                                {r?.code || 'CAD'}: {r?.title ? (r.title.length > 18 ? r.title.slice(0, 18) + '...' : r.title) : rId}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleResetUserPassword(user)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Redefinir senha para 123456"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Editar permissões e dados"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Excluir usuário"
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
      </div>

      {/* Modal: Create / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 my-8 animate-in fade-in">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingUser ? 'Editar Usuário & Permissões' : 'Cadastrar Novo Usuário'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Defina o papel funcional e a limitação estrita às cadeiras operacionais.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mariana Costa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="mariana@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Auxiliar Financeiro Titular"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Controladoria & Finanças"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors"
                  />
                </div>
              </div>

              {/* Nível de Acesso (RBAC) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Perfil de Acesso (Papel no Sistema)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  
                  {/* Operador */}
                  <label className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    roleType === 'operator'
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="roleType"
                      value="operator"
                      checked={roleType === 'operator'}
                      onChange={() => {
                        setRoleType('operator');
                        setHasAllAccess(false);
                      }}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-1.5 mb-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold">Operador</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Acesso estrito à sua própria cadeira.
                    </p>
                  </label>

                  {/* Gestor */}
                  <label className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    roleType === 'manager'
                      ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 ring-1 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="roleType"
                      value="manager"
                      checked={roleType === 'manager'}
                      onChange={() => {
                        setRoleType('manager');
                        setHasAllAccess(false);
                      }}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-1.5 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-bold">Gestor / Coord.</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Supervisiona e despacha com cadeiras da área.
                    </p>
                  </label>

                  {/* Admin */}
                  <label className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    roleType === 'admin'
                      ? 'border-slate-900 dark:border-blue-500 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white ring-1 ring-slate-900/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="roleType"
                      value="admin"
                      checked={roleType === 'admin'}
                      onChange={() => {
                        setRoleType('admin');
                        setHasAllAccess(true);
                      }}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-700 dark:text-blue-400" />
                      <span className="text-xs font-bold">Diretoria / Admin</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Acesso total, governança e criação de cadeiras.
                    </p>
                  </label>

                </div>
              </div>

              {/* Limitação de Cadeiras Permitidas */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    Cadeiras Operacionais Permitidas
                  </span>
                  
                  {roleType === 'admin' && (
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAllAccess}
                        onChange={(e) => setHasAllAccess(e.target.checked)}
                        className="rounded text-slate-900 focus:ring-0"
                      />
                      <span>Acesso Total (*)</span>
                    </label>
                  )}
                </div>

                {!hasAllAccess ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto p-1.5 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                    {roles.map(r => {
                      const isSelected = allowedRoleIds.includes(r.id);
                      return (
                        <div
                          key={r.id}
                          onClick={() => handleToggleRoleSelection(r.id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium border border-slate-300 dark:border-slate-700 shadow-xs' 
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {r.code || 'CAD'}
                            </span>
                            <div className="min-w-0">
                              <span className="truncate block font-semibold">{r.title}</span>
                              <span className="text-[10px] text-slate-400 truncate block">{r.department}</span>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-atlas-600 border-atlas-600 text-white' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                    Este usuário possui perfil de <strong>Diretoria / Administrador</strong> e tem acesso irrestrito para alternar e auditar todas as cadeiras do sistema.
                  </div>
                )}
              </div>

              {/* Opções de Segurança e Acesso */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        Exigir troca de senha no próximo acesso
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        Obriga o usuário a cadastrar uma nova senha confidencial ao fazer login.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={mustChangePassword}
                    onChange={(e) => setMustChangePassword(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Salvando...' : editingUser ? 'Atualizar Permissões' : 'Criar Usuário'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
