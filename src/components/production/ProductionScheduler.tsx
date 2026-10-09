import React, { useState, useMemo } from 'react';
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
  ChevronDown,
  Layers,
  ArrowRight,
  QrCode,
  HardHat,
  Search,
  Wrench,
  AlertOctagon,
  Building2,
  User,
  Calendar,
  FileText,
  Edit2,
  Trash2,
  Check,
  X,
  History,
  Timer,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { 
  ProductionOrder, 
  WorkCenter, 
  Product,
  ToolingOS,
  ToolingPOS,
  ToolingRoutingStep,
  ToolingTimeEntry,
  ToolingServiceType,
  ToolingOSStatus,
  ToolingPOSStatus,
  ToolingPriority,
  ToolingStepStatus,
  TOOLING_PROCESS_OPTIONS
} from '../../types/industrial';
import { generateNextOSNumber, generateNextPOSNumber } from '../../utils/toolingValidation';

interface ProductionSchedulerProps {
  toolingOrders: ToolingOS[];
  toolingTimeEntries: ToolingTimeEntry[];
  workCenters: WorkCenter[];
  productionOrders: ProductionOrder[];
  products: Product[];
  onAddNewToolingOS: (newOS: ToolingOS) => void;
  onUpdateToolingOS: (updatedOS: ToolingOS) => void;
  onDeleteToolingOS?: (osId: string) => void;
  onAddNewPOS: (osId: string, newPOS: ToolingPOS) => void;
  onUpdatePOS: (osId: string, updatedPOS: ToolingPOS) => void;
  onDeletePOS?: (osId: string, posId: string) => void;
  onDeleteRoutingStep?: (osId: string, posId: string, stepId: string) => void;
  onDeleteToolingTimeEntry?: (entryId: string) => void;
  onUpdateStepStatus: (osId: string, posId: string, stepId: string, status: ToolingStepStatus) => void;
  onAddRoutingStep: (osId: string, posId: string, step: ToolingRoutingStep) => void;
  onAddToolingTimeEntry: (entry: ToolingTimeEntry) => boolean | void;
  onUpdateOrderStatus: (orderId: string, status: ProductionOrder['status']) => void;
  onOpenKioskWithOrder: (orderNumber: string, posNumber?: string) => void;
  onAddNewOrder: (newOrder: ProductionOrder) => void;
}

