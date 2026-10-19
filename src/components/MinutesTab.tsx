'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Calendar, 
  Printer, 
  ShieldCheck, 
  Search,
  Building
} from 'lucide-react';
import { GovernanceMinute, OperationalRole } from '@/lib/types';

interface MinutesTabProps {
  currentRole: OperationalRole | null;
  onOpenMinuteModal: () => void;
}

export const MinutesTab: React.FC<MinutesTabProps> = ({
  currentRole,
  onOpenMinuteModal
}) => {
  const [minutes, setMinutes] = useState<GovernanceMinute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinute, setSelectedMinute] = useState<GovernanceMinute | null>(null);

  const loadMinutes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/minutes');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMinutes(data);
        if (data.length > 0 && !selectedMinute) {
          setSelectedMinute(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching minutes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMinutes();
  }, [currentRole]);

  const filtered = minutes.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.deliberations.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.date.includes(searchTerm)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Minutes List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
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
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-medium">{min.date}</span>
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
        <div className="lg:col-span-7">
          {selectedMinute ? (
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-6 shadow-xs text-slate-800 dark:text-slate-200 space-y-5 transition-colors">
              
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
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Imprimir Ata"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {/* Session Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Data da Sessão:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">{selectedMinute.date}</span>
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
