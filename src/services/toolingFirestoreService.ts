import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy,
  QueryConstraint
} from 'firebase/firestore';
import { getFirestoreDb } from '../lib/firebase';
import { FIRESTORE_COLLECTIONS } from './firestoreCollections';
import { ToolingOS, ToolingTimeEntry, WorkCenter } from '../types/industrial';
import { ToolingOSDocument, ToolingTimeEntryDocument } from './toolingFirestoreTypes';
import { handleFirestoreError, OperationType } from './firestoreErrors';

/**
 * Serviço de preparação para o Cloud Firestore (Módulo Ferramentaria).
 * 
 * FASE 2B.2 (ISOLAMENTO MULTI-TENANT POR COMPANY_ID):
 * - Todas as consultas e gravações são planejadas para filtrar e associar o `companyId`.
 * - Não conecta a interface visual com persistência direta nesta etapa, mantendo estados React seguros.
 * - Caso o Firebase não esteja configurado, retorna avisos/erros descritivos sem quebrar a aplicação.
 */
export const toolingFirestoreService = {
  /**
   * Verifica se o Firestore está disponível e inicializado.
   */
  isAvailable(): boolean {
    return getFirestoreDb() !== null;
  },

  /**
   * Busca todas as Ordens de Serviço (OS) do Firestore filtradas pela Empresa autorizada.
   */
  async getToolingOrders(companyId?: string): Promise<ToolingOS[]> {
    const db = getFirestoreDb();
    if (!db) {
      console.warn('[toolingFirestoreService] Firestore não inicializado. Retornando lista vazia.');
      return [];
    }

    const colRef = collection(db, FIRESTORE_COLLECTIONS.TOOLING_ORDERS);
    const constraints: QueryConstraint[] = [];
    
    if (companyId) {
      constraints.push(where('companyId', '==', companyId));
    }
    constraints.push(orderBy('osNumber', 'desc'));

    try {
      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnap => docSnap.data() as ToolingOS);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
        handleFirestoreError(error, OperationType.LIST, FIRESTORE_COLLECTIONS.TOOLING_ORDERS);
      }
      console.warn('[toolingFirestoreService] Erro ao buscar OSs:', error);
      return [];
    }
  },

  /**
   * Salva ou atualiza uma Ordem de Serviço (OS) no Firestore vinculada à Empresa correspondente.
   */
  async saveToolingOrder(order: ToolingOS, companyId: string, ownerUid?: string): Promise<void> {
    const db = getFirestoreDb();
    if (!db) {
      throw new Error('Cloud Firestore não está configurado. Verifique as variáveis de ambiente.');
    }

    if (!companyId) {
      throw new Error('[Segurança Multi-Tenant] companyId é obrigatório para registrar Ordens de Serviço.');
    }

    const docPath = `${FIRESTORE_COLLECTIONS.TOOLING_ORDERS}/${order.id}`;
    const docRef = doc(db, FIRESTORE_COLLECTIONS.TOOLING_ORDERS, order.id);
    const orderDoc: ToolingOSDocument = {
      ...order,
      companyId,
      ownerUid,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(docRef, orderDoc, { merge: true });
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
        handleFirestoreError(error, OperationType.WRITE, docPath);
      }
      throw error;
    }
  },

  /**
   * Busca Apontamentos de Horas de Ferramentaria filtrados por Empresa e opcionalmente por OS.
   */
  async getToolingTimeEntries(companyId?: string, osIdFilter?: string): Promise<ToolingTimeEntry[]> {
    const db = getFirestoreDb();
    if (!db) {
      console.warn('[toolingFirestoreService] Firestore não inicializado. Retornando lista vazia.');
      return [];
    }

    const colRef = collection(db, FIRESTORE_COLLECTIONS.TOOLING_TIME_ENTRIES);
    const constraints: QueryConstraint[] = [];
    
    if (companyId) {
      constraints.push(where('companyId', '==', companyId));
    }
    if (osIdFilter) {
      constraints.push(where('osId', '==', osIdFilter));
    }
    constraints.push(orderBy('date', 'desc'));

    try {
      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnap => docSnap.data() as ToolingTimeEntry);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
        handleFirestoreError(error, OperationType.LIST, FIRESTORE_COLLECTIONS.TOOLING_TIME_ENTRIES);
      }
      console.warn('[toolingFirestoreService] Erro ao buscar apontamentos:', error);
      return [];
    }
  },

  /**
   * Registra um apontamento de horas no Firestore com chave de tenant (companyId) e operador (ownerUid).
   */
  async saveToolingTimeEntry(entry: ToolingTimeEntry, companyId: string, ownerUid?: string): Promise<void> {
    const db = getFirestoreDb();
    if (!db) {
      throw new Error('Cloud Firestore não está configurado. Verifique as variáveis de ambiente.');
    }

    if (!companyId) {
      throw new Error('[Segurança Multi-Tenant] companyId é obrigatório para registrar Apontamentos.');
    }

    const docPath = `${FIRESTORE_COLLECTIONS.TOOLING_TIME_ENTRIES}/${entry.id}`;
    const docRef = doc(db, FIRESTORE_COLLECTIONS.TOOLING_TIME_ENTRIES, entry.id);
    const entryDoc: ToolingTimeEntryDocument = {
      ...entry,
      companyId,
      ownerUid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(docRef, entryDoc, { merge: true });
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
        handleFirestoreError(error, OperationType.WRITE, docPath);
      }
      throw error;
    }
  },

  /**
   * Busca Centros de Trabalho pertencentes à Empresa.
   */
  async getWorkCenters(companyId?: string): Promise<WorkCenter[]> {
    const db = getFirestoreDb();
    if (!db) {
      return [];
    }

    const colRef = collection(db, FIRESTORE_COLLECTIONS.WORK_CENTERS);
    try {
      if (companyId) {
        const q = query(colRef, where('companyId', '==', companyId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap => docSnap.data() as WorkCenter);
      }

      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(docSnap => docSnap.data() as WorkCenter);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
        handleFirestoreError(error, OperationType.LIST, FIRESTORE_COLLECTIONS.WORK_CENTERS);
      }
      console.warn('[toolingFirestoreService] Erro ao buscar centros de trabalho:', error);
      return [];
    }
  }
};
