import { DocumentTemplate, EmailLog, JudicialRecoveryProcess } from '../types';

export const INITIAL_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tpl-carta-credor',
    title: 'Carta de Notificação ao Credor (Art. 22, I, "a" c/c Art. 7º, §2º LRF)',
    category: 'notificacao_credor',
    description: 'Comunicação oficial ao credor informando o valor e a classificação de seu crédito arrolado no processo, com instruções para habilitação/divergência.',
    isDefault: true,
    lastModified: '2026-08-10',
    availableTags: [
      { tag: '{{nome_credor}}', label: 'Nome do Credor', sample: 'Banco Safra S/A' },
      { tag: '{{documento_credor}}', label: 'CPF/CNPJ do Credor', sample: '58.160.789/0001-28' },
      { tag: '{{classe_credito}}', label: 'Classe do Crédito', sample: 'Classe III - Quirografário' },
      { tag: '{{valor_declarado}}', label: 'Valor Declarado na Lista do Devedor', sample: 'R$ 1.250.000,00' },
      { tag: '{{valor_apurado}}', label: 'Valor Apurado pelo AJ', sample: 'R$ 1.250.000,00' },
      { tag: '{{natureza_credito}}', label: 'Natureza do Crédito', sample: 'Cédula de Crédito Bancário' },
      { tag: '{{nome_devedora}}', label: 'Razão Social da Devedora', sample: 'Grupo Varejo Brasil S/A' },
      { tag: '{{cnpj_devedora}}', label: 'CNPJ da Devedora', sample: '12.345.678/0001-90' },
      { tag: '{{numero_processo}}', label: 'Número do Processo', sample: '1023456-78.2026.8.26.0100' },
      { tag: '{{vara_juizo}}', label: 'Vara e Juízo', sample: '1ª Vara de Falências e Recuperações Judiciais' },
      { tag: '{{comarca}}', label: 'Comarca', sample: 'São Paulo/SP' },
      { tag: '{{nome_administrador}}', label: 'Nome do AJ', sample: 'Dr. Roberto Silveira Mendes' },
      { tag: '{{escritorio_administrador}}', label: 'Escritório do AJ', sample: 'Silveira Mendes Administração Judicial' },
      { tag: '{{email_administrador}}', label: 'E-mail do AJ para Divergências', sample: 'contato@silveiramendes.adv.br' },
      { tag: '{{data_limite_divergencia}}', label: 'Data Limite para Divergência', sample: '25/08/2026' },
      { tag: '{{data_hoje}}', label: 'Data de Emissão', sample: '15/08/2026' },
    ],
    content: `COMUNICAÇÃO AOS CREDORES - ART. 22, INCISO I, ALÍNEA "A" DA LEI Nº 11.101/2005

Prezado(a) Senhor(a):
{{nome_credor}}
Documento nº: {{documento_credor}}

Ref.: Processo de Recuperação Judicial nº {{numero_processo}}
Juízo: {{vara_juizo}} do Foro Central da Comarca de {{comarca}}
Recuperanda: {{nome_devedora}} (CNPJ nº {{cnpj_devedora}})

Na qualidade de Administrador Judicial nomeado nos autos do processo em epígrafe, venho por meio desta NOTIFICAR V. Sa., nos termos do Artigo 22, inciso I, alínea "a" da Lei nº 11.101/2005, que o seu crédito em face da Recuperanda encontra-se arrolado nas seguintes condições:

• Classe do Crédito: {{classe_credito}}
• Natureza: {{natureza_credito}}
• Valor Declarado pela Recuperanda (Art. 52, §1º): {{valor_declarado}}
• Valor Constatado/Apurado pelo Administrador Judicial: {{valor_apurado}}

INFORMAÇÕES SOBRE HABILITAÇÕES E DIVERGÊNCIAS ADMINISTRATIVAS:
Caso V. Sa. discorde do valor ou da classificação acima indicados, ou caso seu crédito não conste da relação oficial, fica V. Sa. ciente de que poderá apresentar ao Administrador Judicial suas DIVERGÊNCIAS ADMINISTRATIVAS ou HABILITAÇÕES DE CRÉDITO (Art. 7º, §1º da LRF) no prazo improrrogável até {{data_limite_divergencia}}.

As divergências deverão ser protocoladas preferencialmente pelo e-mail oficial:
E-mail: {{email_administrador}}
Telefone: {{telefone_administrador}}

Deverão ser anexados à manifestação:
1. Documentos comprobatórios da origem, liquidez e exigibilidade do crédito (notas fiscais, contratos, títulos, etc.);
2. Memória atualizada de cálculo do crédito até a data do pedido de recuperação judicial;
3. Procuração com poderes específicos e cópia do documento de representação social.

Permanecemos à disposição para prestar quaisquer esclarecimentos adicionais necessários ao regular andamento do processo.

{{comarca}}, {{data_hoje}}.

Atenciosamente,

_________________________________________
{{nome_administrador}}
{{escritorio_administrador}}
Administrador Judicial Nomeado
{{documento_administrador}}`,
  },
  {
    id: 'tpl-rma-sintetico',
    title: 'Relatório Mensal de Atividades (RMA) - Síntese Executiva',
    category: 'rma',
    description: 'Estrutura padrão de fiscalização das atividades e fluxo de caixa da devedora para protocolo em juízo.',
    isDefault: true,
    lastModified: '2026-08-05',
    availableTags: [
      { tag: '{{nome_devedora}}', label: 'Razão Social', sample: 'Grupo Varejo Brasil S/A' },
      { tag: '{{numero_processo}}', label: 'Número do Processo', sample: '1023456-78.2026.8.26.0100' },
      { tag: '{{vara_juizo}}', label: 'Vara', sample: '1ª Vara Empresarial' },
      { tag: '{{nome_administrador}}', label: 'Administrador Judicial', sample: 'Dr. Roberto Silveira Mendes' },
      { tag: '{{data_hoje}}', label: 'Data', sample: '15/08/2026' },
    ],
    content: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {{vara_juizo}} DA COMARCA DE {{comarca}}

Autos nº: {{numero_processo}}
Recuperanda: {{nome_devedora}}

{{nome_administrador}}, Administrador Judicial devidamente nomeado e compromissado nos autos da RECUPERAÇÃO JUDICIAL de {{nome_devedora}}, vem, respeitosamente, à presença de Vossa Excelência, em cumprimento ao disposto no Art. 22, II, "c" da Lei nº 11.101/2005, apresentar o:

RELATÓRIO MENSAL DE ATIVIDADES (RMA) - MÊS DE REFERÊNCIA

1. VISÃO GERAL DAS OPERAÇÕES:
Durante o período fiscalizado, a Recuperanda manteve suas operações ativas no setor comercial, operando regularmente com as unidades fabris e de distribuição. Não foram constatadas paralisações anormais ou alienações de ativos essenciais sem prévia autorização judicial.

2. FLUXO DE CAIXA E FATURAMENTO:
Os livros fiscais e extratos bancários foram inspecionados pela equipe contábil do Administrador Judicial, constatando-se regularidade contábil conforme padrões IFRS/CPC.

3. ADIMPLEMENTO DOS CRÉDITOS EXTRACONCURSAIS:
Foram averiguados os pagamentos dos salários correntes dos colaboradores ativos, encargos previdenciários e tributos incidentes pós-pedido, estando a Recuperanda adimplente com suas obrigações correntes.

4. CONCLUSÃO:
O Administrador Judicial manifesta-se pela continuidade do processamento, sem prejuízo de novas diligências in loco e auditorias pontuais.

Nestes termos,
Pede deferimento.

{{comarca}}, {{data_hoje}}.

{{nome_administrador}}
Administrador Judicial`,
  },
  {
    id: 'tpl-edital-agc',
    title: 'Edital de Convocação de Assembleia Geral de Credores (AGC)',
    category: 'edital',
    description: 'Minuta de edital para publicação no DJe e convocação formal dos credores para deliberação do plano.',
    isDefault: false,
    lastModified: '2026-07-28',
    availableTags: [
      { tag: '{{nome_devedora}}', label: 'Nome da Devedora', sample: 'Grupo Varejo Brasil S/A' },
      { tag: '{{numero_processo}}', label: 'Número Processo', sample: '1023456-78.2026.8.26.0100' },
      { tag: '{{vara_juizo}}', label: 'Juízo', sample: '1ª Vara Empresarial' },
      { tag: '{{comarca}}', label: 'Comarca', sample: 'São Paulo/SP' },
    ],
    content: `EDITAL DE CONVOCAÇÃO DE ASSEMBLEIA GERAL DE CREDORES
(Artigos 36 e 56 da Lei nº 11.101/2005)

O(A) Doutor(a) {{nome_juiz}}, MM. Juiz(a) de Direito da {{vara_juizo}} de {{comarca}}, FAZ SABER a todos os credores e interessados na Recuperação Judicial de {{nome_devedora}} (Processo nº {{numero_processo}}), que fica CONVOCADA a ASSEMBLEIA GERAL DE CREDORES, nos seguintes termos:

• 1ª CONVOCAÇÃO: Data a definir às 14:00 horas (quórum de instalação: mais da metade dos créditos de cada classe);
• 2ª CONVOCAÇÃO: Data a definir às 14:00 horas (instalação com qualquer quórum presente).

ORDEM DO DIA:
1. Deliberação, votação e eventual aprovação, rejeição ou modificação do Plano de Recuperação Judicial apresentado pela Recuperanda;
2. Eventual constituição de Comitê de Credores;
3. Outros assuntos de interesse comum da massa concursal.

CREDENCIAMENTO:
Nos termos do Art. 37, §4º da LRF, para participarem da AGC, os credores deverão entregar ao Administrador Judicial ({{email_administrador}}), até 24 (vinte e quatro) horas antes da sessão, cópia do documento que comprove os poderes de representação.

{{comarca}}, {{data_hoje}}.`,
  },
  {
    id: 'tpl-manifestacao-prj',
    title: 'Manifestação do AJ sobre o Plano de Recuperação Judicial (Art. 53/55)',
    category: 'manifestacao_prj',
    description: 'Parecer técnico do Administrador Judicial apontando legalidade e aspectos econômicos do PRJ.',
    isDefault: false,
    lastModified: '2026-08-01',
    availableTags: [
      { tag: '{{nome_devedora}}', label: 'Devedora', sample: 'Grupo Varejo Brasil S/A' },
      { tag: '{{numero_processo}}', label: 'Processo', sample: '1023456-78.2026.8.26.0100' },
      { tag: '{{nome_administrador}}', label: 'AJ', sample: 'Dr. Roberto Silveira Mendes' },
    ],
    content: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA {{vara_juizo}} DE {{comarca}}

Autos nº {{numero_processo}}
Recuperanda: {{nome_devedora}}

{{nome_administrador}}, Administrador Judicial nomeado nos autos da Recuperação Judicial em epígrafe, vem perante V. Exa. expor e requerer o quanto segue acerca do PLANO DE RECUPERAÇÃO JUDICIAL apresentado pela Recuperanda:

1. DA TEMPESTIVIDADE:
O Plano de Recuperação Judicial fora protocolado tempestivamente no prazo de 60 (sessenta) dias previsto no Art. 53 da Lei nº 11.101/2005.

2. DO LAUDO DE VIABILIDADE ECONÔMICA E AVALIAÇÃO DE BENS:
Constatou-se que o plano encontra-se instruído com laudo econômico-financeiro e demonstração de fluxo de caixa projetado, subscrito por profissional legalmente habilitado.

3. DAS CLÁUSULAS RELEVANTES:
O AJ destaca para ciência do Juízo e dos Credores as condições de deságio proposto, carência de amortização e índices de atualização monetária constantes do instrumento.

Nestes termos,
Pede juntada e deferimento.

{{comarca}}, {{data_hoje}}.

{{nome_administrador}}
Administrador Judicial`,
  },
];

