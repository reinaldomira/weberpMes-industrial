import { 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  collectionGroup
} from 'firebase/firestore';
import { getFirestoreDb } from '../lib/firebase';
import { FIRESTORE_COLLECTIONS } from './firestoreCollections';
import { 
  CompanyDocument, 
  CompanyMemberDocument, 
  UserActiveMembership 
} from './companyFirestoreTypes';
import { handleFirestoreError, OperationType } from './firestoreErrors';

/**
 * Serviço de Gerenciamento de Empresas e Membros (Multi-Tenancy)
 * WebErpMes Industrial — Fase 2B.2
 * 
 * DIRETRIZES DE SEGURANÇA:
 * 1. O frontend não possui permissão para criar empresas arbitrárias ou autoatribuir papel de 'admin'.
 * 2. O primeiro administrador e as empresas são provisionados de forma segura e controlada
 *    (via Firebase Console ou script administrativo/backend confiável).
 * 3. Este serviço atua estritamente na consulta e validação de pertinência do usuário à empresa.
 */
export const companyService = {
  /**
   * Verifica se o Firestore está disponível no ambiente
   */
  isAvailable(): boolean {
    return getFirestoreDb() !== null;
  },

  /**
   * Obtém os dados de uma empresa específica pelo seu ID estável
   */
  async getCompany(companyId: string): Promise<CompanyDocument | null> {
    const db = getFirestoreDb();
    if (!db || !companyId) return null;

    const path = `${FIRESTORE_COLLECTIONS.COMPANIES}/${companyId}`;
    try {
      const companyRef = doc(db, FIRESTORE_COLLECTIONS.COMPANIES, companyId);
      const snapshot = await getDoc(companyRef);
      if (!snapshot.exists()) return null;

      return {
        id: snapshot.id,
        ...snapshot.data()
      } as CompanyDocument;
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
        handleFirestoreError(error, OperationType.GET, path);
      }
      console.warn(`[companyService] Não foi possível carregar a empresa ${companyId}:`, error);
      return null;
    }
  },

  /**
   * Consulta o vínculo e permissão de um membro específico dentro de uma empresa
   */
  async getCompanyMember(companyId: string, uid: string): Promise<CompanyMemberDocument | null> {
    const db = getFirestoreDb();
    if (!db || !companyId || !uid) return null;

    const path = `${FIRESTORE_COLLECTIONS.COMPANIES}/${companyId}/${FIRESTORE_COLLECTIONS.MEMBERS_SUBCOLLECTION}/${uid}`;
    try {
      const memberRef = doc(
        db, 
        FIRESTORE_COLLECTIONS.COMPANIES, 
        companyId, 
        FIRESTORE_COLLECTIONS.MEMBERS_SUBCOLLECTION, 
        uid
      );
      const snapshot = await getDoc(memberRef);
      if (!snapshot.exists()) return null;

      return {
        uid: snapshot.id,
        ...snapshot.data()
      } as CompanyMemberDocument;
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
        handleFirestoreError(error, OperationType.GET, path);
      }
      console.warn(`[companyService] Falha ao consultar membro ${uid} na empresa ${companyId}:`, error);
      return null;
    }
  },

  /**
   * Busca todas as associações ativas do usuário com empresas
   * Utiliza consulta em grupo de coleções 'members' filtrando por UID
   */
  async getUserMemberships(uid: string): Promise<UserActiveMembership[]> {
    const db = getFirestoreDb();
    if (!db || !uid) return [];

    try {
      const membersQuery = query(
        collectionGroup(db, FIRESTORE_COLLECTIONS.MEMBERS_SUBCOLLECTION),
        where('uid', '==', uid)
      );

      const querySnapshot = await getDocs(membersQuery);
      const memberships: UserActiveMembership[] = [];

      for (const memberDoc of querySnapshot.docs) {
        const memberData = memberDoc.data() as CompanyMemberDocument;
        const companyId = memberData.companyId || memberDoc.ref.parent.parent?.id;

        if (companyId) {
          const company = await this.getCompany(companyId);
          if (company && company.status === 'active') {
            memberships.push({
              company,
              member: {
                ...memberData,
                uid: memberDoc.id,
                companyId
              }
            });
          }
        }
      }

      return memberships;
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
        handleFirestoreError(error, OperationType.LIST, FIRESTORE_COLLECTIONS.MEMBERS_SUBCOLLECTION);
      }
      console.warn(`[companyService] Falha ao consultar associações do usuário ${uid}:`, error);
      return [];
    }
  }
};
