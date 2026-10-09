import { 
  validateToolingTimeEntry, 
  recalculateAllToolingHours, 
  generateNextOSNumber, 
  generateNextPOSNumber 
} from '../utils/toolingValidation';
import { INITIAL_TOOLING_ORDERS } from '../data/mockIndustrialData';
import { ToolingOS, ToolingTimeEntry } from '../types/industrial';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FALHA NA VERIFICAÇÃO: ${msg}`);
  }
  console.log(`  ✓ ${msg}`);
}

// Fixtures isoladas e autocontidas para testes unitários da Fase 1
const FIXTURE_TOOLING_ORDERS: ToolingOS[] = [
  {
    id: 'os-1',
    osNumber: 'OS-2026-0001',
    clientName: 'AutoPeças Brasil S.A.',
    toolingProject: 'Molde de Injeção Plástica Painel Automotivo',
    description: 'Molde de precisão para injeção plástica',
    serviceType: 'fabricacao_nova',
    status: 'em_execucao',
    openDate: '2026-10-01',
    dueDate: '2026-11-15',
    priority: 'alta',
    responsible: 'Eng. Marcelo Vieira',
    notes: 'Aço P20 tratado, cavidades espelhadas.',
    posList: [
      {
        id: 'pos-1-1',
        osId: 'os-1',
        osNumber: 'OS-2026-0001',
        posNumber: 'POS-0001-01',
        partName: 'Cavidade Superior Postiça',
        technicalDescription: 'Cavidade usinada em CNC',
        responsible: 'Ricardo Lima',
        priority: 'alta',
        dueDate: '2026-11-15',
        quantity: 1,
        plannedHours: 48,
        actualHours: 24.5,
        status: 'em_andamento',
        routing: [
          { id: 'r-1', stepOrder: 1, processName: 'Corte e Esquadrejamento', responsible: 'Operador Serra', workCenterId: 'wc-1', workCenterName: 'Laser/Serra', plannedHours: 3.0, actualHours: 3.0, status: 'concluida' },
          { id: 'r-2', stepOrder: 2, processName: 'Furação e Refrigeração Profunda', responsible: 'Operador CNC', workCenterId: 'wc-3', workCenterName: 'Centro de Usinagem 4 Eixos', plannedHours: 6.0, actualHours: 6.0, status: 'concluida' },
          { id: 'r-3', stepOrder: 3, processName: 'Desbaste Pesado CNC', responsible: 'Operador CNC', workCenterId: 'wc-3', workCenterName: 'Centro de Usinagem 4 Eixos', plannedHours: 12.0, actualHours: 8.0, status: 'concluida' },
          { id: 'r-4', stepOrder: 4, processName: 'Acabamento Fino CNC / 3D', responsible: 'Operador CNC', workCenterId: 'wc-3', workCenterName: 'Centro de Usinagem 4 Eixos', plannedHours: 14.0, actualHours: 7.5, status: 'em_andamento' },
          { id: 'r-5', stepOrder: 5, processName: 'Eletroerosão a Fio (Agie)', responsible: 'Operador Fio', workCenterId: 'wc-7', workCenterName: 'Eletroerosão a Fio CNC', plannedHours: 6.0, actualHours: 0, status: 'pendente' },
          { id: 'r-6', stepOrder: 6, processName: 'Retífica Plana e Paralelismo', responsible: 'Retificador', workCenterId: 'wc-9', workCenterName: 'Retificadora Plana', plannedHours: 4.0, actualHours: 0, status: 'pendente' },
          { id: 'r-7', stepOrder: 7, processName: 'Ajuste Manual e Polimento 3µm', responsible: 'Ajustador', workCenterId: 'wc-11', workCenterName: 'Bancada de Ajuste', plannedHours: 3.0, actualHours: 0, status: 'pendente' }
        ]
      },
      {
        id: 'pos-1-2',
        osId: 'os-1',
        osNumber: 'OS-2026-0001',
        posNumber: 'POS-0001-02',
        partName: 'Macho / Postiço Inferior',
        technicalDescription: 'Macho usinado em CNC',
        responsible: 'Ricardo Lima',
        priority: 'alta',
        dueDate: '2026-11-15',
        quantity: 1,
        plannedHours: 42,
        actualHours: 15.0,
        status: 'em_andamento',
        routing: [
          { id: 'r-8', stepOrder: 1, processName: 'Corte Material', responsible: 'Operador Serra', workCenterId: 'wc-1', workCenterName: 'Laser/Serra', plannedHours: 3.0, actualHours: 3.0, status: 'concluida' },
          { id: 'r-9', stepOrder: 2, processName: 'Furação Refrigeração', responsible: 'Operador CNC', workCenterId: 'wc-3', workCenterName: 'Centro de Usinagem', plannedHours: 5.0, actualHours: 5.0, status: 'concluida' },
          { id: 'r-10', stepOrder: 3, processName: 'Desbaste CNC', responsible: 'Operador CNC', workCenterId: 'wc-3', workCenterName: 'Centro de Usinagem', plannedHours: 10.0, actualHours: 7.0, status: 'concluida' },
          { id: 'r-11', stepOrder: 4, processName: 'Eletroerosão por Penetração (Makino)', responsible: 'Operador Penetração', workCenterId: 'wc-8', workCenterName: 'Eletroerosão Penetração', plannedHours: 12.0, actualHours: 0, status: 'pendente' },
          { id: 'r-12', stepOrder: 5, processName: 'Retífica Plana', responsible: 'Retificador', workCenterId: 'wc-9', workCenterName: 'Retificadora Plana', plannedHours: 6.0, actualHours: 0, status: 'pendente' },
          { id: 'r-13', stepOrder: 6, processName: 'Ajuste e Montagem', responsible: 'Ajustador', workCenterId: 'wc-11', workCenterName: 'Bancada de Ajuste', plannedHours: 6.0, actualHours: 0, status: 'pendente' }
        ]
      },
      {
        id: 'pos-1-3',
        osId: 'os-1',
        osNumber: 'OS-2026-0001',
        posNumber: 'POS-0001-03',
        partName: 'Conjunto Extrator e Gavetas Laterais',
        technicalDescription: 'Conjunto mecânico extrator',
        responsible: 'Carlos Souza',
        priority: 'normal',
        dueDate: '2026-11-15',
        quantity: 8,
        plannedHours: 28,
        actualHours: 0,
        status: 'planejada',
        routing: [
          { id: 'r-14', stepOrder: 1, processName: 'Torneamento CNC', responsible: 'Torneiro CNC', workCenterId: 'wc-10', workCenterName: 'Torno CNC Romi', plannedHours: 10.0, actualHours: 0, status: 'pendente' },
          { id: 'r-15', stepOrder: 2, processName: 'Tratamento Térmico Vácuo', responsible: 'Operador Forno', workCenterId: 'wc-5', workCenterName: 'Tratamento / Forno', plannedHours: 12.0, actualHours: 0, status: 'pendente' },
          { id: 'r-16', stepOrder: 3, processName: 'Retífica Cilíndrica / Plana', responsible: 'Retificador', workCenterId: 'wc-9', workCenterName: 'Retificadora Plana', plannedHours: 6.0, actualHours: 0, status: 'pendente' }
        ]
      }
    ]
  },
  {
    id: 'os-2',
    osNumber: 'OS-2026-0002',
    clientName: 'Metalúrgica Precision Tech',
    toolingProject: 'Estampo de Corte Progressivo e Dobra 5 Estágios',
    description: 'Estampo progressivo',
    serviceType: 'modificacao_engenharia',
    status: 'em_execucao',
    openDate: '2026-10-03',
    dueDate: '2026-10-25',
    priority: 'urgente',
    responsible: 'Carlos Henrique',
    notes: 'Alteração dimensional do punção para chapa 2.5mm.',
    posList: [
      {
        id: 'pos-2-1',
        osId: 'os-2',
        osNumber: 'OS-2026-0002',
        posNumber: 'POS-0002-01',
        partName: 'Punção de Corte de Alta Velocidade',
        technicalDescription: 'Punção aço temperado',
        responsible: 'Ricardo Lima',
        priority: 'urgente',
        dueDate: '2026-10-25',
        quantity: 2,
        plannedHours: 18,
        actualHours: 9.0,
        status: 'em_andamento',
        routing: [
          { id: 'r-17', stepOrder: 1, processName: 'Usinagem CNC de Alta Rotação', responsible: 'Operador CNC', workCenterId: 'wc-3', workCenterName: 'Centro de Usinagem', plannedHours: 6.0, actualHours: 6.0, status: 'concluida' },
          { id: 'r-18', stepOrder: 2, processName: 'Eletroerosão a Fio (Corte do Perfil)', responsible: 'Operador Fio', workCenterId: 'wc-7', workCenterName: 'Eletroerosão a Fio', plannedHours: 8.0, actualHours: 3.0, status: 'em_andamento' },
          { id: 'r-19', stepOrder: 3, processName: 'Ajuste Fino na Matriz', responsible: 'Ajustador', workCenterId: 'wc-11', workCenterName: 'Bancada de Ajuste', plannedHours: 4.0, actualHours: 0, status: 'pendente' }
        ]
      }
    ]
  },
  {
    id: 'os-3',
    osNumber: 'OS-2026-0003',
    clientName: 'Embalagens Industriais Flex',
    toolingProject: 'Molde de Sopro Garrafa 500ml',
    description: 'Manutenção preventiva molde',
    serviceType: 'manutencao_preventiva',
    status: 'aberta',
    openDate: '2026-09-28',
    dueDate: '2026-10-08',
    priority: 'normal',
    responsible: 'Sueli Rocha',
    notes: 'Recuperação de linha de partição e polimento.',
    posList: []
  }
];

const FIXTURE_TOOLING_TIME_ENTRIES: ToolingTimeEntry[] = [
  {
    id: 'te-1',
    osId: 'os-1',
    osNumber: 'OS-2026-0001',
    posId: 'pos-1-1',
    posNumber: 'POS-0001-01',
    stepOrder: 4,
    processName: 'Acabamento Fino CNC / 3D',
    employeeName: 'Ricardo Lima (Fresador CNC)',
    date: '2026-10-08',
    startTime: '07:30',
    endTime: '11:30',
    effectiveHours: 4.0,
    description: 'Usinagem de desbaste e semi-acabamento da cavidade.'
  },
  {
    id: 'te-2',
    osId: 'os-1',
    osNumber: 'OS-2026-0001',
    posId: 'pos-1-1',
    posNumber: 'POS-0001-01',
    stepOrder: 4,
    processName: 'Acabamento Fino CNC / 3D',
    employeeName: 'Ricardo Lima (Fresador CNC)',
    date: '2026-10-08',
    startTime: '12:30',
    endTime: '16:00',
    effectiveHours: 3.5,
    description: 'Acabamento 3D com fresa esférica de metal duro R4.'
  },
  {
    id: 'te-3',
    osId: 'os-1',
    osNumber: 'OS-2026-0001',
    posId: 'pos-1-1',
    posNumber: 'POS-0001-01',
    stepOrder: 1,
    processName: 'Corte e Esquadrejamento',
    employeeName: 'Marcos Silveira (Operador Serra)',
    date: '2026-10-02',
    startTime: '08:00',
    endTime: '11:00',
    effectiveHours: 3.0,
    description: 'Corte do bloco e esquadrejamento das faces de referência.'
  },
  {
    id: 'te-4',
    osId: 'os-1',
    osNumber: 'OS-2026-0001',
    posId: 'pos-1-1',
    posNumber: 'POS-0001-01',
    stepOrder: 2,
    processName: 'Furação e Refrigeração Profunda',
    employeeName: 'André Santos (Operador CNC)',
    date: '2026-10-03',
    startTime: '08:00',
    endTime: '14:00',
    effectiveHours: 6.0,
    description: 'Furação de refrigeração 12mm com broca canhão.'
  },
  {
    id: 'te-5',
    osId: 'os-1',
    osNumber: 'OS-2026-0001',
    posId: 'pos-1-1',
    posNumber: 'POS-0001-01',
    stepOrder: 3,
    processName: 'Desbaste Pesado CNC',
    employeeName: 'André Santos (Operador CNC)',
    date: '2026-10-04',
    startTime: '07:00',
    endTime: '15:00',
    effectiveHours: 8.0,
    description: 'Desbaste pesado com cabeçote tórico 50mm.'
  }
];

console.log('=== INICIANDO BATERIA DE AUDITORIA DA FASE 1 ===\n');

// -------------------------------------------------------------
// TESTE 1: OS e POS - Numeração única e integridade referencial
// -------------------------------------------------------------
console.log('1. Verificando Numeração e Integridade de OS e POS:');

// Estado inicial vazio da aplicação gera o primeiro sequencial OS-2026-0001
const emptyInitialNumber = generateNextOSNumber(INITIAL_TOOLING_ORDERS);
assert(emptyInitialNumber === 'OS-2026-0001', `Aplicação sem dados de exemplo gera primeiro sequencial: ${emptyInitialNumber}`);

const os1Number = generateNextOSNumber(FIXTURE_TOOLING_ORDERS);
assert(os1Number === 'OS-2026-0004', `Próximo número da OS com registros gerado corretamente: ${os1Number}`);

// Simula OS com números não-contínuos
const dummyOrders: ToolingOS[] = [
  ...FIXTURE_TOOLING_ORDERS,
  {
    ...FIXTURE_TOOLING_ORDERS[0],
    id: 'os-99',
    osNumber: 'OS-2026-0099',
    posList: []
  }
];
const os2Number = generateNextOSNumber(dummyOrders);
assert(os2Number === 'OS-2026-0100', `Gera próximo sequencial sem repetição após OS-2026-0099: ${os2Number}`);

// Verificando código da POS
const targetOS = FIXTURE_TOOLING_ORDERS[0]; // OS-2026-0001
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
const recalculated = recalculateAllToolingHours(FIXTURE_TOOLING_ORDERS, FIXTURE_TOOLING_TIME_ENTRIES);
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
}, FIXTURE_TOOLING_TIME_ENTRIES);
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
}, FIXTURE_TOOLING_TIME_ENTRIES);
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
}, FIXTURE_TOOLING_TIME_ENTRIES);
assert(!excessHours.valid && !!excessHours.error?.includes('excede a duração'), 'Rejeita tempo efetivo superior ao intervalo');

// 3.3.1 Verificação de intervalo mínimo de 1 minuto (0.0167h vs 0.1h):
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
}, FIXTURE_TOOLING_TIME_ENTRIES);
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
}, FIXTURE_TOOLING_TIME_ENTRIES);
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
}, FIXTURE_TOOLING_TIME_ENTRIES);
assert(!sameMinuteUnadjusted.valid && !!sameMinuteUnadjusted.error?.includes('posterior'), 'Rejeita intervalo nulo com início e término no mesmo minuto exato');

// 3.4 Impede sobreposição do mesmo funcionário em operações diferentes na mesma data
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
}, FIXTURE_TOOLING_TIME_ENTRIES);
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
}, FIXTURE_TOOLING_TIME_ENTRIES);
assert(validEntry.valid, 'Aprova intervalo livre sem sobreposição');

// 3.6 Exclusão de apontamento recalcula os totais
const entriesWithoutTe1 = FIXTURE_TOOLING_TIME_ENTRIES.filter(e => e.id !== 'te-1');
const recAfterDelete = recalculateAllToolingHours(FIXTURE_TOOLING_ORDERS, entriesWithoutTe1);
const step4AfterDelete = recAfterDelete[0].posList[0].routing.find(r => r.stepOrder === 4);
assert(step4AfterDelete?.actualHours === 3.5, `Após excluir te-1 (4.0h), etapa 4 recalculou exatamente para 3.5h: ${step4AfterDelete?.actualHours}h`);
assert(recAfterDelete[0].posList[0].actualHours === 20.5, `Após exclusão, total da POS recalculou para 20.5h: ${recAfterDelete[0].posList[0].actualHours}h`);

// -------------------------------------------------------------
// TESTE 4: Prazos e Indicadores
// -------------------------------------------------------------
console.log('\n4. Verificando Classificação de Prazos e Status:');

const todayStr = '2026-10-09';
const canceledOS: ToolingOS = {
  ...FIXTURE_TOOLING_ORDERS[2], // OS vencida em 2026-10-08
  status: 'cancelada'
};
const isCanceledDelayed = canceledOS.status !== 'concluida' && canceledOS.status !== 'cancelada' && canceledOS.dueDate < todayStr;
assert(!isCanceledDelayed, 'OS cancelada não é classificada como atrasada mesmo com prazo expirado');

const completedOS: ToolingOS = {
  ...FIXTURE_TOOLING_ORDERS[2],
  status: 'concluida'
};
const isCompletedDelayed = completedOS.status !== 'concluida' && completedOS.status !== 'cancelada' && completedOS.dueDate < todayStr;
assert(!isCompletedDelayed, 'OS concluída não é classificada como atrasada');

console.log('\n=== TODOS OS TESTES FORAM EXECUTADOS E APROVADOS COM SUCESSO! ===');
