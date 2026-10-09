import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  Plus, 
  Clock, 
  Boxes, 
  FileCode, 
  Cpu, 
  Trash2, 
  Save, 
  Wrench,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Product, MaterialItem, WorkCenter, BOMComponent, RoutingOperation } from '../../types/industrial';
import { CadViewerModal } from './CadViewerModal';

interface EngineeringBOMProps {
  products: Product[];
  materials: MaterialItem[];
  workCenters: WorkCenter[];
  onUpdateProduct: (product: Product) => void;
}

export const EngineeringBOM: React.FC<EngineeringBOMProps> = ({
  products,
  materials,
  workCenters,
  onUpdateProduct,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [activeTab, setActiveTab] = useState<'bom' | 'routing'>('bom');
  const [cadModalProduct, setCadModalProduct] = useState<Product | null>(null);

  // New BOM Item state
  const [isAddingBOM, setIsAddingBOM] = useState(false);
  const [newMatId, setNewMatId] = useState(materials[0]?.id || '');
  const [newMatQty, setNewMatQty] = useState(1);
  const [newMatScrap, setNewMatScrap] = useState(5);

  // New Routing Op state
  const [isAddingOp, setIsAddingOp] = useState(false);
  const [newOpName, setNewOpName] = useState('');
  const [newOpWorkCenterId, setNewOpWorkCenterId] = useState(workCenters[0]?.id || '');
  const [newOpSetup, setNewOpSetup] = useState(15);
  const [newOpCycle, setNewOpCycle] = useState(5);
  const [newOpInstructions, setNewOpInstructions] = useState('');

  const handleAddBOMComponent = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = materials.find(m => m.id === newMatId);
    if (!mat) return;

    const newComponent: BOMComponent = {
      id: `bom-${Date.now()}`,
      materialId: mat.id,
      materialName: mat.name,
      quantityPerProduct: newMatQty,
      unit: mat.unit,
      unitCost: mat.unitCost,
      scrapAllowancePercent: newMatScrap
    };

    const updated = {
      ...selectedProduct,
      bom: [...selectedProduct.bom, newComponent]
    };
    setSelectedProduct(updated);
    onUpdateProduct(updated);
    setIsAddingBOM(false);
  };

  const handleRemoveBOMComponent = (id: string) => {
    const updated = {
      ...selectedProduct,
      bom: selectedProduct.bom.filter(c => c.id !== id)
    };
    setSelectedProduct(updated);
    onUpdateProduct(updated);
  };

  const handleAddOperation = (e: React.FormEvent) => {
    e.preventDefault();
    const wc = workCenters.find(w => w.id === newOpWorkCenterId);
    if (!wc || !newOpName) return;

    const nextStep = selectedProduct.routing.length > 0
      ? Math.max(...selectedProduct.routing.map(r => r.step)) + 10
      : 10;

    const newOp: RoutingOperation = {
      step: nextStep,
      name: newOpName,
      workCenterId: wc.id,
      workCenterName: wc.name,
      setupTimeMinutes: newOpSetup,
      cycleTimeMinutesPerUnit: newOpCycle,
      hourlyRate: wc.hourlyRate,
      instructions: newOpInstructions || 'Executar conforme desenho técnico.'
    };

    const updated = {
      ...selectedProduct,
      routing: [...selectedProduct.routing, newOp]
    };
    setSelectedProduct(updated);
    onUpdateProduct(updated);
    setIsAddingOp(false);
    setNewOpName('');
    setNewOpInstructions('');
  };

  const handleRemoveOperation = (step: number) => {
    const updated = {
      ...selectedProduct,
      routing: selectedProduct.routing.filter(r => r.step !== step)
    };
    setSelectedProduct(updated);
    onUpdateProduct(updated);
  };

  // Cost rollups
  const totalMaterialCost = selectedProduct.bom.reduce(
    (acc, item) => acc + (item.quantityPerProduct * (1 + item.scrapAllowancePercent / 100)) * item.unitCost,
    0
  );

  const totalOperationMinutes = selectedProduct.routing.reduce(
    (acc, op) => acc + op.cycleTimeMinutesPerUnit,
    0
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Engenharia de Produto, BOM e Roteiros
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              WebErpMes Methods & Routing
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão da estrutura de materiais (BOM), sequência operacional fabril e visualizador de desenhos técnicos CAD.
          </p>
        </div>

        {/* CAD Viewer Action */}
        <button
          onClick={() => setCadModalProduct(selectedProduct)}
          className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <Eye className="w-4 h-4" />
          <span>Visualizador CAD Técnico 2D/3D</span>
        </button>
      </div>

      {/* Product Selector Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 bg-slate-900 border border-slate-800 p-3 rounded-lg">
        <span className="text-xs font-bold text-slate-400 whitespace-nowrap shrink-0">
          Peça / Conjunto Ativo:
        </span>
        <div className="flex items-center gap-2">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className={`px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
                selectedProduct.id === p.id
                  ? 'bg-cyan-950 border border-cyan-600 text-cyan-300 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{p.name}</span>
              <span className="font-mono text-[10px] ml-1.5 opacity-75">({p.code})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Summary Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-cyan-400">{selectedProduct.code}</span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {selectedProduct.revision}
              </span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-xs text-slate-400">Cliente Referência: {selectedProduct.clientName || 'Padrão'}</span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">
              {selectedProduct.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              {selectedProduct.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded border border-slate-800 shrink-0 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Massa Líquida</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">{selectedProduct.weightKg} kg</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Custo MP / un</div>
              <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                R$ {totalMaterialCost.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Tempo de Ciclo</div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                {totalOperationMinutes.toFixed(1)} min
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tabs: BOM vs Routing */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bom')}
            className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
              activeTab === 'bom'
                ? 'bg-slate-800 text-white font-bold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Lista de Materiais (BOM) ({selectedProduct.bom.length} itens)</span>
          </button>
          <button
            onClick={() => setActiveTab('routing')}
            className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
              activeTab === 'routing'
                ? 'bg-slate-800 text-white font-bold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Roteiro de Operações / Gama ({selectedProduct.routing.length} etapas)</span>
          </button>
        </div>
      </div>

      {/* Content View: BOM Tab */}
      {activeTab === 'bom' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Estrutura de Materiais & Componentes (BOM)
              </h3>
              <p className="text-[11px] text-slate-400">
                Itens consumidos por cada unidade fabricada com custo e margem de perda.
              </p>
            </div>
            <button
              onClick={() => setIsAddingBOM(true)}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Material à BOM</span>
            </button>
          </div>

          {/* Add BOM Form */}
          {isAddingBOM && (
            <form onSubmit={handleAddBOMComponent} className="p-4 bg-slate-950 rounded border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Selecionar Material / Insumo</label>
                <select
                  value={newMatId}
                  onChange={(e) => setNewMatId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} - R$ {m.unitCost.toFixed(2)}/{m.unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Qtd por Peça</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newMatQty}
                  onChange={(e) => setNewMatQty(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Perda / Scrap (%)</label>
                <input
                  type="number"
                  value={newMatScrap}
                  onChange={(e) => setNewMatScrap(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white font-mono"
                />
              </div>
              <div className="sm:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsAddingBOM(false)}
                  className="px-3 py-1 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
                >
                  Confirmar Inclusão
                </button>
              </div>
            </form>
          )}

          {/* BOM Table */}
          <div className="border border-slate-800 rounded overflow-hidden text-xs">
            <table className="w-full text-left divide-y divide-slate-800">
              <thead className="bg-slate-950 text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Item / Material</th>
                  <th className="py-2.5 px-3 text-center">Consumo Unitário</th>
                  <th className="py-2.5 px-3 text-center">Perda Esperada</th>
                  <th className="py-2.5 px-3 text-right">Custo Unitário</th>
                  <th className="py-2.5 px-3 text-right">Custo Total / Peça</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                {selectedProduct.bom.map((item) => {
                  const effectiveQty = item.quantityPerProduct * (1 + item.scrapAllowancePercent / 100);
                  const lineCost = effectiveQty * item.unitCost;
                  return (
                    <tr key={item.id} className="hover:bg-slate-850/40">
                      <td className="py-2.5 px-3 font-sans text-white font-medium">
                        {item.materialName}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-200">
                        {item.quantityPerProduct} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-400">
                        {item.scrapAllowancePercent}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        R$ {item.unitCost.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        R$ {lineCost.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleRemoveBOMComponent(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remover da BOM"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content View: Routing Operations Tab */}
      {activeTab === 'routing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Gama de Fabricação / Roteiro Sequencial
              </h3>
              <p className="text-[11px] text-slate-400">
                Passo a passo com tempos de preparação (setup) e ciclo por posto de trabalho.
              </p>
            </div>
            <button
              onClick={() => setIsAddingOp(true)}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Operação ao Roteiro</span>
            </button>
          </div>

          {/* Add Operation Form */}
          {isAddingOp && (
            <form onSubmit={handleAddOperation} className="p-4 bg-slate-950 rounded border border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Nome da Operação</label>
                  <input
                    type="text"
                    required
                    value={newOpName}
                    onChange={(e) => setNewOpName(e.target.value)}
                    placeholder="Ex: Furação e Rosqueamento M8"
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Posto de Trabalho</label>
                  <select
                    value={newOpWorkCenterId}
                    onChange={(e) => setNewOpWorkCenterId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white"
                  >
                    {workCenters.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} (R$ {w.hourlyRate}/h)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tempo Setup (minutos)</label>
                  <input
                    type="number"
                    value={newOpSetup}
                    onChange={(e) => setNewOpSetup(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tempo Ciclo por Peça (minutos)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newOpCycle}
                    onChange={(e) => setNewOpCycle(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-slate-400 mb-1">Instruções Operacionais para o Chão de Fábrica</label>
                  <input
                    type="text"
                    value={newOpInstructions}
                    onChange={(e) => setNewOpInstructions(e.target.value)}
                    placeholder="Ex: Verificar concentricidade com relógio comparador milesimal."
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsAddingOp(false)}
                  className="px-3 py-1 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
                >
                  Salvar Operação
                </button>
              </div>
            </form>
          )}

          {/* Operations List */}
          <div className="space-y-2.5">
            {selectedProduct.routing.map((op) => (
              <div
                key={op.step}
                className="bg-slate-950 border border-slate-800 rounded p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-cyan-950/80 border border-cyan-800 flex items-center justify-center font-mono font-bold text-cyan-400 text-sm shrink-0">
                    {op.step}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {op.name}
                    </div>
                    <div className="text-slate-400 flex items-center gap-2 mt-0.5 text-[11px]">
                      <span className="text-cyan-300 font-semibold">{op.workCenterName}</span>
                      <span>·</span>
                      <span>Taxa: R$ {op.hourlyRate.toFixed(2)}/h</span>
                    </div>
                    {op.instructions && (
                      <div className="text-[11px] text-slate-300 mt-1 italic bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                        "{op.instructions}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-slate-300">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Setup</div>
                    <div className="text-slate-200">{op.setupTimeMinutes} min</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Ciclo / un</div>
                    <div className="text-emerald-400 font-bold">{op.cycleTimeMinutesPerUnit} min</div>
                  </div>
                  <button
                    onClick={() => handleRemoveOperation(op.step)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Excluir Operação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAD Viewer Modal */}
      {cadModalProduct && (
        <CadViewerModal
          product={cadModalProduct}
          onClose={() => setCadModalProduct(null)}
        />
      )}
    </div>
  );
};
