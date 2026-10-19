import { OperationalRole, RoutineBlock, DailyRitual, GovernanceMinute, SystemUser } from './types';

export const INITIAL_ROLES: OperationalRole[] = [
  {
    "id": "role-fin-01",
    "code": "CAD-FIN-01",
    "title": "Controladoria & Finanças",
    "department": "Controladoria, Finanças & Resultados",
    "description": "Cadeira responsável pela gestão de faturamento de contratos, contas a receber e régua de cobrança, contas a pagar com conciliação diária, DRE e resultado por contrato e por empresa, e liberação de pagamentos à tarde com o CEO.",
    "createdAt": "2026-10-15T16:48:50.493Z"
  },
  {
    "id": "role-rh-02",
    "code": "CAD-DP-02",
    "title": "Departamento Pessoal & Folha (DP)",
    "department": "Departamento Pessoal & Relações Trabalhistas",
    "description": "Cadeira responsável pelo fechamento de ponto eletrônico diário, tratamento de horas extras e atestados, processamento da folha de pagamento, encargos trabalhistas e compra tempestiva de benefícios (VT/VR).",
    "createdAt": "2026-10-15T16:48:50.493Z"
  },
  {
    "id": "role-ops-03",
    "code": "CAD-OPS-03",
    "title": "Coordenador de Operações",
    "department": "Diretoria de Operações & Facilities",
    "description": "Cadeira de supervisão técnica com foco em conformidade operacional dos postos de trabalho, auditorias de qualidade in loco com checklist fotográfico e gestão de suprimentos e equipamentos químicos.",
    "createdAt": "2026-10-15T16:48:50.493Z"
  },
  {
    "id": "role-1792084692479",
    "code": "CAD-OPE-04",
    "title": "Head de Operações",
    "department": "Operações",
    "description": "Liderar estrategicamente a operação de facilities, garantindo 100% de cobertura dos postos, cumprimento rigoroso de SLAs e retenção dos contratos. Responsável pela gestão dos coordenadores de campo, controle do DRE operacional (horas extras e consumo de insumos), relacionamento executivo com clientes e eliminação de reatividade operacional.",
    "createdAt": "2026-10-15T17:18:12.479Z"
  }
];

