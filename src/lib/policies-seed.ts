import { CorporatePolicy } from './types';

export const INITIAL_POLICIES: CorporatePolicy[] = [
  {
    id: 'pol-01',
    code: 'POL-FIN-001',
    title: 'Política de Reembolso e Despesas Corporativas',
    category: 'finance',
    description: 'Estabelece as regras, limites e critérios para comprovação de gastos, viagens, refeições, quilometragem e adiantamentos a colaboradores.',
    version: 'v2.0',
    status: 'active',
    targetApproverBody: 'CONS-ADM',
    authorName: 'Cristiano Silva',
    authorRoleTitle: 'CEO & Diretor Presidente',
    homologatedBy: 'Conselho de Administração (CONS-ADM)',
    approvedAt: '2026-01-15',
    minuteSessionCode: 'SES-01/2026',
    nextReviewDate: '2027-01-15',
    contentMarkdown: `### 1. Objetivo & Abrangência
Esta política define as diretrizes para reembolso de despesas corporativas incorridas por colaboradores, líderes e diretores no exercício de suas atividades em nome da RGR Facilities.

---

### 2. Diretrizes Gerais de Reembolso
1. **Comprovação Fiscal Obrigatória:** Somente serão reembolsadas despesas comprovadas mediante Nota Fiscal Eletrônica (NFC-e ou NF-e) com discriminação dos itens e CNPJ da empresa quando aplicável. Cupons não fiscais ilegíveis não serão aceitos.
2. **Prazo de Prestação de Contas:** Todas as despesas devem ser lançadas e protocoladas no sistema até **5 (cinco) dias úteis** após a data de realização ou retorno de viagem.
3. **Alçadas e Limites de Despesas Diárias:**
   - **Refeição / Almoço em Deslocamento:** Até R$ 45,00 por dia (excedentes correm por conta do colaborador).
   - **Jantar (quando estendido após 20h):** Até R$ 55,00 por dia.
   - **Quilometragem Rodada (Veículo Próprio):** R$ 1,25 por km rodado (mediante print de rota Google Maps e autorização prévia da coordenação).
   - **Pedágios e Estacionamento:** Reembolso integral mediante comprovante fiscal ou extrato Sem Parar/Veloe corporativo.

---

### 3. Vedações e Despesas Não Reembolsáveis
- Bebidas alcoólicas em qualquer hipótese de refeição individual.
- Multas de trânsito ou infrações de qualquer natureza.
- Despesas pessoais em hotéis (frigobar, lavanderia particular, filmes).

---

### 4. Fluxo de Aprovação e Liquidação
1. O solicitante anexa os comprovantes fiscais no sistema.
2. O gestor da cadeira aprova a conformidade operacional em até 48h.
3. A Controladoria & Finanças audita e inclui no borderô de pagamento das quintas-feiras.`
  },
  {
    id: 'pol-02',
    code: 'POL-FIN-002',
    title: 'Política de Alçadas de Aprovação & Assinaturas',
    category: 'finance',
    description: 'Matriz formal de poderes, limites financeiros e governança para contratação de fornecedores, compras de Capex e despesas extraordinárias.',
    version: 'v1.5',
    status: 'active',
    targetApproverBody: 'CONS-ADM',
    authorName: 'Marcos Oliveira',
    authorRoleTitle: 'Diretor de Operações',
    homologatedBy: 'Conselho de Administração (CONS-ADM)',
    approvedAt: '2026-02-01',
    minuteSessionCode: 'SES-01/2026',
    nextReviewDate: '2027-02-01',
    contentMarkdown: `### 1. Matriz de Alçadas de Decisão Financeira
Nenhuma despesa ou compromisso contratual pode ser assumido sem a devida autorização conforme os limites estipulados abaixo:

| Faixa de Valor (R$) | Instância de Aprovação Mínima | Instrumento Exigido |
| :--- | :--- | :--- |
| Até R$ 5.000,00 | Coordenador de Operações / Gerente de Área | 2 cotações mínimas |
| R$ 5.000,01 a R$ 25.000,00 | Diretor de Área + Head Financeiro | 3 cotações + Pedido de Compra |
| R$ 25.000,01 a R$ 100.000,00 | CEO & Diretor Executivo | Contrato formal com parecer jurídico |
| Acima de R$ 100.000,00 | Conselho de Administração (CONS-ADM) | Ata homologada em Sessão Oficial |

---

### 2. Aquisição de Ativos e Capex (Maquinários e Frotas)
Qualquer compra de lavadoras industriais, enceradeiras, veículos ou equipamentos pesados exige estudo de viabilidade (Payback) validado pelo Comitê de Resultados & Finanças (COM-FIN).`
  },
  {
    id: 'pol-03',
    code: 'POL-OPE-001',
    title: 'Política de Gestão Operacional e SLAs de Facilities',
    category: 'operations',
    description: 'Padrões de tempo de resposta, reposição de postos vagos, vistorias técnicas e qualidade de entrega em postos de clientes contratantes.',
    version: 'v3.0',
    status: 'active',
    targetApproverBody: 'COM-CLI',
    authorName: 'Marcos Oliveira',
    authorRoleTitle: 'Head de Facilities',
    homologatedBy: 'Comitê de Gestão de Clientes & Qualidade (COM-CLI)',
    approvedAt: '2026-03-10',
    minuteSessionCode: 'SES-02/2026',
    nextReviewDate: '2027-03-10',
    contentMarkdown: `### 1. Diretriz Inegociável de Cobertura de Postos
No modelo de excelência operacional da RGR, **nenhum posto contratado pode permanecer descoberto**:
- **Faltas não previstas (06:00 às 07:30):** O Coordenador de Operações deve remanejar equipe volante ou acionar diaristas credenciados até as 08:00.
- **SLA Máximo de Reposição em Posto Crítico:** 60 minutos a contar da abertura do chamado.

---

### 2. Vistorias Técnicas & Auditoria Checklist Fácil
- Cada contrato ativo deve receber no mínimo **2 vistorias presenciais por mês** realizadas pelo Supervisor de Área.
- A conformidade das evidências fotográficas deve atingir nota mínima de **92%** de atendimento aos padrões técnicos de limpeza e conservação.
- Vistorias com nota inferior a 85% geram abertura imediata de Plano de Ação 5W2H na Central de Ações.`
  },
  {
    id: 'pol-04',
    code: 'POL-RH-001',
    title: 'Política de Uso de EPIs, Fardamento e Segurança do Trabalho',
    category: 'hr_people',
    description: 'Normas de entrega, controle de fichas de EPI, substituição periódica e uso obrigatório de uniformes e equipamentos de proteção.',
    version: 'v2.1',
    status: 'active',
    targetApproverBody: 'CONS-ADM',
    authorName: 'Ana Beatriz',
    authorRoleTitle: 'Head de DP & RH',
    homologatedBy: 'Diretoria de Operações & DP',
    approvedAt: '2026-02-20',
    nextReviewDate: '2027-02-20',
    contentMarkdown: `### 1. Obrigatoriedade de Uso de EPI (NR-06)
1. É expressamente proibido o início das atividades de limpeza, tratamento de piso ou portaria sem a utilização integral do fardamento e EPIs homologados.
2. Cada colaborador recebe no ato da admissão seu kit completo mediante assinatura física ou biométrica na **Ficha de EPI**.

---

### 2. Substituição e Desgaste
- Luvas impermeáveis e calçados antiderrapantes devem ser substituídos imediatamente a qualquer sinal de rasgo ou perda de aderência.
- O extravio ou dano proposital aos equipamentos ensejará apuração conforme diretrizes da CLT.`
  },
  {
    id: 'pol-05',
    code: 'POL-GOV-001',
    title: 'Código de Conduta Ética, Anticorrupção e Governança',
    category: 'governance',
    description: 'Princípios éticos fundamentais, prevenção de conflito de interesses, sigilo de dados de clientes e conduta corporativa.',
    version: 'v1.0',
    status: 'active',
    targetApproverBody: 'CONS-ADM',
    authorName: 'Cristiano Silva',
    authorRoleTitle: 'CEO & Presidente do Conselho',
    homologatedBy: 'Conselho de Administração (CONS-ADM)',
    approvedAt: '2026-01-10',
    minuteSessionCode: 'SES-01/2026',
    nextReviewDate: '2028-01-10',
    contentMarkdown: `### 1. Princípios Éticos da RGR
A RGR rege suas relações com base na integridade, transparência, pontualidade e conformidade absoluta com as leis vigentes.

---

### 2. Relação com Fornecedores e Contratantes
- É terminantemente vedado o recebimento ou concessão de quaisquer brindes, vantagens financeiras, viagens ou presentes cujo valor unitário exceda R$ 100,00.
- Conflitos de interesse (grau de parentesco com fornecedores ou concorrentes) devem ser formalmente declarados à Secretaria de Governança.`
  }
];
