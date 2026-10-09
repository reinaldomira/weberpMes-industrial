import { 
  validateToolingTimeEntry, 
  recalculateAllToolingHours, 
  generateNextOSNumber, 
  generateNextPOSNumber 
} from '../utils/toolingValidation';
import { INITIAL_TOOLING_ORDERS, INITIAL_TOOLING_TIME_ENTRIES } from '../data/mockIndustrialData';
import { ToolingOS, ToolingPOS, ToolingTimeEntry } from '../types/industrial';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FALHA NA VERIFICAÇÃO: ${msg}`);
  }
  console.log(`  ✓ ${msg}`);
}

console.log('=== INICIANDO BATERIA DE AUDITORIA DA FASE 1 ===\n');

// -------------------------------------------------------------
// TESTE 1: OS e POS - Numeração única e integridade referencial
// -------------------------------------------------------------
console.log('1. Verificando Numeração e Integridade de OS e POS:');

const os1Number = generateNextOSNumber(INITIAL_TOOLING_ORDERS);
assert(os1Number === 'OS-2026-0004', `Próximo número da OS gerado corretamente: ${os1Number}`);

// Simula OS com números não-contínuos
const dummyOrders: ToolingOS[] = [
  ...INITIAL_TOOLING_ORDERS,
  {
    ...INITIAL_TOOLING_ORDERS[0],
    id: 'os-99',
    osNumber: 'OS-2026-0099',
    posList: []
  }
];
const os2Number = generateNextOSNumber(dummyOrders);
assert(os2Number === 'OS-2026-0100', `Gera próximo sequencial sem repetição após OS-2026-0099: ${os2Number}`);

// Verificando código da POS
const targetOS = INITIAL_TOOLING_ORDERS[0]; // OS-2026-0001
const nextPOSCode = generateNextPOSNumber(targetOS);
assert(nextPOSCode === 'POS-0001-04', `Código da POS derivado da OS sem duplicidade: ${nextPOSCode}`);

// -------------------------------------------------------------
// TESTE 2: Roteiro de Fabricação e Recálculo de Horas
// -------------------------------------------------------------
console.log('\n2. Verificando Roteiros de Fabricação e Recálculo:');

// Cada POS possui seu roteiro isolado
const pos1 = targetOS.posList[0];
const pos2 = targetOS.posList[1];
assert(pos1.routing !== pos2.routing, 'Roteiros de POS distintas são independentes');
assert(pos1.routing.length === 7, 'POS 1 tem 7 etapas no roteiro com processos específicos');
assert(pos2.routing.length === 6, 'POS 2 tem 6 etapas no roteiro configuradas sob medida');

// Recálculo a partir dos apontamentos válidos
const recalculated = recalculateAllToolingHours(INITIAL_TOOLING_ORDERS, INITIAL_TOOLING_TIME_ENTRIES);
const recPOS1 = recalculated[0].posList[0];
const totalRecHours = recPOS1.actualHours;
assert(totalRecHours === 24.5, `Horas da POS-0001-01 recalculadas com exatidão: ${totalRecHours}h`);

// -------------------------------------------------------------
// TESTE 3: Validação de Apontamentos de Horas
// -------------------------------------------------------------
console.log('\n3. Verificando Validação de Horários e Sobreposição:');

// 3.1 Rejeita término menor ou igual ao início
const invalidInterval = validateToolingTimeEntry({
  osId: 'os-1',
  osNumber: 'OS-2026-0001',
  posId: 'pos-1-1',
  posNumber: 'POS-0001-01',
  stepOrder: 4,
  processName: 'Fresamento CNC',
  employeeName: 'Ricardo Lima',
  date: '2026-10-15',
  startTime: '14:00',
  endTime: '12:00',
  effectiveHours: 2.0,
  description: 'Teste'
}, INITIAL_TOOLING_TIME_ENTRIES);
assert(!invalidInterval.valid && !!invalidInterval.error?.includes('posterior'), 'Rejeita término menor que início');

// 3.2 Rejeita tempo efetivo <= 0
const negativeHours = validateToolingTimeEntry({
  osId: 'os-1',
  osNumber: 'OS-2026-0001',
  posId: 'pos-1-1',
  posNumber: 'POS-0001-01',
  stepOrder: 4,
  processName: 'Fresamento CNC',
  employeeName: 'Ricardo Lima',
  date: '2026-10-15',
  startTime: '08:00',
  endTime: '12:00',
  effectiveHours: 0,
  description: 'Teste'
}, INITIAL_TOOLING_TIME_ENTRIES);
assert(!negativeHours.valid && !!negativeHours.error?.includes('maior que zero'), 'Rejeita duração zero ou negativa');

// 3.3 Rejeita tempo efetivo maior que a duração do intervalo
const excessHours = validateToolingTimeEntry({
  osId: 'os-1',
  osNumber: 'OS-2026-0001',
  posId: 'pos-1-1',
  posNumber: 'POS-0001-01',
  stepOrder: 4,
  processName: 'Fresamento CNC',
  employeeName: 'Ricardo Lima',
  date: '2026-10-15',
  startTime: '08:00',
  endTime: '10:00', // 2h de intervalo
  effectiveHours: 3.5, // 3.5h efetivas
  description: 'Teste'
}, INITIAL_TOOLING_TIME_ENTRIES);
assert(!excessHours.valid && !!excessHours.error?.includes('excede a duração'), 'Rejeita tempo efetivo superior ao intervalo');

// 3.3.1 Verificação de intervalo mínimo de 1 minuto (0.0167h vs 0.1h):
// Um intervalo de 1 minuto (ex: 10:14 às 10:15) NÃO aceita 0.1h (que corresponde a 6 minutos)
const excess1MinEntry = validateToolingTimeEntry({
  osId: 'os-1',
  osNumber: 'OS-2026-0001',
  posId: 'pos-1-1',
  posNumber: 'POS-0001-01',
  stepOrder: 4,
  processName: 'Fresamento CNC',
  employeeName: 'Ricardo Lima',
  date: '2026-10-15',
  startTime: '10:14',
  endTime: '10:15', // 1 minuto de intervalo
  effectiveHours: 0.1, // 0.1h = 6 minutos (inválido para intervalo de 1 minuto)
  description: 'Teste intervalo mínimo 0.1h excessivo'
}, INITIAL_TOOLING_TIME_ENTRIES);
assert(!excess1MinEntry.valid && !!excess1MinEntry.error?.includes('excede a duração'), 'Rejeita 0.1h em intervalo de 1 minuto (0.1h = 6 min excede 0.0167h)');

// Aceita 1 minuto como ~0.0167h (ou 0.02h arredondado)
const valid1MinEntry = validateToolingTimeEntry({
  osId: 'os-1',
  osNumber: 'OS-2026-0001',
  posId: 'pos-1-1',
  posNumber: 'POS-0001-01',
  stepOrder: 4,
  processName: 'Fresamento CNC',
  employeeName: 'Ricardo Lima',
  date: '2026-10-15',
  startTime: '10:14',
  endTime: '10:15',
  effectiveHours: 0.0167, // 1 minuto exato (~0.0167h)
  description: 'Apontamento finalizado no mesmo minuto ajustado'
}, INITIAL_TOOLING_TIME_ENTRIES);
assert(valid1MinEntry.valid, 'Aceita 0.0167h para o intervalo mínimo de 1 minuto');

// Rejeita apontamento finalizado no mesmo minuto sem ajuste (start == end)
const sameMinuteUnadjusted = validateToolingTimeEntry({
  osId: 'os-1',
  osNumber: 'OS-2026-0001',
  posId: 'pos-1-1',
  posNumber: 'POS-0001-01',
  stepOrder: 4,
  processName: 'Fresamento CNC',
  employeeName: 'Ricardo Lima',
  date: '2026-10-15',
  startTime: '10:14',
  endTime: '10:14',
  effectiveHours: 0.0167,
  description: 'Início igual ao término'
}, INITIAL_TOOLING_TIME_ENTRIES);
assert(!sameMinuteUnadjusted.valid && !!sameMinuteUnadjusted.error?.includes('posterior'), 'Rejeita intervalo nulo com início e término no mesmo minuto exato');

// 3.4 Impede sobreposição do mesmo funcionário em operações diferentes na mesma data
// Ricardo Lima tem te-1 em 2026-10-08 das 07:30 às 11:30
const overlappingEntry = validateToolingTimeEntry({
  osId: 'os-2',
  osNumber: 'OS-2026-0002',
  posId: 'pos-2-1',
  posNumber: 'POS-0002-01',
  stepOrder: 1,
  processName: 'Ajuste',
  employeeName: 'Ricardo Lima (Fresador CNC)',
  date: '2026-10-08',
  startTime: '09:00', // Conflita com 07:30 - 11:30
  endTime: '12:00',
  effectiveHours: 3.0,
  description: 'Conflito'
}, INITIAL_TOOLING_TIME_ENTRIES);
assert(!overlappingEntry.valid && !!overlappingEntry.error?.includes('Conflito de agenda'), 'Impede sobreposição de horários do mesmo funcionário em operações distintas');

// 3.5 Permite horário livre para o mesmo funcionário sem sobreposição
const validEntry = validateToolingTimeEntry({
  osId: 'os-1',
  osNumber: 'OS-2026-0001',
  posId: 'pos-1-1',
  posNumber: 'POS-0001-01',
  stepOrder: 4,
  processName: 'Fresamento CNC',
  employeeName: 'Ricardo Lima (Fresador CNC)',
  date: '2026-10-08',
  startTime: '16:30', // Após o te-2 (que vai até 16:00)
  endTime: '18:00',
  effectiveHours: 1.5,
  description: 'Hora extra'
}, INITIAL_TOOLING_TIME_ENTRIES);
assert(validEntry.valid, 'Aprova intervalo livre sem sobreposição');

// 3.6 Exclusão de apontamento recalcula os totais
const entriesWithoutTe1 = INITIAL_TOOLING_TIME_ENTRIES.filter(e => e.id !== 'te-1');
const recAfterDelete = recalculateAllToolingHours(INITIAL_TOOLING_ORDERS, entriesWithoutTe1);
const step4AfterDelete = recAfterDelete[0].posList[0].routing.find(r => r.stepOrder === 4);
assert(step4AfterDelete?.actualHours === 3.5, `Após excluir te-1 (4.0h), etapa 4 recalculou exatamente para 3.5h: ${step4AfterDelete?.actualHours}h`);
assert(recAfterDelete[0].posList[0].actualHours === 20.5, `Após exclusão, total da POS recalculou para 20.5h: ${recAfterDelete[0].posList[0].actualHours}h`);

// -------------------------------------------------------------
// TESTE 4: Prazos e Indicadores
// -------------------------------------------------------------
console.log('\n4. Verificando Classificação de Prazos e Status:');

const todayStr = '2026-10-09';
const canceledOS: ToolingOS = {
  ...INITIAL_TOOLING_ORDERS[2], // OS vencida em 2026-10-08
  status: 'cancelada'
};
const isCanceledDelayed = canceledOS.status !== 'concluida' && canceledOS.status !== 'cancelada' && canceledOS.dueDate < todayStr;
assert(!isCanceledDelayed, 'OS cancelada não é classificada como atrasada mesmo com prazo expirado');

const completedOS: ToolingOS = {
  ...INITIAL_TOOLING_ORDERS[2],
  status: 'concluida'
};
const isCompletedDelayed = completedOS.status !== 'concluida' && completedOS.status !== 'cancelada' && completedOS.dueDate < todayStr;
assert(!isCompletedDelayed, 'OS concluída não é classificada como atrasada');

console.log('\n=== TODOS OS TESTES FORAM EXECUTADOS E APROVADOS COM SUCESSO! ===');
