'use client';

import React, { useState, useEffect } from 'react';
import { X, FileCheck2, ShieldCheck, Check } from 'lucide-react';
import { DailyRitual, OperationalRole } from '@/lib/types';

interface MinuteDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: OperationalRole | null;
  rituals: DailyRitual[];
  selectedDate: string;
  onSuccess: () => void;
}

export const MinuteDraftModal: React.FC<MinuteDraftModalProps> = ({
  isOpen,
  onClose,
  role,
  rituals,
  selectedDate,
  onSuccess
}) => {
  const [selectedRitualId, setSelectedRitualId] = useState('');
  const [title, setTitle] = useState('');
  const [deliberations, setDeliberations] = useState('');
  const [signer, setSigner] = useState('Cristiano Silva (Diretoria Executiva / CEO)');
  const [participantsText, setParticipantsText] = useState('Cristiano Silva (CEO)\nAuxiliar Financeiro (Controladoria)\nCoordenador de Operações');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (rituals.length > 0 && !selectedRitualId) {
      setSelectedRitualId(rituals[0].id);
    }
  }, [rituals, selectedRitualId]);

  useEffect(() => {
    if (role) {
      setTitle(`Ata da Sessão Ordinária de Despacho - ${role.title} (${selectedDate})`);
      setDeliberations(`1. Posição de liquidez e borderô do dia validada sem divergências.\n2. Lote de pagamentos homologado expressamente pela Diretoria.\n3. Estabelecidas prioridades de conformidade para o dia seguinte.`);
    }
  }, [role, selectedDate]);

  if (!isOpen || !role) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deliberations) return;
    setIsSubmitting(true);

    const participants = participantsText.split('\n').map(s => s.trim()).filter(Boolean);

    try {
      await fetch('/api/minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ritualId: selectedRitualId || (rituals[0]?.id || 'rit-01'),
          roleId: role.id,
          date: selectedDate,
          title,
          deliberations,
          agendaCheckedCount: 5,
          agendaTotalCount: 5,
          signedBy: signer,
          participants
        })
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error drafting minute:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 my-8 transition-colors animate-in fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Lavratura de Ata Oficial do Despacho
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                RGR - Gerenciamento da Rotina • Governança Corporativa
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
              Título Formal do Documento
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                Data da Sessão
              </label>
              <input
                type="date"
                value={selectedDate}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-slate-400 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                Cadeira Relatora
              </label>
              <input
                type="text"
                value={`${role.title} (${role.code})`}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
              Membros Presentes no Rito (1 por linha)
            </label>
            <textarea
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              rows={3}
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors leading-relaxed"
            />
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
              Deliberações Aprovadas e Diretrizes de Desembolso
            </label>
            <textarea
              value={deliberations}
              onChange={(e) => setDeliberations(e.target.value)}
              rows={5}
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed font-sans transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
              Assinante / Visto da Presidência
            </label>
            <input
              type="text"
              value={signer}
              onChange={(e) => setSigner(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium transition-colors"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Gera hash e indexa ao Livro de Atas
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                {isSubmitting ? 'Assinando...' : 'Assinar & Publicar Ata'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
