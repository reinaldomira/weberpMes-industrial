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
  IndustryProfileConfig
} from '../types/industrial';

export const INITIAL_WORK_CENTERS: WorkCenter[] = [
  {
    id: 'wc-1',
    code: 'LAS-01',
    name: 'Laser Fibra 6kW High-Speed (Bystronic)',
    category: 'cutting',
    hourlyRate: 380.00,
    capacityHoursPerDay: 16,
    status: 'in_production',
    currentOperator: 'Carlos Eduardo Mendes',
    currentOrderCode: 'OP-2026-0142',
    efficiencyOEE: 88.4,
  },
  {
    id: 'wc-2',
    code: 'DOB-02',
    name: 'Dobradeira CNC 175T 3.1m (Trumpf TruBend)',
    category: 'bending',
    hourlyRate: 240.00,
    capacityHoursPerDay: 16,
    status: 'in_production',
    currentOperator: 'Marcos Vinicius Silva',
    currentOrderCode: 'OP-2026-0139',
    efficiencyOEE: 82.1,
  },
  {
    id: 'wc-3',
    code: 'CNC-03',
    name: 'Centro de Usinagem Vertical 4 Eixos (Haas VF-3SS)',
    category: 'machining',
    hourlyRate: 310.00,
    capacityHoursPerDay: 16,
    status: 'operational',
    efficiencyOEE: 91.2,
  },
  {
    id: 'wc-4',
    code: 'SOL-04',
    name: 'Célula de Solda TIG / MIG-MAG Robotizada',
    category: 'welding',
    hourlyRate: 195.00,
    capacityHoursPerDay: 14,
    status: 'idle',
    efficiencyOEE: 76.5,
  },
  {
    id: 'wc-5',
    code: 'PIN-05',
    name: 'Linha de Pintura Eletrostática a Pó e Polimerização',
    category: 'surface',
    hourlyRate: 160.00,
    capacityHoursPerDay: 12,
    status: 'in_production',
    currentOperator: 'Renata Albuquerque',
    currentOrderCode: 'OP-2026-0136',
    efficiencyOEE: 84.7,
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
  }
];