export const INITIAL_PROCESSES: JudicialRecoveryProcess[] = [
  {
    id: 'proc-01',
    processNumber: '1023456-78.2026.8.26.0100',
    debtorName: 'Grupo Varejo Brasil S/A',
    tradeName: 'Rede Varejo Mais',
    debtorDocument: '12.345.678/0001-90',
    cnae: '47.11-3-02 - Comércio varejista de mercadorias em geral',
    headquartersCity: 'São Paulo/SP',
    court: '1ª Vara de Falências e Recuperações Judiciais',
    jurisdiction: 'São Paulo / SP (Foro Central Cível)',
    judgeName: 'Dr. Paulo Rogério Bonini',

    judicialAdminName: 'Dr. Roberto Silveira Mendes',
    judicialAdminOffice: 'Silveira Mendes Administração Judicial & Perícias',
    judicialAdminDocument: 'OAB/SP 148.920 / CRC 1SP249182',
    judicialAdminEmail: 'contato@silveiramendes.adv.br',
    judicialAdminPhone: '(11) 3254-8800',
    leadAdvocate: 'Dra. Carolina Albuquerque (OAB/SP 289.410)',
    leadAccountant: 'Marcos Vinícius de Paula (CRC 1SP302194)',

    distributionDate: '2026-06-01',
    processingDecisionDate: '2026-06-15',
    art52NoticeDate: '2026-06-25',
    stayPeriodStartDate: '2026-06-15',
    stayPeriodDays: 180,
    stayPeriodExtended: false,
    planSubmissionDeadline: '2026-08-24', // 60 dias da publicação do deferimento
    planSubmittedDate: '2026-08-10',
    agcPredictedDate: '2026-10-20',

    status: 'em_processamento',
    type: 'ordinaria',
    totalPassivo: 142850000.0,
    totalCredoresCount: 14,
    rmaMonthlyDay: 15,
    lastRmaMonth: 'Julho/2026',
    notes: 'Recuperanda possui 32 lojas ativas no estado de SP. Plano de Recuperação apresentado tempestivamente. Fase de análise de divergências do Art. 7º, §2º da LRF em andamento pela equipe contábil.',

    creditors: [
      {
        id: 'c-01',
        name: 'Carlos Eduardo Nogueira (Ex-Gerente Regional)',
        document: '219.458.730-44',
        email: 'carlos.nogueira.adv@gmail.com',
        phone: '(11) 98744-1230',
        address: 'Rua das Palmeiras, 450 - SP',
        creditClass: 'CLASSE_I',
        originalValue: 145000.0,
        adjustedValue: 145000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Verbas Rescisórias e Salariais',
        notificationStatus: 'confirmado_recebimento',
        notificationSentAt: '2026-07-02 10:15',
      },
      {
        id: 'c-02',
        name: 'Mariana Silveira Ramos (Operadora de Caixa)',
        document: '388.912.445-12',
        email: 'mari.ramos@outlook.com',
        phone: '(11) 97120-9988',
        address: 'Av. Brasil, 1200 - Santo André/SP',
        creditClass: 'CLASSE_I',
        originalValue: 28500.0,
        adjustedValue: 34200.0,
        divergenceStatus: 'retificado',
        notes: 'Acolhida divergência com juntada de TRCT homologado e FGTS em atraso.',
        nature: 'Salários e Indenização Art. 477 CLT',
        notificationStatus: 'notificado_email',
        notificationSentAt: '2026-07-02 10:15',
      },
      {
        id: 'c-03',
        name: 'Sindicato dos Empregados no Comércio de SP',
        document: '62.888.190/0001-05',
        email: 'juridico@comerciarios.org.br',
        phone: '(11) 3322-1000',
        address: 'Rua Formosa, 99 - São Paulo/SP',
        creditClass: 'CLASSE_I',
        originalValue: 189000.0,
        adjustedValue: 189000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Contribuições Sindicais e Multas CCT',
        notificationStatus: 'notificado_email',
        notificationSentAt: '2026-07-03 14:20',
      },
      {
        id: 'c-04',
        name: 'Banco Itaú Unibanco S/A',
        document: '60.701.190/0001-04',
        email: 'recuperacao.creditos@itau-unibanco.com.br',
        phone: '(11) 4004-4828',
        address: 'Praça Alfredo Egydio de Souza Aranha, 100 - SP',
        creditClass: 'CLASSE_II',
        originalValue: 42000000.0,
        adjustedValue: 42000000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Cédula de Crédito Bancário com Alienação Fiduciária de Imóvel Matrícula 84.102',
        notificationStatus: 'confirmado_recebimento',
        notificationSentAt: '2026-07-02 11:00',
      },
      {
        id: 'c-05',
        name: 'Banco Bradesco S/A',
        document: '60.746.948/0001-12',
        email: 'juridico.especial@bradesco.com.br',
        phone: '(11) 3681-8000',
        address: 'Cidade de Deus, s/n - Osasco/SP',
        creditClass: 'CLASSE_II',
        originalValue: 28500000.0,
        adjustedValue: 31200000.0,
        divergenceStatus: 'divergencia_apresentada',
        notes: 'Credor alega juros contratuais até a data do pedido e divergência de IOF.',
        nature: 'Contrato de Financiamento de Ativos e Hipoteca',
        notificationStatus: 'notificado_email',
        notificationSentAt: '2026-07-02 11:05',
      },
      {
        id: 'c-06',
        name: 'Ambev S/A (Distribuição & Logística)',
        document: '07.526.557/0001-00',
        email: 'contasareceber@ambev.com.br',
        phone: '(11) 2122-1200',
        address: 'Rua Dr. Renato Paes de Barros, 1017 - SP',
        creditClass: 'CLASSE_III',
        originalValue: 15400000.0,
        adjustedValue: 15400000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Fornecimento de Mercadorias para Revenda',
        notificationStatus: 'notificado_email',
        notificationSentAt: '2026-07-02 11:10',
      },
      {
        id: 'c-07',
        name: 'Nestlé Brasil Ltda.',
        document: '60.409.075/0001-52',
        email: 'cobranca.brasil@nestle.com.br',
        phone: '(11) 5188-9000',
        address: 'Av. Chucri Zaidan, 246 - SP',
        creditClass: 'CLASSE_III',
        originalValue: 11800000.0,
        adjustedValue: 11800000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Duplicatas Mercantis Vencidas',
        notificationStatus: 'confirmado_recebimento',
        notificationSentAt: '2026-07-02 11:15',
      },
      {
        id: 'c-08',
        name: 'Unilever Brasil Industrial Ltda.',
        document: '61.068.276/0001-04',
        email: 'legal.latam@unilever.com',
        phone: '(11) 3254-9000',
        address: 'Av. das Nações Unidas, 14261 - SP',
        creditClass: 'CLASSE_III',
        originalValue: 9200000.0,
        adjustedValue: 9200000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Contratos de Fornecimento Continuado',
        notificationStatus: 'notificado_email',
        notificationSentAt: '2026-07-02 11:20',
      },
      {
        id: 'c-09',
        name: 'FIDC Empirica CredTech',
        document: '33.109.840/0001-88',
        email: 'gestao@empirica.com.br',
        phone: '(11) 3040-5000',
        address: 'Av. Brigadeiro Faria Lima, 3477 - SP',
        creditClass: 'CLASSE_III',
        originalValue: 18450000.0,
        adjustedValue: 18450000.0,
        divergenceStatus: 'em_analise_aj',
        notes: 'Divergência sobre trava bancária e cessão fiduciária de recebíveis de cartão.',
        nature: 'Cessão de Direitos Creditórios',
        notificationStatus: 'notificado_email',
        notificationSentAt: '2026-07-02 11:25',
      },
      {
        id: 'c-10',
        name: 'Distribuidora Alimentos Sabor Real EPP',
        document: '19.876.543/0001-21',
        email: 'contato@saborrealepp.com.br',
        phone: '(11) 2950-4411',
        address: 'Rua Voluntários da Pátria, 800 - SP',
        creditClass: 'CLASSE_IV',
        originalValue: 450000.0,
        adjustedValue: 450000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Fornecimento Hortifruti Local',
        notificationStatus: 'notificado_email',
        notificationSentAt: '2026-07-02 11:30',
      },
      {
        id: 'c-11',
        name: 'Transportes & Logística Veloz Ltda ME',
        document: '24.111.222/0001-33',
        email: 'financeiro@velozlogme.com.br',
        phone: '(11) 2233-4455',
        address: 'Rua do Gasômetro, 120 - SP',
        creditClass: 'CLASSE_IV',
        originalValue: 680000.0,
        adjustedValue: 715000.0,
        divergenceStatus: 'retificado',
        notes: 'Acolhimento de fretes comprovados com CTEs emitidos antes do pedido.',
        nature: 'Serviços de Frete e Armazenagem',
        notificationStatus: 'notificado_email',
        notificationSentAt: '2026-07-02 11:35',
      },
      {
        id: 'c-12',
        name: 'Soluções em TI & Softwares Paulista ME',
        document: '28.990.111/0001-44',
        email: 'atendimento@softwarespaulista.com.br',
        phone: '(11) 3105-6789',
        address: 'Av. Paulista, 1000, Cj 42 - SP',
        creditClass: 'CLASSE_IV',
        originalValue: 320000.0,
        adjustedValue: 320000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Licenciamento de Software ERP',
        notificationStatus: 'pendente',
      },
      {
        id: 'c-13',
        name: 'Locadora de Imóveis Comerciais Alfa S/A',
        document: '51.222.333/0001-88',
        email: 'locacoes@alfa-imoveis.com.br',
        phone: '(11) 3344-5566',
        address: 'Alameda Santos, 1800 - SP',
        creditClass: 'EXTRACONCURSAL',
        originalValue: 850000.0,
        adjustedValue: 850000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Aluguéis Vencidos Pós-Distribuição (Art. 84, I-A)',
        notificationStatus: 'pendente',
      },
      {
        id: 'c-14',
        name: 'Consultoria Contábil Silva & Associados',
        document: '32.444.555/0001-99',
        email: 'contato@silvacontabil.com.br',
        phone: '(11) 2200-3300',
        address: 'Rua Bela Cintra, 600 - SP',
        creditClass: 'CLASSE_IV',
        originalValue: 185000.0,
        adjustedValue: 185000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Honorários de Consultoria Tributária',
        notificationStatus: 'pendente',
      },
    ],

    deadlines: [
      {
        id: 'dl-01',
        title: 'Publicação do Edital da 2ª Lista do AJ (Art. 7º, §2º)',
        legalBasis: 'Art. 7º, § 2º da Lei 11.101/05',
        description: 'Prazo de 45 dias para o Administrador Judicial publicar a relação consolidada de credores após julgamento das divergências e habilitações.',
        startDate: '2026-07-10',
        dueDate: '2026-08-25',
        status: 'em_andamento',
        responsible: 'Dr. Roberto Silveira Mendes (AJ)',
        category: 'aj_obrigacao',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [15, 7, 3, 1, 0],
      },
      {
        id: 'dl-02',
        title: 'Protocolo do Relatório Mensal de Atividades (RMA de Julho/2026)',
        legalBasis: 'Art. 22, II, "c" da Lei 11.101/05',
        description: 'Apresentação mensal em juízo da situação contábil, financeira e operacional da devedora.',
        startDate: '2026-08-01',
        dueDate: '2026-08-15',
        status: 'em_andamento',
        responsible: 'Marcos Vinícius (Contador AJ)',
        category: 'aj_obrigacao',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [5, 2, 0],
      },
      {
        id: 'dl-03',
        title: 'Prazo de Objeções dos Credores ao PRJ (Art. 55)',
        legalBasis: 'Art. 55 da Lei 11.101/05',
        description: 'Prazo de 30 dias após a publicação da relação de credores do art. 7º §2º para os credores manifestarem objeção ao plano.',
        startDate: '2026-08-26',
        dueDate: '2026-09-25',
        status: 'pendente',
        responsible: 'Credores Concursais',
        category: 'credores',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [10, 5, 1],
      },
      {
        id: 'dl-04',
        title: 'Término do Stay Period Ordinário de 180 dias (Art. 6º, §4º)',
        legalBasis: 'Art. 6º, § 4º da Lei 11.101/05',
        description: 'Suspensão das execuções e constrições patrimoniais contra a Recuperanda.',
        startDate: '2026-06-15',
        dueDate: '2026-12-12',
        status: 'em_andamento',
        responsible: 'Juízo / Partes',
        category: 'juizo',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [30, 15, 5],
      },
      {
        id: 'dl-05',
        title: 'Apresentação do Plano de Recuperação Judicial (Art. 53)',
        legalBasis: 'Art. 53 da Lei 11.101/05',
        description: 'Prazo improrrogável de 60 dias para a Devedora protocolar o PRJ.',
        startDate: '2026-06-15',
        dueDate: '2026-08-14',
        status: 'cumprido',
        responsible: 'Recuperanda (Advogados)',
        category: 'devedora',
        emailAlertEnabled: false,
        emailAlertDaysBefore: [10, 3],
        completedAt: '2026-08-10',
        completedNotes: 'Plano juntado às fls. 2.150/2.340 tempestivamente.',
      },
    ],

    movements: [
      {
        id: 'mov-01',
        date: '2026-08-10 16:45',
        title: 'Juntada de Petição de Apresentação do PRJ pela Devedora',
        category: 'peticao_devedora',
        summary: 'Protocolado Plano de Recuperação Judicial acompanhado de laudo de viabilidade e fluxo de caixa projetado para 10 anos.',
        folio: 'Fls. 2.150/2.340',
        author: 'Advogados da Devedora',
        attachmentsCount: 4,
        highlight: true,
      },
      {
        id: 'mov-02',
        date: '2026-07-28 11:20',
        title: 'Manifestação do AJ sobre Divergências Administrativas Recebidas',
        category: 'peticao_aj',
        summary: 'Informa ao Juízo o recebimento de 4 divergências administrativas e 2 pedidos de habilitação tempestivos.',
        folio: 'Fls. 2.010/2.018',
        author: 'Dr. Roberto Silveira Mendes (AJ)',
        attachmentsCount: 2,
      },
      {
        id: 'mov-03',
        date: '2026-07-15 14:00',
        title: 'Juntada do RMA do Mês de Junho/2026',
        category: 'peticao_aj',
        summary: 'Relatório Mensal de Atividades protocolado sem ressalvas financeiras graves.',
        folio: 'Fls. 1.890/1.945',
        author: 'Equipe Contábil do AJ',
        attachmentsCount: 1,
      },
      {
        id: 'mov-04',
        date: '2026-06-25 08:00',
        title: 'Publicação no Diário de Justiça Eletrônico do Edital do Art. 52, §1º',
        category: 'dje',
        summary: 'Início da contagem do prazo de 15 dias corridos para apresentação de divergências ao Administrador Judicial.',
        folio: 'DJe Edição 3420, Caderno 3',
        author: 'Tribunal de Justiça de SP',
        attachmentsCount: 1,
        highlight: true,
      },
      {
        id: 'mov-05',
        date: '2026-06-15 17:30',
        title: 'Decisão de Deferimento do Processamento da Recuperação Judicial',
        category: 'decisao',
        summary: 'Juiz defere o processamento, nomeia o Administrador Judicial, determina a suspensão das ações (Stay Period de 180 dias) e intimação das Fazendas.',
        folio: 'Fls. 340/352',
        author: 'Dr. Paulo Rogério Bonini (Juiz)',
        attachmentsCount: 1,
        highlight: true,
      },
    ],
  },
  {
    id: 'proc-02',
    processNumber: '0041890-12.2025.8.26.0002',
    debtorName: 'Metalúrgica Progresso Ltda.',
    tradeName: 'Progresso Peças Industriais',
    debtorDocument: '55.888.777/0001-11',
    cnae: '25.39-0-01 - Serviços de usinagem, torneamento e solda',
    headquartersCity: 'Santo André/SP',
    court: '2ª Vara Cível e Empresarial',
    jurisdiction: 'Santo André / SP',
    judgeName: 'Dra. Vanessa Martins Rocha',

    judicialAdminName: 'Dr. Roberto Silveira Mendes',
    judicialAdminOffice: 'Silveira Mendes Administração Judicial & Perícias',
    judicialAdminDocument: 'OAB/SP 148.920',
    judicialAdminEmail: 'contato@silveiramendes.adv.br',
    judicialAdminPhone: '(11) 3254-8800',
    leadAdvocate: 'Dr. Lucas Alcantara (OAB/SP 310.220)',
    leadAccountant: 'Juliana Castro (CRC 1SP280110)',

    distributionDate: '2025-10-10',
    processingDecisionDate: '2025-10-25',
    art52NoticeDate: '2025-11-05',
    stayPeriodStartDate: '2025-10-25',
    stayPeriodDays: 180,
    stayPeriodExtended: true,
    stayPeriodExtendedDays: 180,
    planSubmissionDeadline: '2025-12-25',
    planSubmittedDate: '2025-12-20',
    agcPredictedDate: '2026-09-10',

    status: 'fase_deliberativa_agc',
    type: 'ordinaria',
    totalPassivo: 48200000.0,
    totalCredoresCount: 8,
    rmaMonthlyDay: 15,
    lastRmaMonth: 'Julho/2026',
    notes: 'Quadro Geral de Credores publicado. Stay Period prorrogado pelo juízo em razão do agendamento da AGC para setembro/2026.',

    creditors: [
      {
        id: 'c2-01',
        name: 'Associação dos Metalúrgicos do ABC',
        document: '44.111.222/0001-90',
        email: 'juridico@metalurgicosabc.org.br',
        phone: '(11) 4122-8000',
        creditClass: 'CLASSE_I',
        originalValue: 4200000.0,
        adjustedValue: 4200000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Acordo Coletivo de Trabalho e Verbas Rescisórias',
        notificationStatus: 'confirmado_recebimento',
      },
      {
        id: 'c2-02',
        name: 'Banco Santander Brasil S/A',
        document: '90.400.888/0001-42',
        email: 'recuperacoes@santander.com.br',
        phone: '(11) 3553-5555',
        creditClass: 'CLASSE_II',
        originalValue: 18500000.0,
        adjustedValue: 18500000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Cédula de Crédito com Alienação de Maquinários Pesados',
        notificationStatus: 'confirmado_recebimento',
      },
      {
        id: 'c2-03',
        name: 'Gerdau Aços Longos S/A',
        document: '07.358.761/0001-69',
        email: 'juridico.cobranca@gerdau.com',
        phone: '(11) 3094-6600',
        creditClass: 'CLASSE_III',
        originalValue: 12400000.0,
        adjustedValue: 12400000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Fornecimento de Bobinas e Lingotes de Aço',
        notificationStatus: 'confirmado_recebimento',
      },
      {
        id: 'c2-04',
        name: 'Usiminas Sinais & Chapas S/A',
        document: '60.870.004/0001-40',
        email: 'creditos@usiminas.com',
        phone: '(31) 3499-8000',
        creditClass: 'CLASSE_III',
        originalValue: 9800000.0,
        adjustedValue: 9800000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Duplicatas Mercantis',
        notificationStatus: 'confirmado_recebimento',
      },
      {
        id: 'c2-05',
        name: 'Eletro Usinagem Pinheiros ME',
        document: '15.444.333/0001-22',
        email: 'usinagem.pinheiros@gmail.com',
        phone: '(11) 4433-2211',
        creditClass: 'CLASSE_IV',
        originalValue: 480000.0,
        adjustedValue: 480000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Subcontratação de Serviços de Fresamento',
        notificationStatus: 'confirmado_recebimento',
      },
      {
        id: 'c2-06',
        name: 'Retífica de Motores São Caetano EPP',
        document: '18.999.000/0001-55',
        email: 'retificasaocaetano@uol.com.br',
        phone: '(11) 4221-3344',
        creditClass: 'CLASSE_IV',
        originalValue: 620000.0,
        adjustedValue: 620000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Manutenção de Ferramentaria',
        notificationStatus: 'confirmado_recebimento',
      },
      {
        id: 'c2-07',
        name: 'Oxigênio & Gases Industriais Paulista Ltda.',
        document: '48.333.222/0001-10',
        email: 'financeiro@gasespaulista.com.br',
        phone: '(11) 3322-9900',
        creditClass: 'CLASSE_III',
        originalValue: 1200000.0,
        adjustedValue: 1200000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Fornecimento de Argônio e Nitrogênio',
        notificationStatus: 'confirmado_recebimento',
      },
      {
        id: 'c2-08',
        name: 'Energia Solar & Eólica Paulista (Contrato Pós)',
        document: '31.222.111/0001-09',
        email: 'cobranca@energiasolar.com.br',
        phone: '(11) 3030-4040',
        creditClass: 'EXTRACONCURSAL',
        originalValue: 1000000.0,
        adjustedValue: 1000000.0,
        divergenceStatus: 'sem_divergencia',
        nature: 'Contrato de Eficiência Energética',
        notificationStatus: 'pendente',
      },
    ],

    deadlines: [
      {
        id: 'dl2-01',
        title: 'Realização da 1ª Convocação da AGC Virtual',
        legalBasis: 'Art. 36 e 56 da Lei 11.101/05',
        description: 'Sessão de deliberação do plano de recuperação com votação em 4 classes.',
        startDate: '2026-08-01',
        dueDate: '2026-09-10',
        status: 'em_andamento',
        responsible: 'Dr. Roberto Silveira Mendes (AJ - Presidente da AGC)',
        category: 'aj_obrigacao',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [15, 7, 3, 1, 0],
      },
      {
        id: 'dl2-02',
        title: 'Entrega do RMA de Julho/2026',
        legalBasis: 'Art. 22, II, "c" da Lei 11.101/05',
        description: 'Relatório financeiro mensal.',
        startDate: '2026-08-01',
        dueDate: '2026-08-15',
        status: 'em_andamento',
        responsible: 'Contadoria do AJ',
        category: 'aj_obrigacao',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [3, 0],
      },
    ],

    movements: [
      {
        id: 'mov2-01',
        date: '2026-08-01 10:00',
        title: 'Despacho Designando Data para Assembleia Geral de Credores',
        category: 'despacho',
        summary: 'Designada 1ª convocação da AGC para o dia 10/09/2026 e 2ª convocação para 17/09/2026, formato virtual.',
        folio: 'Fls. 3.420',
        author: 'Dra. Vanessa Martins Rocha (Juíza)',
        attachmentsCount: 1,
        highlight: true,
      },
    ],
  },
];

