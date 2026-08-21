import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Printer,
  Download,
  Plus,
  Edit3,
  Check,
  Sparkles,
  Layers,
  Send,
  Users,
  Eye,
  Save,
  Tag,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { Creditor, DocumentTemplate, JudicialRecoveryProcess } from '../types';
import { renderTemplate } from '../utils/templateEngine';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DocumentGeneratorProps {
  process: JudicialRecoveryProcess;
  templates: DocumentTemplate[];
  onUpdateTemplates: (templates: DocumentTemplate[]) => void;
  onOpenPrintModal: (title: string, content: string) => void;
  onBatchGenerateLetters: (creditors: Creditor[], template: DocumentTemplate) => void;
  onSendDocumentEmail: (creditor: Creditor, content: string) => void;
}

export const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  process,
  templates,
  onUpdateTemplates,
  onOpenPrintModal,
  onBatchGenerateLetters,
  onSendDocumentEmail,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || 'tpl-carta-credor'
  );
  const [selectedCreditorId, setSelectedCreditorId] = useState<string>(
    process.creditors[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  
  // State for template editing
  const currentTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const [editedTitle, setEditedTitle] = useState(currentTemplate?.title || '');
  const [editedContent, setEditedContent] = useState(currentTemplate?.content || '');

  // Select active creditor
  const currentCreditor = process.creditors.find((c) => c.id === selectedCreditorId);

  // Rendered document preview
  const renderedContent = currentTemplate
    ? renderTemplate(isEditingTemplate ? editedContent : currentTemplate.content, process, currentCreditor)
    : '';

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(renderedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download TXT/DOC
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([renderedContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentTemplate.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Insert tag into editor
  const handleInsertTag = (tag: string) => {
    setEditedContent((prev) => prev + ` ${tag} `);
  };

  // Save template edit
  const handleSaveTemplate = () => {
    const updated = templates.map((t) =>
      t.id === currentTemplate.id
        ? {
            ...t,
            title: editedTitle,
            content: editedContent,
            lastModified: new Date().toISOString().slice(0, 10),
          }
        : t
    );
    onUpdateTemplates(updated);
    setIsEditingTemplate(false);
  };

  // Create new blank template
  const handleCreateNewTemplate = () => {
    const newTpl: DocumentTemplate = {
      id: `tpl-custom-${Date.now()}`,
      title: 'Novo Modelo de Documento do AJ',
      category: 'peticao_geral',
      description: 'Template personalizado criado pelo Administrador Judicial.',
      isDefault: false,
      lastModified: new Date().toISOString().slice(0, 10),
      availableTags: templates[0]?.availableTags || [],
      content: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA {{vara_juizo}} DE {{comarca}}\n\nAutos nº {{numero_processo}}\nRecuperanda: {{nome_devedora}}\n\n{{nome_administrador}}, Administrador Judicial nomeado nos autos em epígrafe, vem respeitosamente perante Vossa Excelência expor e requerer o que segue:\n\n[Insira o texto da manifestação ou comunicado]\n\n{{comarca}}, {{data_hoje}}.\n\n_____________________________________\n{{nome_administrador}}\nAdministrador Judicial`,
    };
    onUpdateTemplates([...templates, newTpl]);
    setSelectedTemplateId(newTpl.id);
    setEditedTitle(newTpl.title);
    setEditedContent(newTpl.content);
    setIsEditingTemplate(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Gerador de Documentos Padronizados & Gestão de Templates
              </h1>
              <p className="text-xs text-slate-500">
                Geração automatizada de notificações aos credores (Art. 22 LRF), minutas de RMA e manifestações judiciais
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCreateNewTemplate}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Criar Novo Template
            </button>
          </div>
        </div>

        {/* Seletor de Templates em Pílulas */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-2">Modelos Disponíveis:</span>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setSelectedTemplateId(tpl.id);
                setEditedTitle(tpl.title);
                setEditedContent(tpl.content);
                setIsEditingTemplate(false);
              }}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                selectedTemplateId === tpl.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Principal: Seletor de Dados/Variáveis (Esquerda) + Editor/Preview (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Controles & Tags (4 Colunas) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Seletor de Credor (caso o template use credor) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              Credor de Referência para Prévia
            </h2>
            <select
              value={selectedCreditorId}
              onChange={(e) => setSelectedCreditorId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {process.creditors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({formatCurrency(c.adjustedValue)})
                </option>
              ))}
            </select>

            {currentCreditor && (
              <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1 text-slate-600">
                <div>Documento: <strong>{currentCreditor.document}</strong></div>
                <div>Classe: <strong>{currentCreditor.creditClass}</strong></div>
                <div>Valor Apurado: <strong className="text-slate-900">{formatCurrency(currentCreditor.adjustedValue)}</strong></div>
                <div>E-mail: <strong>{currentCreditor.email || 'Não informado'}</strong></div>
              </div>
            )}
          </div>

          {/* Geração em Lote de Cartas */}
          {currentTemplate.category === 'notificacao_credor' && (
            <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-4 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Geração em Lote (Batch)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Gere e imprima as cartas de notificação para todos os <strong>{process.creditors.length} credores</strong> cadastrados neste processo com 1 clique.
              </p>
              <button
                onClick={() => onBatchGenerateLetters(process.creditors, currentTemplate)}
                className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Gerar Todas as Cartas ({process.creditors.length})
              </button>
            </div>
          )}

          {/* Tags Dinâmicas Disponíveis */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-slate-700" />
              Tags Dinâmicas Disponíveis
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">
              Clique em uma tag para copiá-la ou inseri-la no modelo:
            </p>

            <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-1">
              {currentTemplate.availableTags.map((tagObj) => (
                <button
                  key={tagObj.tag}
                  type="button"
                  onClick={() => {
                    if (isEditingTemplate) {
                      handleInsertTag(tagObj.tag);
                    } else {
                      navigator.clipboard.writeText(tagObj.tag);
                      alert(`Tag ${tagObj.tag} copiada para a área de transferência!`);
                    }
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-mono rounded border border-slate-200 transition-colors cursor-pointer"
                  title={`${tagObj.label} (Ex: ${tagObj.sample})`}
                >
                  {tagObj.tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Painel Direito: Editor & Preview (8 Colunas) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Toolbar do Documento */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">{currentTemplate.title}</span>
                {currentTemplate.isDefault && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 font-semibold text-slate-600">
                    Padrão LRF
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (isEditingTemplate) {
                      handleSaveTemplate();
                    } else {
                      setEditedTitle(currentTemplate.title);
                      setEditedContent(currentTemplate.content);
                      setIsEditingTemplate(true);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    isEditingTemplate
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {isEditingTemplate ? (
                    <>
                      <Save className="w-3.5 h-3.5" /> Salvar Alterações
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" /> Editar Template
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copiar texto gerado"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>

                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Download em .TXT"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar .TXT
                </button>

                <button
                  onClick={() => onOpenPrintModal(currentTemplate.title, renderedContent)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  title="Visualizar Impressão / PDF em Papel Timbrado"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / PDF Oficial
                </button>
              </div>
            </div>

            {/* Conteúdo: Modo Edição ou Modo Preview */}
            <div className="p-6">
              {isEditingTemplate ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Título do Template:
                    </label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Corpo do Documento (com tags):
                    </label>
                    <textarea
                      rows={18}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full p-4 font-mono text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-6 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
                  {renderedContent}
                </div>
              )}
            </div>

            {/* Rodapé de Ação Rápida: Enviar por E-mail ao Credor */}
            {currentCreditor && currentCreditor.email && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  E-mail do credor:{' '}
                  <strong className="text-slate-900">{currentCreditor.email}</strong>
                </span>
                <button
                  onClick={() => onSendDocumentEmail(currentCreditor, renderedContent)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar esta Notificação por E-mail
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
