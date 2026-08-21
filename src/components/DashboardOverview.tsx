import React from 'react';
import {
  Building2,
  Users,
  Clock,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  FileCheck,
  Mail,
  FileText,
  Calendar,
  Layers,
  Send,
  Printer,
  ChevronRight,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { JudicialRecoveryProcess } from '../types';
import {
  calculateDaysRemaining,
  calculateStayPeriod,
  formatCurrency,
  formatDate,
  formatDocument,
  getCreditClassColor,
  getCreditClassLabel,
} from '../utils/formatters';

interface DashboardOverviewProps {
  process: JudicialRecoveryProcess;
  onNavigateTab: (tab: 'dashboard' | 'credores' | 'prazos' | 'documentos' | 'movimentacoes' | 'emails') => void;
  onOpenEditProcess: () => void;
  onQuickGenerateLetters: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  process,
  onNavigateTab,
  onOpenEditProcess,
  onQuickGenerateLetters,
}) => {
  const stay = calculateStayPeriod(
    process.stayPeriodStartDate,
    process.stayPeriodDays,
    process.stayPeriodExtended,
    process.stayPeriodExtendedDays
  );

  // Cálculos por classe
  const classBreakdown = [
    {
      key: 'CLASSE_I' as const,
      label: 'Classe I - Trabalhista',
      short: 'Classe I',
      creditors: process.creditors.filter((c) => c.creditClass === 'CLASSE_I'),
    },
    {
      key: 'CLASSE_II' as const,
      label: 'Classe II - Garantia Real',
      short: 'Classe II',
      creditors: process.creditors.filter((c) => c.creditClass === 'CLASSE_II'),
    },
    {
      key: 'CLASSE_III' as const,
      label: 'Classe III - Quirografário',
      short: 'Classe III',
      creditors: process.creditors.filter((c) => c.creditClass === 'CLASSE_III'),
    },
    {
      key: 'CLASSE_IV' as const,
      label: 'Classe IV - ME / EPP',
      short: 'Classe IV',
      creditors: process.creditors.filter((c) => c.creditClass === 'CLASSE_IV'),
    },
    {
      key: 'EXTRACONCURSAL' as const,
      label: 'Extraconcursal',
      short: 'Extraconcursal',
      creditors: process.creditors.filter((c) => c.creditClass === 'EXTRACONCURSAL'),
    },
  ].map((item) => {
    const totalOriginal = item.creditors.reduce((acc, c) => acc + c.originalValue, 0);
    const totalAdjusted = item.creditors.reduce((acc, c) => acc + c.adjustedValue, 0);
    const percent = process.totalPassivo > 0 ? (totalAdjusted / process.totalPassivo) * 100 : 0;
    return {
      ...item,
      count: item.creditors.length,
      totalOriginal,
      totalAdjusted,
      percent,
    };
  });

  // Prazos ordenados
  const upcomingDeadlines = [...process.deadlines]
    .filter((d) => d.status !== 'cumprido')
    .sort((a, b) => {
      const daysA = calculateDaysRemaining(a.dueDate);
      const daysB = calculateDaysRemaining(b.dueDate);
      return daysA - daysB;
    });

  // Estatísticas de cartas aos credores
  const notifiedCount = process.creditors.filter(
    (c) => c.notificationStatus === 'notificado_email' || c.notificationStatus === 'confirmado_recebimento'
  ).length;
  const pendingNotificationCount = process.creditors.length - notifiedCount;
  const notificationPercentage =
    process.creditors.length > 0 ? Math.round((notifiedCount / process.creditors.length) * 100) : 0;

  // Divergências
  const divergencesCount = process.creditors.filter(
    (c) => c.divergenceStatus !== 'sem_divergencia'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner com Ações Rápidas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xs text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {process.type === 'ordinaria' ? 'Recuperação Judicial Ordinária' : 'Plano Especial ME/EPP'}
              </span>
              <span className="text-xs text-slate-400 font-mono">Autos nº {process.processNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {process.debtorName}
              {process.tradeName && (
                <span className="text-sm font-normal text-slate-300">({process.tradeName})</span>
              )}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              {process.court} • Juiz Titular: {process.judgeName} • Administrador: {process.judicialAdminName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenEditProcess}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              Editar Dados do Processo
            </button>
            <button
              onClick={() => onNavigateTab('movimentacoes')}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg border border-blue-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Exportar Relatório Geral
            </button>
            <button
              onClick={onQuickGenerateLetters}
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Gerar Notificações aos Credores
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Passivo Total */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Passivo Total Concursal
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(process.totalPassivo)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              Distribuído em <strong className="text-slate-700 mx-1">{process.creditors.length}</strong> credores cadastrados
            </p>
          </div>
        </div>

        {/* Stay Period */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stay Period (Art. 6º, §4º)
            </span>
            <div className={`p-2 rounded-lg ${stay.isExpired ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">
                {stay.daysRemaining} <span className="text-sm font-normal text-slate-500">dias restantes</span>
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${stay.percentElapsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${stay.percentElapsed}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
              <span>{stay.daysElapsed} de {stay.totalDays} dias</span>
              <span>Término: {stay.endDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* Notificações aos Credores */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cartas aos Credores (Art. 22)
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {notifiedCount} / {process.creditors.length}
              <span className="text-xs font-normal text-slate-500 ml-2">({notificationPercentage}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${notificationPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
              <span>{pendingNotificationCount} pendentes de envio</span>
              <button
                onClick={() => onNavigateTab('credores')}
                className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Gerenciar →
              </button>
            </div>
          </div>
        </div>

        {/* Prazos Processuais */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Prazos da Lei 11.101/05
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {upcomingDeadlines.length} <span className="text-sm font-normal text-slate-500">em aberto</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Próximo vencimento: <strong className="text-slate-800">{upcomingDeadlines[0] ? formatDate(upcomingDeadlines[0].dueDate) : 'Nenhum'}</strong>
            </p>
            <div className="mt-2 text-[11px]">
              <button
                onClick={() => onNavigateTab('prazos')}
                className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Ver cronograma completo →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Quadro de Credores Resumido + Prazos Iminentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Distribuição do Passivo por Classe */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Quadro Geral de Credores por Classe
              </h2>
              <p className="text-xs text-slate-500">
                Divisão conforme artigos 41 e 83 da Lei nº 11.101/2005
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('credores')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Ver Tabela Completa ({process.creditors.length}) →
            </button>
          </div>

          {/* Cards das 4 Classes + Extraconcursal */}
          <div className="space-y-3.5">
            {classBreakdown.map((item) => {
              const color = getCreditClassColor(item.key);
              return (
                <div
                  key={item.key}
                  className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className={`w-3 h-3 rounded-full ${color.dot}`}></span>
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{item.label}</span>
                        <span className="text-xs text-slate-500 ml-2">
                          ({item.count} {item.count === 1 ? 'credor' : 'credores'})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatCurrency(item.totalAdjusted)}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          {item.percent.toFixed(1)}% do passivo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress visual */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color.dot}`}
                      style={{ width: `${Math.max(item.percent, 1)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alertas de Divergências */}
          {divergencesCount > 0 && (
            <div className="mt-5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <strong className="font-semibold block text-sm">
                  {divergencesCount} Divergência(s) Administrativa(s) Registrada(s)
                </strong>
                Há créditos com retificações ou análises pendentes pela Contadoria do AJ para emissão do Edital do Art. 7º, §2º.
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita: Prazos e Compromissos Iminentes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Prazos Processuais
              </h2>
              <button
                onClick={() => onNavigateTab('prazos')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Ver todos →
              </button>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.slice(0, 4).map((deadline) => {
                const days = calculateDaysRemaining(deadline.dueDate);
                const isUrgent = days <= 5;
                const isWarning = days > 5 && days <= 15;

                return (
                  <div
                    key={deadline.id}
                    className={`p-3 rounded-lg border text-xs transition-colors ${
                      isUrgent
                        ? 'border-rose-200 bg-rose-50/60'
                        : isWarning
                        ? 'border-amber-200 bg-amber-50/60'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">
                          {deadline.title}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                          {deadline.legalBasis}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          days < 0
                            ? 'bg-rose-600 text-white'
                            : days <= 3
                            ? 'bg-rose-500 text-white'
                            : days <= 7
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {days < 0 ? `${Math.abs(days)}d atrasado` : days === 0 ? 'Hoje!' : `${days} dias`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                      <span>Vencimento: <strong>{formatDate(deadline.dueDate)}</strong></span>
                      <span className="text-slate-600 truncate max-w-[120px]">{deadline.responsible}</span>
                    </div>
                  </div>
                );
              })}

              {upcomingDeadlines.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Nenhum prazo pendente no momento.
                </div>
              )}
            </div>
          </div>

          {/* Banner de RMA Mensal */}
          <div className="mt-5 p-3.5 bg-slate-900 text-white rounded-lg">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Calendar className="w-4 h-4" />
                RMA Mensal do AJ
              </span>
              <span className="text-[11px] text-slate-300">Dia {process.rmaMonthlyDay} de cada mês</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Último RMA protocolado: <strong>{process.lastRmaMonth || 'Pendente'}</strong>
            </p>
            <button
              onClick={() => onNavigateTab('documentos')}
              className="mt-2 w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs transition-colors cursor-pointer"
            >
              Gerar Minuta de RMA →
            </button>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Ficha Técnica do Caso & Movimentações Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ficha Técnica */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            Dados da Administração Judicial
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">Administrador Titular:</span>
              <span className="font-semibold text-slate-900 text-sm">{process.judicialAdminName}</span>
              <span className="text-slate-600 block text-[11px]">{process.judicialAdminOffice}</span>
              <span className="text-slate-500 font-mono text-[10px]">{process.judicialAdminDocument}</span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 block">E-mail para Notificações & Habilitações:</span>
              <span className="font-medium text-blue-700">{process.judicialAdminEmail}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block">Advogado Líder:</span>
                <span className="font-medium text-slate-800">{process.leadAdvocate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contador Líder:</span>
                <span className="font-medium text-slate-800">{process.leadAccountant}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 block">Marcos Processuais:</span>
              <div className="mt-1 space-y-1 text-[11px] text-slate-600">
                <div>• Distribuição: {formatDate(process.distributionDate)}</div>
                <div>• Deferimento: {formatDate(process.processingDecisionDate)}</div>
                <div>• Edital Art. 52, §1º: {formatDate(process.art52NoticeDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Últimas Movimentações */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              Últimos Andamentos & Movimentações
            </h2>
            <button
              onClick={() => onNavigateTab('movimentacoes')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Ver histórico completo →
            </button>
          </div>

          <div className="space-y-3">
            {process.movements.slice(0, 3).map((mov) => (
              <div
                key={mov.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{mov.title}</span>
                  <span className="text-[11px] text-slate-400">{mov.date}</span>
                </div>
                <p className="text-slate-600 mt-1 line-clamp-2">{mov.summary}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 text-[11px] text-slate-500">
                  <span>Autor: <strong className="text-slate-700">{mov.author}</strong></span>
                  {mov.folio && <span className="font-mono bg-slate-200/60 px-1.5 py-0.5 rounded">{mov.folio}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
