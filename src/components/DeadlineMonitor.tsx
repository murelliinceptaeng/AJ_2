import React, { useState } from 'react';
import {
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Calendar as CalendarIcon,
  Mail,
  Send,
  HelpCircle,
  X,
  Edit2,
  Trash2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';
import { LegalDeadline, JudicialRecoveryProcess } from '../types';
import { calculateDaysRemaining, formatDate } from '../utils/formatters';

interface DeadlineMonitorProps {
  process: JudicialRecoveryProcess;
  onUpdateDeadlines: (deadlines: LegalDeadline[]) => void;
  onSendDeadlineAlert: (deadline: LegalDeadline) => void;
}

export const DeadlineMonitor: React.FC<DeadlineMonitorProps> = ({
  process,
  onUpdateDeadlines,
  onSendDeadlineAlert,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAutoCalculateModal, setShowAutoCalculateModal] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<LegalDeadline | null>(null);

  // Filtered Deadlines
  const filteredDeadlines = process.deadlines.filter((d) => {
    const matchesCategory = filterCategory === 'ALL' || d.category === filterCategory;
    let matchesStatus = true;
    if (filterStatus === 'pendente') matchesStatus = d.status !== 'cumprido';
    else if (filterStatus === 'cumprido') matchesStatus = d.status === 'cumprido';
    else if (filterStatus === 'urgente') {
      const days = calculateDaysRemaining(d.dueDate);
      matchesStatus = d.status !== 'cumprido' && days <= 7;
    }
    return matchesCategory && matchesStatus;
  });

  // Sort deadlines by due date
  const sortedDeadlines = [...filteredDeadlines].sort((a, b) => {
    if (a.status === 'cumprido' && b.status !== 'cumprido') return 1;
    if (a.status !== 'cumprido' && b.status === 'cumprido') return -1;
    const daysA = calculateDaysRemaining(a.dueDate);
    const daysB = calculateDaysRemaining(b.dueDate);
    return daysA - daysB;
  });

  // Mark as completed
  const handleToggleComplete = (id: string) => {
    const updated = process.deadlines.map((d) => {
      if (d.id === id) {
        const isCurrentlyCompleted = d.status === 'cumprido';
        return {
          ...d,
          status: (isCurrentlyCompleted ? 'em_andamento' : 'cumprido') as any,
          completedAt: isCurrentlyCompleted ? undefined : new Date().toISOString().slice(0, 10),
        };
      }
      return d;
    });
    onUpdateDeadlines(updated);
  };

  // Delete
  const handleDelete = (id: string) => {
    if (window.confirm('Deseja excluir este prazo processual do monitor?')) {
      onUpdateDeadlines(process.deadlines.filter((d) => d.id !== id));
    }
  };

  // Save or edit
  const handleSaveDeadline = (deadlineData: Partial<LegalDeadline>) => {
    if (editingDeadline) {
      const updated = process.deadlines.map((d) =>
        d.id === editingDeadline.id ? { ...d, ...deadlineData } : d
      );
      onUpdateDeadlines(updated as LegalDeadline[]);
    } else {
      const newDeadline: LegalDeadline = {
        id: `dl-${Date.now()}`,
        title: deadlineData.title || 'Prazo Processual',
        legalBasis: deadlineData.legalBasis || 'Lei 11.101/05',
        description: deadlineData.description || '',
        startDate: deadlineData.startDate || new Date().toISOString().slice(0, 10),
        dueDate: deadlineData.dueDate || new Date().toISOString().slice(0, 10),
        status: 'em_andamento',
        responsible: deadlineData.responsible || process.judicialAdminName,
        category: deadlineData.category || 'aj_obrigacao',
        emailAlertEnabled: deadlineData.emailAlertEnabled ?? true,
        emailAlertDaysBefore: [15, 7, 3, 1, 0],
      };
      onUpdateDeadlines([newDeadline, ...process.deadlines]);
    }
    setShowAddModal(false);
    setEditingDeadline(null);
  };

  // Automatic Calculation of Standard LRF Deadlines based on process dates
  const handleAutoRecalculateLRF = () => {
    const baseDate = process.processingDecisionDate || process.distributionDate;
    const editalDate = process.art52NoticeDate || baseDate;

    if (!baseDate) {
      alert('Preencha ao menos a Data do Deferimento do Processamento nos dados do caso.');
      return;
    }

    // Helpers to add days
    const addDays = (dateStr: string, days: number): string => {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      d.setDate(d.getDate() + days);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
    };

    const calculatedDeadlines: LegalDeadline[] = [
      {
        id: `dl-calc-1-${Date.now()}`,
        title: 'Habilitações e Divergências de Credores ao AJ (15 dias)',
        legalBasis: 'Art. 7º, § 1º da Lei 11.101/05',
        description: 'Prazo para os credores apresentarem suas divergências ou habilitações diretamente ao Administrador Judicial.',
        startDate: editalDate,
        dueDate: addDays(editalDate, 15),
        status: 'em_andamento',
        responsible: 'Credores Concursais',
        category: 'credores',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [5, 2, 0],
      },
      {
        id: `dl-calc-2-${Date.now()}`,
        title: 'Publicação do Edital com a 2ª Lista do AJ (45 dias)',
        legalBasis: 'Art. 7º, § 2º da Lei 11.101/05',
        description: 'Prazo para o Administrador Judicial conferir livros, documentos e publicar a relação final de credores.',
        startDate: addDays(editalDate, 15),
        dueDate: addDays(editalDate, 60), // 15 + 45
        status: 'em_andamento',
        responsible: `${process.judicialAdminName} (AJ)`,
        category: 'aj_obrigacao',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [15, 7, 3, 1, 0],
      },
      {
        id: `dl-calc-3-${Date.now()}`,
        title: 'Apresentação do Plano de Recuperação Judicial (60 dias)',
        legalBasis: 'Art. 53 da Lei 11.101/05',
        description: 'Prazo improrrogável para a Devedora protocolar o Plano de Recuperação sob pena de convolação em falência.',
        startDate: baseDate,
        dueDate: addDays(baseDate, 60),
        status: process.planSubmittedDate ? 'cumprido' : 'em_andamento',
        responsible: 'Recuperanda (Advogados)',
        category: 'devedora',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [15, 7, 3, 1, 0],
        completedAt: process.planSubmittedDate,
      },
      {
        id: `dl-calc-4-${Date.now()}`,
        title: 'Objeções dos Credores ao Plano de Recuperação (30 dias)',
        legalBasis: 'Art. 55 da Lei 11.101/05',
        description: 'Prazo de 30 dias contados da publicação da relação do art. 7º §2º para os credores manifestarem objeção ao plano.',
        startDate: addDays(editalDate, 60),
        dueDate: addDays(editalDate, 90),
        status: 'pendente',
        responsible: 'Credores Concursais',
        category: 'credores',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [10, 3, 0],
      },
      {
        id: `dl-calc-5-${Date.now()}`,
        title: 'Término do Stay Period Ordinário (180 dias)',
        legalBasis: 'Art. 6º, § 4º da Lei 11.101/05',
        description: 'Suspensão de todas as ações e execuções contra a devedora.',
        startDate: baseDate,
        dueDate: addDays(baseDate, 180),
        status: 'em_andamento',
        responsible: 'Juízo / Partes',
        category: 'juizo',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [30, 15, 5],
      },
      {
        id: `dl-calc-6-${Date.now()}`,
        title: 'Protocolo Mensal do RMA (Relatório Mensal de Atividades)',
        legalBasis: 'Art. 22, II, "c" da Lei 11.101/05',
        description: 'Obrigação mensal do Administrador Judicial de fiscalizar e protocolar o relatório até o dia 15.',
        startDate: new Date().toISOString().slice(0, 8) + '01',
        dueDate: new Date().toISOString().slice(0, 8) + '15',
        status: 'em_andamento',
        responsible: 'Equipe Contábil do AJ',
        category: 'aj_obrigacao',
        emailAlertEnabled: true,
        emailAlertDaysBefore: [5, 2, 0],
      },
    ];

    onUpdateDeadlines(calculatedDeadlines);
    setShowAutoCalculateModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header com Ações */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Monitor Automático de Prazos Processuais
              </h1>
              <p className="text-xs text-slate-500">
                Controle rigoroso dos prazos legais da Lei 11.101/05 com alertas antecipados por e-mail
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAutoCalculateModal(true)}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              Recalcular Prazos Legais (LRF)
            </button>

            <button
              onClick={() => {
                setEditingDeadline(null);
                setShowAddModal(true);
              }}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Novo Prazo Customizado
            </button>
          </div>
        </div>

        {/* Filtros de Prazos */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar:
            </span>

            {/* Status */}
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({process.deadlines.length})
            </button>

            <button
              onClick={() => setFilterStatus('pendente')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'pendente'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Em Aberto ({process.deadlines.filter((d) => d.status !== 'cumprido').length})
            </button>

            <button
              onClick={() => setFilterStatus('urgente')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'urgente'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Urgentes ≤ 7 dias
            </button>

            <button
              onClick={() => setFilterStatus('cumprido')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filterStatus === 'cumprido'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Cumpridos ({process.deadlines.filter((d) => d.status === 'cumprido').length})
            </button>
          </div>

          {/* Categoria */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Todas as Categorias</option>
            <option value="aj_obrigacao">Obrigações do Administrador Judicial</option>
            <option value="devedora">Obrigações da Devedora / Recuperanda</option>
            <option value="credores">Manifestações dos Credores</option>
            <option value="juizo">Atos e Prazos do Juízo</option>
          </select>
        </div>
      </div>

      {/* Lista de Prazos */}
      <div className="space-y-3">
        {sortedDeadlines.map((deadline) => {
          const days = calculateDaysRemaining(deadline.dueDate);
          const isCompleted = deadline.status === 'cumprido';
          const isOverdue = !isCompleted && days < 0;
          const isImminent = !isCompleted && days >= 0 && days <= 5;
          const isWarning = !isCompleted && days > 5 && days <= 15;

          return (
            <div
              key={deadline.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                isCompleted
                  ? 'border-slate-200 bg-slate-50/40 opacity-75'
                  : isOverdue
                  ? 'border-rose-300 bg-rose-50/20'
                  : isImminent
                  ? 'border-rose-200 bg-rose-50/10'
                  : isWarning
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Lado Esquerdo: Check + Informações */}
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => handleToggleComplete(deadline.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-transparent'
                    }`}
                    title={isCompleted ? 'Marcar como não cumprido' : 'Concluir prazo'}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-base font-bold ${
                          isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}
                      >
                        {deadline.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 font-semibold">
                        {deadline.legalBasis}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium capitalize">
                        {deadline.category.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                      {deadline.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-500">
                      <span>Início: <strong>{formatDate(deadline.startDate)}</strong></span>
                      <span>Vencimento: <strong className="text-slate-900">{formatDate(deadline.dueDate)}</strong></span>
                      <span>Responsável: <strong className="text-slate-700">{deadline.responsible}</strong></span>
                      {deadline.emailAlertEnabled && (
                        <span className="text-blue-600 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> Lembrete por E-mail Ativo
                        </span>
                      )}
                      {deadline.completedAt && (
                        <span className="text-emerald-700 font-semibold">
                          ✓ Cumprido em {formatDate(deadline.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Badge de Contagem + Ações */}
                <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Badge de Dias */}
                  {isCompleted ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Cumprido
                    </span>
                  ) : isOverdue ? (
                    <span className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                      <AlertTriangle className="w-4 h-4" /> Vencido há {Math.abs(days)} dias
                    </span>
                  ) : days === 0 ? (
                    <span className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-4 h-4" /> Vence Hoje!
                    </span>
                  ) : (
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        days <= 3
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : days <= 7
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {days} dias restantes
                    </span>
                  )}

                  {/* Ações */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onSendDeadlineAlert(deadline)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Disparar E-mail de Alerta para a Equipe Agora"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingDeadline(deadline);
                        setShowAddModal(true);
                      }}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Editar Prazo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(deadline.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Prazo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {sortedDeadlines.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            Nenhum prazo encontrado para os filtros selecionados.
          </div>
        )}
      </div>

      {/* Modal: Adicionar / Editar Prazo */}
      {showAddModal && (
        <DeadlineFormModal
          deadline={editingDeadline}
          process={process}
          onClose={() => {
            setShowAddModal(false);
            setEditingDeadline(null);
          }}
          onSave={handleSaveDeadline}
        />
      )}

      {/* Modal: Confirmação de Recálculo Automático LRF */}
      {showAutoCalculateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 text-slate-900 animate-fadeIn">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold">Recalcular Prazos da Lei 11.101/05</h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              O sistema irá calcular automaticamente toda a cadeia de prazos processuais com base nas datas de{' '}
              <strong>Deferimento ({formatDate(process.processingDecisionDate)})</strong> e{' '}
              <strong>Publicação do Edital do Art. 52, §1º ({formatDate(process.art52NoticeDate)})</strong>.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700 border border-slate-200">
              <div>• 15 dias: Habilitações e Divergências ao AJ (Art. 7º §1º)</div>
              <div>• 45 dias: 2ª Relação de Credores pelo AJ (Art. 7º §2º)</div>
              <div>• 60 dias: Apresentação do Plano de Recuperação (Art. 53)</div>
              <div>• 30 dias: Objeções ao PRJ (Art. 55)</div>
              <div>• 180 dias: Stay Period Ordinário (Art. 6º §4º)</div>
              <div>• Todo dia {process.rmaMonthlyDay}: Entrega do RMA Mensal</div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-5 mt-4 border-t border-slate-100">
              <button
                onClick={() => setShowAutoCalculateModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAutoRecalculateLRF}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs shadow-xs cursor-pointer"
              >
                Confirmar e Gerar Cronograma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponente: Form Modal de Prazo
interface DeadlineFormModalProps {
  deadline: LegalDeadline | null;
  process: JudicialRecoveryProcess;
  onClose: () => void;
  onSave: (data: Partial<LegalDeadline>) => void;
}

const DeadlineFormModal: React.FC<DeadlineFormModalProps> = ({ deadline, process, onClose, onSave }) => {
  const [title, setTitle] = useState(deadline?.title || '');
  const [legalBasis, setLegalBasis] = useState(deadline?.legalBasis || 'Art. 22 da Lei 11.101/05');
  const [description, setDescription] = useState(deadline?.description || '');
  const [startDate, setStartDate] = useState(deadline?.startDate || new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(deadline?.dueDate || new Date().toISOString().slice(0, 10));
  const [responsible, setResponsible] = useState(deadline?.responsible || process.judicialAdminName);
  const [category, setCategory] = useState(deadline?.category || 'aj_obrigacao');
  const [emailAlertEnabled, setEmailAlertEnabled] = useState(deadline?.emailAlertEnabled ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Informe o título do prazo');

    onSave({
      title,
      legalBasis,
      description,
      startDate,
      dueDate,
      responsible,
      category: category as any,
      emailAlertEnabled,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 text-slate-900 animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            {deadline ? 'Editar Prazo Processual' : 'Cadastrar Novo Prazo Processual'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Título da Obrigação / Prazo *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Protocolo do Parecer sobre o Plano de Recuperação"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fundamento Legal</label>
              <input
                type="text"
                value={legalBasis}
                onChange={(e) => setLegalBasis(e.target.value)}
                placeholder="Ex: Art. 53 LRF / Art. 219 CPC"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="aj_obrigacao">Obrigação do Administrador Judicial</option>
                <option value="devedora">Obrigação da Devedora</option>
                <option value="credores">Manifestação dos Credores</option>
                <option value="juizo">Ato do Juízo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data de Início</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data de Vencimento *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Responsável pelo Cumprimento</label>
            <input
              type="text"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="Ex: Dr. Roberto Silveira Mendes"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Descrição / Instruções</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes dos requisitos, documentos ou formalidades a observar..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            ></textarea>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="chk-email-alert"
              checked={emailAlertEnabled}
              onChange={(e) => setEmailAlertEnabled(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="chk-email-alert" className="text-slate-700 font-medium cursor-pointer">
              Ativar envio automático de lembretes por e-mail para a equipe
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
              Salvar Prazo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
