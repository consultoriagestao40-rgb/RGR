'use client';

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Printer
} from 'lucide-react';
import { OperationalRole, RoutineBlock } from '@/lib/types';
import { formatBlockFrequency } from '@/lib/frequency';

interface PlaybookTabProps {
  role: OperationalRole | null;
  blocks: RoutineBlock[];
}

export const PlaybookTab: React.FC<PlaybookTabProps> = ({
  role,
  blocks
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBlockIds, setExpandedBlockIds] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedBlockIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all: { [id: string]: boolean } = {};
    blocks.forEach(b => { all[b.id] = true; });
    setExpandedBlockIds(all);
  };

  const collapseAll = () => {
    setExpandedBlockIds({});
  };

  const filteredBlocks = useMemo(() => {
    if (!searchTerm.trim()) return blocks;
    const term = searchTerm.toLowerCase();
    return blocks.filter(b => 
      b.title.toLowerCase().includes(term) ||
      b.deliverable.toLowerCase().includes(term) ||
      b.sopMarkdown.toLowerCase().includes(term) ||
      (b.code && b.code.toLowerCase().includes(term)) ||
      b.timeWindow.toLowerCase().includes(term)
    );
  }, [blocks, searchTerm]);

  const copySopText = (block: RoutineBlock) => {
    navigator.clipboard.writeText(`${block.code || 'POP'} - ${block.title}\nVersão: ${block.version || '1.0'}\nEntregável: ${block.deliverable}\n\n${block.sopMarkdown}`);
    setCopiedId(block.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!role) {
    return <div className="text-center py-20 text-slate-500">Selecione uma cadeira operacional.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Playbook Header Dossier */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {role.code || 'CAD-01'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Repositório Normativo Homologado
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Manual de Procedimentos Operacionais: {role.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Base de conhecimento auditada para onboarding de novos ocupantes e execução padrão.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Expandir Todos
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Recolher
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-atlas-600 hover:bg-atlas-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Manual</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative no-print">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar norma ou POP (ex: 'NFS-e', 'POP-FIN-001', 'Conta Azul', 'DDA', 'centro de custo')..."
          className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-xs transition-colors"
        />
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-2.5" />
      </div>

      {/* POPs Accordion List */}
      <div className="space-y-3">
        {filteredBlocks.map((block, index) => {
          const isExpanded = !!expandedBlockIds[block.id];

          return (
            <div 
              key={block.id}
              className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl overflow-hidden transition-colors shadow-xs"
            >
              {/* Header */}
              <div 
                onClick={() => toggleExpand(block.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                    {block.code || `POP-${index + 1}`}
                  </span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {block.timeWindow}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${formatBlockFrequency(block).badgeColor}`}>
                    {formatBlockFrequency(block).label}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {block.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Entregável:</span> {block.deliverable}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {block.version || 'v1.0'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copySopText(block);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Copiar texto oficial"
                  >
                    {copiedId === block.id ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <div className="p-1 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Body */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0c121e]">
                  
                  {/* Metadata Header Box */}
                  <div className="mb-4 p-3 rounded-lg bg-white dark:bg-[#101726] border border-slate-200/80 dark:border-[#1c273b] text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600 dark:text-slate-300 shadow-xs">
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Homologação:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{block.homologatedBy || 'Diretoria Executiva'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Frequência:</span>
                      <span className="capitalize font-medium text-slate-800 dark:text-slate-200">{block.frequency === 'daily' ? 'Diária' : block.frequency}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Critério de Aceite:</span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">{block.deliverable}</span>
                    </div>
                  </div>

                  {/* SOP Document Content */}
                  <div className="sop-content prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                    <ReactMarkdown>{block.sopMarkdown}</ReactMarkdown>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
