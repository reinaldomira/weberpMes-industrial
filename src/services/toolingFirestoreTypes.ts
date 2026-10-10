import { 
  ToolingOS, 
  ToolingPOS, 
  ToolingRoutingStep, 
  ToolingTimeEntry,
  WorkCenter 
} from '../types/industrial';

/**
 * Interface estendida de metadados para auditoria e controle de propriedade no Firestore
 */
export interface FirestoreAuditMetadata {
  companyId: string;       // ID estável da Empresa (Tenant) à qual o registro pertence (Obrigatório na Fase 2B.2)
  ownerUid?: string;       // UID estável do operador/usuário autor do registro
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Modelo de persistência da Ordem de Serviço de Ferramentaria no Firestore.
 * 
 * Estratégia de modelagem:
 * - A coleção principal é 'tooling_orders'.
 * - Cada documento possui ID estável (ex: `os-12345678` ou gerado pelo Firestore).
 * - O código visual legível `osNumber` (ex: `OS-2026-0001`) é preservado e indexado unicamente.
 * - `posList` e seus roteiros `routing` são armazenados dentro do documento da OS,
 *   garantindo transações atômicas de leitura e escrita para o projeto do molde/ferramenta,
 *   ao mesmo tempo que cada POS e etapa possuem IDs estáveis próprios (`pos.id` e `step.id`).
 */
export type ToolingOSDocument = ToolingOS & FirestoreAuditMetadata;

/**
 * Modelo de persistência dos Apontamentos de Horas de Ferramentaria no Firestore.
 * 
 * Estratégia de modelagem:
 * - Coleção de nível superior 'tooling_time_entries'.
 * - Permite consultas otimizadas por operador, centro de trabalho, intervalo de datas,
 *   bem como agregações e relatórios analíticos globais sem precisar ler todas as OSs.
 * - Chaves estrangeiras estáveis: `osId`, `posId`, `stepOrder`.
 * - Códigos legíveis de apoio para visualização rápida: `osNumber`, `posNumber`.
 */
export type ToolingTimeEntryDocument = ToolingTimeEntry & FirestoreAuditMetadata;

/**
 * Modelo de persistência dos Centros de Trabalho no Firestore.
 */
export type WorkCenterDocument = WorkCenter & FirestoreAuditMetadata;

/**
 * Planejamento de Integridade Referencial para Operações Futuras:
 * 
 * 1. Exclusão de Apontamento (`ToolingTimeEntry`):
 *    - Remove o documento em `tooling_time_entries/{entryId}`.
 *    - Recalcula as horas realizadas da etapa correspondente na OS mãe (`pos.routing[step].actualHours`)
 *      e o total da POS (`pos.actualHours`), atualizando a OS atomicamente.
 * 
 * 2. Exclusão de POS (`ToolingPOS`):
 *    - Verifica se existem apontamentos vinculados na coleção `tooling_time_entries` onde `posId == id`.
 *    - Se houver apontamentos, a exclusão física é bloqueada ou exige confirmação para arquivamento lógico (`status: 'cancelada'`).
 * 
 * 3. Exclusão de OS (`ToolingOS`):
 *    - Verifica se existem apontamentos de tempo registrados (`osId == id`).
 *    - Para preservar histórico contábil e de auditoria industrial, deve-se preferir soft-delete / status `cancelada`.
 */
