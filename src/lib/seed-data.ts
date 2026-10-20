import { OperationalRole, RoutineBlock, DailyRitual, GovernanceMinute, SystemUser } from './types';

export const INITIAL_ROLES: OperationalRole[] = [
  {
    "id": "role-fin-01",
    "code": "CAD-FIN-01",
    "title": "Controladoria & Finanças",
    "department": "Controladoria, Finanças & Resultados",
    "description": "Cadeira responsável pela gestão de faturamento diário de contratos, conciliação de recebíveis e régua de cobrança, contas operacionais (químicos, EPIs e diárias), contas a pagar com DDA, liberação de pagamentos à tarde (14:30) com o CEO, auditoria semanal de cartões corporativos, liquidação mensal de encargos/tributos (dia 20) e apuração mensal de resultados (DRE por Contrato e por Empresa).",
    "createdAt": "2026-10-15T16:48:50.493Z"
  },
  {
    "id": "role-rh-02",
    "code": "CAD-DP-02",
    "title": "Departamento Pessoal & Folha (DP)",
    "department": "Departamento Pessoal & Relações Trabalhistas",
    "description": "Cadeira responsável pela conferência diária de ponto e atestados, gestão diária de prazos de rescisões trabalhistas (blindagem dos 10 dias da CLT), fechamento oficial do período de ponto (dia 25), processamento da folha e encargos (pós dia 25), compra de VT (último dia útil) e crédito de salários/VA (5º dia útil).",
    "createdAt": "2026-10-15T16:48:50.493Z"
  },
  {
    "id": "role-ops-03",
    "code": "CAD-OPS-03",
    "title": "Coordenador de Operações",
    "department": "Diretoria de Operações & Facilities",
    "description": "Cadeira de supervisão técnica com foco em conformidade operacional dos postos de trabalho, auditorias de qualidade in loco com checklist fotográfico na ferramenta Checklist Fácil e gestão de suprimentos e equipamentos químicos.",
    "createdAt": "2026-10-15T16:48:50.493Z"
  },
  {
    "id": "role-1792084692479",
    "code": "CAD-OPE-04",
    "title": "Head de Operações",
    "department": "Operações",
    "description": "Liderar estrategicamente a operação de facilities: Mesa de Operações diária (100% de cobertura e diaristas reservas), visitas executivas porta fora a síndicos e clientes, gestão diária de vagas em aberto com SLA de 72h e relatório executivo semanal de auditorias na ferramenta Checklist Fácil.",
    "createdAt": "2026-10-15T17:18:12.479Z"
  }
];

