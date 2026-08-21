import { Creditor, JudicialRecoveryProcess } from '../types';
import { formatCurrency, formatDate, formatDocument, getCreditClassLabel } from './formatters';

export function renderTemplate(
  templateContent: string,
  process: JudicialRecoveryProcess,
  creditor?: Creditor,
  customVariables?: Record<string, string>
): string {
  const today = new Date();
  const todayFormatted = `${String(today.getDate()).padStart(2, '0')}/${String(
    today.getMonth() + 1
  ).padStart(2, '0')}/${today.getFullYear()}`;

  // Buscar prazo de divergência se houver
  const deadlineDivergence = process.deadlines.find(
    (d) => d.legalBasis.includes('7º') || d.title.toLowerCase().includes('divergência') || d.title.toLowerCase().includes('habilita')
  );
  const dataLimiteDivergencia = deadlineDivergence
    ? formatDate(deadlineDivergence.dueDate)
    : '15 (quinze) dias a contar da publicação do Edital';

  const replacements: Record<string, string> = {
    // Processo & Juízo
    '{{numero_processo}}': process.processNumber || '0000000-00.0000.8.26.0000',
    '{{vara_juizo}}': process.court || 'Vara Cível e Empresarial',
    '{{comarca}}': process.jurisdiction || 'Comarca da Capital',
    '{{nome_juiz}}': process.judgeName || 'MM. Juiz de Direito',

    // Devedora
    '{{nome_devedora}}': process.debtorName || 'Recuperanda S/A',
    '{{nome_fantasia_devedora}}': process.tradeName || process.debtorName,
    '{{cnpj_devedora}}': formatDocument(process.debtorDocument),
    '{{cidade_devedora}}': process.headquartersCity || 'São Paulo/SP',

    // Administrador Judicial
    '{{nome_administrador}}': process.judicialAdminName || 'Administrador Judicial',
    '{{escritorio_administrador}}': process.judicialAdminOffice || 'Escritório de Administração Judicial',
    '{{documento_administrador}}': process.judicialAdminDocument || 'OAB/SP 000.000',
    '{{email_administrador}}': process.judicialAdminEmail || 'contato@aj.adv.br',
    '{{telefone_administrador}}': process.judicialAdminPhone || '(11) 3000-0000',
    '{{advogado_lider}}': process.leadAdvocate || process.judicialAdminName,
    '{{contador_lider}}': process.leadAccountant || 'Contador Responsável',

    // Datas Relevantes
    '{{data_hoje}}': todayFormatted,
    '{{data_distribuicao}}': formatDate(process.distributionDate),
    '{{data_deferimento}}': formatDate(process.processingDecisionDate),
    '{{data_edital_art52}}': formatDate(process.art52NoticeDate),
    '{{data_limite_divergencia}}': dataLimiteDivergencia,

    // Credor (se aplicável)
    '{{nome_credor}}': creditor ? creditor.name : '[NOME DO CREDOR]',
    '{{documento_credor}}': creditor ? formatDocument(creditor.document) : '[CPF/CNPJ DO CREDOR]',
    '{{email_credor}}': creditor?.email || '[E-MAIL DO CREDOR]',
    '{{telefone_credor}}': creditor?.phone || '[TELEFONE DO CREDOR]',
    '{{endereco_credor}}': creditor?.address || '[ENDEREÇO DO CREDOR]',
    '{{classe_credito}}': creditor ? getCreditClassLabel(creditor.creditClass) : '[CLASSE DO CRÉDITO]',
    '{{valor_declarado}}': creditor ? formatCurrency(creditor.originalValue) : '[VALOR DECLARADO]',
    '{{valor_apurado}}': creditor ? formatCurrency(creditor.adjustedValue) : '[VALOR APURADO]',
    '{{natureza_credito}}': creditor?.nature || 'Crédito Concursal',
    '{{status_divergencia}}': creditor ? formatDivergenceStatus(creditor.divergenceStatus) : 'Regular',

    // Variáveis customizadas extras
    ...(customVariables || {}),
  };

  let rendered = templateContent;
  Object.entries(replacements).forEach(([tag, value]) => {
    // Replace all occurrences of tag
    rendered = rendered.split(tag).join(value);
  });

  return rendered;
}

function formatDivergenceStatus(status: string): string {
  switch (status) {
    case 'sem_divergencia':
      return 'Sem Divergência (Regular)';
    case 'divergencia_apresentada':
      return 'Divergência Administrativa Protocolada';
    case 'em_analise_aj':
      return 'Em Análise pela Contadoria do AJ';
    case 'retificado':
      return 'Retificado / Homologado no Edital Art. 7º §2º';
    case 'impugnacao_judicial':
      return 'Impugnação Judicial Pendente (Art. 8º)';
    default:
      return status;
  }
}
