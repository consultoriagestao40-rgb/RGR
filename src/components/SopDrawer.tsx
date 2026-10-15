'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { RoutineBlockWithExecution } from '@/lib/types';

interface SopDrawerProps {
  block: RoutineBlockWithExecution | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (blockId: string, currentStatus: string) => void;
  onOpenObservationModal: (block: RoutineBlockWithExecution) => void;
}

export const SopDrawer: React.FC<SopDrawerProps> = ({
  block,
  isOpen,
  onClose,
  onToggleStatus,
  onOpenObservationModal,
}) => {
  if (!isOpen || !block) return null;

  const isCompleted = block.execution?.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-[#1f293d] shadow-2xl flex flex-col transition-colors">
          
          {/* Header of Drawer */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-[#1f293d] bg-slate-50 dark:bg-[#0c121e] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {block.timeWindow} • Procedimento Operacional Padrão
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {block.title}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Entregável Obrigatório (Callout Banner) */}
          <div className="px-6 py-3 bg-amber-50 dark:bg-[#1a1710] border-b border-amber-200 dark:border-[#2f2715]">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold tracking-wider uppercase text-amber-800 dark:text-amber-400 block">
                  Entregável Binário Obrigatório:
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {block.deliverable}
                </p>
              </div>
            </div>
          </div>

          {/* SOP Markdown Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {block.sopMarkdown ? (
              <div className="sop-content prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
                <ReactMarkdown>{block.sopMarkdown}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum procedimento operacional cadastrado para este bloco.</p>
              </div>
            )}
          </div>

          {/* Execution Bar at Bottom of Drawer */}
          <div className="p-4 border-t border-slate-200 dark:border-[#1f293d] bg-slate-50 dark:bg-[#0c121e] flex items-center justify-between gap-3">
            <button
              onClick={() => onOpenObservationModal(block)}
              className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {block.execution?.observation ? 'Ver/Editar Nota' : 'Registrar Ocorrência / Bloqueio'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                Fechar
              </button>

              <button
                onClick={() => {
                  onToggleStatus(block.id, block.execution?.status || 'pending');
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompleted ? 'Desmarcar' : 'Concluir Entregável'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
