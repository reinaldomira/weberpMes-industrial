/**
 * Bateria de Testes Automatizados para Regras de Segurança do Cloud Firestore
 * Utilizando @firebase/rules-unit-testing e Firebase Emulator Suite.
 * 
 * Requisito de Execução:
 * - Java JRE/JDK 11+ instalado no ambiente para inicialização do Firestore Emulator.
 * - Comando: firebase emulators:exec "npx tsx src/tests/firestoreRulesEmulator.test.ts"
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { 
  initializeTestEnvironment, 
  RulesTestEnvironment, 
  assertFails, 
  assertSucceeds 
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collectionGroup, getDocs, query, where } from 'firebase/firestore';

const PROJECT_ID = 'weberpmes-test-sandbox';
let testEnv: RulesTestEnvironment;

export async function setupEmulatorTests() {
  const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080,
    },
  });

  // Seed inicial com privilégio de admin do emulador
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    
    // Empresa Alfa (Ativa)
    await setDoc(doc(adminDb, 'companies', 'empresa-alfa'), {
      id: 'empresa-alfa',
      name: 'Indústria Alfa S.A.',
      status: 'active',
      createdAt: new Date().toISOString()
    });

    // Membro Operador Alfa
    await setDoc(doc(adminDb, 'companies', 'empresa-alfa', 'members', 'user-operador-alfa'), {
      uid: 'user-operador-alfa',
      companyId: 'empresa-alfa',
      role: 'member',
      status: 'active',
      joinedAt: new Date().toISOString()
    });

    // Administrador Alfa
    await setDoc(doc(adminDb, 'companies', 'empresa-alfa', 'members', 'user-admin-alfa'), {
      uid: 'user-admin-alfa',
      companyId: 'empresa-alfa',
      role: 'admin',
      status: 'active',
      joinedAt: new Date().toISOString()
    });

    // Membro Inativo Alfa
    await setDoc(doc(adminDb, 'companies', 'empresa-alfa', 'members', 'user-inativo-alfa'), {
      uid: 'user-inativo-alfa',
      companyId: 'empresa-alfa',
      role: 'member',
      status: 'inactive',
      joinedAt: new Date().toISOString()
    });

    // Empresa Beta (Ativa - Tenant Separado)
    await setDoc(doc(adminDb, 'companies', 'empresa-beta'), {
      id: 'empresa-beta',
      name: 'Ferramentaria Beta Ltda',
      status: 'active',
      createdAt: new Date().toISOString()
    });

    await setDoc(doc(adminDb, 'companies', 'empresa-beta', 'members', 'user-operador-beta'), {
      uid: 'user-operador-beta',
      companyId: 'empresa-beta',
      role: 'member',
      status: 'active',
      joinedAt: new Date().toISOString()
    });

    // Empresa Suspensa (Política de Acesso a Inativos/Suspensos)
    await setDoc(doc(adminDb, 'companies', 'empresa-suspensa'), {
      id: 'empresa-suspensa',
      name: 'Empresa Industrial Suspensa',
      status: 'suspended',
      createdAt: new Date().toISOString()
    });

    await setDoc(doc(adminDb, 'companies', 'empresa-suspensa', 'members', 'user-operador-suspensa'), {
      uid: 'user-operador-suspensa',
      companyId: 'empresa-suspensa',
      role: 'member',
      status: 'active',
      joinedAt: new Date().toISOString()
    });

    // OS Inicial em Alfa
    await setDoc(doc(adminDb, 'tooling_orders', 'os-alfa-01'), {
      id: 'os-alfa-01',
      osNumber: 'OS-2026-0001',
      companyId: 'empresa-alfa',
      ownerUid: 'user-operador-alfa',
      client: 'Cliente Teste'
    });
  });
}

/**
 * Executa as 12 asserções de segurança exigidas na Etapa D
 */
