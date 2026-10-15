'use client';

import React, { useState } from 'react';
import { 
  X, 
  Briefcase, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Building,
  AlertCircle
} from 'lucide-react';
import { DailyRitual, OperationalRole } from '@/lib/types';

interface AddAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  rituals: DailyRitual[];
  currentRole: OperationalRole | null;
  selectedDate: string;
  onSaveAgendaItem: (ritualId: string, newAgendaTitle: string) => Promise<void>;
  onRemoveAgendaItem?: (ritualId: string, indexToRemove: number) => Promise<void>;
  onNavigateToDispatch?: () => void;
}

export const AddAgendaModal: React.FC<AddAgendaModalProps> = ({
  isOpen,
  onClose,
  rituals,
  currentRole,
  selectedDate,
  onSaveAgendaItem,
  onRemoveAgendaItem,
  onNavigateToDispatch
}) => {
  const [selectedRitualId, setSelectedRitualId] = useState<string>(() => {
    return rituals.length > 0 ? rituals[0].id : '';
  });
  const [newTitle, setNewTitle] = useState('');
  const [contextNote, setContextNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Keep selectedRitualId valid when rituals update
  React.useEffect(() => {
    if (rituals.length > 0 && (!selectedRitualId || !rituals.some(r => r.id === selectedRitualId))) {
      setSelectedRitualId(rituals[0].id);
    }
  }, [rituals, selectedRitualId]);

  if (!isOpen) return null;

  const activeRitual = rituals.find(r => r.id === selectedRitualId) || rituals[0];
  const agendaList: string[] = Array.isArray(activeRitual?.agendaItems) 
    ? activeRitual.agendaItems 
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !activeRitual) return;

    try {
      setIsSubmitting(true);
      const fullAgendaText = contextNote.trim() 
        ? `${newTitle.trim()} [Solicitado por: ${currentRole?.title || 'Operação'} - ${contextNote.trim()}]`
        : `${newTitle.trim()} [Solicitado por: ${currentRole?.title || 'Operação'}]`;

      await onSaveAgendaItem(activeRitual.id, fullAgendaText);
      setNewTitle('');
      setContextNote('');
      setSuccessMessage('Pauta adicionada com sucesso à Mesa de Despacho!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao adicionar pauta:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (index: number) => {
    if (!onRemoveAgendaItem || !activeRitual) return;
    if (window.confirm('Deseja realmente remover esta pauta da reunião?')) {
      await onRemoveAgendaItem(activeRitual.id, index);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1a2333] flex items-center justify-between bg-slate-50/70 dark:bg-[#0c121e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Propor Pauta para Reunião com o CEO / Diretoria
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 dark:bg-[#1a2942] text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-[#24395a]">
                  RGR Boardroom
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Submeta assuntos, impedimentos ou aprovações para deliberação na Mesa de Despacho.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-[#1a2333] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form to Add New Agenda Item */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target Ritual Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Rito / Reunião de Destino:
              </label>
              {rituals.length > 0 ? (
                <select
                  value={selectedRitualId}
                  onChange={(e) => setSelectedRitualId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#141d2e] border border-slate-300 dark:border-[#223048] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {rituals.map(rit => (
                    <option key={rit.id} value={rit.id}>
                      {rit.timeSlot} • {rit.title} ({rit.type === 'board_council' ? 'Conselho de Administração' : 'Despacho com Diretoria'})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Nenhum rito de despacho cadastrado para esta cadeira. O administrador pode cadastrar na Matriz de Governança.</span>
                </div>
              )}
            </div>

            {/* Agenda Title Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Título da Pauta / Assunto a ser Deliberado: *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Aprovação de contratação emergencial de equipe de limpeza..."
                className="w-full bg-slate-50 dark:bg-[#141d2e] border border-slate-300 dark:border-[#223048] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Context / Justification */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Contexto / Justificativa Operacional (Opcional):
              </label>
              <textarea
                rows={2}
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                placeholder="Ex: Cliente Unidade Barra solicitou reforço imediato devido a evento extraordinário na sexta-feira..."
                className="w-full bg-slate-50 dark:bg-[#141d2e] border border-slate-300 dark:border-[#223048] rounded-lg p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal leading-relaxed resize-none"
              />
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !newTitle.trim() || rituals.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Incluindo...' : 'Incluir Pauta no Despacho do CEO'}</span>
              </button>
            </div>
          </form>

          {/* Existing Agendas in this Ritual */}
          {activeRitual && (
            <div className="pt-4 border-t border-slate-200 dark:border-[#1a2333]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Pautas Já Cadastradas para este Despacho ({agendaList.length}):
                </span>
                {onNavigateToDispatch && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToDispatch();
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Abrir Mesa de Despacho (Boardroom)</span>
                    <span>→</span>
                  </button>
                )}
              </div>

              {agendaList.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-50/60 dark:bg-[#141d2e]/40 border border-slate-200 dark:border-[#1e2a3f] rounded-lg">
                  Nenhuma pauta cadastrada até o momento.
                </div>
              ) : (
                <div className="space-y-2">
                  {agendaList.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-[#141d2e] border border-slate-200 dark:border-[#1e2b40] rounded-lg flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                          {idx + 1}.0
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {item}
                        </span>
                      </div>
                      {onRemoveAgendaItem && (
                        <button
                          type="button"
                          onClick={() => handleRemove(idx)}
                          title="Remover pauta"
                          className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-slate-200/50 dark:hover:bg-[#1c293d] transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-[#1a2333] bg-slate-50/70 dark:bg-[#0c121e] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Data da Sessão: <strong>{selectedDate}</strong> • Governança RGR
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-300 dark:border-[#223048] bg-white dark:bg-[#141d2e] hover:bg-slate-50 dark:hover:bg-[#1a2638] text-slate-700 dark:text-slate-200 rounded-md text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
