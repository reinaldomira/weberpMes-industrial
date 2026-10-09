import React from 'react';
import { 
  Activity, 
  Clock, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowRight,
  HardHat,
  Cpu,
  BarChart3,
  Calendar,
  Sparkles,
  Wrench
} from 'lucide-react';
import { WorkCenter, ProductionOrder, Quote, ToolingOS } from '../../types/industrial';

interface OverviewDashboardProps {
  workCenters: WorkCenter[];
  productionOrders: ProductionOrder[];
  quotes: Quote[];
  toolingOrders?: ToolingOS[];
  onNavigate: (tab: string) => void;
  onOpenOrder: (order: ProductionOrder) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  workCenters,
  productionOrders,
  quotes,
  toolingOrders = [],
  onNavigate,
  onOpenOrder,
}) => {
  // Calculations
  const activeOrders = productionOrders.filter(o => o.status === 'in_progress' || o.status === 'quality_check');
  const urgentOrders = productionOrders.filter(o => o.priority === 'urgent' && o.status !== 'completed');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const activeToolingOS = toolingOrders.filter(o => o.status !== 'concluida' && o.status !== 'cancelada');
  const delayedToolingOS = toolingOrders.filter(o => o.status !== 'concluida' && o.status !== 'cancelada' && o.dueDate < todayStr);
  const blockedToolingOS = toolingOrders.filter(o => o.posList.some(p => p.routing.some(r => r.status === 'bloqueada')));
  
  const averageOEE = workCenters.length > 0
    ? Math.round(workCenters.reduce((acc, wc) => acc + wc.efficiencyOEE, 0) / workCenters.length)
    : 0;

  const totalBacklogValue = quotes
    .filter(q => q.status === 'approved' || q.status === 'converted')
    .reduce((acc, q) => acc + q.totalQuotedPrice, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome with Quick Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              Painel de Controle de Manufatura
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs text-slate-400">Turno Ativo: 1º Turno (06:00 - 15:48)</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">
            Cockpit Operacional ERP & MES Industrial
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Acompanhamento em tempo real de ocupação de máquinas, apontamento de chão de fábrica, ordens de produção e eficiência global OEE.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('quotes')}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors flex items-center gap-2"
          >
            <span>Simulador de Custos</span>
          </button>
          <button
            onClick={() => onNavigate('mes_kiosk')}
            className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors flex items-center gap-2 shadow-sm"
          >
            <HardHat className="w-4 h-4" />
            <span>Terminal Chão de Fábrica</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: OEE */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>OEE Global da Planta</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {averageOEE}%
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              +2.4% vs meta
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Disp: 89% · Desemp: 92% · Qualidade: 98.8%
          </div>
        </div>

        {/* KPI 2: Tooling OS & Production Orders */}
        <div 
          onClick={() => onNavigate('production')}
          className="bg-slate-900 border border-slate-800 rounded-lg p-4 cursor-pointer hover:border-cyan-700/80 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ordens de Serviço (OS)</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {activeToolingOS.length}
            </span>
            <span className="text-xs text-slate-400">
              de {toolingOrders.length} OS ativas
            </span>
          </div>
          <div className="mt-2 text-[11px] flex items-center justify-between">
            <span className={delayedToolingOS.length > 0 ? "text-rose-400 font-semibold" : "text-emerald-400"}>
              {delayedToolingOS.length > 0 ? `⚠️ ${delayedToolingOS.length} atrasada(s)` : 'Prazos em dia'}
            </span>
            {blockedToolingOS.length > 0 && (
              <span className="text-amber-400 font-semibold text-[10px]">
                ⛔ {blockedToolingOS.length} c/ bloqueio
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Machine Availability */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Postos Operacionais Ativos</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {workCenters.filter(w => w.status === 'in_production').length} / {workCenters.length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              Em usinagem/corte
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            1 posto ocioso · 0 em manutenção corretiva
          </div>
        </div>

        {/* KPI 4: Backlog Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Carteira de Fabricação</span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              R$ {totalBacklogValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Taxa de entrega no prazo (OTIF):</span>
            <span className="text-emerald-400 font-semibold font-mono">97.2%</span>
          </div>
        </div>
      </div>

      {/* Work Centers / Machines Live Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">
              Status das Máquinas e Centros de Trabalho
            </h2>
            <p className="text-xs text-slate-400">
              Monitoramento direto de telemetria dos postos operacionais e taxas horárias de absorção.
            </p>
          </div>
          <button
            onClick={() => onNavigate('production')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <span>Ver Gantt de Capacidade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {workCenters.map((wc) => {
            const isProd = wc.status === 'in_production';
            const isMaint = wc.status === 'maintenance';
            return (
              <div
                key={wc.id}
                className="bg-slate-950/60 border border-slate-800/90 rounded p-3.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {wc.code}
                    </span>
                    <h3 className="text-xs font-bold text-white mt-1.5 truncate" title={wc.name}>
                      {wc.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                      isProd
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : isMaint
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isProd ? 'Em Produção' : isMaint ? 'Manutenção' : 'Disponível'}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Ordem em Execução:</span>
                    <span className="font-mono text-cyan-300 font-semibold">
                      {wc.currentOrderCode || 'Sem OP ativa'}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Operador Alocado:</span>
                    <span className="text-slate-200 truncate max-w-[140px]">
                      {wc.currentOperator || 'Aguardando login'}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Taxa Horária:</span>
                    <span className="font-mono text-slate-300">
                      R$ {wc.hourlyRate.toFixed(2)} /h
                    </span>
                  </div>

                  {/* Machine OEE Mini Bar */}
                  <div className="mt-2 pt-1">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">OEE Máquina:</span>
                      <span className="font-mono text-white font-semibold">
                        {wc.efficiencyOEE}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          wc.efficiencyOEE >= 85
                            ? 'bg-emerald-500'
                            : wc.efficiencyOEE >= 75
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${wc.efficiencyOEE}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooling Orders (OS & POS) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>Ordens de Serviço de Ferramentaria (OS & POS)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Acompanhamento de fabricação de moldes, matrizes, dispositivos e peças usinadas.
            </p>
          </div>
          <button
            onClick={() => onNavigate('production')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Abrir Central de OS
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {toolingOrders.length > 0 ? (
            toolingOrders.map((os) => {
              const plannedH = os.posList.reduce((acc, p) => acc + p.plannedHours, 0);
              const actualH = os.posList.reduce((acc, p) => acc + p.actualHours, 0);
              const progress = plannedH > 0 ? Math.min(100, Math.round((actualH / plannedH) * 100)) : 0;
              const isDelayed = os.status !== 'concluida' && os.status !== 'cancelada' && os.dueDate < todayStr;
              const hasBlocked = os.posList.some(p => p.routing.some(r => r.status === 'bloqueada'));

              return (
                <div
                  key={os.id}
                  className="py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-850/40 px-2 rounded transition-colors"
                >
                  <div className="space-y-1 min-w-[300px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-cyan-400">{os.osNumber}</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-xs font-semibold text-white">{os.clientName}</span>
                      {isDelayed && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                          ATRASADA
                        </span>
                      )}
                      {hasBlocked && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                          BLOQUEIO
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white font-medium">{os.toolingProject}</div>
                    <div className="text-[11px] text-slate-400">
                      <span>Prazo: {os.dueDate}</span>
                      <span className="text-slate-600"> · </span>
                      <span>Resp: {os.responsible}</span>
                      <span className="text-slate-600"> · </span>
                      <span className="text-cyan-300 font-mono">{os.posList.length} POS vinculadas</span>
                    </div>
                  </div>

                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Horas:</span>
                      <span className="font-mono text-white font-semibold">
                        {actualH.toFixed(1)}h / {plannedH.toFixed(1)}h ({progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onNavigate('production')}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                    >
                      Ver POS & Roteiro
                    </button>
                    <button
                      onClick={() => onNavigate('mes_kiosk')}
                      className="px-3 py-1.5 text-xs bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-700 rounded transition-colors"
                    >
                      Apontar
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              Nenhuma Ordem de Serviço cadastrada. Clique em "Abrir Central de OS" para cadastrar a primeira OS da ferramentaria.
            </div>
          )}
        </div>
      </div>

      {/* Production Orders In Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">
              Ordens de Produção Ativas no Fluxo Fabril
            </h2>
            <p className="text-xs text-slate-400">
              Acompanhamento de avanço das etapas de roteiro por posto de trabalho.
            </p>
          </div>
          <button
            onClick={() => onNavigate('production')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Gerenciar Todas as OPs
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {productionOrders.length > 0 ? (
            productionOrders.map((order) => {
            const progress = Math.round((order.producedQuantity / order.targetQuantity) * 100);
            return (
              <div
                key={order.id}
                className="py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-850/40 px-2 rounded transition-colors"
              >
                <div className="space-y-1 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-cyan-400">
                      {order.orderNumber}
                    </span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-xs text-slate-300 font-medium">
                      {order.clientName}
                    </span>
                    {order.priority === 'urgent' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        URGENTE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white font-medium">
                    {order.productName}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Lote: {order.lotNumber}</span>
                    <span>·</span>
                    <span>Prazo: {order.dueDate}</span>
                  </div>
                </div>

                {/* Routing Operations Progress */}
                <div className="flex-1 max-w-md">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Roteiro de Operações:</span>
                    <span className="font-mono text-white font-semibold">
                      {order.producedQuantity} / {order.targetQuantity} un ({progress}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {order.routing.map((op) => {
                      const isDone = op.status === 'completed';
                      const isCurrent = op.status === 'in_progress';
                      return (
                        <div
                          key={op.step}
                          className={`p-1.5 rounded text-[10px] border text-center truncate ${
                            isDone
                              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                              : isCurrent
                              ? 'bg-cyan-950/90 border-cyan-700 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                          title={`${op.step} - ${op.name} (${op.workCenterName})`}
                        >
                          <div className="font-mono">{op.step}</div>
                          <div className="truncate">{op.name.split(' ')[0]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenOrder(order)}
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                  >
                    Detalhes da OP
                  </button>
                  <button
                    onClick={() => onNavigate('mes_kiosk')}
                    className="px-3 py-1.5 text-xs bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-700 rounded transition-colors"
                  >
                    Apontar
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            Nenhuma Ordem de Produção ativa no fluxo fabril.
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
