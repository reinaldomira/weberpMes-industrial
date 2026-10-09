export type ManufacturingType = 
  | 'sheet_metal' // Caldeiraria e Chaparia (Corte a laser, dobra, solda)
  | 'cnc_machining' // Usinagem e Tornearia de Precisão
  | 'molds_tooling' // Moldes, Matrizes e Ferramentaria
  | 'plastic_injection' // Injeção e Conformação
  | 'custom_assembly'; // Montagem e Equipamentos

export interface WorkCenter {
  id: string;
  code: string;
  name: string;
  category: 'cutting' | 'bending' | 'machining' | 'welding' | 'surface' | 'assembly' | 'quality';
  hourlyRate: number; // R$/hora
  capacityHoursPerDay: number;
  status: 'operational' | 'in_production' | 'maintenance' | 'idle';
  currentOperator?: string;
  currentOrderCode?: string;
  efficiencyOEE: number; // %
}

export interface MaterialItem {
  id: string;
  code: string;
  name: string;
  category: 'raw_material' | 'hardware' | 'subassembly' | 'consumable';
  type: 'sheet' | 'rod' | 'tube' | 'fastener' | 'chemical';
  materialSpec: string; // ex: Inox 304, Aço ASTM A36, Alumínio 6061-T6
  density: number; // g/cm3 (ex: 7.85 para aço)
  thickness?: number; // mm
  width?: number; // mm
  length?: number; // mm
  unit: 'kg' | 'm' | 'm2' | 'un' | 'bar';
  unitCost: number; // R$
  stockQuantity: number;
  minStock: number;
  lotNumber: string;
  certNumber: string; // Certificado de Matéria-Prima
  location: string; // Ex: Prateleira A-04, Galpão 2
}

export interface RoutingOperation {
  step: number; // 10, 20, 30...
  name: string;
  workCenterId: string;
  workCenterName: string;
  setupTimeMinutes: number;
  cycleTimeMinutesPerUnit: number;
  hourlyRate: number;
  instructions: string;
  toolingRequired?: string;
}

export interface BOMComponent {
  id: string;
  materialId: string;
  materialName: string;
  quantityPerProduct: number;
  unit: string;
  unitCost: number;
  scrapAllowancePercent: number; // % perda esperada
}

export interface Product {
  id: string;
  code: string;
  name: string;
  revision: string;
  cadFileName?: string;
  clientName?: string;
  description: string;
  weightKg: number;
  dimensions: string;
  bom: BOMComponent[];
  routing: RoutingOperation[];
  estimatedCost: number;
  suggestedSalePrice: number;
}

export interface QuoteCostBreakdown {
  rawMaterialCost: number;
  laborAndMachineCost: number;
  subcontractingCost: number;
  toolingCost: number;
  overheadPercent: number;
  marginPercent: number;
  totalCost: number;
  totalQuotedPrice: number;
}

export interface Quote {
  id: string;
  quoteNumber: string; // COT-2026-089
  clientName: string;
  clientCnpj: string;
  contactName: string;
  contactEmail: string;
  date: string;
  validUntil: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitQuotedPrice: number;
  totalQuotedPrice: number;
  leadTimeDays: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';
  notes: string;
  breakdown: QuoteCostBreakdown;
  convertedToOrderId?: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string; // OP-2026-0142
  salesOrderNumber: string; // PV-2026-088
  clientName: string;
  productCode: string;
  productName: string;
  targetQuantity: number;
  producedQuantity: number;
  scrapQuantity: number;
  status: 'planned' | 'released' | 'in_progress' | 'paused' | 'quality_check' | 'completed';
  startDate: string;
  dueDate: string;
  priority: 'low' | 'normal' | 'urgent';
  currentOperationStep: number;
  routing: {
    step: number;
    name: string;
    workCenterId: string;
    workCenterName: string;
    status: 'pending' | 'in_progress' | 'completed';
    plannedMinutes: number;
    actualMinutes: number;
    operatorName?: string;
  }[];
  lotNumber: string;
  notes?: string;
}

export interface ShopFloorTimeEntry {
  id: string;
  orderId: string;
  orderNumber: string;
  operationStep: number;
  workCenterId: string;
  operatorName: string;
  badgeNumber: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  goodQuantity: number;
  scrapQuantity: number;
  scrapReason?: string;
  status: 'running' | 'paused' | 'finished';
}

export interface QualityInspection {
  id: string;
  orderNumber: string;
  productCode: string;
  inspectorName: string;
  inspectionDate: string;
  lotNumber: string;
  status: 'approved' | 'approved_with_deviation' | 'rejected';
  measurements: {
    feature: string;
    nominal: number;
    toleranceMin: number;
    toleranceMax: number;
    actual: number;
    unit: string;
    isConforming: boolean;
  }[];
  visualCheck: boolean;
  roughnessCheck: boolean;
  notes: string;
}

