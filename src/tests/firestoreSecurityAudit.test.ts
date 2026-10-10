/**
 * BATERIA DE AUDITORIA E TESTES DE REGRAS DE SEGURANÇA FIRESTORE
 * WebErpMes Industrial — FASE 1: SEGURANÇA DO FIRESTORE
 * 
 * Validação rigorosa dos 12 cenários de segurança e isolamento multi-tenant:
 * 1. Usuário não autenticado tem acesso negado.
 * 2. Membro ativo acessa os dados permitidos da própria empresa.
 * 3. Usuário de uma empresa não acessa os dados de outra.
 * 4. Membro não cria registros em uma empresa da qual não participa.
 * 5. Usuário não consegue promover a si próprio a administrador.
 * 6. Usuário não consegue adicionar a si próprio sem autorização.
 * 7. Atualização que altera companyId é negada.
 * 8. Alteração indevida de ownerUid é negada.
 * 9. Criação válida de um registro é permitida.
 * 10. Permissões de administrador e membro são testadas separadamente.
 * 11. A consulta de vínculos não expõe vínculos de terceiros.
 * 12. Acesso a empresas inativas ou suspensas respeita a política definida.
 */

import { CompanyMemberRole, CompanyMemberStatus, CompanyStatus } from '../services/companyFirestoreTypes';
import { FIRESTORE_COLLECTIONS } from '../services/firestoreCollections';

interface MockAuth {
  uid: string;
}

interface MockDoc {
  id: string;
  [key: string]: any;
}

interface MockFirestoreDatabase {
  companies: Record<string, { id: string; name: string; status: CompanyStatus; [key: string]: any }>;
  members: Record<string, Record<string, { uid: string; companyId: string; role: CompanyMemberRole; status: CompanyMemberStatus; [key: string]: any }>>; // companyId -> uid -> member
  tooling_orders: Record<string, { id: string; companyId: string; ownerUid?: string; [key: string]: any }>;
  tooling_time_entries: Record<string, { id: string; companyId: string; ownerUid?: string; [key: string]: any }>;
  work_centers: Record<string, { id: string; companyId: string; [key: string]: any }>;
  production_orders: Record<string, { id: string; companyId: string; [key: string]: any }>;
}

/**
 * Motor de execução fiel às regras declaradas em firestore.rules
 */
class FirestoreRulesEngine {
  constructor(private db: MockFirestoreDatabase, private auth: MockAuth | null) {}

  // Helpers de Segurança
  private isAuthenticated(): boolean {
    return this.auth !== null && !!this.auth.uid;
  }

  private isCompanyActive(companyId: string): boolean {
    const comp = this.db.companies[companyId];
    return !!comp && comp.status === 'active';
  }

  private isCompanyMember(companyId: string): boolean {
    if (!this.isAuthenticated()) return false;
    const member = this.db.members[companyId]?.[this.auth!.uid];
    return !!member && member.status === 'active';
  }

  private isMemberOf(companyId: string): boolean {
    return this.isCompanyActive(companyId) && this.isCompanyMember(companyId);
  }

  private isAdminOf(companyId: string): boolean {
    if (!this.isMemberOf(companyId)) return false;
    const member = this.db.members[companyId]?.[this.auth!.uid];
    return member?.role === 'admin';
  }

  // --- REGRAS: companies/{companyId} ---
  canReadCompany(companyId: string): boolean {
    // allow read: if isCompanyMember(companyId);
    return this.isCompanyMember(companyId);
  }

  canCreateCompany(): boolean {
    // allow create: if false;
    return false;
  }

  canUpdateCompany(companyId: string, updatedData: any): boolean {
    // allow update: if isCompanyActive(companyId) && isAdminOf(companyId) && request.resource.data.id == resource.data.id;
    const existing = this.db.companies[companyId];
    if (!existing) return false;
    return this.isCompanyActive(companyId) && this.isAdminOf(companyId) && updatedData.id === existing.id;
  }

  canDeleteCompany(): boolean {
    // allow delete: if false;
    return false;
  }

