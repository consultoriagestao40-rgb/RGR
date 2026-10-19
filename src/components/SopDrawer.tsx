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
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-colors">
          
          {/* Header of Drawer */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {block.timeWindow} • Procedimento Operacional Padrão
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                  {block.title}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Entregável Obrigatório (Callout Banner) */}
          <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block">
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
              <div className="sop-content prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
                <ReactMarkdown>{block.sopMarkdown}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-xs">Nenhum procedimento operacional cadastrado para este bloco.</p>
              </div>
            )}
          </div>

          {/* Execution Bar at Bottom of Drawer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => onOpenObservationModal(block)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              {block.execution?.observation ? 'Ver/Editar Nota' : 'Registrar Ocorrência / Bloqueio'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>

              <button
                onClick={() => {
                  onToggleStatus(block.id, block.execution?.status || 'pending');
                }}
                className={`px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white'
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
