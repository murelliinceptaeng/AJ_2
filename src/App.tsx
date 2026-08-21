import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { CreditorsManager } from './components/CreditorsManager';
import { DeadlineMonitor } from './components/DeadlineMonitor';
import { DocumentGenerator } from './components/DocumentGenerator';
import { MovementsAndReports } from './components/MovementsAndReports';
import { EmailNotificationCenter } from './components/EmailNotificationCenter';
import { ProcessWizardModal } from './components/ProcessWizardModal';
import { PrintableDocumentView } from './components/PrintableDocumentView';

import {
  Creditor,
  DocumentTemplate,
  EmailLog,
  JudicialRecoveryProcess,
  LegalDeadline,
  ProceduralMovement,
} from './types';
import { INITIAL_EMAIL_LOGS, INITIAL_PROCESSES, INITIAL_TEMPLATES } from './data/mockData';
import { renderTemplate } from './utils/templateEngine';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // Persistence with localStorage
  const [processes, setProcesses] = useState<JudicialRecoveryProcess[]>(() => {
    const saved = localStorage.getItem('recuperajus_processes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved processes:', e);
      }
    }
    return INITIAL_PROCESSES;
  });

  const [templates, setTemplates] = useState<DocumentTemplate[]>(() => {
    const saved = localStorage.getItem('recuperajus_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved templates:', e);
      }
    }
    return INITIAL_TEMPLATES;
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('recuperajus_email_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved email logs:', e);
      }
    }
    return INITIAL_EMAIL_LOGS;
  });

  const [activeProcessId, setActiveProcessId] = useState<string>(() => {
    const saved = localStorage.getItem('recuperajus_active_process_id');
    return saved || INITIAL_PROCESSES[0]?.id || '';
  });

  // Current navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'credores' | 'prazos' | 'documentos' | 'movimentacoes' | 'emails'
  >('dashboard');

  // Modals
  const [showProcessWizard, setShowProcessWizard] = useState(false);
  const [editingProcess, setEditingProcess] = useState<JudicialRecoveryProcess | null>(null);
  const [printableModal, setPrintableModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({
    isOpen: false,
    title: '',
    content: '',
  });

  // Toast alert
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'warning' | 'info';
    text: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('recuperajus_processes', JSON.stringify(processes));
  }, [processes]);

  useEffect(() => {
    localStorage.setItem('recuperajus_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('recuperajus_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem('recuperajus_active_process_id', activeProcessId);
  }, [activeProcessId]);

  // Active process object
  const activeProcess = processes.find((p) => p.id === activeProcessId) || processes[0];

  // Helper to update active process in the array
  const updateActiveProcess = (updated: JudicialRecoveryProcess) => {
    setProcesses((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Update Creditors with automatic recalculation of total passivo
  const handleUpdateCreditors = (newCreditors: Creditor[]) => {
    if (!activeProcess) return;
    const newTotalPassivo = newCreditors.reduce((acc, c) => acc + c.adjustedValue, 0);
    const updated: JudicialRecoveryProcess = {
      ...activeProcess,
      creditors: newCreditors,
      totalPassivo: newTotalPassivo,
      totalCredoresCount: newCreditors.length,
    };
    updateActiveProcess(updated);
    showToast('Quadro Geral de Credores atualizado com sucesso!', 'success');
  };

  // Update Deadlines
  const handleUpdateDeadlines = (newDeadlines: LegalDeadline[]) => {
    if (!activeProcess) return;
    const updated: JudicialRecoveryProcess = {
      ...activeProcess,
      deadlines: newDeadlines,
    };
    updateActiveProcess(updated);
    showToast('Cronograma de prazos processuais atualizado!', 'success');
  };

  // Update Movements
  const handleUpdateMovements = (newMovements: ProceduralMovement[]) => {
    if (!activeProcess) return;
    const updated: JudicialRecoveryProcess = {
      ...activeProcess,
      movements: newMovements,
    };
    updateActiveProcess(updated);
    showToast('Movimentação processual registrada!', 'success');
  };

  // Save or edit Process
  const handleSaveProcess = (savedProcess: JudicialRecoveryProcess) => {
    if (editingProcess) {
      setProcesses((prev) => prev.map((p) => (p.id === savedProcess.id ? savedProcess : p)));
      showToast(`Processo ${savedProcess.debtorName} atualizado com sucesso!`, 'success');
    } else {
      setProcesses((prev) => [savedProcess, ...prev]);
      setActiveProcessId(savedProcess.id);
      showToast(`Novo processo cadastrado: ${savedProcess.debtorName}`, 'success');
    }
    setShowProcessWizard(false);
    setEditingProcess(null);
  };

  // Generate Letter for Single Creditor
  const handleGenerateSingleLetter = (creditor: Creditor) => {
    if (!activeProcess) return;
    const letterTemplate =
      templates.find((t) => t.category === 'notificacao_credor') || templates[0];
    const rendered = renderTemplate(letterTemplate.content, activeProcess, creditor);
    setPrintableModal({
      isOpen: true,
      title: `Carta de Notificação - ${creditor.name} (Art. 22 LRF)`,
      content: rendered,
    });
  };

  // Generate Batch Letters for Multiple Creditors
  const handleGenerateBatchLetters = (
    creditorsToNotify: Creditor[],
    template?: DocumentTemplate
  ) => {
    if (!activeProcess) return;
    const letterTemplate =
      template || templates.find((t) => t.category === 'notificacao_credor') || templates[0];

    const compiledContent = creditorsToNotify
      .map((c, idx) => {
        const rendered = renderTemplate(letterTemplate.content, activeProcess, c);
        return `========================================================================================\nCARTA DE NOTIFICAÇÃO Nº ${idx + 1} DE ${creditorsToNotify.length}\n========================================================================================\n\n${rendered}\n\n\n[ QUEBRA DE PÁGINA PARA IMPRESSÃO ]\n\n`;
      })
      .join('\n');

    setPrintableModal({
      isOpen: true,
      title: `Lote de ${creditorsToNotify.length} Cartas de Notificação aos Credores`,
      content: compiledContent,
    });
  };

  // Send Email Notification to a Creditor
  const handleSendEmailNotification = (creditor: Creditor) => {
    if (!activeProcess) return;
    if (!creditor.email) {
      alert(`O credor ${creditor.name} não possui e-mail cadastrado. Atualize o cadastro primeiro.`);
      return;
    }

    const letterTemplate =
      templates.find((t) => t.category === 'notificacao_credor') || templates[0];
    const rendered = renderTemplate(letterTemplate.content, activeProcess, creditor);

    const newLog: EmailLog = {
      id: `elog-${Date.now()}`,
      processId: activeProcess.id,
      recipientEmail: creditor.email,
      recipientName: creditor.name,
      subject: `Notificação de Crédito (Art. 22 LRF) - Processo nº ${activeProcess.processNumber} (${activeProcess.debtorName})`,
      sentAt: new Date().toLocaleString('pt-BR').slice(0, 16),
      status: 'enviado',
      triggerType: 'notificacao_credor',
      previewText: rendered.slice(0, 300) + '...',
    };

    setEmailLogs([newLog, ...emailLogs]);

    // Update creditor status
    const updatedCreditors = activeProcess.creditors.map((c) =>
      c.id === creditor.id
        ? {
            ...c,
            notificationStatus: 'notificado_email' as const,
            notificationSentAt: new Date().toLocaleString('pt-BR'),
          }
        : c
    );
    updateActiveProcess({ ...activeProcess, creditors: updatedCreditors });
    showToast(`Carta de notificação enviada com sucesso para ${creditor.email}!`, 'success');
  };

  // Send Deadline Alert Email
  const handleSendDeadlineAlert = (deadline: LegalDeadline) => {
    if (!activeProcess) return;
    const newLog: EmailLog = {
      id: `elog-dl-${Date.now()}`,
      processId: activeProcess.id,
      recipientEmail: activeProcess.judicialAdminEmail,
      recipientName: activeProcess.judicialAdminName,
      subject: `⚠️ Alerta de Prazo LRF: ${deadline.title} (${activeProcess.debtorName})`,
      deadlineTitle: deadline.title,
      sentAt: new Date().toLocaleString('pt-BR').slice(0, 16),
      status: 'enviado',
      triggerType: 'prazo_processual',
      previewText: `Aviso urgente de vencimento para o prazo: ${deadline.title} (${deadline.legalBasis}). Vencimento: ${deadline.dueDate}. Responsável: ${deadline.responsible}.`,
    };

    setEmailLogs([newLog, ...emailLogs]);
    showToast(`Alerta de prazo disparado para a equipe do Administrador Judicial!`, 'success');
  };

  // Send Test Email from Email Center
  const handleSendTestEmail = (recipient: string, subject: string, body: string) => {
    if (!activeProcess) return;
    const newLog: EmailLog = {
      id: `elog-test-${Date.now()}`,
      processId: activeProcess.id,
      recipientEmail: recipient,
      recipientName: activeProcess.judicialAdminName,
      subject: subject,
      sentAt: new Date().toLocaleString('pt-BR').slice(0, 16),
      status: 'enviado',
      triggerType: 'teste_manual',
      previewText: body,
    };
    setEmailLogs([newLog, ...emailLogs]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-slideUp">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Navigation Header */}
      <Navbar
        processes={processes}
        activeProcessId={activeProcess?.id || ''}
        onSelectProcess={(id) => setActiveProcessId(id)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewProcessModal={() => {
          setEditingProcess(null);
          setShowProcessWizard(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeProcess ? (
          <>
            {activeTab === 'dashboard' && (
              <DashboardOverview
                process={activeProcess}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenEditProcess={() => {
                  setEditingProcess(activeProcess);
                  setShowProcessWizard(true);
                }}
                onQuickGenerateLetters={() => {
                  const pending = activeProcess.creditors.filter(
                    (c) => c.notificationStatus === 'pendente'
                  );
                  handleGenerateBatchLetters(pending.length > 0 ? pending : activeProcess.creditors);
                }}
              />
            )}

            {activeTab === 'credores' && (
              <CreditorsManager
                process={activeProcess}
                onUpdateCreditors={handleUpdateCreditors}
                onGenerateLetter={handleGenerateSingleLetter}
                onGenerateBatchLetters={(creditors) => handleGenerateBatchLetters(creditors)}
                onSendEmailNotification={handleSendEmailNotification}
              />
            )}

            {activeTab === 'prazos' && (
              <DeadlineMonitor
                process={activeProcess}
                onUpdateDeadlines={handleUpdateDeadlines}
                onSendDeadlineAlert={handleSendDeadlineAlert}
              />
            )}

            {activeTab === 'documentos' && (
              <DocumentGenerator
                process={activeProcess}
                templates={templates}
                onUpdateTemplates={setTemplates}
                onOpenPrintModal={(title, content) =>
                  setPrintableModal({ isOpen: true, title, content })
                }
                onBatchGenerateLetters={(creditors, template) =>
                  handleGenerateBatchLetters(creditors, template)
                }
                onSendDocumentEmail={(creditor) => handleSendEmailNotification(creditor)}
              />
            )}

            {activeTab === 'movimentacoes' && (
              <MovementsAndReports
                process={activeProcess}
                onUpdateMovements={handleUpdateMovements}
                onOpenPrintModal={(title, content) =>
                  setPrintableModal({ isOpen: true, title, content })
                }
              />
            )}

            {activeTab === 'emails' && (
              <EmailNotificationCenter
                process={activeProcess}
                emailLogs={emailLogs}
                onSendTestEmail={handleSendTestEmail}
                onClearLogs={() => setEmailLogs([])}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Nenhum processo selecionado</h2>
            <p className="text-xs mb-4">Cadastre um novo processo de Recuperação Judicial para começar.</p>
            <button
              onClick={() => {
                setEditingProcess(null);
                setShowProcessWizard(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs"
            >
              Cadastrar Processo
            </button>
          </div>
        )}
      </main>

      {/* Modal: Assistente de Novo / Edição de Processo */}
      {showProcessWizard && (
        <ProcessWizardModal
          initialProcess={editingProcess}
          onClose={() => {
            setShowProcessWizard(false);
            setEditingProcess(null);
          }}
          onSave={handleSaveProcess}
        />
      )}

      {/* Modal: Visualização de Impressão / Folha Timbrada Oficial */}
      {printableModal.isOpen && activeProcess && (
        <PrintableDocumentView
          title={printableModal.title}
          content={printableModal.content}
          process={activeProcess}
          onClose={() => setPrintableModal({ isOpen: false, title: '', content: '' })}
        />
      )}
    </div>
  );
}
