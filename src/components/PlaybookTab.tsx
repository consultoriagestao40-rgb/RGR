'use client';

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Printer,
  Video,
  Play,
  Image as ImageIcon,
  GraduationCap,
  Calendar,
  UserCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';
import { OperationalRole, RoutineBlock, PopTrainingRecord, SystemUser } from '@/lib/types';
import { formatBlockFrequency } from '@/lib/frequency';

interface PlaybookTabProps {
  role: OperationalRole | null;
  blocks: RoutineBlock[];
  currentUser?: SystemUser | null;
  onRefreshBlocks?: () => void;
}

export const PlaybookTab: React.FC<PlaybookTabProps> = ({
  role,
  blocks,
  currentUser,
  onRefreshBlocks
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBlockIds, setExpandedBlockIds] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estado de confirmação de treinamento
  const [trainingOperatorName, setTrainingOperatorName] = useState('');
  const [isSubmittingTraining, setIsSubmittingTraining] = useState<string | null>(null);
  const [trainingSuccessId, setTrainingSuccessId] = useState<string | null>(null);

  // Modal para anexar mídia/vídeo ao POP
  const [editingMediaBlock, setEditingMediaBlock] = useState<RoutineBlock | null>(null);
  const [mediaVideoUrl, setMediaVideoUrl] = useState('');
  const [mediaVideoTitle, setMediaVideoTitle] = useState('');
  const [mediaImageUrl, setMediaImageUrl] = useState('');
  const [mediaImageCaption, setMediaImageCaption] = useState('');
  const [mediaImagesList, setMediaImagesList] = useState<{ id: string; url: string; caption?: string }[]>([]);

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
      (b.code && b.code.toLowerCase().includes(term)) ||
      b.deliverable.toLowerCase().includes(term) ||
      b.sopMarkdown.toLowerCase().includes(term)
    );
  }, [blocks, searchTerm]);

  const copySopText = (block: RoutineBlock) => {
    navigator.clipboard.writeText(`${block.code || 'POP'} - ${block.title}\nVersão: ${block.version || '1.0'}\nEntregável: ${block.deliverable}\n\n${block.sopMarkdown}`);
    setCopiedId(block.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getPlaybookExportTitle = () => {
    if (!role) return 'Playbook & POPs';
    const cleanCode = role.code ? ` (${role.code})` : '';
    return `${role.title}${cleanCode} - Playbook & POPs`;
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = getPlaybookExportTitle();
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  // Helper para formatar vídeo do YouTube (conversão para embed)
  const getEmbedYoutubeUrl = (url: string) => {
    if (!url) return null;
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtube.com/embed/')) {
        return url;
      } else if (url.includes('loom.com/share/')) {
        const videoId = url.split('loom.com/share/')[1]?.split('?')[0];
        return `https://www.loom.com/embed/${videoId}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  // Confirmação de Treinamento Falconi
  const handleConfirmTraining = async (block: RoutineBlock) => {
    const name = trainingOperatorName.trim() || currentUser?.name || 'Operador Responsável';
    setIsSubmittingTraining(block.id);
    try {
      const res = await fetch(`/api/blocks/${block.id}/training`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: name,
          userRoleTitle: role?.title || 'Operação',
          userId: currentUser?.id,
          recyclingPeriodDays: block.recyclingPeriodDays || 180
        })
      });

      if (res.ok) {
        setTrainingSuccessId(block.id);
        setTimeout(() => setTrainingSuccessId(null), 4000);
        if (onRefreshBlocks) onRefreshBlocks();
      }
    } catch (err) {
      console.error('Erro ao registrar treinamento:', err);
    } finally {
      setIsSubmittingTraining(null);
    }
  };

  // Abre Modal de Edição de Mídia do POP
  const handleOpenMediaModal = (block: RoutineBlock) => {
    setEditingMediaBlock(block);
    setMediaVideoUrl(block.videoUrl || '');
    setMediaVideoTitle(block.videoTitle || '');
    setMediaImagesList(block.images || []);
    setMediaImageUrl('');
    setMediaImageCaption('');
  };

  // Salva Vídeo e Imagens no POP
  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMediaBlock) return;

    try {
      const res = await fetch(`/api/blocks/${editingMediaBlock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: mediaVideoUrl.trim() || null,
          videoTitle: mediaVideoTitle.trim() || null,
          images: mediaImagesList
        })
      });

      if (res.ok) {
        setEditingMediaBlock(null);
        if (onRefreshBlocks) onRefreshBlocks();
      }
    } catch (err) {
      console.error('Erro ao salvar multimídia:', err);
    }
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
              Método Falconi • Repositório Normativo & Treinamentos
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Manual de Procedimentos Operacionais: {role.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Procedimentos com gravação em vídeo, prints de tela e registro de capacitação/reciclagem formal.
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
          const hasVideo = !!block.videoUrl;
          const hasImages = block.images && block.images.length > 0;
          const latestTraining = block.trainingRecords && block.trainingRecords.length > 0
            ? block.trainingRecords[block.trainingRecords.length - 1]
            : null;

          const isTrainingValid = latestTraining && new Date(latestTraining.validUntil) > new Date();

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
                  
                  {/* Badge de Vídeo se houver */}
                  {hasVideo && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 inline-flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      Vídeo-Aula
                    </span>
                  )}

                  {/* Badge de Treinamento Falconi */}
                  {isTrainingValid ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                      <UserCheck className="w-2.5 h-2.5" />
                      Treinado: {latestTraining.userName}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                      <GraduationCap className="w-2.5 h-2.5" />
                      Treinamento Pendente
                    </span>
                  )}

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

                  {/* Botão para Anexar Vídeo / Imagem */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenMediaModal(block);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Anexar Vídeo do YouTube ou Imagens ao POP"
                  >
                    <Video className="w-4 h-4" />
                  </button>

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
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0c121e] space-y-4">
                  
                  {/* Metadata Header Box */}
                  <div className="p-3 rounded-lg bg-white dark:bg-[#101726] border border-slate-200/80 dark:border-[#1c273b] text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600 dark:text-slate-300 shadow-xs">
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

                  {/* 1. SEÇÃO DE VÍDEO EMBED (YOUTUBE / LOOM) */}
                  {block.videoUrl && (
                    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                          <Play className="w-4 h-4 text-red-500 fill-red-500" />
                          <span>Vídeo-Treinamento Prático: {block.videoTitle || 'Demonstração em Vídeo'}</span>
                        </div>
                        <a
                          href={block.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <span>Abrir no YouTube</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-black">
                        <iframe
                          src={getEmbedYoutubeUrl(block.videoUrl) || ''}
                          title={block.videoTitle || block.title}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. SEÇÃO DE IMAGENS & PRINTS OPERACIONAIS */}
                  {block.images && block.images.length > 0 && (
                    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                        <span>Telas, Prints & Evidências de Referência</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {block.images.map(img => (
                          <div key={img.id} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                            <img src={img.url} alt={img.caption || 'Print do POP'} className="w-full h-40 object-cover hover:scale-105 transition-transform" />
                            {img.caption && (
                              <p className="p-2 text-[10px] text-slate-500 dark:text-slate-400 text-center border-t border-slate-200 dark:border-slate-800">
                                {img.caption}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. TEXTO NORMATIVO DO POP (MARKDOWN) */}
                  <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
                    <div className="sop-content prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                      <ReactMarkdown>{block.sopMarkdown}</ReactMarkdown>
                    </div>
                  </div>

                  {/* 4. BLOCO FALCONI: CAPACITAÇÃO & RECICLAGEM FORMAL */}
                  <div className="bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-[#1c273b] rounded-xl p-4 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Registro de Capacitação & Reciclagem (Método Falconi)
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Ciclo de Reciclagem: a cada {block.recyclingPeriodDays || 180} dias
                      </span>
                    </div>

                    {/* Status Atual do Treinamento */}
                    {latestTraining ? (
                      <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Colaborador Capacitado: {latestTraining.userName}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Treinamento realizado em: <strong>{new Date(latestTraining.completedAt).toLocaleDateString('pt-BR')}</strong> • 
                            Válido até: <strong>{new Date(latestTraining.validUntil).toLocaleDateString('pt-BR')}</strong>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleConfirmTraining(block)}
                          disabled={isSubmittingTraining === block.id}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-[11px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs self-start sm:self-auto shrink-0"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-600" />
                          <span>Fazer Reciclagem Agora</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-xs space-y-2">
                        <p className="text-amber-800 dark:text-amber-300">
                          ⚠️ <strong>Treinamento Formal Não Registrado:</strong> Para conformidade de auditoria Falconi, o responsável pela execução deste POP deve declarar sua capacitação.
                        </p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Nome completo do assistente / operador..."
                            value={trainingOperatorName}
                            onChange={(e) => setTrainingOperatorName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleConfirmTraining(block)}
                            disabled={isSubmittingTraining === block.id}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 shrink-0"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmar Treinamento Concluído</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {trainingSuccessId === block.id && (
                      <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-medium animate-in fade-in flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Capacitação Falconi registrada e homologada com sucesso! Válida por 180 dias.</span>
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Modal: Anexar Vídeo & Prints ao POP */}
      {editingMediaBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Anexar Treinamento Multimídia
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMediaBlock(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMedia} className="space-y-4 text-xs">
              <div>
                <span className="font-mono text-slate-500 block mb-1">
                  POP: {editingMediaBlock.code} • {editingMediaBlock.title}
                </span>
              </div>

              {/* URL do Vídeo */}
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold block">
                  Link do Vídeo no YouTube ou Loom
                </label>
                <input
                  type="url"
                  value={mediaVideoUrl}
                  onChange={(e) => setMediaVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou https://www.loom.com/share/..."
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold block">
                  Título do Vídeo (Opcional)
                </label>
                <input
                  type="text"
                  value={mediaVideoTitle}
                  onChange={(e) => setMediaVideoTitle(e.target.value)}
                  placeholder="Ex: Passo a Passo da Conciliação no Conta Azul"
                  className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Anexar Imagens */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2">
                <label className="text-slate-700 dark:text-slate-300 font-semibold block flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>Anexar Prints de Tela (URL da Imagem)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={mediaImageUrl}
                    onChange={(e) => setMediaImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/print.png"
                    className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!mediaImageUrl.trim()) return;
                      setMediaImagesList(prev => [
                        ...prev,
                        { id: `img-${Date.now()}`, url: mediaImageUrl.trim(), caption: mediaImageCaption.trim() || undefined }
                      ]);
                      setMediaImageUrl('');
                      setMediaImageCaption('');
                    }}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold rounded-lg cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>

                {mediaImagesList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {mediaImagesList.map(img => (
                      <div key={img.id} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg">
                        <ImageIcon className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="text-[10px] truncate max-w-[120px]">{img.caption || img.url}</span>
                        <button
                          type="button"
                          onClick={() => setMediaImagesList(prev => prev.filter(i => i.id !== img.id))}
                          className="text-rose-500 font-bold ml-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMediaBlock(null)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Salvar Multimídia
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
