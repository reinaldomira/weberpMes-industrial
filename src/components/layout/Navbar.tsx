import React from 'react';
import { Settings, ShieldCheck, Factory, HardHat, BookOpen, UserCheck, LogIn, Cpu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  kioskMode: boolean;
  onToggleKiosk: () => void;
  companyName: string;
  onOpenManual?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  kioskMode,
  onToggleKiosk,
  companyName,
  onOpenManual,
  onOpenAuth,
}) => {
  const { currentUser, activeCompany, currentMember } = useAuth();
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div 
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
      >
        <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-950/40">
          <Factory className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
            WebErpMes
          </span>
          <span className="text-xs text-cyan-400 font-mono ml-2 font-normal">
            v2.4 Industrial
          </span>
        </div>
      </div>

      {/* Zone 2: 4-5 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-slate-300">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => onNavigate('quotes')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'quotes' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Cotações & Custos
        </button>
        <button
          onClick={() => onNavigate('production')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'production' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          PCP & Ordens
        </button>
        <button
          onClick={() => onNavigate('engineering')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'engineering' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Engenharia & BOM
        </button>
        <button
          onClick={() => onNavigate('machines')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'machines' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Máquinas & Custos
        </button>
        <button
          onClick={() => onNavigate('customizer')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'customizer' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Personalizar Fábrica
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 border ${
              currentUser
                ? 'bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border-emerald-800'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={
              currentUser 
                ? `${currentUser.email} • ${activeCompany ? `${activeCompany.name} (${currentMember?.role === 'admin' ? 'Admin' : 'Membro'})` : 'Sem empresa vinculada'}` 
                : 'Entrar no Sistema'
            }
          >
            {currentUser ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[110px] font-mono">{currentUser.email?.split('@')[0]}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>Entrar</span>
              </>
            )}
          </button>
        )}

        {onOpenManual && (
          <button
            onClick={onOpenManual}
            className="px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 hover:border-cyan-500/50"
            title="Abrir Manual de Instruções Completo"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Manual do App</span>
          </button>
        )}

        <button
          onClick={onToggleKiosk}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
            kioskMode
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>{kioskMode ? 'Sair do Modo Kiosk' : 'Terminal Chão de Fábrica'}</span>
        </button>
      </div>
    </header>
  );
};
