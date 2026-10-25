'use client';

import React, { useState } from 'react';
import { X, Check, Save, Plus, Trash2, ShieldCheck, Briefcase } from 'lucide-react';
import { OperationalRole, RoleProfile, RoleResponsibilityGroup } from '@/lib/types';
import { getDefaultRoleProfile } from '@/lib/default-profiles';

interface EditRoleProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: OperationalRole;
  onProfileSaved: (updatedRole: OperationalRole) => void;
}

export const EditRoleProfileModal: React.FC<EditRoleProfileModalProps> = ({
  isOpen,
  onClose,
  role,
  onProfileSaved
}) => {
  const currentProfile = getDefaultRoleProfile(role);

  const [positionTitle, setPositionTitle] = useState(currentProfile.positionTitle || role.title);
  const [department, setDepartment] = useState(currentProfile.department || role.department);
  const [directReport, setDirectReport] = useState(currentProfile.directReport || 'Diretoria Executiva / CEO');
  const [unionAffiliation, setUnionAffiliation] = useState(currentProfile.unionAffiliation || 'CCT SIEMACO Paraná (Setor de Asseio, Conservação e Facilities)');
  const [contractType, setContractType] = useState(currentProfile.contractType || 'CLT – Efetivo');
  const [workSchedule, setWorkSchedule] = useState(currentProfile.workSchedule || 'Segunda a Sexta-feira, das 08:00 às 17:48 (com 1h de intervalo)');
  const [workMode, setWorkMode] = useState(currentProfile.workMode || 'Presencial (Base Operacional)');
  const [mission, setMission] = useState(currentProfile.mission || '');

  // Responsibilities
  const [responsibilities, setResponsibilities] = useState<RoleResponsibilityGroup[]>(
    currentProfile.responsibilities && currentProfile.responsibilities.length > 0
      ? currentProfile.responsibilities
      : [{ category: 'Atribuições Principais', items: ['Executar a rotina padrão homologada no RGR.'] }]
  );

  // Competencies
  const [requirementsText, setRequirementsText] = useState(
    currentProfile.competencies?.requirements?.join('\n') || ''
  );
  const [hardSkillsText, setHardSkillsText] = useState(
    currentProfile.competencies?.hardSkills?.join('\n') || ''
  );
  const [softSkillsText, setSoftSkillsText] = useState(
    currentProfile.competencies?.softSkills?.join('\n') || ''
  );

  // SLAs
  const [slasText, setSlasText] = useState(
    currentProfile.nonNegotiableSlas?.join('\n') || ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddResponsibilityGroup = () => {
    setResponsibilities(prev => [
      ...prev,
      { category: 'Novo Macro-Processo', items: ['Nova atribuição do cargo...'] }
    ]);
  };

  const handleUpdateCategoryName = (groupIndex: number, newName: string) => {
    setResponsibilities(prev => {
      const copy = [...prev];
      copy[groupIndex] = { ...copy[groupIndex], category: newName };
      return copy;
    });
  };

  const handleAddItemToGroup = (groupIndex: number) => {
    setResponsibilities(prev => {
      const copy = [...prev];
      copy[groupIndex] = {
        ...copy[groupIndex],
        items: [...copy[groupIndex].items, 'Nova responsabilidade...']
      };
      return copy;
    });
  };

  const handleUpdateItem = (groupIndex: number, itemIndex: number, value: string) => {
    setResponsibilities(prev => {
      const copy = [...prev];
      const items = [...copy[groupIndex].items];
      items[itemIndex] = value;
      copy[groupIndex] = { ...copy[groupIndex], items };
      return copy;
    });
  };

  const handleRemoveItem = (groupIndex: number, itemIndex: number) => {
    setResponsibilities(prev => {
      const copy = [...prev];
      copy[groupIndex] = {
        ...copy[groupIndex],
        items: copy[groupIndex].items.filter((_, i) => i !== itemIndex)
      };
      return copy;
    });
  };

  const handleRemoveGroup = (groupIndex: number) => {
    setResponsibilities(prev => prev.filter((_, i) => i !== groupIndex));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedProfile: RoleProfile = {
        roleId: role.id,
        positionTitle: positionTitle.trim() || role.title,
        department: department.trim() || role.department,
        directReport: directReport.trim(),
        unionAffiliation: unionAffiliation.trim(),
        contractType: contractType.trim(),
        workSchedule: workSchedule.trim(),
        workMode: workMode.trim(),
        mission: mission.trim(),
        responsibilities: responsibilities.map(g => ({
          category: g.category.trim(),
          items: g.items.map(it => it.trim()).filter(Boolean)
        })).filter(g => g.items.length > 0),
        competencies: {
          requirements: requirementsText.split('\n').map(s => s.trim()).filter(Boolean),
          hardSkills: hardSkillsText.split('\n').map(s => s.trim()).filter(Boolean),
          softSkills: softSkillsText.split('\n').map(s => s.trim()).filter(Boolean)
        },
        nonNegotiableSlas: slasText.split('\n').map(s => s.trim()).filter(Boolean),
        updatedAt: new Date().toISOString()
      };

      const res = await fetch(`/api/roles/${role.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updatedProfile })
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar perfil da cadeira');
      }

      const updatedRole = await res.json();
      onProfileSaved({ ...updatedRole, profile: updatedProfile });
      onClose();
    } catch (err) {
      console.error('Error saving role profile:', err);
      alert('Erro ao salvar as alterações do perfil da cadeira.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-800 dark:text-slate-100 my-6 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
              {role.code || 'CAD'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Editar Perfil da Cadeira • {role.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure os requisitos formais, CCT sindical, responsabilidades e competências exigidas para esta cadeira.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. Identificação da Posição */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
              1. Identificação da Posição & Enquadramento
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Título Formal do Cargo
                </label>
                <input
                  type="text"
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Departamento / Diretoria
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Reporte Direto (Hierarquia)
                </label>
                <input
                  type="text"
                  value={directReport}
                  onChange={(e) => setDirectReport(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Enquadramento Sindical
                </label>
                <input
                  type="text"
                  value={unionAffiliation}
                  onChange={(e) => setUnionAffiliation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="Ex: CCT SIEMACO Paraná (Asseio e Conservação)"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Regime de Contratação
                </label>
                <input
                  type="text"
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="Ex: CLT – Efetivo"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Modalidade de Trabalho
                </label>
                <input
                  type="text"
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="Ex: Presencial (Base Operacional)"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Jornada de Trabalho e Intervalo
              </label>
              <input
                type="text"
                value={workSchedule}
                onChange={(e) => setWorkSchedule(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Ex: Segunda a Sexta-feira, das 08:00 às 17:48 (com 1h de intervalo)"
              />
            </div>
          </div>

          {/* 2. Missão e Objetivo da Cadeira */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
              2. Missão & Objetivo da Cadeira
            </h4>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed font-sans"
              placeholder="Descreva a razão de existir deste cargo e o que ele blinda no negócio..."
              required
            />
          </div>

          {/* 3. Responsabilidades e Atribuições */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                3. Principais Responsabilidades & Atribuições (Macro-processos)
              </h4>
              <button
                type="button"
                onClick={handleAddResponsibilityGroup}
                className="text-xs text-atlas-600 dark:text-atlas-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Grupo</span>
              </button>
            </div>

            <div className="space-y-4">
              {responsibilities.map((group, gIdx) => (
                <div key={gIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={group.category}
                      onChange={(e) => handleUpdateCategoryName(gIdx, e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                      placeholder="Nome do Macro-processo (ex: Gestão de Ponto e Contingência)"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(gIdx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Excluir grupo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 pl-2">
                    {group.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-start gap-2">
                        <span className="text-slate-400 text-xs mt-1.5">•</span>
                        <textarea
                          value={item}
                          onChange={(e) => handleUpdateItem(gIdx, iIdx, e.target.value)}
                          rows={2}
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(gIdx, iIdx)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-md mt-1"
                          title="Remover item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddItemToGroup(gIdx)}
                      className="text-[11px] text-atlas-600 dark:text-atlas-400 hover:underline flex items-center gap-1 font-medium pt-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar item de responsabilidade</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Matriz de Competências & Habilidades */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
              4. Matriz de Competências & Habilidades (Requisitos)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Requisitos Formais (1 por linha)
                </label>
                <textarea
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed font-sans"
                  placeholder="Ensino Médio completo&#10;Experiência de 1+ ano em facilities..."
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Hard Skills Técnicas (1 por linha)
                </label>
                <textarea
                  value={hardSkillsText}
                  onChange={(e) => setHardSkillsText(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed font-sans"
                  placeholder="Apuração de ponto biométrico&#10;CCT SIEMACO&#10;Controle de EPIs..."
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Soft Skills Comportamentais (1 por linha)
                </label>
                <textarea
                  value={softSkillsText}
                  onChange={(e) => setSoftSkillsText(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed font-sans"
                  placeholder="Resiliência sob pressão&#10;Comunicação assertiva&#10;Senso de urgência..."
                />
              </div>
            </div>
          </div>

          {/* 5. SLAs Inegociáveis */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
              5. Entregáveis & SLAs Inegociáveis (1 por linha)
            </h4>
            <textarea
              value={slasText}
              onChange={(e) => setSlasText(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed font-sans"
              placeholder="100% dos postos cobertos até as 07:30;&#10;Ponto D-1 auditado até as 09:30..."
            />
          </div>

          {/* Footer Actions inside form */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-atlas-600 hover:bg-atlas-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Perfil da Cadeira'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
