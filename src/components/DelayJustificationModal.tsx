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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-amber-300 dark:border-amber-500/30 rounded-xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 my-8 transition-colors">
        
        {/* Header with Alert badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1f293d]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
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
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activity Details Box */}
        <div className="mt-4 p-3.5 rounded-lg bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#1a2333] text-xs space-y-1.5">
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
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-300 dark:border-[#1f293d] rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
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
              placeholder="Explique o motivo do atraso e as medidas corretivas adotadas para que não se repita (ex: 'O fornecedor de químicos entregou as notas fiscais com 40 min de atraso, o que postergou a conciliação no Conta Azul')."
              required
              className="w-full bg-slate-50 dark:bg-[#0c121e] border border-slate-300 dark:border-[#1f293d] rounded-md p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-[#1f293d] flex items-center justify-between">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Impacta o Índice de Pontualidade da Cadeira
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
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
