import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  FileText, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle,
  Filter,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { MaterialItem } from '../../types/industrial';

interface StockTraceabilityProps {
  materials: MaterialItem[];
  onAddMaterial: (material: MaterialItem) => void;
  onUpdateStock: (id: string, deltaQuantity: number) => void;
}

export const StockTraceability: React.FC<StockTraceabilityProps> = ({
  materials,
  onAddMaterial,
  onUpdateStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(materials[0] || null);
  const [isNewMaterialOpen, setIsNewMaterialOpen] = useState(false);

  // New Material form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [materialSpec, setMaterialSpec] = useState('');
  const [type, setType] = useState<MaterialItem['type']>('sheet');
  const [unit, setUnit] = useState<MaterialItem['unit']>('kg');
  const [unitCost, setUnitCost] = useState(25.00);
  const [stockQuantity, setStockQuantity] = useState(500);
  const [minStock, setMinStock] = useState(100);
  const [lotNumber, setLotNumber] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [location, setLocation] = useState('Galpão A - Pátio 01');

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.materialSpec.toLowerCase().includes(searchTerm.toLowerCase());
    if (categoryFilter === 'all') return matchesSearch;
    return matchesSearch && m.category === categoryFilter;
  });

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      code: code || `MP-${Math.floor(100 + Math.random() * 900)}`,
      name,
      category: type === 'sheet' || type === 'rod' || type === 'tube' ? 'raw_material' : 'hardware',
      type,
      materialSpec: materialSpec || 'Aço / Liga Industrial',
      density: 7.85,
      unit,
      unitCost,
      stockQuantity,
      minStock,
      lotNumber: lotNumber || `LT-2026-${Math.floor(100 + Math.random() * 900)}`,
      certNumber: certNumber || `CERT-${Math.floor(10000 + Math.random() * 90000)}`,
      location
    };

    onAddMaterial(newMat);
    setSelectedMaterial(newMat);
    setIsNewMaterialOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Estoque, Almoxarifado & Rastreabilidade de Lotes
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Traceability & Heat Certificates
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Controle de matéria-prima (chapas, perfis, tarugos), certificados de usina, lotes e localização fabril.
          </p>
        </div>

        <button
          onClick={() => setIsNewMaterialOpen(true)}
          className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Lote / Material</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, norma, lote..."
            className="w-full bg-slate-950 border border-slate-750 rounded pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              categoryFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({materials.length})
          </button>
          <button
            onClick={() => setCategoryFilter('raw_material')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              categoryFilter === 'raw_material' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Matéria-Prima (Chapas/Tarugos)
          </button>
          <button
            onClick={() => setCategoryFilter('hardware')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              categoryFilter === 'hardware' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fixadores & Componentes
          </button>
          <button
            onClick={() => setCategoryFilter('consumable')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              categoryFilter === 'consumable' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Insumos / Químicos
          </button>
        </div>
      </div>

      {/* Main Grid: Inventory Table + Lot Certificate Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Inventory Table */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">
              Materiais em Estoque ({filteredMaterials.length})
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Valoração Total: R$ {filteredMaterials.reduce((acc, m) => acc + m.stockQuantity * m.unitCost, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left divide-y divide-slate-800">
              <thead className="bg-slate-950 text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Código / Descrição</th>
                  <th className="py-2.5 px-3">Especificação</th>
                  <th className="py-2.5 px-3 text-right">Saldo Atual</th>
                  <th className="py-2.5 px-3 text-center">Lote / Rastreio</th>
                  <th className="py-2.5 px-3 text-right">Custo Unit.</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                {filteredMaterials.map((item) => {
                  const isSelected = selectedMaterial?.id === item.id;
                  const isLow = item.stockQuantity <= item.minStock;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedMaterial(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-800/80 border-l-2 border-cyan-500' : 'hover:bg-slate-850/50'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-cyan-400 text-[11px]">{item.code}</div>
                        <div className="font-sans text-white text-xs truncate max-w-[220px]" title={item.name}>
                          {item.name}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px]">
                        {item.materialSpec}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        {item.stockQuantity} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-center text-cyan-300 text-[11px]">
                        {item.lotNumber}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        R$ {item.unitCost.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded ${
                            isLow
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {isLow ? 'Estoque Crítico' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      Nenhum material cadastrado no estoque de matéria-prima.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Lot Certificate & Actions */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-lg p-5">
          {selectedMaterial ? (
            <div className="space-y-5 text-xs">
              <div className="border-b border-slate-800 pb-3">
                <span className="font-mono text-cyan-400 font-bold">{selectedMaterial.code}</span>
                <h2 className="text-sm font-bold text-white mt-1">
                  {selectedMaterial.name}
                </h2>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Localização: <strong className="text-slate-200">{selectedMaterial.location}</strong>
                </div>
              </div>

              {/* Mill Test Certificate Badge Box */}
              <div className="bg-slate-950 p-4 rounded-lg border border-cyan-800/60 space-y-2.5">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Certificado de Qualidade da Usina</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">100% Válido</span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lote Industrial:</span>
                    <span className="font-mono text-white font-bold">{selectedMaterial.lotNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nº do Certificado:</span>
                    <span className="font-mono text-cyan-300 font-bold">{selectedMaterial.certNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Norma do Material:</span>
                    <span className="text-slate-200">{selectedMaterial.materialSpec}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Densidade Estimada:</span>
                    <span className="font-mono text-slate-200">{selectedMaterial.density} g/cm³</span>
                  </div>
                </div>
              </div>

              {/* Stock Movement Quick Actions */}
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-3">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider">
                  Movimentação Rápida de Estoque
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      const qty = Number(prompt('Quantidade de entrada (NF de compra):', '100'));
                      if (qty > 0) onUpdateStock(selectedMaterial.id, qty);
                    }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700 flex items-center justify-center gap-1.5 font-semibold transition-colors"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Dar Entrada (NF)</span>
                  </button>

                  <button
                    onClick={() => {
                      const qty = Number(prompt('Quantidade de baixa para OP:', '20'));
                      if (qty > 0) onUpdateStock(selectedMaterial.id, -qty);
                    }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded border border-slate-700 flex items-center justify-center gap-1.5 font-semibold transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Baixa para OP</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Selecione um material para ver certificados.
            </div>
          )}
        </div>
      </div>

      {/* New Material Modal */}
      {isNewMaterialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">
                Cadastrar Matéria-Prima com Certificado
              </h2>
              <button
                onClick={() => setIsNewMaterialOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Descrição do Material</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Chapa Aço Inox AISI 304 3.0mm"
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Norma / Especificação</label>
                  <input
                    type="text"
                    required
                    value={materialSpec}
                    onChange={(e) => setMaterialSpec(e.target.value)}
                    placeholder="Ex: AISI 304 2B"
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Geometria</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  >
                    <option value="sheet">Chapa Plana</option>
                    <option value="rod">Tarugo / Barra Redonda</option>
                    <option value="tube">Tubo / Perfil Estrutural</option>
                    <option value="fastener">Fixador (Parafuso/Porca)</option>
                    <option value="chemical">Químico / Consumível</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Unidade</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  >
                    <option value="kg">kg</option>
                    <option value="m">m</option>
                    <option value="m2">m²</option>
                    <option value="un">un</option>
                    <option value="bar">barra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Preço Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Qtd Inicial</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Número do Lote</label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="Ex: LT-2026-USIMINAS-89"
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nº Certificado de Usina</label>
                  <input
                    type="text"
                    value={certNumber}
                    onChange={(e) => setCertNumber(e.target.value)}
                    placeholder="Ex: CERT-USI-88190"
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewMaterialOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  Salvar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