export const INITIAL_BLOCKS: RoutineBlock[] = [
  {
    "id": "block-fin-01",
    "roleId": "role-fin-01",
    "code": "POP-FIN-001",
    "version": "v3.0",
    "homologatedBy": "Diretoria Executiva / CEO",
    "timeWindow": "08:30 - 10:00",
    "title": "Faturamento Diário de Contratos, Medições & Emissão de NFS-e",
    "deliverable": "Medições físicas conferidas com a Operação, retenções calculadas (IRRF, CSRF, INSS) e NFS-e emitidas com boletos registrados enviados aos clientes",
    "frequency": "daily",
    "orderIndex": 1,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-001\n**Cadeira:** Controladoria & Finanças | **Versão:** 3.0 | **Periodicidade:** Diária\n\n---\n\n#### 1. Faturamento Conforme Medição Contratual\n1. Importar planilha de medição física mensal validada pelo Coordenador de Operações e assinada pelo cliente.\n2. Deduzir glosas contratuais decorrentes de faltas não cobertas ou penalidades de SLA.\n3. Aplicar retenções de tributos federais e municipais: IRRF (1,5%), CSRF (4,65%) e INSS (11%).\n4. Transmitir NFS-e na prefeitura e gerar boleto registrado no banco operador com link de pagamento.\n5. Disparar dossiê de cobrança (DANFE + XML + Boleto + Relatório de Medição) ao financeiro do cliente contratante."
  },
  {
    "id": "block-fin-02",
    "roleId": "role-fin-01",
    "code": "POP-FIN-002",
    "version": "v3.0",
    "homologatedBy": "Controladoria Geral",
    "timeWindow": "10:00 - 11:30",
    "title": "Contas a Receber, Conciliação Diária de Entradas & Régua de Cobrança",
    "deliverable": "Extrato bancário de créditos 100% conciliado no ERP, baixas efetuadas e contato formal com clientes inadimplentes (D+1 envio cortês, D+5 cobrança ativa)",
    "frequency": "daily",
    "orderIndex": 2,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-002\n**Cadeira:** Controladoria & Finanças | **Versão:** 3.0 | **Periodicidade:** Diária\n\n---\n\n#### 1. Conciliação Diária de Recebimentos\n1. Importar extrato bancário de todos os bancos com recebimento no dia (Inter, Itaú).\n2. Efetuar a baixa por compensação de boletos, transferências Pix e TEDs vinculando aos respectivos contratos.\n3. Identificar títulos vencidos:\n   - **D+1 (24h de atraso):** Envio cortês de 2ª via atualizada por e-mail/WhatsApp.\n   - **D+5 (5 dias úteis):** Contato telefônico direto com o gerente de contas/síndico do cliente.\n4. Atualizar mapa de inadimplência e promessas de liquidação para a Controladoria."
  },
  {
    "id": "block-fin-03",
    "roleId": "role-fin-01",
    "code": "POP-FIN-003",
    "version": "v3.0",
    "homologatedBy": "Diretoria Financeira",
    "timeWindow": "11:30 - 12:30",
    "title": "Controle Diário de Contas Operacionais: Materiais, EPIs & Diárias",
    "deliverable": "Conferência e liberação diária de notas de químicos de facilities, EPIs recebidos e pagamento de diárias dos diaristas reservas da Operação",
    "frequency": "daily",
    "orderIndex": 3,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-003\n**Cadeira:** Controladoria & Finanças | **Versão:** 3.0 | **Periodicidade:** Diária\n\n---\n\n#### 1. Contas Operacionais do Dia a Dia\n1. **Insumos Químicos & Descartáveis:** Cruzar pedidos de compras de produtos de limpeza com a nota fiscal de entrega física no DML central ou no posto.\n2. **EPIs e Uniformes:** Validar recebimento físico de botinas, luvas e uniformes homologados com o almoxarifado.\n3. **Diárias Operacionais:** Receber da Mesa de Operações a relação de diaristas reservas que cobriram faltas no dia anterior, auditar valores contratados e incluir no lote da tarde para liquidação via Pix."
  },
  {
    "id": "block-fin-04",
    "roleId": "role-fin-01",
    "code": "POP-FIN-004",
    "version": "v3.0",
    "homologatedBy": "Diretoria Financeira",
    "timeWindow": "13:30 - 14:30",
    "title": "Contas a Pagar, DDA Bancário & Montagem do Borderô da Tarde",
    "deliverable": "Varredura de títulos no DDA bancário cruzados com notas fiscais homologadas e lote montado no Conta Azul de Bolso pronto para o CEO",
    "frequency": "daily",
    "orderIndex": 4,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-004\n**Cadeira:** Controladoria & Finanças | **Versão:** 3.0 | **Periodicidade:** Diária\n\n---\n\n#### 1. Montagem do Lote da Tarde para Liberação do CEO\n1. Acessar o DDA bancário de todas as contas e listar os títulos emitidos contra o CNPJ com vencimento no dia.\n2. Cruzar com as notas de compra homologadas pelo departamento de Suprimentos/Operações no ERP Conta Azul.\n3. Montar o lote de liquidação da tarde discriminado por categoria:\n   - *Fornecedores Críticos e Químicos de Facilities*\n   - *Diárias Operacionais de Cobertura*\n   - *Guias Trabalhistas, Folha e Benefícios (conforme calendário)*\n4. Submeter lote no aplicativo Conta Azul de Bolso aguardando o despacho executivo das 14:30 com o CEO."
  },
  {
    "id": "block-fin-05",
    "roleId": "role-fin-01",
    "code": "POP-FIN-005",
    "version": "v3.0",
    "homologatedBy": "Diretoria Executiva / CEO",
    "timeWindow": "14:30 - 15:00",
    "title": "Rito com o CEO: Despacho Financeiro da Tarde & Liberação de Pagamentos",
    "deliverable": "Aprovação em lote no aplicativo do banco / Conta Azul pelo CEO após validação de saldo bancário real e faturamento",
    "frequency": "daily",
    "orderIndex": 5,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-005\n**Cadeira:** Controladoria & Finanças | **Versão:** 3.0 | **Periodicidade:** Diária (14:30)\n\n---\n\n#### 1. Rito Executivo da Tarde (14:30)\n1. Apresentar ao CEO a posição consolidada de saldos em conta corrente e aplicações.\n2. Apresentar o lote de pagamentos montado no Conta Azul de Bolso.\n3. Justificar despesas operacionais do dia (diárias, químicos, EPIs) e eventuais boletos avulsos.\n4. Obter a liberação digital expressa do CEO no aplicativo bancário/ERP."
  },
  {
    "id": "block-fin-06",
    "roleId": "role-fin-01",
    "code": "POP-FIN-006",
    "version": "v3.0",
    "homologatedBy": "Auditoria e Compliance",
    "timeWindow": "15:00 - 16:30",
    "title": "Conciliação Bancária de Saídas, Quitação no ERP & Arquivo de Comprovantes",
    "deliverable": "Liquidação bancária confirmada, comprovantes anexados linha por linha no ERP/Drive e conferência de saldo final (diferença R$ 0,00)",
    "frequency": "daily",
    "orderIndex": 6,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-006\n**Cadeira:** Controladoria & Finanças | **Versão:** 3.0 | **Periodicidade:** Diária\n\n---\n\n#### 1. Conciliação Definitiva de Saídas\n1. Realizar a liquidação dos pagamentos autorizados no internet banking.\n2. Fazer o download dos comprovantes em PDF e vincular linha por linha no Conta Azul.\n3. Arquivar comprovantes no repositório criptografado em nuvem: `Governança/Financeiro/[Ano]/[Mês]/[Dia]`.\n4. Checagem de saldo final: diferença entre ERP e Extrato Bancário deve ser exatamente R$ 0,00."
  },
  {
    "id": "block-fin-07",
    "roleId": "role-fin-01",
    "code": "POP-FIN-007",
    "version": "v3.0",
    "homologatedBy": "Controladoria Geral",
    "timeWindow": "16:30 - 17:30",
    "title": "Auditoria de Cartões de Crédito Corporativos por Empresa do Grupo",
    "deliverable": "Faturas e despesas de cartão de crédito de cada CNPJ conferidas com notas fiscais, sem despesas desordenadas ou não comprovadas",
    "frequency": "weekly",
    "dayOfWeek": 4,
    "orderIndex": 7,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-007\n**Cadeira:** Controladoria & Finanças | **Versão:** 3.0 | **Periodicidade:** Semanal (Quintas)\n\n---\n\n#### 1. Auditoria de Cartão Corporativo por Empresa\n1. Baixar faturas em aberto e lançamentos em tempo real dos cartões corporativos de todas as empresas do grupo.\n2. Exigir comprovante fiscal (DANFE / Cupom NFC-e) para cada transação (combustível, pedágio, alimentação em campo, materiais de urgência).\n3. Lançar as despesas no centro de custo correto de cada contrato/empresa.\n4. Notificar portadores sobre lançamentos sem comprovante para bloqueio preventivo de limite."
  },
  {
    "id": "block-fin-08",
    "roleId": "role-fin-01",
    "code": "POP-FIN-008",
    "version": "v3.0",
    "homologatedBy": "Diretoria Financeira / CEO",
    "timeWindow": "10:00 - 12:00",
    "title": "Liquidação Mensal de Encargos Sociais, Trabalhistas & Tributos (Dia 20)",
    "deliverable": "Guias de FGTS Digital, DCTFWeb (INSS), IRRF retido e tributos municipais/federais quitadas no dia 20 com comprovantes emitidos",
    "frequency": "monthly",
    "dayOfMonth": 20,
    "orderIndex": 8,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-008\n**Cadeira:** Controladoria & Finanças | **Versão:** 3.0 | **Periodicidade:** Mensal (Todo dia 20)\n\n---\n\n#### 1. Calendário Fiscal e Trabalhista (Dia 20)\n1. Receber do Departamento Pessoal e Contabilidade as guias oficiais de recolhimento:\n   - **FGTS Digital** (recolhimento unificado via Pix/código de barras).\n   - **DCTFWeb / INSS** (contribuição previdenciária e retenções de terceiros).\n   - **Tributos Municipais (ISS) e Federais (IRRF, PIS, COFINS, CSLL)**.\n2. Agendar os pagamentos no internet banking para liquidação no borderô da tarde das 14:30.\n3. Emitir e arquivar os comprovantes de quitação imediatamente, garantindo manutenção das Certidões Negativas de Débitos (CND)."
  },
  {
    "id": "block-fin-09",
    "roleId": "role-fin-01",
    "code": "POP-FIN-009",
    "version": "v3.0",
    "homologatedBy": "CEO / Conselho Diretor",
    "timeWindow": "14:00 - 16:30",
    "title": "Apuração Mensal de Resultados: DRE por Contrato & Resultado por Empresa",
    "deliverable": "Relatório analítico mensal de Margem de Contribuição contrato por contrato e DRE Operacional consolidado por empresa (após pagar folha, benefícios, tributos, insumos e encargos)",
    "frequency": "monthly",
    "dayOfMonth": 28,
    "orderIndex": 9,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-FIN-009\n**Cadeira:** Controladoria & Finanças | **Versão:** 3.0 | **Periodicidade:** Mensal (Pós-Pagamento Total)\n\n---\n\n#### 1. Fechamento Mensal de Resultados\n*Esta rotina é realizada uma vez por mês, após a quitação integral de todas as obrigações: folha de pagamento, benefícios, tributos, insumos e encargos sociais.*\n\n1. **Cálculo da Margem de Contribuição Real por Contrato:**\n   - `Receita Líquida Faturada no Mês` (-)\n   - `Custo Direto de Folha de Pagamento` (-)\n   - `Benefícios Pagos no Posto (VT + VA/VR)` (-)\n   - `Encargos Sociais e Trabalhistas (FGTS/INSS)` (-)\n   - `Insumos Químicos & Materiais Consumidos` (-)\n   - `Horas Extras & Diárias de Cobertura Pagas` (=)\n   - **Margem de Contribuição Líquida Real (%)**\n2. Apurar o DRE Operacional Consolidado por CNPJ/empresa do grupo.\n3. Submeter contratos deficitários para o Comitê Executivo com o CEO para repactuação ou descontinuidade."
  },
  {
    "id": "block-rh-01",
    "roleId": "role-rh-02",
    "code": "POP-DP-001",
    "version": "v3.0",
    "homologatedBy": "Compliance Trabalhista & CEO",
    "timeWindow": "08:00 - 10:30",
    "title": "Conferência Diária de Ponto Eletrônico, Batidas Ímpares & Atestados do Dia",
    "deliverable": "Espelhos de ponto do dia anterior auditados, marcações ímpares tratadas, atestados médicos conferidos no CRM e faltas lançadas para a Mesa de Operações",
    "frequency": "daily",
    "orderIndex": 1,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-DP-001\n**Cadeira:** Departamento Pessoal & Folha (DP) | **Versão:** 3.0 | **Periodicidade:** Diária\n\n---\n\n#### 1. Auditoria Diária de Ponto Eletrônico\n1. Descarregar as marcações de ponto biométricas e por aplicativo de 100% dos postos de clientes (dia anterior).\n2. Tratar batidas ímpares, esquecimentos e faltas, validando com a escala oficial de trabalho.\n3. Auditar atestados médicos entregues:\n   - Checar cadastro ativo do médico no portal do CFM/CRM.\n   - Conferir CID, carimbo, assinatura e dias de afastamento concedidos.\n4. Emitir alerta imediato à Mesa de Operações sobre faltas sem justificativa para evitar pagamento indevido."
  },
  {
    "id": "block-rh-02",
    "roleId": "role-rh-02",
    "code": "POP-DP-002",
    "version": "v3.0",
    "homologatedBy": "Diretoria Jurídica & CEO",
    "timeWindow": "10:30 - 12:00",
    "title": "Gestão Diária de Prazos de Rescisões Trabalhistas (Art. 477 da CLT)",
    "deliverable": "Quadro de controle de rescisões com contagem de prazo (máximo 10 dias corridos), exames demissionais agendados e guias rescisórias enviadas ao financeiro para zero multas",
    "frequency": "daily",
    "orderIndex": 2,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-DP-002\n**Cadeira:** Departamento Pessoal & Folha (DP) | **Versão:** 3.0 | **Periodicidade:** Diária\n\n---\n\n#### 1. Blindagem de Prazos Rescisórios (Zero Multas Art. 477 CLT)\n1. Monitorar diariamente comunicações de demissão (com aviso trabalhado ou indenizado).\n2. Calcular o prazo limite improrrogável: **exatamente 10 dias corridos** contados a partir do término do contrato.\n3. Agendar exame médico demissional no prazo legal.\n4. Elaborar TRCT, gerar guias de FGTS rescisório (chave de saque) e demonstrativo de médias salariais.\n5. Encaminhar borderô rescisório com 48h de antecedência ao Financeiro para agendamento no lote da tarde, garantindo comprovante dentro do prazo."
  },
  {
    "id": "block-rh-03",
    "roleId": "role-rh-02",
    "code": "POP-DP-003",
    "version": "v3.0",
    "homologatedBy": "Diretoria de Operações",
    "timeWindow": "15:30 - 17:30",
    "title": "Auditoria Diária de Efetivo, Vagas Críticas & Interface com Mesa de Operações",
    "deliverable": "Controle de SLA de vagas em aberto (máximo 72h para reposição definitiva), alinhamento de candidatos e controle do absenteísmo diário",
    "frequency": "daily",
    "orderIndex": 3,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-DP-003\n**Cadeira:** Departamento Pessoal & Folha (DP) | **Versão:** 3.0 | **Periodicidade:** Diária\n\n---\n\n#### 1. Gestão Diária de Pessoas & Vagas\n1. Cobrar diariamente do recrutamento e seleção o status de preenchimento dos postos em aberto (SLA máximo de 72h).\n2. Cruzar postos com maior índice de absenteísmo para entender as causas (escala, transporte ou liderança).\n3. Auditar contratos com acúmulo de horas extras e dobras, atuando para direcionar contratações imediatas."
  },
  {
    "id": "block-rh-04",
    "roleId": "role-rh-02",
    "code": "POP-DP-004",
    "version": "v3.0",
    "homologatedBy": "Compliance Trabalhista & CEO",
    "timeWindow": "08:00 - 17:30",
    "title": "Fechamento Oficial do Período de Ponto Eletrônico (Dia 25)",
    "deliverable": "Espelhos de ponto fechados de 100% dos colaboradores (período 26 a 25) com totalização de horas normais, extras, noturnas, faltas e DSR",
    "frequency": "monthly",
    "dayOfMonth": 25,
    "orderIndex": 4,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-DP-004\n**Cadeira:** Departamento Pessoal & Folha (DP) | **Versão:** 3.0 | **Periodicidade:** Mensal (Todo dia 25)\n\n---\n\n#### 1. Fechamento de Ponto (Período 26 a 25)\n*O fechamento de ponto ocorre exclusivamente no dia 25 de cada mês.*\n\n1. Travar as marcações do período (26 do mês anterior a 25 do mês corrente).\n2. Consolidar o cálculo de:\n   - Horas normais trabalhadas\n   - Horas extras (50%, 100% e feriados)\n   - Adicional noturno e hora reduzida noturna\n   - DSR e faltas injustificadas\n   - Atestados médicos homologados\n3. Emitir espelhos de ponto para assinatura dos colaboradores e encarregados."
  },
  {
    "id": "block-rh-05",
    "roleId": "role-rh-02",
    "code": "POP-DP-005",
    "version": "v3.0",
    "homologatedBy": "Diretoria Executiva / CEO",
    "timeWindow": "08:00 - 17:30",
    "title": "Processamento e Fechamento da Folha de Pagamento Analítica (Pós Dia 25)",
    "deliverable": "Folha de pagamento calculada por centro de custo, holerites emitidos e guias de FGTS Digital e DCTFWeb (INSS) geradas e enviadas ao Financeiro",
    "frequency": "monthly",
    "dayOfMonth": 28,
    "orderIndex": 5,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-DP-005\n**Cadeira:** Departamento Pessoal & Folha (DP) | **Versão:** 3.0 | **Periodicidade:** Mensal (Dias 26 a 30)\n\n---\n\n#### 1. Cálculo da Folha Pós-Fechamento de Ponto\n*Esta rotina ocorre após o dia 25, quando o ponto já foi totalmente auditado.*\n\n1. Importar o arquivo de variáveis do ponto para o sistema de folha de pagamento.\n2. Processar a folha de pagamento discriminada por contrato/empresa.\n3. Emitir o espelho analítico da folha e conferir totais de salários, adicionais e descontos de benefícios.\n4. Transmitir o eSocial e gerar as guias de **FGTS Digital** e **DCTFWeb / INSS** para envio ao Financeiro."
  },
  {
    "id": "block-rh-06",
    "roleId": "role-rh-02",
    "code": "POP-DP-006",
    "version": "v3.0",
    "homologatedBy": "Diretoria de Operações",
    "timeWindow": "09:00 - 12:00",
    "title": "Compra & Recarga de Vale-Transporte (Último Dia Útil do Mês)",
    "deliverable": "Pedidos de recarga de VT transmitidos às operadoras e faturas enviadas ao Financeiro para liberação no mesmo dia, com crédito garantido no 1º dia útil",
    "frequency": "monthly",
    "dayOfMonth": 999,
    "orderIndex": 6,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-DP-006\n**Cadeira:** Departamento Pessoal & Folha (DP) | **Versão:** 3.0 | **Periodicidade:** Mensal (Último Dia Útil)\n\n---\n\n#### 1. Compra de Vale-Transporte (VT)\n*A compra de VT ocorre no último dia útil do mês para crédito no 1º dia útil seguinte.*\n\n1. Apurar os dias úteis de trabalho do mês subsequente para cada colaborador e escala.\n2. Descontar os dias de faltas ou férias ocorridas no período de ponto fechado.\n3. Gerar os pedidos de compra nas concessionárias de transporte público e operadoras de bilhetagem.\n4. Enviar a fatura de VT para o Financeiro liquidar no borderô da tarde das 14:30 do último dia útil."
  },
  {
    "id": "block-rh-07",
    "roleId": "role-rh-02",
    "code": "POP-DP-007",
    "version": "v3.0",
    "homologatedBy": "Diretoria Financeira & CEO",
    "timeWindow": "08:30 - 12:00",
    "title": "Pagamento de Salários & Compra/Recarga de Vale-Alimentação (5º Dia Útil)",
    "deliverable": "Arquivo CNAB de salários transmitido ao banco e recarga de cartões de Vale Alimentação/Refeição (VA/VR) creditados aos colaboradores",
    "frequency": "monthly",
    "dayOfMonth": 555,
    "orderIndex": 7,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-DP-007\n**Cadeira:** Departamento Pessoal & Folha (DP) | **Versão:** 3.0 | **Periodicidade:** Mensal (5º Dia Útil)\n\n---\n\n#### 1. Salários e Vale-Alimentação (5º Dia Útil)\n*No 5º dia útil são pagos os salários e liberados os benefícios de alimentação (VA/VR).*\n\n1. Gerar e validar o arquivo bancário CNAB de liquidação dos salários líquidos.\n2. Gerar pedido de crédito de Vale-Alimentação e Vale-Refeição nas operadoras (Sodexo, Alelo, Flash, etc.).\n3. Despachar com o Financeiro para liberação no lote das 14:30 com o CEO.\n4. Confirmar disponibilidade de saldo nas contas e cartões dos colaboradores."
  },
  {
    "id": "block-1792084792001",
    "roleId": "role-1792084692479",
    "code": "POP-OPE-001",
    "version": "v3.0",
    "homologatedBy": "Diretoria Executiva / CEO",
    "timeWindow": "07:30 - 08:15",
    "title": "Mesa de Operações: Índice de Cobertura 100%, Faltas & Diaristas Reservas",
    "deliverable": "100% dos postos de clientes cobertos até as 08:00 com presenças confirmadas e diaristas volantes posicionados",
    "frequency": "daily",
    "orderIndex": 1,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-OPE-001\n**Cadeira:** Head de Operações | **Versão:** 3.0 | **Periodicidade:** Diária\n\n---\n\n#### 1. Mesa de Operações Diária (07:30 - 08:15)\n1. Monitorar o painel de presença em tempo real de todos os postos de clientes.\n2. Identificar faltas não avisadas e remanejar a equipe volante ou acionar diaristas reservas credenciados.\n3. Garantir que até as 08:00 todos os postos críticos de portaria, limpeza e facilities estejam operando normalmente.\n4. Registrar o custo das diárias acionadas e encaminhar a planilha ao Financeiro."
  },
  {
    "id": "block-1792084792002",
    "roleId": "role-1792084692479",
    "code": "POP-OPE-002",
    "version": "v3.0",
    "homologatedBy": "Conselho Diretor",
    "timeWindow": "08:30 - 12:30",
    "title": "Porta Fora: Visitas Executivas a Síndicos, Contratantes & Auditorias In Loco",
    "deliverable": "Visitas presenciais a contratos prioritários, relacionamento com tomadores de serviço e aplicação de checklists de governança",
    "frequency": "daily",
    "orderIndex": 2,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-OPE-002\n**Cadeira:** Head de Operações | **Versão:** 3.0 | **Periodicidade:** Diária\n\n---\n\n#### 1. Atuação Executiva em Campo (Porta Fora)\n1. Realizar visitas de relacionamento com síndicos, gerentes prediais e gestores de compras.\n2. Acompanhar a percepção de valor dos serviços prestados.\n3. Identificar oportunidades de expansão de escopo (vitrificação, tratamento de piso, dedetização).\n4. Resolver atritos operacionais antes que virem notificações contratuais."
  },
  {
    "id": "block-1792084792003",
    "roleId": "role-1792084692479",
    "code": "POP-OPE-003",
    "version": "v3.0",
    "homologatedBy": "Diretoria de Operações",
    "timeWindow": "15:30 - 17:30",
    "title": "Gestão Diária de Vagas em Aberto, SLA de Reposição & Absenteísmo",
    "deliverable": "Painel diário de vagas críticas, cobrança do SLA de 72h junto ao DP/RH e auditoria de contratos com horas extras forçadas",
    "frequency": "daily",
    "orderIndex": 3,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-OPE-003\n**Cadeira:** Head de Operações | **Versão:** 3.0 | **Periodicidade:** Diária\n\n---\n\n#### 1. Gestão de Pessoas & Eficiência Operacional\n1. Cobrar do DP/RH o cumprimento do SLA de contratação para postos vagos (máximo 72h para reposição definitiva).\n2. Cruzar postos com absenteísmo crônico e propor rotação de equipe.\n3. Auditar despesas geradas por dobras e horas extras decorrentes de falta de pessoal."
  },
  {
    "id": "block-1792084792004",
    "roleId": "role-1792084692479",
    "code": "POP-OPE-004",
    "version": "v3.0",
    "homologatedBy": "CEO / Diretoria",
    "timeWindow": "14:00 - 16:30",
    "title": "Gestão Semanal de Visitas & Relatório de Entrega (Checklist Fácil)",
    "deliverable": "Consolidado semanal de auditorias fotográficas e checklists realizados via ferramenta Checklist Fácil, com índices de conformidade por posto enviados à Diretoria",
    "frequency": "weekly",
    "dayOfWeek": 5,
    "orderIndex": 4,
    "sopMarkdown": "### Procedimento Operacional Padrão • POP-OPE-004\n**Cadeira:** Head de Operações | **Versão:** 3.0 | **Periodicidade:** Semanal (Sextas)\n\n---\n\n#### 1. Relatório Semanal de Entrega (Checklist Fácil)\n1. Extrair os relatórios de vistorias executadas pelos supervisores e coordenadores na ferramenta **Checklist Fácil**.\n2. Auditar evidências fotográficas de limpeza de hall, garagens, sanitários, vidros e maquinários.\n3. Consolidar o percentual médio de conformidade técnica de cada contrato.\n4. Apresentar o dossiê executivo de qualidade ao CEO no Comitê de Operações da sexta-feira."
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
    "type": "operational_cadence",
    "frequency": "daily",
    "weekDays": [
      1,
      2,
      3,
      4,
      5
    ],
    "includeWeekends": false,
    "agendaItems": [
      "Apresentar lote de pagamentos do dia montado e auditado (títulos validados com NF e pedido de compra)",
      "Conferir conciliação bancária das entradas da manhã (recebimentos de faturas de clientes)",
      "Apresentar contas operacionais do dia: químicos recebidos, EPIs e diárias de diaristas da Operação",
      "Apresentar posição de fluxo de caixa projetado para D+1 e provisão de folha/benefícios",
      "Aprovação expressa do lote de pagamentos pelo CEO no app do banco / Conta Azul"
    ]
  },
  {
    "id": "ritual-fin-02",
    "roleId": "role-fin-01",
    "code": "RIT-FIN-02",
    "timeSlot": "16:00",
    "title": "Auditoria Semanal de Cartões de Crédito Corporativos por Empresa do Grupo",
    "durationMinutes": 30,
    "type": "operational_cadence",
    "frequency": "weekly",
    "weekDays": [
      4
    ],
    "includeWeekends": false,
    "agendaItems": [
      "Apresentar faturas e lançamentos dos cartões corporativos de cada CNPJ do grupo",
      "Conferir notas fiscais e comprovantes de combustível, viagens e despesas de campo",
      "Identificar lançamentos sem comprovação fiscal e bloquear cartões em inconformidade",
      "Alocar despesas no centro de custo correto de cada empresa"
    ]
  },
  {
    "id": "ritual-fin-03",
    "roleId": "role-fin-01",
    "code": "RIT-FIN-03",
    "timeSlot": "15:30",
    "title": "Comitê Mensal de Controladoria: Apuração de Resultados por Contrato & Empresa",
    "durationMinutes": 40,
    "type": "operational_cadence",
    "frequency": "monthly",
    "monthDay": 28,
    "agendaItems": [
      "Apresentar DRE Gerencial consolidado por empresa/CNPJ do grupo (após pagar folha, benefícios, materiais e tributos)",
      "Apresentar DRE analítico por contrato (Margem de Contribuição real: Faturamento (-) Folha (-) Benefícios (-) Insumos (-) HE)",
      "Auditar faturamento mensal emitido vs medido e glosas aplicadas pelos clientes",
      "Pactuar planos de renegociação de preço ou substituição de equipe para contratos deficitários",
      "Deliberar distribuição de resultados e plano de investimentos com o CEO"
    ]
  },
  {
    "id": "ritual-rh-01",
    "roleId": "role-rh-02",
    "code": "RIT-DP-01",
    "timeSlot": "15:00",
    "title": "Despacho Semanal de DP & Pessoal com o CEO: Ponto, Rescisões e Vagas",
    "durationMinutes": 30,
    "type": "operational_cadence",
    "frequency": "weekly",
    "weekDays": [
      2
    ],
    "includeWeekends": false,
    "agendaItems": [
      "Apresentar fechamento dos espelhos de ponto eletrônico e mapa de horas extras da semana por contrato",
      "Auditar quadro de rescisões trabalhistas em andamento: cumprimento do prazo de 10 dias da CLT e agendamento de exames demissionais",
      "Auditar atestados médicos recebidos (validação de CRM) e plano de contenção de faltas",
      "Acompanhar SLA de reposição de vagas em aberto (meta 72h) com a Mesa de Operações",
      "Alinhar calendário do mês: previsão de fechamento de ponto dia 25, compra de VT e crédito de salários/VA no 5º dia útil"
    ]
  },
  {
    "id": "ritual-rh-02",
    "roleId": "role-rh-02",
    "code": "RIT-DP-02",
    "timeSlot": "15:30",
    "title": "Comitê Mensal de Fechamento de Folha & Encargos com o CEO (Pós Dia 25)",
    "durationMinutes": 30,
    "type": "operational_cadence",
    "frequency": "monthly",
    "monthDay": 28,
    "agendaItems": [
      "Apresentar fechamento oficial do período de ponto (26 a 25) consolidado por empresa",
      "Apresentar prévia analítica da folha de pagamento e mapa de provisões de 13º e férias",
      "Conferir guias de FGTS Digital e DCTFWeb (INSS) geradas para pagamento no dia 20",
      "Validar total de recarga do Vale-Transporte (último dia útil) e salários/VA (5º dia útil)"
    ]
  },
  {
    "id": "ritual-head-01",
    "roleId": "role-1792084692479",
    "code": "RIT-HEAD-01",
    "timeSlot": "08:15",
    "title": "Mesa de Despacho Operacional: Cobertura 100%, Faltas & Vagas Críticas",
    "durationMinutes": 20,
    "type": "operational_cadence",
    "frequency": "daily",
    "weekDays": [
      1,
      2,
      3,
      4,
      5
    ],
    "includeWeekends": false,
    "agendaItems": [
      "Conferir fechamento da Mesa de Operações: 100% dos postos cobertos e diaristas reservas confirmados",
      "Auditar taxa de absenteísmo (ABS) do dia e contratos com faltas reincidentes",
      "Cobrar SLA do RH/DP sobre vagas em aberto, prazos de reposição e triagem de substitutos",
      "Validar alinhamento com Coordenadores de Campo sobre prioridades operacionais antes da saída para a rua"
    ]
  },
  {
    "id": "ritual-head-02",
    "roleId": "role-1792084692479",
    "code": "RIT-HEAD-02",
    "timeSlot": "14:30",
    "title": "Comitê Semanal de Operações: Relatório de Visitas (Checklist Fácil) & Retenção",
    "durationMinutes": 30,
    "type": "operational_cadence",
    "frequency": "weekly",
    "weekDays": [
      5
    ],
    "includeWeekends": false,
    "agendaItems": [
      "Apresentar consolidado semanal de auditorias e checklists realizados na ferramenta Checklist Fácil",
      "Apresentar notas de qualidade e índice de conformidade dos postos auditados in loco",
      "Auditar chamados críticos e reclamações de clientes/síndicos da semana e medidas corretivas tomadas",
      "Auditar custos da semana com diárias operacionais e horas extras de cobertura",
      "Apresentar previsão de novos aditivos contratuais e cronograma de implantação de novos clientes"
    ]
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