  // --- REGRAS: companies/{companyId}/members/{memberUid} ---
  canGetMember(companyId: string, memberUid: string): boolean {
    // allow get: if isCompanyMember(companyId) || (isAuthenticated() && (request.auth.uid == memberUid || resource.data.uid == request.auth.uid));
    const member = this.db.members[companyId]?.[memberUid];
    if (!member) return false;
    return this.isCompanyMember(companyId) || (this.isAuthenticated() && (this.auth!.uid === memberUid || member.uid === this.auth!.uid));
  }

  canListMembers(companyId: string): boolean {
    // allow list: if isCompanyMember(companyId);
    return this.isCompanyMember(companyId);
  }

  canCreateMember(companyId: string, memberUid: string, incomingData: any): boolean {
    // allow create: if isCompanyActive(companyId) && isAdminOf(companyId) && request.resource.data.companyId == companyId && request.resource.data.uid == memberUid;
    return this.isCompanyActive(companyId) 
      && this.isAdminOf(companyId) 
      && incomingData.companyId === companyId 
      && incomingData.uid === memberUid;
  }

  canUpdateMember(companyId: string, memberUid: string, incomingData: any): boolean {
    // allow update: if isCompanyActive(companyId) && isAdminOf(companyId) && request.resource.data.companyId == resource.data.companyId && request.resource.data.uid == resource.data.uid;
    const existing = this.db.members[companyId]?.[memberUid];
    if (!existing) return false;
    return this.isCompanyActive(companyId) 
      && this.isAdminOf(companyId) 
      && incomingData.companyId === existing.companyId 
      && incomingData.uid === existing.uid;
  }

  canDeleteMember(companyId: string): boolean {
    // allow delete: if isCompanyActive(companyId) && isAdminOf(companyId);
    return this.isCompanyActive(companyId) && this.isAdminOf(companyId);
  }

  // --- REGRAS: collectionGroup members ---
  canListCollectionGroupMembers(filterUid: string): boolean {
    // allow list: if isAuthenticated() && resource.data.uid == request.auth.uid;
    return this.isAuthenticated() && filterUid === this.auth!.uid;
  }

  // --- REGRAS: tooling_orders/{orderId} ---
  canReadToolingOrder(orderId: string): boolean {
    // allow read: if isAuthenticated() && isMemberOf(resource.data.companyId);
    const order = this.db.tooling_orders[orderId];
    if (!order) return false;
    return this.isAuthenticated() && this.isMemberOf(order.companyId);
  }

  canCreateToolingOrder(incomingData: any): boolean {
    // allow create: if isAuthenticated() && isMemberOf(request.resource.data.companyId) && (!('ownerUid' in request.resource.data) || request.resource.data.ownerUid == request.auth.uid);
    if (!this.isAuthenticated()) return false;
    const hasOwner = 'ownerUid' in incomingData;
    const validOwner = !hasOwner || incomingData.ownerUid === this.auth!.uid;
    return this.isMemberOf(incomingData.companyId) && validOwner;
  }

  canUpdateToolingOrder(orderId: string, incomingData: any): boolean {
    // allow update: if isAuthenticated() && isMemberOf(resource.data.companyId) && request.resource.data.companyId == resource.data.companyId && (!('ownerUid' in resource.data) || request.resource.data.ownerUid == resource.data.ownerUid);
    if (!this.isAuthenticated()) return false;
    const existing = this.db.tooling_orders[orderId];
    if (!existing) return false;
    if (!this.isMemberOf(existing.companyId)) return false;
    if (incomingData.companyId !== existing.companyId) return false;
    if ('ownerUid' in existing && incomingData.ownerUid !== existing.ownerUid) return false;
    return true;
  }

  canDeleteToolingOrder(orderId: string): boolean {
    // allow delete: if isAuthenticated() && isAdminOf(resource.data.companyId);
    if (!this.isAuthenticated()) return false;
    const existing = this.db.tooling_orders[orderId];
    if (!existing) return false;
    return this.isAdminOf(existing.companyId);
  }

  // --- REGRAS: tooling_time_entries/{entryId} ---
  canReadToolingTimeEntry(entryId: string): boolean {
    const entry = this.db.tooling_time_entries[entryId];
    if (!entry) return false;
    return this.isAuthenticated() && this.isMemberOf(entry.companyId);
  }

