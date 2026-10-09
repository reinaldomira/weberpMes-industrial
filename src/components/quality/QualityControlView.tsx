import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  FileText, 
  Ruler, 
  ShieldCheck,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { QualityInspection, NonConformanceReport, ProductionOrder } from '../../types/industrial';

interface QualityControlViewProps {
  inspections: QualityInspection[];
  rncs: NonConformanceReport[];
  productionOrders: ProductionOrder[];
  onAddInspection: (inspection: QualityInspection) => void;
  onAddRNC: (rnc: NonConformanceReport) => void;
}

export const QualityControlView: React.FC<QualityControlViewProps> = ({
  inspections,
  rncs,
  productionOrders,
  onAddInspection,
  onAddRNC,
}) => {
  const [activeTab, setActiveTab] = useState<'inspections' | 'rncs'>('inspections');
  const [selectedInspection, setSelectedInspection] = useState<QualityInspection | null>(inspections[0] || null);
  const [isNewInspectionOpen, setIsNewInspectionOpen] = useState(false);
  const [isNewRNCOpen, setIsNewRNCOpen] = useState(false);

  // New Inspection State
  const [selectedOrderNum, setSelectedOrderNum] = useState(productionOrders[0]?.orderNumber || '');
  const [inspectorName, setInspectorName] = useState('Mariana Duarte (Inspetora N2)');
  const [dim1Actual, setDim1Actual] = useState(179.988);
  const [dim2Actual, setDim2Actual] = useState(65.014);

  // New RNC State
  const [rncOrderNum, setRncOrderNum] = useState(productionOrders[0]?.orderNumber || '');
  const [rncDefectCategory, setRncDefectCategory] = useState<NonConformanceReport['defectCategory']>('dimensional');
  const [rncDescription, setRncDescription] = useState('');
  const [rncRootCause, setRncRootCause] = useState('');
  const [rncCorrectiveAction, setRncCorrectiveAction] = useState('');
  const [rncQty, setRncQty] = useState(1);

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const ord = productionOrders.find(o => o.orderNumber === selectedOrderNum) || productionOrders[0];

    const newInsp: QualityInspection = {
      id: `qual-${Date.now()}`,
      orderNumber: ord.orderNumber,
      productCode: ord.productCode,
      inspectorName,
      inspectionDate: new Date().toISOString().split('T')[0],
      lotNumber: ord.lotNumber,
      status: 'approved',
      measurements: [
        {
          feature: 'Cota Externa Principal (Ø / Comp)',
          nominal: 180.0,
          toleranceMin: -0.025,
          toleranceMax: 0.0,
          actual: dim1Actual,
          unit: 'mm',
          isConforming: dim1Actual >= 180.0 - 0.025 && dim1Actual <= 180.0
        },
        {
          feature: 'Alojamento / Furo Central (H7)',
          nominal: 65.0,
          toleranceMin: 0.0,
          toleranceMax: 0.030,
          actual: dim2Actual,
          unit: 'mm',
          isConforming: dim2Actual >= 65.0 && dim2Actual <= 65.030
        }
      ],
      visualCheck: true,
      roughnessCheck: true,
      notes: 'Inspeção dimensional por amostragem AQL nível II. Lote aprovado para expedição.'
    };

    onAddInspection(newInsp);
    setSelectedInspection(newInsp);
    setIsNewInspectionOpen(false);
  };

  const handleCreateRNC = (e: React.FormEvent) => {
    e.preventDefault();
    const ord = productionOrders.find(o => o.orderNumber === rncOrderNum) || productionOrders[0];

    const newRnc: NonConformanceReport = {
      id: `rnc-${Date.now()}`,
      rncNumber: `RNC-2026-00${Math.floor(20 + Math.random() * 80)}`,
      orderNumber: ord.orderNumber,
      productCode: ord.productCode,
      workCenterName: ord.routing[0]?.workCenterName || 'Usinagem CNC',
      detectedBy: inspectorName,
      date: new Date().toISOString().split('T')[0],
      defectCategory: rncDefectCategory,
      description: rncDescription || 'Desvio dimensional verificado em ensaio.',
      quantityRejected: rncQty,
      rootCause: rncRootCause || 'Ajuste de ferramenta incorreto durante troca de turno.',
      correctiveAction: rncCorrectiveAction || 'Retrabalho e correção de offset na máquina.',
      status: 'action_defined'
    };

    onAddRNC(newRnc);
    setIsNewRNCOpen(false);
    setRncDescription('');
    setRncRootCause('');
    setRncCorrectiveAction('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Controle de Qualidade & Relatórios de Não Conformidade (RNC)
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              ISO 9001 / Metrologia
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fichas de medição dimensional com tolerâncias ISO, aprovação de lotes e tratamento de não conformidades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewInspectionOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ficha de Medição</span>
          </button>
          <button
            onClick={() => setIsNewRNCOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Abrir RNC</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('inspections')}
          className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
            activeTab === 'inspections'
              ? 'bg-slate-800 text-white font-bold border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Fichas de Inspeção Dimensional ({inspections.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('rncs')}
          className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
            activeTab === 'rncs'
              ? 'bg-slate-800 text-white font-bold border-b-2 border-rose-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Não Conformidades / RNCs ({rncs.length})</span>
        </button>
      </div>

      {activeTab === 'inspections' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inspections List */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">
                Histórico de Laudos Metrológicos
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {inspections.length} laudos
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {inspections.map((insp) => {
                const isSelected = selectedInspection?.id === insp.id;
                return (
                  <div
                    key={insp.id}
                    onClick={() => setSelectedInspection(insp)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-800/80 border-l-2 border-cyan-500' : 'hover:bg-slate-850/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-cyan-400">
                            {insp.orderNumber}
                          </span>
                          <span className="text-slate-600 text-xs">·</span>
                          <span className="text-xs font-semibold text-white">
                            {insp.productCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Inspetor: {insp.inspectorName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Lote: {insp.lotNumber} · Data: {insp.inspectionDate}
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        100% Conforme
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inspection Dimensional Detail */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5">
            {selectedInspection ? (
              <div className="space-y-5 text-xs">
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold">{selectedInspection.orderNumber}</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-300 font-semibold">{selectedInspection.productCode}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Inspetor: <strong>{selectedInspection.inspectorName}</strong> · Data: {selectedInspection.inspectionDate}
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Lote Liberado</span>
                  </div>
                </div>

                {/* Measurements Table */}
                <div>
                  <h3 className="font-bold text-white uppercase tracking-wider mb-2.5">
                    Relatório de Medições Dimensionais (GD&T)
                  </h3>
                  <div className="border border-slate-800 rounded overflow-hidden">
                    <table className="w-full text-left divide-y divide-slate-800">
                      <thead className="bg-slate-950 text-slate-400 font-semibold">
                        <tr>
                          <th className="py-2 px-3">Característica</th>
                          <th className="py-2 px-3 text-right">Nominal</th>
                          <th className="py-2 px-3 text-center">Tolerância</th>
                          <th className="py-2 px-3 text-right">Medição Real</th>
                          <th className="py-2 px-3 text-center">Parecer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                        {selectedInspection.measurements.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-850/40">
                            <td className="py-2.5 px-3 font-sans text-white font-medium">
                              {m.feature}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-200">
                              {m.nominal.toFixed(3)} {m.unit}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-400 text-[11px]">
                              {m.toleranceMin > 0 ? `+${m.toleranceMin}` : m.toleranceMin} / +{m.toleranceMax}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-cyan-300">
                              {m.actual.toFixed(3)} {m.unit}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {m.isConforming ? (
                                <span className="text-emerald-400 flex items-center justify-center gap-1 font-semibold text-[11px]">
                                  <Check className="w-3.5 h-3.5" /> Aprovado
                                </span>
                              ) : (
                                <span className="text-rose-400 flex items-center justify-center gap-1 font-semibold text-[11px]">
                                  <XCircle className="w-3.5 h-3.5" /> Reprovado
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes & Certification */}
                <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400">Parecer Técnico Metrológico:</div>
                  <div className="text-slate-200 italic">"{selectedInspection.notes}"</div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Selecione uma ficha de inspeção para ver os ensaios.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* RNC Table & Workflow */
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div>
              <h2 className="text-sm font-bold text-white">
                Relatórios de Não Conformidade (RNC)
              </h2>
              <p className="text-slate-400">
                Tratamento de defeitos de fabricação, análise de causa raiz e ações corretivas.
              </p>
            </div>
            <span className="font-mono text-rose-400 font-bold">
              {rncs.filter(r => r.status !== 'closed').length} RNC(s) ativas
            </span>
          </div>

          <div className="space-y-3">
            {rncs.map((rnc) => (
              <div key={rnc.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800">
                      {rnc.rncNumber}
                    </span>
                    <span className="font-semibold text-white">OP: {rnc.orderNumber}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300">{rnc.workCenterName}</span>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 w-fit">
                    Ação Corretiva Definida
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-850">
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Descrição do Desvio / Defeito:</span>
                    <p className="text-slate-200 mt-1">{rnc.description}</p>
                    <div className="text-[10px] text-rose-400 font-mono mt-1">
                      Quantidade Rejeitada: {rnc.quantityRejected} un
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase">Causa Raiz & Ação Corretiva:</span>
                    <p className="text-slate-300 mt-1"><strong className="text-slate-400">Causa:</strong> {rnc.rootCause}</p>
                    <p className="text-emerald-400 mt-1"><strong className="text-slate-400">Ação:</strong> {rnc.correctiveAction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Inspection Modal */}
      {isNewInspectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Registrar Ensaio Metrológico</h2>
              <button onClick={() => setIsNewInspectionOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">Ordem de Produção (OP)</label>
                <select
                  value={selectedOrderNum}
                  onChange={(e) => setSelectedOrderNum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                >
                  {productionOrders.map(o => (
                    <option key={o.id} value={o.orderNumber}>
                      {o.orderNumber} - {o.productName} ({o.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nome do Inspetor de Qualidade</label>
                <input
                  type="text"
                  required
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">Medição Cota Externa (Nominal: 180.00)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={dim1Actual}
                    onChange={(e) => setDim1Actual(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Medição Furo H7 (Nominal: 65.00)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={dim2Actual}
                    onChange={(e) => setDim2Actual(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewInspectionOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  Salvar Ficha de Inspeção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New RNC Modal */}
      {isNewRNCOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Abrir Relatório de Não Conformidade (RNC)</h2>
              <button onClick={() => setIsNewRNCOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateRNC} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Ordem de Produção (OP)</label>
                  <select
                    value={rncOrderNum}
                    onChange={(e) => setRncOrderNum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  >
                    {productionOrders.map(o => (
                      <option key={o.id} value={o.orderNumber}>
                        {o.orderNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Qtd Rejeitada</label>
                  <input
                    type="number"
                    min="1"
                    value={rncQty}
                    onChange={(e) => setRncQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Descrição do Defeito</label>
                <textarea
                  rows={2}
                  required
                  value={rncDescription}
                  onChange={(e) => setRncDescription(e.target.value)}
                  placeholder="Ex: Rebarba excessiva na borda cortada após troca de gás."
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Causa Raiz Identificada (5 Porquês)</label>
                <input
                  type="text"
                  required
                  value={rncRootCause}
                  onChange={(e) => setRncRootCause(e.target.value)}
                  placeholder="Ex: Desgaste prematuro do bocal cerâmico de corte."
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ação Corretiva Proposta</label>
                <input
                  type="text"
                  required
                  value={rncCorrectiveAction}
                  onChange={(e) => setRncCorrectiveAction(e.target.value)}
                  placeholder="Ex: Troca preventiva do bocal a cada 200h e recalibração capacitiva."
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRNCOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold"
                >
                  Registrar RNC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
