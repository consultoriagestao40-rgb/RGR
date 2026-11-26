'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Check, Building, Plus, Pencil, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { OperationalRole } from '@/lib/types';
import { useEscKey } from '@/lib/use-esc-key';

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
  useEscKey(isOpen, onClose);

  const isEditing = Boolean(roleToEdit);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Operações');
  const [description, setDescription] = useState('');
  const [googleCalendarEmail, setGoogleCalendarEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const handleGenerateAiDescription = async () => {
    if (!title.trim()) {
      alert('Informe primeiro o Título do Cargo / Cadeira para que a IA possa elaborar o escopo de atuação.');
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const res = await fetch('/api/ai/role-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          department: department.trim(),
          code: code.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) {
          setDescription(data.description);
        }
      }
    } catch (err) {
      console.error('Error generating description with AI:', err);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  useEffect(() => {
    if (roleToEdit) {
      setCode(roleToEdit.code || '');
      setTitle(roleToEdit.title || '');
      setDepartment(roleToEdit.department || 'Operações');
      setDescription(roleToEdit.description || '');
      setGoogleCalendarEmail(roleToEdit.googleCalendarEmail || '');
    } else {
      setCode(`CAD-0${existingCount + 1}`);
      setTitle('');
      setDepartment('Operações');
      setDescription('');
      setGoogleCalendarEmail('');
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
          description: description.trim(),
          googleCalendarEmail: googleCalendarEmail.trim() || undefined
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Google Agenda do Operador / Colaborador (Convite Automático)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Opcional</span>
            </div>
            <input
              type="email"
              value={googleCalendarEmail}
              onChange={(e) => setGoogleCalendarEmail(e.target.value)}
              placeholder="exemplo: colaborador.ponta@gmail.com"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors placeholder:font-sans"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Ao sincronizar o calendário no RGR, todas as rotinas e ritos desta cadeira serão enviados automaticamente para o app Google Agenda no smartphone deste colaborador.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">
                Escopo de Atuação e Responsabilidade
              </label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={isGeneratingDesc}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[11px] font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                title="Gerar escopo e missão executiva com IA"
              >
                {isGeneratingDesc ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
                    <span>Gerando descrição...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>Gerar com IA</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Descreva o objetivo da cadeira e a missão do profissional (ou clique em 'Gerar com IA')..."
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
