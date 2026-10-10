/**
 * Definição centralizada dos nomes das coleções do Cloud Firestore
 * para o WebErpMes Industrial.
 */
export const FIRESTORE_COLLECTIONS = {
  // Gestão de Multi-Inquilinos & Empresas (Fase 2B.2)
  COMPANIES: 'companies',
  MEMBERS_SUBCOLLECTION: 'members',

  // Módulo de Ferramentaria (Fase 1 & Fase 2)
  TOOLING_ORDERS: 'tooling_orders',
  TOOLING_TIME_ENTRIES: 'tooling_time_entries',
  
  // Recursos e Centros de Trabalho
  WORK_CENTERS: 'work_centers',
  
  // Produção Seriada (PCP)
  PRODUCTION_ORDERS: 'production_orders',
  SHOP_FLOOR_LOGS: 'shop_floor_logs',
  
  // Comercial & Engenharia
  QUOTES: 'quotes',
  PRODUCTS: 'products',
  MATERIALS: 'materials',
  
  // Qualidade & Manutenção
  QUALITY_INSPECTIONS: 'quality_inspections',
  RNCS: 'non_conformance_reports',
  MAINTENANCE_RECORDS: 'maintenance_records',
  
  // Configuração da Empresa
  COMPANY_CONFIG: 'company_config',
} as const;

export type FirestoreCollectionName = typeof FIRESTORE_COLLECTIONS[keyof typeof FIRESTORE_COLLECTIONS];
