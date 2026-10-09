import React, { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Send, 
  X, 
  Layers, 
  DollarSign, 
  Clock, 
  ArrowRight,
  Printer,
  ChevronDown,
  Building,
  Sparkles
} from 'lucide-react';
import { Quote, MaterialItem, WorkCenter, ProductionOrder } from '../../types/industrial';

interface QuotesManagerProps {
  quotes: Quote[];
  materials: MaterialItem[];
  workCenters: WorkCenter[];
  onAddQuote: (newQuote: Quote) => void;
  onConvertToOrder: (quote: Quote) => void;
  onUpdateQuoteStatus: (quoteId: string, status: Quote['status']) => void;
}

export const QuotesManager: React.FC<QuotesManagerProps> = ({
  quotes,
  materials,
  workCenters,
  onAddQuote,
  onConvertToOrder,
  onUpdateQuoteStatus,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'sent' | 'approved' | 'converted'>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(quotes[0] || null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // New Quote Calculator State
  const [clientName, setClientName] = useState('');
  const [clientCnpj, setClientCnpj] = useState('');
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [quantity, setQuantity] = useState(25);
  const [selectedMaterialId, setSelectedMaterialId] = useState(materials[0]?.id || '');
  const [materialWeightPerPartKg, setMaterialWeightPerPartKg] = useState(8.5);
  const [scrapPercent, setScrapPercent] = useState(10);
  
  // Machine operations for quotation
  const [selectedOperations, setSelectedOperations] = useState<{
    workCenterId: string;
    setupHours: number;
    cycleMinutesPerPart: number;
  }[]>([
    { workCenterId: 'wc-1', setupHours: 0.3, cycleMinutesPerPart: 5.0 },
    { workCenterId: 'wc-2', setupHours: 0.4, cycleMinutesPerPart: 6.5 },
  ]);

  const [subcontractingCost, setSubcontractingCost] = useState(0);
  const [toolingCost, setToolingCost] = useState(250);
  const [overheadPercent, setOverheadPercent] = useState(18);
  const [profitMarginPercent, setProfitMarginPercent] = useState(28);
  const [leadTimeDays, setLeadTimeDays] = useState(12);

  // Dynamic calculations
  const selectedMat = materials.find(m => m.id === selectedMaterialId) || materials[0];
  const totalRawMaterialKg = (materialWeightPerPartKg * (1 + scrapPercent / 100)) * quantity;
  const rawMaterialTotalCost = totalRawMaterialKg * (selectedMat?.unitCost || 30);

  const laborAndMachineTotalCost = selectedOperations.reduce((acc, op) => {
    const wc = workCenters.find(w => w.id === op.workCenterId);
    if (!wc) return acc;
    const totalHours = op.setupHours + (op.cycleMinutesPerPart * quantity) / 60;
    return acc + totalHours * wc.hourlyRate;
  }, 0);

  const directCost = rawMaterialTotalCost + laborAndMachineTotalCost + subcontractingCost + toolingCost;
  const overheadAmount = directCost * (overheadPercent / 100);
  const totalProductionCost = directCost + overheadAmount;
  const totalQuotedPrice = totalProductionCost / (1 - profitMarginPercent / 100);
  const unitQuotedPrice = totalQuotedPrice / (quantity || 1);

  const handleAddOperation = () => {
    setSelectedOperations([
      ...selectedOperations,
      { workCenterId: workCenters[0]?.id || '', setupHours: 0.25, cycleMinutesPerPart: 4.0 }
    ]);
  };

  const handleRemoveOperation = (index: number) => {
    setSelectedOperations(selectedOperations.filter((_, i) => i !== index));
  };

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !productName) {
      alert('Por favor, informe o Cliente e o Produto da Cotação.');
      return;
    }

    const newQuoteNum = `COT-2026-0${Math.floor(100 + Math.random() * 900)}`;
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      quoteNumber: newQuoteNum,
      clientName,
      clientCnpj: clientCnpj || '00.000.000/0001-00',
      contactName: 'Gerência de Suprimentos',
      contactEmail: 'compras@cliente.com.br',
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
      productName,
      productCode: productCode || `PRD-IND-${Math.floor(100 + Math.random() * 900)}`,
      quantity,
      unitQuotedPrice: Number(unitQuotedPrice.toFixed(2)),
      totalQuotedPrice: Number(totalQuotedPrice.toFixed(2)),
      leadTimeDays,
      status: 'draft',
      notes: `Matéria-prima: ${selectedMat?.name}. Margem configurada: ${profitMarginPercent}%.`,
      breakdown: {
        rawMaterialCost: Number(rawMaterialTotalCost.toFixed(2)),
        laborAndMachineCost: Number(laborAndMachineTotalCost.toFixed(2)),
        subcontractingCost: Number(subcontractingCost.toFixed(2)),
        toolingCost: Number(toolingCost.toFixed(2)),
        overheadPercent,
        marginPercent: profitMarginPercent,
        totalCost: Number(totalProductionCost.toFixed(2)),
        totalQuotedPrice: Number(totalQuotedPrice.toFixed(2))
      }
    };

    onAddQuote(newQuote);
    setSelectedQuote(newQuote);
    setIsCalculatorOpen(false);
  };

  const filteredQuotes = quotes.filter(q => {
    if (activeFilter === 'all') return true;
    return q.status === activeFilter;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Cotações & Estimador de Custo Industrial
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              WebErpMes Costing Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calculadora paramétrica de custos industriais (chapas, usinagem, tempos de máquina, tratamentos e conversão em OPs).
          </p>
        </div>

        <button
          onClick={() => setIsCalculatorOpen(true)}
          className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Cotação Paramétrica</span>
        </button>
      </div>

      {/* Filter Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded w-fit text-xs font-medium">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeFilter === 'all' ? 'bg-slate-800 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Todas ({quotes.length})
        </button>
        <button
          onClick={() => setActiveFilter('draft')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeFilter === 'draft' ? 'bg-slate-800 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Rascunhos
        </button>
        <button
          onClick={() => setActiveFilter('sent')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeFilter === 'sent' ? 'bg-slate-800 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Enviadas ao Cliente
        </button>
        <button
          onClick={() => setActiveFilter('approved')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeFilter === 'approved' ? 'bg-slate-800 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Aprovadas
        </button>
        <button
          onClick={() => setActiveFilter('converted')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeFilter === 'converted' ? 'bg-slate-800 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Convertidas em OP
        </button>
      </div>

      {/* Main Grid: Quotes List + Selected Quote Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quotes List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">
              Cotações Registradas
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {filteredQuotes.length} itens
            </span>
          </div>

          <div className="divide-y divide-slate-800 max-h-[620px] overflow-y-auto">
            {filteredQuotes.map((q) => {
              const isSelected = selectedQuote?.id === q.id;
              const isConverted = q.status === 'converted';
              const isApproved = q.status === 'approved';
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuote(q)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-800/80 border-l-2 border-cyan-500' : 'hover:bg-slate-850/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-cyan-400">
                          {q.quoteNumber}
                        </span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                          {q.clientName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 font-medium">
                        {q.productName}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                        isConverted
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : isApproved
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : q.status === 'sent'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isConverted
                        ? 'Convertida em OP'
                        : isApproved
                        ? 'Aprovada'
                        : q.status === 'sent'
                        ? 'Enviada'
                        : 'Rascunho'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400">
                      Qtd: <strong className="text-slate-200">{q.quantity} un</strong>
                    </span>
                    <span className="font-mono font-bold text-white">
                      R$ {q.totalQuotedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Cost Breakdown of Selected Quote */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5">
          {selectedQuote ? (
            <div className="space-y-6">
              {/* Header info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-cyan-400">
                      {selectedQuote.quoteNumber}
                    </span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-xs text-slate-400">Emissão: {selectedQuote.date}</span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-xs text-slate-400">Validade: {selectedQuote.validUntil}</span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {selectedQuote.productName}
                  </h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Cliente: <span className="text-slate-200 font-medium">{selectedQuote.clientName}</span> (CNPJ: {selectedQuote.clientCnpj})
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setPreviewModalOpen(true)}
                    className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                    title="Imprimir / Visualizar Proposta Técnica"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price summary strip */}
              <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded border border-slate-800 text-center">
                <div>
                  <div className="text-[11px] text-slate-400">Quantidade Solicitada</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    {selectedQuote.quantity} un
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Preço Unitário Sugerido</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
                    R$ {selectedQuote.unitQuotedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Valor Total Proposta</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                    R$ {selectedQuote.totalQuotedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Detailed Cost Breakdown Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
                  Composição Paramétrica de Custos (Cost Breakdown)
                </h3>
                <div className="border border-slate-800 rounded overflow-hidden text-xs">
                  <table className="w-full text-left divide-y divide-slate-800">
                    <thead className="bg-slate-950 text-slate-400 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Rubrica de Custo</th>
                        <th className="py-2.5 px-3">Parâmetros / Detalhes</th>
                        <th className="py-2.5 px-3 text-right">Valor Total (R$)</th>
                        <th className="py-2.5 px-3 text-right">% do Custo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-white">Matéria-Prima Direta</td>
                        <td className="py-2.5 px-3 font-sans text-slate-400">Chapas / Tarugos com sucata estimada</td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          R$ {selectedQuote.breakdown.rawMaterialCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {Math.round((selectedQuote.breakdown.rawMaterialCost / (selectedQuote.breakdown.totalCost || 1)) * 100)}%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-white">Máquinas e Mão de Obra</td>
                        <td className="py-2.5 px-3 font-sans text-slate-400">Corte laser, dobra CNC, usinagem e solda</td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          R$ {selectedQuote.breakdown.laborAndMachineCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {Math.round((selectedQuote.breakdown.laborAndMachineCost / (selectedQuote.breakdown.totalCost || 1)) * 100)}%
                        </td>
                      </tr>
                      {selectedQuote.breakdown.subcontractingCost > 0 && (
                        <tr>
                          <td className="py-2.5 px-3 font-sans font-medium text-white">Terceirização & Superfície</td>
                          <td className="py-2.5 px-3 font-sans text-slate-400">Tratamento térmico / Pintura eletrostática</td>
                          <td className="py-2.5 px-3 text-right font-bold text-white">
                            R$ {selectedQuote.breakdown.subcontractingCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400">
                            {Math.round((selectedQuote.breakdown.subcontractingCost / (selectedQuote.breakdown.totalCost || 1)) * 100)}%
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-white">Ferramentas & Dispositivos</td>
                        <td className="py-2.5 px-3 font-sans text-slate-400">Punções, matrizes ou ferramentas especiais</td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          R$ {selectedQuote.breakdown.toolingCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {Math.round((selectedQuote.breakdown.toolingCost / (selectedQuote.breakdown.totalCost || 1)) * 100)}%
                        </td>
                      </tr>
                      <tr className="bg-slate-950/60 font-semibold">
                        <td className="py-2.5 px-3 font-sans text-slate-200">Overhead Indireto ({selectedQuote.breakdown.overheadPercent}%)</td>
                        <td className="py-2.5 px-3 font-sans text-slate-400">Energia, depreciação e custos fabris</td>
                        <td className="py-2.5 px-3 text-right text-amber-400">
                          R$ {(selectedQuote.breakdown.totalCost * (selectedQuote.breakdown.overheadPercent / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-400">
                          {selectedQuote.breakdown.overheadPercent}%
                        </td>
                      </tr>
                      <tr className="bg-cyan-950/30 font-bold border-t border-cyan-800">
                        <td className="py-2.5 px-3 font-sans text-cyan-300">Margem de Lucro Alvo ({selectedQuote.breakdown.marginPercent}%)</td>
                        <td className="py-2.5 px-3 font-sans text-slate-400">Margem bruta de contribuição</td>
                        <td className="py-2.5 px-3 text-right text-cyan-300">
                          R$ {(selectedQuote.totalQuotedPrice - selectedQuote.breakdown.totalCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-cyan-300">
                          {selectedQuote.breakdown.marginPercent}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Alterar Status:</span>
                  <select
                    value={selectedQuote.status}
                    onChange={(e) => onUpdateQuoteStatus(selectedQuote.id, e.target.value as Quote['status'])}
                    className="bg-slate-950 border border-slate-700 text-xs text-white rounded px-2.5 py-1"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="sent">Enviado ao Cliente</option>
                    <option value="approved">Aprovado pelo Cliente</option>
                    <option value="rejected">Rejeitado</option>
                    <option value="converted" disabled>Convertido em OP</option>
                  </select>
                </div>

                {/* 1-Click Conversion to Production Order */}
                {selectedQuote.status !== 'converted' ? (
                  <button
                    onClick={() => onConvertToOrder(selectedQuote)}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovar e Gerar Ordem de Produção (OP)</span>
                  </button>
                ) : (
                  <div className="text-xs text-blue-400 font-mono flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Ordem de Produção Gerada ({selectedQuote.convertedToOrderId})</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Selecione uma cotação para ver o detalhamento de custos.
            </div>
          )}
        </div>
      </div>

      {/* New Quote Parametric Calculator Modal */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">
                  Simulador de Custos & Nova Cotação Industrial
                </h2>
              </div>
              <button
                onClick={() => setIsCalculatorOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateQuote} className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Client & Product info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cliente / Razão Social</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Embraer Defesa S.A."
                    className="w-full bg-slate-950 border border-slate-750 rounded px-3 py-1.5 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">CNPJ do Cliente</label>
                  <input
                    type="text"
                    value={clientCnpj}
                    onChange={(e) => setClientCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-slate-950 border border-slate-750 rounded px-3 py-1.5 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nome da Peça / Produto</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Chassi Inox Dobrado IP65"
                    className="w-full bg-slate-950 border border-slate-750 rounded px-3 py-1.5 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quantidade do Lote (un)</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded px-3 py-1.5 text-white font-mono focus:border-cyan-500 focus:ring-0"
                  />
                </div>
              </div>

              {/* Step 1: Raw Material Calculation */}
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>1. Matéria-Prima & Aproveitamento (Nesting)</span>
                  </h3>
                  <span className="font-mono text-cyan-400 font-semibold">
                    Subtotal MP: R$ {rawMaterialTotalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Material Selecionado</label>
                    <select
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 rounded px-2.5 py-1.5 text-white text-xs"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} (R$ {m.unitCost.toFixed(2)}/{m.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Massa Líquida por Peça (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={materialWeightPerPartKg}
                      onChange={(e) => setMaterialWeightPerPartKg(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-750 rounded px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Perda / Retalho de Nesting (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scrapPercent}
                      onChange={(e) => setScrapPercent(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-750 rounded px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Machine Operations & Labor */}
              <div className="bg-slate-950/60 p-4 rounded border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>2. Operações Fabris & Tempos de Máquina</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-400 font-semibold">
                      Subtotal Máquinas: R$ {laborAndMachineTotalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddOperation}
                      className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700"
                    >
                      + Adicionar Etapa
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedOperations.map((op, idx) => {
                    const wc = workCenters.find(w => w.id === op.workCenterId);
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-slate-900 p-2.5 rounded border border-slate-800">
                        <div className="flex-1">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Posto / Máquina</label>
                          <select
                            value={op.workCenterId}
                            onChange={(e) => {
                              const updated = [...selectedOperations];
                              updated[idx].workCenterId = e.target.value;
                              setSelectedOperations(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-750 rounded px-2 py-1 text-white text-xs"
                          >
                            {workCenters.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name} (R$ {w.hourlyRate}/h)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-28">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Setup (horas)</label>
                          <input
                            type="number"
                            step="0.05"
                            value={op.setupHours}
                            onChange={(e) => {
                              const updated = [...selectedOperations];
                              updated[idx].setupHours = Number(e.target.value);
                              setSelectedOperations(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-750 rounded px-2 py-1 text-white font-mono"
                          />
                        </div>

                        <div className="w-32">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Ciclo (min/peça)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={op.cycleMinutesPerPart}
                            onChange={(e) => {
                              const updated = [...selectedOperations];
                              updated[idx].cycleMinutesPerPart = Number(e.target.value);
                              setSelectedOperations(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-750 rounded px-2 py-1 text-white font-mono"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveOperation(idx)}
                          className="mt-4 text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Tooling, Overhead and Profit Margin */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">Terceirização / Tratamento (R$)</label>
                  <input
                    type="number"
                    value={subcontractingCost}
                    onChange={(e) => setSubcontractingCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Ferramentas / Gabarito (R$)</label>
                  <input
                    type="number"
                    value={toolingCost}
                    onChange={(e) => setToolingCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Overhead Fabril (%)</label>
                  <input
                    type="number"
                    value={overheadPercent}
                    onChange={(e) => setOverheadPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Margem de Lucro (%)</label>
                  <input
                    type="number"
                    value={profitMarginPercent}
                    onChange={(e) => setProfitMarginPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Final Real-Time Result Banner */}
              <div className="p-4 bg-cyan-950/40 border border-cyan-800/80 rounded flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-cyan-300 uppercase tracking-wider font-semibold">
                    Cálculo Concluído em Tempo Real
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Custo Total: R$ {totalProductionCost.toFixed(2)} · Margem: {profitMarginPercent}%
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">
                    Preço Unitário: <strong className="text-cyan-400 font-mono text-sm">R$ {unitQuotedPrice.toFixed(2)}</strong>
                  </div>
                  <div className="text-base font-bold text-white font-mono">
                    Total Proposta: R$ {totalQuotedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCalculatorOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded transition-colors shadow-sm"
                >
                  Salvar Cotação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Commercial Technical Proposal Preview Modal */}
      {previewModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6">
            {/* Header Document */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  APEX INDUSTRIAL MANUFATURA LTDA
                </h2>
                <p className="text-xs text-slate-500">
                  Usinagem, Caldeiraria Técnica e Soluções Industriais Integradas
                </p>
                <p className="text-xs text-slate-500 font-mono">CNPJ: 12.345.678/0001-90 · Joinville - SC</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-cyan-800">
                  PROPOSTA: {selectedQuote.quoteNumber}
                </div>
                <div className="text-xs text-slate-500">Data: {selectedQuote.date}</div>
                <div className="text-xs text-slate-500">Validade: {selectedQuote.validUntil}</div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-slate-50 p-3.5 rounded border border-slate-200 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">Cliente:</span> <strong>{selectedQuote.clientName}</strong>
              </div>
              <div>
                <span className="text-slate-500">CNPJ:</span> <span className="font-mono">{selectedQuote.clientCnpj}</span>
              </div>
              <div>
                <span className="text-slate-500">Contato:</span> {selectedQuote.contactName}
              </div>
              <div>
                <span className="text-slate-500">E-mail:</span> {selectedQuote.contactEmail}
              </div>
            </div>

            {/* Item table */}
            <div className="text-xs">
              <table className="w-full border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-200 p-2 text-left">Item / Descrição Técnica</th>
                    <th className="border border-slate-200 p-2 text-center">Qtd</th>
                    <th className="border border-slate-200 p-2 text-right">Preço Unit.</th>
                    <th className="border border-slate-200 p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 p-2.5">
                      <div className="font-bold">{selectedQuote.productName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{selectedQuote.productCode}</div>
                      <div className="text-slate-600 text-[11px] mt-1">{selectedQuote.notes}</div>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-center font-mono font-bold">
                      {selectedQuote.quantity} un
                    </td>
                    <td className="border border-slate-200 p-2.5 text-right font-mono font-bold">
                      R$ {selectedQuote.unitQuotedPrice.toFixed(2)}
                    </td>
                    <td className="border border-slate-200 p-2.5 text-right font-mono font-bold text-slate-900">
                      R$ {selectedQuote.totalQuotedPrice.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Commercial terms */}
            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
              <div className="font-bold text-slate-800">Condições Comerciais:</div>
              <div>· Prazo de Entrega Estimado: {selectedQuote.leadTimeDays} dias úteis após confirmação de pedido.</div>
              <div>· Frete: FOB Fábrica (Joinville - SC) ou CIF a combinar.</div>
              <div>· Condição de Pagamento: 30 dias líquidos após emissão de NF-e.</div>
              <div>· Acompanha: Relatório Dimensional de Qualidade e Certificado de Matéria-Prima.</div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded font-medium flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Gerar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
