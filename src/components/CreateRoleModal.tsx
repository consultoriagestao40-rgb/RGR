'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Check, Building, Plus, Pencil, Trash2 } from 'lucide-react';
import { OperationalRole } from '@/lib/types';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated: (role: OperationalRole) => void;
  onRoleDeleted?: (roleId: string) => void;
  existingCount: number;
  roleToEdit?: OperationalRole | null;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onRoleCreated,
  onRoleDeleted,
  existingCount,
  roleToEdit
}) => {
  const isEditing = Boolean(roleToEdit);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Operações');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (roleToEdit) {
      setCode(roleToEdit.code || '');
      setTitle(roleToEdit.title || '');
      setDepartment(roleToEdit.department || 'Operações');
      setDescription(roleToEdit.description || '');
    } else {
      setCode(`CAD-0${existingCount + 1}`);
      setTitle('');
      setDepartment('Operações');
      setDescription('');
    }
  }, [roleToEdit, existingCount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !department.trim()) return;

    setIsSubmitting(true);
    try {
      const endpoint = isEditing ? `/api/roles/${roleToEdit?.id}` : '/api/roles';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          title: title.trim(),
          department: department.trim(),
          description: description.trim()
        })
      });

      if (res.ok) {
        const savedRole = await res.json();
        onRoleCreated(savedRole);
        onClose();
      } else {
        alert(`Erro ao ${isEditing ? 'atualizar' : 'criar'} cadeira. Verifique os dados e tente novamente.`);
      }
    } catch (err) {
      console.error(`Error saving role:`, err);
      alert('Erro ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!roleToEdit) return;
    const confirmDelete = window.confirm(
      `⚠️ Tem certeza que deseja excluir a cadeira "${roleToEdit.title}" (${roleToEdit.code})?\n\nEsta ação excluirá também todos os POPs e ritos vinculados a esta cadeira.`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/roles/${roleToEdit.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (onRoleDeleted) {
          onRoleDeleted(roleToEdit.id);
        }
        onClose();
      } else {
        alert('Erro ao excluir cadeira operacional.');
      }
    } catch (err) {
      console.error('Error deleting role:', err);
      alert('Erro de conexão ao excluir cadeira.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 my-8 transition-colors animate-in fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isEditing 
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}>
              {isEditing ? <Pencil className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Editar Cadeira Operacional' : 'Cadastrar Nova Cadeira Operacional'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing 
                  ? `Atualizando ${roleToEdit?.code || 'Cadeira'} • Governança Corporativa` 
                  : 'RGR - Gerenciamento da Rotina do Dia a Dia'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Código da Cadeira
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: CAD-FIN-01"
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                Departamento
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ex: Controladoria & Finanças, Operações"
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
              Título do Cargo / Cadeira
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Auxiliar Financeiro, Coordenador de Operações"
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
              Escopo de Atuação e Responsabilidade (Objetivo da cadeira)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Ex: Cadeira de controle e tesouraria diária responsável pelo fluxo de caixa, borderô de pagamentos a fornecedores de Facilities e prestação de contas matinal."
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                title="Excluir cadeira e dados vinculados"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Excluindo...' : 'Excluir Cadeira'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="px-4 py-2 rounded-lg bg-atlas-600 hover:bg-atlas-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting 
                    ? 'Salvando...' 
                    : isEditing 
                      ? 'Salvar Alterações' 
                      : 'Salvar e Criar Cadeira'}
                </span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