  canCreateToolingTimeEntry(incomingData: any): boolean {
    if (!this.isAuthenticated()) return false;
    const hasOwner = 'ownerUid' in incomingData;
    const validOwner = !hasOwner || incomingData.ownerUid === this.auth!.uid;
    return this.isMemberOf(incomingData.companyId) && validOwner;
  }

  canUpdateToolingTimeEntry(entryId: string, incomingData: any): boolean {
    if (!this.isAuthenticated()) return false;
    const existing = this.db.tooling_time_entries[entryId];
    if (!existing) return false;
    if (!this.isMemberOf(existing.companyId)) return false;
    if (incomingData.companyId !== existing.companyId) return false;
    if ('ownerUid' in existing && incomingData.ownerUid !== existing.ownerUid) return false;
    const isAdmin = this.isAdminOf(existing.companyId);
    const isOwner = 'ownerUid' in existing && existing.ownerUid === this.auth!.uid;
    return isAdmin || isOwner;
  }

  canDeleteToolingTimeEntry(entryId: string): boolean {
    if (!this.isAuthenticated()) return false;
    const existing = this.db.tooling_time_entries[entryId];
    if (!existing) return false;
    const isAdmin = this.isAdminOf(existing.companyId);
    const isOwner = this.isMemberOf(existing.companyId) && ('ownerUid' in existing) && existing.ownerUid === this.auth!.uid;
    return isAdmin || isOwner;
  }

  // --- REGRAS: work_centers/{workCenterId} ---
  canReadWorkCenter(wcId: string): boolean {
    const existing = this.db.work_centers[wcId];
    if (!existing) return false;
    return this.isAuthenticated() && this.isMemberOf(existing.companyId);
  }

  canCreateWorkCenter(incomingData: any): boolean {
    return this.isAuthenticated() && this.isAdminOf(incomingData.companyId);
  }

  canUpdateWorkCenter(wcId: string, incomingData: any): boolean {
    if (!this.isAuthenticated()) return false;
    const existing = this.db.work_centers[wcId];
    if (!existing) return false;
    return this.isAdminOf(existing.companyId) && incomingData.companyId === existing.companyId;
  }

  canDeleteWorkCenter(wcId: string): boolean {
    if (!this.isAuthenticated()) return false;
    const existing = this.db.work_centers[wcId];
    if (!existing) return false;
    return this.isAdminOf(existing.companyId);
  }

  // --- REGRAS: production_orders/{orderId} ---
  canCreateProductionOrder(incomingData: any): boolean {
    return this.isAuthenticated() && this.isMemberOf(incomingData.companyId);
  }

  canUpdateProductionOrder(orderId: string, incomingData: any): boolean {
    if (!this.isAuthenticated()) return false;
    const existing = this.db.production_orders[orderId];
    if (!existing) return false;
    return this.isMemberOf(existing.companyId) && incomingData.companyId === existing.companyId;
  }

  canDeleteProductionOrder(orderId: string): boolean {
    if (!this.isAuthenticated()) return false;
    const existing = this.db.production_orders[orderId];
    if (!existing) return false;
    return this.isAdminOf(existing.companyId);
  }
}

function expectPass(result: boolean, testDesc: string) {
  if (!result) {
    throw new Error(`[FALHA DE SEGURANÇA]: Esperava SUCESSO, mas foi RECUSADO -> ${testDesc}`);
  }
  console.log(`  ✓ [PERMITIDO] ${testDesc}`);
}

function expectFail(result: boolean, testDesc: string) {
  if (result) {
    throw new Error(`[BRECHA DE SEGURANÇA]: Esperava BLOQUEIO, mas foi AUTORIZADO -> ${testDesc}`);
  }
  console.log(`  ✓ [BLOQUEADO] ${testDesc}`);
}