export interface NonConformanceReport {
  id: string;
  rncNumber: string; // RNC-2026-024
  orderNumber: string;
  productCode: string;
  workCenterName: string;
  detectedBy: string;
  date: string;
  defectCategory: 'dimensional' | 'surface_finish' | 'burr' | 'raw_material' | 'assembly' | 'tooling';
  description: string;
  quantityRejected: number;
  rootCause: string;
  correctiveAction: string;
  status: 'open' | 'investigating' | 'action_defined' | 'closed';
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  machineName: string;
  type: 'preventive' | 'corrective';
  scheduledDate: string;
  completedDate?: string;
  technician: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  estimatedHours: number;
  partsReplaced?: string[];
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  module: 'quotes' | 'orders' | 'inventory' | 'quality';
  options?: string[];
  required: boolean;
  defaultValue?: string;
}

export interface IndustryProfileConfig {
  profileId: ManufacturingType;
  companyName: string;
  currency: string;
  modulesEnabled: {
    quotes: boolean;
    engineeringBom: boolean;
    productionScheduler: boolean;
    shopFloorKiosk: boolean;
    inventoryLots: boolean;
    qualityControl: boolean;
    preventiveMaintenance: boolean;
    cadViewer: boolean;
  };
  defaultOverheadPercent: number;
  defaultProfitMarginPercent: number;
  customFields: CustomFieldDefinition[];
}

// ==========================================
// MÓDULO FERRAMENTARIA: OS, POS & APONTAMENTOS
// ==========================================

export type ToolingServiceType = 
  | 'fabricacao_nova'
  | 'manutencao_preventiva'
  | 'manutencao_corretiva'
  | 'modificacao_engenharia'
  | 'dispositivo_controle'
  | 'nacionalizacao'
  | 'outros';

export type ToolingOSStatus = 
  | 'aberta'
  | 'em_planejamento'
  | 'liberada'
  | 'em_execucao'
  | 'aguardando_terceiros'
  | 'aguardando_inspecao'
  | 'concluida'
  | 'cancelada';

export type ToolingPOSStatus = 
  | 'planejada'
  | 'em_andamento'
  | 'pausada'
  | 'inspecao'
  | 'concluida'
  | 'cancelada';

export type ToolingPriority = 'baixa' | 'normal' | 'alta' | 'urgente';

export type ToolingStepStatus = 'pendente' | 'em_andamento' | 'pausada' | 'concluida' | 'bloqueada';

export const TOOLING_PROCESS_OPTIONS = [
  'Projeto',
  'Programação CAM',
  'Preparação de material',
  'Desbaste',
  'Acabamento',
  'Torneamento',
  'Fresamento CNC',
  'Eletroerosão a fio',
  'Eletroerosão por penetração',
  'Retífica',
  'Ajuste e bancada',
  'Montagem',
  'Tratamento térmico',
  'Tratamento superficial',
  'Inspeção dimensional',
  'Terceirização',
  'Outros'
] as const;

export type ToolingProcessName = typeof TOOLING_PROCESS_OPTIONS[number];

export interface ToolingRoutingStep {
  id: string;
  stepOrder: number; // 1, 2, 3...
  processName: string;
  responsible: string;
  workCenterId?: string;
  workCenterName?: string;
  plannedHours: number;
  actualHours: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  status: ToolingStepStatus;
  notes?: string;
}

export interface ToolingPOS {
  id: string;
  posNumber: string; // Ex: POS-2026-0001-01
  osId: string;
  osNumber: string;
  partName: string;
  technicalDescription: string;
  quantity: number;
  responsible: string;
  priority: ToolingPriority;
  dueDate: string;
  status: ToolingPOSStatus;
  routing: ToolingRoutingStep[];
  plannedHours: number;
  actualHours: number;
  notes?: string;
}

export interface ToolingOS {
  id: string;
  osNumber: string; // Ex: OS-2026-0001 (único, sequencial)
  clientName: string;
  toolingProject: string; // Projeto, molde, matriz ou ferramenta
  description: string;
  serviceType: ToolingServiceType;
  openDate: string;
  dueDate: string;
  responsible: string;
  priority: ToolingPriority;
  status: ToolingOSStatus;
  notes?: string;
  posList: ToolingPOS[];
}

export interface ToolingTimeEntry {
  id: string;
  osId: string;
  osNumber: string;
  posId: string;
  posNumber: string;
  stepOrder: number;
  processName: string;
  employeeName: string;
  workCenterName?: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  effectiveHours: number;
  description: string;
}