export const INITIAL_BLOCKS: RoutineBlock[] = [
  {
    "id": "block-fin-01",
    "roleId": "role-fin-01",
    "code": "POP-FIN-001",
    "version": "v2.5",
    "homologatedBy": "Diretoria Executiva / CEO",
    "timeWindow": "08:30 - 10:30",
    "title": "Faturamento de Contratos, Medições Físicas & Emissão de NFS-e",
    "deliverable": "Boletins de medição validados pela Operação, retenções fiscais calculadas e NFS-e emitidas com boletos registrados enviados aos clientes",
    "frequency": "daily",
    "orderIndex": 1,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-001\n**Cadeira:** Controladoria & Finanças | **Versão:** 2.5 | **Homologado por:** CEO\n\n---\n\n#### 1. Faturamento Conforme Medição Contratual\n1. Importar planilha de medição física mensal validada pelo Coordenador de Operações e assinada pelo cliente.\n2. Deduzir glosas contratuais decorrentes de faltas não cobertas ou penalidades de SLA.\n3. Aplicar retenções de tributos federais e municipais: IRRF (1,5%), CSRF (4,65%) e INSS (11%).\n4. Transmitir NFS-e na prefeitura e gerar boleto registrado no banco operador com link de pagamento.\n5. Disparar dossiê de cobrança (DANFE + XML + Boleto + Relatório de Medição) ao financeiro do cliente."
  },
  {
    "id": "block-fin-02",
    "roleId": "role-fin-01",
    "code": "POP-FIN-002",
    "version": "v2.5",
    "homologatedBy": "Controladoria Geral",
    "timeWindow": "10:30 - 12:00",
    "title": "Contas a Receber, Conciliação de Entradas & Régua Ativa de Cobrança",
    "deliverable": "Extrato bancário de créditos 100% conciliado no Conta Azul, baixas efetuadas e contato formal com clientes inadimplentes",
    "frequency": "daily",
    "orderIndex": 2,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-002\n**Cadeira:** Controladoria & Finanças | **Versão:** 2.5\n\n---\n\n#### 1. Conciliação Diária de Recebimentos\n1. Importar extrato bancário de todos os bancos com recebimento no dia (Inter, Itaú).\n2. Efetuar a baixa por compensação de boletos, transferências Pix e TEDs vinculando aos respectivos contratos.\n3. Identificar títulos vencidos:\n   - **D+1 (24h de atraso):** Envio cortês de 2ª via atualizada.\n   - **D+5 (5 dias úteis):** Contato telefônico com gerente de contas do cliente.\n4. Atualizar mapa de inadimplência e promessas de liquidação para a Controladoria."
  },
  {
    "id": "block-fin-03",
    "roleId": "role-fin-01",
    "code": "POP-FIN-003",
    "version": "v2.5",
    "homologatedBy": "Diretoria Financeira",
    "timeWindow": "13:30 - 14:30",
    "title": "Contas a Pagar, DDA Bancário & Montagem do Borderô da Tarde",
    "deliverable": "Títulos do dia conferidos contra notas fiscais homologadas e lote montado no Conta Azul de Bolso pronto para aprovação do CEO",
    "frequency": "daily",
    "orderIndex": 3,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-003\n**Cadeira:** Controladoria & Finanças | **Versão:** 2.5\n\n---\n\n#### 1. Montagem do Lote da Tarde para Liberação do CEO\n1. Acessar o DDA bancário de todas as contas e listar os títulos emitidos contra o CNPJ com vencimento no dia.\n2. Cruzar com as notas de compra homologadas pelo departamento de Suprimentos/Operações no ERP Conta Azul.\n3. Montar o lote de liquidação da tarde discriminado por categoria:\n   - *Fornecedores Críticos e Químicos de Facilities*\n   - *Guias Trabalhistas, Folha e Benefícios*\n   - *Impostos e Encargos Fiscais*\n4. Submeter lote no aplicativo Conta Azul de Bolso aguardando o despacho executivo das 14:30 com o CEO."
  },
  {
    "id": "block-fin-04",
    "roleId": "role-fin-01",
    "code": "POP-FIN-004",
    "version": "v2.5",
    "homologatedBy": "Diretoria Executiva / CEO",
    "timeWindow": "14:30 - 15:00",
    "title": "Rito com o CEO: Despacho Financeiro da Tarde & Liberação de Pagamentos",
    "deliverable": "Aprovação em lote no aplicativo Conta Azul de Bolso pelo CEO após conferência de saldo real e faturamento",
    "frequency": "daily",
    "orderIndex": 4,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-004\n**Cadeira:** Controladoria & Finanças | **Versão:** 2.5 | **Homologado por:** CEO\n\n---\n\n#### 1. Rito Executivo da Tarde (14:30)\n1. Apresentar ao CEO a posição consolidada de saldos em conta corrente e aplicações.\n2. Apresentar o lote de pagamentos montado no Conta Azul de Bolso.\n3. Justificar despesas extraordinárias ou boletos avulsos.\n4. Obter a liberação digital expressa do CEO no aplicativo bancário/ERP."
  },
  {
    "id": "block-fin-05",
    "roleId": "role-fin-01",
    "code": "POP-FIN-005",
    "version": "v2.5",
    "homologatedBy": "Auditoria e Compliance",
    "timeWindow": "15:00 - 16:30",
    "title": "Conciliação Bancária de Saídas, Quitação de Guias & Arquivo de Comprovantes",
    "deliverable": "Extratos bancários 100% conciliados com diferença zero entre extratos e Conta Azul, comprovantes indexados no Drive",
    "frequency": "daily",
    "orderIndex": 5,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-005\n**Cadeira:** Controladoria & Finanças | **Versão:** 2.5\n\n---\n\n#### 1. Conciliação Definitiva de Saídas\n1. Realizar a liquidação dos pagamentos autorizados no internet banking.\n2. Fazer o download dos comprovantes em PDF e vincular linha por linha no Conta Azul.\n3. Arquivar comprovantes no repositório criptografado em nuvem: `Governança/Financeiro/[Ano]/[Mês]/[Dia]`.\n4. Checagem de saldo final: diferença entre ERP e Extrato Bancário deve ser exatamente R$ 0,00."
  },
  {
    "id": "block-fin-06",
    "roleId": "role-fin-01",
    "code": "POP-FIN-006",
    "version": "v2.5",
    "homologatedBy": "CEO / Conselho Diretor",
    "timeWindow": "16:30 - 17:30",
    "title": "Controladoria Gerencial: DRE por Contrato & Resultado Operacional por Empresa",
    "deliverable": "Relatório analítico de margem de contribuição contrato por contrato e resultado consolidado por CNPJ/empresa do grupo",
    "frequency": "daily",
    "orderIndex": 6,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-006\n**Cadeira:** Controladoria & Finanças | **Versão:** 2.5 | **Homologado por:** CEO\n\n---\n\n#### 1. Apuração de Resultados por Contrato & Empresa\n1. **Cálculo da Margem de Contribuição por Contrato:**\n   - `Receita Líquida do Contrato` (-)\n   - `Custo Direto de Folha (Salários + Encargos + Provisões)` (-)\n   - `Benefícios do Posto (VT + VR + Cesta Básica)` (-)\n   - `Insumos Químicos & Descartáveis Consumidos` (-)\n   - `Horas Extras & Diárias de Cobertura` (=)\n   - **Margem de Contribuição Líquida (%)**\n2. Apurar o DRE Operacional Consolidado de cada empresa do grupo e sinalizar contratos deficitários para renegociação."
  },
  {
    "id": "block-rh-01",
    "roleId": "role-rh-02",
    "code": "POP-DP-001",
    "version": "v2.5",
    "homologatedBy": "Compliance Trabalhista & CEO",
    "timeWindow": "08:00 - 10:30",
    "title": "Fechamento Diário de Ponto Eletrônico, Horas Extras & Atestados",
    "deliverable": "Espelhos de ponto auditados diariamente, batidas ímpares tratadas, atestados validados no CRM e mapa de contratos com estouro de horas extras",
    "frequency": "daily",
    "orderIndex": 1,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-DP-001\n**Cadeira:** Departamento Pessoal & Folha (DP) | **Versão:** 2.5\n\n---\n\n#### 1. Auditoria Diária de Ponto Eletrônico\n1. Puxar as marcações de ponto biométricas e por aplicativo de 100% dos postos de clientes.\n2. Tratar marcações ímpares, esquecimentos e justificar com base na escala de serviço.\n3. Auditar atestados médicos entregues: verificar registro no CRM, CID e autenticidade da assinatura digital.\n4. Emitir alerta à Coordenadoria de Operações sobre postos com acúmulo de horas extras ou dobras de turno."
  },
  {
    "id": "block-rh-02",
    "roleId": "role-rh-02",
    "code": "POP-DP-002",
    "version": "v2.5",
    "homologatedBy": "Diretoria de Operações",
    "timeWindow": "10:30 - 12:00",
    "title": "Gestão, Compra & Recarga de Benefícios (VT, VR, VA e Cesta Básica)",
    "deliverable": "Pedidos de compra de VT e VR integrados às operadoras dentro dos prazos da convenção coletiva, com zero colaboradores sem saldo no 1º dia útil",
    "frequency": "daily",
    "orderIndex": 2,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-DP-002\n**Cadeira:** Departamento Pessoal & Folha (DP) | **Versão:** 2.5\n\n---\n\n#### 1. Pontualidade de Benefícios\n1. Apurar dias úteis de trabalho e faltas do período para cálculo exato de Vale-Transporte (VT) e Vale-Refeição (VR).\n2. Gerar pedido nas operadoras (Sodexo, Alelo, Flash, bilhetagem de transporte público).\n3. Encaminhar pedido de pagamento ao Financeiro para agendamento no borderô da tarde.\n4. Confirmar carga efetiva nos cartões antes do primeiro dia útil do mês."
  },
  {
    "id": "block-rh-03",
    "roleId": "role-rh-02",
    "code": "POP-DP-003",
    "version": "v2.5",
    "homologatedBy": "Diretoria Executiva / CEO",
    "timeWindow": "13:30 - 16:00",
    "title": "Processamento da Folha de Pagamento, Encargos (FGTS/INSS) & Rescisões",
    "deliverable": "Prévia da folha de pagamento calculada sem divergências, provisões de 13º e férias atualizadas e guias de encargos emitidas para o financeiro",
    "frequency": "daily",
    "orderIndex": 3,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-DP-003\n**Cadeira:** Departamento Pessoal & Folha (DP) | **Versão:** 2.5\n\n---\n\n#### 1. Cálculo da Folha e Encargos\n1. Importar dados de ponto fechados (horas normais, DSR, adicional noturno, insalubridade e horas extras).\n2. Processar cálculo da folha no ERP de folha de pagamento.\n3. Gerar guias de FGTS Digital, DCTFWeb (INSS) e IRRF sobre a folha.\n4. Emitir espelho analítico de folha por centro de custo/contrato e enviar guias ao Financeiro para inclusão no borderô da tarde."
  },
  {
    "id": "block-rh-04",
    "roleId": "role-rh-02",
    "code": "POP-DP-004",
    "version": "v2.5",
    "homologatedBy": "Compliance Trabalhista",
    "timeWindow": "16:00 - 17:30",
    "title": "Auditoria de Gente: Absenteísmo (ABS), Homologações & Passivo Trabalhista",
    "deliverable": "Taxa de absenteísmo consolidada da empresa e auditoria de prazos de homologação rescisória para prevenção de multas (Art. 477 da CLT)",
    "frequency": "daily",
    "orderIndex": 4,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-DP-004\n**Cadeira:** Departamento Pessoal & Folha (DP) | **Versão:** 2.5\n\n---\n\n#### 1. Indicadores de Gestão de Gente\n1. Calcular taxa de Absenteísmo (ABS) = `(Horas Perdidas / Horas Programadas) * 100`.\n2. Auditar contratos de trabalho em período de experiência (45/90 dias) para parecer de efetivação com a Operação.\n3. Monitorar prazos de pagamento de rescisões (máximo 10 dias corridos) para blindar contra multas trabalhistas."
  },
  {
    "id": "block-ops-01",
    "roleId": "role-ops-03",
    "code": "POP-OPS-001",
    "version": "v2.3",
    "homologatedBy": "Diretoria Executiva",
    "timeWindow": "08:00 - 09:00",
    "title": "Distribuição da Matriz de Vistorias e Fiscais de Campo",
    "deliverable": "Rotas de auditoria presencial despachadas aos fiscais com metas de qualidade",
    "frequency": "daily",
    "orderIndex": 1,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-OPS-001\n**Cadeira:** Coordenador de Operações | **Versão:** 2.3\n\nDespacho matinal das rotas de fiscalização com foco em contratos com ocorrências abertas e auditorias de apresentação e uso correto de EPIs."
  },
  {
    "id": "block-ops-02",
    "roleId": "role-ops-03",
    "code": "POP-OPS-002",
    "version": "v3.1",
    "homologatedBy": "Comitê de Qualidade e Governança",
    "timeWindow": "10:00 - 12:30",
    "title": "Auditoria Presencial de Padrão Técnico e Checklist Fotográfico",
    "deliverable": "Checklists de qualidade in loco em 3 clientes protocolados com fotos e visto do cliente",
    "frequency": "daily",
    "orderIndex": 2,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-OPS-002\n**Cadeira:** Coordenador de Operações | **Versão:** 3.1\n\nAuditoria física de áreas nobres: pisos tratados, sanitários higienizados, suprimento de dispensers e assinatura de aceite do síndico ou gestor de facilities."
  },
  {
    "id": "block-ops-03",
    "roleId": "role-ops-03",
    "code": "POP-OPS-003",
    "version": "v1.7",
    "homologatedBy": "Diretoria de Suprimentos",
    "timeWindow": "16:00 - 17:30",
    "title": "Requisição e Racionamento Técnico de Insumos Químicos",
    "deliverable": "Ordem de ressuprimento de materiais para postos críticos despachada dentro da cota contratual",
    "frequency": "daily",
    "orderIndex": 3,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-OPS-003\n**Cadeira:** Coordenador de Operações | **Versão:** 1.7\n\nAnálise técnica do consumo de produtos químicos diluíveis e insumos descartáveis, prevenindo desperdícios e garantindo abastecimento tempestivo."
  },
  {
    "id": "block-head-01",
    "roleId": "role-1792084692479",
    "code": "POP-OPE-001",
    "version": "v1.1",
    "homologatedBy": "Diretoria Executiva / CEO",
    "timeWindow": "07:30 - 08:15",
    "title": "Mesa de Operações: Fechamento de Escala & Garantia de 100% dos Postos Cobertos",
    "deliverable": "Painel de postos 100% preenchido com diaristas de reserva alocados antes das 08h e zero clientes desassistidos",
    "frequency": "daily",
    "orderIndex": 1,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-OPE-001\n**Cadeira:** Head de Operações | **Versão:** 1.1 | **Homologado por:** CEO\n\n---\n\n#### 1. Diretriz de Cobertura Crítica Matinal\nO Head de Operações inicia o dia na Mesa de Operações assegurando que nenhum posto de cliente (limpeza, portaria, recepção ou liderança de campo) fique desfalqueado por faltas não cobertas.\n\n#### 2. Protocolo de Checagem (07:30 às 08:15)\n1. Acessar o sistema de ponto e espelho de presença em tempo real.\n2. Identificar postos com colaboradores que não registraram entrada até 07:45.\n3. Acionar os Coordenadores de Campo e o RH/DP para despacho imediato da equipe de volantes e diaristas reservas.\n4. Validar que 100% das substituições estão a caminho com confirmação de previsão de chegada antes de liberar a equipe para visitas de campo."
  },
  {
    "id": "block-head-02",
    "roleId": "role-1792084692479",
    "code": "POP-OPE-002",
    "version": "v1.1",
    "homologatedBy": "Conselho Diretor",
    "timeWindow": "08:45 - 12:30",
    "title": "Roteiro Presencial Porta Fora: Visitas Executivas aos Contratos & Síndicos",
    "deliverable": "Relatório fotográfico de auditoria e termos de alinhamento com clientes/síndicos validados in loco",
    "frequency": "daily",
    "orderIndex": 2,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-OPE-002\n**Cadeira:** Head de Operações | **Versão:** 1.1\n\n---\n\n#### 1. Atuação Porta Fora de Alto Impacto\nCom a mesa de operações estabilizada, o Head atua fisicamente nos contratos corporativos, fortalecendo a relação de confiança com síndicos e gestores de facilities.\n\n#### 2. Roteiro da Visita Executiva\n1. Inspecionar apresentação pessoal, uniformes e postura dos colaboradores no posto.\n2. Vistoriar áreas nobres, DMLs, conservação de maquinários e padrão técnico de higienização.\n3. Reunião de alinhamento com o síndico ou tomador do serviço para coleta de percepção de valor (NPS).\n4. Registro de oportunidade de melhoria ou aditivos de escopo."
  },
  {
    "id": "block-head-03",
    "roleId": "role-1792084692479",
    "code": "POP-OPE-003",
    "version": "v1.1",
    "homologatedBy": "Diretoria de Operações",
    "timeWindow": "13:30 - 15:30",
    "title": "Auditoria de Qualidade Técnica, Resolução de Não Conformidades e Blindagem",
    "deliverable": "Planos de ação corretivos em 48h para eliminar reclamações de clientes e prevenção de glosas",
    "frequency": "daily",
    "orderIndex": 3,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-OPE-003\n**Cadeira:** Head de Operações | **Versão:** 1.1\n\nIntervenção tempestiva em contratos com apontamento de falha ou reclamação, instaurando plano de ação corretivo de 48h junto aos Coordenadores de Campo para estancar reatividade operacional."
  },
  {
    "id": "block-head-04",
    "roleId": "role-1792084692479",
    "code": "POP-OPE-004",
    "version": "v1.1",
    "homologatedBy": "Controladoria & Diretoria Executiva",
    "timeWindow": "16:00 - 17:30",
    "title": "Auditoria de Gente & DRE: Gestão de Vagas Abertas, ABS, Turnover e Horas Extras",
    "deliverable": "Painel de vagas críticas cobradas do RH, análise de absenteísmo por contrato e auditoria do custo de horas extras",
    "frequency": "daily",
    "orderIndex": 4,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-OPE-004\n**Cadeira:** Head de Operações | **Versão:** 1.1\n\n---\n\n#### 1. Gestão dos Indicadores de Pessoas & Eficiência\n1. **Gestão de Vagas em Aberto:** Cobrar do RH o cumprimento do SLA de contratação para postos em aberto (máximo 72h para reposição definitiva).\n2. **Absenteísmo (ABS):** Cruzar os postos com maior taxa de faltas e atestados médicos para entender causas operacionais.\n3. **Turnover:** Analisar contratos com alta rotatividade (relação encarregado x colaborador, perfil da escala).\n4. **Horas Extras de Cobertura:** Auditar se a falta de candidatos está forçando dobras e onerando o DRE operacional."
  }
];

