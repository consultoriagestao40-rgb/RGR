import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title, department, code } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Título da cadeira é obrigatório' }, { status: 400 });
    }

    const cleanTitle = title.trim();
    const cleanDept = (department || '').trim();
    const apiKey = process.env.GEMINI_API_KEY;

    // Se tiver chave Gemini, tenta gerar com o modelo
    if (apiKey) {
      try {
        const prompt = `Você é um consultor sênior de governança corporativa, desenho organizacional e Método Falconi (Gerenciamento da Rotina) para empresas prestadoras de serviços e facilities (Facilities Brasil S.A. / Grupo RGR Facilities).
        
Elabore o Escopo de Atuação e Responsabilidade (Missão da Cadeira) para o seguinte cargo:
- Cargo / Cadeira: ${cleanTitle}
- Departamento: ${cleanDept || 'Operações e Governança'}
- Código sugerido: ${code || 'CAD'}

Diretrizes:
- Redija um texto executivo, objetivo e claro em 1 parágrafo (cerca de 3 a 5 linhas).
- Destaque o objetivo principal da cadeira, a missão do profissional e os entregáveis-chave de rotina.
- Sem rodeios, saudações ou marcadores desnecessários. Apenas o texto pronto para colar no campo de descrição.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 300
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (generatedText) {
            return NextResponse.json({ description: generatedText });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini generateRoleDescription failed, using heuristic fallback:', geminiError);
      }
    }

    // Heurística Executiva Falconi / Facilities quando a API externa não responder
    const fallbackDescription = generateHeuristicDescription(cleanTitle, cleanDept);
    return NextResponse.json({ description: fallbackDescription });

  } catch (error) {
    console.error('Error in /api/ai/role-description:', error);
    return NextResponse.json({ error: 'Erro ao gerar descrição com IA' }, { status: 500 });
  }
}

function generateHeuristicDescription(title: string, dept: string): string {
  const t = title.toLowerCase();
  const d = dept.toLowerCase();

  if (t.includes('comercial') || t.includes('vendas') || t.includes('marketing') || d.includes('comercial')) {
    return `Cadeira executiva de liderança comercial responsável pela prospecção de grandes contas, precificação e elaboração de propostas para contratos de Facilities e terceirização, negociação de margens operacionais e expansão da carteira de clientes, garantindo a conversão de novos negócios com sustentabilidade financeira.`;
  }

  if (t.includes('financeiro') || t.includes('controladoria') || t.includes('contabil') || d.includes('finan')) {
    return `Cadeira de controle financeiro e tesouraria diária responsável pela gestão do fluxo de caixa, conciliação bancária, liberação de borderôs de pagamento a fornecedores, faturamento de medições contratuais e reporte de DRE gerencial para sustentação da governança e liquidez corporativa.`;
  }

  if (t.includes('oper') || t.includes('facilities') || t.includes('posto') || d.includes('oper')) {
    return `Cadeira de comando e supervisão operacional responsável pelo cumprimento rigoroso dos SLAs contratuais nos postos de trabalho, gestão de equipes terceirizadas, controle de faltas e coberturas imediatas, consumo eficiente de insumos químicos e auditoria de qualidade nas instalações dos clientes.`;
  }

  if (t.includes('rh') || t.includes('dp') || t.includes('pessoal') || t.includes('recursos humanos') || d.includes('rh') || d.includes('dp')) {
    return `Cadeira de gestão de gente e departamento pessoal responsável pelo fechamento pontual de folha de pagamento, controle rígido de ponto eletrônico, entrega de benefícios (VT/VA), cumprimento das convenções coletivas de trabalho (CCT) e acompanhamento de indicadores de absenteísmo e turnover.`;
  }

  if (t.includes('compras') || t.includes('suprimentos') || t.includes('logística')) {
    return `Cadeira estratégica de suprimentos responsável pelo abastecimento contínuo de químicos, materiais de limpeza e EPIs em todos os postos de operação, negociação de prazos e descontos com fornecedores homologados e garantia do menor custo sem perda de padrão técnico.`;
  }

  if (t.includes('diretor') || t.includes('ceo') || t.includes('gerente') || t.includes('head')) {
    return `Cadeira de liderança executiva responsável pelo direcionamento estratégico, coordenação das metas operacionais da área, governança dos ritos diários de acompanhamento, reporte direto à Diretoria Executiva e garantia da rentabilidade e qualidade dos serviços prestados.`;
  }

  return `Cadeira operacional responsável pela execução padronizada das rotinas e procedimentos operacionais padrão (POPs), assegurando a entrega dos critérios de aceite da área de ${dept || 'Facilities'}, conformidade com as diretrizes do Método Falconi e reporte de anomalias para manutenção da excelência nos serviços.`;
}
