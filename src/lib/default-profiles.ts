import { OperationalRole, RoleProfile } from './types';

export const DEFAULT_PROFILES: { [key: string]: RoleProfile } = {
  // Operações & Facilities (Head de Operações / Coordenador / Assistente de Operações)
  'operations': {
    positionTitle: 'Head de Operações & Facilities (Mesa de Operações)',
    department: 'Operações & Facilities',
    directReport: 'Diretoria Executiva / CEO',
    unionAffiliation: 'CCT SIEMACO Paraná (Setor de Asseio, Conservação e Facilities)',
    contractType: 'CLT – Efetivo',
    workSchedule: 'Segunda a Sexta-feira, das 08:00 às 17:48 (com 1h de intervalo)',
    workMode: 'Presencial (Base Operacional)',
    mission: 'Atuar como ponto focal da Mesa de Operações, assegurando a integridade e precisão diária do ponto eletrônico, o cumprimento rigoroso dos processos de Departamento Pessoal (férias, atestados, benefícios, EPIs e desligamentos), a gestão ágil de escalas e coberturas de faltas (diaristas e banco de reserva), a condução de processos seletivos operacionais e o atendimento estruturado aos colaboradores de campo.',
    responsibilities: [
      {
        category: 'Gestão de Ponto e Contingência Operacional',
        items: [
          'Auditar diariamente as marcações de ponto (D-1), ajustando inconsistências, batidas ímpares e registrando faltas injustificadas até as 09:30.',
          'Acionar e lançar coberturas de faltas emergenciais utilizando a equipe volante, banco de reserva ou diaristas, garantindo a imputação dos valores para rateio de custos por contrato.',
          'Recepcionar, auditar e lançar atestados médicos no sistema, acompanhando prazos de afastamentos legais e comunicando substituições imediatas ao cliente.'
        ]
      },
      {
        category: 'Conformidade Trabalhista e Documental',
        items: [
          'Controlar a entrega e devolução de uniformes e EPIs, mantendo fichas de controle atualizadas e assinadas (com registro de Certificado de Aprovação - CA).',
          'Emitir mensalmente os espelhos de ponto e recibos de pagamento (holerites), coordenando a coleta e o arquivo formal das assinaturas.',
          'Elaborar a escala mensal de férias, emitir os avisos legais com antecedência obrigatória e alinhar coberturas com a coordenação de campo.',
          'Controlar o vencimento e agendamento dos exames médicos periódicos (ASO - Atestado de Saúde Ocupacional).',
          'Iniciar processos rescisórios no sistema (Hub), recolhendo assinaturas de aviso prévio ou cartas de próprio punho em pedidos de demissão e anexando a documentação completa.'
        ]
      },
      {
        category: 'Atendimento ao Colaborador e Gestão de Campo',
        items: [
          'Prestar atendimento humanizado e estruturado aos colaboradores de campo para esclarecimento de dúvidas sobre benefícios (VT, VA/VR), holerites e férias.',
          'Conduzir alinhamentos de postura e aplicar medidas disciplinares (advertências e suspensões) conforme POPs homologados pela Diretoria.',
          'Realizar vistorias técnicas e auditorias de qualidade in loco com checklist fotográfico na ferramenta Checklist Fácil, gerando relatórios de conformidade.'
        ]
      }
    ],
    competencies: {
      requirements: [
        'Ensino Médio completo ou Superior cursando em Administração, Gestão de RH, Processos Gerenciais ou Logística.',
        'Experiência prévia comprovada mínima de 1 a 2 anos em empresas prestadoras de serviços terceirizados / facilities / asseio e conservação.',
        'Disponibilidade para início imediato e rotina operacional presencial na base corporativa.'
      ],
      hardSkills: [
        'Apuração e tratamento de ponto eletrônico (sistemas biométricos e mobile)',
        'Conhecimento prático da Convenção Coletiva (CCT SIEMACO) e CLT básica',
        'Controle de fichas de EPIs e Certificados de Aprovação (CA)',
        'Gestão de escalas de folgas 5x2, 6x1 e 12x36',
        'Domínio de planilhas Excel (intermediário para escalas e rateios)',
        'Utilização da plataforma Checklist Fácil para vistorias de campo'
      ],
      softSkills: [
        'Resiliência emocional sob forte pressão de contingência e faltas matinais',
        'Comunicação assertiva, firme e empática com encarregados e colaboradores',
        'Senso de urgência e foco absoluto em pontualidade de abertura de postos',
        'Disciplina de rotina e capacidade de seguir cronogramas rígidos de entrega',
        'Postura ética, discrição e confidencialidade com dados trabalhistas'
      ]
    },
    nonNegotiableSlas: [
      '100% dos postos de trabalho cobertos até as 07:30 da manhã;',
      'Auditoria de ponto D-1 concluída diariamente até as 09:30;',
      'Fichas de EPI e uniformes assinadas com registro de CA para 100% dos colaboradores ativos;',
      'Vistorias presenciais com Checklist Fácil executadas semanalmente em todos os contratos críticos.'
    ]
  },

  // Departamento Pessoal & Folha (DP)
  'dp': {
    positionTitle: 'Analista de Departamento Pessoal & Relações Trabalhistas',
    department: 'Departamento Pessoal & Relações Trabalhistas',
    directReport: 'Diretoria Executiva / CEO',
    unionAffiliation: 'CCT SIEMACO Paraná (Asseio e Conservação)',
    contractType: 'CLT – Efetivo',
    workSchedule: 'Segunda a Sexta-feira, das 08:00 às 17:48 (com 1h de intervalo)',
    workMode: 'Presencial (Base Operacional)',
    mission: 'Garantir a blindagem jurídica e conformidade trabalhista integral da folha de pagamento de todos os contratos de facilities, assegurando o cumprimento impecável dos prazos legais da CLT (especialmente rescisões no prazo improrrogável de 10 dias e fechamento de ponto até o dia 25), compra e recarga de benefícios sem atraso e gestão de passivos trabalhistas.',
    responsibilities: [
      {
        category: 'Gestão de Ponto e Folha de Pagamento',
        items: [
          'Conferir diariamente atestados médicos, afastamentos INSS e batidas biométricas.',
          'Consolidar o fechamento oficial do período de ponto no dia 25 de cada mês, apurando horas extras, faltas, DSR, adicional noturno e insalubridade.',
          'Processar a folha de pagamento e emitir guias de recolhimento de encargos (eSocial, DCTFWeb, FGTS Digital e DARF Previdenciário).'
        ]
      },
      {
        category: 'Rescisões Trabalhistas e Blindagem do Art. 477 CLT',
        items: [
          'Acompanhar diariamente o pipeline de desligamentos e pedidos de demissão.',
          'Efetuar cálculos rescisórios, gerar TRCT, guias GRRF e chave de conectividade social para saque do FGTS.',
          'Garantir a liquidação bancária do acerto rescisório rigorosamente dentro do prazo limite de 10 dias corridos da CLT, com zero multas rescisórias.'
        ]
      },
      {
        category: 'Gestão de Benefícios e Crédito aos Colaboradores',
        items: [
          'Calcular, comprar e disponibilizar a recarga do Vale Transporte (VT) no último dia útil do mês.',
          'Processar e validar os arquivos de crédito de Vale Alimentação/Refeição (VA/VR) e salários para pagamento no 5º dia útil.',
          'Acompanhar homologações sindicais junto ao SIEMACO e prestar suporte jurídico/trabalhista preventivo.'
        ]
      }
    ],
    competencies: {
      requirements: [
        'Ensino Superior completo ou em fase final em Ciências Contábeis, Administração ou Gestão de Recursos Humanos.',
        'Experiência consolidada mínima de 2 anos em Departamento Pessoal em empresas com alto volume de mão de obra terceirizada.',
        'Domínio aprofundado da legislação trabalhista (CLT), Convenções Coletivas e rotinas de eSocial.'
      ],
      hardSkills: [
        'Cálculos avançados de rescisão contratual, férias, 13º salário e médias salariais',
        'Domínio pleno das plataformas eSocial, DCTFWeb e FGTS Digital',
        'Apuração e auditoria de espelhos de ponto eletrônico portaria 671',
        'Conhecimento das cláusulas econômicas e sociais da CCT SIEMACO',
        'Sistemas ERP de folha de pagamento e Excel para conciliação'
      ],
      softSkills: [
        'Atenção extrema a detalhes, números e cronogramas fiscais/trabalhistas',
        'Postura ética inabalável, integridade e discrição no tratamento de salários',
        'Agilidade e senso de prioridade na liquidação de rescisões urgentes',
        'Capacidade de comunicação didática e empática no atendimento a colaboradores'
      ]
    },
    nonNegotiableSlas: [
      'Zero multas do Art. 477 da CLT por atraso em quitação rescisória;',
      'Fechamento do espelho de ponto concluído pontualmente todo dia 25;',
      'Crédito de VT efetuado no último dia útil e salários/VA no 5º dia útil sem falhas.'
    ]
  },

  // Controladoria & Finanças
  'finance': {
    positionTitle: 'Coordenador de Controladoria, Finanças & Resultados',
    department: 'Controladoria, Finanças & Resultados',
    directReport: 'Diretoria Executiva / CEO',
    unionAffiliation: 'Sindicato das Empresas de Asseio e Conservação',
    contractType: 'CLT – Efetivo / PJ',
    workSchedule: 'Segunda a Sexta-feira, das 08:00 às 17:48',
    workMode: 'Presencial (Matriz Operacional)',
    mission: 'Blindar o fluxo de caixa corporativo, assegurar a liquidez das operações de campo, auditar custos operacionais (químicos, uniformes, diárias e combustíveis), executar o faturamento com 100% de precisão de NFS-e, manter o contas a pagar no DDA auditado para liberação diária com o CEO e apurar o DRE real por contrato.',
    responsibilities: [
      {
        category: 'Faturamento, Medições e Contas a Receber',
        items: [
          'Conferir medições operacionais de postos e emitir notas fiscais de serviços (NFS-e) com retenções tributárias corretas (IRRF, CSRF, INSS, ISSQN).',
          'Gerar e registrar boletos bancários no DDA com envio formal aos clientes contratantes.',
          'Executar a conciliação bancária diária de entradas e manter régua ativa de cobrança de inadimplência.'
        ]
      },
      {
        category: 'Contas a Pagar, DDA e Tesouraria',
        items: [
          'Auditar todos os boletos e lançamentos do DDA contra notas fiscais e pedidos de compra aprovados (químicos, descartáveis, manutenções).',
          'Preparar o borderô diário de pagamentos e apresentar à Diretoria Executiva às 14:30 para autorização expressa no internet banking.',
          'Auditar semanalmente despesas de cartões corporativos, adiantamentos e quilometragem de supervisores.'
        ]
      },
      {
        category: 'Controladoria, Tributos e DRE por Contrato',
        items: [
          'Auditar e liquidar guias de retenções e tributos municipais/federais todo dia 20.',
          'Apurar mensalmente o DRE Gerencial consolidado e detalhado por Contrato, avaliando margens de contribuição e glosas operacionais.',
          'Conduzir análises de custos de mão de obra direta (MOD) vs. faturamento para subsidiar repactuações contratuais.'
        ]
      }
    ],
    competencies: {
      requirements: [
        'Superior completo em Ciências Contábeis, Controladoria, Finanças ou Administração.',
        'Experiência prévia mínima de 3 anos em controladoria ou gestão financeira em empresas do setor de serviços.',
        'Conhecimento sólido de tributação de serviços tomados/prestados e conciliação bancária.'
      ],
      hardSkills: [
        'Retenções tributárias na fonte (IRRF, CSRF 4,65%, INSS 11%, ISSQN retido)',
        'Conciliação bancária diária e operação de sistemas DDA',
        'Elaboração de DRE Gerencial, fluxo de caixa direto e indireto',
        'Domínio de ERPs financeiros (Conta Azul, Omie, Totvs, SAP) e Excel avançado',
        'Análise de viabilidade e precificação de contratos de facilities'
      ],
      softSkills: [
        'Austeridade, firmeza e conservadorismo fiscal na guarda do caixa corporativo',
        'Comunicação polida e assertiva no relacionamento com clientes e fornecedores',
        'Visão estratégica e analítica para identificação de vazamentos de custos',
        'Organização documental impecável para suporte a auditorias e contabilidade externa'
      ]
    },
    nonNegotiableSlas: [
      '100% das medições faturadas com NFS-e enviadas aos clientes nos prazos contratuais;',
      'Zero juros ou títulos protestados por falha de liberação no DDA;',
      'Conciliação bancária diária 100% zerada até as 17:00;',
      'DRE Gerencial por contrato apresentado à Diretoria até o 10º dia útil.'
    ]
  }
};

export function getDefaultRoleProfile(role: OperationalRole): RoleProfile {
  if (role.profile) {
    return role.profile;
  }

  const code = (role.code || '').toLowerCase();
  const title = (role.title || '').toLowerCase();
  const dept = (role.department || '').toLowerCase();

  let baseKey = 'operations';
  if (code.includes('fin') || title.includes('finan') || title.includes('control') || dept.includes('finan')) {
    baseKey = 'finance';
  } else if (code.includes('dp') || code.includes('rh') || title.includes('pessoal') || title.includes('folha') || dept.includes('pessoal')) {
    baseKey = 'dp';
  }

  const template = DEFAULT_PROFILES[baseKey];

  return {
    ...template,
    roleId: role.id,
    positionTitle: role.title,
    department: role.department,
    updatedAt: role.createdAt || new Date().toISOString()
  };
}