export async function runSecurityAssertions() {
  console.log('--- INICIANDO ASSERÇÕES DO RULES UNIT TESTING ---');

  const unauthedDb = testEnv.unauthenticatedContext().firestore();
  const unlinkedDb = testEnv.authenticatedContext('user-sem-empresa').firestore();
  const operadorAlfaDb = testEnv.authenticatedContext('user-operador-alfa').firestore();
  const adminAlfaDb = testEnv.authenticatedContext('user-admin-alfa').firestore();
  const operadorBetaDb = testEnv.authenticatedContext('user-operador-beta').firestore();
  const operadorSuspensaDb = testEnv.authenticatedContext('user-operador-suspensa').firestore();

  // 1. Usuário não autenticado tem acesso negado
  await assertFails(getDoc(doc(unauthedDb, 'companies', 'empresa-alfa')));
  await assertFails(getDoc(doc(unauthedDb, 'tooling_orders', 'os-alfa-01')));

  // 2. Membro ativo acessa os dados permitidos da própria empresa
  await assertSucceeds(getDoc(doc(operadorAlfaDb, 'companies', 'empresa-alfa')));
  await assertSucceeds(getDoc(doc(operadorAlfaDb, 'tooling_orders', 'os-alfa-01')));

  // 3. Usuário de uma empresa não acessa os dados de outra
  await assertFails(getDoc(doc(operadorBetaDb, 'companies', 'empresa-alfa')));
  await assertFails(getDoc(doc(operadorBetaDb, 'tooling_orders', 'os-alfa-01')));

  // 4. Membro não cria registros em uma empresa da qual não participa
  await assertFails(setDoc(doc(operadorBetaDb, 'tooling_orders', 'os-alfa-hacked'), {
    id: 'os-alfa-hacked',
    osNumber: 'OS-2026-9999',
    companyId: 'empresa-alfa'
  }));

  // 5. Usuário não consegue promover a si próprio a administrador
  await assertFails(updateDoc(doc(operadorAlfaDb, 'companies', 'empresa-alfa', 'members', 'user-operador-alfa'), {
    role: 'admin'
  }));

  // 6. Usuário não consegue adicionar a si próprio sem autorização
  await assertFails(setDoc(doc(unlinkedDb, 'companies', 'empresa-alfa', 'members', 'user-sem-empresa'), {
    uid: 'user-sem-empresa',
    companyId: 'empresa-alfa',
    role: 'member',
    status: 'active'
  }));

  // 7. Atualização que altera companyId é negada
  await assertFails(updateDoc(doc(operadorAlfaDb, 'tooling_orders', 'os-alfa-01'), {
    companyId: 'empresa-beta'
  }));

  // 8. Alteração indevida de ownerUid é negada
  await assertFails(updateDoc(doc(operadorAlfaDb, 'tooling_orders', 'os-alfa-01'), {
    ownerUid: 'outro-usuario-falso'
  }));

  // 9. Criação válida de um registro é permitida
  await assertSucceeds(setDoc(doc(operadorAlfaDb, 'tooling_orders', 'os-alfa-02'), {
    id: 'os-alfa-02',
    osNumber: 'OS-2026-0002',
    companyId: 'empresa-alfa',
    ownerUid: 'user-operador-alfa',
    client: 'Cliente Legítimo'
  }));

  // 10. Permissões de administrador e membro são testadas separadamente
  // Operador comum NÃO pode excluir a OS
  await assertFails(deleteDoc(doc(operadorAlfaDb, 'tooling_orders', 'os-alfa-02')));
  // Administrador PODE excluir a OS
  await assertSucceeds(deleteDoc(doc(adminAlfaDb, 'tooling_orders', 'os-alfa-02')));

  // 11. A consulta de vínculos não expõe vínculos de terceiros
  // Consulta de collectionGroup members filtrando pelo próprio UID é permitida
  const ownQuery = query(collectionGroup(operadorAlfaDb, 'members'), where('uid', '==', 'user-operador-alfa'));
  await assertSucceeds(getDocs(ownQuery));

  // Consulta de collectionGroup members de outro usuário ou sem filtro deve falhar
  const stolenQuery = query(collectionGroup(operadorBetaDb, 'members'), where('uid', '==', 'user-operador-alfa'));
  await assertFails(getDocs(stolenQuery));

  // 12. Acesso a empresas inativas ou suspensas respeita a política definida
  // Leitura cadastral para verificar o status é permitida ao membro
  await assertSucceeds(getDoc(doc(operadorSuspensaDb, 'companies', 'empresa-suspensa')));
  // Criação ou leitura de dados operacionais (OS, PCP, Apontamentos) em empresa suspensa é terminantemente bloqueada
  await assertFails(setDoc(doc(operadorSuspensaDb, 'tooling_orders', 'os-suspensa-01'), {
    id: 'os-suspensa-01',
    osNumber: 'OS-2026-0099',
    companyId: 'empresa-suspensa'
  }));

  console.log('--- TODAS AS 12 ASSERÇÕES DO RULES UNIT TESTING CONCLUÍDAS COM SUCESSO! ---');
}

// Auto-execução ao rodar diretamente via tsx/node
async function main() {
  try {
    await setupEmulatorTests();
    await runSecurityAssertions();
    console.log('[SUCESSO] Suíte real do Firebase Emulator executada com êxito!');
    if (testEnv) {
      await testEnv.cleanup();
    }
    process.exit(0);
  } catch (err) {
    console.error('[FALHA] Erro na execução dos testes do Emulator:', err);
    if (testEnv) {
      await testEnv.cleanup();
    }
    process.exit(1);
  }
}

if (process.argv[1]?.includes('firestoreRulesEmulator.test')) {
  main();
}
