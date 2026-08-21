import React, { useState } from 'react';
import {
  Building2,
  Scale,
  Calendar,
  Users,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  FileCheck,
} from 'lucide-react';
import { JudicialRecoveryProcess } from '../types';

interface ProcessWizardModalProps {
  initialProcess?: JudicialRecoveryProcess | null;
  onClose: () => void;
  onSave: (process: JudicialRecoveryProcess) => void;
}

export const ProcessWizardModal: React.FC<ProcessWizardModalProps> = ({
  initialProcess,
  onClose,
  onSave,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [processNumber, setProcessNumber] = useState(initialProcess?.processNumber || '');
  const [debtorName, setDebtorName] = useState(initialProcess?.debtorName || '');
  const [tradeName, setTradeName] = useState(initialProcess?.tradeName || '');
  const [debtorDocument, setDebtorDocument] = useState(initialProcess?.debtorDocument || '');
  const [cnae, setCnae] = useState(initialProcess?.cnae || '');
  const [headquartersCity, setHeadquartersCity] = useState(initialProcess?.headquartersCity || '');
  const [court, setCourt] = useState(initialProcess?.court || '1ª Vara de Falências e Recuperações Judiciais');
  const [jurisdiction, setJurisdiction] = useState(initialProcess?.jurisdiction || 'São Paulo / SP');
  const [judgeName, setJudgeName] = useState(initialProcess?.judgeName || '');
  const [type, setType] = useState<'ordinaria' | 'especial_me_epp'>(initialProcess?.type || 'ordinaria');

  // AJ Info
  const [judicialAdminName, setJudicialAdminName] = useState(
    initialProcess?.judicialAdminName || 'Dr. Roberto Silveira Mendes'
  );
  const [judicialAdminOffice, setJudicialAdminOffice] = useState(
    initialProcess?.judicialAdminOffice || 'Silveira Mendes Administração Judicial'
  );
  const [judicialAdminDocument, setJudicialAdminDocument] = useState(
    initialProcess?.judicialAdminDocument || 'OAB/SP 148.920'
  );
  const [judicialAdminEmail, setJudicialAdminEmail] = useState(
    initialProcess?.judicialAdminEmail || 'contato@silveiramendes.adv.br'
  );
  const [judicialAdminPhone, setJudicialAdminPhone] = useState(
    initialProcess?.judicialAdminPhone || '(11) 3254-8800'
  );
  const [leadAdvocate, setLeadAdvocate] = useState(initialProcess?.leadAdvocate || 'Dra. Carolina Albuquerque');
  const [leadAccountant, setLeadAccountant] = useState(initialProcess?.leadAccountant || 'Marcos Vinícius de Paula');

  // Dates & Milestones
  const [distributionDate, setDistributionDate] = useState(
    initialProcess?.distributionDate || new Date().toISOString().slice(0, 10)
  );
  const [processingDecisionDate, setProcessingDecisionDate] = useState(
    initialProcess?.processingDecisionDate || new Date().toISOString().slice(0, 10)
  );
  const [art52NoticeDate, setArt52NoticeDate] = useState(initialProcess?.art52NoticeDate || '');
  const [stayPeriodDays, setStayPeriodDays] = useState(initialProcess?.stayPeriodDays || 180);
  const [totalPassivo, setTotalPassivo] = useState(initialProcess?.totalPassivo?.toString() || '15000000');
  const [notes, setNotes] = useState(initialProcess?.notes || '');

  const totalSteps = 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!debtorName.trim() || !processNumber.trim()) {
      alert('Por favor, preencha os dados fundamentais do processo e da devedora.');
      return;
    }

    const newProcess: JudicialRecoveryProcess = {
      id: initialProcess?.id || `proc-${Date.now()}`,
      processNumber,
      debtorName,
      tradeName,
      debtorDocument,
      cnae,
      headquartersCity,
      court,
      jurisdiction,
      judgeName,
      type,
      judicialAdminName,
      judicialAdminOffice,
      judicialAdminDocument,
      judicialAdminEmail,
      judicialAdminPhone,
      leadAdvocate,
      leadAccountant,
      distributionDate,
      processingDecisionDate,
      art52NoticeDate: art52NoticeDate || processingDecisionDate,
      stayPeriodStartDate: processingDecisionDate,
      stayPeriodDays: Number(stayPeriodDays) || 180,
      stayPeriodExtended: initialProcess?.stayPeriodExtended || false,
      status: initialProcess?.status || 'em_processamento',
      totalPassivo: parseFloat(totalPassivo) || 0,
      totalCredoresCount: initialProcess?.totalCredoresCount || initialProcess?.creditors.length || 0,
      rmaMonthlyDay: initialProcess?.rmaMonthlyDay || 15,
      lastRmaMonth: initialProcess?.lastRmaMonth,
      notes,
      creditors: initialProcess?.creditors || [],
      deadlines: initialProcess?.deadlines || [],
      movements: initialProcess?.movements || [
        {
          id: `mov-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10) + ' 10:00',
          title: 'Cadastro do Processo de Recuperação Judicial no RecuperaJus',
          category: 'decisao',
          summary: `Processo nº ${processNumber} cadastrado com deferimento em ${processingDecisionDate}.`,
          author: judicialAdminName,
          highlight: true,
        },
      ],
    };

    onSave(newProcess);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 text-slate-900 animate-fadeIn">
        {/* Header do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {initialProcess ? 'Editar Processo de Recuperação Judicial' : 'Cadastrar Novo Processo'}
              </h2>
              <p className="text-xs text-slate-500">
                Assistente guiado em 4 etapas para cadastro do caso
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso das Etapas */}
        <div className="grid grid-cols-4 gap-2 my-5">
          {[
            { step: 1, label: '1. Juízo & Autos' },
            { step: 2, label: '2. Devedora' },
            { step: 3, label: '3. Admin. Judicial' },
            { step: 4, label: '4. Datas & Marcos' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  currentStep >= item.step ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              ></div>
              <span
                className={`text-[11px] font-semibold mt-1 block truncate ${
                  currentStep === item.step
                    ? 'text-blue-700 font-bold'
                    : currentStep > item.step
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Formulário por Etapas */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* ETAPA 1: DADOS DO PROCESSO & JUÍZO */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Número do Processo (CNJ) *
                </label>
                <input
                  type="text"
                  required
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  placeholder="0000000-00.0000.8.26.0000"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vara / Juízo *</label>
                  <input
                    type="text"
                    required
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    placeholder="Ex: 1ª Vara Empresarial e Conflitos"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Comarca / UF *</label>
                  <input
                    type="text"
                    required
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    placeholder="Ex: São Paulo / SP"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Juiz(a) Titular / Condutor(a)
                  </label>
                  <input
                    type="text"
                    value={judgeName}
                    onChange={(e) => setJudgeName(e.target.value)}
                    placeholder="Ex: Dr. Paulo Rogério Bonini"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modalidade da RJ</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="ordinaria">Recuperação Judicial Ordinária</option>
                    <option value="especial_me_epp">Plano Especial ME / EPP (Art. 70 LRF)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 2: DADOS DA DEVEDORA */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Razão Social da Devedora / Recuperanda *
                </label>
                <input
                  type="text"
                  required
                  value={debtorName}
                  onChange={(e) => setDebtorName(e.target.value)}
                  placeholder="Ex: Grupo Industrial & Comercial Paulista S/A"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="Ex: Rede Paulista Distribuição"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CNPJ Principal *</label>
                  <input
                    type="text"
                    required
                    value={debtorDocument}
                    onChange={(e) => setDebtorDocument(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CNAE Principal</label>
                  <input
                    type="text"
                    value={cnae}
                    onChange={(e) => setCnae(e.target.value)}
                    placeholder="Ex: 47.11-3-02 Comércio Varejista"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cidade da Sede</label>
                  <input
                    type="text"
                    value={headquartersCity}
                    onChange={(e) => setHeadquartersCity(e.target.value)}
                    placeholder="Ex: São Paulo / SP"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Passivo Total Estimado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={totalPassivo}
                  onChange={(e) => setTotalPassivo(e.target.value)}
                  placeholder="15000000"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* ETAPA 3: DADOS DO ADMINISTRADOR JUDICIAL */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome do Administrador Judicial Titular *
                </label>
                <input
                  type="text"
                  required
                  value={judicialAdminName}
                  onChange={(e) => setJudicialAdminName(e.target.value)}
                  placeholder="Dr. Roberto Silveira Mendes"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Escritório / Pessoa Jurídica AJ
                  </label>
                  <input
                    type="text"
                    value={judicialAdminOffice}
                    onChange={(e) => setJudicialAdminOffice(e.target.value)}
                    placeholder="Silveira Mendes Administração Judicial"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Registro Profissional (OAB / CRC)
                  </label>
                  <input
                    type="text"
                    value={judicialAdminDocument}
                    onChange={(e) => setJudicialAdminDocument(e.target.value)}
                    placeholder="OAB/SP 148.920"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    E-mail Oficial para Habilitações & Notificações *
                  </label>
                  <input
                    type="email"
                    required
                    value={judicialAdminEmail}
                    onChange={(e) => setJudicialAdminEmail(e.target.value)}
                    placeholder="contato@silveiramendes.adv.br"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telefone Institucional
                  </label>
                  <input
                    type="text"
                    value={judicialAdminPhone}
                    onChange={(e) => setJudicialAdminPhone(e.target.value)}
                    placeholder="(11) 3254-8800"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Advogado(a) Responsável Líder
                  </label>
                  <input
                    type="text"
                    value={leadAdvocate}
                    onChange={(e) => setLeadAdvocate(e.target.value)}
                    placeholder="Dra. Carolina Albuquerque"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contador(a) / Perito(a) Líder
                  </label>
                  <input
                    type="text"
                    value={leadAccountant}
                    onChange={(e) => setLeadAccountant(e.target.value)}
                    placeholder="Marcos Vinícius de Paula"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 4: DATAS & MARCOS PROCESSUAIS */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Data da Distribuição do Pedido
                  </label>
                  <input
                    type="date"
                    required
                    value={distributionDate}
                    onChange={(e) => setDistributionDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Data do Deferimento do Processamento *
                  </label>
                  <input
                    type="date"
                    required
                    value={processingDecisionDate}
                    onChange={(e) => setProcessingDecisionDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Publicação do Edital do Art. 52, §1º
                  </label>
                  <input
                    type="date"
                    value={art52NoticeDate}
                    onChange={(e) => setArt52NoticeDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Prazo do Stay Period Ordinário (dias)
                  </label>
                  <input
                    type="number"
                    value={stayPeriodDays}
                    onChange={(e) => setStayPeriodDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observações Gerais do Caso
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais sobre filiais, contratos essenciais, perícia prévia realizada..."
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  Ao salvar, o sistema inicializará automaticamente o cálculo dos prazos processuais (15 dias de divergência, 60 dias de PRJ, 180 dias de Stay Period e entrega de RMA mensal).
                </span>
              </div>
            </div>
          )}

          {/* Navegação entre Etapas */}
          <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Cancelar
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  Próximo <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Salvar Processo
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
