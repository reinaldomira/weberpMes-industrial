import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  AlertOctagon, 
  HardHat, 
  QrCode, 
  Clock, 
  Check, 
  X, 
  Scan, 
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { ProductionOrder, WorkCenter, ShopFloorTimeEntry } from '../../types/industrial';

interface ShopFloorKioskProps {
  productionOrders: ProductionOrder[];
  workCenters: WorkCenter[];
  activeOrderNumber?: string;
  onLogProduction: (entry: ShopFloorTimeEntry) => void;
  onUpdateWorkCenterStatus: (wcId: string, status: WorkCenter['status'], orderCode?: string, opName?: string) => void;
}

export const ShopFloorKiosk: React.FC<ShopFloorKioskProps> = ({
  productionOrders,
  workCenters,
  activeOrderNumber,
  onLogProduction,
  onUpdateWorkCenterStatus,
}) => {
  // Operator state
  const [operatorName, setOperatorName] = useState('Carlos Eduardo Mendes');
  const [badgeNumber, setBadgeNumber] = useState('OP-5410');

  // Workcenter selection
  const [selectedWorkCenterId, setSelectedWorkCenterId] = useState(workCenters[0]?.id || '');
  const selectedWc = workCenters.find(w => w.id === selectedWorkCenterId) || workCenters[0];

  // Active Order selection
  const [searchOpCode, setSearchOpCode] = useState(activeOrderNumber || productionOrders[0]?.orderNumber || '');
  const activeOrder = productionOrders.find(o => o.orderNumber === searchOpCode) || productionOrders[0];

  // Operation step
  const [selectedStep, setSelectedStep] = useState<number>(activeOrder?.currentOperationStep || 10);

  // Active Running state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Parts counters
  const [goodParts, setGoodParts] = useState(0);
  const [scrapParts, setScrapParts] = useState(0);
  const [scrapReason, setScrapReason] = useState('Dimensional fora da tolerância');

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Sync step with order change
  useEffect(() => {
    if (activeOrder) {
      setSelectedStep(activeOrder.currentOperationStep);
    }
  }, [activeOrder?.orderNumber]);

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    onUpdateWorkCenterStatus(selectedWc.id, 'in_production', activeOrder.orderNumber, operatorName);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleFinish = () => {
    if (goodParts === 0 && scrapParts === 0) {
      alert('Informe ao menos 1 peça produzida ou refugada antes de finalizar o apontamento.');
      return;
    }

    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    const entry: ShopFloorTimeEntry = {
      id: `entry-${Date.now()}`,
      orderId: activeOrder.id,
      orderNumber: activeOrder.orderNumber,
      operationStep: selectedStep,
      workCenterId: selectedWc.id,
      operatorName,
      badgeNumber,
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes,
      goodQuantity: goodParts,
      scrapQuantity: scrapParts,
      scrapReason: scrapParts > 0 ? scrapReason : undefined,
      status: 'finished'
    };

    onLogProduction(entry);
    onUpdateWorkCenterStatus(selectedWc.id, 'operational');

    alert(`Apontamento da OP ${activeOrder.orderNumber} registrado com sucesso!\n${goodParts} peças boas gravadas e sincronizadas.`);

    // Reset state
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setGoodParts(0);
    setScrapParts(0);
  };

  const currentOpDetail = activeOrder?.routing.find(r => r.step === selectedStep);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Kiosk Header */}
      <div className="bg-slate-900 border-2 border-cyan-800/80 rounded-xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/50 shrink-0">
            <HardHat className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Terminal de Chão de Fábrica · WebErpMes Kiosk
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Apontamento Operacional em Tempo Real
            </h1>
          </div>
        </div>

        {/* Operator Badge Selector */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-xs">
          <div>
            <div className="text-[10px] text-slate-400">Operador Ativo (Crachá):</div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>{operatorName}</span>
              <span className="font-mono text-cyan-400 text-[11px]">({badgeNumber})</span>
            </div>
          </div>
          <button
            onClick={() => {
              const name = prompt('Nome do Operador:', operatorName);
              if (name) setOperatorName(name);
            }}
            className="text-[11px] text-cyan-400 hover:underline font-semibold"
          >
            Trocar
          </button>
        </div>
      </div>

      {/* Main Kiosk Operational Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Work Center & Order Selectors */}
        <div className="lg:col-span-4 space-y-4">
          {/* Work Center Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Selecionar Máquina / Posto
            </label>
            <div className="space-y-1.5">
              {workCenters.map((wc) => (
                <button
                  key={wc.id}
                  disabled={isRunning}
                  onClick={() => setSelectedWorkCenterId(wc.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between ${
                    selectedWorkCenterId === wc.id
                      ? 'bg-cyan-950 border-cyan-600 text-white font-bold shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="truncate">
                    <span className="font-mono text-[10px] text-cyan-400 mr-2">{wc.code}</span>
                    <span className="truncate">{wc.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                    {wc.efficiencyOEE}% OEE
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Barcode / OP Scanner Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>2. Código de Barras / OP</span>
              <Scan className="w-4 h-4 text-cyan-400" />
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                disabled={isRunning}
                value={searchOpCode}
                onChange={(e) => setSearchOpCode(e.target.value.toUpperCase())}
                placeholder="Ex: OP-2026-0142"
                className="flex-1 bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white font-mono text-sm tracking-wider focus:border-cyan-500 focus:ring-0"
              />
            </div>

            {/* Quick OP Chips */}
            <div className="pt-1 flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-slate-500 text-[10px] w-full">OPs Disponíveis:</span>
              {productionOrders.map(o => (
                <button
                  key={o.id}
                  disabled={isRunning}
                  onClick={() => setSearchOpCode(o.orderNumber)}
                  className={`px-2.5 py-1 rounded border font-mono text-[11px] ${
                    searchOpCode === o.orderNumber
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {o.orderNumber}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Large Touch Controls & Execution Matrix */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
          {/* Active Order & Operation Banner */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {activeOrder.orderNumber}
                </span>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-xs text-slate-300 font-semibold">{activeOrder.clientName}</span>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-xs text-slate-400 font-mono">Lote: {activeOrder.lotNumber}</span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                {activeOrder.productName}
              </h2>
              <div className="text-xs text-slate-400 mt-1">
                Meta do Lote: <strong className="text-white font-mono">{activeOrder.targetQuantity} un</strong> · 
                Já Produzido: <strong className="text-emerald-400 font-mono">{activeOrder.producedQuantity} un</strong>
              </div>
            </div>

            {/* Step selector */}
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs shrink-0">
              <label className="block text-[10px] text-slate-400 mb-1">Operação do Roteiro:</label>
              <select
                disabled={isRunning}
                value={selectedStep}
                onChange={(e) => setSelectedStep(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded px-2.5 py-1"
              >
                {activeOrder.routing.map(r => (
                  <option key={r.step} value={r.step}>
                    {r.step} - {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Giant Industrial Digital Timer */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-center shadow-inner">
            <div className="text-xs uppercase font-mono tracking-widest text-slate-400">
              {isRunning
                ? isPaused
                  ? 'PAUSA DE CICLO OPERACIONAL (SETUP / AJUSTE)'
                  : 'TEMPO EM EXECUÇÃO CONTÍNUA (MÁQUINA EM TRABALHO)'
                : 'MÁQUINA AGUARDANDO INÍCIO DE OPERAÇÃO'}
            </div>

            <div className={`font-mono text-5xl sm:text-6xl font-extrabold tracking-wider my-3 ${
              isRunning
                ? isPaused
                  ? 'text-amber-400 animate-pulse'
                  : 'text-emerald-400'
                : 'text-slate-500'
            }`}>
              {formatTimer(elapsedSeconds)}
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
              <span>Posto: <strong className="text-white">{selectedWc.name}</strong></span>
              <span>·</span>
              <span>Operação: <strong className="text-cyan-400">{currentOpDetail?.name || 'Corte / Usinagem'}</strong></span>
            </div>
          </div>

          {/* Parts Counter Touch Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Good Parts Counter */}
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/60">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-2">
                <span>PEÇAS BOAS (CONFORMES)</span>
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setGoodParts(prev => Math.max(0, prev - 1))}
                  className="w-12 h-12 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-mono text-xl font-bold border border-slate-700"
                >
                  -1
                </button>
                <span className="font-mono text-4xl font-extrabold text-white">
                  {goodParts}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setGoodParts(prev => prev + 1)}
                    className="w-12 h-12 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xl font-bold shadow-md shadow-emerald-950"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => setGoodParts(prev => prev + 5)}
                    className="w-12 h-12 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-sm font-bold shadow-md"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>

            {/* Scrap Parts Counter */}
            <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/60">
              <div className="flex items-center justify-between text-xs text-rose-400 font-bold mb-2">
                <span>REFUGO / SUCATA (SCRAP)</span>
                <AlertOctagon className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setScrapParts(prev => Math.max(0, prev - 1))}
                  className="w-12 h-12 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-mono text-xl font-bold border border-slate-700"
                >
                  -1
                </button>
                <span className="font-mono text-4xl font-extrabold text-rose-400">
                  {scrapParts}
                </span>
                <button
                  onClick={() => setScrapParts(prev => prev + 1)}
                  className="w-12 h-12 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xl font-bold shadow-md shadow-rose-950"
                >
                  +1
                </button>
              </div>

              {scrapParts > 0 && (
                <div className="mt-3">
                  <label className="block text-[10px] text-slate-400 mb-1">Motivo do Refugo:</label>
                  <select
                    value={scrapReason}
                    onChange={(e) => setScrapReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded p-1.5"
                  >
                    <option value="Dimensional fora da tolerância">Dimensional fora da tolerância</option>
                    <option value="Trinca no raio de dobra">Trinca no raio de dobra</option>
                    <option value="Rebarba excessiva / Queima de laser">Rebarba excessiva / Queima de laser</option>
                    <option value="Defeito na matéria-prima">Defeito na matéria-prima</option>
                    <option value="Quebra de ferramenta CNC">Quebra de ferramenta CNC</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="col-span-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>INICIAR OPERAÇÃO NA MÁQUINA</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className={`py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    isPaused
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/50'
                  }`}
                >
                  {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
                  <span>{isPaused ? 'RETOMAR TRABALHO' : 'PAUSAR SETUP'}</span>
                </button>

                <button
                  onClick={handleFinish}
                  className="sm:col-span-2 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>CONCLUIR APONTAMENTO DE PEÇAS</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