export const ProductionScheduler: React.FC<ProductionSchedulerProps> = ({
  toolingOrders,
  toolingTimeEntries,
  workCenters,
  productionOrders,
  products,
  onAddNewToolingOS,
  onUpdateToolingOS,
  onDeleteToolingOS,
  onAddNewPOS,
  onUpdatePOS,
  onDeletePOS,
  onDeleteRoutingStep,
  onDeleteToolingTimeEntry,
  onUpdateStepStatus,
  onAddRoutingStep,
  onAddToolingTimeEntry,
  onUpdateOrderStatus,
  onOpenKioskWithOrder,
  onAddNewOrder,
}) => {
  // Navigation View: 'tooling_os' (Default Ferramentaria), 'gantt' (Carga de Máquinas), 'series_ops' (OPs Seriadas)
  const [activeMainView, setActiveMainView] = useState<'tooling_os' | 'gantt' | 'series_ops'>('tooling_os');

  // Search & Filter state for Tooling OS
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [specialFilter, setSpecialFilter] = useState<'all' | 'delayed' | 'blocked'>('all');

  // Selected OS and POS
  const [selectedOSId, setSelectedOSId] = useState<string>(toolingOrders[0]?.id || '');
  const [expandedPOSIds, setExpandedPOSIds] = useState<Record<string, boolean>>({
    [toolingOrders[0]?.posList[0]?.id || '']: true
  });

  // Modals state
  const [isNewOSModalOpen, setIsNewOSModalOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<ToolingOS | null>(null);

  const [isNewPOSModalOpen, setIsNewPOSModalOpen] = useState(false);
  const [editingPOS, setEditingPOS] = useState<ToolingPOS | null>(null);

  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [targetPOSForStep, setTargetPOSForStep] = useState<ToolingPOS | null>(null);

  const [isTimeEntryModalOpen, setIsTimeEntryModalOpen] = useState(false);
  const [targetPOSForTime, setTargetPOSForTime] = useState<ToolingPOS | null>(null);
  const [targetStepForTime, setTargetStepForTime] = useState<ToolingRoutingStep | null>(null);

  // Form State: OS
  const [osClient, setOsClient] = useState('');
  const [osProject, setOsProject] = useState('');
  const [osDescription, setOsDescription] = useState('');
  const [osServiceType, setOsServiceType] = useState<ToolingServiceType>('fabricacao_nova');
  const [osOpenDate, setOsOpenDate] = useState(new Date().toISOString().split('T')[0]);
  const [osDueDate, setOsDueDate] = useState('');
  const [osResponsible, setOsResponsible] = useState('Eng. Marcelo Guimarães');
  const [osPriority, setOsPriority] = useState<ToolingPriority>('normal');
  const [osStatus, setOsStatus] = useState<ToolingOSStatus>('aberta');
  const [osNotes, setOsNotes] = useState('');

  // Form State: POS
  const [posPartName, setPosPartName] = useState('');
  const [posTechDesc, setPosTechDesc] = useState('');
  const [posQuantity, setPosQuantity] = useState(1);
  const [posResponsible, setPosResponsible] = useState('Valdir Siqueira');
  const [posPriority, setPosPriority] = useState<ToolingPriority>('normal');
  const [posDueDate, setPosDueDate] = useState('');
  const [posPlannedHours, setPosPlannedHours] = useState(10);
  const [posNotes, setPosNotes] = useState('');

  // Form State: Step
  const [stepProcessName, setStepProcessName] = useState<string>(TOOLING_PROCESS_OPTIONS[0]);
  const [stepResponsible, setStepResponsible] = useState('Valdir Siqueira');
  const [stepWorkCenterId, setStepWorkCenterId] = useState('');
  const [stepPlannedHours, setStepPlannedHours] = useState(4);
  const [stepStartDate, setStepStartDate] = useState('');
  const [stepEndDate, setStepEndDate] = useState('');
  const [stepNotes, setStepNotes] = useState('');

  // Form State: Time Entry
  const [teEmployee, setTeEmployee] = useState('Ricardo Lima (Fresador CNC)');
  const [teMachine, setTeMachine] = useState('Centro de Usinagem 4 Eixos Haas (CNC-03)');
  const [teDate, setTeDate] = useState(new Date().toISOString().split('T')[0]);
  const [teStartTime, setTeStartTime] = useState('08:00');
  const [teEndTime, setTeEndTime] = useState('12:00');
  const [teEffectiveHours, setTeEffectiveHours] = useState(4.0);
  const [teDescription, setTeDescription] = useState('');

  // Auto calculate effective hours on time change
  const handleTimeChange = (start: string, end: string) => {
    setTeStartTime(start);
    setTeEndTime(end);
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      if (endMin > startMin) {
        const diffHours = (endMin - startMin) / 60;
        setTeEffectiveHours(Number(diffHours.toFixed(2)));
      } else {
        setTeEffectiveHours(0);
      }
    } catch {
      // ignore
    }
  };

  // Selected OS entity
  const selectedOS = useMemo(() => {
    return toolingOrders.find(o => o.id === selectedOSId) || toolingOrders[0] || null;
  }, [toolingOrders, selectedOSId]);

  // Today reference for delay check
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper check if OS is delayed
  const isOSDelayed = (os: ToolingOS) => {
    return os.status !== 'concluida' && os.status !== 'cancelada' && os.dueDate < todayStr;
  };

  // Helper check if OS has any blocked step
  const hasBlockedStep = (os: ToolingOS) => {
    return os.posList.some(pos => pos.routing.some(step => step.status === 'bloqueada'));
  };

  // Filtered Tooling OS list
  const filteredToolingOrders = useMemo(() => {
    return toolingOrders.filter(os => {
      // Search
      const searchMatch = !searchTerm || 
        os.osNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.toolingProject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.posList.some(p => p.partName.toLowerCase().includes(searchTerm.toLowerCase()) || p.posNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!searchMatch) return false;

      // Status Filter
      if (statusFilter !== 'all' && os.status !== statusFilter) return false;

      // Priority Filter
      if (priorityFilter !== 'all' && os.priority !== priorityFilter) return false;

      // Special Filter
      if (specialFilter === 'delayed' && !isOSDelayed(os)) return false;
      if (specialFilter === 'blocked' && !hasBlockedStep(os)) return false;

      return true;
    });
  }, [toolingOrders, searchTerm, statusFilter, priorityFilter, specialFilter, todayStr]);

  // Overall Tooling Metrics
  const toolingMetrics = useMemo(() => {
    const totalOS = toolingOrders.length;
    const activeOS = toolingOrders.filter(o => o.status !== 'concluida' && o.status !== 'cancelada').length;
    const delayedOS = toolingOrders.filter(isOSDelayed).length;
    const blockedOS = toolingOrders.filter(hasBlockedStep).length;

    let totalPlannedHours = 0;
    let totalActualHours = 0;
    let totalPOSCount = 0;

    toolingOrders.forEach(os => {
      os.posList.forEach(pos => {
        totalPOSCount += 1;
        totalPlannedHours += pos.plannedHours;
        totalActualHours += pos.actualHours;
      });
    });

    return {
      totalOS,
      activeOS,
      delayedOS,
      blockedOS,
      totalPOSCount,
      totalPlannedHours,
      totalActualHours,
      progressPercent: totalPlannedHours > 0 ? Math.round((totalActualHours / totalPlannedHours) * 100) : 0
    };
  }, [toolingOrders, todayStr]);

  // Generate Unique Sequential OS Number
  const getNextOSNumber = () => {
    return generateNextOSNumber(toolingOrders);
  };

  // Open New OS Modal
  const handleOpenCreateOS = () => {
    setEditingOS(null);
    setOsClient('');
    setOsProject('');
    setOsDescription('');
    setOsServiceType('fabricacao_nova');
    setOsOpenDate(new Date().toISOString().split('T')[0]);
    setOsDueDate(new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0]);
    setOsResponsible('Eng. Marcelo Guimarães (Chefe de Ferramentaria)');
    setOsPriority('normal');
    setOsStatus('aberta');
    setOsNotes('');
    setIsNewOSModalOpen(true);
  };

  // Open Edit OS Modal
  const handleOpenEditOS = (os: ToolingOS) => {
    setEditingOS(os);
    setOsClient(os.clientName);
    setOsProject(os.toolingProject);
    setOsDescription(os.description);
    setOsServiceType(os.serviceType);
    setOsOpenDate(os.openDate);
    setOsDueDate(os.dueDate);
    setOsResponsible(os.responsible);
    setOsPriority(os.priority);
    setOsStatus(os.status);
    setOsNotes(os.notes || '');
    setIsNewOSModalOpen(true);
  };

  // Save OS (Create or Edit)
  const handleSaveOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!osClient.trim() || !osProject.trim()) {
      alert('Por favor, informe o Cliente e o Projeto / Molde / Matriz da OS.');
      return;
    }

    if (editingOS) {
      const updated: ToolingOS = {
        ...editingOS,
        clientName: osClient.trim(),
        toolingProject: osProject.trim(),
        description: osDescription.trim(),
        serviceType: osServiceType,
        openDate: osOpenDate,
        dueDate: osDueDate,
        responsible: osResponsible,
        priority: osPriority,
        status: osStatus,
        notes: osNotes.trim()
      };
      onUpdateToolingOS(updated);
      setIsNewOSModalOpen(false);
    } else {
      const newOSNumber = getNextOSNumber();
      const newOS: ToolingOS = {
        id: `os-${Date.now()}`,
        osNumber: newOSNumber,
        clientName: osClient.trim(),
        toolingProject: osProject.trim(),
        description: osDescription.trim(),
        serviceType: osServiceType,
        openDate: osOpenDate,
        dueDate: osDueDate,
        responsible: osResponsible,
        priority: osPriority,
        status: osStatus,
        notes: osNotes.trim(),
        posList: []
      };
      onAddNewToolingOS(newOS);
      setSelectedOSId(newOS.id);
      setIsNewOSModalOpen(false);
    }
  };

  // Open New POS Modal
  const handleOpenCreatePOS = (targetOS: ToolingOS) => {
    setEditingPOS(null);
    setPosPartName('');
    setPosTechDesc('');
    setPosQuantity(1);
    setPosResponsible('Valdir Siqueira (Ajustador Líder)');
    setPosPriority(targetOS.priority);
    setPosDueDate(targetOS.dueDate);
    setPosPlannedHours(12);
    setPosNotes('');
    setIsNewPOSModalOpen(true);
  };

  // Open Edit POS Modal
  const handleOpenEditPOS = (pos: ToolingPOS) => {
    setEditingPOS(pos);
    setPosPartName(pos.partName);
    setPosTechDesc(pos.technicalDescription);
    setPosQuantity(pos.quantity);
    setPosResponsible(pos.responsible);
    setPosPriority(pos.priority);
    setPosDueDate(pos.dueDate);
    setPosPlannedHours(pos.plannedHours);
    setPosNotes(pos.notes || '');
    setIsNewPOSModalOpen(true);
  };

  // Save POS (Create or Edit)
  const handleSavePOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOS) return;
    if (!posPartName.trim()) {
      alert('Informe o Nome da Peça ou Operação da POS.');
      return;
    }

    if (editingPOS) {
      const plannedHours = editingPOS.routing.length > 0
        ? editingPOS.routing.reduce((acc, r) => acc + r.plannedHours, 0)
        : posPlannedHours;
      const updated: ToolingPOS = {
        ...editingPOS,
        partName: posPartName.trim(),
        technicalDescription: posTechDesc.trim(),
        quantity: posQuantity,
        responsible: posResponsible,
        priority: posPriority,
        dueDate: posDueDate,
        plannedHours: Number(plannedHours.toFixed(2)),
        notes: posNotes.trim()
      };
      onUpdatePOS(selectedOS.id, updated);
      setIsNewPOSModalOpen(false);
    } else {
      const posCode = generateNextPOSNumber(selectedOS);

      const newPOS: ToolingPOS = {
        id: `pos-${Date.now()}`,
        posNumber: posCode,
        osId: selectedOS.id,
        osNumber: selectedOS.osNumber,
        partName: posPartName.trim(),
        technicalDescription: posTechDesc.trim(),
        quantity: posQuantity,
        responsible: posResponsible,
        priority: posPriority,
        dueDate: posDueDate || selectedOS.dueDate,
        status: 'planejada',
        plannedHours: posPlannedHours,
        actualHours: 0,
        notes: posNotes.trim(),
        routing: [
          {
            id: `rt-${Date.now()}-1`,
            stepOrder: 1,
            processName: 'Projeto',
            responsible: 'Claudio Pires (Projetista)',
            plannedHours: 2.0,
            actualHours: 0,
            status: 'pendente'
          },
          {
            id: `rt-${Date.now()}-2`,
            stepOrder: 2,
            processName: 'Fresamento CNC',
            responsible: 'Ricardo Lima (Fresador CNC)',
            workCenterId: 'wc-3',
            workCenterName: 'Centro de Usinagem 4 Eixos Haas',
            plannedHours: 6.0,
            actualHours: 0,
            status: 'pendente'
          },
          {
            id: `rt-${Date.now()}-3`,
            stepOrder: 3,
            processName: 'Ajuste e bancada',
            responsible: 'Valdir Siqueira (Ajustador Líder)',
            workCenterId: 'wc-11',
            workCenterName: 'Bancada de Ajuste e Polimento',
            plannedHours: 4.0,
            actualHours: 0,
            status: 'pendente'
          }
        ]
      };

      onAddNewPOS(selectedOS.id, newPOS);
      setExpandedPOSIds(prev => ({ ...prev, [newPOS.id]: true }));
      setIsNewPOSModalOpen(false);
    }
  };

  // Open Add Step Modal
  const handleOpenAddStep = (pos: ToolingPOS) => {
    setTargetPOSForStep(pos);
    setStepProcessName(TOOLING_PROCESS_OPTIONS[0]);
    setStepResponsible(pos.responsible);
    setStepWorkCenterId(workCenters[0]?.id || '');
    setStepPlannedHours(4);
    setStepStartDate(new Date().toISOString().split('T')[0]);
    setStepEndDate(pos.dueDate);
    setStepNotes('');
    setIsAddStepModalOpen(true);
  };

  // Save Step
  const handleSaveStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOS || !targetPOSForStep) return;

    const wc = workCenters.find(w => w.id === stepWorkCenterId);
    const nextOrder = targetPOSForStep.routing.length > 0
      ? Math.max(...targetPOSForStep.routing.map(r => r.stepOrder)) + 1
      : 1;

    const newStep: ToolingRoutingStep = {
      id: `rt-${Date.now()}`,
      stepOrder: nextOrder,
      processName: stepProcessName,
      responsible: stepResponsible,
      workCenterId: wc?.id,
      workCenterName: wc?.name,
      plannedHours: stepPlannedHours,
      actualHours: 0,
      plannedStartDate: stepStartDate,
      plannedEndDate: stepEndDate,
      status: 'pendente',
      notes: stepNotes.trim()
    };

    onAddRoutingStep(selectedOS.id, targetPOSForStep.id, newStep);
    setIsAddStepModalOpen(false);
  };

  // Open Time Entry Modal
  const handleOpenTimeEntry = (pos: ToolingPOS, step?: ToolingRoutingStep) => {
    setTargetPOSForTime(pos);
    setTargetStepForTime(step || pos.routing[0] || null);
    setTeEmployee(pos.responsible || 'Valdir Siqueira');
    setTeMachine(step?.workCenterName || 'Centro de Usinagem CNC');
    setTeDate(new Date().toISOString().split('T')[0]);
    setTeStartTime('08:00');
    setTeEndTime('12:00');
    setTeEffectiveHours(4.0);
    setTeDescription(`Execução da etapa ${step ? step.processName : 'operacional'} em ${pos.partName}.`);
    setIsTimeEntryModalOpen(true);
  };

  // Save Time Entry
  const handleSaveTimeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOS || !targetPOSForTime) return;

    if (teEndTime <= teStartTime) {
      alert('Erro de validação: A hora de término deve ser posterior à hora de início.');
      return;
    }

    if (teEffectiveHours <= 0) {
      alert('O tempo efetivo de trabalho deve ser maior que zero.');
      return;
    }

    const stepOrder = targetStepForTime?.stepOrder || 1;
    const processName = targetStepForTime?.processName || 'Usinagem / Ajuste';

    const entry: ToolingTimeEntry = {
      id: `te-${Date.now()}`,
      osId: selectedOS.id,
      osNumber: selectedOS.osNumber,
      posId: targetPOSForTime.id,
      posNumber: targetPOSForTime.posNumber,
      stepOrder,
      processName,
      employeeName: teEmployee,
      workCenterName: teMachine,
      date: teDate,
      startTime: teStartTime,
      endTime: teEndTime,
      effectiveHours: teEffectiveHours,
      description: teDescription.trim() || 'Apontamento de horas de ferramentaria.'
    };

    const res = onAddToolingTimeEntry(entry);
    // If onAddToolingTimeEntry returns false or alerts, do not close modal
    if (res !== false) {
      setIsTimeEntryModalOpen(false);
    }
  };

  // Toggle expand POS
  const toggleExpandPOS = (posId: string) => {
    setExpandedPOSIds(prev => ({
      ...prev,
      [posId]: !prev[posId]
    }));
  };

  // Helper Labels & Styles
  const getServiceTypeBadge = (st: ToolingServiceType) => {
    switch (st) {
      case 'fabricacao_nova':
        return { label: 'Fabricação Nova', bg: 'bg-cyan-950 text-cyan-300 border-cyan-800' };
      case 'manutencao_preventiva':
        return { label: 'Manutenção Preventiva', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'manutencao_corretiva':
        return { label: 'Manutenção Corretiva', bg: 'bg-rose-950 text-rose-300 border-rose-800' };
      case 'modificacao_engenharia':
        return { label: 'Modificação de Engenharia', bg: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'dispositivo_controle':
        return { label: 'Dispositivo de Controle', bg: 'bg-blue-950 text-blue-300 border-blue-800' };
      default:
        return { label: 'Outros Serviços', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const getStatusBadge = (st: ToolingOSStatus) => {
    switch (st) {
      case 'aberta':
        return { label: 'Aberta', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
      case 'em_planejamento':
        return { label: 'Em Planejamento', bg: 'bg-purple-950 text-purple-300 border-purple-800' };
      case 'liberada':
        return { label: 'Liberada', bg: 'bg-blue-950 text-blue-300 border-blue-800' };
      case 'em_execucao':
        return { label: 'Em Execução', bg: 'bg-cyan-950 text-cyan-300 border-cyan-700' };
      case 'aguardando_terceiros':
        return { label: 'Aguardando Terceiros', bg: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'aguardando_inspecao':
        return { label: 'Aguardando Inspeção', bg: 'bg-indigo-950 text-indigo-300 border-indigo-800' };
      case 'concluida':
        return { label: 'Concluída', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'cancelada':
        return { label: 'Cancelada', bg: 'bg-rose-950 text-rose-300 border-rose-800' };
      default:
        return { label: st, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const getPriorityBadge = (p: ToolingPriority) => {
    switch (p) {
      case 'urgente':
        return 'bg-rose-950 text-rose-300 border-rose-800 font-bold';
      case 'alta':
        return 'bg-amber-950 text-amber-300 border-amber-800 font-semibold';
      case 'normal':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'baixa':
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  const getStepStatusStyle = (st: ToolingStepStatus) => {
    switch (st) {
      case 'concluida':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'em_andamento':
        return 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold';
      case 'pausada':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'bloqueada':
        return 'bg-rose-950 text-rose-300 border-rose-800 font-bold animate-pulse';
      case 'pendente':
      default:
        return 'bg-slate-950 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Wrench className="w-5 h-5 text-cyan-400" />
              <span>Gerenciamento de Ferramentaria: OS & POS</span>
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Tooling MES v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Controle de Ordens de Serviço (OS), peças/componentes subordinados (POS), roteiros de usinagem e apontamento de horas.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Main Views Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded text-xs">
            <button
              onClick={() => setActiveMainView('tooling_os')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                activeMainView === 'tooling_os' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Ordens de Serviço (OS & POS)</span>
            </button>
            <button
              onClick={() => setActiveMainView('gantt')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                activeMainView === 'gantt' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Carga de Máquinas (Gantt)</span>
            </button>
            <button
              onClick={() => setActiveMainView('series_ops')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                activeMainView === 'series_ops' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ordens de Série (OPs)</span>
            </button>
          </div>

          {activeMainView === 'tooling_os' && (
            <button
              onClick={handleOpenCreateOS}
              className="px-3.5 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nova OS de Ferramentaria</span>
            </button>
          )}
        </div>
      </div>

      {/* Main View 1: Tooling OS & POS Management */}
      {activeMainView === 'tooling_os' && (
        <div className="space-y-5">
          {/* Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded p-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total de OS</div>
              <div className="text-xl font-bold text-white font-mono mt-1">{toolingMetrics.totalOS}</div>
              <div className="text-[10px] text-slate-500">{toolingMetrics.activeOS} em andamento</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded p-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Peças / POS</div>
              <div className="text-xl font-bold text-cyan-400 font-mono mt-1">{toolingMetrics.totalPOSCount}</div>
              <div className="text-[10px] text-slate-500">Componentes ativos</div>
            </div>

            <div className={`rounded p-3 border ${toolingMetrics.delayedOS > 0 ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <div className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>OS Atrasadas</span>
              </div>
              <div className={`text-xl font-bold font-mono mt-1 ${toolingMetrics.delayedOS > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {toolingMetrics.delayedOS}
              </div>
              <div className="text-[10px]">{toolingMetrics.delayedOS > 0 ? 'Prazo expirado' : 'Todas no prazo'}</div>
            </div>

            <div className={`rounded p-3 border ${toolingMetrics.blockedOS > 0 ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <div className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" />
                <span>Etapas Bloqueadas</span>
              </div>
              <div className={`text-xl font-bold font-mono mt-1 ${toolingMetrics.blockedOS > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {toolingMetrics.blockedOS}
              </div>
              <div className="text-[10px]">{toolingMetrics.blockedOS > 0 ? 'Requer intervenção' : 'Fluxo liberado'}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded p-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Horas Previstas</div>
              <div className="text-xl font-bold text-white font-mono mt-1">{toolingMetrics.totalPlannedHours.toFixed(1)}h</div>
              <div className="text-[10px] text-slate-500">Estimado total</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded p-3">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Horas Realizadas</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{toolingMetrics.totalActualHours.toFixed(1)}h</div>
              <div className="text-[10px] text-emerald-400/80 font-mono">{toolingMetrics.progressPercent}% executado</div>
            </div>
          </div>

          {/* Search, Filter & Quick Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por OS, cliente, projeto, peça..."
                  className="w-full bg-slate-950 border border-slate-750 rounded pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-0 text-xs"
                />
              </div>

              {/* Status and Priority Selectors */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-750 text-white text-xs rounded px-2.5 py-1"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="aberta">Aberta</option>
                    <option value="em_planejamento">Em Planejamento</option>
                    <option value="liberada">Liberada</option>
                    <option value="em_execucao">Em Execução</option>
                    <option value="aguardando_terceiros">Aguardando Terceiros</option>
                    <option value="aguardando_inspecao">Aguardando Inspeção</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">Prioridade:</span>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-750 text-white text-xs rounded px-2.5 py-1"
                  >
                    <option value="all">Todas</option>
                    <option value="urgente">Urgente</option>
                    <option value="alta">Alta</option>
                    <option value="normal">Normal</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Special Quick Filter Badges */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Filtros Rápidos:</span>
              <button
                onClick={() => setSpecialFilter('all')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                  specialFilter === 'all' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Todas as OS ({toolingOrders.length})
              </button>
              <button
                onClick={() => setSpecialFilter('delayed')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                  specialFilter === 'delayed' ? 'bg-rose-600 text-white font-bold' : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>⚠️ Atrasadas ({toolingMetrics.delayedOS})</span>
              </button>
              <button
                onClick={() => setSpecialFilter('blocked')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                  specialFilter === 'blocked' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                }`}
              >
                <AlertOctagon className="w-3 h-3" />
                <span>⛔ Com Etapas Bloqueadas ({toolingMetrics.blockedOS})</span>
              </button>
            </div>
          </div>

          {/* Master-Detail Grid: OS List (Left) + Selected OS Details & POS (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: List of OSs */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  Ordens de Serviço ({filteredToolingOrders.length})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Selecione para ver POS
                </span>
              </div>

              <div className="divide-y divide-slate-800 max-h-[720px] overflow-y-auto">
                {filteredToolingOrders.length > 0 ? (
                  filteredToolingOrders.map((os) => {
                    const isSelected = selectedOS?.id === os.id;
                    const delayed = isOSDelayed(os);
                    const blocked = hasBlockedStep(os);
                    const serviceTypeInfo = getServiceTypeBadge(os.serviceType);
                    const statusInfo = getStatusBadge(os.status);

                    // OS Hours sum
                    const osPlannedHours = os.posList.reduce((acc, p) => acc + p.plannedHours, 0);
                    const osActualHours = os.posList.reduce((acc, p) => acc + p.actualHours, 0);
                    const osPercent = osPlannedHours > 0 ? Math.min(100, Math.round((osActualHours / osPlannedHours) * 100)) : 0;

                    return (
                      <div
                        key={os.id}
                        onClick={() => setSelectedOSId(os.id)}
                        className={`p-4 cursor-pointer transition-colors ${
                          isSelected ? 'bg-slate-800/80 border-l-4 border-cyan-500' : 'hover:bg-slate-850/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-xs text-cyan-400">
                                {os.osNumber}
                              </span>
                              <span className="text-slate-600 text-xs">·</span>
                              <span className="text-xs font-semibold text-white truncate max-w-[200px]" title={os.clientName}>
                                {os.clientName}
                              </span>
                            </div>
                            <div className="text-xs text-slate-200 font-medium mt-1 truncate" title={os.toolingProject}>
                              {os.toolingProject}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusInfo.bg}`}>
                              {statusInfo.label}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono uppercase ${getPriorityBadge(os.priority)}`}>
                              {os.priority}
                            </span>
                          </div>
                        </div>

                        {/* Service Type & Special Flags */}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded border ${serviceTypeInfo.bg}`}>
                            {serviceTypeInfo.label}
                          </span>
                          {delayed && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> ATRASADA ({os.dueDate})
                            </span>
                          )}
                          {blocked && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold flex items-center gap-0.5">
                              <AlertOctagon className="w-2.5 h-2.5" /> ETAPA BLOQUEADA
                            </span>
                          )}
                        </div>

                        {/* OS Progress and POS Count */}
                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <div>
                            <span>POS vinculadas: </span>
                            <strong className="text-white font-mono">{os.posList.length}</strong>
                          </div>
                          <div className="font-mono">
                            <span>Horas: </span>
                            <strong className="text-emerald-400">{osActualHours.toFixed(1)}h</strong>
                            <span className="text-slate-500"> / {osPlannedHours.toFixed(1)}h ({osPercent}%)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Nenhuma Ordem de Serviço encontrada com os filtros selecionados.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Selected OS Details & List of Subordinated POS */}
            <div className="lg:col-span-7 space-y-5">
              {selectedOS ? (
                <>
                  {/* Selected OS Header Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-base font-bold text-cyan-400">
                            {selectedOS.osNumber}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs text-slate-400">Abertura: {selectedOS.openDate}</span>
                          <span className="text-slate-600">·</span>
                          <span className={`text-xs font-semibold ${isOSDelayed(selectedOS) ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                            Prazo: {selectedOS.dueDate} {isOSDelayed(selectedOS) && '(VENCIDO)'}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-white mt-1">
                          {selectedOS.toolingProject}
                        </h2>
                        <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Cliente: <strong className="text-white">{selectedOS.clientName}</strong></span>
                          <span>·</span>
                          <span>Resp: <strong className="text-slate-200">{selectedOS.responsible}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          onClick={() => handleOpenEditOS(selectedOS)}
                          className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar OS</span>
                        </button>
                        {onDeleteToolingOS && (
                          <button
                            onClick={() => {
                              if (confirm(`Excluir permanentemente a OS ${selectedOS.osNumber} (${selectedOS.toolingProject}) e todas as suas ${selectedOS.posList.length} POS vinculadas?`)) {
                                onDeleteToolingOS(selectedOS.id);
                                const remaining = toolingOrders.filter(o => o.id !== selectedOS.id);
                                setSelectedOSId(remaining[0]?.id || '');
                              }
                            }}
                            className="px-2.5 py-1.5 text-xs bg-rose-950 hover:bg-rose-900 text-rose-300 rounded border border-rose-800 transition-colors flex items-center gap-1.5"
                            title="Excluir Ordem de Serviço"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir OS</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenCreatePOS(selectedOS)}
                          className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar POS</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick OS Status Update & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded border border-slate-800">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Status Geral da OS:</label>
                        <select
                          value={selectedOS.status}
                          onChange={(e) => onUpdateToolingOS({ ...selectedOS, status: e.target.value as ToolingOSStatus })}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1 text-xs"
                        >
                          <option value="aberta">Aberta</option>
                          <option value="em_planejamento">Em Planejamento</option>
                          <option value="liberada">Liberada</option>
                          <option value="em_execucao">Em Execução</option>
                          <option value="aguardando_terceiros">Aguardando Terceiros</option>
                          <option value="aguardando_inspecao">Aguardando Inspeção</option>
                          <option value="concluida">Concluída</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Tipo de Serviço:</label>
                        <span className="font-semibold text-slate-200 block pt-1">
                          {getServiceTypeBadge(selectedOS.serviceType).label}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Prioridade:</label>
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded border uppercase ${getPriorityBadge(selectedOS.priority)}`}>
                          {selectedOS.priority}
                        </span>
                      </div>
                    </div>

                    {selectedOS.description && (
                      <p className="text-xs text-slate-300 italic bg-slate-950/40 p-2.5 rounded border border-slate-850">
                        "{selectedOS.description}"
                      </p>
                    )}
                  </div>

                  {/* Subordinated POS List (Peças e Operações Vinculadas) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                          Peças & Operações Subordinadas (POS)
                        </h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                          {selectedOS.posList.length} itens vinculados
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenCreatePOS(selectedOS)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nova Peça (POS)</span>
                      </button>
                    </div>

                    {selectedOS.posList.length > 0 ? (
                      selectedOS.posList.map((pos) => {
                        const isExpanded = !!expandedPOSIds[pos.id];
                        const posBlocked = pos.routing.some(r => r.status === 'bloqueada');
                        const posDelayed = pos.status !== 'concluida' && pos.status !== 'cancelada' && pos.dueDate < todayStr;
                        const posPercent = pos.plannedHours > 0 ? Math.min(100, Math.round((pos.actualHours / pos.plannedHours) * 100)) : 0;

                        // Time entries for this POS
                        const posTimeEntries = toolingTimeEntries.filter(t => t.posId === pos.id || t.posNumber === pos.posNumber);

                        return (
                          <div
                            key={pos.id}
                            className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm"
                          >
                            {/* POS Summary Bar */}
                            <div className="p-4 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-slate-800">
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => toggleExpandPOS(pos.id)}
                                  className="mt-0.5 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                  title={isExpanded ? 'Recolher Roteiro' : 'Expandir Roteiro'}
                                >
                                  {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4" />}
                                </button>

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-bold text-xs text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                                      {pos.posNumber}
                                    </span>
                                    <span className="font-bold text-white text-sm">
                                      {pos.partName}
                                    </span>
                                    <span className="text-slate-400 text-xs">
                                      (Qtd: <strong className="text-white font-mono">{pos.quantity} un</strong>)
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                                    <span>Resp: <strong className="text-slate-200">{pos.responsible}</strong></span>
                                    <span>·</span>
                                    <span className={posDelayed ? 'text-rose-400 font-bold' : ''}>
                                      Prazo: {pos.dueDate} {posDelayed && '(ATRASADA)'}
                                    </span>
                                    <span>·</span>
                                    <span>Horas: <strong className="text-emerald-400 font-mono">{pos.actualHours.toFixed(1)}h</strong> / {pos.plannedHours.toFixed(1)}h ({posPercent}%)</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status and Action Buttons */}
                              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                {posBlocked && (
                                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                                    ⛔ BLOQUEADA
                                  </span>
                                )}

                                <select
                                  value={pos.status}
                                  onChange={(e) => onUpdatePOS(selectedOS.id, { ...pos, status: e.target.value as ToolingPOSStatus })}
                                  className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                                >
                                  <option value="planejada">Planejada</option>
                                  <option value="em_andamento">Em Andamento</option>
                                  <option value="pausada">Pausada</option>
                                  <option value="inspecao">Inspeção</option>
                                  <option value="concluida">Concluída</option>
                                  <option value="cancelada">Cancelada</option>
                                </select>

                                <button
                                  onClick={() => handleOpenTimeEntry(pos)}
                                  className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center gap-1 transition-colors"
                                  title="Apontar horas trabalhadas nesta POS"
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>Apontar</span>
                                </button>

                                <button
                                  onClick={() => handleOpenAddStep(pos)}
                                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 transition-colors"
                                  title="Adicionar etapa ao roteiro de fabricação"
                                >
                                  + Etapa
                                </button>

                                <button
                                  onClick={() => handleOpenEditPOS(pos)}
                                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded border border-slate-700 transition-colors"
                                  title="Editar POS"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {onDeletePOS && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Excluir permanentemente a POS ${pos.posNumber} (${pos.partName})?`)) {
                                        onDeletePOS(selectedOS.id, pos.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded border border-slate-800 hover:border-rose-900 transition-colors"
                                    title="Excluir POS"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Expanded Content: Routing Steps & Time Entries */}
                            {isExpanded && (
                              <div className="p-4 space-y-4 text-xs bg-slate-900/60">
                                {pos.technicalDescription && (
                                  <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-850">
                                    <strong className="text-slate-400">Descrição Técnica: </strong>
                                    {pos.technicalDescription}
                                  </div>
                                )}

                                {/* Routing Steps Table */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                                      Roteiro de Fabricação ({pos.routing.length} etapas)
                                    </span>
                                    <button
                                      onClick={() => handleOpenAddStep(pos)}
                                      className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold"
                                    >
                                      + Incluir Etapa no Roteiro
                                    </button>
                                  </div>

                                  <div className="border border-slate-800 rounded overflow-hidden">
                                    <table className="w-full text-left divide-y divide-slate-800">
                                      <thead className="bg-slate-950 text-slate-400 font-semibold text-[11px]">
                                        <tr>
                                          <th className="py-2 px-3 text-center w-12">#</th>
                                          <th className="py-2 px-3">Processo</th>
                                          <th className="py-2 px-3">Responsável / Máquina</th>
                                          <th className="py-2 px-3 text-center">Previsto</th>
                                          <th className="py-2 px-3 text-center">Realizado</th>
                                          <th className="py-2 px-3 text-center">Status</th>
                                          <th className="py-2 px-3 text-right">Ação</th>
                                        </tr>
                                      </thead>
                                       <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                                        {[...pos.routing].sort((a, b) => a.stepOrder - b.stepOrder).map((step) => {
                                          const stepStyle = getStepStatusStyle(step.status);
                                          return (
                                            <tr key={step.id} className="hover:bg-slate-850/40">
                                              <td className="py-2 px-3 text-center text-cyan-400 font-bold">
                                                {step.stepOrder}
                                              </td>
                                              <td className="py-2 px-3 font-sans font-medium text-white">
                                                <div>{step.processName}</div>
                                                {step.notes && (
                                                  <div className="text-[10px] text-slate-400 italic font-mono">{step.notes}</div>
                                                )}
                                              </td>
                                              <td className="py-2 px-3 font-sans text-slate-300 text-[11px]">
                                                <div>{step.responsible}</div>
                                                <div className="text-slate-500 font-mono text-[10px]">{step.workCenterName || 'Bancada / Oficina'}</div>
                                              </td>
                                              <td className="py-2 px-3 text-center text-slate-300">
                                                {step.plannedHours}h
                                              </td>
                                              <td className="py-2 px-3 text-center font-bold text-emerald-400">
                                                {step.actualHours}h
                                              </td>
                                              <td className="py-2 px-3 text-center">
                                                <select
                                                  value={step.status}
                                                  onChange={(e) => onUpdateStepStatus(selectedOS.id, pos.id, step.id, e.target.value as ToolingStepStatus)}
                                                  className={`text-[10px] font-sans px-2 py-0.5 rounded border ${stepStyle} focus:ring-0`}
                                                >
                                                  <option value="pendente">Pendente</option>
                                                  <option value="em_andamento">Em Andamento</option>
                                                  <option value="pausada">Pausada</option>
                                                  <option value="bloqueada">⛔ Bloqueada</option>
                                                  <option value="concluida">Concluída</option>
                                                </select>
                                              </td>
                                              <td className="py-2 px-3 text-right font-sans">
                                                <div className="flex items-center justify-end gap-1">
                                                  <button
                                                    onClick={() => handleOpenTimeEntry(pos, step)}
                                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 text-[10px]"
                                                    title="Apontar horas nesta etapa"
                                                  >
                                                    Apontar
                                                  </button>
                                                  {onDeleteRoutingStep && (
                                                    <button
                                                      onClick={() => {
                                                        if (confirm(`Remover a etapa ${step.stepOrder} (${step.processName}) do roteiro?`)) {
                                                          onDeleteRoutingStep(selectedOS.id, pos.id, step.id);
                                                        }
                                                      }}
                                                      className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-950/40 transition-colors"
                                                      title="Remover etapa"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </button>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Logged Time Entries for this POS */}
                                {posTimeEntries.length > 0 && (
                                  <div className="pt-2 border-t border-slate-800">
                                    <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block mb-1.5">
                                      Apontamentos Válidos Registrados ({posTimeEntries.length})
                                    </span>
                                    <div className="space-y-1.5">
                                      {posTimeEntries.map((te) => (
                                        <div
                                          key={te.id}
                                          className="p-2 bg-slate-950 rounded border border-slate-850 flex items-center justify-between text-[11px]"
                                        >
                                          <div>
                                            <span className="text-cyan-400 font-mono font-bold">Etapa {te.stepOrder} ({te.processName})</span>
                                            <span className="text-slate-600"> · </span>
                                            <span className="text-white font-medium">{te.employeeName}</span>
                                            <span className="text-slate-600"> · </span>
                                            <span className="text-slate-400">{te.description}</span>
                                          </div>
                                          <div className="text-right font-mono shrink-0 ml-2 flex items-center gap-2">
                                            <span className="text-slate-400">{te.date} ({te.startTime} - {te.endTime})</span>
                                            <span className="text-emerald-400 font-bold">+{te.effectiveHours}h</span>
                                            {onDeleteToolingTimeEntry && (
                                              <button
                                                onClick={() => {
                                                  if (confirm(`Excluir apontamento de ${te.effectiveHours}h de ${te.employeeName} e recalcular totais?`)) {
                                                    onDeleteToolingTimeEntry(te.id);
                                                  }
                                                }}
                                                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded transition-colors"
                                                title="Excluir apontamento e recalcular horas"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-lg">
                        Nenhuma peça (POS) cadastrada para esta OS. Clique em "Adicionar POS" para começar a detalhar o molde/ferramenta.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-24 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-lg">
                  Selecione uma Ordem de Serviço na lista à esquerda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main View 2: Machine Capacity Timeline (Gantt) */}
      {activeMainView === 'gantt' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">
                Cronograma Visual de Carga de Máquinas (Gantt)
              </h2>
              <p className="text-xs text-slate-400">
                Alocação temporal das operações de ferramentaria pelos postos de trabalho (CNC, Eletroerosão a fio, Retífica).
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400">
              Hoje: {todayStr}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {workCenters.map((wc) => {
              // Collect active tooling steps assigned to this work center
              const assignedToolingSteps = toolingOrders.flatMap(os => 
                os.posList.flatMap(pos => 
                  pos.routing
                    .filter(step => step.workCenterId === wc.id || (step.workCenterName && wc.name.includes(step.workCenterName.split(' ')[0])))
                    .map(step => ({
                      osNumber: os.osNumber,
                      posNumber: pos.posNumber,
                      partName: pos.partName,
                      stepOrder: step.stepOrder,
                      processName: step.processName,
                      status: step.status,
                      plannedHours: step.plannedHours,
                      responsible: step.responsible
                    }))
                )
              );

              // Also collect series production order steps assigned to this machine
              const assignedSeriesSteps = productionOrders.flatMap(order =>
                order.routing
                  .filter(r => r.workCenterId === wc.id)
                  .map(r => ({
                    osNumber: order.orderNumber,
                    posNumber: order.productCode,
                    partName: order.productName,
                    stepOrder: r.step,
                    processName: r.name,
                    status: (r.status === 'completed' ? 'concluida' : r.status === 'in_progress' ? 'em_andamento' : 'pendente') as ToolingStepStatus,
                    plannedHours: Number((r.plannedMinutes / 60).toFixed(1)),
                    responsible: r.operatorName || 'Operador Seriador'
                  }))
              );

              const assignedAllSteps = [...assignedToolingSteps, ...assignedSeriesSteps];

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

                  {/* Gantt Slot Bars */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 bg-slate-900/80 p-1.5 rounded border border-slate-850 min-h-[44px] items-center">
                    {assignedAllSteps.length > 0 ? (
                      assignedAllSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded text-[10px] font-mono border truncate cursor-pointer transition-transform hover:scale-[1.02] ${
                            step.status === 'concluida'
                              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                              : step.status === 'em_andamento'
                              ? 'bg-cyan-900/90 border-cyan-600 text-white font-bold'
                              : step.status === 'bloqueada'
                              ? 'bg-rose-950 border-rose-800 text-rose-300 font-bold'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                          title={`${step.osNumber} | ${step.posNumber} - ${step.processName} (${step.plannedHours}h) - ${step.responsible}`}
                        >
                          <div className="font-bold truncate">{step.posNumber}</div>
                          <div className="truncate text-[9px] text-slate-300">
                            {step.processName} ({step.plannedHours}h)
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-6 text-center text-slate-600 text-xs py-1">
                        Disponível / Sem operações programadas para este posto
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main View 3: Series Production Orders (OPs) */}
      {activeMainView === 'series_ops' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">
                Ordens de Produção em Série (OPs)
              </h2>
              <p className="text-xs text-slate-400">
                Ordens convencionais de fabricação em lote contínuo (compatibilidade com módulo ERP).
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {productionOrders.map((order) => {
              const progress = Math.round((order.producedQuantity / order.targetQuantity) * 100);
              return (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-cyan-400 font-mono">{order.orderNumber} - {order.productName}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{order.clientName} · Prazo: {order.dueDate}</div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-white font-bold">{order.producedQuantity} / {order.targetQuantity} un ({progress}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: Create or Edit Tooling OS */}
      {isNewOSModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>{editingOS ? `Editar Ordem de Serviço (${editingOS.osNumber})` : 'Nova Ordem de Serviço de Ferramentaria'}</span>
              </h2>
              <button onClick={() => setIsNewOSModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOS} className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cliente / Solicitante *</label>
                  <input
                    type="text"
                    required
                    value={osClient}
                    onChange={(e) => setOsClient(e.target.value)}
                    placeholder="Ex: Renault do Brasil S.A."
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Projeto, Molde, Matriz ou Ferramenta *</label>
                  <input
                    type="text"
                    required
                    value={osProject}
                    onChange={(e) => setOsProject(e.target.value)}
                    placeholder="Ex: Molde Injeção 8 Cavidades - Tampa 28mm"
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Descrição do Serviço</label>
                <textarea
                  rows={2}
                  value={osDescription}
                  onChange={(e) => setOsDescription(e.target.value)}
                  placeholder="Descreva o escopo técnico do molde, matriz ou reforma..."
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tipo de Serviço</label>
                  <select
                    value={osServiceType}
                    onChange={(e) => setOsServiceType(e.target.value as ToolingServiceType)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  >
                    <option value="fabricacao_nova">Fabricação Nova</option>
                    <option value="manutencao_preventiva">Manutenção Preventiva</option>
                    <option value="manutencao_corretiva">Manutenção Corretiva</option>
                    <option value="modificacao_engenharia">Modificação de Engenharia</option>
                    <option value="dispositivo_controle">Dispositivo de Controle</option>
                    <option value="nacionalizacao">Nacionalização</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Prioridade</label>
                  <select
                    value={osPriority}
                    onChange={(e) => setOsPriority(e.target.value as ToolingPriority)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente (Parada de Linha)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status da OS</label>
                  <select
                    value={osStatus}
                    onChange={(e) => setOsStatus(e.target.value as ToolingOSStatus)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  >
                    <option value="aberta">Aberta</option>
                    <option value="em_planejamento">Em Planejamento</option>
                    <option value="liberada">Liberada</option>
                    <option value="em_execucao">Em Execução</option>
                    <option value="aguardando_terceiros">Aguardando Terceiros</option>
                    <option value="aguardando_inspecao">Aguardando Inspeção</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Data de Abertura</label>
                  <input
                    type="date"
                    required
                    value={osOpenDate}
                    onChange={(e) => setOsOpenDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Prazo Previsto de Entrega *</label>
                  <input
                    type="date"
                    required
                    value={osDueDate}
                    onChange={(e) => setOsDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Responsável pela OS</label>
                  <input
                    type="text"
                    required
                    value={osResponsible}
                    onChange={(e) => setOsResponsible(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Observações Gerais</label>
                <input
                  type="text"
                  value={osNotes}
                  onChange={(e) => setOsNotes(e.target.value)}
                  placeholder="Ex: Exige laudo dimensional tridimensional e certificado de têmpera."
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewOSModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  {editingOS ? 'Salvar Alterações da OS' : 'Criar Ordem de Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create or Edit Tooling POS */}
      {isNewPOSModalOpen && selectedOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
              <h2 className="text-base font-bold text-white">
                {editingPOS ? `Editar POS (${editingPOS.posNumber})` : `Nova Peça / POS vinculada à ${selectedOS.osNumber}`}
              </h2>
              <button onClick={() => setIsNewPOSModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePOS} className="p-5 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome da Peça / Componente / Operação *</label>
                <input
                  type="text"
                  required
                  value={posPartName}
                  onChange={(e) => setPosPartName(e.target.value)}
                  placeholder="Ex: Placa Cavidade Superior Aço P20"
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Descrição Técnica</label>
                <textarea
                  rows={2}
                  value={posTechDesc}
                  onChange={(e) => setPosTechDesc(e.target.value)}
                  placeholder="Dimensões do bloco, material, tolerâncias críticas..."
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={posQuantity}
                    onChange={(e) => setPosQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Horas Previstas (Total estimado)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={posPlannedHours}
                    onChange={(e) => setPosPlannedHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Responsável</label>
                  <input
                    type="text"
                    required
                    value={posResponsible}
                    onChange={(e) => setPosResponsible(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Prazo Previsto para esta Peça</label>
                  <input
                    type="date"
                    required
                    value={posDueDate}
                    onChange={(e) => setPosDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Observações da Peça</label>
                <input
                  type="text"
                  value={posNotes}
                  onChange={(e) => setPosNotes(e.target.value)}
                  placeholder="Ex: Aço fornecido pelo cliente."
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPOSModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  {editingPOS ? 'Salvar Alterações da POS' : 'Vincular POS à Ordem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Step to POS Routing */}
      {isAddStepModalOpen && targetPOSForStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-lg p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">
                Adicionar Etapa ao Roteiro ({targetPOSForStep.posNumber})
              </h2>
              <button onClick={() => setIsAddStepModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStep} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Processo de Fabricação *</label>
                <select
                  value={stepProcessName}
                  onChange={(e) => setStepProcessName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                >
                  {TOOLING_PROCESS_OPTIONS.map((proc) => (
                    <option key={proc} value={proc}>{proc}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Centro de Trabalho / Máquina</label>
                  <select
                    value={stepWorkCenterId}
                    onChange={(e) => setStepWorkCenterId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  >
                    <option value="">Oficina Geral / Sem Máquina Fixa</option>
                    {workCenters.map((wc) => (
                      <option key={wc.id} value={wc.id}>{wc.name} ({wc.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tempo Previsto (Horas)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={stepPlannedHours}
                    onChange={(e) => setStepPlannedHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Responsável pela Etapa</label>
                <input
                  type="text"
                  required
                  value={stepResponsible}
                  onChange={(e) => setStepResponsible(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Data Início Prevista</label>
                  <input
                    type="date"
                    value={stepStartDate}
                    onChange={(e) => setStepStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Data Término Prevista</label>
                  <input
                    type="date"
                    value={stepEndDate}
                    onChange={(e) => setStepEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Instruções / Observações</label>
                <input
                  type="text"
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  placeholder="Ex: Deixar sobremetal de 0.2mm para retífica."
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStepModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  Incluir no Roteiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Time Entry (Apontamento de Horas) */}
      {isTimeEntryModalOpen && targetPOSForTime && selectedOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-lg p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Apontamento de Horas de Ferramentaria</span>
                </h2>
                <div className="text-[11px] text-slate-400">
                  {selectedOS.osNumber} · {targetPOSForTime.posNumber} ({targetPOSForTime.partName})
                </div>
              </div>
              <button onClick={() => setIsTimeEntryModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTimeEntry} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Etapa Executada *</label>
                <select
                  value={targetStepForTime?.id || ''}
                  onChange={(e) => {
                    const st = targetPOSForTime.routing.find(r => r.id === e.target.value);
                    if (st) setTargetStepForTime(st);
                  }}
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-medium"
                >
                  {targetPOSForTime.routing.map((r) => (
                    <option key={r.id} value={r.id}>
                      Etapa {r.stepOrder}: {r.processName} ({r.responsible})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Funcionário Responsável *</label>
                  <input
                    type="text"
                    required
                    value={teEmployee}
                    onChange={(e) => setTeEmployee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Máquina / Posto Utilizado</label>
                  <input
                    type="text"
                    value={teMachine}
                    onChange={(e) => setTeMachine(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded border border-slate-800">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={teDate}
                    onChange={(e) => setTeDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Hora Início</label>
                  <input
                    type="time"
                    required
                    value={teStartTime}
                    onChange={(e) => handleTimeChange(e.target.value, teEndTime)}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Hora Término</label>
                  <input
                    type="time"
                    required
                    value={teEndTime}
                    onChange={(e) => handleTimeChange(teStartTime, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-950/40 border border-emerald-800 rounded">
                <div>
                  <span className="text-[11px] text-emerald-300 font-semibold block">Tempo Efetivo Calculado</span>
                  <span className="text-[10px] text-slate-400">Total contabilizado para a operação</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={teEffectiveHours}
                    onChange={(e) => setTeEffectiveHours(Number(e.target.value))}
                    className="w-20 bg-slate-900 border border-emerald-700 text-emerald-300 font-bold font-mono text-center rounded p-1 text-sm"
                  />
                  <span className="font-mono text-white text-sm font-bold">horas</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Descrição do Serviço Executado</label>
                <textarea
                  rows={2}
                  required
                  value={teDescription}
                  onChange={(e) => setTeDescription(e.target.value)}
                  placeholder="Ex: Desbaste de cavidades, furação profunda, ajuste fino..."
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTimeEntryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Gravar Apontamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