export const INITIAL_RITUALS: DailyRitual[] = [
  {
    "id": "ritual-fin-01",
    "roleId": "role-fin-01",
    "code": "RIT-FIN-01",
    "timeSlot": "14:30",
    "title": "Despacho Financeiro da Tarde & Liberação de Pagamentos (com o CEO)",
    "durationMinutes": 25,
    "agendaItems": [
      "Apresentar lote de pagamentos do dia montado e auditado (títulos validados com NF e pedido de compra)",
      "Conferir conciliação bancária das entradas da manhã (recebimentos de faturas de clientes)",
      "Apresentar boletos DDA autorizados vs divergentes retidos",
      "Apresentar posição de fluxo de caixa projetado para D+1 e provisão de folha/benefícios",
      "Aprovação expressa do lote de pagamentos pelo CEO no app do banco / Conta Azul"
    ],
    "frequency": "daily",
    "weekDays": [
      1,
      2,
      3,
      4,
      5
    ],
    "includeWeekends": false
  },
  {
    "id": "ritual-fin-02",
    "roleId": "role-fin-01",
    "code": "RIT-FIN-02",
    "timeSlot": "15:30",
    "title": "Comitê de Controladoria: Análise de Resultados por Contratos & Resultado Operacional por Empresa",
    "durationMinutes": 35,
    "agendaItems": [
      "Apresentar DRE Gerencial consolidado por empresa/CNPJ do grupo",
      "Apresentar DRE analítico por contrato (Margem de Contribuição por posto: Faturamento (-) Mão de Obra (-) Insumos (-) HE)",
      "Auditar faturamento mensal emitido vs medido, retenções tributárias e notas em contestação",
      "Analisar mapa de inadimplência (Contas a Receber D+1, D+5, D+15) e conciliação bancária pendente",
      "Pactuar planos de renegociação, substituição de insumos ou reequilíbrio econômico-financeiro para contratos deficitários"
    ],
    "frequency": "weekly",
    "weekDays": [
      5
    ],
    "includeWeekends": false
  },
  {
    "id": "ritual-rh-01",
    "roleId": "role-rh-02",
    "code": "RIT-DP-01",
    "timeSlot": "15:00",
    "title": "Despacho Executivo de DP & Folha com o CEO: Ponto, Benefícios e Encargos",
    "durationMinutes": 30,
    "agendaItems": [
      "Apresentar fechamento dos espelhos de ponto eletrônico e mapa de horas extras por contrato",
      "Auditar atestados médicos recebidos (validação de CID/CRM) e planos para redução do absenteísmo",
      "Conferir cronograma de compra e recarga de benefícios (VT, VR, VA, cesta básica) - garantia de crédito no 1º dia útil",
      "Apresentar prévia da folha de pagamento consolidada por empresa do grupo",
      "Validar guias de encargos sociais e fiscais trabalhistas (FGTS Digital, DCTFWeb/INSS)"
    ],
    "frequency": "weekly",
    "weekDays": [
      2
    ],
    "includeWeekends": false
  },
  {
    "id": "ritual-ops-01",
    "roleId": "role-ops-03",
    "code": "RIT-OPS-01",
    "timeSlot": "16:00",
    "title": "Alinhamento Operacional Semanal com Diretoria: Qualidade, SLAs e Glosas",
    "durationMinutes": 30,
    "agendaItems": [
      "Apresentar índice de conformidade dos checklists de qualidade e rotinas executadas nos postos",
      "Avaliar chamados críticos de clientes, ocorrências de insatisfação e risco de glosa de faturamento",
      "Auditar cronograma de manutenção e conservação de maquinários e equipamentos pesados de limpeza",
      "Validar relatório de consumo de químicos e materiais por contrato"
    ],
    "frequency": "weekly",
    "weekDays": [
      4
    ],
    "includeWeekends": false
  },
  {
    "id": "ritual-board-01",
    "roleId": "role-fin-01",
    "code": "CON-DIR-01",
    "timeSlot": "14:00",
    "title": "Sessão Deliberativa do Conselho de Administração & Diretoria",
    "durationMinutes": 45,
    "type": "board_council",
    "agendaItems": [
      "Homologação do Orçamento Extraordinário de Suprimentos & Químicos de Facilities",
      "Aprovação do Novo Regulamento Interno de Escalas, Benefícios e Banco de Horas",
      "Deliberação sobre Aporte de Capital para Aquisição de Lavadoras e Enceradeiras Industriais",
      "Aprovação da Rescisão Contratual e Substituição de Fornecedor de Uniformes em Atraso"
    ],
    "frequency": "weekly",
    "weekDays": [
      4
    ],
    "includeWeekends": false
  },
  {
    "id": "ritual-head-01",
    "roleId": "role-1792084692479",
    "code": "RIT-HEAD-01",
    "timeSlot": "08:15",
    "title": "Mesa de Despacho Operacional: Cobertura de Postos, ABS do Dia & Vagas Críticas",
    "durationMinutes": 20,
    "type": "operational_cadence",
    "agendaItems": [
      "Conferir fechamento da Mesa de Operações: 100% dos postos cobertos e diaristas reservas confirmados",
      "Auditar taxa de absenteísmo (ABS) do dia e contratos com faltas reincidentes",
      "Cobrar SLA do RH/DP sobre vagas em aberto, prazos de reposição e triagem de substitutos",
      "Validar alinhamento com Coordenadores de Campo sobre prioridades operacionais antes da saída para a rua"
    ],
    "frequency": "daily",
    "weekDays": [
      1,
      2,
      3,
      4,
      5
    ],
    "includeWeekends": false
  },
  {
    "id": "ritual-head-02",
    "roleId": "role-1792084692479",
    "code": "RIT-HEAD-02",
    "timeSlot": "11:00",
    "title": "Alinhamento Executivo Presencial com Contratantes & Síndicos",
    "durationMinutes": 30,
    "type": "board_council",
    "agendaItems": [
      "Apresentar Relatório Executivo Mensal de SLA, assiduidade e auditoria de qualidade in loco",
      "Coletar percepção de valor do tomador do serviço (NPS qualitativo e expectativas da gestão)",
      "Tratar e pactuar planos de ação para demandas extraordinárias, eventos e adequação de escopo",
      "Identificar oportunidades de expansão de serviços (aditivos contratuais, tratamento de piso, vitrificação)",
      "Formalizar ata de alinhamento com visto e aceite do representante legal do cliente"
    ],
    "frequency": "weekly",
    "weekDays": [
      2,
      4
    ],
    "includeWeekends": false
  },
  {
    "id": "ritual-head-03",
    "roleId": "role-1792084692479",
    "code": "RIT-HEAD-03",
    "timeSlot": "16:30",
    "title": "Comitê Semanal de Retenção de Contratos, Turnover & DRE Operacional",
    "durationMinutes": 30,
    "type": "operational_cadence",
    "agendaItems": [
      "Apresentar consolidado de visitas executivas da semana e matriz de termômetro de satisfação dos clientes",
      "Auditar índice semanal de Turnover por posto, causas raízes de desligamento e plano de retenção de talentos",
      "Auditar DRE operacional: impacto financeiro de horas extras de cobertura e glosas aplicadas",
      "Apresentar previsão de novos aditivos contratuais e cronograma de implantação de novos clientes"
    ],
    "frequency": "weekly",
    "weekDays": [
      5
    ],
    "includeWeekends": false
  }
];

