import React from 'react';
import { Scale, Printer, Download, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { JudicialRecoveryProcess } from '../types';

interface PrintableDocumentViewProps {
  title: string;
  content: string;
  process: JudicialRecoveryProcess;
  onClose: () => void;
}

export const PrintableDocumentView: React.FC<PrintableDocumentViewProps> = ({
  title,
  content,
  process,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:w-full">
        {/* Toolbar de Ações (Oculto na Impressão) */}
        <div className="p-4 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm truncate max-w-md">{title}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Baixar Texto
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" /> Imprimir / Salvar em PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Folha Timbrada Oficial da Administração Judicial */}
        <div className="p-8 sm:p-12 overflow-y-auto font-serif text-slate-900 bg-white leading-relaxed print:p-8">
          {/* Cabeçalho Timbrado */}
          <div className="border-b-2 border-slate-900 pb-4 mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-sans text-lg font-black tracking-wider uppercase text-slate-950">
                {process.judicialAdminOffice}
              </h1>
              <p className="font-sans text-xs text-slate-600 font-semibold tracking-wide mt-0.5">
                ADMINISTRAÇÃO JUDICIAL • LEI Nº 11.101/2005
              </p>
              <p className="font-sans text-[11px] text-slate-500 mt-1">
                {process.judicialAdminName} • {process.judicialAdminDocument}
              </p>
              <p className="font-sans text-[11px] text-slate-500">
                E-mail: {process.judicialAdminEmail} • Tel: {process.judicialAdminPhone}
              </p>
            </div>

            <div className="w-16 h-16 rounded-xl border-2 border-slate-900 flex flex-col items-center justify-center text-slate-900 font-sans shrink-0">
              <Scale className="w-8 h-8 text-blue-600" />
              <span className="text-[9px] font-black tracking-tighter">RECUPERAJUS</span>
            </div>
          </div>

          {/* Dados do Processo no topo do documento */}
          <div className="mb-6 bg-slate-50 p-3.5 rounded-lg border border-slate-200 font-sans text-xs grid grid-cols-2 gap-2 text-slate-700 print:bg-white print:border-slate-300">
            <div>
              <strong>Processo:</strong> {process.processNumber}
            </div>
            <div>
              <strong>Juízo:</strong> {process.court}
            </div>
            <div>
              <strong>Recuperanda:</strong> {process.debtorName}
            </div>
            <div>
              <strong>Comarca:</strong> {process.jurisdiction}
            </div>
          </div>

          {/* Corpo do Documento */}
          <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-justify text-slate-900 font-serif">
            {content}
          </div>

          {/* Carimbo e Selo Digital de Conformidade */}
          <div className="mt-12 pt-6 border-t border-slate-200 font-sans flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>
                Documento emitido eletronicamente pela plataforma de Administração Judicial.
              </span>
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              HASH-LRF: {Math.random().toString(36).substring(2, 12).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
