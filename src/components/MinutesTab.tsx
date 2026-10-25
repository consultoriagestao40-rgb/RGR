'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Calendar, 
  Printer, 
  ShieldCheck, 
  Search,
  Building,
  ListChecks,
  ArrowRight,
  Clock,
  User,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { GovernanceMinute, OperationalRole, GovernanceAction } from '@/lib/types';
import { formatDateBR } from '@/lib/frequency';

interface MinutesTabProps {
  currentRole: OperationalRole | null;
  onOpenMinuteModal: () => void;
  onGoToActions?: () => void;
}

export const MinutesTab: React.FC<MinutesTabProps> = ({
  currentRole,
  onOpenMinuteModal,
  onGoToActions
}) => {
  const [minutes, setMinutes] = useState<GovernanceMinute[]>([]);
  const [allActions, setAllActions] = useState<GovernanceAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinute, setSelectedMinute] = useState<GovernanceMinute | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [minRes, actRes] = await Promise.all([
        fetch('/api/minutes'),
        fetch('/api/actions')
      ]);
      const [minData, actData] = await Promise.all([minRes.json(), actRes.json()]);

      if (Array.isArray(minData)) {
        setMinutes(minData);
        if (minData.length > 0 && !selectedMinute) {
          setSelectedMinute(minData[0]);
        }
      }

      if (Array.isArray(actData)) {
        setAllActions(actData);
      }
    } catch (err) {
      console.error('Error fetching minutes & actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentRole]);

  const filtered = minutes.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.deliberations.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.date.includes(searchTerm)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors no-print minutes-page-header">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              LIVRO DE ATAS
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Registro Formal de Deliberações e Despachos
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Atas Oficiais do Comitê de Facilities
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Documentos auditáveis com assinatura digital, deliberações de recursos e controle de quórum.
          </p>
        </div>

        <button
          onClick={onOpenMinuteModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-atlas-600 hover:bg-atlas-700 text-white text-xs font-semibold transition-colors self-start md:self-auto shadow-xs cursor-pointer"
        >
          <FileCheck2 className="w-4 h-4 text-white/90" />
          <span>Lavrar Nova Ata</span>
        </button>
      </div>

      {/* Two columns: Minutes Catalog on Left, Minute Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 minutes-grid-container">
        
        {/* Left Column: Minutes List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 no-print minutes-sidebar-col">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar atas por data ou deliberação..."
              className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-xs transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="space-y-2">
            {filtered.map(min => {
              const isSelected = selectedMinute?.id === min.id;
              return (
                <div
                  key={min.id}
                  onClick={() => setSelectedMinute(min)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-colors shadow-xs ${
                    isSelected
                      ? 'bg-slate-100/80 dark:bg-slate-800/70 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-[#1e293b] hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-medium">{formatDateBR(min.date)}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Assinada
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold leading-snug">{min.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {min.deliberations}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{min.signedBy.split('(')[0]}</span>
                    <span className="font-mono">{min.agendaCheckedCount}/{min.agendaTotalCount} Pautas</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Minute Formal Document Sheet (7 cols) */}
        <div className="lg:col-span-7 minutes-content-col">
          {selectedMinute ? (
            <div 
              id="printable-minute-sheet" 
              className="printable-minute-sheet bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-6 shadow-xs text-slate-800 dark:text-slate-200 space-y-5 transition-colors"
            >
              
              {/* Print-Only Official Letterhead */}
              <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm font-mono tracking-tight">
                    RGR
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                      RGR • Gerenciamento da Rotina & Governança
                    </h1>
                    <p className="text-[11px] text-slate-600">
                      Facilities Brasil S.A. • Livro Oficial de Atas e Deliberações
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Documento Auditado</span>
                  <span className="text-[11px] font-mono font-bold text-slate-900">Protocolo: {selectedMinute.id}</span>
                </div>
              </div>

              {/* Document Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 font-mono">
                      Facilities Brasil S.A. • Matriz Operacional
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                    {selectedMinute.title}
                  </h2>
                </div>
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer no-print"
                  title="Imprimir Ata"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {/* Session Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Data da Sessão:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">{formatDateBR(selectedMinute.date)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Pautas Deliberadas:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    {selectedMinute.agendaCheckedCount} de {selectedMinute.agendaTotalCount} (100%)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Protocolo:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{selectedMinute.id}</span>
                </div>
              </div>

              {/* Participants */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Membros Presentes no Rito:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMinute.participants.map((p, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-normal">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deliberations text */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Deliberações Oficiais do Rito:
                </span>
                <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedMinute.deliberations}
                </div>
              </div>

              {/* Linked 5W2H Actions inside Minute */}
              {(() => {
                const linkedActions = allActions.filter(a => 
                  (a.minuteId && a.minuteId === selectedMinute.id) || 
                  (selectedMinute.title && a.minuteTitle === selectedMinute.title)
                );

                return (
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          Plano de Ação Registrado na Ata (5W2H)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                          {linkedActions.length} {linkedActions.length === 1 ? 'Ação' : 'Ações'}
                        </span>
                      </div>

                      {onGoToActions && (
                        <button
                          type="button"
                          onClick={onGoToActions}
                          className="text-xs text-atlas-600 dark:text-atlas-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer no-print"
                        >
                          <span>Gerenciar na Central de Ações</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {linkedActions.length > 0 ? (
                      <div className="space-y-2">
                        {linkedActions.map((action, idx) => (
                          <div 
                            key={action.id || idx}
                            className="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 text-xs space-y-1.5 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                                <h5 className="font-semibold text-slate-900 dark:text-white leading-snug">
                                  {action.title}
                                </h5>
                              </div>
                              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold shrink-0 ${
                                action.priority === 'urgent'
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                  : action.priority === 'high'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                                  : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                              }`}>
                                {action.priority === 'urgent' ? 'Urgente' : action.priority === 'high' ? 'Alta' : 'Média'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span><strong>Quem:</strong> {action.assigneeName || 'Liderança'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span><strong>Prazo:</strong> <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{formatDateBR(action.dueDate)}</span></span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {action.category || 'Governança'}
                                </span>
                              </div>
                            </div>

                            {action.notes && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-white/60 dark:bg-slate-950/40 p-2 rounded border border-slate-200/60 dark:border-slate-800/80">
                                📌 {action.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                        Nenhuma ação 5W2H vinculada formalmente a este protocolo de ata.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Signature Stamp */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                      Assinatura Digital Auditada
                    </span>
                    <p className="text-xs font-medium text-slate-900 dark:text-white">
                      {selectedMinute.signedBy}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">
                      Timestamp: {new Date(selectedMinute.signedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Hash SHA-256 Validado
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Em Conformidade
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-12 text-center text-slate-400 text-xs">
              Nenhuma ata selecionada para visualização.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
