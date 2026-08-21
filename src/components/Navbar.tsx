import React from 'react';
import {
  Scale,
  FolderOpen,
  Users,
  Clock,
  FileText,
  Activity,
  PlusCircle,
  Bell,
  Mail,
  ChevronDown,
  Building2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { JudicialRecoveryProcess } from '../types';
import { calculateDaysRemaining, formatCurrency } from '../utils/formatters';

interface NavbarProps {
  processes: JudicialRecoveryProcess[];
  activeProcessId: string;
  onSelectProcess: (id: string) => void;
  activeTab: 'dashboard' | 'credores' | 'prazos' | 'documentos' | 'movimentacoes' | 'emails';
  setActiveTab: (tab: 'dashboard' | 'credores' | 'prazos' | 'documentos' | 'movimentacoes' | 'emails') => void;
  onOpenNewProcessModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  processes,
  activeProcessId,
  onSelectProcess,
  activeTab,
  setActiveTab,
  onOpenNewProcessModal,
}) => {
  const activeProcess = processes.find((p) => p.id === activeProcessId) || processes[0];

  // Cálculo de alertas urgentes no processo ativo
  const urgentDeadlines = activeProcess?.deadlines.filter((d) => {
    if (d.status === 'cumprido') return false;
    const days = calculateDaysRemaining(d.dueDate);
    return days <= 7;
  }) || [];

  const pendingNotificationsCount =
    activeProcess?.creditors.filter((c) => c.notificationStatus === 'pendente').length || 0;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs text-white">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">RecuperaJus</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  Administração Judicial
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Gestão Estratégica da Lei nº 11.101/05
              </p>
            </div>
          </div>

          {/* Process Selector & Actions */}
          <div className="flex items-center space-x-3">
            {/* Process Dropdown */}
            <div className="relative flex items-center">
              <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg p-1 text-sm shadow-xs">
                <Building2 className="w-4 h-4 text-blue-400 ml-2 mr-1.5 shrink-0" />
                <select
                  id="process-selector-dropdown"
                  value={activeProcessId}
                  onChange={(e) => onSelectProcess(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs sm:text-sm font-medium focus:outline-none pr-8 py-1 cursor-pointer max-w-[180px] sm:max-w-xs truncate"
                >
                  {processes.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.debtorName} ({p.processNumber.slice(0, 15)}...)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Novo Processo Button */}
            <button
              id="btn-new-process"
              onClick={onOpenNewProcessModal}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              title="Cadastrar Novo Processo de Recuperação Judicial"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span className="hidden md:inline">Novo Processo</span>
              <span className="md:hidden">Novo</span>
            </button>

            {/* Quick Alert Bell */}
            <div className="relative">
              <button
                id="btn-notification-bell"
                onClick={() => setActiveTab('prazos')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 relative transition-colors cursor-pointer border border-slate-700/50"
                title={`${urgentDeadlines.length} prazos urgentes`}
              >
                <Bell className="w-4 h-4" />
                {urgentDeadlines.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {urgentDeadlines.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sub Header / Process Summary Badge Bar */}
        {activeProcess && (
          <div className="py-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-semibold text-white flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 inline-block"></span>
                {activeProcess.debtorName}
              </span>
              <span className="text-slate-400 text-[11px]">
                CNPJ: <strong className="text-slate-300">{activeProcess.debtorDocument}</strong>
              </span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                Juízo: <strong className="text-slate-300">{activeProcess.court}</strong>
              </span>
              <span className="text-slate-400 text-[11px] hidden lg:inline">
                Passivo Total: <strong className="text-blue-400">{formatCurrency(activeProcess.totalPassivo)}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {urgentDeadlines.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-800/60 text-rose-200 text-[11px] font-medium">
                  <AlertTriangle className="w-3 h-3 mr-1 text-rose-400" />
                  {urgentDeadlines.length} prazo(s) crítico(s)
                </span>
              )}
              {pendingNotificationsCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-800/60 text-blue-200 text-[11px]">
                  <Mail className="w-3 h-3 mr-1 text-blue-400" />
                  {pendingNotificationsCount} carta(s) pendente(s)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/70 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none" aria-label="Tabs">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Painel Centralizador
            </button>

            <button
              id="tab-credores"
              onClick={() => setActiveTab('credores')}
              className={`flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'credores'
                  ? 'bg-slate-800 text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Quadro de Credores & Cartas
              {activeProcess?.creditors && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-md bg-slate-700 text-slate-300 font-bold">
                  {activeProcess.creditors.length}
                </span>
              )}
            </button>

            <button
              id="tab-prazos"
              onClick={() => setActiveTab('prazos')}
              className={`flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'prazos'
                  ? 'bg-slate-800 text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Monitor de Prazos (LRF)
              {urgentDeadlines.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-md bg-rose-600 text-white font-bold">
                  {urgentDeadlines.length}
                </span>
              )}
            </button>

            <button
              id="tab-documentos"
              onClick={() => setActiveTab('documentos')}
              className={`flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'documentos'
                  ? 'bg-slate-800 text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerador de Documentos & Templates
            </button>

            <button
              id="tab-movimentacoes"
              onClick={() => setActiveTab('movimentacoes')}
              className={`flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'movimentacoes'
                  ? 'bg-slate-800 text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Activity className="w-4 h-4 mr-2" />
              Movimentações & Relatórios
            </button>

            <button
              id="tab-emails"
              onClick={() => setActiveTab('emails')}
              className={`flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'emails'
                  ? 'bg-slate-800 text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Lembretes por E-mail
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