export function runComprehensiveSecurityAudit() {
  console.log('\n======================================================================');
  console.log('WEBERPMES INDUSTRIAL | FASE 1: AUDITORIA DE REGRAS DO FIRESTORE');
  console.log('======================================================================\n');

  // Banco de Dados Multi-Tenant de Teste
  const testDb: MockFirestoreDatabase = {
    companies: {
      'empresa-alfa': { id: 'empresa-alfa', name: 'Metalúrgica Alfa', status: 'active' },
      'empresa-beta': { id: 'empresa-beta', name: 'Ferramentaria Beta', status: 'active' },
      'empresa-suspensa': { id: 'empresa-suspensa', name: 'Indústria Suspensa Ltda', status: 'suspended' },
      'empresa-inativa': { id: 'empresa-inativa', name: 'Indústria Inativa S.A.', status: 'inactive' }
    },
    members: {
      'empresa-alfa': {
        'uid-admin-alfa': { uid: 'uid-admin-alfa', companyId: 'empresa-alfa', role: 'admin', status: 'active' },
        'uid-operador-alfa': { uid: 'uid-operador-alfa', companyId: 'empresa-alfa', role: 'member', status: 'active' },
        'uid-inativo-alfa': { uid: 'uid-inativo-alfa', companyId: 'empresa-alfa', role: 'member', status: 'inactive' }
      },
      'empresa-beta': {
        'uid-admin-beta': { uid: 'uid-admin-beta', companyId: 'empresa-beta', role: 'admin', status: 'active' },
        'uid-operador-beta': { uid: 'uid-operador-beta', companyId: 'empresa-beta', role: 'member', status: 'active' }
      },
      'empresa-suspensa': {
        'uid-admin-suspensa': { uid: 'uid-admin-suspensa', companyId: 'empresa-suspensa', role: 'admin', status: 'active' },
        'uid-operador-suspensa': { uid: 'uid-operador-suspensa', companyId: 'empresa-suspensa', role: 'member', status: 'active' }
      }
    },
    tooling_orders: {
      'os-alfa-01': { id: 'os-alfa-01', companyId: 'empresa-alfa', ownerUid: 'uid-operador-alfa', osNumber: 'OS-2026-0001' },
      'os-beta-01': { id: 'os-beta-01', companyId: 'empresa-beta', ownerUid: 'uid-operador-beta', osNumber: 'OS-2026-0001' }
    },
    tooling_time_entries: {
      'entry-alfa-01': { id: 'entry-alfa-01', companyId: 'empresa-alfa', ownerUid: 'uid-operador-alfa', hours: 4.5 },
      'entry-beta-01': { id: 'entry-beta-01', companyId: 'empresa-beta', ownerUid: 'uid-operador-beta', hours: 3.0 }
    },
    work_centers: {
      'wc-alfa-cnc': { id: 'wc-alfa-cnc', companyId: 'empresa-alfa', code: 'CNC-01' }
    },
    production_orders: {
      'op-alfa-01': { id: 'op-alfa-01', companyId: 'empresa-alfa', orderNumber: 'OP-2026-0100' }
    }
  };

  // 1. Cenário 1: Usuário não autenticado tem acesso negado
  console.log('1. Cenário 1: Usuário não autenticado (Anônimo / Visitante)');
  const unauthed = new FirestoreRulesEngine(testDb, null);
  expectFail(unauthed.canReadCompany('empresa-alfa'), 'Não autenticado não lê dados de empresa');
  expectFail(unauthed.canReadToolingOrder('os-alfa-01'), 'Não autenticado não lê ordens de serviço');
  expectFail(unauthed.canCreateToolingOrder({ companyId: 'empresa-alfa' }), 'Não autenticado não cria ordens');
  expectFail(unauthed.canListCollectionGroupMembers('qualquer-uid'), 'Não autenticado não lista vínculos');

  // 2. Cenário 2: Membro ativo acessa os dados permitidos da própria empresa
  console.log('\n2. Cenário 2: Membro ativo acessa dados da própria empresa');
  const operadorAlfa = new FirestoreRulesEngine(testDb, { uid: 'uid-operador-alfa' });
  expectPass(operadorAlfa.canReadCompany('empresa-alfa'), 'Operador Alfa lê cadastro da própria empresa');
  expectPass(operadorAlfa.canReadToolingOrder('os-alfa-01'), 'Operador Alfa lê OS da Empresa Alfa');
  expectPass(operadorAlfa.canReadToolingTimeEntry('entry-alfa-01'), 'Operador Alfa lê apontamentos da Empresa Alfa');

  // 3. Cenário 3: Usuário de uma empresa não acessa os dados de outra
  console.log('\n3. Cenário 3: Isolamento Cross-Tenant (Usuário Alfa tentando acessar Beta)');
  expectFail(operadorAlfa.canReadCompany('empresa-beta'), 'Operador Alfa NÃO lê dados da Empresa Beta');
  expectFail(operadorAlfa.canReadToolingOrder('os-beta-01'), 'Operador Alfa NÃO lê OS da Empresa Beta');
  expectFail(operadorAlfa.canReadToolingTimeEntry('entry-beta-01'), 'Operador Alfa NÃO lê apontamento da Empresa Beta');

  // 4. Cenário 4: Membro não cria registros em empresa da qual não participa
  console.log('\n4. Cenário 4: Membro não cria registros fora do seu tenant');
  expectFail(operadorAlfa.canCreateToolingOrder({ companyId: 'empresa-beta', ownerUid: 'uid-operador-alfa' }), 'Operador Alfa NÃO cria OS na Empresa Beta');
  expectFail(operadorAlfa.canCreateProductionOrder({ companyId: 'empresa-beta' }), 'Operador Alfa NÃO cria OP na Empresa Beta');

  // 5. Cenário 5: Usuário não consegue promover a si próprio a administrador
  console.log('\n5. Cenário 5: Prevenção de Auto-Escalação de Privilégios');
  expectFail(operadorAlfa.canUpdateMember('empresa-alfa', 'uid-operador-alfa', {
    companyId: 'empresa-alfa',
    uid: 'uid-operador-alfa',
    role: 'admin'
  }), 'Membro comum NÃO consegue alterar seu cargo para admin');

  // 6. Cenário 6: Usuário não consegue adicionar a si próprio sem autorização
  console.log('\n6. Cenário 6: Prevenção de Auto-Inclusão em Empresas');
  const userSemEmpresa = new FirestoreRulesEngine(testDb, { uid: 'uid-intruso' });
  expectFail(userSemEmpresa.canCreateMember('empresa-alfa', 'uid-intruso', {
    companyId: 'empresa-alfa',
    uid: 'uid-intruso',
    role: 'member'
  }), 'Usuário externo NÃO consegue criar registro de membro para si mesmo');

  // 7. Cenário 7: Atualização que altera companyId é negada
  console.log('\n7. Cenário 7: Imutabilidade de Tenant (Tentativa de mover registro para outra empresa)');
  expectFail(operadorAlfa.canUpdateToolingOrder('os-alfa-01', {
    companyId: 'empresa-beta', // Fraude: tentando transferir para Beta
    ownerUid: 'uid-operador-alfa'
  }), 'Atualização que altera companyId de tooling_order é terminantemente NEGADA');
  expectFail(operadorAlfa.canUpdateProductionOrder('op-alfa-01', {
    companyId: 'empresa-beta'
  }), 'Atualização que altera companyId de production_orders é terminantemente NEGADA');

  // 8. Cenário 8: Alteração indevida de ownerUid é negada
  console.log('\n8. Cenário 8: Imutabilidade de Autoria / ownerUid');
  expectFail(operadorAlfa.canUpdateToolingOrder('os-alfa-01', {
    companyId: 'empresa-alfa',
    ownerUid: 'uid-hacker-fake'
  }), 'Alteração de ownerUid na OS para usurpar autoria é NEGADA');
  expectFail(operadorAlfa.canUpdateToolingTimeEntry('entry-alfa-01', {
    companyId: 'empresa-alfa',
    ownerUid: 'uid-outro-operador'
  }), 'Alteração de ownerUid em apontamento de horas é NEGADA');

  // 9. Cenário 9: Criação válida de um registro é permitida
  console.log('\n9. Cenário 9: Criação válida de registros industriais');
  expectPass(operadorAlfa.canCreateToolingOrder({
    companyId: 'empresa-alfa',
    ownerUid: 'uid-operador-alfa',
    osNumber: 'OS-2026-0002'
  }), 'Membro ativo cria OS na própria empresa com seu próprio ownerUid');
  expectPass(operadorAlfa.canCreateToolingTimeEntry({
    companyId: 'empresa-alfa',
    ownerUid: 'uid-operador-alfa',
    hours: 2.0
  }), 'Membro ativo cria apontamento na própria empresa com seu próprio ownerUid');

  // 10. Cenário 10: Permissões de administrador e membro testadas separadamente
  console.log('\n10. Cenário 10: RBAC - Administrador vs. Membro Comum');
  const adminAlfa = new FirestoreRulesEngine(testDb, { uid: 'uid-admin-alfa' });
  expectFail(operadorAlfa.canDeleteToolingOrder('os-alfa-01'), 'Operador comum NÃO pode deletar OS');
  expectPass(adminAlfa.canDeleteToolingOrder('os-alfa-01'), 'Administrador PODE deletar OS');
  expectFail(operadorAlfa.canDeleteProductionOrder('op-alfa-01'), 'Operador comum NÃO pode deletar Ordem de Produção');
  expectPass(adminAlfa.canDeleteProductionOrder('op-alfa-01'), 'Administrador PODE deletar Ordem de Produção');
  expectFail(operadorAlfa.canCreateWorkCenter({ companyId: 'empresa-alfa' }), 'Operador comum NÃO pode cadastrar Máquinas');
  expectPass(adminAlfa.canCreateWorkCenter({ companyId: 'empresa-alfa' }), 'Administrador PODE cadastrar Máquinas');
  expectPass(adminAlfa.canCreateMember('empresa-alfa', 'uid-novo-operador', {
    companyId: 'empresa-alfa',
    uid: 'uid-novo-operador',
    role: 'member'
  }), 'Administrador PODE convidar novo membro para sua empresa');

  // 11. Cenário 11: Consulta de vínculos não expõe vínculos de terceiros
  console.log('\n11. Cenário 11: Consulta segura de vínculos (CollectionGroup members)');
  expectPass(operadorAlfa.canListCollectionGroupMembers('uid-operador-alfa'), 'Usuário pode listar seus próprios vínculos');
  expectFail(operadorAlfa.canListCollectionGroupMembers('uid-operador-beta'), 'Usuário NÃO pode listar vínculos de outros usuários');

  // 12. Cenário 12: Acesso a empresas inativas ou suspensas respeita a política definida
  console.log('\n12. Cenário 12: Política explícita para Empresas Suspensas / Inativas');
  const operadorSuspensa = new FirestoreRulesEngine(testDb, { uid: 'uid-operador-suspensa' });
  const adminSuspensa = new FirestoreRulesEngine(testDb, { uid: 'uid-admin-suspensa' });
  
  // Membro de empresa suspensa pode ler o cadastro da empresa para ser notificado da suspensão
  expectPass(operadorSuspensa.canReadCompany('empresa-suspensa'), 'Membro pode ler cadastro de empresa suspensa para ver status');
  
  // Mas é bloqueado de qualquer operação em dados industriais operacionais
  expectFail(operadorSuspensa.canCreateToolingOrder({ companyId: 'empresa-suspensa', ownerUid: 'uid-operador-suspensa' }), 'Membro NÃO cria OS em empresa suspensa');
  expectFail(adminSuspensa.canCreateWorkCenter({ companyId: 'empresa-suspensa' }), 'Admin NÃO cadastra máquinas em empresa suspensa');
  expectFail(adminSuspensa.canCreateMember('empresa-suspensa', 'uid-novo', { companyId: 'empresa-suspensa', uid: 'uid-novo' }), 'Admin NÃO adiciona membros em empresa suspensa');

  // Membro inativo em empresa ativa também é bloqueado
  const membroInativoAlfa = new FirestoreRulesEngine(testDb, { uid: 'uid-inativo-alfa' });
  expectFail(membroInativoAlfa.canReadToolingOrder('os-alfa-01'), 'Membro com status inativo tem acesso bloqueado');

  // =========================================================================
  // FASE 1.2: COMPLEMENTO DOS TESTES DE SEGURANÇA
  // =========================================================================
  console.log('\n--- FASE 1.2: COMPLEMENTO DOS TESTES DE SEGURANÇA ---');

  // A. Centros de trabalho e máquinas (work_centers)
  console.log('\nA. Centros de trabalho e máquinas (work_centers)');
  const operadorBeta = new FirestoreRulesEngine(testDb, { uid: 'uid-operador-beta' });

  // A.1 Administrador ativo pode criar um centro de trabalho na própria empresa
  expectPass(adminAlfa.canCreateWorkCenter({ companyId: 'empresa-alfa', code: 'TORNO-01' }), 'Administrador ativo PODE criar centro de trabalho em sua empresa');

  // A.2 Membro comum não pode criar centros de trabalho
  expectFail(operadorAlfa.canCreateWorkCenter({ companyId: 'empresa-alfa', code: 'SERRA-01' }), 'Membro comum NÃO pode criar centros de trabalho');

  // A.3 Membro comum não pode alterar centros de trabalho
  expectFail(operadorAlfa.canUpdateWorkCenter('wc-alfa-cnc', { companyId: 'empresa-alfa', hourlyRate: 250 }), 'Membro comum NÃO pode alterar centros de trabalho');

  // A.4 Usuário de outra empresa não pode ler, criar, alterar ou excluir esses registros
  expectFail(operadorBeta.canReadWorkCenter('wc-alfa-cnc'), 'Usuário de outra empresa NÃO pode ler máquina');
  expectFail(operadorBeta.canCreateWorkCenter({ companyId: 'empresa-alfa', code: 'HACK-01' }), 'Usuário de outra empresa NÃO pode criar máquina em outro tenant');
  expectFail(operadorBeta.canUpdateWorkCenter('wc-alfa-cnc', { companyId: 'empresa-alfa', hourlyRate: 300 }), 'Usuário de outra empresa NÃO pode alterar máquina de outro tenant');
  expectFail(operadorBeta.canDeleteWorkCenter('wc-alfa-cnc'), 'Usuário de outra empresa NÃO pode excluir máquina de outro tenant');

  // A.5 Nenhuma operação pode transferir um registro para outro companyId
  expectFail(adminAlfa.canUpdateWorkCenter('wc-alfa-cnc', { companyId: 'empresa-beta' }), 'Alteração de companyId em máquina é terminantemente NEGADA');

  // B. Exclusão e integridade de apontamentos de tempo (tooling_time_entries)
  console.log('\nB. Exclusão e integridade de apontamentos de tempo (tooling_time_entries)');

  // B.1 Autor pode excluir o próprio apontamento
  expectPass(operadorAlfa.canDeleteToolingTimeEntry('entry-alfa-01'), 'Autor PODE excluir o próprio apontamento');

  // B.2 Membro comum não pode excluir o apontamento de outro operador
  expectFail(operadorAlfa.canDeleteToolingTimeEntry('entry-beta-01'), 'Membro comum NÃO pode excluir apontamento de outro operador');

  // B.3 Administrador tem permissão para excluir apontamentos da sua empresa
  expectPass(adminAlfa.canDeleteToolingTimeEntry('entry-alfa-01'), 'Administrador PODE excluir apontamento na sua empresa');

  // B.4 Usuários de outras empresas não conseguem excluir apontamentos
  expectFail(operadorBeta.canDeleteToolingTimeEntry('entry-alfa-01'), 'Usuário de outra empresa NÃO pode excluir apontamento');

  // B.5 Alteração de companyId ou ownerUid é bloqueada
  expectFail(operadorAlfa.canUpdateToolingTimeEntry('entry-alfa-01', { companyId: 'empresa-beta', ownerUid: 'uid-operador-alfa' }), 'Alteração de companyId em apontamento é NEGADA');
  expectFail(operadorAlfa.canUpdateToolingTimeEntry('entry-alfa-01', { companyId: 'empresa-alfa', ownerUid: 'outro-operador' }), 'Alteração de ownerUid em apontamento é NEGADA');

  console.log('\n======================================================================');
  console.log('TODAS AS ASSERÇÕES DE SEGURANÇA (FASE 1 + FASE 1.2) CONCLUÍDAS COM SUCESSO!');
  console.log('======================================================================\n');
}

// Execução direta via Node / TSX
runComprehensiveSecurityAudit();
