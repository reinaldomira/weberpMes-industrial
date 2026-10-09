import React from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  Layers, 
  CalendarClock, 
  HardHat, 
  Boxes, 
  ClipboardCheck, 
  Wrench, 
  Sliders,
  FileCode,
  Flame,
  CheckCircle2,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { IndustryProfileConfig } from '../../types/industrial';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  config: IndustryProfileConfig;
  activeOrdersCount: number;
  urgentOrdersCount: number;
  onOpenManual?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  config,
  activeOrdersCount,
  urgentOrdersCount,
  onOpenManual,
}) => {
  const getIndustryBadge = () => {
    switch (config.profileId) {
      case 'sheet_metal':
        return 'Caldeiraria & Laser';
      case 'cnc_machining':
        return 'Usinagem de Precisão CNC';
      case 'molds_tooling':
        return 'Moldes & Matrizes';
      case 'plastic_injection':
        return 'Injeção Plástica';
      default:
        return 'Montagem Industrial';
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Cockpit & OEE',
      icon: LayoutDashboard,
      badge: null,
      enabled: true,
    },
    {
      id: 'quotes',
      label: 'Cotações & Custos',
      icon: Calculator,
      badge: '3 Ativas',
      enabled: config.modulesEnabled.quotes,
    },
    {
      id: 'engineering',
      label: 'Engenharia, BOM & CAD',
      icon: Layers,
      badge: null,
      enabled: config.modulesEnabled.engineeringBom,
    },
    {
      id: 'production',
      label: 'PCP & Ordens (OP)',
      icon: CalendarClock,
      badge: `${activeOrdersCount} OPs`,
      badgeAlert: urgentOrdersCount > 0,
      enabled: config.modulesEnabled.productionScheduler,
    },
    {
      id: 'mes_kiosk',
      label: 'Chão de Fábrica (MES)',
      icon: HardHat,
      badge: 'Ao Vivo',
      badgeLive: true,
      enabled: config.modulesEnabled.shopFloorKiosk,
    },
    {
      id: 'inventory',
      label: 'Estoque & Lotes',
      icon: Boxes,
      badge: null,
      enabled: config.modulesEnabled.inventoryLots,
    },
    {
      id: 'quality',
      label: 'Qualidade & RNC',
      icon: ClipboardCheck,
      badge: '1 RNC',
      badgeWarning: true,
      enabled: config.modulesEnabled.qualityControl,
    },
    {
      id: 'maintenance',
      label: 'Manutenção (TPM)',
      icon: Wrench,
      badge: null,
      enabled: config.modulesEnabled.preventiveMaintenance,
    },
    {
      id: 'customizer',
      label: 'Personalizar Fábrica',
      icon: Sliders,
      badge: 'Custom',
      enabled: true,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Factory Profile Indicator */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Perfil de Manufatura
        </div>
        <div className="text-sm font-semibold text-white truncate flex items-center justify-between">
          <span className="truncate">{config.companyName}</span>
        </div>
        <div className="mt-2 text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 rounded px-2.5 py-1 font-mono flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{getIndustryBadge()}</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
          Módulos Operacionais
        </div>
        {navItems
          .filter((item) => item.enabled)
          .map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-600/40 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                      item.badgeLive
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold'
                        : item.badgeAlert
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : item.badgeWarning
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* System Status Footer */}
      <div className="p-3.5 border-t border-slate-800 text-[11px] text-slate-300 bg-slate-950/40 space-y-2">
        {onOpenManual && (
          <button
            onClick={onOpenManual}
            className="w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/60 font-semibold transition-all hover:border-cyan-500 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Manual do Usuário</span>
          </button>
        )}
        <div className="flex items-center justify-between pt-1">
          <span>Servidor MES:</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Sincronizado
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span>Moeda Padrão:</span>
          <span className="font-mono text-slate-200">{config.currency} (R$)</span>
        </div>
      </div>
    </aside>
  );
};
