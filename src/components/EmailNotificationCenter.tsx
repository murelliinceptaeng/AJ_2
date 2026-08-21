import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  Bell,
  User,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { EmailLog, JudicialRecoveryProcess } from '../types';
import { formatDate } from '../utils/formatters';

interface EmailNotificationCenterProps {
  process: JudicialRecoveryProcess;
  emailLogs: EmailLog[];
  onSendTestEmail: (recipient: string, subject: string, body: string) => void;
  onClearLogs?: () => void;
}

export const EmailNotificationCenter: React.FC<EmailNotificationCenterProps> = ({
  process,
  emailLogs,
  onSendTestEmail,
  onClearLogs,
}) => {
  const [testEmail, setTestEmail] = useState(process.judicialAdminEmail || 'contato@aj.adv.br');
  const [testName, setTestName] = useState(process.judicialAdminName || 'Dr. Administrador Judicial');
  const [testSubject, setTestSubject] = useState(
    `[ALERTA DE PRAZO LRF] Processo nº ${process.processNumber} - ${process.debtorName}`
  );
  const [testBody, setTestBody] = useState(
    `Prezado Administrador Judicial,\n\nEste é um lembrete automático do sistema RecuperaJus para o processo de Recuperação Judicial de ${process.debtorName} (Autos nº ${process.processNumber}).\n\nFavor verificar os prazos do Art. 7º §2º e entrega do RMA Mensal.\n\nAtenciosamente,\nRecuperaJus - Sistema de Administração Judicial`
  );
  const [sentSuccess, setSentSuccess] = useState(false);

  // Regras de antecedência
  const [alertDays, setAlertDays] = useState({
    d15: true,
    d7: true,
    d3: true,
    d1: true,
    d0: true,
  });

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return alert('Informe o e-mail de destino');

    onSendTestEmail(testEmail, testSubject, testBody);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Central de Lembretes Automáticos por E-mail
              </h1>
              <p className="text-xs text-slate-500">
                Prevenção rigorosa contra perda de prazos processuais e notificações aos credores
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
              Robô de Monitoramento Ativo
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Configuração de Regras & Disparo de Teste (5 Colunas) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Regras de Antecedência */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-slate-700" />
              Gatilhos de Antecedência de Prazos
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Defina os momentos em que o sistema deve disparar e-mails automáticos para a equipe antes do vencimento do prazo:
            </p>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertDays.d15}
                  onChange={(e) => setAlertDays({ ...alertDays, d15: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">15 dias de antecedência (Alerta Inicial de Planejamento)</span>
              </label>

              <label className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertDays.d7}
                  onChange={(e) => setAlertDays({ ...alertDays, d7: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">7 dias de antecedência (Alerta de Redação/Revisão)</span>
              </label>

              <label className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertDays.d3}
                  onChange={(e) => setAlertDays({ ...alertDays, d3: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">3 dias de antecedência (Alerta Crítico de Assinatura)</span>
              </label>

              <label className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertDays.d1}
                  onChange={(e) => setAlertDays({ ...alertDays, d1: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-amber-900 bg-amber-50/80 px-1 py-0.5 rounded">1 dia antes / Véspera (Urgência de Protocolo)</span>
              </label>

              <label className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertDays.d0}
                  onChange={(e) => setAlertDays({ ...alertDays, d0: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-rose-900 bg-rose-50/80 px-1 py-0.5 rounded">No dia do vencimento às 07:00h (Disparo Final)</span>
              </label>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Destinatários cadastrados: <strong>{process.judicialAdminEmail}</strong>, <strong>{process.leadAdvocate}</strong>
            </div>
          </div>

          {/* Testador de Disparo Imediato */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-blue-600" />
              Simulador de Disparo de Lembrete
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Envie um e-mail de teste imediato para validar a caixa de entrada da equipe do AJ:
            </p>

            <form onSubmit={handleSendTest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail de Destino:</label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assunto:</label>
                <input
                  type="text"
                  required
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mensagem:</label>
                <textarea
                  rows={3}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Disparar E-mail de Teste Agora
              </button>

              {sentSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  E-mail registrado no log e enviado com sucesso!
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Painel Direito: Histórico & Log de E-mails Enviados (7 Colunas) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-700" />
                Histórico & Logs de E-mails Disparados ({emailLogs.length})
              </h2>
              {onClearLogs && emailLogs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Limpar Logs
                </button>
              )}
            </div>

            <div className="space-y-3">
              {emailLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">
                        {log.subject}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Para: <strong>{log.recipientName}</strong> ({log.recipientEmail})
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        log.status === 'enviado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'agendado'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.status === 'enviado' ? '✓ Enviado' : log.status}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded border border-slate-200/70 font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-3">
                    {log.previewText}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>
                      Gatilho:{' '}
                      <strong className="text-slate-600 capitalize">
                        {log.triggerType.replace('_', ' ')}
                      </strong>
                    </span>
                    <span>Data/Hora: {log.sentAt}</span>
                  </div>
                </div>
              ))}

              {emailLogs.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhum disparo de e-mail registrado recentemente.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
