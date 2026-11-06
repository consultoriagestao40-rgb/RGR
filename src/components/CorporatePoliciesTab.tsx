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
  X,
  Send,
  ArrowRight,
  Clock,
  RotateCcw,
  Sparkles,
  Check,
  Printer
} from 'lucide-react';
import { CorporatePolicy, OperationalRole, SystemUser } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import { RichTextEditor } from './RichTextEditor';
import { useEscKey } from '@/lib/use-esc-key';

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

  // Modal Criar / Editar Proposta
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CorporatePolicy | null>(null);

  // Modal de Homologação em Sessão
  const [approvingPolicy, setApprovingPolicy] = useState<CorporatePolicy | null>(null);
  const [approvalMinuteCode, setApprovalMinuteCode] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    category: 'finance' as CorporatePolicy['category'],
    description: '',
    contentMarkdown: '',
    version: 'v1.0',
    status: 'draft' as CorporatePolicy['status'],
    targetApproverBody: 'CONS-ADM',
    authorName: '',
    authorRoleTitle: '',
    submittedAt: '',
    homologatedBy: 'Conselho de Administração (CONS-ADM)',
    approvedAt: '',
    minuteSessionCode: '',
    nextReviewDate: '',
    imageUrl: '',
    imageCaption: ''
  });

  const [imagesList, setImagesList] = useState<{ id: string; url: string; caption?: string }[]>([]);

  // Fechar modais ao pressionar ESC
  useEscKey(!!viewingPolicy, () => setViewingPolicy(null));
  useEscKey(isModalOpen, () => setIsModalOpen(false));
  useEscKey(!!approvingPolicy, () => setApprovingPolicy(null));

  // Carrega Políticas (com persistência local como fallback)
  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/policies');
      if (res.ok) {
        const data = await res.json();
        // Mescla com dados locais se houverem políticas salvas/editadas localmente
        const localSaved = localStorage.getItem('rgr_corporate_policies_v1');
        if (localSaved) {
          try {
            const parsedLocal: CorporatePolicy[] = JSON.parse(localSaved);
            if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
              // Atualiza o estado com a versão local mais recente
              setPolicies(parsedLocal);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Erro ao ler políticas do localStorage:', e);
          }
        }
        setPolicies(data);
        localStorage.setItem('rgr_corporate_policies_v1', JSON.stringify(data));
      } else {
        const localSaved = localStorage.getItem('rgr_corporate_policies_v1');
        if (localSaved) {
          setPolicies(JSON.parse(localSaved));
        }
      }
    } catch (err) {
      console.error('Erro ao buscar políticas:', err);
      const localSaved = localStorage.getItem('rgr_corporate_policies_v1');
      if (localSaved) {
        setPolicies(JSON.parse(localSaved));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Abre Modal de Criação (Proposta de Minuta)
  const handleOpenCreateModal = () => {
    setEditingPolicy(null);
    setFormData({
      code: `POL-00${policies.length + 1}`,
      title: '',
      category: 'finance',
      description: '',
      contentMarkdown: `### 1. Objetivo & Diretrizes\nDescreva detalhadamente o objetivo desta política corporativa...\n\n---\n\n### 2. Regras e Procedimentos\n1. Regra 1\n2. Regra 2\n\n---\n\n### 3. Vedações e Sanções\n- Critérios de compliance...`,
      version: 'v1.0',
      status: 'draft',
      targetApproverBody: 'CONS-ADM',
      authorName: currentUser?.name || 'Diretoria Executiva',
      authorRoleTitle: currentRole?.title || 'Conselheiro',
      submittedAt: '',
      homologatedBy: 'Conselho de Administração (CONS-ADM)',
      approvedAt: '',
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
      targetApproverBody: policy.targetApproverBody || 'CONS-ADM',
      authorName: policy.authorName || '',
      authorRoleTitle: policy.authorRoleTitle || '',
      submittedAt: policy.submittedAt || '',
      homologatedBy: policy.homologatedBy || 'Conselho de Administração',
      approvedAt: policy.approvedAt || '',
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
          setPolicies(prev => {
            const next = prev.map(p => p.id === updated.id ? updated : p);
            localStorage.setItem('rgr_corporate_policies_v1', JSON.stringify(next));
            return next;
          });
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
          setPolicies(prev => {
            const next = [created, ...prev];
            localStorage.setItem('rgr_corporate_policies_v1', JSON.stringify(next));
            return next;
          });
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Erro ao salvar política:', err);
    }
  };

  // WORKFLOW 1: Enviar Minuta para Pauta do Colegiado (injeta a pauta real no Comitê)
  const handleSubmitToCommittee = async (policy: CorporatePolicy) => {
    const targetBodyCode = policy.targetApproverBody || 'CONS-ADM';
    const targetBodyName = targetBodyCode === 'COM-FIN'
      ? 'Comitê de Resultados & Finanças (COM-FIN)'
      : targetBodyCode === 'COM-CLI'
      ? 'Comitê de Gestão de Clientes & Qualidade (COM-CLI)'
      : 'Conselho de Administração (CONS-ADM)';

    if (!confirm(`Deseja protocolar e submeter a proposta "${policy.code} - ${policy.title}" para a ordem do dia do colegiado [${targetBodyName}]?`)) return;

    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch(`/api/policies/${policy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'in_review',
          submittedAt: today,
          homologatedBy: targetBodyName
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p));

        // Injeta automaticamente como Pauta Deliberativa no Colegiado salvo no localStorage
        try {
          const savedCommittees = localStorage.getItem('rgr_committees_state_v3');
          if (savedCommittees) {
            const parsed = JSON.parse(savedCommittees);
            const targetCom = parsed.find((c: any) => c.code === targetBodyCode || c.id === targetBodyCode);
            if (targetCom) {
              const newAgendaItem = {
                id: `agenda-pol-${policy.id}`,
                title: `Apreciação e Homologação da Norma: ${policy.code} - ${policy.title}`,
                description: `Proposta de Política Corporativa submetida por ${policy.authorName || 'Diretoria'}.\n\nSíntese: ${policy.description}`,
                isFixed: false,
                isDeliberative: true,
                category: 'Governança & Políticas',
                votes: {},
                status: 'pending'
              };

              // Adiciona na lista base do comitê
              targetCom.agendas = [newAgendaItem, ...(targetCom.agendas || [])];

              // Se houver sessões em aberto / agendadas, adiciona na sessão ativa mais recente
              if (targetCom.sessions && targetCom.sessions.length > 0) {
                const latestSession = targetCom.sessions[0];
                if (latestSession && latestSession.status !== 'concluded') {
                  latestSession.agendas = [newAgendaItem, ...(latestSession.agendas || [])];
                }
              }

              localStorage.setItem('rgr_committees_state_v3', JSON.stringify(parsed));
            }
          }
        } catch (storageErr) {
          console.warn('Erro ao sincronizar pauta com o comitê:', storageErr);
        }

        alert(`✅ Proposta submetida com sucesso!\nUma pauta deliberativa foi incluída na Ordem do Dia de [${targetBodyName}].`);
      }
    } catch (err) {
      console.error('Erro ao submeter política:', err);
    }
  };

  // WORKFLOW 2: Homologar / Aprovar Política em Sessão com Ata
  const handleOpenApproveModal = (policy: CorporatePolicy) => {
    setApprovingPolicy(policy);
    setApprovalMinuteCode(policy.minuteSessionCode || 'SES-01/2026');
    setApprovalNotes('Deliberação homologada por unanimidade em Sessão Oficial do Colegiado.');
  };

  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingPolicy) return;

    try {
      const today = new Date().toISOString().slice(0, 10);
      const nextReview = new Date();
      nextReview.setFullYear(nextReview.getFullYear() + 1);

      const res = await fetch(`/api/policies/${approvingPolicy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'active',
          approvedAt: today,
          minuteSessionCode: approvalMinuteCode.trim().toUpperCase() || 'SES-01/2026',
          approvalNotes: approvalNotes.trim(),
          nextReviewDate: nextReview.toISOString().slice(0, 10)
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setPolicies(prev => {
          const next = prev.map(p => p.id === updated.id ? updated : p);
          localStorage.setItem('rgr_corporate_policies_v1', JSON.stringify(next));
          return next;
        });
        setApprovingPolicy(null);
      }
    } catch (err) {
      console.error('Erro ao aprovar política:', err);
    }
  };

  // WORKFLOW 3: Revogar Política Vigente
  const handleRevokePolicy = async (policy: CorporatePolicy) => {
    if (!confirm(`Deseja revogar a vigência da política "${policy.code}"? Ela deixará de ter eficácia corporativa imediata.`)) return;

    try {
      const res = await fetch(`/api/policies/${policy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'revoked'
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setPolicies(prev => {
          const next = prev.map(p => p.id === updated.id ? updated : p);
          localStorage.setItem('rgr_corporate_policies_v1', JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      console.error('Erro ao revogar política:', err);
    }
  };

  // Excluir Política
  const handleDeletePolicy = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente o registro da política "${title}"?`)) return;
    try {
      const res = await fetch(`/api/policies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPolicies(prev => {
          const next = prev.filter(p => p.id !== id);
          localStorage.setItem('rgr_corporate_policies_v1', JSON.stringify(next));
          return next;
        });
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
        (p.homologatedBy && p.homologatedBy.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [policies, searchTerm, selectedCategory, selectedStatus]);

  // Contadores para Métricas do Workflow
  const stats = useMemo(() => {
    const active = policies.filter(p => p.status === 'active').length;
    const inReview = policies.filter(p => p.status === 'in_review').length;
    const draft = policies.filter(p => p.status === 'draft').length;
    return { active, inReview, draft, total: policies.length };
  }, [policies]);

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
      
      {/* Top Header Banner com Régua de Workflow */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Atlas Governance Framework • Ciclo de Aprovação e Publicação
              </span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Políticas & Diretrizes Corporativas</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Elabore minutas, submeta para a ordem do dia dos comitês, homolgue via ata oficial e publique normas vigentes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Elaborar Nova Minuta</span>
          </button>
        </div>

        {/* Régua Visual do Workflow de Governança */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 text-xs">
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">1</span>
            <div>
              <span className="font-semibold block text-slate-800 dark:text-slate-200">1. Elaboração</span>
              <span className="text-[10px] text-slate-400">Minuta Técnica ({stats.draft})</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
            <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-[10px]">2</span>
            <div>
              <span className="font-semibold block text-amber-900 dark:text-amber-200">2. Em Pauta</span>
              <span className="text-[10px] text-amber-700/80 dark:text-amber-400">Comitê / Conselho ({stats.inReview})</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
            <span className="w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-[10px]">3</span>
            <div>
              <span className="font-semibold block text-emerald-900 dark:text-emerald-200">3. Homologada</span>
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400">Ata Lavrada em Sessão</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs">
            <span className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold text-[10px]">4</span>
            <div>
              <span className="font-semibold block text-blue-900 dark:text-blue-200">4. Publicada</span>
              <span className="text-[10px] text-blue-700/80 dark:text-blue-400">Vigente na RGR ({stats.active})</span>
            </div>
          </div>
        </div>
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
            <option value="active">Publicada & Vigente</option>
            <option value="in_review">Em Pauta / Revisão</option>
            <option value="draft">Em Elaboração (Minuta)</option>
            <option value="revoked">Revogada</option>
          </select>
        </div>
      </div>

      {/* Tabela Padronizada Atlas de Políticas Corporativas */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-[36%]">Código & Política</th>
                <th className="py-3 px-4 w-[16%]">Categoria</th>
                <th className="py-3 px-4 w-[18%]">Instância Deliberadora</th>
                <th className="py-3 px-4 w-[14%] text-center">Status</th>
                <th className="py-3 px-4 w-[10%] text-center">Vigência</th>
                <th className="py-3 px-4 w-[16%] text-right">Ações</th>
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
                          <div className="min-w-0 pr-2">
                            <button
                              type="button"
                              onClick={() => setViewingPolicy(pol)}
                              className="text-slate-900 dark:text-white font-semibold hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors cursor-pointer truncate block w-full"
                              title={pol.title}
                            >
                              {pol.title}
                            </button>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {pol.description}
                            </p>
                            {pol.authorName && (
                              <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                                Proposta por: {pol.authorName} ({pol.authorRoleTitle || 'Mesa'})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-3.5 px-4 align-middle">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 inline-block whitespace-nowrap ${catStyle.badge}`}>
                          {catStyle.label}
                        </span>
                      </td>

                      {/* Órgão Deliberador Alvo */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="text-slate-800 dark:text-slate-200 font-medium truncate" title={pol.homologatedBy}>
                          {pol.homologatedBy || (
                            pol.targetApproverBody === 'COM-FIN'
                              ? 'Comitê de Resultados & Finanças'
                              : pol.targetApproverBody === 'COM-CLI'
                              ? 'Comitê de Gestão de Clientes'
                              : 'Conselho de Administração'
                          )}
                        </div>
                        {pol.submittedAt && pol.status === 'in_review' && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            <span>Pautada: {pol.submittedAt}</span>
                          </div>
                        )}
                      </td>

                      {/* Status no Workflow */}
                      <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                        {pol.status === 'draft' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1">
                            <Pencil className="w-2.5 h-2.5" />
                            Minuta
                          </span>
                        )}
                        {pol.status === 'in_review' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Em Pauta
                          </span>
                        )}
                        {pol.status === 'active' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Vigente
                          </span>
                        )}
                        {pol.status === 'revoked' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/80 inline-flex items-center gap-1">
                            Revogada
                          </span>
                        )}
                      </td>

                      {/* Vigência & Ata */}
                      <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {pol.version}
                        </span>
                        {pol.minuteSessionCode && (
                          <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-1">
                            <FileCheck2 className="w-3 h-3" />
                            <span>{pol.minuteSessionCode}</span>
                          </div>
                        )}
                      </td>

                      {/* Ações & Transições de Workflow */}
                      <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* BOTÃO DO WORKFLOW: ENVIAR PARA PAUTA */}
                          {pol.status === 'draft' && (
                            <button
                              type="button"
                              onClick={() => handleSubmitToCommittee(pol)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
                              title="Submeter proposta à pauta do colegiado deliberador"
                            >
                              <Send className="w-3 h-3 text-amber-600" />
                              <span>Pautar</span>
                            </button>
                          )}

                          {/* BOTÃO DO WORKFLOW: HOMOLOGAR & APROVAR EM SESSÃO */}
                          {pol.status === 'in_review' && (
                            <button
                              type="button"
                              onClick={() => handleOpenApproveModal(pol)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
                              title="Homologar aprovação via ata de sessão oficial"
                            >
                              <FileCheck2 className="w-3 h-3" />
                              <span>Aprovar</span>
                            </button>
                          )}

                          {/* Ações Padronizadas: Ler, Editar, Revogar (se vigente) e Excluir */}
                          <button
                            type="button"
                            onClick={() => setViewingPolicy(pol)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
                            title="Ler norma completa"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>Ler</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(pol)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Editar minuta"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {pol.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => handleRevokePolicy(pol)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Revogar vigência da política"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeletePolicy(pol.id, pol.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Excluir política permanentemente"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in printing-doc-container">
          <div id="printable-policy-sheet" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl">
            
            {/* Print-Only Official Letterhead */}
            <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-4 px-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm font-mono tracking-tight">
                  RGR
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                    RGR • Gerenciamento da Rotina & Governança
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    Facilities Brasil S.A. • Política Corporativa Institucional
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Norma Regulamentar</span>
                <span className="text-[11px] font-mono font-bold text-slate-900">{viewingPolicy.code} • {viewingPolicy.version}</span>
              </div>
            </div>

            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {viewingPolicy.code} • {viewingPolicy.version}
                  </span>
                  <span className="text-xs text-slate-400">
                    Homologado por: {viewingPolicy.homologatedBy || 'Mesa Diretora'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {viewingPolicy.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingPolicy(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer no-print"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
              
              {/* Box de Resumo da Norma & Governança */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Síntese Executiva & Trâmite de Governança:
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {viewingPolicy.description}
                </p>
                <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-500">
                  {viewingPolicy.approvedAt && (
                    <span>Data de Aprovação: <strong>{viewingPolicy.approvedAt}</strong></span>
                  )}
                  {viewingPolicy.minuteSessionCode && (
                    <span>Ata da Sessão: <strong>{viewingPolicy.minuteSessionCode}</strong></span>
                  )}
                  {viewingPolicy.nextReviewDate && (
                    <span>Próxima Revisão: <strong>{viewingPolicy.nextReviewDate}</strong></span>
                  )}
                  {viewingPolicy.authorName && (
                    <span>Proponente: <strong>{viewingPolicy.authorName}</strong></span>
                  )}
                </div>
              </div>

              {/* Texto Normativo Formatado em HTML / Markdown (com Fotos posicionadas no fluxo) */}
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm">
                {viewingPolicy.contentMarkdown.includes('<') ? (
                  <div 
                    className="leading-relaxed space-y-4 font-normal text-slate-800 dark:text-slate-200"
                    dangerouslySetInnerHTML={{ __html: viewingPolicy.contentMarkdown }} 
                  />
                ) : (
                  <ReactMarkdown>{viewingPolicy.contentMarkdown}</ReactMarkdown>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between no-print">
              <span className="text-[11px] text-slate-400">
                Documento Institucional Auditado • RGR Facilities
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const originalTitle = document.title;
                    document.title = `${viewingPolicy.code} - ${viewingPolicy.title}`;
                    document.body.classList.add('printing-single-doc');
                    window.print();
                    setTimeout(() => {
                      document.title = originalTitle;
                      document.body.classList.remove('printing-single-doc');
                    }, 1000);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Gerar PDF / Imprimir</span>
                </button>
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
        </div>
      )}

      {/* Modal: Cadastro & Edição de Proposta / Minuta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingPolicy ? 'Editar Minuta de Política' : 'Elaborar Minuta de Política Corporativa'}
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
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Versão Proposta</label>
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
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Colegiado Competente para Aprovar</label>
                  <select
                    value={formData.targetApproverBody}
                    onChange={(e) => setFormData({ ...formData, targetApproverBody: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <option value="CONS-ADM">Conselho de Administração (CONS-ADM)</option>
                    <option value="COM-FIN">Comitê de Resultados & Finanças (COM-FIN)</option>
                    <option value="COM-CLI">Comitê de Gestão de Clientes & Qualidade (COM-CLI)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Proponente / Relator</label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="Nome do diretor proponente..."
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                  />
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

              {/* Anexar Imagens / Fotos de Apoio */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2">
                <label className="text-slate-700 dark:text-slate-300 font-semibold block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Upload Real de Fotos & Anexos (PNG, JPG, PDF)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Selecione direto do seu computador
                  </span>
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-xs flex items-center justify-center gap-2 cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>Clique para escolher uma imagem do seu dispositivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          if (base64) {
                            setImagesList(prev => [
                              ...prev,
                              { id: `img-${Date.now()}`, url: base64, caption: file.name }
                            ]);
                          }
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.imageCaption}
                      onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                      placeholder="Legenda da imagem..."
                      className="w-44 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {imagesList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {imagesList.map(img => (
                      <div key={img.id} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg">
                        <img src={img.url} alt="Miniatura" className="w-5 h-5 rounded object-cover border border-slate-300" />
                        <span className="text-[10px] truncate max-w-[120px]">{img.caption || 'Imagem'}</span>
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

              {/* Editor Rico WYSIWYG com Formatação e Upload Real de Fotos */}
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold block flex items-center justify-between">
                  <span>Conteúdo Normativo da Política (Texto Oficial Formatado)</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Negrito, Títulos, Fontes, Alinhamento, Cores e Imagens
                  </span>
                </label>
                <RichTextEditor
                  value={formData.contentMarkdown}
                  onChange={(html) => setFormData({ ...formData, contentMarkdown: html })}
                  placeholder="Redija o texto oficial com artigos, regras, alíneas e insira imagens reais..."
                  minHeight="320px"
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
                  Salvar Minuta
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal de Homologação em Sessão (Aprovação Formal com Ata) */}
      {approvingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Homologar & Publicar Política em Sessão
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setApprovingPolicy(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                <span className="font-bold block text-sm">
                  {approvingPolicy.code}: {approvingPolicy.title}
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block mt-0.5">
                  Ao homologar, esta política torna-se <strong>oficialmente publicada e vigente</strong> em toda a RGR Facilities.
                </span>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  Código da Ata Homologada
                </label>
                <input
                  type="text"
                  value={approvalMinuteCode}
                  onChange={(e) => setApprovalMinuteCode(e.target.value.toUpperCase())}
                  required
                  placeholder="Ex: SES-01/2026"
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  Parecer da Mesa Deliberadora
                </label>
                <textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Registre o parecer ou condições da homologação..."
                  className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setApprovingPolicy(null)}
                  className="px-3.5 py-1.5 text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Homologar & Publicar Norma</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
