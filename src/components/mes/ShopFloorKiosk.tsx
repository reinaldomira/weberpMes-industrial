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
  RotateCcw,
  Wrench,
  Layers,
  Building2
} from 'lucide-react';
import { 
  ProductionOrder, 
  WorkCenter, 
  ShopFloorTimeEntry,
  ToolingOS,
  ToolingTimeEntry 
} from '../../types/industrial';

interface ShopFloorKioskProps {
  productionOrders: ProductionOrder[];
  workCenters: WorkCenter[];
  activeOrderNumber?: string;
  toolingOrders?: ToolingOS[];
  onLogProduction: (entry: ShopFloorTimeEntry) => void;
  onAddToolingTimeEntry?: (entry: ToolingTimeEntry) => boolean | void;
  onUpdateWorkCenterStatus: (wcId: string, status: WorkCenter['status'], orderCode?: string, opName?: string) => void;
}

export const ShopFloorKiosk: React.FC<ShopFloorKioskProps> = ({
  productionOrders,
  workCenters,
  activeOrderNumber,
  toolingOrders = [],
  onLogProduction,
  onAddToolingTimeEntry,
  onUpdateWorkCenterStatus,
}) => {
  // Target type: 'tooling_os' vs 'series_op'
  const isInitialTooling = activeOrderNumber?.startsWith('OS-') || activeOrderNumber?.startsWith('POS-') || toolingOrders.length > 0;
  const [kioskType, setKioskType] = useState<'tooling_os' | 'series_op'>(isInitialTooling ? 'tooling_os' : 'series_op');

  // Operator state
  const [operatorName, setOperatorName] = useState('Ricardo Lima (Fresador CNC)');
  const [badgeNumber, setBadgeNumber] = useState('FERR-302');

  // Workcenter selection
  const [selectedWorkCenterId, setSelectedWorkCenterId] = useState(workCenters[0]?.id || '');
  const selectedWc = workCenters.find(w => w.id === selectedWorkCenterId) || workCenters[0];

  // Tooling selection state
  const initialToolingOS = toolingOrders.find(o => o.osNumber === activeOrderNumber) || toolingOrders[0];
  const [selectedOSId, setSelectedOSId] = useState<string>(initialToolingOS?.id || '');
  const activeToolingOS = toolingOrders.find(o => o.id === selectedOSId) || toolingOrders[0];

  const [selectedPOSId, setSelectedPOSId] = useState<string>(activeToolingOS?.posList[0]?.id || '');
  const activeToolingPOS = activeToolingOS?.posList.find(p => p.id === selectedPOSId) || activeToolingOS?.posList[0];

  const [selectedToolingStepOrder, setSelectedToolingStepOrder] = useState<number>(
    activeToolingPOS?.routing[0]?.stepOrder || 1
  );

  // Series Order selection
  const [searchOpCode, setSearchOpCode] = useState(activeOrderNumber || productionOrders[0]?.orderNumber || '');
  const activeOrder = productionOrders.find(o => o.orderNumber === searchOpCode) || productionOrders[0];
  const [selectedStep, setSelectedStep] = useState<number>(activeOrder?.currentOperationStep || 10);

  // Active Running state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Parts counters (Series mode)
  const [goodParts, setGoodParts] = useState(0);
  const [scrapParts, setScrapParts] = useState(0);
  const [scrapReason, setScrapReason] = useState('Dimensional fora da tolerância');

  // Tooling service note
  const [serviceDescription, setServiceDescription] = useState('Execução de usinagem e ajuste na máquina.');

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

  // Sync POS when OS changes
  useEffect(() => {
    if (activeToolingOS && activeToolingOS.posList.length > 0) {
      setSelectedPOSId(activeToolingOS.posList[0].id);
      setSelectedToolingStepOrder(activeToolingOS.posList[0].routing[0]?.stepOrder || 1);
    }
  }, [activeToolingOS?.id]);

  // Sync Step when POS changes
  useEffect(() => {
    if (activeToolingPOS && activeToolingPOS.routing.length > 0) {
      setSelectedToolingStepOrder(activeToolingPOS.routing[0].stepOrder);
    }
  }, [activeToolingPOS?.id]);

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    const targetCode = kioskType === 'tooling_os' && activeToolingOS 
      ? `${activeToolingOS.osNumber} (${activeToolingPOS?.posNumber || ''})`
      : activeOrder.orderNumber;
    onUpdateWorkCenterStatus(selectedWc.id, 'in_production', targetCode, operatorName);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleFinish = () => {
    if (kioskType === 'tooling_os' && activeToolingOS && activeToolingPOS) {
      const activeStep = activeToolingPOS.routing.find(r => r.stepOrder === selectedToolingStepOrder);
      // Apontamentos com duração de até 60s (finalizados no mesmo minuto) utilizam o intervalo mínimo válido
      // de 1 minuto no formato HH:mm, correspondendo a aproximadamente 0,0167h (1/60h),
      // garantindo que não sejam artificialmente inflados para 0,1h (que equivaleria a 6 minutos).
      const effectiveHours = elapsedSeconds <= 60
        ? 0.0167
        : Number((elapsedSeconds / 3600).toFixed(2));

      const now = new Date();
      let startTime = new Date(now.getTime() - Math.max(60, elapsedSeconds) * 1000);
      let startStr = startTime.toTimeString().substring(0, 5);
      let endStr = now.toTimeString().substring(0, 5);

      if (startStr >= endStr) {
        const adjustedEnd = new Date(now.getTime() + 60000);
        endStr = adjustedEnd.toTimeString().substring(0, 5);
      }

      const entry: ToolingTimeEntry = {
        id: `te-${Date.now()}`,
        osId: activeToolingOS.id,
        osNumber: activeToolingOS.osNumber,
        posId: activeToolingPOS.id,
        posNumber: activeToolingPOS.posNumber,
        stepOrder: selectedToolingStepOrder,
        processName: activeStep?.processName || 'Usinagem / Ajuste',
        employeeName: operatorName,
        workCenterName: selectedWc.name,
        date: now.toISOString().split('T')[0],
        startTime: startStr,
        endTime: endStr,
        effectiveHours,
        description: serviceDescription || `Operação executada no posto ${selectedWc.code}.`
      };

      if (onAddToolingTimeEntry) {
        const result = (onAddToolingTimeEntry as any)(entry);
        if (result === false) {
          return;
        }
      }
      onUpdateWorkCenterStatus(selectedWc.id, 'operational');

      alert(`Apontamento da OS ${activeToolingOS.osNumber} / ${activeToolingPOS.posNumber} registrado com sucesso!\nTempo efetivo: ${effectiveHours}h.`);

      setIsRunning(false);
      setIsPaused(false);
      setElapsedSeconds(0);
      return;
    }

    // Series OP mode finish
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

    alert(`Apontamento da OP ${activeOrder.orderNumber} registrado com sucesso!\n${goodParts} peças boas gravadas.`);

    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setGoodParts(0);
    setScrapParts(0);
  };

  const currentOpDetail = activeOrder?.routing.find(r => r.step === selectedStep);
  const currentToolingStep = activeToolingPOS?.routing.find(r => r.stepOrder === selectedToolingStepOrder);

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

        {/* Mode switcher & Operator Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setKioskType('tooling_os')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                kioskType === 'tooling_os' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Ferramentaria (OS/POS)</span>
            </button>
            <button
              onClick={() => setKioskType('series_op')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                kioskType === 'series_op' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Produção Seriada (OP)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Operador:</div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{operatorName.split(' ')[0]}</span>
                <span className="font-mono text-cyan-400 text-[10px]">({badgeNumber})</span>
              </div>
            </div>
            <button
              onClick={() => {
                const name = prompt('Nome do Operador:', operatorName);
                if (name) setOperatorName(name);
              }}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              Trocar
            </button>
          </div>
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
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
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

          {/* Ferramentaria (OS & POS) Selector */}
          {kioskType === 'tooling_os' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>2. Ordem de Serviço (OS) & Peça (POS)</span>
                <Wrench className="w-4 h-4 text-cyan-400" />
              </label>

              {/* OS Select */}
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Ordem de Serviço (OS):</label>
                <select
                  disabled={isRunning}
                  value={selectedOSId}
                  onChange={(e) => setSelectedOSId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-white font-mono text-xs rounded p-2"
                >
                  {toolingOrders.map(os => (
                    <option key={os.id} value={os.id}>
                      {os.osNumber} - {os.clientName} ({os.toolingProject})
                    </option>
                  ))}
                </select>
              </div>

              {/* POS Select */}
              {activeToolingOS && activeToolingOS.posList.length > 0 && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Peça / Componente (POS):</label>
                  <select
                    disabled={isRunning}
                    value={selectedPOSId}
                    onChange={(e) => setSelectedPOSId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 text-white font-mono text-xs rounded p-2"
                  >
                    {activeToolingOS.posList.map(pos => (
                      <option key={pos.id} value={pos.id}>
                        {pos.posNumber} - {pos.partName} ({pos.plannedHours}h prev.)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            /* Series OP Barcode / OP Scanner */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>2. Código de Barras / OP</span>
                <Scan className="w-4 h-4 text-cyan-400" />
              </label>

              <input
                type="text"
                disabled={isRunning}
                value={searchOpCode}
                onChange={(e) => setSearchOpCode(e.target.value.toUpperCase())}
                placeholder="Ex: OP-2026-0142"
                className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white font-mono text-sm tracking-wider focus:border-cyan-500 focus:ring-0"
              />
            </div>
          )}
        </div>

        {/* Right Column: Execution Controls & Giant Timer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
          {/* Active Workpiece Information Banner */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            {kioskType === 'tooling_os' && activeToolingOS && activeToolingPOS ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-400">{activeToolingOS.osNumber}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-200 font-semibold">{activeToolingOS.clientName}</span>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono text-cyan-300 font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                    {activeToolingPOS.posNumber}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1">
                  {activeToolingPOS.partName}
                </h2>
                <div className="text-slate-400 mt-0.5">
                  Projeto: <strong className="text-slate-200">{activeToolingOS.toolingProject}</strong> · 
                  Horas: <strong className="text-emerald-400 font-mono">{activeToolingPOS.actualHours}h</strong> / {activeToolingPOS.plannedHours}h
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-400">{activeOrder.orderNumber}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-200 font-semibold">{activeOrder.clientName}</span>
                </div>
                <h2 className="text-base font-bold text-white mt-1">
                  {activeOrder.productName}
                </h2>
              </div>
            )}

            {/* Step Selection in Kiosk */}
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 shrink-0">
              <label className="block text-[10px] text-slate-400 mb-1">Etapa do Roteiro:</label>
              {kioskType === 'tooling_os' && activeToolingPOS ? (
                <select
                  disabled={isRunning}
                  value={selectedToolingStepOrder}
                  onChange={(e) => setSelectedToolingStepOrder(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded px-2.5 py-1"
                >
                  {activeToolingPOS.routing.map(r => (
                    <option key={r.id} value={r.stepOrder}>
                      Etapa {r.stepOrder}: {r.processName}
                    </option>
                  ))}
                </select>
              ) : (
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
              )}
            </div>
          </div>

          {/* Giant Industrial Digital Timer */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-center shadow-inner">
            <div className="text-xs uppercase font-mono tracking-widest text-slate-400">
              {isRunning
                ? isPaused
                  ? 'PAUSA DE OPERAÇÃO (SETUP / TROCA DE FERRAMENTA)'
                  : 'MÁQUINA EM OPERAÇÃO CONTÍNUA (CRONÔMETRO ATIVO)'
                : 'AGUARDANDO INÍCIO DA OPERAÇÃO'}
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
              <span>Etapa: <strong className="text-cyan-400">
                {kioskType === 'tooling_os' ? currentToolingStep?.processName : currentOpDetail?.name}
              </strong></span>
            </div>
          </div>

          {/* Description input during Tooling Execution */}
          {kioskType === 'tooling_os' && (
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Descrição do Trabalho Executado no Chão de Fábrica:
              </label>
              <input
                type="text"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Ex: Desbaste de cavidades, retificação de face plana, alinhamento..."
                className="w-full bg-slate-950 border border-slate-750 text-white text-xs rounded p-2"
              />
            </div>
          )}

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
                  <span>CONCLUIR APONTAMENTO DE HORAS</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
