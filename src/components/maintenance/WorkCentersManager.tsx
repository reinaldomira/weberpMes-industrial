import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Clock, 
  Activity, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench,
  Building2,
  X,
  RotateCcw
} from 'lucide-react';
import { WorkCenter } from '../../types/industrial';

interface WorkCentersManagerProps {
  workCenters: WorkCenter[];
  onAddWorkCenter: (newWc: WorkCenter) => void;
  onUpdateWorkCenter: (updatedWc: WorkCenter) => void;
  onDeleteWorkCenter?: (wcId: string) => void;
}

export const WorkCentersManager: React.FC<WorkCentersManagerProps> = ({
  workCenters,
  onAddWorkCenter,
  onUpdateWorkCenter,
  onDeleteWorkCenter,
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWc, setEditingWc] = useState<WorkCenter | null>(null);
  const [wcToDelete, setWcToDelete] = useState<WorkCenter | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WorkCenter['category']>('machining');
  const [hourlyRate, setHourlyRate] = useState<number>(250);
  const [costCenterCode, setCostCenterCode] = useState('');
  const [costCenterName, setCostCenterName] = useState('');
  const [capacityHoursPerDay, setCapacityHoursPerDay] = useState<number>(16);
  const [status, setStatus] = useState<WorkCenter['status']>('operational');
  const [efficiencyOEE, setEfficiencyOEE] = useState<number>(85);
  const [currentOperator, setCurrentOperator] = useState('');
  const [currentOrderCode, setCurrentOrderCode] = useState('');

  // Category labels and badges
  const categoryMap: Record<WorkCenter['category'], { label: string; color: string }> = {
    machining: { label: 'Usinagem CNC & Eletroerosão', color: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
    cutting: { label: 'Corte a Laser / Serra', color: 'bg-orange-950 text-orange-300 border-orange-800' },
    bending: { label: 'Dobra & Conformação', color: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
    welding: { label: 'Soldagem & Caldeiraria', color: 'bg-amber-950 text-amber-300 border-amber-800' },
    surface: { label: 'Tratamento & Pintura', color: 'bg-purple-950 text-purple-300 border-purple-800' },
    assembly: { label: 'Bancada & Ajuste', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    quality: { label: 'Controle de Qualidade / CMM', color: 'bg-blue-950 text-blue-300 border-blue-800' },
  };

  const getStatusBadge = (st: WorkCenter['status']) => {
    switch (st) {
      case 'in_production':
        return { label: 'Em Produção', classes: 'bg-emerald-950/80 text-emerald-400 border-emerald-800' };
      case 'maintenance':
        return { label: 'Em Manutenção', classes: 'bg-rose-950/80 text-rose-300 border-rose-800' };
      case 'idle':
        return { label: 'Ocioso', classes: 'bg-amber-950/80 text-amber-300 border-amber-800' };
      default:
        return { label: 'Operacional / Disponível', classes: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  // Filtered List
  const filteredWorkCenters = useMemo(() => {
    return workCenters.filter(wc => {
      const matchesSearch = !searchTerm || 
        wc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wc.costCenterCode && wc.costCenterCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (wc.costCenterName && wc.costCenterName.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;
      if (categoryFilter !== 'all' && wc.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && wc.status !== statusFilter) return false;
      return true;
    });
  }, [workCenters, searchTerm, categoryFilter, statusFilter]);

  // Financial and Capacity Metrics
  const metrics = useMemo(() => {
    const totalCount = workCenters.length;
    const operationalCount = workCenters.filter(w => w.status === 'operational' || w.status === 'in_production').length;
    const inProdCount = workCenters.filter(w => w.status === 'in_production').length;
    const maintenanceCount = workCenters.filter(w => w.status === 'maintenance').length;
    
    const avgHourlyRate = totalCount > 0 
      ? workCenters.reduce((acc, w) => acc + w.hourlyRate, 0) / totalCount 
      : 0;

    const totalCapacityHours = workCenters.reduce((acc, w) => acc + w.capacityHoursPerDay, 0);

    const avgOEE = totalCount > 0
      ? workCenters.reduce((acc, w) => acc + w.efficiencyOEE, 0) / totalCount
      : 0;

    return {
      totalCount,
      operationalCount,
      inProdCount,
      maintenanceCount,
      avgHourlyRate,
      totalCapacityHours,
      avgOEE: Math.round(avgOEE)
    };
  }, [workCenters]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingWc(null);
    const nextSeq = workCenters.length + 1;
    setCode(`MAQ-${nextSeq.toString().padStart(2, '0')}`);
    setName('');
    setCategory('machining');
    setHourlyRate(280.00);
    setCostCenterCode(`CC-30${nextSeq}`);
    setCostCenterName('Usinagem e Ferramentaria');
    setCapacityHoursPerDay(16);
    setStatus('operational');
    setEfficiencyOEE(88);
    setCurrentOperator('');
    setCurrentOrderCode('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (wc: WorkCenter) => {
    setEditingWc(wc);
    setCode(wc.code);
    setName(wc.name);
    setCategory(wc.category);
    setHourlyRate(wc.hourlyRate);
    setCostCenterCode(wc.costCenterCode || `CC-${wc.code}`);
    setCostCenterName(wc.costCenterName || categoryMap[wc.category].label);
    setCapacityHoursPerDay(wc.capacityHoursPerDay);
    setStatus(wc.status);
    setEfficiencyOEE(wc.efficiencyOEE);
    setCurrentOperator(wc.currentOperator || '');
    setCurrentOrderCode(wc.currentOrderCode || '');
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      alert('Por favor, informe o Código da Máquina e a Descrição do Centro de Trabalho.');
      return;
    }

    if (editingWc) {
      const updated: WorkCenter = {
        ...editingWc,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        hourlyRate: Number(hourlyRate) || 0,
        costCenterCode: costCenterCode.trim().toUpperCase() || undefined,
        costCenterName: costCenterName.trim() || undefined,
        capacityHoursPerDay: Number(capacityHoursPerDay) || 16,
        status,
        efficiencyOEE: Number(efficiencyOEE) || 85,
        currentOperator: currentOperator.trim() || undefined,
        currentOrderCode: currentOrderCode.trim() || undefined
      };
      onUpdateWorkCenter(updated);
      setIsModalOpen(false);
    } else {
      const newWc: WorkCenter = {
        id: `wc-${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        hourlyRate: Number(hourlyRate) || 0,
        costCenterCode: costCenterCode.trim().toUpperCase() || undefined,
        costCenterName: costCenterName.trim() || undefined,
        capacityHoursPerDay: Number(capacityHoursPerDay) || 16,
        status,
        efficiencyOEE: Number(efficiencyOEE) || 85,
        currentOperator: currentOperator.trim() || undefined,
        currentOrderCode: currentOrderCode.trim() || undefined
      };
      onAddWorkCenter(newWc);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Máquinas & Centros de Custos Industriais</span>
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Postos de Trabalho & Taxas Horárias
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre, edite e gerencie o parque de máquinas, taxas de absorção horária (R$/hora), centros de custos contábeis e capacidade produtiva diária.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Máquina / Posto</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total de Postos Cadastrados</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{metrics.totalCount}</span>
            <span className="text-xs text-slate-400">máquinas / bancadas</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {metrics.operationalCount} operacionais · {metrics.maintenanceCount} em manutenção
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Taxa Horária Média (Centro de Custo)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              R$ {metrics.avgHourlyRate.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">/hora máquina</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Base para orçamentação e apropriação de custos de OS/POS
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Capacidade Fabril Instalada</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {metrics.totalCapacityHours} h
            </span>
            <span className="text-xs text-slate-400">/dia útil</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Carga teórica diária de 2 ou 3 turnos de trabalho
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Eficiência OEE Média</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {metrics.avgOEE}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">Parque Fabril</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {metrics.inProdCount} máquinas ativas no chão de fábrica agora
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, máquina ou centro de custos..."
              className="w-full bg-slate-950 border border-slate-750 rounded pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:border-cyan-500 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Processo:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-750 text-white text-xs rounded px-2.5 py-1"
              >
                <option value="all">Todas as Categorias</option>
                <option value="machining">Usinagem CNC & EDM</option>
                <option value="cutting">Corte Laser / Serra</option>
                <option value="bending">Dobra & Conformação</option>
                <option value="welding">Solda & Caldeiraria</option>
                <option value="surface">Superfície & Pintura</option>
                <option value="assembly">Bancada & Ajuste</option>
                <option value="quality">Metrologia & Qualidade</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-750 text-white text-xs rounded px-2.5 py-1"
              >
                <option value="all">Todos os Status</option>
                <option value="operational">Operacional</option>
                <option value="in_production">Em Produção</option>
                <option value="idle">Ocioso</option>
                <option value="maintenance">Em Manutenção</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Work Centers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkCenters.map((wc) => {
          const catInfo = categoryMap[wc.category] || categoryMap.machining;
          const statusBadge = getStatusBadge(wc.status);

          return (
            <div 
              key={wc.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
            >
              <div>
                {/* Header Card: Code & Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {wc.code}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${catInfo.color}`}>
                      {catInfo.label.split('/')[0]}
                    </span>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${statusBadge.classes}`}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-sm font-bold text-white mt-1 mb-3 line-clamp-2" title={wc.name}>
                  {wc.name}
                </h3>

                {/* Cost Center & Rates */}
                <div className="bg-slate-950 p-3 rounded border border-slate-850 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Taxa Horária:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      R$ {wc.hourlyRate.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">/h</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 pt-1.5 border-t border-slate-800/60">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Centro de Custo:</span>
                    </span>
                    <span className="font-mono font-medium text-slate-200">
                      {wc.costCenterCode || `CC-${wc.code}`}
                    </span>
                  </div>

                  {wc.costCenterName && (
                    <div className="text-[11px] text-slate-500 italic text-right truncate">
                      {wc.costCenterName}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-400 pt-1.5 border-t border-slate-800/60">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Capacidade Diária:</span>
                    </span>
                    <span className="font-mono text-slate-200">
                      {wc.capacityHoursPerDay} horas/dia
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 pt-1.5 border-t border-slate-800/60">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>OEE Padrão:</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {wc.efficiencyOEE}%
                    </span>
                  </div>
                </div>

                {/* Live Order & Operator (if any) */}
                {(wc.currentOrderCode || wc.currentOperator) && (
                  <div className="mt-3 p-2 bg-slate-950/40 rounded border border-slate-850 text-[11px] text-slate-400 flex flex-col gap-1">
                    {wc.currentOrderCode && (
                      <div className="flex justify-between">
                        <span>Ordem Alocada:</span>
                        <span className="font-mono text-cyan-400 font-semibold">{wc.currentOrderCode}</span>
                      </div>
                    )}
                    {wc.currentOperator && (
                      <div className="flex justify-between">
                        <span>Operador:</span>
                        <span className="text-slate-300 font-medium">{wc.currentOperator}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(wc)}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center gap-1.5"
                  title="Editar dados da máquina e taxa horária"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Editar Máquina</span>
                </button>

                {onDeleteWorkCenter && (
                  <button
                    type="button"
                    onClick={() => setWcToDelete(wc)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded border border-slate-750 hover:border-rose-800 transition-colors"
                    title="Excluir máquina"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredWorkCenters.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-lg">
            Nenhuma máquina ou centro de custos encontrado com os filtros selecionados.
          </div>
        )}
      </div>

      {/* MODAL: Create / Edit Work Center */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>{editingWc ? `Editar Máquina: ${editingWc.code}` : 'Nova Máquina & Centro de Trabalho'}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Código da Máquina / Tag *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: CNC-04, LAS-02, EDM-03"
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono uppercase focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Processo / Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  >
                    <option value="machining">Usinagem CNC & Eletroerosão</option>
                    <option value="cutting">Corte a Laser / Serra</option>
                    <option value="bending">Dobra & Conformação</option>
                    <option value="welding">Soldagem & Caldeiraria</option>
                    <option value="surface">Tratamento & Pintura</option>
                    <option value="assembly">Bancada & Ajuste</option>
                    <option value="quality">Controle de Qualidade / Metrologia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome / Descrição da Máquina *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Centro de Usinagem 5 Eixos Hermle C400"
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Cost Center and Hourly Rate Section */}
              <div className="bg-slate-950 p-3.5 rounded border border-cyan-900/40 space-y-3">
                <div className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Dados do Centro de Custos & Absorção</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Taxa Horária (R$/h) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      placeholder="Ex: 320.00"
                      className="w-full bg-slate-900 border border-cyan-800/80 rounded p-2 text-emerald-400 font-mono font-bold focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Código Centro de Custos</label>
                    <input
                      type="text"
                      value={costCenterCode}
                      onChange={(e) => setCostCenterCode(e.target.value)}
                      placeholder="Ex: CC-3020, CC-USIN"
                      className="w-full bg-slate-900 border border-slate-750 rounded p-2 text-white font-mono uppercase focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Nome Centro de Custos</label>
                    <input
                      type="text"
                      value={costCenterName}
                      onChange={(e) => setCostCenterName(e.target.value)}
                      placeholder="Ex: Usinagem Pesada CNC"
                      className="w-full bg-slate-900 border border-slate-750 rounded p-2 text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Capacity and OEE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Capacidade (Horas/Dia)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="24"
                    required
                    value={capacityHoursPerDay}
                    onChange={(e) => setCapacityHoursPerDay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Eficiência OEE Alvo (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    required
                    value={efficiencyOEE}
                    onChange={(e) => setEfficiencyOEE(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Situação / Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  >
                    <option value="operational">Operacional / Disponível</option>
                    <option value="in_production">Em Produção</option>
                    <option value="idle">Ocioso</option>
                    <option value="maintenance">Em Manutenção</option>
                  </select>
                </div>
              </div>

              {/* Operator and Order Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Operador Atualmente Alocado</label>
                  <input
                    type="text"
                    value={currentOperator}
                    onChange={(e) => setCurrentOperator(e.target.value)}
                    placeholder="Ex: Ricardo Lima (Fresador CNC)"
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ordem Atualmente em Execução</label>
                  <input
                    type="text"
                    value={currentOrderCode}
                    onChange={(e) => setCurrentOrderCode(e.target.value)}
                    placeholder="Ex: OS-2026-0001 ou OP-2026-0142"
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <div>
                  {editingWc && onDeleteWorkCenter && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = editingWc;
                        setIsModalOpen(false);
                        setWcToDelete(target);
                      }}
                      className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded border border-rose-800 text-xs flex items-center gap-1.5 transition-colors font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Máquina</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                  >
                    {editingWc ? 'Salvar Alterações da Máquina' : 'Cadastrar Máquina'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL FOR DELETING WORK CENTER */}
      {wcToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-rose-900/60 rounded-lg w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-950 rounded-full border border-rose-800">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Confirmar Exclusão</h3>
                <p className="text-[11px] text-slate-400">Esta ação removerá a máquina do cadastro industrial.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Máquina / Tag:</span>
                <span className="font-mono font-bold text-cyan-300">{wcToDelete.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nome:</span>
                <span className="text-white font-medium text-right max-w-[240px] truncate">{wcToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Centro de Custo:</span>
                <span className="font-mono text-slate-300">{wcToDelete.costCenterCode || `CC-${wcToDelete.code}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taxa Horária:</span>
                <span className="font-mono text-emerald-400 font-bold">R$ {wcToDelete.hourlyRate.toFixed(2)}/h</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setWcToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteWorkCenter) {
                    onDeleteWorkCenter(wcToDelete.id);
                  }
                  setWcToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Máquina</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
