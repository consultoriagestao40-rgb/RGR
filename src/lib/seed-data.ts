import { OperationalRole, RoutineBlock, DailyRitual, GovernanceMinute, SystemUser } from './types';

export const INITIAL_ROLES: OperationalRole[] = [
  {
    id: "role-fin-01",
    code: "CAD-FIN-01",
    title: "Auxiliar Financeiro",
    department: "Controladoria & Finanças",
    description: "Cadeira de controle e tesouraria diária responsável pelo fluxo de caixa, borderô de pagamentos a fornecedores de Facilities, faturamento de contratos corporativos e prestação de contas matinal à Diretoria.",
    createdAt: new Date().toISOString()
  },
  {
    id: "role-rh-02",
    code: "CAD-DP-02",
    title: "Auxiliar RH/DP",
    department: "Recursos Humanos & Departamento Pessoal",
    description: "Cadeira responsável pela garantia da escala de efetivo nos postos de clientes corporativos, controle de faltas, acionamento tempestivo de diaristas volantes e tratamento diário de atestados e horas extras.",
    createdAt: new Date().toISOString()
  },
  {
    id: "role-ops-03",
    code: "CAD-OPS-03",
    title: "Coordenador de Operações",
    department: "Diretoria de Operações & Facilities",
    description: "Cadeira de supervisão técnica com foco em conformidade operacional dos postos de trabalho, auditorias de qualidade in loco com checklist fotográfico e gestão de suprimentos e equipamentos químicos.",
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_BLOCKS: RoutineBlock[] = [
  // --- AUXILIAR FINANCEIRO ---
  {
    id: "block-fin-01",
    roleId: "role-fin-01",
    code: "POP-FIN-001",
    version: "v2.1",
    homologatedBy: "Diretoria Financeira / CFO",
    timeWindow: "08:00 - 08:30",
    title: "DDA Bancário, Contas a Pagar e Montagem do Borderô",
    deliverable: "Lote de pagamentos consolidado no Conta Azul de Bolso com valor total e comprovantes indexados",
    frequency: "daily",
    orderIndex: 1,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-FIN-001
**Cadeira:** Auxiliar Financeiro | **Versão:** 2.1 | **Homologado por:** CFO / Governança Corporativa

---

#### 1. Objetivo Institucional
Assegurar a total rastreabilidade das liquidações financeiras da empresa de Facilities, eliminando pagamentos fora de prazo, juros desnecessários e garantindo que todo desembolso possua aprovação prévia em lote pela Diretoria.

#### 2. Roteiro de Execução Operacional
1. **Abertura de Canais Bancários (08:00):**
   - Conectar com token corporativo aos canais de internet banking (*Itaú Empresas* e *Banco Inter PJ*).
   - Acessar o módulo de **DDA (Débito Direto Autorizado)** e listar todos os títulos emitidos contra os CNPJs do grupo com vencimento no dia.
2. **Conciliação Prévia no ERP Conta Azul:**
   - Acessar **Financeiro > Contas a Pagar > Vencimento Hoje**.
   - Cruzar linha por linha o código de barras e razão social do credor com a nota fiscal de entrada homologada pelo departamento requisitante (ex: produtos de limpeza, uniformes, locação de lavadoras de piso).
   - Títulos sem nota vinculada no ERP: **reter imediatamente** e levar para a pauta do Despacho das 08:30.
3. **Agrupamento em Lote no Conta Azul de Bolso:**
   - Criar lote único com a tag da data: \`LOTE_[AAAA-MM-DD]\`.
   - Apurar o montante bruto exato e consolidar as 3 grandes contas:
     - *Fornecedores de Insumos e Químicos*
     - *Folha, Benefícios e Diárias Operacionais*
     - *Tributos e Encargos Retidos na Fonte*

> ⚖️ **Diretriz de Conformidade:** É estritamente vedado agendar qualquer pagamento avulso diretamente no Internet Banking sem que esteja indexado ao lote do Conta Azul.`
  },
  {
    id: "block-fin-02",
    roleId: "role-fin-01",
    code: "POP-FIN-002",
    version: "v3.0",
    homologatedBy: "Conselho Diretor",
    timeWindow: "08:30 - 09:00",
    title: "Despacho Financeiro com a Diretoria Executiva (Rito Deliberativo)",
    deliverable: "Ata formal do rito aprovada com autorização expressa do lote pelo CEO/Diretor",
    frequency: "daily",
    orderIndex: 2,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-FIN-002
**Cadeira:** Auxiliar Financeiro | **Versão:** 3.0 | **Homologado por:** Conselho Executivo

---

#### 1. Finalidade do Rito
Estabelecer a cadência formal de governança financeira matinal. Em 15 minutos, a Diretoria valida a solvência da empresa e aprova os desembolsos do dia com base em dados consolidados.

#### 2. Pauta Obrigatória do Despacho
1. **Posição de Liquidez (Saldos):**
   - Informar saldos disponíveis em contas correntes, aplicações automáticas e provisão para folha.
2. **Apresentação Analítica do Borderô:**
   - Informar valor total solicitado para liquidação.
   - Apresentar as 3 maiores saídas do dia e detalhar as categorias operacionais.
3. **Tratamento de Exceções:**
   - Informar boletos de DDA que não constavam no orçamento ou solicitações de reembolso de urgência sem documentação hábil.
4. **Deliberação e Assinatura Digital:**
   - Diretoria efetua a autorização em lote no aplicativo Conta Azul de Bolso.
   - Registro da deliberação formal na Ata do Sistema RGR.`
  },
  {
    id: "block-fin-03",
    roleId: "role-fin-01",
    code: "POP-FIN-003",
    version: "v1.8",
    homologatedBy: "Controladoria Geral",
    timeWindow: "09:00 - 10:30",
    title: "Emissão de Faturamento e NFS-e de Contratos de Facilities",
    deliverable: "Notas fiscais e boletos emitidos conforme medição física homologada e transmitidos aos clientes",
    frequency: "daily",
    orderIndex: 3,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-FIN-003
**Cadeira:** Auxiliar Financeiro | **Versão:** 1.8 | **Homologado por:** Controladoria Fiscal

---

#### 1. Critérios de Faturamento
O faturamento de serviços terceirizados (limpeza, portaria, conservação) requer aderência estrita às cláusulas contratuais e boletins de medição validados pela Operação.

#### 2. Protocolo de Emissão
1. **Validação da Medição:** Checar se a planilha do cliente possui o visto formal do Coordenador de Operações, incluindo eventuais glosas por faltas de efetivo não cobertas.
2. **Emissão no ERP / Emissor Municipal:**
   - Selecionar contrato vigente no Conta Azul.
   - Confirmar as retenções na fonte: IRRF (1,5%), CSRF (4,65%) e INSS (11%).
   - Transmitir a NFS-e e aguardar o protocolo de autorização emitido pela Secretaria de Fazenda.
3. **Disparo do Dossiê de Cobrança:**
   - Anexar: XML da NFS-e + DANFE em PDF + Boleto registrado + Relatório de Medição homologado.
   - Enviar com confirmação de entrega ao departamento de contas a pagar do cliente contratante.`
  },
  {
    id: "block-fin-04",
    roleId: "role-fin-01",
    code: "POP-FIN-004",
    version: "v1.5",
    homologatedBy: "Auditoria Interna",
    timeWindow: "10:30 - 11:30",
    title: "Conciliação Bancária e Baixa de Recebíveis",
    deliverable: "Extratos bancários 100% conciliados no Conta Azul com diferença de saldo zerada",
    frequency: "daily",
    orderIndex: 4,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-FIN-004
**Cadeira:** Auxiliar Financeiro | **Versão:** 1.5 | **Homologado por:** Auditoria Contábil

---

#### 1. Conciliação Diária Rigorosa
1. Importar o extrato via integração bancária direta ou arquivo \`.OFX\` dos bancos operadores.
2. Vincular cada depósito, transferência ou liquidação via boleto aos respectivos títulos de clientes cadastrados.
3. Despesas financeiras (tarifas de cobrança, manutenção de conta) devem ser baixadas em centros de custo apropriados.
4. **Fechamento às 11:30:** O saldo da tela de conciliação do Conta Azul deve ser idêntico até os centavos ao saldo do Internet Banking.`
  },
  {
    id: "block-fin-05",
    roleId: "role-fin-01",
    code: "POP-FIN-005",
    version: "v2.0",
    homologatedBy: "Diretoria Executiva",
    timeWindow: "13:30 - 15:00",
    title: "Gestão Ativa de Inadimplência e Régua de Cobrança",
    deliverable: "Mapa de títulos vencidos atualizado com status formal de contato e compromissos de quitação",
    frequency: "daily",
    orderIndex: 5,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-FIN-005
**Cadeira:** Auxiliar Financeiro | **Versão:** 2.0 | **Homologado por:** Diretoria Executiva

---

#### 1. Régua de Governança de Cobrança
1. **D+1 (Vencidos há 24h):** Disparo de notificação cortês via canal corporativo com envio do boleto em 2ª via atualizada.
2. **D+5 (Vencidos há 5 dias úteis):** Contato telefônico com a gerência do cliente para apuração de eventuais divergências cadastrais ou retenção de faturamento.
3. Registrar a **Data Promessa de Pagamento** e manter a Diretoria informada no despacho de fechamento.`
  },
  {
    id: "block-fin-06",
    roleId: "role-fin-01",
    code: "POP-FIN-006",
    version: "v2.2",
    homologatedBy: "Auditoria Interna",
    timeWindow: "16:30 - 17:30",
    title: "Fechamento Diário de Caixa e Arquivo Digital de Comprovantes",
    deliverable: "Relatório de fechamento financeiro transmitido à governança com comprovantes organizados no Drive",
    frequency: "daily",
    orderIndex: 6,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-FIN-006
**Cadeira:** Auxiliar Financeiro | **Versão:** 2.2 | **Homologado por:** Auditoria e Compliance

---

#### 1. Arquivamento e Conformidade
1. Realizar o download de todos os comprovantes de liquidação bancária do dia em formato PDF.
2. Renomear com a taxonomia padrão: \`AAAA-MM-DD_FORNECEDOR_VALOR.pdf\`.
3. Carregar no repositório criptografado em nuvem: \`Governança / Financeiro / [Ano] / [Mês] / [Dia]\`.
4. Emitir o resumo analítico de encerramento do dia no canal executivo de governança.`
  },

  // --- AUXILIAR RH/DP ---
  {
    id: "block-rh-01",
    roleId: "role-rh-02",
    code: "POP-RH-001",
    version: "v2.0",
    homologatedBy: "Diretoria de Recursos Humanos",
    timeWindow: "07:30 - 08:30",
    title: "Auditoria de Abertura de Postos e Alocação de Coberturas",
    deliverable: "Painel de presenças 100% preenchido com substitutos volantes nos postos críticos até 08:30",
    frequency: "daily",
    orderIndex: 1,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-RH-001
**Cadeira:** Auxiliar RH/DP | **Versão:** 2.0 | **Homologado por:** Diretoria de RH

---

#### 1. Missão Zero Desfalque
Nenhum cliente corporativo ou condomínio atendido pela empresa pode permanecer sem a presença de colaborador escalado (porteiro, auxiliar de limpeza, vigia).

1. Verificar check-in biométrico / digital nos postos às 07:00 e 07:30.
2. Faltas não justificadas detectadas até 07:45 disparam o acionamento imediato do banco de profissionais volantes.
3. Emitir ordem de transporte corporativo e monitorar chegada in loco até 08:30.`
  },
  {
    id: "block-rh-02",
    roleId: "role-rh-02",
    code: "POP-RH-002",
    version: "v1.4",
    homologatedBy: "Diretoria de Operações",
    timeWindow: "09:30 - 10:00",
    title: "Rito de Alinhamento RH x Operações de Facilities",
    deliverable: "Quadro de absenteísmo consolidado com aprovação de diárias extras pela Operação",
    frequency: "daily",
    orderIndex: 2,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-RH-002
**Cadeira:** Auxiliar RH/DP | **Versão:** 1.4

Realizar despacho diário de 20 minutos com a Coordenadoria de Operações para validação dos custos adicionais com diaristas de cobertura e aprovação de substituições definitivas.`
  },
  {
    id: "block-rh-03",
    roleId: "role-rh-02",
    code: "POP-RH-003",
    version: "v1.9",
    homologatedBy: "Compliance Trabalhista",
    timeWindow: "14:00 - 16:00",
    title: "Auditoria de Ponto Eletrônico, Atestados e Horas Extras",
    deliverable: "Espelhos de ponto regularizados com atestados validados no CRM e horas extras auditadas",
    frequency: "daily",
    orderIndex: 3,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-RH-003
**Cadeira:** Auxiliar RH/DP | **Versão:** 1.9

Validação formal de atestados médicos com cruzamento de CRM no conselho regional, lançamento no sistema de folha e emissão de alerta operacional para colaboradores com excesso de jornada.`
  },

  // --- COORDENADOR DE OPERAÇÕES ---
  {
    id: "block-ops-01",
    roleId: "role-ops-03",
    code: "POP-OPS-001",
    version: "v2.3",
    homologatedBy: "Diretoria Executiva",
    timeWindow: "08:00 - 09:00",
    title: "Distribuição da Matriz de Vistorias e Fiscais de Campo",
    deliverable: "Rotas de auditoria presencial despachadas aos fiscais com metas de qualidade",
    frequency: "daily",
    orderIndex: 1,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-OPS-001
**Cadeira:** Coordenador de Operações | **Versão:** 2.3

Despacho matinal das rotas de fiscalização com foco em contratos com ocorrências abertas e auditorias de apresentação e uso correto de EPIs.`
  },
  {
    id: "block-ops-02",
    roleId: "role-ops-03",
    code: "POP-OPS-002",
    version: "v3.1",
    homologatedBy: "Comitê de Qualidade e Governança",
    timeWindow: "10:00 - 12:30",
    title: "Auditoria Presencial de Padrão Técnico e Checklist Fotográfico",
    deliverable: "Checklists de qualidade in loco em 3 clientes protocolados com fotos e visto do cliente",
    frequency: "daily",
    orderIndex: 2,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-OPS-002
**Cadeira:** Coordenador de Operações | **Versão:** 3.1

Auditoria física de áreas nobres: pisos tratados, sanitários higienizados, suprimento de dispensers e assinatura de aceite do síndico ou gestor de facilities.`
  },
  {
    id: "block-ops-03",
    roleId: "role-ops-03",
    code: "POP-OPS-003",
    version: "v1.7",
    homologatedBy: "Diretoria de Suprimentos",
    timeWindow: "16:00 - 17:30",
    title: "Requisição e Racionamento Técnico de Insumos Químicos",
    deliverable: "Ordem de ressuprimento de materiais para postos críticos despachada dentro da cota contratual",
    frequency: "daily",
    orderIndex: 3,
    sopMarkdown: `### Procedimento Operacional Padrão • POP-OPS-003
**Cadeira:** Coordenador de Operações | **Versão:** 1.7

Análise técnica do consumo de produtos químicos diluíveis e insumos descartáveis, prevenindo desperdícios e garantindo abastecimento tempestivo.`
  }
];

export const INITIAL_RITUALS: DailyRitual[] = [
  // --- AUXILIAR FINANCEIRO ---
  {
    id: "ritual-fin-01",
    roleId: "role-fin-01",
    code: "RIT-FIN-01",
    timeSlot: "08:30",
    title: "Despacho Financeiro com Diretoria",
    durationMinutes: 15,
    type: "operational_cadence",
    frequency: "daily",
    weekDays: [1, 2, 3, 4, 5], // Seg a Sex (sem finais de semana)
    includeWeekends: false,
    agendaItems: [
      "Apresentar saldo bancário inicial consolidado de todas as contas operadoras",
      "Demonstrar valor total do lote de pagamentos do dia discriminado por categoria",
      "Sinalizar boletos DDA que não possuíam nota de entrada ou pedido homologado",
      "Apresentar notas fiscais com retenções expressivas que necessitam de quitação",
      "Validar aprovação expressa do lote pelo CEO/Diretoria no Conta Azul de Bolso"
    ]
  },
  {
    id: "ritual-fin-02",
    roleId: "role-fin-01",
    code: "RIT-FIN-02",
    timeSlot: "17:00",
    title: "Alinhamento de Fechamento e Previsão D+1",
    durationMinutes: 15,
    type: "operational_cadence",
    frequency: "daily",
    weekDays: [1, 2, 3, 4, 5], // Seg a Sex (sem finais de semana)
    includeWeekends: false,
    agendaItems: [
      "Confirmar se 100% dos pagamentos aprovados pela manhã foram devidamente liquidados",
      "Informar faturamento total emitido no dia e status de aceite dos clientes",
      "Apresentar cobranças recuperadas e promessas de pagamento para o dia seguinte",
      "Demonstrar prévia de desembolso previsto para D+1 (folhas, benefícios ou fornecedores críticos)"
    ]
  },

  // --- AUXILIAR RH/DP ---
  {
    id: "ritual-rh-01",
    roleId: "role-rh-02",
    code: "RIT-DP-01",
    timeSlot: "09:30",
    title: "Despacho de Assiduidade e Alocação de Postos",
    durationMinutes: 20,
    type: "operational_cadence",
    frequency: "weekly",
    weekDays: [1, 3, 5], // 3x na semana: Segundas, Quartas e Sextas
    agendaItems: [
      "Apresentar percentual de assiduidade do dia em todos os postos de clientes",
      "Relacionar faltas não justificadas e confirmar alocação dos diaristas reservas",
      "Validar rotas dos fiscais e entrega de benefícios/cartões VT em atraso",
      "Alinhar entrevistas e reposições para vagas de postos em expansão"
    ]
  },

  // --- COORDENADOR DE OPERAÇÕES ---
  {
    id: "ritual-ops-01",
    roleId: "role-ops-03",
    code: "RIT-OPS-01",
    timeSlot: "17:30",
    title: "Reunião de Fechamento Operacional e Ocorrências",
    durationMinutes: 25,
    type: "operational_cadence",
    frequency: "weekly",
    weekDays: [2, 4], // 2x na semana: Terças e Quintas
    agendaItems: [
      "Apresentar índice de conformidade dos checklists de qualidade auditados no dia",
      "Avaliar chamados e reclamações abertas por clientes e medidas corretivas tomadas",
      "Verificar status de manutenção de enceradeiras, lavadoras automáticas e maquinário",
      "Validar plano de ação para contratos com risco de descontinuidade"
    ]
  },

  // --- CONSELHO DE ADMINISTRAÇÃO & DIRETORIA (PAUTAS DELIBERATIVAS COM VOTAÇÃO) ---
  {
    id: "ritual-board-01",
    roleId: "role-fin-01",
    code: "CON-DIR-01",
    timeSlot: "14:00",
    title: "Sessão Deliberativa do Conselho de Administração & Diretoria",
    durationMinutes: 45,
    type: "board_council",
    frequency: "weekly",
    weekDays: [4], // Toda Quinta-feira (reunião semanal executiva)
    agendaItems: [
      "Homologação do Orçamento Extraordinário de Suprimentos & Químicos de Facilities",
      "Aprovação do Novo Regulamento Interno de Escalas, Benefícios e Banco de Horas",
      "Deliberação sobre Aporte de Capital para Aquisição de Lavadoras e Enceradeiras Industriais",
      "Aprovação da Rescisão Contratual e Substituição de Fornecedor de Uniformes em Atraso"
    ]
  }
];

export const INITIAL_MINUTES: GovernanceMinute[] = [
  {
    id: "minute-sample-01",
    ritualId: "ritual-fin-01",
    roleId: "role-fin-01",
    date: new Date().toISOString().split('T')[0],
    title: "Ata da Sessão Matinal de Despacho Financeiro",
    deliberations: "Aprovado em bloco o lote de pagamentos do dia no montante de R$ 42.350,00. Determinada a retenção de boleto de fornecedor de químicos sem nota fiscal anexada até conferência da mercadoria no DML central.",
    agendaCheckedCount: 5,
    agendaTotalCount: 5,
    signedBy: "Cristiano Silva (Diretoria Executiva / CEO)",
    signedAt: new Date().toISOString(),
    participants: ["Cristiano Silva (CEO)", "Auxiliar Financeiro (Controladoria)", "Coordenador de Operações"]
  }
];

export const INITIAL_USERS: SystemUser[] = [
  {
    id: "user-admin-01",
    name: "Cristiano Silva",
    email: "diretoria@empresa.com.br",
    roleType: "admin",
    jobTitle: "Diretoria Executiva / CEO",
    department: "Governança & Presidência",
    allowedRoleIds: ["*"], // Acesso total a todas as cadeiras
    defaultRoleId: "role-fin-01",
    active: true,
    avatarColor: "bg-blue-600 text-white",
    createdAt: new Date().toISOString()
  },
  {
    id: "user-fin-02",
    name: "Mariana Costa",
    email: "mariana.financeiro@empresa.com.br",
    roleType: "operator",
    jobTitle: "Auxiliar Financeiro Titular",
    department: "Controladoria & Finanças",
    allowedRoleIds: ["role-fin-01"], // Restrito estritamente à cadeira Financeira
    defaultRoleId: "role-fin-01",
    active: true,
    avatarColor: "bg-emerald-600 text-white",
    createdAt: new Date().toISOString()
  },
  {
    id: "user-rh-03",
    name: "Lucas Ribeiro",
    email: "lucas.rh@empresa.com.br",
    roleType: "operator",
    jobTitle: "Auxiliar de RH/DP Titular",
    department: "Recursos Humanos & Departamento Pessoal",
    allowedRoleIds: ["role-rh-02"], // Restrito estritamente à cadeira de RH/DP
    defaultRoleId: "role-rh-02",
    active: true,
    avatarColor: "bg-amber-600 text-white",
    createdAt: new Date().toISOString()
  },
  {
    id: "user-ops-04",
    name: "Carlos Mendes",
    email: "carlos.operacoes@empresa.com.br",
    roleType: "manager",
    jobTitle: "Coordenador de Operações de Facilities",
    department: "Operações & Facilities",
    allowedRoleIds: ["role-ops-03", "role-rh-02"], // Acesso a Operações e interface com RH
    defaultRoleId: "role-ops-03",
    active: true,
    avatarColor: "bg-indigo-600 text-white",
    createdAt: new Date().toISOString()
  }
];

