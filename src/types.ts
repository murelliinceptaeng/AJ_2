export type CreditClass = 'CLASSE_I' | 'CLASSE_II' | 'CLASSE_III' | 'CLASSE_IV' | 'EXTRACONCURSAL';

export interface Creditor {
  id: string;
  name: string;
  document: string; // CPF or CNPJ
  email?: string;
  phone?: string;
  address?: string;
  creditClass: CreditClass;
  originalValue: number; // Valor informado pela Devedora (Art. 52, § 1º)
  adjustedValue: number; // Valor apurado pelo AJ (Art. 7º, § 2º)
  divergenceStatus: 'sem_divergencia' | 'divergencia_apresentada' | 'em_analise_aj' | 'retificado' | 'impugnacao_judicial';
  notes?: string;
  notificationStatus: 'pendente' | 'notificado_email' | 'notificado_correio' | 'confirmado_recebimento';
  notificationSentAt?: string;
  nature: string; // ex: Salarial, Rescisório, Garantia Hipotecária, Duplicatas Mercantis, Fornecedor
}

export interface LegalDeadline {
  id: string;
  title: string;
  legalBasis: string; // ex: Art. 53, Art. 7º § 1º, Art. 6º § 4º
  description: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: 'pendente' | 'em_andamento' | 'cumprido' | 'prorrogado' | 'atrasado';
  responsible: string;
  category: 'aj_obrigacao' | 'devedora' | 'credores' | 'juizo';
  emailAlertEnabled: boolean;
  emailAlertDaysBefore: number[]; // ex: [15, 7, 3, 1, 0]
  completedAt?: string;
  completedNotes?: string;
}

export interface ProceduralMovement {
  id: string;
  date: string;
  title: string;
  category: 'despacho' | 'decisao' | 'peticao_aj' | 'peticao_devedora' | 'manifestacao_credor' | 'dje' | 'laudo_pericial' | 'agc';
  summary: string;
  folio?: string; // ex: Fls. 1.450/1.458
  author: string;
  attachmentsCount?: number;
  highlight?: boolean;
}

export interface JudicialRecoveryProcess {
  id: string;
  processNumber: string; // Número CNJ
  debtorName: string; // Razão Social da Devedora
  tradeName?: string; // Nome Fantasia
  debtorDocument: string; // CNPJ
  cnae?: string;
  headquartersCity: string;
  court: string; // ex: 2ª Vara de Falências e Recuperações Judiciais
  jurisdiction: string; // Comarca ex: São Paulo / SP
  judgeName: string;
  
  // Dados do Administrador Judicial
  judicialAdminName: string;
  judicialAdminOffice: string;
  judicialAdminDocument: string; // OAB ou CRC / CNPJ
  judicialAdminEmail: string;
  judicialAdminPhone: string;
  leadAdvocate: string;
  leadAccountant: string;
  
  // Datas e Marcos Processuais
  distributionDate: string;
  processingDecisionDate: string; // Deferimento do Processamento
  art52NoticeDate?: string; // Publicação do Edital do art. 52, § 1º
  stayPeriodStartDate: string;
  stayPeriodDays: number; // Normalmente 180 dias
  stayPeriodExtended: boolean;
  stayPeriodExtendedDays?: number;
  planSubmissionDeadline?: string; // Prazo de 60 dias (Art. 53)
  planSubmittedDate?: string;
  agcPredictedDate?: string;
  
  // Status Geral do Caso
  status: 'em_processamento' | 'fase_deliberativa_agc' | 'plano_homologado' | 'em_cumprimento' | 'convolada_falencia' | 'encerrada';
  type: 'ordinaria' | 'especial_me_epp';
  totalPassivo: number;
  totalCredoresCount: number;
  
  creditors: Creditor[];
  deadlines: LegalDeadline[];
  movements: ProceduralMovement[];
  
  // Indicadores adicionais do AJ
  rmaMonthlyDay: number; // ex: dia 15 de cada mês
  lastRmaMonth?: string;
  notes?: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: 'notificacao_credor' | 'rma' | 'edital' | 'manifestacao_prj' | 'peticao_geral';
  description: string;
  content: string; // Suporta tags como {{nome_credor}}, {{valor_credito}}, etc.
  availableTags: { tag: string; label: string; sample: string }[];
  isDefault?: boolean;
  lastModified: string;
}

export interface EmailLog {
  id: string;
  processId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  deadlineTitle?: string;
  sentAt: string;
  status: 'enviado' | 'agendado' | 'falha';
  triggerType: 'prazo_processual' | 'notificacao_credor' | 'alerta_rma' | 'teste_manual';
  previewText: string;
}