export const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: 'mat-1',
    code: 'MP-CHP-INOX-304-20',
    name: 'Chapa Aço Inoxidável AISI 304 (2.0mm × 1250 × 2500)',
    category: 'raw_material',
    type: 'sheet',
    materialSpec: 'AISI 304 - 2B',
    density: 7.93,
    thickness: 2.0,
    width: 1250,
    length: 2500,
    unit: 'kg',
    unitCost: 32.50,
    stockQuantity: 1420,
    minStock: 400,
    lotNumber: 'LT-2026-INOX-882',
    certNumber: 'CERT-APERAM-99120',
    location: 'Galpão A - Rack C02'
  },
  {
    id: 'mat-2',
    code: 'MP-CHP-A36-475',
    name: 'Chapa Aço Carbono ASTM A36 (4.75mm × 1500 × 3000)',
    category: 'raw_material',
    type: 'sheet',
    materialSpec: 'ASTM A36 Laminada a Quente',
    density: 7.85,
    thickness: 4.75,
    width: 1500,
    length: 3000,
    unit: 'kg',
    unitCost: 9.80,
    stockQuantity: 3840,
    minStock: 1000,
    lotNumber: 'LT-2026-CSN-3310',
    certNumber: 'CERT-GERDAU-77401',
    location: 'Galpão A - Pátio de Chapas 01'
  },
  {
    id: 'mat-3',
    code: 'MP-TAR-AL-6061-50',
    name: 'Tarugo Redondo Alumínio 6061-T6 (Ø 50.8mm × 3000mm)',
    category: 'raw_material',
    type: 'rod',
    materialSpec: 'Alumínio Aeronáutico 6061-T6',
    density: 2.70,
    thickness: 50.8,
    width: 50.8,
    length: 3000,
    unit: 'bar',
    unitCost: 184.00,
    stockQuantity: 42,
    minStock: 15,
    lotNumber: 'LT-2026-AL-102',
    certNumber: 'CERT-NOVELIS-54129',
    location: 'Galpão B - Prateleira Perfis 04'
  },
  {
    id: 'mat-4',
    code: 'FIX-PAR-M8-25-INOX',
    name: 'Parafuso Allen Cabeça Cilíndrica M8x25mm A2-70 Inox',
    category: 'hardware',
    type: 'fastener',
    materialSpec: 'Inox A2-70 DIN 912',
    density: 7.9,
    unit: 'un',
    unitCost: 1.45,
    stockQuantity: 2500,
    minStock: 500,
    lotNumber: 'LT-CISER-884',
    certNumber: 'CERT-CIS-3022',
    location: 'Almoxarifado Geral - Gaveta 18'
  },
  {
    id: 'mat-5',
    code: 'QUIM-TINTA-RAL7016',
    name: 'Tinta a Pó Eletrostática Poliéster Cinza Antracite RAL 7016',
    category: 'consumable',
    type: 'chemical',
    materialSpec: 'Poliéster Industrial Resistente a UV',
    density: 1.5,
    unit: 'kg',
    unitCost: 48.00,
    stockQuantity: 180,
    minStock: 50,
    lotNumber: 'LT-WEG-9921',
    certNumber: 'CERT-WEG-POL-109',
    location: 'Depósito Químico Climatizado 01'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'PRD-GAB-IND-01',
    name: 'Gabinete Elétrico Industrial IP65 em Inox 304',
    revision: 'Rev. C',
    cadFileName: 'Gabinete_IP65_Chassi_v3.step',
    clientName: 'WEG Equipamentos Elétricos',
    description: 'Enclosure estanque com vedação em poliuretano, chassi dobrado e furos para prensa-cabos PG.',
    weightKg: 14.8,
    dimensions: '600 × 400 × 250 mm',
    estimatedCost: 312.40,
    suggestedSalePrice: 560.00,
    bom: [
      {
        id: 'bom-1',
        materialId: 'mat-1',
        materialName: 'Chapa Aço Inoxidável AISI 304 2.0mm',
        quantityPerProduct: 16.2,
        unit: 'kg',
        unitCost: 32.50,
        scrapAllowancePercent: 8.5
      },
      {
        id: 'bom-2',
        materialId: 'mat-4',
        materialName: 'Parafuso Allen M8x25mm A2 Inox',
        quantityPerProduct: 12,
        unit: 'un',
        unitCost: 1.45,
        scrapAllowancePercent: 0
      }
    ],
    routing: [
      {
        step: 10,
        name: 'Corte a Laser Fibra do Chassi e Porta',
        workCenterId: 'wc-1',
        workCenterName: 'Laser Fibra 6kW',
        setupTimeMinutes: 15,
        cycleTimeMinutesPerUnit: 6.5,
        hourlyRate: 380.00,
        instructions: 'Nesting com micro-juntas 0.6mm, gás Nitrogênio N2 16 bar para corte limpo sem óxido.',
        toolingRequired: 'Bocal cônico 1.5mm'
      },
      {
        step: 20,
        name: 'Dobra CNC Sequencial 6 Golpes',
        workCenterId: 'wc-2',
        workCenterName: 'Dobradeira CNC 175T',
        setupTimeMinutes: 20,
        cycleTimeMinutesPerUnit: 8.0,
        hourlyRate: 240.00,
        instructions: 'Matriz V12, Punção R1.0. Atenção para retorno elástico de 1.5° do inox.',
        toolingRequired: 'Punção Gooseneck + Matriz 2V'
      },
      {
        step: 30,
        name: 'Solda TIG dos Cantos e Prisioneiros',
        workCenterId: 'wc-4',
        workCenterName: 'Célula de Solda TIG',
        setupTimeMinutes: 10,
        cycleTimeMinutesPerUnit: 14.0,
        hourlyRate: 195.00,
        instructions: 'Argônio puro 99.99%. Realizar decapagem e passivação eletroquímica pós-solda.',
      },
      {
        step: 40,
        name: 'Inspeção Dimensional e Estanqueidade IP65',
        workCenterId: 'wc-6',
        workCenterName: 'Metrologia / CMM',
        setupTimeMinutes: 5,
        cycleTimeMinutesPerUnit: 4.0,
        hourlyRate: 280.00,
        instructions: 'Verificar alinhamento da dobradiça oculta e compressão da gaxeta de vedação.',
      }
    ]
  },
  {
    id: 'prod-2',
    code: 'PRD-FLG-CNC-04',
    name: 'Flange de Alta Pressão Bipartida Alumínio 6061-T6',
    revision: 'Rev. B',
    cadFileName: 'Flange_Bipartida_6061_T6.step',
    clientName: 'Embraer Defesa & Segurança',
    description: 'Componente usinado com tolerância H7 em alojamentos e rugosidade Ra 0.8.',
    weightKg: 2.1,
    dimensions: 'Ø 180 × 45 mm',
    estimatedCost: 185.00,
    suggestedSalePrice: 345.00,
    bom: [
      {
        id: 'bom-3',
        materialId: 'mat-3',
        materialName: 'Tarugo Redondo Alumínio 6061-T6 Ø50.8',
        quantityPerProduct: 0.8,
        unit: 'bar',
        unitCost: 184.00,
        scrapAllowancePercent: 5.0
      }
    ],
    routing: [
      {
        step: 10,
        name: 'Fresamento e Furação 4 Eixos CNC',
        workCenterId: 'wc-3',
        workCenterName: 'Centro de Usinagem 4 Eixos Haas',
        setupTimeMinutes: 45,
        cycleTimeMinutesPerUnit: 22.0,
        hourlyRate: 310.00,
        instructions: 'Usar fluido solúvel sintético refrigerado a 18°C. Controle rígido de concentricidade.',
        toolingRequired: 'Fresa inteiriça metal duro Ø12 3 cortes Alumínio'
      },
      {
        step: 20,
        name: 'Inspeção 3D Tridimensional CMM',
        workCenterId: 'wc-6',
        workCenterName: 'Metrologia / CMM',
        setupTimeMinutes: 15,
        cycleTimeMinutesPerUnit: 6.0,
        hourlyRate: 280.00,
        instructions: 'Medir batimento circular e diâmetro dos 8 furos de fixação.',
      }
    ]
  }
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'quote-1',
    quoteNumber: 'COT-2026-0089',
    clientName: 'WEG Equipamentos Elétricos S.A.',
    clientCnpj: '84.429.695/0001-11',
    contactName: 'Eng. Ricardo Silveira',
    contactEmail: 'ricardo.silveira@weg.net',
    date: '2026-10-02',
    validUntil: '2026-10-22',
    productName: 'Gabinete Elétrico Industrial IP65 em Inox 304',
    productCode: 'PRD-GAB-IND-01',
    quantity: 50,
    unitQuotedPrice: 560.00,
    totalQuotedPrice: 28000.00,
    leadTimeDays: 14,
    status: 'approved',
    notes: 'Lote piloto aprovado pelo setor de suprimentos. Entrega programada no CD Jaraguá do Sul.',
    breakdown: {
      rawMaterialCost: 9850.00,
      laborAndMachineCost: 5760.00,
      subcontractingCost: 0,
      toolingCost: 400.00,
      overheadPercent: 18,
      marginPercent: 28,
      totalCost: 19850.00,
      totalQuotedPrice: 28000.00
    },
    convertedToOrderId: 'OP-2026-0142'
  },
  {
    id: 'quote-2',
    quoteNumber: 'COT-2026-0091',
    clientName: 'Siemens Energy Brasil Ltda',
    clientCnpj: '02.362.457/0001-90',
    contactName: 'Dra. Beatriz Fontana',
    contactEmail: 'beatriz.fontana@siemens-energy.com',
    date: '2026-10-05',
    validUntil: '2026-10-25',
    productName: 'Flange de Alta Pressão Bipartida Alumínio 6061-T6',
    productCode: 'PRD-FLG-CNC-04',
    quantity: 120,
    unitQuotedPrice: 345.00,
    totalQuotedPrice: 41400.00,
    leadTimeDays: 18,
    status: 'sent',
    notes: 'Aguardando validação do desenho técnico com tolerâncias geométricas GD&T.',
    breakdown: {
      rawMaterialCost: 17664.00,
      laborAndMachineCost: 9120.00,
      subcontractingCost: 1800.00, // Anodização Dura
      toolingCost: 650.00,
      overheadPercent: 15,
      marginPercent: 26,
      totalCost: 31250.00,
      totalQuotedPrice: 41400.00
    }
  },
  {
    id: 'quote-3',
    quoteNumber: 'COT-2026-0094',
    clientName: 'Marcopolo Carrocerias S.A.',
    clientCnpj: '88.611.835/0001-81',
    contactName: 'Marcio Telles',
    contactEmail: 'marcio.telles@marcopolo.com.br',
    date: '2026-10-08',
    validUntil: '2026-10-28',
    productName: 'Suporte de Fixação Articulado Chapa A36 4.75mm',
    productCode: 'PRD-SUP-ART-09',
    quantity: 300,
    unitQuotedPrice: 89.50,
    totalQuotedPrice: 26850.00,
    leadTimeDays: 10,
    status: 'draft',
    notes: 'Cálculo de aproveitamento de chapa com nesting automático estimando 92% de aproveitamento.',
    breakdown: {
      rawMaterialCost: 11200.00,
      laborAndMachineCost: 6400.00,
      subcontractingCost: 1800.00,
      toolingCost: 0,
      overheadPercent: 16,
      marginPercent: 25,
      totalCost: 20450.00,
      totalQuotedPrice: 26850.00
    }
  }
];

