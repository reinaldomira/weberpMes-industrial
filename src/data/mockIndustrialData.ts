import { 
  WorkCenter, 
  MaterialItem, 
  Product, 
  Quote, 
  ProductionOrder, 
  ShopFloorTimeEntry, 
  QualityInspection, 
  NonConformanceReport, 
  MaintenanceRecord,
  IndustryProfileConfig,
  ToolingOS,
  ToolingTimeEntry
} from '../types/industrial';

// Centros de Trabalho e Máquinas da Planta Fabril (sem ordens de exemplo vinculadas)
export const INITIAL_WORK_CENTERS: WorkCenter[] = [
  {
    id: 'wc-1',
    code: 'LAS-01',
    name: 'Laser Fibra 6kW High-Speed (Bystronic)',
    category: 'cutting',
    hourlyRate: 380.00,
    capacityHoursPerDay: 16,
    status: 'operational',
    efficiencyOEE: 88.0,
  },
  {
    id: 'wc-2',
    code: 'DOB-02',
    name: 'Dobradeira CNC 175T 3.1m (Trumpf TruBend)',
    category: 'bending',
    hourlyRate: 240.00,
    capacityHoursPerDay: 16,
    status: 'operational',
    efficiencyOEE: 85.0,
  },
  {
    id: 'wc-3',
    code: 'CNC-03',
    name: 'Centro de Usinagem Vertical 4 Eixos (Haas VF-3SS)',
    category: 'machining',
    hourlyRate: 310.00,
    capacityHoursPerDay: 16,
    status: 'operational',
    efficiencyOEE: 90.0,
  },
  {
    id: 'wc-4',
    code: 'SOL-04',
    name: 'Célula de Solda TIG / MIG-MAG Robotizada',
    category: 'welding',
    hourlyRate: 195.00,
    capacityHoursPerDay: 14,
    status: 'operational',
    efficiencyOEE: 80.0,
  },
  {
    id: 'wc-5',
    code: 'PIN-05',
    name: 'Linha de Pintura Eletrostática a Pó e Polimerização',
    category: 'surface',
    hourlyRate: 160.00,
    capacityHoursPerDay: 12,
    status: 'operational',
    efficiencyOEE: 85.0,
  },
  {
    id: 'wc-6',
    code: 'CMM-06',
    name: 'Metrologia / Máquina Tridimensional CMM Zeiss',
    category: 'quality',
    hourlyRate: 280.00,
    capacityHoursPerDay: 10,
    status: 'operational',
    efficiencyOEE: 95.0,
  },
  {
    id: 'wc-7',
    code: 'EDM-01',
    name: 'Eletroerosão a Fio CNC de Alta Precisão (AgieCharmilles)',
    category: 'machining',
    hourlyRate: 290.00,
    capacityHoursPerDay: 18,
    status: 'operational',
    efficiencyOEE: 90.0,
  },
  {
    id: 'wc-8',
    code: 'EDM-02',
    name: 'Eletroerosão por Penetração CNC (Makino EDGE3)',
    category: 'machining',
    hourlyRate: 260.00,
    capacityHoursPerDay: 16,
    status: 'operational',
    efficiencyOEE: 88.0,
  },
  {
    id: 'wc-9',
    code: 'RET-01',
    name: 'Retificadora Plana Tangencial Hidráulica (Chevalier)',
    category: 'machining',
    hourlyRate: 180.00,
    capacityHoursPerDay: 16,
    status: 'operational',
    efficiencyOEE: 90.0,
  },
  {
    id: 'wc-10',
    code: 'TOR-01',
    name: 'Torno Mecânico e CNC de Ferramentaria (Romi GL 240)',
    category: 'machining',
    hourlyRate: 210.00,
    capacityHoursPerDay: 16,
    status: 'operational',
    efficiencyOEE: 86.0,
  },
  {
    id: 'wc-11',
    code: 'AJU-01',
    name: 'Bancada de Ajuste, Polimento Espelhado e Montagem',
    category: 'assembly',
    hourlyRate: 150.00,
    capacityHoursPerDay: 16,
    status: 'operational',
    efficiencyOEE: 92.0,
  }
];

// Dados limpos de matérias-primas e estoques (sem exemplos)
export const INITIAL_MATERIALS: MaterialItem[] = [];

// Dados limpos de produtos de engenharia e BOMs (sem exemplos)
export const INITIAL_PRODUCTS: Product[] = [];

// Dados limpos de cotações e propostas comerciais (sem exemplos)
export const INITIAL_QUOTES: Quote[] = [];

// Dados limpos de ordens de produção seriadas (sem exemplos)
export const INITIAL_PRODUCTION_ORDERS: ProductionOrder[] = [];

// Dados limpos de apontamentos MES seriais (sem exemplos)
export const INITIAL_SHOP_FLOOR_LOGS: ShopFloorTimeEntry[] = [];

// Dados limpos de inspeções de qualidade (sem exemplos)
export const INITIAL_QUALITY_INSPECTIONS: QualityInspection[] = [];

// Dados limpos de relatórios de não-conformidade (sem exemplos)
export const INITIAL_RNCS: NonConformanceReport[] = [];

// Dados limpos de registros de manutenção de máquinas (sem exemplos)
export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [];

// Perfil de Configuração Operacional do Sistema
export const DEFAULT_INDUSTRY_PROFILE: IndustryProfileConfig = {
  profileId: 'molds_tooling',
  companyName: 'Ferramentaria & Matrizes de Precisão',
  currency: 'BRL',
  modulesEnabled: {
    quotes: true,
    engineeringBom: true,
    productionScheduler: true,
    shopFloorKiosk: true,
    inventoryLots: true,
    qualityControl: true,
    preventiveMaintenance: true,
    cadViewer: true
  },
  defaultOverheadPercent: 18.0,
  defaultProfitMarginPercent: 28.0,
  customFields: [
    {
      id: 'cf-1',
      name: 'heatNumber',
      label: 'Número de Corrida (Heat Number)',
      type: 'text',
      module: 'inventory',
      required: true,
      defaultValue: ''
    },
    {
      id: 'cf-2',
      name: 'welderCertification',
      label: 'Norma de Soldagem / EPS',
      type: 'select',
      options: ['ASME Sec IX', 'AWS D1.1', 'ISO 9606-1', 'Não Aplicável'],
      module: 'orders',
      required: false,
      defaultValue: 'Não Aplicável'
    },
    {
      id: 'cf-3',
      name: 'toleranceClass',
      label: 'Classe de Tolerância Dimensional',
      type: 'select',
      options: ['ISO 2768-m', 'ISO 2768-f (Fina)', 'DIN 16901-110 (Moldes)', 'Aeroespacial AS9100'],
      module: 'orders',
      required: true,
      defaultValue: 'DIN 16901-110 (Moldes)'
    }
  ]
};

// Dados limpos de Ordens de Serviço (OS) de Ferramentaria (sem exemplos)
export const INITIAL_TOOLING_ORDERS: ToolingOS[] = [];

// Dados limpos de Apontamentos de Horas de Ferramentaria (sem exemplos)
export const INITIAL_TOOLING_TIME_ENTRIES: ToolingTimeEntry[] = [];
