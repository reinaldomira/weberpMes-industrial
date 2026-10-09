import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Pause, 
  CheckSquare, 
  ChevronRight,
  Layers,
  ArrowRight,
  QrCode,
  HardHat
} from 'lucide-react';
import { ProductionOrder, WorkCenter, Product } from '../../types/industrial';

interface ProductionSchedulerProps {
  productionOrders: ProductionOrder[];
  workCenters: WorkCenter[];
  products: Product[];
  onUpdateOrderStatus: (orderId: string, status: ProductionOrder['status']) => void;
  onOpenKioskWithOrder: (orderNumber: string) => void;
  onAddNewOrder: (newOrder: ProductionOrder) => void;
}

export const ProductionScheduler: React.FC<ProductionSchedulerProps> = ({
  productionOrders,
  workCenters,
  products,
  onUpdateOrderStatus,
  onOpenKioskWithOrder,
  onAddNewOrder,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(productionOrders[0] || null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New OP Form State
  const [newOrderProductCode, setNewOrderProductCode] = useState(products[0]?.code || '');
  const [newOrderClient, setNewOrderClient] = useState('');
  const [newOrderQuantity, setNewOrderQuantity] = useState(50);
  const [newOrderDueDate, setNewOrderDueDate] = useState('2026-10-25');
  const [newOrderPriority, setNewOrderPriority] = useState<'low' | 'normal' | 'urgent'>('normal');

  const filteredOrders = productionOrders.filter(o => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.code === newOrderProductCode) || products[0];
    const opNumber = `OP-2026-0${Math.floor(150 + Math.random() * 800)}`;
    const pvNumber = `PV-2026-0${Math.floor(100 + Math.random() * 800)}`;

    const newOrder: ProductionOrder = {
      id: `op-${Date.now()}`,
      orderNumber: opNumber,
      salesOrderNumber: pvNumber,
      clientName: newOrderClient || 'Cliente Geral Industrial',
      productCode: prod.code,
      productName: prod.name,
      targetQuantity: newOrderQuantity,
      producedQuantity: 0,
      scrapQuantity: 0,
      status: 'released',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: newOrderDueDate,
      priority: newOrderPriority,
      currentOperationStep: prod.routing[0]?.step || 10,
      lotNumber: `LOT-2026-${opNumber.replace('OP-', '')}`,
      routing: prod.routing.map(r => ({
        step: r.step,
        name: r.name,
        workCenterId: r.workCenterId,
        workCenterName: r.workCenterName,
        status: 'pending',
        plannedMinutes: Math.round(r.setupTimeMinutes + r.cycleTimeMinutesPerUnit * newOrderQuantity),
        actualMinutes: 0
      }))
    };

    onAddNewOrder(newOrder);
    setSelectedOrder(newOrder);
    setIsNewOrderModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              PCP & Programação de Ordens de Produção (OP)
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              MES Work Orders
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Planejamento sequencial de fabricação, controle de avanço por posto e alocação de capacidade.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lista de OPs
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1.5 rounded transition-colors ${
                viewMode === 'gantt' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cronograma Gantt
            </button>
          </div>

          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors flex items-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Nova OP</span>
          </button>
        </div>
      </div>

      {/* Filter Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded w-fit text-xs font-medium">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded transition-colors ${
            statusFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Todas as OPs ({productionOrders.length})
        </button>
        <button
          onClick={() => setStatusFilter('released')}
          className={`px-3 py-1.5 rounded transition-colors ${
            statusFilter === 'released' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Liberadas
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-3 py-1.5 rounded transition-colors ${
            statusFilter === 'in_progress' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Em Produção
        </button>
        <button
          onClick={() => setStatusFilter('quality_check')}
          className={`px-3 py-1.5 rounded transition-colors ${
            statusFilter === 'quality_check' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Inspeção / Qualidade
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3 py-1.5 rounded transition-colors ${
            statusFilter === 'completed' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Concluídas
        </button>
      </div>

      {/* View Mode: List vs Gantt */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Orders Table */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                Ordens Programadas
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {filteredOrders.length} ordens
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                const isUrgent = order.priority === 'urgent';
                const progress = Math.round((order.producedQuantity / order.targetQuantity) * 100);

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-800/80 border-l-2 border-cyan-500' : 'hover:bg-slate-850/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-cyan-400">
                            {order.orderNumber}
                          </span>
                          <span className="text-slate-600 text-xs">·</span>
                          <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                            {order.clientName}
                          </span>
                          {isUrgent && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              URGENTE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-300 font-medium mt-1">
                          {order.productName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                          <span>PV: {order.salesOrderNumber}</span>
                          <span>·</span>
                          <span>Lote: {order.lotNumber}</span>
                          <span>·</span>
                          <span>Entrega: {order.dueDate}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                          order.status === 'in_progress'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : order.status === 'quality_check'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : order.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {order.status === 'in_progress'
                          ? 'Em Produção'
                          : order.status === 'quality_check'
                          ? 'Metrologia'
                          : order.status === 'completed'
                          ? 'Concluída'
                          : 'Liberada'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">
                          Produzido: <strong className="text-white font-mono">{order.producedQuantity} / {order.targetQuantity} un</strong>
                          {order.scrapQuantity > 0 && (
                            <span className="text-rose-400 ml-2 font-mono">({order.scrapQuantity} refugo)</span>
                          )}
                        </span>
                        <span className="text-cyan-400 font-mono font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Order Detail Panel */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5">
            {selectedOrder ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="font-mono text-sm font-bold text-cyan-400">
                      {selectedOrder.orderNumber}
                    </span>
                    <h2 className="text-base font-bold text-white mt-1">
                      {selectedOrder.productName}
                    </h2>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {selectedOrder.clientName} (Lote: {selectedOrder.lotNumber})
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenKioskWithOrder(selectedOrder.orderNumber)}
                    className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <HardHat className="w-3.5 h-3.5" />
                    <span>Apontar no Kiosk</span>
                  </button>
                </div>

                {/* Status Switcher */}
                <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status Operacional:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => onUpdateOrderStatus(selectedOrder.id, e.target.value as ProductionOrder['status'])}
                    className="bg-slate-900 border border-slate-700 text-white rounded px-2.5 py-1 text-xs"
                  >
                    <option value="planned">Planejada</option>
                    <option value="released">Liberada para Fábrica</option>
                    <option value="in_progress">Em Produção</option>
                    <option value="paused">Pausada</option>
                    <option value="quality_check">Em Inspeção de Qualidade</option>
                    <option value="completed">Concluída / Embalada</option>
                  </select>
                </div>

                {/* Routing Operations Breakdown */}
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5">
                    Etapas do Roteiro nesta OP
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.routing.map((op) => {
                      const isCompleted = op.status === 'completed';
                      const isInProgress = op.status === 'in_progress';
                      return (
                        <div
                          key={op.step}
                          className={`p-3 rounded border text-xs flex items-center justify-between ${
                            isCompleted
                              ? 'bg-emerald-950/40 border-emerald-800 text-slate-300'
                              : isInProgress
                              ? 'bg-cyan-950/70 border-cyan-700 text-white font-medium'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-mono font-bold text-[11px] text-cyan-300">
                              {op.step}
                            </span>
                            <div>
                              <div className="font-semibold text-white">{op.name}</div>
                              <div className="text-[11px] text-slate-400">
                                {op.workCenterName}
                                {op.operatorName && ` · Operador: ${op.operatorName}`}
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-mono text-[11px]">
                            <div className={isCompleted ? 'text-emerald-400' : 'text-slate-300'}>
                              {op.actualMinutes > 0 ? `${op.actualMinutes} min reais` : `${op.plannedMinutes} min previstos`}
                            </div>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                isCompleted
                                  ? 'bg-emerald-900/60 text-emerald-300'
                                  : isInProgress
                                  ? 'bg-cyan-900/60 text-cyan-300'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {isCompleted ? 'Concluída' : isInProgress ? 'Em Execução' : 'Fila'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Selecione uma OP para ver detalhes.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Gantt / Finite Capacity Schedule Visualizer */
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">
                Cronograma Visual de Carga de Máquinas (Gantt)
              </h2>
              <p className="text-xs text-slate-400">
                Alocação temporal das operações de fabricação pelos postos operacionais.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400">
              Hoje: 09/Out/2026
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {workCenters.map((wc) => {
              const assignedOps = productionOrders.flatMap(o => 
                o.routing.filter(r => r.workCenterId === wc.id).map(r => ({ ...r, orderNumber: o.orderNumber, priority: o.priority }))
              );

              return (
                <div key={wc.id} className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {wc.code}
                      </span>
                      <span className="font-semibold text-white">{wc.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Capacidade: {wc.capacityHoursPerDay}h/dia · OEE: {wc.efficiencyOEE}%
                    </span>
                  </div>

                  {/* Gantt Timeline Bar */}
                  <div className="grid grid-cols-6 gap-1 bg-slate-900/80 p-1.5 rounded border border-slate-850 min-h-[44px] items-center">
                    {assignedOps.length > 0 ? (
                      assignedOps.map((op, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded text-[10px] font-mono border truncate cursor-pointer transition-transform hover:scale-[1.02] ${
                            op.status === 'completed'
                              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                              : op.status === 'in_progress'
                              ? 'bg-cyan-900/90 border-cyan-600 text-white font-bold'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                          title={`${op.orderNumber} - Etapa ${op.step}: ${op.name} (${op.plannedMinutes} min)`}
                        >
                          <div className="font-bold truncate">{op.orderNumber}</div>
                          <div className="truncate text-[9px] text-slate-300">
                            Etapa {op.step} ({op.plannedMinutes}m)
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-6 text-center text-slate-600 text-xs py-1">
                        Nenhuma ordem alocada nesta janela de programação
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">
                Emitir Nova Ordem de Produção (OP)
              </h2>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Produto a Fabricar</label>
                <select
                  value={newOrderProductCode}
                  onChange={(e) => setNewOrderProductCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                >
                  {products.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cliente / Destino</label>
                <input
                  type="text"
                  required
                  value={newOrderClient}
                  onChange={(e) => setNewOrderClient(e.target.value)}
                  placeholder="Ex: Siemens Energy Brasil"
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Quantidade do Lote</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newOrderQuantity}
                    onChange={(e) => setNewOrderQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Data Prometida (Due Date)</label>
                  <input
                    type="date"
                    required
                    value={newOrderDueDate}
                    onChange={(e) => setNewOrderDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Prioridade Fabril</label>
                <select
                  value={newOrderPriority}
                  onChange={(e) => setNewOrderPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgente (Linha Parada / Prioridade Máxima)</option>
                  <option value="low">Baixa</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  Liberar Ordem para Fábrica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
