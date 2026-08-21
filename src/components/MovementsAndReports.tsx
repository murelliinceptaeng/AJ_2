import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Printer,
  Download,
  Search,
  Filter,
  FileText,
  Building2,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { JudicialRecoveryProcess, ProceduralMovement } from '../types';
import {
  formatCurrency,
  formatDate,
  formatDocument,
  getCreditClassLabel,
} from '../utils/formatters';

interface MovementsAndReportsProps {
  process: JudicialRecoveryProcess;
  onUpdateMovements: (movements: ProceduralMovement[]) => void;
  onOpenPrintModal: (title: string, content: string) => void;
}

export const MovementsAndReports: React.FC<MovementsAndReportsProps> = ({
  process,
  onUpdateMovements,
  onOpenPrintModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddMovementModal, setShowAddMovementModal] = useState(false);

  // Filtered movements
  const filteredMovements = process.movements.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.folio && m.folio.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Save new movement
  const handleSaveMovement = (movementData: Partial<ProceduralMovement>) => {
    const newMovement: ProceduralMovement = {
      id: `mov-${Date.now()}`,
      date: movementData.date || new Date().toLocaleString('pt-BR').slice(0, 16),
      title: movementData.title || 'Novo Andamento',
      category: movementData.category || 'peticao_aj',
      summary: movementData.summary || '',
      folio: movementData.folio || '',
      author: movementData.author || process.judicialAdminName,
      attachmentsCount: movementData.attachmentsCount || 1,
      highlight: movementData.highlight ?? false,
    };
    onUpdateMovements([newMovement, ...process.movements]);
    setShowAddMovementModal(false);
  };

  // Delete movement
  const handleDeleteMovement = (id: string) => {
    if (window.confirm('Excluir esta movimentação do histórico?')) {
      onUpdateMovements(process.movements.filter((m) => m.id !== id));
    }
  };

  // Generate Reports in Printable Plain Text format
  const generateDossierReport = () => {
    const content = `RELATÓRIO GERAL E DOSSIÊ PROCESSUAL DA RECUPERAÇÃO JUDICIAL
Autos nº: ${process.processNumber}
Comarca / Juízo: ${process.court} - ${process.jurisdiction}
Juiz Titular: ${process.judgeName}

1. DADOS DA RECUPERANDA:
• Razão Social: ${process.debtorName}
• Nome Fantasia: ${process.tradeName || '-'}
• CNPJ: ${formatDocument(process.debtorDocument)}
• CNAE: ${process.cnae || '-'}
• Sede: ${process.headquartersCity}
• Modalidade: ${process.type === 'ordinaria' ? 'Recuperação Judicial Ordinária' : 'Plano Especial ME/EPP'}

2. ADMINISTRAÇÃO JUDICIAL:
• Administrador Titular: ${process.judicialAdminName}
• Escritório: ${process.judicialAdminOffice}
• Registro Profissional: ${process.judicialAdminDocument}
• E-mail Oficial: ${process.judicialAdminEmail}
• Telefone: ${process.judicialAdminPhone}
• Advogado Líder: ${process.leadAdvocate}
• Contador Líder: ${process.leadAccountant}

3. QUADRO GERAL DE CREDORES RESUMIDO:
• Passivo Total Sujeito à Recuperação: ${formatCurrency(process.totalPassivo)}
• Total de Credores Arrolados: ${process.creditors.length}
• Classe I (Trabalhista): ${formatCurrency(
      process.creditors.filter((c) => c.creditClass === 'CLASSE_I').reduce((a, b) => a + b.adjustedValue, 0)
    )} (${process.creditors.filter((c) => c.creditClass === 'CLASSE_I').length} credores)
• Classe II (Garantia Real): ${formatCurrency(
      process.creditors.filter((c) => c.creditClass === 'CLASSE_II').reduce((a, b) => a + b.adjustedValue, 0)
    )} (${process.creditors.filter((c) => c.creditClass === 'CLASSE_II').length} credores)
• Classe III (Quirografário): ${formatCurrency(
      process.creditors.filter((c) => c.creditClass === 'CLASSE_III').reduce((a, b) => a + b.adjustedValue, 0)
    )} (${process.creditors.filter((c) => c.creditClass === 'CLASSE_III').length} credores)
• Classe IV (ME / EPP): ${formatCurrency(
      process.creditors.filter((c) => c.creditClass === 'CLASSE_IV').reduce((a, b) => a + b.adjustedValue, 0)
    )} (${process.creditors.filter((c) => c.creditClass === 'CLASSE_IV').length} credores)
• Extraconcursal: ${formatCurrency(
      process.creditors.filter((c) => c.creditClass === 'EXTRACONCURSAL').reduce((a, b) => a + b.adjustedValue, 0)
    )} (${process.creditors.filter((c) => c.creditClass === 'EXTRACONCURSAL').length} credores)

4. MARCOS PROCESSUAIS & PRAZOS:
• Distribuição do Pedido: ${formatDate(process.distributionDate)}
• Deferimento do Processamento: ${formatDate(process.processingDecisionDate)}
• Edital Art. 52, §1º: ${formatDate(process.art52NoticeDate)}
• Stay Period: Início em ${formatDate(process.stayPeriodStartDate)} (${process.stayPeriodDays} dias)
• Apresentação do PRJ: ${process.planSubmittedDate ? formatDate(process.planSubmittedDate) : 'Pendente'}
• Previsão de AGC: ${process.agcPredictedDate ? formatDate(process.agcPredictedDate) : 'A definir'}

5. HISTÓRICO DAS MOVIMENTAÇÕES PROCESSUAIS (${process.movements.length} eventos):
${process.movements
  .map(
    (m, idx) =>
      `[${idx + 1}] ${m.date} - ${m.title} (${m.folio || 'S/N'})\n    Autor: ${m.author}\n    Resumo: ${m.summary}\n`
  )
  .join('\n')}

Emissão em: ${new Date().toLocaleString('pt-BR')}
Assinado Digitalmente: ${process.judicialAdminName} - Administrador Judicial`;

    onOpenPrintModal(`Dossiê Completo - ${process.debtorName}`, content);
  };

  const generateQGCReport = () => {
    let content = `QUADRO GERAL DE CREDORES CONSOLIDADO (ART. 7º, §2º DA LEI Nº 11.101/2005)
Recuperação Judicial de ${process.debtorName} | CNPJ: ${formatDocument(process.debtorDocument)}
Autos nº ${process.processNumber} - ${process.court}

========================================================================================
`;

    const classes = ['CLASSE_I', 'CLASSE_II', 'CLASSE_III', 'CLASSE_IV', 'EXTRACONCURSAL'] as const;

    classes.forEach((cl) => {
      const list = process.creditors.filter((c) => c.creditClass === cl);
      const subtotalOrig = list.reduce((a, b) => a + b.originalValue, 0);
      const subtotalAdj = list.reduce((a, b) => a + b.adjustedValue, 0);

      content += `\n${getCreditClassLabel(cl).toUpperCase()} (${list.length} credores)
Subtotal Declarado: ${formatCurrency(subtotalOrig)} | Subtotal Apurado pelo AJ: ${formatCurrency(subtotalAdj)}
----------------------------------------------------------------------------------------\n`;

      list.forEach((c, idx) => {
        content += `${idx + 1}. ${c.name} | Doc: ${c.document}\n   Valor: ${formatCurrency(c.adjustedValue)} | Natureza: ${c.nature}\n   Status Divergência: ${c.divergenceStatus} | Notificação: ${c.notificationStatus}\n\n`;
      });
    });

    content += `========================================================================================
PASSIVO TOTAL CONCURSAL APURADO: ${formatCurrency(process.totalPassivo)}
Administrador Judicial: ${process.judicialAdminName} (${process.judicialAdminDocument})`;

    onOpenPrintModal(`Quadro Geral de Credores - ${process.debtorName}`, content);
  };

  const generateDeadlinesReport = () => {
    let content = `RELATÓRIO DE MONITORAMENTO DE PRAZOS E OBRIGAÇÕES PROCESSUAIS
Recuperação Judicial nº ${process.processNumber} - ${process.debtorName}
Administrador Judicial: ${process.judicialAdminName}

========================================================================================
CRONOGRAMA DE PRAZOS PROCESSUAIS (LEI Nº 11.101/2005):
========================================================================================\n\n`;

    process.deadlines.forEach((d, idx) => {
      content += `[${idx + 1}] ${d.title}\n`;
      content += `    Fundamento Legal: ${d.legalBasis}\n`;
      content += `    Início: ${formatDate(d.startDate)} | Vencimento: ${formatDate(d.dueDate)}\n`;
      content += `    Responsável: ${d.responsible}\n`;
      content += `    Status: ${d.status.toUpperCase()} ${d.completedAt ? `(Cumprido em ${formatDate(d.completedAt)})` : ''}\n`;
      content += `    Descrição: ${d.description}\n\n`;
    });

    content += `========================================================================================
Emitido em ${new Date().toLocaleString('pt-BR')}`;

    onOpenPrintModal(`Relatório de Prazos - ${process.debtorName}`, content);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header com Gerador de Relatórios Oficiais */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Movimentações Processuais & Relatórios do AJ
              </h1>
              <p className="text-xs text-slate-500">
                Exportação de relatórios executivos de todas as movimentações, quadro geral e cumprimento de prazos
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddMovementModal(true)}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Lançar Andamento
            </button>
          </div>
        </div>

        {/* Central de Relatórios Executivos Exportáveis */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Dossiê Geral do Processo (360º)
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Relatório completo com dados da devedora, juízo, passivo, marcos e todas as movimentações.
              </p>
            </div>
            <button
              onClick={generateDossierReport}
              className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              Exportar / Imprimir Dossiê
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Quadro de Credores Consolidado
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Relação oficial de credores das Classes I a IV e Extraconcursais com subtotais formatados.
              </p>
            </div>
            <button
              onClick={generateQGCReport}
              className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              Exportar / Imprimir QGC
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Relatório de Prazos e LRF
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Auditoria de cumprimento dos prazos processuais e obrigações do Administrador Judicial.
              </p>
            </div>
            <button
              onClick={generateDeadlinesReport}
              className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              Exportar / Imprimir Prazos
            </button>
          </div>
        </div>
      </div>

      {/* Histórico Cronológico de Movimentações */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">
              Histórico Cronológico de Movimentações ({filteredMovements.length})
            </h2>
          </div>

          {/* Busca e Filtro de Categoria */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar andamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Todas as Categorias</option>
              <option value="despacho">Despachos</option>
              <option value="decisao">Decisões</option>
              <option value="peticao_aj">Petições do AJ</option>
              <option value="peticao_devedora">Petições da Devedora</option>
              <option value="dje">Publicações DJe</option>
              <option value="agc">Assembleia de Credores</option>
            </select>
          </div>
        </div>

        {/* Timeline de Andamentos */}
        <div className="space-y-3">
          {filteredMovements.map((mov) => (
            <div
              key={mov.id}
              className={`p-4 rounded-xl border text-xs transition-colors ${
                mov.highlight
                  ? 'border-blue-300 bg-blue-50/30'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{mov.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-semibold uppercase">
                      {mov.category.replace('_', ' ')}
                    </span>
                    {mov.highlight && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-bold">
                        Relevante
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 mt-1.5 leading-relaxed">{mov.summary}</p>
                </div>

                <button
                  onClick={() => handleDeleteMovement(mov.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Excluir movimentação"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <span>Data: <strong className="text-slate-700">{mov.date}</strong></span>
                  <span>Autor: <strong className="text-slate-700">{mov.author}</strong></span>
                </div>
                {mov.folio && (
                  <span className="font-mono bg-slate-200/80 px-2 py-0.5 rounded text-slate-700 font-bold">
                    {mov.folio}
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredMovements.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nenhuma movimentação registrada para os filtros selecionados.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Lançar Nova Movimentação */}
      {showAddMovementModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 text-slate-900 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Lançar Nova Movimentação Processual
              </h2>
              <button
                onClick={() => setShowAddMovementModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MovementForm
              judicialAdmin={process.judicialAdminName}
              onClose={() => setShowAddMovementModal(false)}
              onSave={handleSaveMovement}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponente Formulário de Movimentação
interface MovementFormProps {
  judicialAdmin: string;
  onClose: () => void;
  onSave: (data: Partial<ProceduralMovement>) => void;
}

const MovementForm: React.FC<MovementFormProps> = ({ judicialAdmin, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('peticao_aj');
  const [summary, setSummary] = useState('');
  const [folio, setFolio] = useState('');
  const [author, setAuthor] = useState(judicialAdmin);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [highlight, setHighlight] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Informe o título do andamento');

    onSave({
      title,
      category,
      summary,
      folio,
      author,
      date,
      highlight,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Título do Andamento *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Juntada de Manifestação do AJ sobre Divergências"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="peticao_aj">Petição do AJ</option>
            <option value="despacho">Despacho Judicial</option>
            <option value="decisao">Decisão / Sentença</option>
            <option value="peticao_devedora">Petição da Devedora</option>
            <option value="manifestacao_credor">Manifestação de Credor</option>
            <option value="dje">Publicação DJe</option>
            <option value="agc">Ata de AGC</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Data do Evento</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Autor do Ato / Petição</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Folhas nos Autos</label>
          <input
            type="text"
            value={folio}
            onChange={(e) => setFolio(e.target.value)}
            placeholder="Fls. 1.250/1.265"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Resumo do Ato / Teor</label>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Descreva o conteúdo do despacho, petição ou publicação..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        ></textarea>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="chk-highlight"
          checked={highlight}
          onChange={(e) => setHighlight(e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="chk-highlight" className="text-slate-700 font-medium cursor-pointer">
          Destacar como movimentação chave do processo
        </label>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
        >
          Salvar Movimentação
        </button>
      </div>
    </form>
  );
};
