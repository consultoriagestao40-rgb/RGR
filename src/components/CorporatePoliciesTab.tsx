'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  FileText, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck2, 
  Download, 
  Building2, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  ChevronRight, 
  Filter,
  Landmark,
  FileCode,
  X
} from 'lucide-react';
import { CorporatePolicy, OperationalRole, SystemUser } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface CorporatePoliciesTabProps {
  currentUser?: SystemUser | null;
  currentRole?: OperationalRole | null;
  roles?: OperationalRole[];
}

export const CorporatePoliciesTab: React.FC<CorporatePoliciesTabProps> = ({
  currentUser,
  currentRole,
  roles = []
}) => {
  const [policies, setPolicies] = useState<CorporatePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal Leitura da Política
  const [viewingPolicy, setViewingPolicy] = useState<CorporatePolicy | null>(null);

  // Modal Criar / Editar Política
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CorporatePolicy | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    category: 'finance' as CorporatePolicy['category'],
    description: '',
    contentMarkdown: '',
    version: 'v1.0',
    status: 'active' as CorporatePolicy['status'],
    homologatedBy: 'Conselho de Administração (CONS-ADM)',
    approvedAt: new Date().toISOString().slice(0, 10),
    minuteSessionCode: '',
    nextReviewDate: '',
    imageUrl: '',
    imageCaption: ''
  });

  const [imagesList, setImagesList] = useState<{ id: string; url: string; caption?: string }[]>([]);

  // Carrega Políticas
  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/policies');
      if (res.ok) {
        const data = await res.json();
        setPolicies(data);
      }
    } catch (err) {
      console.error('Erro ao buscar políticas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Abre Modal de Criação
  const handleOpenCreateModal = () => {
    setEditingPolicy(null);
    setFormData({
      code: `POL-00${policies.length + 1}`,
      title: '',
      category: 'finance',
      description: '',
      contentMarkdown: `### 1. Objetivo & Diretrizes\nDescreva detalhadamente o objetivo desta política corporativa...\n\n---\n\n### 2. Regras e Procedimentos\n1. Regra 1\n2. Regra 2\n\n---\n\n### 3. Vedações e Sanções\n- Critérios de compliance...`,
      version: 'v1.0',
      status: 'active',
      homologatedBy: 'Conselho de Administração (CONS-ADM)',
      approvedAt: new Date().toISOString().slice(0, 10),
      minuteSessionCode: '',
      nextReviewDate: '',
      imageUrl: '',
      imageCaption: ''
    });
    setImagesList([]);
    setIsModalOpen(true);
  };

  // Abre Modal de Edição
  const handleOpenEditModal = (policy: CorporatePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      code: policy.code,
      title: policy.title,
      category: policy.category,
      description: policy.description,
      contentMarkdown: policy.contentMarkdown,
      version: policy.version,
      status: policy.status,
      homologatedBy: policy.homologatedBy,
      approvedAt: policy.approvedAt,
      minuteSessionCode: policy.minuteSessionCode || '',
      nextReviewDate: policy.nextReviewDate || '',
      imageUrl: '',
      imageCaption: ''
    });
    setImagesList(policy.images || []);
    setIsModalOpen(true);
  };

  // Salvar Política
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.code) {
      alert('Informe o código e o título da política.');
      return;
    }

    const payload = {
      ...formData,
      images: imagesList
    };

    try {
      if (editingPolicy) {
        const res = await fetch(`/api/policies/${editingPolicy.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p));
          setIsModalOpen(false);
        }
      } else {
        const res = await fetch('/api/policies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setPolicies(prev => [created, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Erro ao salvar política:', err);
    }
  };

  // Excluir Política
  const handleDeletePolicy = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir a política "${title}"?`)) return;
    try {
      const res = await fetch(`/api/policies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPolicies(prev => prev.filter(p => p.id !== id));
        if (viewingPolicy?.id === id) setViewingPolicy(null);
      }
    } catch (err) {
      console.error('Erro ao excluir política:', err);
    }
  };

  // Anexar Imagem
  const handleAddImage = () => {
    if (!formData.imageUrl.trim()) return;
    setImagesList(prev => [
      ...prev,
      {
        id: `img-${Date.now()}`,
        url: formData.imageUrl.trim(),
        caption: formData.imageCaption.trim() || undefined
      }
    ]);
    setFormData(prev => ({ ...prev, imageUrl: '', imageCaption: '' }));
  };

  const handleRemoveImage = (imgId: string) => {
    setImagesList(prev => prev.filter(img => img.id !== imgId));
  };

  // Filtragem
  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.homologatedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [policies, searchTerm, selectedCategory, selectedStatus]);

  // Formatação de Categoria
  const formatCategory = (cat: CorporatePolicy['category']) => {
    switch (cat) {
      case 'finance': return { label: 'Financeiro & Controladoria', badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/80' };
      case 'operations': return { label: 'Operações & Facilities', badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200/80' };
      case 'governance': return { label: 'Governança & Riscos', badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200/80' };
      case 'hr_people': return { label: 'RH & Pessoal', badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200/80' };
      default: return { label: 'Geral', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Atlas Governance Framework • Normas & Compliance
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Políticas & Diretrizes Corporativas</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Normas homologadas pelo Conselho de Administração e Comitês para regência institucional da RGR.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Política</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar política por código, título, órgão deliberador ou palavra-chave..."
            className="w-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-lg px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none shadow-2xs"
          >
            <option value="all">Todas as Categorias</option>
            <option value="finance">Financeiro & Controladoria</option>
            <option value="operations">Operações & Facilities</option>
            <option value="governance">Governança & Riscos</option>
            <option value="hr_people">RH & Pessoal</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-lg px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none shadow-2xs"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Vigente</option>
            <option value="in_review">Em Revisão</option>
            <option value="revoked">Revogada</option>
          </select>
        </div>
      </div>

      {/* Tabela Padronizada Atlas de Políticas Corporativas (Zero Cards) */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Código & Política</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Órgão Deliberador</th>
                <th className="py-3 px-4 text-center">Vigência & Versão</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Nenhuma política corporativa encontrada para os critérios selecionados.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map(pol => {
                  const catStyle = formatCategory(pol.category);
                  return (
                    <tr 
                      key={pol.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Código & Política */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-start gap-2.5">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                            {pol.code}
                          </span>
                          <div>
                            <button
                              type="button"
                              onClick={() => setViewingPolicy(pol)}
                              className="text-slate-900 dark:text-white font-semibold hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors cursor-pointer"
                            >
                              {pol.title}
                            </button>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                              {pol.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-3.5 px-4 align-middle">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 inline-block ${catStyle.badge}`}>
                          {catStyle.label}
                        </span>
                      </td>

                      {/* Órgão Deliberador & Ata */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {pol.homologatedBy}
                        </div>
                        {pol.minuteSessionCode && (
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                            <FileCheck2 className="w-3 h-3 text-emerald-500" />
                            <span>Ata: {pol.minuteSessionCode}</span>
                          </div>
                        )}
                      </td>

                      {/* Vigência & Versão */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {pol.version}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Aprovada: {pol.approvedAt}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        {pol.status === 'active' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Vigente
                          </span>
                        )}
                        {pol.status === 'in_review' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Em Revisão
                          </span>
                        )}
                        {pol.status === 'revoked' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/80 inline-flex items-center gap-1">
                            Revogada
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingPolicy(pol)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Ler norma completa"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>Ler Norma</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(pol)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Editar política"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePolicy(pol.id, pol.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Excluir política"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Leitura Completa da Política */}
      {viewingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {viewingPolicy.code} • {viewingPolicy.version}
                  </span>
                  <span className="text-xs text-slate-400">
                    Homologado por: {viewingPolicy.homologatedBy}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {viewingPolicy.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingPolicy(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
              
              {/* Box de Resumo da Norma */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Síntese Executiva:
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {viewingPolicy.description}
                </p>
                <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-500">
                  <span>Data de Aprovação: <strong>{viewingPolicy.approvedAt}</strong></span>
                  {viewingPolicy.minuteSessionCode && (
                    <span>Ata da Sessão: <strong>{viewingPolicy.minuteSessionCode}</strong></span>
                  )}
                  {viewingPolicy.nextReviewDate && (
                    <span>Próxima Revisão: <strong>{viewingPolicy.nextReviewDate}</strong></span>
                  )}
                </div>
              </div>

              {/* Imagens Anexadas à Política */}
              {viewingPolicy.images && viewingPolicy.images.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Diagramas, Organogramas e Evidências Ilustrativas</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewingPolicy.images.map(img => (
                      <div key={img.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                        <img src={img.url} alt={img.caption || 'Imagem da política'} className="w-full h-44 object-cover hover:scale-105 transition-transform" />
                        {img.caption && (
                          <p className="p-2 text-[11px] text-slate-500 dark:text-slate-400 text-center border-t border-slate-200 dark:border-slate-800">
                            {img.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Texto Normativo Formatado em Markdown */}
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm">
                <ReactMarkdown>{viewingPolicy.contentMarkdown}</ReactMarkdown>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Documento Institucional Auditado • RGR Facilities
              </span>
              <button
                type="button"
                onClick={() => setViewingPolicy(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 cursor-pointer shadow-xs"
              >
                Fechar Leitura
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Cadastro & Edição de Política */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingPolicy ? 'Editar Política Corporativa' : 'Cadastrar Nova Política Corporativa'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="Ex: POL-FIN-001"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="finance">Financeiro & Controladoria</option>
                    <option value="operations">Operações & Facilities</option>
                    <option value="governance">Governança & Riscos</option>
                    <option value="hr_people">RH & Pessoal</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Versão</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    required
                    placeholder="v1.0"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Título da Política</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: Política de Reembolso e Despesas Corporativas"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Órgão Deliberador</label>
                  <input
                    type="text"
                    value={formData.homologatedBy}
                    onChange={(e) => setFormData({ ...formData, homologatedBy: e.target.value })}
                    placeholder="Ex: Conselho de Administração (CONS-ADM)"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Ata Vinculada (Código)</label>
                  <input
                    type="text"
                    value={formData.minuteSessionCode}
                    onChange={(e) => setFormData({ ...formData, minuteSessionCode: e.target.value.toUpperCase() })}
                    placeholder="Ex: SES-01/2026"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Data de Aprovação</label>
                  <input
                    type="date"
                    value={formData.approvedAt}
                    onChange={(e) => setFormData({ ...formData, approvedAt: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    <option value="active">Vigente</option>
                    <option value="in_review">Em Revisão</option>
                    <option value="revoked">Revogada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Síntese / Descrição</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Resumo executivo do objetivo e regras principais da política..."
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Anexar Imagens / Fotos */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2">
                <label className="text-slate-700 dark:text-slate-300 font-semibold block flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>Anexar Foto, Diagrama ou Modelo Ilustrativo (URL da Imagem)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Cole o link da imagem (ex: https://...)"
                    className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                  <input
                    type="text"
                    value={formData.imageCaption}
                    onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                    placeholder="Legenda da imagem..."
                    className="w-1/3 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-semibold cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>

                {imagesList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {imagesList.map(img => (
                      <div key={img.id} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg">
                        <ImageIcon className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="text-[10px] truncate max-w-[120px]">{img.caption || img.url}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Conteúdo Normativo Completo (Markdown)</label>
                <textarea
                  rows={8}
                  value={formData.contentMarkdown}
                  onChange={(e) => setFormData({ ...formData, contentMarkdown: e.target.value })}
                  placeholder="Redija o texto oficial com seções, artigos, diretrizes e tabelas..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Salvar Política
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