export const INITIAL_PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: 'op-1',
    orderNumber: 'OP-2026-0142',
    salesOrderNumber: 'PV-2026-088',
    clientName: 'WEG Equipamentos Elétricos S.A.',
    productCode: 'PRD-GAB-IND-01',
    productName: 'Gabinete Elétrico Industrial IP65 em Inox 304',
    targetQuantity: 50,
    producedQuantity: 28,
    scrapQuantity: 1,
    status: 'in_progress',
    startDate: '2026-10-06',
    dueDate: '2026-10-18',
    priority: 'urgent',
    currentOperationStep: 20,
    lotNumber: 'LOT-2026-OP142',
    notes: 'Cliente solicitou certificado de matéria-prima e relatório de ensaio dimensional.',
    routing: [
      {
        step: 10,
        name: 'Corte a Laser Fibra',
        workCenterId: 'wc-1',
        workCenterName: 'Laser Fibra 6kW',
        status: 'completed',
        plannedMinutes: 340,
        actualMinutes: 325,
        operatorName: 'Carlos Eduardo Mendes'
      },
      {
        step: 20,
        name: 'Dobra CNC Sequencial',
        workCenterId: 'wc-2',
        workCenterName: 'Dobradeira CNC 175T',
        status: 'in_progress',
        plannedMinutes: 420,
        actualMinutes: 210,
        operatorName: 'Marcos Vinicius Silva'
      },
      {
        step: 30,
        name: 'Solda TIG dos Cantos',
        workCenterId: 'wc-4',
        workCenterName: 'Célula de Solda TIG',
        status: 'pending',
        plannedMinutes: 710,
        actualMinutes: 0
      },
      {
        step: 40,
        name: 'Inspeção Dimensional CMM',
        workCenterId: 'wc-6',
        workCenterName: 'Metrologia / CMM',
        status: 'pending',
        plannedMinutes: 205,
        actualMinutes: 0
      }
    ]
  },
  {
    id: 'op-2',
    orderNumber: 'OP-2026-0139',
    salesOrderNumber: 'PV-2026-085',
    clientName: 'Embraer Defesa & Segurança',
    productCode: 'PRD-FLG-CNC-04',
    productName: 'Flange de Alta Pressão Bipartida Alumínio 6061-T6',
    targetQuantity: 40,
    producedQuantity: 40,
    scrapQuantity: 0,
    status: 'quality_check',
    startDate: '2026-10-04',
    dueDate: '2026-10-14',
    priority: 'normal',
    currentOperationStep: 20,
    lotNumber: 'LOT-2026-OP139',
    routing: [
      {
        step: 10,
        name: 'Fresamento e Furação 4 Eixos',
        workCenterId: 'wc-3',
        workCenterName: 'Centro de Usinagem 4 Eixos Haas',
        status: 'completed',
        plannedMinutes: 925,
        actualMinutes: 910,
        operatorName: 'Felipe Santana'
      },
      {
        step: 20,
        name: 'Inspeção Tridimensional CMM',
        workCenterId: 'wc-6',
        workCenterName: 'Metrologia / CMM',
        status: 'in_progress',
        plannedMinutes: 255,
        actualMinutes: 120,
        operatorName: 'Mariana Duarte'
      }
    ]
  },
  {
    id: 'op-3',
    orderNumber: 'OP-2026-0145',
    salesOrderNumber: 'PV-2026-092',
    clientName: 'Marcopolo Carrocerias S.A.',
    productCode: 'PRD-SUP-ART-09',
    productName: 'Suporte de Fixação Articulado Chapa A36 4.75mm',
    targetQuantity: 150,
    producedQuantity: 0,
    scrapQuantity: 0,
    status: 'released',
    startDate: '2026-10-10',
    dueDate: '2026-10-21',
    priority: 'normal',
    currentOperationStep: 10,
    lotNumber: 'LOT-2026-OP145',
    routing: [
      {
        step: 10,
        name: 'Corte a Laser Fibra',
        workCenterId: 'wc-1',
        workCenterName: 'Laser Fibra 6kW',
        status: 'pending',
        plannedMinutes: 280,
        actualMinutes: 0
      },
      {
        step: 20,
        name: 'Dobra CNC',
        workCenterId: 'wc-2',
        workCenterName: 'Dobradeira CNC 175T',
        status: 'pending',
        plannedMinutes: 310,
        actualMinutes: 0
      },
      {
        step: 30,
        name: 'Pintura Eletrostática a Pó',
        workCenterId: 'wc-5',
        workCenterName: 'Linha de Pintura',
        status: 'pending',
        plannedMinutes: 440,
        actualMinutes: 0
      }
    ]
  }
];

