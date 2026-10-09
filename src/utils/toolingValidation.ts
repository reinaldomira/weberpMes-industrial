import { ToolingOS, ToolingPOS, ToolingTimeEntry, ToolingStepStatus, ToolingPOSStatus } from '../types/industrial';

/**
 * Validação rigorosa de apontamento de horas de ferramentaria:
 * 1. Formato de horário HH:mm válido
 * 2. Horário de término estritamente posterior ao de início
 * 3. Tempo efetivo maior que zero e compatível com a duração do intervalo
 * 4. Rejeição de intervalo duplicado para a mesma etapa
 * 5. Rejeição de sobreposição de horário do mesmo funcionário em qualquer etapa/operação/OS na mesma data
 */
export function validateToolingTimeEntry(
  newEntry: Omit<ToolingTimeEntry, 'id'>,
  existingEntries: ToolingTimeEntry[],
  currentEntryId?: string
): { valid: boolean; error?: string } {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(newEntry.startTime) || !timeRegex.test(newEntry.endTime)) {
    return { valid: false, error: 'Horário em formato inválido. Utilize o formato HH:mm (ex: 08:00).' };
  }

  const [sh, sm] = newEntry.startTime.split(':').map(Number);
  const [eh, em] = newEntry.endTime.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (endMinutes <= startMinutes) {
    return { 
      valid: false, 
      error: `A hora de término (${newEntry.endTime}) deve ser posterior à hora de início (${newEntry.startTime}). Duração negativa ou nula é inválida.` 
    };
  }

  const intervalMinutes = endMinutes - startMinutes;
  const exactDurationHours = intervalMinutes / 60;
  // Duração máxima permitida considerando arredondamentos para 2 ou 4 casas decimais (ex: 1min = ~0.0167h ou 0.02h)
  const maxAllowedDuration = Math.max(exactDurationHours, Number(exactDurationHours.toFixed(2)));
  const displayDuration = intervalMinutes === 1 ? '0.0167' : Number(exactDurationHours.toFixed(2));

  if (newEntry.effectiveHours <= 0) {
    return { valid: false, error: 'O tempo efetivo deve ser maior que zero.' };
  }

  if (newEntry.effectiveHours > maxAllowedDuration + 0.0001) {
    return { 
      valid: false, 
      error: `O tempo efetivo informado (${newEntry.effectiveHours}h) excede a duração total do intervalo (${displayDuration}h).` 
    };
  }

  // 1. Verificar duplicidade exata na mesma POS e etapa
  const duplicate = existingEntries.find(e => 
    e.id !== currentEntryId &&
    e.posId === newEntry.posId &&
    e.stepOrder === newEntry.stepOrder &&
    e.date === newEntry.date &&
    e.startTime === newEntry.startTime &&
    e.endTime === newEntry.endTime &&
    e.employeeName.trim().toLowerCase() === newEntry.employeeName.trim().toLowerCase()
  );

  if (duplicate) {
    return { valid: false, error: 'Apontamento idêntico já cadastrado para este mesmo funcionário nesta etapa e horário.' };
  }

  // 2. Impedir sobreposição de horários do mesmo funcionário em QUALQUER operação/POS/OS na mesma data
  const overlap = existingEntries.find(e => {
    if (e.id === currentEntryId) return false;
    if (e.date !== newEntry.date) return false;
    if (e.employeeName.trim().toLowerCase() !== newEntry.employeeName.trim().toLowerCase()) return false;

    const [esh, esm] = e.startTime.split(':').map(Number);
    const [eeh, eem] = e.endTime.split(':').map(Number);
    const existingStartMinutes = esh * 60 + esm;
    const existingEndMinutes = eeh * 60 + eem;

    // Condição padrão de sobreposição: [startA < endB] e [endA > startB]
    return startMinutes < existingEndMinutes && endMinutes > existingStartMinutes;
  });

  if (overlap) {
    return { 
      valid: false, 
      error: `Conflito de agenda: o funcionário "${newEntry.employeeName}" já possui apontamento em ${overlap.osNumber} / ${overlap.posNumber} (Etapa ${overlap.stepOrder} - ${overlap.processName}) das ${overlap.startTime} às ${overlap.endTime} nesta mesma data.` 
    };
  }

  return { valid: true };
}