export const INITIAL_MINUTES: GovernanceMinute[] = [
  {
    "id": "minute-sample-01",
    "ritualId": "ritual-fin-01",
    "roleId": "role-fin-01",
    "date": "2026-10-15",
    "title": "Ata da Sessão Matinal de Despacho Financeiro",
    "deliberations": "Aprovado em bloco o lote de pagamentos do dia no montante de R$ 42.350,00. Determinada a retenção de boleto de fornecedor de químicos sem nota fiscal anexada até conferência da mercadoria no DML central.",
    "agendaCheckedCount": 5,
    "agendaTotalCount": 5,
    "signedBy": "Cristiano Silva (Diretoria Executiva / CEO)",
    "signedAt": "2026-10-15T16:48:50.493Z",
    "participants": [
      "Cristiano Silva (CEO)",
      "Auxiliar Financeiro (Controladoria)",
      "Coordenador de Operações"
    ]
  }
];

export const INITIAL_USERS: SystemUser[] = [
  {
    "id": "user-admin-01",
    "name": "Cristiano Silva",
    "email": "diretoria@empresa.com.br",
    "roleType": "admin",
    "jobTitle": "Diretoria Executiva / CEO",
    "department": "Governança & Presidência",
    "allowedRoleIds": [
      "*"
    ],
    "defaultRoleId": "role-fin-01",
    "active": true,
    "avatarColor": "bg-blue-600 text-white",
    "createdAt": "2026-10-15T18:28:19.927Z"
  },
  {
    "id": "user-fin-02",
    "name": "Mariana Costa",
    "email": "mariana.financeiro@empresa.com.br",
    "roleType": "operator",
    "jobTitle": "Auxiliar Financeiro Titular",
    "department": "Controladoria & Finanças",
    "allowedRoleIds": [
      "role-fin-01"
    ],
    "defaultRoleId": "role-fin-01",
    "active": true,
    "avatarColor": "bg-emerald-600 text-white",
    "createdAt": "2026-10-15T18:28:19.927Z"
  },
  {
    "id": "user-rh-03",
    "name": "Lucas Ribeiro",
    "email": "lucas.rh@empresa.com.br",
    "roleType": "operator",
    "jobTitle": "Auxiliar de RH/DP Titular",
    "department": "Recursos Humanos & Departamento Pessoal",
    "allowedRoleIds": [
      "role-rh-02"
    ],
    "defaultRoleId": "role-rh-02",
    "active": true,
    "avatarColor": "bg-amber-600 text-white",
    "createdAt": "2026-10-15T18:28:19.927Z"
  },
  {
    "id": "user-ops-04",
    "name": "Carlos Mendes",
    "email": "carlos.operacoes@empresa.com.br",
    "roleType": "manager",
    "jobTitle": "Coordenador de Operações de Facilities",
    "department": "Operações & Facilities",
    "allowedRoleIds": [
      "role-ops-03",
      "role-rh-02"
    ],
    "defaultRoleId": "role-ops-03",
    "active": true,
    "avatarColor": "bg-indigo-600 text-white",
    "createdAt": "2026-10-15T18:28:19.927Z"
  }
];
