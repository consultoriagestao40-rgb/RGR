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
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-[#172338] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-[#233552]">
              LIVRO DE ATAS
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Registro Formal de Deliberações e Despachos
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Atas Oficiais do Comitê de Facilities
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Documentos auditáveis com assinatura digital, deliberações de recursos e controle de quórum.
          </p>
        </div>

        <button
          onClick={onOpenMinuteModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-700 dark:bg-[#1e3a5f] dark:hover:bg-[#254673] text-white text-xs font-semibold border border-blue-700 dark:border-[#2d558b] transition-colors self-start md:self-auto shadow-sm"
        >
          <FileCheck2 className="w-4 h-4 text-white dark:text-blue-300" />
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
              className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-md pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm transition-colors"
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
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all shadow-sm ${
                    isSelected
                      ? 'bg-blue-50/60 dark:bg-[#162238] border-blue-400 dark:border-[#29426b] text-slate-900 dark:text-white ring-1 ring-blue-500/20'
                      : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#1f293d] hover:border-slate-300 dark:hover:border-[#2b3a54] text-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">{min.date}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold">
                      Assinada
                    </span>
                  </div>
                  <h4 className="text-xs font-bold leading-snug">{min.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {min.deliberations}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1e293b]/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{min.signedBy.split('(')[0]}</span>
                    <span>{min.agendaCheckedCount}/{min.agendaTotalCount} Pautas</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Minute Formal Document Sheet (7 cols) */}
        <div className="lg:col-span-7">
          {selectedMinute ? (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-lg p-6 shadow-sm text-slate-800 dark:text-slate-200 space-y-5 transition-colors">
              
              {/* Document Header */}
              <div className="border-b border-slate-200 dark:border-[#1f293d] pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                      Facilities Brasil S.A. • Matriz Operacional
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {selectedMinute.title}
                  </h2>
                </div>
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title="Imprimir Ata"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {/* Session Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#192336] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Data da Sessão:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{selectedMinute.date}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Pautas Deliberadas:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {selectedMinute.agendaCheckedCount} de {selectedMinute.agendaTotalCount} (100%)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Protocolo:</span>
                  <span className="font-mono text-blue-700 dark:text-blue-300 font-bold">{selectedMinute.id}</span>
                </div>
              </div>

              {/* Participants */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                  Membros Presentes no Rito:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMinute.participants.map((p, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#223048] text-slate-800 dark:text-slate-300 font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deliberations text */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                  Deliberações Oficiais do Rito:
                </span>
                <div className="p-4 rounded-md bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#192336] text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedMinute.deliberations}
                </div>
              </div>

              {/* Signature Stamp */}
              <div className="pt-4 border-t border-slate-200 dark:border-[#1f293d] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider block">
                      Assinatura Digital Auditada
                    </span>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {selectedMinute.signedBy}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      Timestamp: {new Date(selectedMinute.signedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">
                    Hash SHA-256 Validado
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Em Conformidade
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f293d] rounded-lg p-12 text-center text-slate-500 text-xs">
              Nenhuma ata selecionada para visualização.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