/**
 * Recalcula o tempo realizado (actualHours) de cada etapa e de cada POS
 * estritamente a partir dos apontamentos válidos registrados.
 */
export function recalculateAllToolingHours(
  orders: ToolingOS[],
  entries: ToolingTimeEntry[]
): ToolingOS[] {
  return orders.map(os => ({
    ...os,
    posList: os.posList.map(pos => {
      const updatedRouting = pos.routing.map(step => {
        const stepEntries = entries.filter(e => 
          (e.posId === pos.id || e.posNumber === pos.posNumber) && 
          e.stepOrder === step.stepOrder
        );
        const stepTotalHours = Number(stepEntries.reduce((acc, e) => acc + e.effectiveHours, 0).toFixed(2));
        
        // Ajusta status da etapa com base nos apontamentos
        let nextStatus = step.status;
        if (stepTotalHours > 0 && nextStatus === 'pendente') {
          nextStatus = 'em_andamento';
        }

        return {
          ...step,
          actualHours: stepTotalHours,
          status: nextStatus
        };
      });

      const posTotalHours = Number(updatedRouting.reduce((acc, s) => acc + s.actualHours, 0).toFixed(2));

      // Determina status coerente da POS
      let posStatus: ToolingPOSStatus = pos.status;
      if (pos.status !== 'cancelada') {
        const allDone = updatedRouting.length > 0 && updatedRouting.every(r => r.status === 'concluida');
        const anyBlocked = updatedRouting.some(r => r.status === 'bloqueada');
        const allPending = updatedRouting.length > 0 && updatedRouting.every(r => r.status === 'pendente' && r.actualHours === 0);

        if (allDone) {
          posStatus = 'concluida';
        } else if (anyBlocked) {
          posStatus = 'pausada';
        } else if (allPending) {
          posStatus = 'planejada';
        } else if (posTotalHours > 0 || updatedRouting.some(r => r.status === 'em_andamento')) {
          posStatus = 'em_andamento';
        }
      }

      return {
        ...pos,
        routing: updatedRouting,
        actualHours: posTotalHours,
        status: posStatus
      };
    })
  }));
}

/**
 * Geração de número sequencial único para OS
 */
export function generateNextOSNumber(orders: ToolingOS[]): string {
  let maxNum = 0;
  orders.forEach(os => {
    const match = os.osNumber.match(/OS-(?:\d{4}-)?(\d+)/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (parsed > maxNum) maxNum = parsed;
    }
  });

  let nextSeq = maxNum + 1;
  let candidate = `OS-2026-${nextSeq.toString().padStart(4, '0')}`;
  while (orders.some(o => o.osNumber === candidate)) {
    nextSeq++;
    candidate = `OS-2026-${nextSeq.toString().padStart(4, '0')}`;
  }
  return candidate;
}

/**
 * Geração de código único para POS subordinada a uma OS
 */
export function generateNextPOSNumber(parentOS: ToolingOS): string {
  const osMatch = parentOS.osNumber.match(/OS-(?:\d{4}-)?(\d+)/);
  const osSeq = osMatch ? osMatch[1].padStart(4, '0') : '0001';

  let maxSuffix = 0;
  parentOS.posList.forEach(pos => {
    const pMatch = pos.posNumber.match(/POS-(?:\d+)-(\d+)/);
    if (pMatch && pMatch[1]) {
      const s = parseInt(pMatch[1], 10);
      if (s > maxSuffix) maxSuffix = s;
    }
  });

  let nextSuffix = maxSuffix + 1;
  let candidate = `POS-${osSeq}-${nextSuffix.toString().padStart(2, '0')}`;
  while (parentOS.posList.some(p => p.posNumber === candidate)) {
    nextSuffix++;
    candidate = `POS-${osSeq}-${nextSuffix.toString().padStart(2, '0')}`;
  }
  return candidate;
}
