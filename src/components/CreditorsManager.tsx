import React, { useState } from 'react';
import {
  Users,
  Upload,
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Printer,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Send,
  HelpCircle,
  X,
  FileText,
} from 'lucide-react';
import { CreditClass, Creditor, JudicialRecoveryProcess } from '../types';
import {
  formatCurrency,
  formatDocument,
  getCreditClassColor,
  getCreditClassLabel,
  getCreditClassShortLabel,
} from '../utils/formatters';

interface CreditorsManagerProps {
  process: JudicialRecoveryProcess;
  onUpdateCreditors: (newCreditors: Creditor[]) => void;
  onGenerateLetter: (creditor: Creditor) => void;
  onGenerateBatchLetters: (creditors: Creditor[]) => void;
  onSendEmailNotification: (creditor: Creditor) => void;
}

export const CreditorsManager: React.FC<CreditorsManagerProps> = ({
  process,
  onUpdateCreditors,
  onGenerateLetter,
  onGenerateBatchLetters,
  onSendEmailNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedNotificationFilter, setSelectedNotificationFilter] = useState<string>('ALL');
  const [selectedDivergenceFilter, setSelectedDivergenceFilter] = useState<string>('ALL');
  
  // Selection state for batch actions
  const [selectedCreditorIds, setSelectedCreditorIds] = useState<string[]>([]);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCreditor, setEditingCreditor] = useState<Creditor | null>(null);

  // Filtered Creditors
  const filteredCreditors = process.creditors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.nature.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || c.creditClass === selectedClass;
    const matchesNotification =
      selectedNotificationFilter === 'ALL' || c.notificationStatus === selectedNotificationFilter;
    const matchesDivergence =
      selectedDivergenceFilter === 'ALL' || c.divergenceStatus === selectedDivergenceFilter;

    return matchesSearch && matchesClass && matchesNotification && matchesDivergence;
  });

  // Calculate summaries for the current list
  const totalAdjustedSum = filteredCreditors.reduce((acc, c) => acc + c.adjustedValue, 0);
  const totalOriginalSum = filteredCreditors.reduce((acc, c) => acc + c.originalValue, 0);

  // Handle Selection
  const toggleSelectAll = () => {
    if (selectedCreditorIds.length === filteredCreditors.length) {
      setSelectedCreditorIds([]);
    } else {
      setSelectedCreditorIds(filteredCreditors.map((c) => c.id));
    }
  };

  const toggleSelectCreditor = (id: string) => {
    if (selectedCreditorIds.includes(id)) {
      setSelectedCreditorIds(selectedCreditorIds.filter((cid) => cid !== id));
    } else {
      setSelectedCreditorIds([...selectedCreditorIds, id]);
    }
  };

  // Delete Creditor
  const handleDeleteCreditor = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este credor do Quadro de Credores?')) {
      const updated = process.creditors.filter((c) => c.id !== id);
      onUpdateCreditors(updated);
      setSelectedCreditorIds(selectedCreditorIds.filter((cid) => cid !== id));
    }
  };

  // Save new or edited creditor
  const handleSaveCreditor = (creditorData: Partial<Creditor>) => {
    if (editingCreditor) {
      // Edit
      const updated = process.creditors.map((c) =>
        c.id === editingCreditor.id ? { ...c, ...creditorData } : c
      );
      onUpdateCreditors(updated as Creditor[]);
    } else {
      // Add
      const newCreditor: Creditor = {
        id: `c-custom-${Date.now()}`,
        name: creditorData.name || 'Novo Credor',
        document: creditorData.document || '00.000.000/0001-00',
        email: creditorData.email || '',
        phone: creditorData.phone || '',
        address: creditorData.address || '',
        creditClass: creditorData.creditClass || 'CLASSE_III',
        originalValue: creditorData.originalValue || 0,
        adjustedValue: creditorData.adjustedValue || creditorData.originalValue || 0,
        divergenceStatus: creditorData.divergenceStatus || 'sem_divergencia',
        nature: creditorData.nature || 'Crédito Quirografário',
        notificationStatus: 'pendente',
        notes: creditorData.notes || '',
      };
      onUpdateCreditors([newCreditor, ...process.creditors]);
    }
    setShowAddModal(false);
    setEditingCreditor(null);
  };

  // Quick export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Nome / Razão Social',
      'CPF/CNPJ',
      'Classe',
      'Valor Declarado (R$)',
      'Valor Apurado pelo AJ (R$)',
      'Natureza',
      'Status Divergência',
      'Status Notificação',
      'E-mail',
    ];

    const rows = filteredCreditors.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.document}"`,
      getCreditClassLabel(c.creditClass),
      c.originalValue.toFixed(2),
      c.adjustedValue.toFixed(2),
      `"${c.nature.replace(/"/g, '""')}"`,
      c.divergenceStatus,
      c.notificationStatus,
      c.email || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Quadro_Credores_${process.debtorName.replace(/\s+/g, '_')}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header com Ações e Totalizadores */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Quadro Geral de Credores (QGC) & Notificações
                </h1>
                <p className="text-xs text-slate-500">
                  Gestão dos créditos das Classes I a IV e Extraconcursais (Arts. 7º, 9º e 22 da Lei 11.101/05)
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação do Topo */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              Importar Lista (CSV / Texto)
            </button>

            <button
              onClick={() => {
                setEditingCreditor(null);
                setShowAddModal(true);
              }}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Novo Credor
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Exportar dados filtrados em CSV"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Resumo Dinâmico dos Filtros */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Credores Listados
            </span>
            <span className="text-xl font-bold text-slate-900">
              {filteredCreditors.length}{' '}
              <span className="text-xs font-normal text-slate-500">de {process.creditors.length}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Total Apurado pelo AJ
            </span>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(totalAdjustedSum)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Notificados (Art. 22)
            </span>
            <span className="text-xl font-bold text-emerald-600">
              {process.creditors.filter((c) => c.notificationStatus !== 'pendente').length}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({Math.round(
                  (process.creditors.filter((c) => c.notificationStatus !== 'pendente').length /
                    (process.creditors.length || 1)) *
                    100
                )}%)
              </span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Divergências / Habilitações
            </span>
            <span className="text-xl font-bold text-amber-600">
              {process.creditors.filter((c) => c.divergenceStatus !== 'sem_divergencia').length}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Input de Busca */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, documento, e-mail, natureza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filtros Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Classe */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Todas as Classes</option>
              <option value="CLASSE_I">Classe I (Trabalhista)</option>
              <option value="CLASSE_II">Classe II (Garantia Real)</option>
              <option value="CLASSE_III">Classe III (Quirografário)</option>
              <option value="CLASSE_IV">Classe IV (ME / EPP)</option>
              <option value="EXTRACONCURSAL">Extraconcursal</option>
            </select>

            {/* Notificação */}
            <select
              value={selectedNotificationFilter}
              onChange={(e) => setSelectedNotificationFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Status Notificação (Todos)</option>
              <option value="pendente">Pendente de Notificação</option>
              <option value="notificado_email">Notificado por E-mail</option>
              <option value="confirmado_recebimento">Recebimento Confirmado</option>
            </select>

            {/* Divergência */}
            <select
              value={selectedDivergenceFilter}
              onChange={(e) => setSelectedDivergenceFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Status Divergência (Todos)</option>
              <option value="sem_divergencia">Sem Divergência (Regular)</option>
              <option value="divergencia_apresentada">Divergência Apresentada</option>
              <option value="em_analise_aj">Em Análise pelo AJ</option>
              <option value="retificado">Retificado pelo AJ</option>
            </select>
          </div>
        </div>

        {/* Barra de Ações em Lote (quando houver seleção) */}
        {selectedCreditorIds.length > 0 && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-950 animate-fadeIn">
            <span className="font-semibold">
              {selectedCreditorIds.length} credor(es) selecionado(s)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const selectedCreditors = process.creditors.filter((c) =>
                    selectedCreditorIds.includes(c.id)
                  );
                  onGenerateBatchLetters(selectedCreditors);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                Gerar Cartas em Lote ({selectedCreditorIds.length})
              </button>

              <button
                onClick={() => {
                  // Marcar selecionados como notificados
                  const now = new Date().toLocaleString('pt-BR');
                  const updated = process.creditors.map((c) => {
                    if (selectedCreditorIds.includes(c.id)) {
                      return {
                        ...c,
                        notificationStatus: 'notificado_email' as const,
                        notificationSentAt: now,
                      };
                    }
                    return c;
                  });
                  onUpdateCreditors(updated);
                  setSelectedCreditorIds([]);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                Marcar como Notificados
              </button>

              <button
                onClick={() => setSelectedCreditorIds([])}
                className="text-blue-800 hover:underline px-2 py-1 cursor-pointer"
              >
                Desmarcar todos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabela de Credores */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredCreditors.length > 0 &&
                      selectedCreditorIds.length === filteredCreditors.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Credor / Documento</th>
                <th className="py-3 px-4">Classe & Natureza</th>
                <th className="py-3 px-4 text-right">Valor Declarado</th>
                <th className="py-3 px-4 text-right">Valor Apurado (AJ)</th>
                <th className="py-3 px-4 text-center">Divergência</th>
                <th className="py-3 px-4 text-center">Notificação Art. 22</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCreditors.map((creditor) => {
                const color = getCreditClassColor(creditor.creditClass);
                const isSelected = selectedCreditorIds.includes(creditor.id);

                return (
                  <tr
                    key={creditor.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectCreditor(creditor.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Nome & Documento */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{creditor.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {formatDocument(creditor.document)}
                      </div>
                      {creditor.email && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {creditor.email}
                        </div>
                      )}
                    </td>

                    {/* Classe & Natureza */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${color.bg} ${color.border}`}
                      >
                        {getCreditClassShortLabel(creditor.creditClass)}
                      </span>
                      <div className="text-[11px] text-slate-600 mt-1 truncate max-w-[200px]" title={creditor.nature}>
                        {creditor.nature}
                      </div>
                    </td>

                    {/* Valor Declarado */}
                    <td className="py-3 px-4 text-right font-medium text-slate-600">
                      {formatCurrency(creditor.originalValue)}
                    </td>

                    {/* Valor Apurado */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-slate-900">
                        {formatCurrency(creditor.adjustedValue)}
                      </div>
                      {creditor.adjustedValue !== creditor.originalValue && (
                        <span className="text-[10px] text-blue-600 font-medium">
                          {creditor.adjustedValue > creditor.originalValue ? '+ ' : '- '}
                          {formatCurrency(Math.abs(creditor.adjustedValue - creditor.originalValue))}
                        </span>
                      )}
                    </td>

                    {/* Status Divergência */}
                    <td className="py-3 px-4 text-center">
                      {creditor.divergenceStatus === 'sem_divergencia' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
                          Regular
                        </span>
                      ) : creditor.divergenceStatus === 'divergencia_apresentada' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-200">
                          Divergência
                        </span>
                      ) : creditor.divergenceStatus === 'em_analise_aj' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold border border-purple-200">
                          Em Análise
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          Retificado
                        </span>
                      )}
                      {creditor.notes && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[130px]" title={creditor.notes}>
                          {creditor.notes}
                        </div>
                      )}
                    </td>

                    {/* Status Notificação */}
                    <td className="py-3 px-4 text-center">
                      {creditor.notificationStatus === 'pendente' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 font-medium border border-rose-200">
                          Pendente
                        </span>
                      ) : creditor.notificationStatus === 'confirmado_recebimento' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Confirmado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-800 font-medium border border-blue-200">
                          <Mail className="w-3 h-3 mr-1 text-blue-600" />
                          Notificado
                        </span>
                      )}
                      {creditor.notificationSentAt && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {creditor.notificationSentAt.slice(0, 10)}
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onGenerateLetter(creditor)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Gerar Carta de Notificação (PDF/Impressão)"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSendEmailNotification(creditor)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Enviar notificação por E-mail"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCreditor(creditor);
                            setShowAddModal(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Editar Credor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCreditor(creditor.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Excluir Credor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCreditors.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum credor encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Adicionar / Editar Credor */}
      {showAddModal && (
        <CreditorFormModal
          creditor={editingCreditor}
          onClose={() => {
            setShowAddModal(false);
            setEditingCreditor(null);
          }}
          onSave={handleSaveCreditor}
        />
      )}

      {/* Modal: Importar Lista de Credores */}
      {showImportModal && (
        <CreditorsImportModal
          onClose={() => setShowImportModal(false)}
          onImport={(importedCreditors) => {
            onUpdateCreditors([...importedCreditors, ...process.creditors]);
            setShowImportModal(false);
          }}
        />
      )}
    </div>
  );
};

// Subcomponente: Modal de Adição/Edição Individual
interface CreditorFormModalProps {
  creditor: Creditor | null;
  onClose: () => void;
  onSave: (creditorData: Partial<Creditor>) => void;
}

const CreditorFormModal: React.FC<CreditorFormModalProps> = ({ creditor, onClose, onSave }) => {
  const [name, setName] = useState(creditor?.name || '');
  const [document, setDocument] = useState(creditor?.document || '');
  const [email, setEmail] = useState(creditor?.email || '');
  const [phone, setPhone] = useState(creditor?.phone || '');
  const [address, setAddress] = useState(creditor?.address || '');
  const [creditClass, setCreditClass] = useState<CreditClass>(creditor?.creditClass || 'CLASSE_III');
  const [originalValue, setOriginalValue] = useState(creditor?.originalValue?.toString() || '0');
  const [adjustedValue, setAdjustedValue] = useState(creditor?.adjustedValue?.toString() || '0');
  const [nature, setNature] = useState(creditor?.nature || 'Duplicatas Mercantis / Contrato');
  const [divergenceStatus, setDivergenceStatus] = useState(creditor?.divergenceStatus || 'sem_divergencia');
  const [notes, setNotes] = useState(creditor?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Informe o nome do credor');

    onSave({
      name,
      document,
      email,
      phone,
      address,
      creditClass,
      originalValue: parseFloat(originalValue) || 0,
      adjustedValue: parseFloat(adjustedValue) || parseFloat(originalValue) || 0,
      nature,
      divergenceStatus: divergenceStatus as any,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6 text-slate-900 animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            {creditor ? 'Editar Dados do Credor' : 'Cadastrar Novo Credor no QGC'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nome / Razão Social do Credor *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fornecedora de Embalagens Brasil S/A"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CPF ou CNPJ</label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Classe do Crédito (Lei 11.101/05)
              </label>
              <select
                value={creditClass}
                onChange={(e) => setCreditClass(e.target.value as CreditClass)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="CLASSE_I">Classe I - Trabalhista</option>
                <option value="CLASSE_II">Classe II - Garantia Real</option>
                <option value="CLASSE_III">Classe III - Quirografário</option>
                <option value="CLASSE_IV">Classe IV - ME / EPP</option>
                <option value="EXTRACONCURSAL">Extraconcursal (Não Concursal)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Valor Declarado pelo Devedor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={originalValue}
                onChange={(e) => {
                  setOriginalValue(e.target.value);
                  if (!creditor) setAdjustedValue(e.target.value);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Valor Apurado pelo AJ (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={adjustedValue}
                onChange={(e) => setAdjustedValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Natureza / Origem do Crédito
            </label>
            <input
              type="text"
              value={nature}
              onChange={(e) => setNature(e.target.value)}
              placeholder="Ex: Fornecimento de matéria-prima, CCB nº 1234, etc."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                E-mail para Notificação
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="credor@empresa.com.br"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telefone de Contato</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Endereço Completo</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, Número, Bairro, Cidade/UF, CEP"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status de Divergência (Art. 7º §1º)
              </label>
              <select
                value={divergenceStatus}
                onChange={(e) => setDivergenceStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="sem_divergencia">Sem Divergência (Regular)</option>
                <option value="divergencia_apresentada">Divergência Apresentada</option>
                <option value="em_analise_aj">Em Análise pelo AJ</option>
                <option value="retificado">Retificado / Acolhido</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Observações do AJ</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Juntada de memória de cálculo"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
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
              Salvar Credor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Subcomponente: Modal de Importação em Massa (CSV / Texto)
interface CreditorsImportModalProps {
  onClose: () => void;
  onImport: (creditors: Creditor[]) => void;
}

const CreditorsImportModal: React.FC<CreditorsImportModalProps> = ({ onClose, onImport }) => {
  const [rawText, setRawText] = useState('');
  const [previewCreditors, setPreviewCreditors] = useState<Creditor[]>([]);
  const [defaultClass, setDefaultClass] = useState<CreditClass>('CLASSE_III');

  const SAMPLE_CSV = `Nome do Credor;CPF/CNPJ;Classe;Valor;Natureza;E-mail
Logística TransNorte Ltda;18.234.567/0001-89;CLASSE_III;450000;Fretes e Distribuição;financeiro@transnorte.com.br
Comércio de Ferramentas Paulista;22.456.789/0001-12;CLASSE_IV;85000;Fornecimento Peças;comercial@ferramentas.com.br
João Carlos Pereira (Mecânico);123.456.789-00;CLASSE_I;32000;Verbas Rescisórias CLT;joao.mecanico@gmail.com
Banco ABC Brasil S/A;28.195.667/0001-06;CLASSE_II;8500000;Cédula de Crédito Bancário com Alienação;juridico@bancoabc.com.br`;

  const parseInput = (text: string) => {
    if (!text.trim()) {
      setPreviewCreditors([]);
      return;
    }

    const lines = text
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed: Creditor[] = [];

    // Check if first line is header
    let startIndex = 0;
    if (
      lines[0].toLowerCase().includes('nome') ||
      lines[0].toLowerCase().includes('credor') ||
      lines[0].toLowerCase().includes('cnpj')
    ) {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Separator can be semicolon, comma or tab
      const separator = line.includes(';') ? ';' : line.includes('\t') ? '\t' : ',';
      const cols = line.split(separator).map((c) => c.replace(/^"|"$/g, '').trim());

      if (cols.length >= 2) {
        const name = cols[0] || `Credor Importado ${i}`;
        const document = cols[1] || '';
        let detectedClass: CreditClass = defaultClass;

        // Try detecting class from 3rd column or name
        if (cols[2]) {
          const cUpper = cols[2].toUpperCase();
          if (cUpper.includes('I') && !cUpper.includes('II') && !cUpper.includes('III') && !cUpper.includes('IV') || cUpper.includes('TRAB')) {
            detectedClass = 'CLASSE_I';
          } else if (cUpper.includes('II') && !cUpper.includes('III') || cUpper.includes('REAL')) {
            detectedClass = 'CLASSE_II';
          } else if (cUpper.includes('III') || cUpper.includes('QUIRO')) {
            detectedClass = 'CLASSE_III';
          } else if (cUpper.includes('IV') || cUpper.includes('ME') || cUpper.includes('EPP')) {
            detectedClass = 'CLASSE_IV';
          } else if (cUpper.includes('EXTRA')) {
            detectedClass = 'EXTRACONCURSAL';
          }
        }

        // Value in col 3 or col 4
        let val = 0;
        const valStr = cols[3] || cols[2] || '0';
        const cleanVal = valStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        val = parseFloat(cleanVal) || 0;

        const nature = cols[4] || 'Crédito Arrolado na Recuperação';
        const email = cols[5] || '';

        parsed.push({
          id: `imp-${Date.now()}-${i}`,
          name,
          document,
          email,
          creditClass: detectedClass,
          originalValue: val,
          adjustedValue: val,
          divergenceStatus: 'sem_divergencia',
          nature,
          notificationStatus: 'pendente',
        });
      }
    }

    setPreviewCreditors(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setRawText(content);
      parseInput(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_CSV);
    parseInput(SAMPLE_CSV);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-3xl w-full p-6 text-slate-900 animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Importação Inteligente de Credores (QGC)</h2>
              <p className="text-xs text-slate-500">
                Carregue planilhas do Devedor, listas em CSV ou cole dados tabulados
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mt-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-slate-700">Upload de Arquivo (.CSV ou .TXT):</label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
            </div>
            <button
              onClick={handleLoadSample}
              className="text-blue-600 hover:text-blue-700 font-semibold underline cursor-pointer"
            >
              Carregar Exemplo de Teste
            </button>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ou Cole o Texto Estruturado (Separado por Ponto e Vírgula, Vírgula ou Tabulação):
            </label>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                parseInput(e.target.value);
              }}
              placeholder={`Nome;CPF_CNPJ;Classe;Valor;Natureza;Email\nExemplo S/A;00.000.000/0001-00;CLASSE_III;150000;Fornecedor;financeiro@exemplo.com`}
              className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            ></textarea>
          </div>

          {/* Preview da Importação */}
          {previewCreditors.length > 0 && (
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">
                  Pré-visualização: {previewCreditors.length} credores reconhecidos
                </span>
                <span className="text-blue-600 font-bold">
                  Total: {formatCurrency(previewCreditors.reduce((a, b) => a + b.adjustedValue, 0))}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                {previewCreditors.map((c, idx) => (
                  <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-900">{c.name}</strong>
                      <span className="text-slate-500 ml-2 font-mono">{c.document}</span>
                      <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] bg-slate-200 font-medium">
                        {c.creditClass}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(c.adjustedValue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              disabled={previewCreditors.length === 0}
              onClick={() => onImport(previewCreditors)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              Confirmar Importação de {previewCreditors.length} Credores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
