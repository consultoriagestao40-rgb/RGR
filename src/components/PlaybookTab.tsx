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
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  BookOpen,
  Eye,
  FileCheck2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { OperationalRole, RoutineBlock, PopTrainingRecord, SystemUser } from '@/lib/types';
import { formatBlockFrequency } from '@/lib/frequency';
import { RichTextEditor } from './RichTextEditor';

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

  // Modal de Leitura / Visualização do POP
  const [viewingPop, setViewingPop] = useState<RoutineBlock | null>(null);

  // Modal para anexar mídia/vídeo ao POP
  const [editingMediaBlock, setEditingMediaBlock] = useState<RoutineBlock | null>(null);
  const [mediaVideoUrl, setMediaVideoUrl] = useState('');
  const [mediaVideoTitle, setMediaVideoTitle] = useState('');
  const [mediaImageUrl, setMediaImageUrl] = useState('');
  const [mediaImageCaption, setMediaImageCaption] = useState('');
  const [mediaImagesList, setMediaImagesList] = useState<{ id: string; url: string; caption?: string }[]>([]);

  // Modal de Criação / Edição de POP Completo (com RichTextEditor, Vídeo e Imagens)
  const [isPopModalOpen, setIsPopModalOpen] = useState(false);
  const [editingPopBlock, setEditingPopBlock] = useState<RoutineBlock | null>(null);
  const [popFormData, setPopFormData] = useState({
    code: '',
    title: '',
    timeWindow: '08:30 - 09:30',
    deliverable: '',
    sopMarkdown: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    version: 'v1.0',
    homologatedBy: 'Diretoria Executiva',
    videoUrl: '',
    videoTitle: '',
    recyclingPeriodDays: 180
  });

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

  // Abre Modal para Cadastrar Novo POP
  const handleOpenCreatePopModal = () => {
    setEditingPopBlock(null);
    const nextIndex = blocks.length + 1;
    const rolePrefix = role?.code ? role.code.replace('CAD-', '') : 'OPE';
    setPopFormData({
      code: `POP-${rolePrefix}-00${nextIndex}`,
      title: '',
      timeWindow: '08:30 - 09:30',
      deliverable: '',
      sopMarkdown: `### 1. Objetivo & Aplicação do Procedimento\nDescreva detalhadamente o passo a passo desta rotina operacional...\n\n---\n\n### 2. Passo a Passo Operacional Padronizado\nUtilize os botões acima para inserir etapas com foto na esquerda ou direita, ou insira vídeos explicativos.\n\n---\n\n### 3. Critério de Aceite & Entregável\n- Descrição clara da evidência ou documento que comprova a execução.`,
      frequency: 'daily',
      dayOfWeek: 1,
      dayOfMonth: 1,
      version: 'v1.0',
      homologatedBy: 'Diretoria Executiva',
      videoUrl: '',
      videoTitle: '',
      recyclingPeriodDays: 180
    });
    setMediaImagesList([]);
    setIsPopModalOpen(true);
  };

  // Abre Modal para Editar POP Existente
  const handleOpenEditPopModal = (block: RoutineBlock) => {
    setEditingPopBlock(block);
    setPopFormData({
      code: block.code || '',
      title: block.title,
      timeWindow: block.timeWindow,
      deliverable: block.deliverable,
      sopMarkdown: block.sopMarkdown,
      frequency: block.frequency,
      dayOfWeek: block.dayOfWeek || 1,
      dayOfMonth: block.dayOfMonth || 1,
      version: block.version || 'v1.0',
      homologatedBy: block.homologatedBy || 'Diretoria Executiva',
      videoUrl: block.videoUrl || '',
      videoTitle: block.videoTitle || '',
      recyclingPeriodDays: block.recyclingPeriodDays || 180
    });
    setMediaImagesList(block.images || []);
    setIsPopModalOpen(true);
  };

  // Salva POP (Criação ou Edição)
  const handleSavePop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !popFormData.title.trim() || !popFormData.deliverable.trim()) return;

    const payload = {
      roleId: role.id,
      code: popFormData.code.trim() || undefined,
      title: popFormData.title.trim(),
      timeWindow: popFormData.timeWindow.trim(),
      deliverable: popFormData.deliverable.trim(),
      sopMarkdown: popFormData.sopMarkdown,
      frequency: popFormData.frequency,
      dayOfWeek: popFormData.frequency === 'weekly' ? Number(popFormData.dayOfWeek) : null,
      dayOfMonth: popFormData.frequency === 'monthly' ? Number(popFormData.dayOfMonth) : null,
      version: popFormData.version.trim() || 'v1.0',
      homologatedBy: popFormData.homologatedBy.trim() || 'Diretoria Executiva',
      videoUrl: popFormData.videoUrl.trim() || null,
      videoTitle: popFormData.videoTitle.trim() || null,
      images: mediaImagesList,
      recyclingPeriodDays: Number(popFormData.recyclingPeriodDays) || 180
    };

    try {
      if (editingPopBlock) {
        await fetch(`/api/blocks/${editingPopBlock.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setIsPopModalOpen(false);
      if (onRefreshBlocks) onRefreshBlocks();
    } catch (err) {
      console.error('Erro ao salvar POP:', err);
    }
  };

  // Exclui POP
  const handleDeletePop = async (block: RoutineBlock) => {
    if (!confirm(`Deseja realmente excluir o procedimento "${block.code} - ${block.title}"?`)) return;
    try {
      await fetch(`/api/blocks/${block.id}`, { method: 'DELETE' });
      if (onRefreshBlocks) onRefreshBlocks();
    } catch (err) {
      console.error('Erro ao excluir POP:', err);
    }
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

        <div className="flex items-center gap-2 no-print shrink-0">
          <button
            type="button"
            onClick={handleOpenCreatePopModal}
            className="px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo POP</span>
          </button>
          
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            Expandir Todos
          </button>

          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            Recolher
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
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

      {/* Tabela Padronizada de Procedimentos Operacionais Padrão (POPs) */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-[34%]">Código & POP</th>
                <th className="py-3 px-4 w-[14%]">Horário & Frequência</th>
                <th className="py-3 px-4 w-[16%]">Capacitação Falconi</th>
                <th className="py-3 px-4 w-[16%]">Entregável Obrigatório</th>
                <th className="py-3 px-4 w-[8%] text-center">Versão</th>
                <th className="py-3 px-4 w-[12%] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredBlocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum procedimento operacional encontrado para esta cadeira.
                  </td>
                </tr>
              ) : (
                filteredBlocks.map((block, index) => {
                  const isExpanded = !!expandedBlockIds[block.id];
                  const hasVideo = !!block.videoUrl;
                  const hasImages = block.images && block.images.length > 0;
                  const latestTraining = block.trainingRecords && block.trainingRecords.length > 0
                    ? block.trainingRecords[block.trainingRecords.length - 1]
                    : null;
                  const isTrainingValid = latestTraining && new Date(latestTraining.validUntil) > new Date();
                  const freq = formatBlockFrequency(block);

                  return (
                    <React.Fragment key={block.id}>
                      <tr 
                        className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-slate-50/40 dark:bg-slate-800/20' : ''
                        }`}
                        onClick={() => toggleExpand(block.id)}
                      >
                        {/* 1. Código & POP */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-start gap-2.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                              {block.code || `POP-${index + 1}`}
                            </span>
                            <div className="min-w-0 pr-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingPop(block);
                                }}
                                className="text-slate-900 dark:text-white font-semibold hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors cursor-pointer truncate block w-full"
                                title={block.title}
                              >
                                {block.title}
                              </button>
                              <div className="flex items-center gap-2 mt-0.5">
                                {hasVideo && (
                                  <span className="text-[10px] text-red-600 dark:text-red-400 font-medium inline-flex items-center gap-1 shrink-0">
                                    <Play className="w-2.5 h-2.5 fill-current" />
                                    Vídeo-Aula
                                  </span>
                                )}
                                {hasImages && (
                                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium inline-flex items-center gap-1 shrink-0">
                                    <ImageIcon className="w-2.5 h-2.5" />
                                    {block.images?.length} print(s)
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 truncate">
                                  Homologado por: {block.homologatedBy || 'Diretoria Executiva'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Horário & Frequência */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="font-mono text-xs text-slate-800 dark:text-slate-200 font-medium">
                            {block.timeWindow}
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 inline-block mt-1 ${freq.badgeColor}`}>
                            {freq.label}
                          </span>
                        </td>

                        {/* 3. Capacitação Falconi */}
                        <td className="py-3.5 px-4 align-middle">
                          {isTrainingValid ? (
                            <div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 inline-flex items-center gap-1">
                                <UserCheck className="w-2.5 h-2.5" />
                                Treinado
                              </span>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5" title={latestTraining.userName}>
                                {latestTraining.userName}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 inline-flex items-center gap-1">
                                <GraduationCap className="w-2.5 h-2.5" />
                                Pendente
                              </span>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                Reciclagem: {block.recyclingPeriodDays || 180}d
                              </p>
                            </div>
                          )}
                        </td>

                        {/* 4. Entregável (Aceite Binário) */}
                        <td className="py-3.5 px-4 align-middle">
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2" title={block.deliverable}>
                            {block.deliverable}
                          </p>
                        </td>

                        {/* 5. Versão */}
                        <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {block.version || 'v1.0'}
                          </span>
                        </td>

                        {/* 6. Ações */}
                        <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setViewingPop(block)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
                              title="Ler POP detalhado"
                            >
                              <Eye className="w-3 h-3 text-slate-400" />
                              <span>Ler</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditPopModal(block)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Editar POP"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => copySopText(block)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Copiar texto oficial"
                            >
                              {copiedId === block.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePop(block)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Excluir POP"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleExpand(block.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                              title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Linha Expansível com Conteúdo Detalhado, Vídeo, Fotos e Falconi */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-[#0c121e]">
                          <td colSpan={6} className="p-5 border-b border-slate-200/80 dark:border-slate-800 space-y-4">
                            
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

                            {/* 3. TEXTO NORMATIVO DO POP (HTML / MARKDOWN FORMATADO) */}
                            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
                              <div className="sop-content prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                {block.sopMarkdown.includes('<') ? (
                                  <div dangerouslySetInnerHTML={{ __html: block.sopMarkdown }} />
                                ) : (
                                  <ReactMarkdown>{block.sopMarkdown}</ReactMarkdown>
                                )}
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

                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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

      {/* Modal: Cadastro & Edição Completa de Procedimento Operacional Padrão (POP) */}
      {isPopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingPopBlock ? 'Editar Procedimento Operacional Padrão (POP)' : 'Cadastrar Novo Procedimento Operacional (POP)'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cadeira Operacional: <strong>{role.title} ({role.code || 'CAD-01'})</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPopModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body Scrollable */}
            <form onSubmit={handleSavePop} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Linha 1: Código, Janela de Horário e Versão */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                    Código do POP
                  </label>
                  <input
                    type="text"
                    value={popFormData.code}
                    onChange={(e) => setPopFormData({ ...popFormData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: POP-OPE-001"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                    Janela de Horário da Rotina
                  </label>
                  <input
                    type="text"
                    value={popFormData.timeWindow}
                    onChange={(e) => setPopFormData({ ...popFormData, timeWindow: e.target.value })}
                    required
                    placeholder="Ex: 08:30 - 09:30"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                    Versão Oficial & Homologador
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={popFormData.version}
                      onChange={(e) => setPopFormData({ ...popFormData, version: e.target.value })}
                      required
                      placeholder="v1.0"
                      className="w-20 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono text-center"
                    />
                    <input
                      type="text"
                      value={popFormData.homologatedBy}
                      onChange={(e) => setPopFormData({ ...popFormData, homologatedBy: e.target.value })}
                      placeholder="Ex: Diretoria Executiva"
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Linha 2: Título do POP */}
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  Título do Macroprocesso / POP
                </label>
                <input
                  type="text"
                  value={popFormData.title}
                  onChange={(e) => setPopFormData({ ...popFormData, title: e.target.value })}
                  required
                  placeholder="Ex: Auditoria Diária de Ponto Eletrônico e Escalas de Cobertura"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-sm font-semibold"
                />
              </div>

              {/* Linha 3: Periodicidade Falconi & Entregável Binário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block">
                    Frequência da Execução na Linha do Tempo
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setPopFormData({ ...popFormData, frequency: 'daily' })}
                      className={`py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        popFormData.frequency === 'daily'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Diária
                    </button>
                    <button
                      type="button"
                      onClick={() => setPopFormData({ ...popFormData, frequency: 'weekly' })}
                      className={`py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        popFormData.frequency === 'weekly'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Semanal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPopFormData({ ...popFormData, frequency: 'monthly' })}
                      className={`py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        popFormData.frequency === 'monthly'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Mensal
                    </button>
                  </div>

                  {popFormData.frequency === 'weekly' && (
                    <div className="pt-1">
                      <label className="text-slate-500 block mb-1">Dia da Semana:</label>
                      <select
                        value={popFormData.dayOfWeek}
                        onChange={(e) => setPopFormData({ ...popFormData, dayOfWeek: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                      >
                        <option value={1}>Segunda-feira</option>
                        <option value={2}>Terça-feira</option>
                        <option value={3}>Quarta-feira</option>
                        <option value={4}>Quinta-feira</option>
                        <option value={5}>Sexta-feira</option>
                      </select>
                    </div>
                  )}

                  {popFormData.frequency === 'monthly' && (
                    <div className="pt-1">
                      <label className="text-slate-500 block mb-1">Dia do Mês (1 a 31):</label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={popFormData.dayOfMonth}
                        onChange={(e) => setPopFormData({ ...popFormData, dayOfMonth: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                      />
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block">
                    Entregável Obrigatório (Critério de Aceite)
                  </label>
                  <input
                    type="text"
                    value={popFormData.deliverable}
                    onChange={(e) => setPopFormData({ ...popFormData, deliverable: e.target.value })}
                    required
                    placeholder="Ex: Espelho de ponto 100% auditado e faltas cobertas"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
                  />
                  <div className="flex items-center justify-between text-slate-500 pt-1">
                    <span>Reciclagem Falconi (dias):</span>
                    <input
                      type="number"
                      min={30}
                      max={730}
                      value={popFormData.recyclingPeriodDays}
                      onChange={(e) => setPopFormData({ ...popFormData, recyclingPeriodDays: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-right font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Linha 4: Vídeo-Treinamento (YouTube / Loom) */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2">
                <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-red-500" />
                    <span>Vídeo-Treinamento Prático (YouTube ou Loom)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Será renderizado como player interativo no POP
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    value={popFormData.videoUrl}
                    onChange={(e) => setPopFormData({ ...popFormData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... ou https://www.loom.com/share/..."
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                  <input
                    type="text"
                    value={popFormData.videoTitle}
                    onChange={(e) => setPopFormData({ ...popFormData, videoTitle: e.target.value })}
                    placeholder="Título da vídeo-aula (Ex: Demonstração no Sistema)"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Linha 5: Editor Rico WYSIWYG com Passo a Passo (Foto na esquerda/direita, Vídeo no meio, etc) */}
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold block flex items-center justify-between">
                  <span>Passo a Passo Operacional (Editor Visual Padronizado)</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Clique em "+ Passo (Foto Esq / Texto Dir)" ou "+ Vídeo Player" para diagramar
                  </span>
                </label>
                <RichTextEditor
                  value={popFormData.sopMarkdown}
                  onChange={(html) => setPopFormData({ ...popFormData, sopMarkdown: html })}
                  placeholder="Descreva o passo a passo detalhado deste procedimento operacional..."
                  minHeight="340px"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPopModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Procedimento (POP)</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Leitura Completa do POP (Estilo Modal de Políticas Corporativas) */}
      {viewingPop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {viewingPop.code || 'POP'} • {viewingPop.version || 'v1.0'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Homologado por: {viewingPop.homologatedBy || 'Diretoria Executiva'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {viewingPop.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingPop(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
              
              {/* Box de Resumo da Rotina & Critério de Aceite */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Critério de Aceite & Entregável Obrigatório (Método Falconi):
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {viewingPop.deliverable}
                </p>
                <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-500">
                  <span>Janela de Horário: <strong>{viewingPop.timeWindow}</strong></span>
                  <span>Periodicidade: <strong className="capitalize">{viewingPop.frequency}</strong></span>
                  <span>Ciclo de Reciclagem: <strong>{viewingPop.recyclingPeriodDays || 180} dias</strong></span>
                </div>
              </div>

              {/* Seção de Vídeo-Treinamento Prático se houver */}
              {viewingPop.videoUrl && (
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                  <div className="p-3 bg-slate-950 flex items-center justify-between text-xs text-white">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Play className="w-4 h-4 text-red-500 fill-red-500" />
                      {viewingPop.videoTitle || 'Vídeo de Demonstração Prática'}
                    </span>
                    <a
                      href={viewingPop.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Abrir no YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={getEmbedYoutubeUrl(viewingPop.videoUrl) || ''}
                      title={viewingPop.videoTitle || viewingPop.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Prints e Telas de Apoio se houver */}
              {viewingPop.images && viewingPop.images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span>Telas & Evidências de Referência:</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewingPop.images.map(img => (
                      <div key={img.id} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                        <img src={img.url} alt={img.caption || 'Print'} className="w-full max-h-56 object-cover" />
                        {img.caption && (
                          <p className="p-2 text-[10px] text-slate-500 text-center border-t border-slate-200 dark:border-slate-800">
                            {img.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Texto Normativo e Passo a Passo (HTML ou Markdown) */}
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm">
                {viewingPop.sopMarkdown.includes('<') ? (
                  <div 
                    className="leading-relaxed space-y-4 font-normal text-slate-800 dark:text-slate-200"
                    dangerouslySetInnerHTML={{ __html: viewingPop.sopMarkdown }} 
                  />
                ) : (
                  <ReactMarkdown>{viewingPop.sopMarkdown}</ReactMarkdown>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Procedimento Operacional Auditado • RGR Facilities
              </span>
              <button
                type="button"
                onClick={() => setViewingPop(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 cursor-pointer shadow-xs"
              >
                Fechar Leitura
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
