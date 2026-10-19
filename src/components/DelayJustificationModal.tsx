'use client';

import React, { useState } from 'react';
import { X, Clock, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { RoutineBlockWithExecution } from '@/lib/types';
import { DELAY_CATEGORIES } from '@/lib/timeline-utils';

interface DelayJustificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: RoutineBlockWithExecution | null;
  delayMinutes: number;
  deadlineStr: string;
  onConfirm: (category: string, reason: string) => void;
}

export const DelayJustificationModal: React.FC<DelayJustificationModalProps> = ({
  isOpen,
  onClose,
  block,
  delayMinutes,
  deadlineStr,
  onConfirm
}) => {
  const [category, setCategory] = useState(DELAY_CATEGORIES[0].id);
  const [reason, setReason] = useState('');

  if (!isOpen || !block) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Por favor, descreva a justificativa formal para o atraso da rotina.');
      return;
    }
    const categoryLabel = DELAY_CATEGORIES.find(c => c.id === category)?.label || category;
    onConfirm(categoryLabel, reason.trim());
    setReason('');
  };

  const formatDelay = (minutes: number) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m > 0 ? `${m}min` : ''}`;
    }
    return `${minutes} minutos`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 my-8 transition-colors animate-in fade-in">
        
        {/* Header with Alert badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Atraso de {formatDelay(delayMinutes)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Governança & RGR
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Registro de Justificativa de Desvio
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activity Details Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Macroprocesso:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{block.title}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Janela Programada:</span>
            <span className="font-mono text-slate-900 dark:text-slate-200">{block.timeWindow} (Limite: {deadlineStr})</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Critério de Aceite:</span>
            <span className="font-medium text-emerald-700 dark:text-emerald-400 truncate max-w-[280px]">{block.deliverable}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          {/* Reason Category */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
              Classificação do Motivo do Atraso
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors cursor-pointer"
            >
              {DELAY_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Descriptive Justification */}
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
              Justificativa Formal para a Auditoria & Diretoria <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Explique o motivo do atraso e as medidas corretivas adotadas para que não se repita (ex: 'O fornecedor entregou os insumos com 40 min de atraso, o que postergou a conferência')."
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Impacta o Índice de Pontualidade
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Protocolar com Atraso</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