export const INITIAL_SHOP_FLOOR_LOGS: ShopFloorTimeEntry[] = [
  {
    id: 'time-1',
    orderId: 'op-1',
    orderNumber: 'OP-2026-0142',
    operationStep: 20,
    workCenterId: 'wc-2',
    operatorName: 'Marcos Vinicius Silva',
    badgeNumber: 'OP-8821',
    startedAt: '2026-10-09T08:15:00',
    durationMinutes: 175,
    goodQuantity: 28,
    scrapQuantity: 1,
    scrapReason: 'Trinca no raio de dobra devido à dureza do lote da chapa',
    status: 'running'
  },
  {
    id: 'time-2',
    orderId: 'op-1',
    orderNumber: 'OP-2026-0142',
    operationStep: 10,
    workCenterId: 'wc-1',
    operatorName: 'Carlos Eduardo Mendes',
    badgeNumber: 'OP-5410',
    startedAt: '2026-10-08T13:00:00',
    endedAt: '2026-10-08T18:25:00',
    durationMinutes: 325,
    goodQuantity: 50,
    scrapQuantity: 0,
    status: 'finished'
  }
];

export const INITIAL_QUALITY_INSPECTIONS: QualityInspection[] = [
  {
    id: 'qual-1',
    orderNumber: 'OP-2026-0139',
    productCode: 'PRD-FLG-CNC-04',
    inspectorName: 'Mariana Duarte (Inspetora N2)',
    inspectionDate: '2026-10-09',
    lotNumber: 'LOT-2026-OP139',
    status: 'approved',
    measurements: [
      {
        feature: 'Diâmetro Externo (Ø)',
        nominal: 180.00,
        toleranceMin: -0.025,
        toleranceMax: 0.000,
        actual: 179.988,
        unit: 'mm',
        isConforming: true
      },
      {
        feature: 'Furo Central H7 (Ø)',
        nominal: 65.00,
        toleranceMin: 0.000,
        toleranceMax: 0.030,
        actual: 65.014,
        unit: 'mm',
        isConforming: true
      },
      {
        feature: 'Espessura Total',
        nominal: 45.00,
        toleranceMin: -0.05,
        toleranceMax: 0.05,
        actual: 45.012,
        unit: 'mm',
        isConforming: true
      },
      {
        feature: 'Rugosidade Ra da Face Vedante',
        nominal: 0.80,
        toleranceMin: 0.00,
        toleranceMax: 0.80,
        actual: 0.62,
        unit: 'µm',
        isConforming: true
      }
    ],
    visualCheck: true,
    roughnessCheck: true,
    notes: 'Lote 100% conforme. Peças liberadas para embalagem anticorrosiva VCI e despacho.'
  }
];

