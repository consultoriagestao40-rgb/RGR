'use client';

import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Building, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Target, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  Edit3, 
  Scale, 
  Award, 
  Layers, 
  ArrowRight,
  ArrowLeft,
  Search,
  HelpCircle
} from 'lucide-react';
import { OperationalRole, RoleProfile } from '@/lib/types';
import { getDefaultRoleProfile } from '@/lib/default-profiles';
import { EditRoleProfileModal } from './EditRoleProfileModal';

interface RoleProfileTabProps {
  roles: OperationalRole[];
  currentRole: OperationalRole | null;
  onSelectRole: (roleId: string) => void;
  onRoleUpdated?: (role: OperationalRole) => void;
  initialDetailRoleId?: string | null;
}

export const RoleProfileTab: React.FC<RoleProfileTabProps> = ({
  roles,
  currentRole,
  onSelectRole,
  onRoleUpdated,
  initialDetailRoleId = null
}) => {
  // Quando detailRoleId for null, mostra a lista/grid com todas as cadeiras (como antes).
  // Ao clicar em "Editar", detailRoleId é preenchido com a cadeira selecionada e abre "essa tela atual".
  const [detailRoleId, setDetailRoleId] = useState<string | null>(initialDetailRoleId);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setDetailRoleId(initialDetailRoleId);
  }, [initialDetailRoleId]);

  const activeRole = useMemo(() => {
    if (detailRoleId) {
      return roles.find(r => r.id === detailRoleId) || currentRole || roles[0];
    }
    return currentRole || roles[0];
  }, [roles, detailRoleId, currentRole]);

  const profile: RoleProfile = useMemo(() => {
    if (!activeRole) {
      return getDefaultRoleProfile(roles[0]);
    }
    return getDefaultRoleProfile(activeRole);
  }, [activeRole, roles]);

  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return roles;
    const term = searchTerm.toLowerCase();
    return roles.filter(r => {
      const p = getDefaultRoleProfile(r);
      const hardSkillsMatch = p.competencies?.hardSkills?.some(h => h.toLowerCase().includes(term));
      const softSkillsMatch = p.competencies?.softSkills?.some(s => s.toLowerCase().includes(term));
      return (
        r.title.toLowerCase().includes(term) ||
        (r.code && r.code.toLowerCase().includes(term)) ||
        r.department.toLowerCase().includes(term) ||
        (r.description && r.description.toLowerCase().includes(term)) ||
        (p.unionAffiliation && p.unionAffiliation.toLowerCase().includes(term)) ||
        hardSkillsMatch ||
        softSkillsMatch
      );
    });
  }, [roles, searchTerm]);

  const handleCopyProfileText = () => {
    if (!activeRole || !profile) return;

    const responsibilitiesText = profile.responsibilities
      .map(g => `\n### ${g.category}\n` + g.items.map(it => `- ${it}`).join('\n'))
      .join('\n');

    const fullDossier = `=====================================================
RGR • PERFIL DA CADEIRA OPERACIONAL
=====================================================
Cadeira: ${activeRole.title} (${activeRole.code || 'CAD'})
Departamento: ${profile.department}
Reporte Direto: ${profile.directReport}
Enquadramento Sindical: ${profile.unionAffiliation || 'N/A'}
Regime de Contratação: ${profile.contractType || 'CLT'}
Jornada de Trabalho: ${profile.workSchedule || 'N/A'}
Modalidade: ${profile.workMode || 'Presencial'}

1. MISSÃO E OBJETIVO DA CADEIRA
${profile.mission}

2. PRINCIPAIS RESPONSABILIDADES E ATRIBUIÇÕES
${responsibilitiesText}

3. MATRIZ DE COMPETÊNCIAS & HABILIDADES
REQUISITOS FORMAIS:
${profile.competencies.requirements.map(r => `• ${r}`).join('\n')}

HARD SKILLS (TÉCNICAS):
${profile.competencies.hardSkills.map(h => `• ${h}`).join('\n')}

SOFT SKILLS (COMPORTAMENTO):
${profile.competencies.softSkills.map(s => `• ${s}`).join('\n')}

4. ENTREGÁVEIS & SLAS INE GOCIÁVEIS:
${(profile.nonNegotiableSlas || []).map(sla => `[SLA] ${sla}`).join('\n')}
=====================================================`;

    navigator.clipboard.writeText(fullDossier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getExportTitle = () => {
    if (!activeRole) return 'Perfil da Cadeira';
    const chairName = profile.positionTitle?.trim() || activeRole.title;
    const cleanCode = activeRole.code ? ` (${activeRole.code})` : '';
    return `${chairName}${cleanCode} - Perfil da Cadeira`;
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = getExportTitle();
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  // Suporte a atalhos de teclado como Cmd+P / Ctrl+P
  React.useEffect(() => {
    const handleBeforePrint = () => {
      if (detailRoleId) {
        document.title = getExportTitle();
      }
    };
    const handleAfterPrint = () => {
      document.title = 'RGR - Gerenciamento da Rotina & Facilities';
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [activeRole, profile.positionTitle, detailRoleId]);

  if (!roles || roles.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        Nenhuma cadeira cadastrada no sistema.
      </div>
    );
  }

  // TELA DE TODAS AS CADEIRAS (Visão geral de todas as cadeiras como antes)
  if (!detailRoleId) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Banner */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Governança & Padrões
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                Matriz Homologada de Funções
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Perfil das Cadeiras Operacionais
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Matriz de competências (Hard/Soft Skills), enquadramento sindical, missão e atribuições. Clique em <strong>Editar</strong> em qualquer cadeira para abrir o dossiê detalhado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {roles.length} {roles.length === 1 ? 'Cadeira' : 'Cadeiras'}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cadeira por código, título, departamento ou competência..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-xs"
          />
        </div>

        {/* Grid de Todas as Cadeiras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map(role => {
            const rProfile = getDefaultRoleProfile(role);
            const isActive = role.id === (currentRole?.id);

            return (
              <div
                key={role.id}
                className={`bg-white dark:bg-[#111827] border rounded-xl p-5 text-xs flex flex-col justify-between shadow-xs transition-all hover:shadow-md ${
                  isActive 
                    ? 'border-atlas-500/80 dark:border-atlas-600 ring-1 ring-atlas-500/20' 
                    : 'border-slate-200/90 dark:border-[#1e293b] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Code + Active Badge + Edit Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800">
                        {role.code || 'CAD-01'}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/80">
                          Cadeira Ativa
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setDetailRoleId(role.id);
                        onSelectRole(role.id);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Editar Perfil da Cadeira"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Editar</span>
                    </button>
                  </div>

                  {/* Title & Department */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {role.title}
                    </h3>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium block mt-0.5">
                      {role.department}
                    </span>
                  </div>

                  {/* Enquadramento Sindical */}
                  {rProfile.unionAffiliation && (
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        <Scale className="w-3 h-3 text-slate-400" />
                        <span>Enquadramento Sindical</span>
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                        {rProfile.unionAffiliation}
                      </span>
                    </div>
                  )}

                  {/* Description / Mission */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {rProfile.mission || role.description}
                  </p>

                  {/* Hard Skills Preview */}
                  {rProfile.competencies?.hardSkills && rProfile.competencies.hardSkills.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Hard Skills Principais:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {rProfile.competencies.hardSkills.slice(0, 3).map((hs, i) => (
                          <span 
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[210px]"
                          >
                            {hs}
                          </span>
                        ))}
                        {rProfile.competencies.hardSkills.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-mono">
                            +{rProfile.competencies.hardSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setDetailRoleId(role.id);
                      onSelectRole(role.id);
                    }}
                    className="flex-1 py-1.5 px-3 bg-atlas-600 hover:bg-atlas-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer group"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Perfil</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      setDetailRoleId(role.id);
                      onSelectRole(role.id);
                    }}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Ver Dossiê
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // TELA DETALHADA ("ESSA TELA ATUAL" AO CLICAR EM EDITAR)
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner (Hidden in Print) */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors no-print">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDetailRoleId(null)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Voltar para a lista de todas as cadeiras"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Todas as Cadeiras</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {activeRole.code || 'CAD-01'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Dossiê de Governança & Requisitos de Função
            </span>
          </div>

          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Perfil da Cadeira: {activeRole.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Matriz de competências (Hard/Soft Skills), enquadramento sindical, missão e atribuições homologadas pela Diretoria.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chair Selector */}
          <div className="relative">
            <select
              value={activeRole.id}
              onChange={(e) => {
                setDetailRoleId(e.target.value);
                onSelectRole(e.target.value);
              }}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 pr-8 cursor-pointer"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.code || 'CAD'})
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-2.5 pointer-events-none text-slate-400 text-xs">
              ▾
            </div>
          </div>

          <button
            onClick={handleCopyProfileText}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copiar texto formatado do perfil"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Editar informações do perfil"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Editar Perfil</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-atlas-600 hover:bg-atlas-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Imprimir documento oficial em A4 ou salvar como PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir A4 / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Sheet (Printable Target) */}
      <div 
        id="printable-role-profile"
        className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-xs text-slate-800 dark:text-slate-200 space-y-7 transition-colors"
      >
        
        {/* Print-Only Formal Letterhead */}
        <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs font-mono tracking-tight text-center px-1">
              {activeRole.code || 'CAD'}
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                {profile.positionTitle || activeRole.title}
              </h1>
              <p className="text-[11px] text-slate-600">
                Perfil de Função & Requisitos de Governança • Facilities Brasil S.A.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">CÓDIGO DA CADEIRA</span>
            <span className="text-sm font-mono font-bold text-slate-900">{activeRole.code || 'CAD-01'}</span>
          </div>
        </div>

        {/* Section Header: Role Big Badge & Title */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-atlas-50 dark:bg-atlas-950 text-atlas-700 dark:text-atlas-300 border border-atlas-200 dark:border-atlas-800">
                {activeRole.code || 'CAD'}
              </span>
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                Perfil de Função Homologado
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {profile.positionTitle || activeRole.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Departamento: <span className="font-semibold text-slate-700 dark:text-slate-300">{profile.department}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shrink-0 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Reporte Direto</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white font-sans">
              {profile.directReport || 'Diretoria Executiva / CEO'}
            </span>
          </div>
        </div>

        {/* 1. IDENTIFICAÇÃO DA POSIÇÃO */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px]">
              1
            </span>
            <span>Identificação da Posição & Enquadramento</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Título do Cargo</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {profile.positionTitle}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Departamento</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {profile.department}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Reporte Direto</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {profile.directReport}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <Scale className="w-3 h-3 text-slate-400" />
                <span>Enquadramento Sindical</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {profile.unionAffiliation || 'CCT SIEMACO Paraná'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Regime & Modalidade</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {profile.contractType || 'CLT – Efetivo'} • {profile.workMode || 'Presencial'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Jornada de Trabalho</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                {profile.workSchedule || 'Segunda a Sexta-feira, das 08:00 às 17:48 (1h intervalo)'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. MISSÃO E OBJETIVO DA CADEIRA */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px]">
              2
            </span>
            <span>Missão e Objetivo da Cadeira</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-atlas-600 dark:bg-atlas-500" />
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic pl-1">
              &ldquo;{profile.mission}&rdquo;
            </p>
          </div>
        </div>

        {/* 3. PRINCIPAIS RESPONSABILIDADES E ATRIBUIÇÕES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px]">
                3
              </span>
              <span>Principais Responsabilidades & Atribuições (Macro-processos)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {profile.responsibilities.length} Blocos
            </span>
          </div>

          <div className="space-y-4">
            {profile.responsibilities.map((group, gIdx) => (
              <div 
                key={gIdx}
                className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-atlas-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                    {group.category}
                  </h4>
                </div>

                <div className="space-y-2 pl-3">
                  {group.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. MATRIZ DE COMPETÊNCIAS & HABILIDADES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px]">
              4
            </span>
            <span>Matriz de Competências & Habilidades (Requisitos da Cadeira)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Requisitos Formais */}
            <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Requisitos Formais
                </h5>
              </div>
              <div className="space-y-2">
                {profile.competencies.requirements.map((req, rIdx) => (
                  <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hard Skills */}
            <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Hard Skills (Técnicas)
                </h5>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.competencies.hardSkills.map((skill, sIdx) => (
                  <span 
                    key={sIdx}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Soft Skills (Comportamento)
                </h5>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.competencies.softSkills.map((soft, sIdx) => (
                  <span 
                    key={sIdx}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200"
                  >
                    {soft}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 5. ENTREGÁVEIS & SLAS INE GOCIÁVEIS */}
        {profile.nonNegotiableSlas && profile.nonNegotiableSlas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px]">
                5
              </span>
              <span>Entregáveis & SLAs Inegociáveis da Cadeira</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-2">
              {profile.nonNegotiableSlas.map((sla, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span className="font-medium">{sla}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. TERMO DE CIÊNCIA E COMPROMISSO DE GOVERNANÇA */}
        <div className="pt-4 border-t border-slate-200/90 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Termo de Ciência & Acordo de Governança
            </h4>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Declaro ter pleno conhecimento dos requisitos, responsabilidades, competências e entregáveis estabelecidos neste Perfil da Cadeira. Comprometo-me a executar a rotina com disciplina, zelar pela conformidade dos POPs e alimentar o sistema RGR em tempo real.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="border-t border-slate-300 dark:border-slate-700 pt-2 text-center sm:text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Ocupante Responsável pela Cadeira
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {activeRole.title} ({activeRole.code || 'CAD'})
              </p>
            </div>

            <div className="border-t border-slate-300 dark:border-slate-700 pt-2 text-center sm:text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Cristiano Silva (Diretoria Executiva / CEO)
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Homologação RGR • Facilities Brasil S.A.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Role Profile Modal */}
      {isEditModalOpen && (
        <EditRoleProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          role={activeRole}
          onProfileSaved={(updated) => {
            if (onRoleUpdated) onRoleUpdated(updated);
          }}
        />
      )}

    </div>
  );
};
