'use client';

import React, { useState } from 'react';
import { X, Users, Check, Building, Plus } from 'lucide-react';
import { OperationalRole } from '@/lib/types';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated: (newRole: OperationalRole) => void;
  existingCount: number;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onRoleCreated,
  existingCount
}) => {
  const [code, setCode] = useState(`CAD-0${existingCount + 1}`);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Operações');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !department.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          title: title.trim(),
          department: department.trim(),
          description: description.trim()
        })
      });

      if (res.ok) {
        const createdRole = await res.json();
        onRoleCreated(createdRole);
        // Reset form
        setTitle('');
        setDescription('');
        setCode(`CAD-0${existingCount + 2}`);
        onClose();
      } else {
        alert('Erro ao criar cadeira. Verifique os dados e tente novamente.');
      }
    } catch (err) {
      console.error('Error creating role:', err);
      alert('Erro ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 my-8 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1f293d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#172338] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-[#233552]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cadastrar Nova Cadeira Operacional
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                RGR - Gerenciamento da Rotina do Dia a Dia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                placeholder="Ex: CAD-SUP-04"
                required
                className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-300 dark:border-[#1f293d] rounded-md px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                placeholder="Ex: Operações, Comercial, Suprimentos"
                required
                className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-300 dark:border-[#1f293d] rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
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
              placeholder="Ex: Supervisor Operacional de Postos"
              required
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-300 dark:border-[#1f293d] rounded-md px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
              Escopo de Atuação e Responsabilidade (Objetivo da cadeira)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ex: Responsável pela fiscalização in loco dos contratos, auditoria de checklist fotográfico, medições e alinhamento com clientes corporativos."
              required
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-300 dark:border-[#1f293d] rounded-md p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#1f293d] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {isSubmitting ? 'Salvando...' : 'Salvar e Criar Cadeira'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