export const INITIAL_RNCS: NonConformanceReport[] = [
  {
    id: 'rnc-1',
    rncNumber: 'RNC-2026-0018',
    orderNumber: 'OP-2026-0142',
    productCode: 'PRD-GAB-IND-01',
    workCenterName: 'Dobradeira CNC 175T (DOB-02)',
    detectedBy: 'Marcos Vinicius Silva',
    date: '2026-10-09',
    defectCategory: 'burr',
    description: 'Trinca superficial observada no raio interno da 4ª dobra na peça #19.',
    quantityRejected: 1,
    rootCause: 'Variação no sentido de laminação da chapa combinado com raio de punção estreito (R1.0mm ao invés de R1.5mm).',
    correctiveAction: 'Ajustada ferramenta para punção R1.5mm e alterada orientação de nesting no corte laser a favor do veio de laminação.',
    status: 'action_defined'
  }
];

export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'maint-1',
    machineId: 'wc-1',
    machineName: 'Laser Fibra 6kW High-Speed (LAS-01)',
    type: 'preventive',
    scheduledDate: '2026-10-15',
    technician: 'Eng. Roberto Vasconcelos (Técnico Bystronic)',
    description: 'Substituição da lente de proteção ótica de quartzo e calibração do bocal capacitivo.',
    status: 'scheduled',
    estimatedHours: 3.5,
    partsReplaced: ['Lente de proteção 37×7mm', 'Bocal cônico Ø1.5mm']
  },
  {
    id: 'maint-2',
    machineId: 'wc-2',
    machineName: 'Dobradeira CNC 175T (DOB-02)',
    type: 'preventive',
    scheduledDate: '2026-10-12',
    technician: 'Cláudio Ferreira (Manutenção Interna)',
    description: 'Inspeção do nível de óleo hidráulico ISO VG 46 e teste de pressão das válvulas proporcionais.',
    status: 'scheduled',
    estimatedHours: 2.0
  }
];

export const DEFAULT_INDUSTRY_PROFILE: IndustryProfileConfig = {
  profileId: 'sheet_metal',
  companyName: 'Apex Industrial Manufatura & MES',
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
      defaultValue: 'CORR-2026-09'
    },
    {
      id: 'cf-2',
      name: 'welderCertification',
      label: 'Norma de Soldagem / EPS',
      type: 'select',
      module: 'orders',
      options: ['ASME Sec IX', 'AWS D1.1', 'ISO 9606-1', 'Não Aplicável'],
      required: false,
      defaultValue: 'ISO 9606-1'
    },
    {
      id: 'cf-3',
      name: 'toleranceClass',
      label: 'Classe de Tolerância Geral',
      type: 'select',
      module: 'quotes',
      options: ['ISO 2768-m (Média)', 'ISO 2768-f (Fina)', 'ISO 2768-c (Grossa)'],
      required: true,
      defaultValue: 'ISO 2768-m (Média)'
    }
  ]
};