export const INITIAL_EMAIL_LOGS: EmailLog[] = [
  {
    id: 'elog-01',
    processId: 'proc-01',
    recipientEmail: 'contato@silveiramendes.adv.br',
    recipientName: 'Dr. Roberto Silveira Mendes (AJ Titular)',
    subject: '⚠️ Alerta de Prazo Processual: Publicação do Edital do Art. 7º §2º (10 dias restantes)',
    deadlineTitle: 'Publicação do Edital da 2ª Lista do AJ (Art. 7º, §2º)',
    sentAt: '2026-08-15 06:00',
    status: 'enviado',
    triggerType: 'prazo_processual',
    previewText: 'Aviso automático do sistema: o prazo para publicação da relação de credores do art. 7º, §2º do Grupo Varejo Brasil S/A vence em 25/08/2026.',
  },
  {
    id: 'elog-02',
    processId: 'proc-01',
    recipientEmail: 'marcos.vinicius@silveiramendes.adv.br',
    recipientName: 'Marcos Vinícius de Paula (Contador AJ)',
    subject: '🚨 Lembrete de RMA Mensal: Protocolo até o dia 15/08/2026',
    deadlineTitle: 'Protocolo do Relatório Mensal de Atividades (RMA de Julho/2026)',
    sentAt: '2026-08-13 08:30',
    status: 'enviado',
    triggerType: 'alerta_rma',
    previewText: 'Prezado contador, favor finalizar e revisar os demonstrativos contábeis para protocolo do RMA do Grupo Varejo Brasil S/A.',
  },
  {
    id: 'elog-03',
    processId: 'proc-01',
    recipientEmail: 'recuperacao.creditos@itau-unibanco.com.br',
    recipientName: 'Banco Itaú Unibanco S/A',
    subject: 'Notificação de Crédito - Recuperação Judicial Grupo Varejo Brasil S/A (Art. 22, I, "a" LRF)',
    sentAt: '2026-07-02 11:00',
    status: 'enviado',
    triggerType: 'notificacao_credor',
    previewText: 'Vimos por meio desta notificar V. Sa. de que seu crédito na Classe II (Garantia Real) foi arrolado no valor de R$ 42.000.000,00.',
  },
];
