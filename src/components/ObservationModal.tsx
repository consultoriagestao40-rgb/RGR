'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Ban, MessageSquare } from 'lucide-react';
import { RoutineBlockWithExecution, ExecutionStatus } from '@/lib/types';

interface ObservationModalProps {
  block: RoutineBlockWithExecution | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string, status: ExecutionStatus, observation: string) => void;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({
  block,
  isOpen,
  onClose,
  onSave
}) => {
  const [status, setStatus] = useState<ExecutionStatus>('pending');
  const [observation, setObservation] = useState('');

  useEffect(() => {
    if (block) {
      setStatus(block.execution?.status || 'pending');
      setObservation(block.execution?.observation || '');
    }
  }, [block]);

  if (!isOpen || !block) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(block.id, status, observation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-left transition-colors animate-in fade-in">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Auditoria & Evidência de Execução
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {block.timeWindow} • {block.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            
            {/* Status Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Status do Entregável
              </label>
              <div className="grid grid-cols-3 gap-2">
                
                <button
                  type="button"
                  onClick={() => setStatus('completed')}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    status === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                  Concluído
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    status === 'pending'
                      ? 'bg-slate-50 dark:bg-slate-800 border-slate-900 dark:border-blue-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-900/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 mb-1 text-amber-500 dark:text-amber-400" />
                  Pendente
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('blocked')}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    status === 'blocked'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300 shadow-xs ring-1 ring-rose-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Ban className="w-4 h-4 mb-1 text-rose-600 dark:text-rose-400" />
                  Bloqueado
                </button>

              </div>
            </div>

            {/* Observation / Link text area */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Justificativa, Ocorrência ou Link da Evidência
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={4}
                placeholder="Ex: 'Lote aprovado com R$ 42.500 no banco. Link comprovante: https://...' ou 'Bloqueado aguardando nota fiscal do fornecedor X'."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Salvar Registro
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
