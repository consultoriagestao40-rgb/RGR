import { OperationalRole } from './types';

export interface RoleMonthlyMilestone {
  periodLabel: string; // Ex: "5º Dia Útil do Mês"
  badgeColor: string; // 'emerald' | 'amber' | 'blue' | 'purple'
  title: string;
  description: string;
}

export interface RoleCalendarDossier {
  headerTitle: string;
  subtitle: string;
  milestones: RoleMonthlyMilestone[];
}

export function getRoleCalendarDossier(role: OperationalRole | null): RoleCalendarDossier {
  if (!role) {
    return {
      headerTitle: 'Calendário Operacional de Fechamentos & Obrigações Mensais',
      subtitle: 'Prazos oficiais e entregas críticas do calendário corporativo.',
      milestones: [
        {
          periodLabel: '5º Dia Útil do Mês',
          badgeColor: 'emerald',
          title: 'Liquidação de Salários & Benefícios',
          description: 'Liberação de pagamentos e benefícios mensais da equipe.'
        },
        {
          periodLabel: 'Todo Dia 20',
          badgeColor: 'amber',
          title: 'Encargos & Obrigações Fiscais',
          description: 'Recolhimento tributário e obrigações acessórias vigentes.'
        },
        {
          periodLabel: 'Dias 25 a 30',
          badgeColor: 'blue',
          title: 'Fechamentos & Apuração Operacional',
          description: 'Consolidação de pontos, medições e variáveis do mês.'
        },
        {
          periodLabel: 'Fim do Mês',
          badgeColor: 'purple',
          title: 'DRE & Resultados Contratuais',
          description: 'Fechamento do resultado financeiro e operacional.'
        }
      ]
    };
  }

  const code = (role.code || '').toUpperCase();
  const title = (role.title || '').toLowerCase();
  const dept = (role.department || '').toLowerCase();

  // 1. HEAD DE OPERAÇÕES & COORDENAÇÃO DE FACILITIES
  if (code.includes('OPE') || code.includes('OPS') || title.includes('opera') || dept.includes('opera')) {
    return {
      headerTitle: `Calendário Operacional & Marcos de Campo: ${role.title}`,
      subtitle: 'Ciclo mensal de auditorias Checklist Fácil, medições de contratos, renovação de químicos e SLA de postos.',
      milestones: [
        {
          periodLabel: 'Dias 01 a 05',
          badgeColor: 'emerald',
          title: 'Alinhamento de Escalas & Insumos',
          description: 'Conferência de 100% dos postos alocados no 1º dia útil e validação de estoques de produtos químicos nos clientes.'
        },
        {
          periodLabel: 'Sextas-Feiras / Semanal',
          badgeColor: 'blue',
          title: 'Auditoria Checklist Fácil (Qualidade)',
          description: 'Consolidação dos checklists fotográficos de vistorias técnicas (meta: ≥92% de conformidade) e planos de retenção.'
        },
        {
          periodLabel: 'Dias 20 a 25',
          badgeColor: 'amber',
          title: 'Medições Físicas & Assinatura de Clientes',
          description: 'Coleta de assinaturas nos relatórios de medição com síndicos/gestores e apuração de glosas antes do faturamento.'
        },
        {
          periodLabel: 'Último Dia Útil',
          badgeColor: 'purple',
          title: 'Fechamento de Diárias & Plantões',
          description: 'Consolidação do custo de diaristas reservas e horas extras de cobertura para envio à Controladoria.'
        }
      ]
    };
  }

  // 2. CONTROLADORIA & FINANÇAS
  if (code.includes('FIN') || title.includes('finan') || title.includes('control') || dept.includes('finan')) {
    return {
      headerTitle: `Calendário Financeiro & Fiscal: ${role.title}`,
      subtitle: 'Prazos oficiais de faturamento, liquidação de tributos federais/municipais, borderôs e apuração de DRE.',
      milestones: [
        {
          periodLabel: 'Dias 01 a 05',
          badgeColor: 'emerald',
          title: 'Emissão de Faturamento & Boletos',
          description: 'Transmissão das NFS-e com retenções fiscais (IR, CSRF, INSS) e envio dos kits de cobrança aos contratantes.'
        },
        {
          periodLabel: 'Todo Dia 20',
          badgeColor: 'amber',
          title: 'Tributos & Encargos (FGTS/DCTFWeb)',
          description: 'Liquidação no borderô das 14:30 das guias de FGTS Digital, DCTFWeb (INSS) e tributos federais retidos.'
        },
        {
          periodLabel: 'Quintas-Feiras',
          badgeColor: 'blue',
          title: 'Auditoria de Cartões & Reembolsos',
          description: 'Conferência de comprovantes fiscais dos cartões corporativos de todas as empresas do grupo.'
        },
        {
          periodLabel: 'Dia 28 ao Fim do Mês',
          badgeColor: 'purple',
          title: 'DRE Previsto x Realizado por Contrato',
          description: 'Apuração da margem líquida real de cada contrato e distribuição de resultados no Comitê de Resultados.'
        }
      ]
    };
  }

  // 3. DEPARTAMENTO PESSOAL & RH
  if (code.includes('DP') || code.includes('RH') || title.includes('pessoal') || title.includes('folha') || dept.includes('pessoal')) {
    return {
      headerTitle: `Calendário Trabalhista & Folha de Pagamento: ${role.title}`,
      subtitle: 'Prazos oficiais da CLT: fechamento de espelho de ponto, folha analítica, benefícios e eSocial.',
      milestones: [
        {
          periodLabel: '5º Dia Útil do Mês',
          badgeColor: 'emerald',
          title: 'Salários Líquidos & Vale-Alimentação (VA)',
          description: 'Liberação do lote bancário de salários e recarga simultânea dos cartões de alimentação/refeição.'
        },
        {
          periodLabel: 'Diário (Até 10 Dias)',
          badgeColor: 'amber',
          title: 'Blindagem de Rescisões CLT',
          description: 'Homologação e quitação de verbas rescisórias rigorosamente dentro do prazo improrrogável de 10 dias da CLT.'
        },
        {
          periodLabel: 'Todo Dia 25',
          badgeColor: 'blue',
          title: 'Fechamento Oficial do Ponto (26 a 25)',
          description: 'Bloqueio de espelhos de ponto, validação de atestados médicos, horas extras e faltas para cálculo da folha.'
        },
        {
          periodLabel: 'Último Dia Útil',
          badgeColor: 'purple',
          title: 'Recarga de Vale-Transporte (VT)',
          description: 'Compra e liberação da recarga de bilhetes de transporte público para o 1º dia útil subsequente.'
        }
      ]
    };
  }

  // Padrão Geral / Outras Cadeiras
  return {
    headerTitle: `Calendário Operacional de Fechamentos: ${role.title}`,
    subtitle: `Marcos de entrega e compromissos periódicos da cadeira ${role.code || 'CAD'}.`,
    milestones: [
      {
        periodLabel: 'Início do Mês (Dias 01 a 05)',
        badgeColor: 'emerald',
        title: 'Planejamento & Abertura de Marcos',
        description: 'Alinhamento dos entregáveis prioritários do mês com a liderança.'
      },
      {
        periodLabel: 'Meio do Mês (Dia 15)',
        badgeColor: 'blue',
        title: 'Revisão Intermediária de Metas',
        description: 'Auditoria do ritmo de cumprimento dos POPs e ritos de despacho.'
      },
      {
        periodLabel: 'Dia 20 a 25',
        badgeColor: 'amber',
        title: 'Apuração e Pré-Fechamento',
        description: 'Consolidação das entregas parciais e saneamento de desvios.'
      },
      {
        periodLabel: 'Fechamento Mensal',
        badgeColor: 'purple',
        title: 'Dossiê Executivo da Cadeira',
        description: 'Validação final de indicadores e prestação de contas com o CEO.'
      }
    ]
  };
}
