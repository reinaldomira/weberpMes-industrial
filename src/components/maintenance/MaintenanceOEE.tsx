import React, { useState } from 'react';
import { 
  Wrench, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Calendar,
  Cpu,
  BarChart2
} from 'lucide-react';
import { MaintenanceRecord, WorkCenter } from '../../types/industrial';

interface MaintenanceOEEProps {
  maintenanceRecords: MaintenanceRecord[];
  workCenters: WorkCenter[];
  onAddMaintenance: (record: MaintenanceRecord) => void;
  onUpdateMaintenanceStatus: (id: string, status: MaintenanceRecord['status']) => void;
}

export const MaintenanceOEE: React.FC<MaintenanceOEEProps> = ({
  maintenanceRecords,
  workCenters,
  onAddMaintenance,
  onUpdateMaintenanceStatus,
}) => {
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [machineId, setMachineId] = useState(workCenters[0]?.id || '');
  const [type, setType] = useState<MaintenanceRecord['type']>('preventive');
  const [scheduledDate, setScheduledDate] = useState('2026-10-20');
  const [technician, setTechnician] = useState('Equipe Manutenção Mecânica');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(2.5);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const wc = workCenters.find(w => w.id === machineId);
    if (!wc) return;

    const newRec: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      machineId: wc.id,
      machineName: wc.name,
      type,
      scheduledDate,
      technician,
      description: description || 'Revisão periódica programada.',
      status: 'scheduled',
      estimatedHours
    };

    onAddMaintenance(newRec);
    setIsNewRecordOpen(false);
    setDescription('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Manutenção Industrial (TPM) & Indicadores OEE
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Overall Equipment Effectiveness
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de planos preventivos, chamados corretivos e cálculo dos 3 pilares do OEE (Disponibilidade, Desempenho e Qualidade).
          </p>
        </div>

        <button
          onClick={() => setIsNewRecordOpen(true)}
          className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Manutenção</span>
        </button>
      </div>

      {/* OEE Breakdown 3 Pillars */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-sm font-bold text-white mb-3">
          Composição dos 3 Pilares do OEE da Planta
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-950 p-4 rounded border border-slate-800">
            <div className="text-xs text-slate-400">1. Disponibilidade</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">89.2%</div>
            <div className="text-[10px] text-slate-500 mt-1">Tempo Operando / Tempo Planejado</div>
          </div>

          <div className="bg-slate-950 p-4 rounded border border-slate-800">
            <div className="text-xs text-slate-400">2. Desempenho</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">94.1%</div>
            <div className="text-[10px] text-slate-500 mt-1">Velocidade Real vs Padrão da Peça</div>
          </div>

          <div className="bg-slate-950 p-4 rounded border border-slate-800">
            <div className="text-xs text-slate-400">3. Qualidade</div>
            <div className="text-2xl font-bold font-mono text-blue-400 mt-1">98.5%</div>
            <div className="text-[10px] text-slate-500 mt-1">Peças Boas / Total Produzido</div>
          </div>

          <div className="bg-cyan-950/40 p-4 rounded border border-cyan-700/80">
            <div className="text-xs text-cyan-300 font-bold">OEE Global Consolidado</div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">82.7%</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">Acima da meta de classe mundial</div>
          </div>
        </div>
      </div>

      {/* Maintenance Tasks List */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Ordens de Serviço de Manutenção Ativas
            </h3>
            <p className="text-[11px] text-slate-400">
              Intervenções preventivas nas máquinas para evitar paradas não planejadas.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {maintenanceRecords.length} ordens registradas
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {maintenanceRecords.length > 0 ? (
            maintenanceRecords.map((m) => {
              const isCompleted = m.status === 'completed';
              const isPrev = m.type === 'preventive';
              return (
                <div key={m.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{m.machineName}</span>
                      <span className="text-slate-600">·</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isPrev ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {isPrev ? 'Preventiva' : 'Corretiva'}
                      </span>
                    </div>
                    <p className="text-slate-300">{m.description}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Data: <strong className="text-slate-200">{m.scheduledDate}</strong></span>
                      <span>·</span>
                      <span>Técnico: {m.technician}</span>
                      <span>·</span>
                      <span>Previsto: {m.estimatedHours} horas</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={m.status}
                      onChange={(e) => onUpdateMaintenanceStatus(m.id, e.target.value as any)}
                      className="bg-slate-950 border border-slate-700 text-white rounded px-2.5 py-1 text-xs"
                    >
                      <option value="scheduled">Agendada</option>
                      <option value="in_progress">Em Execução</option>
                      <option value="completed">Concluída</option>
                    </select>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              Nenhuma ordem de manutenção preventiva ou corretiva agendada.
            </div>
          )}
        </div>
      </div>

      {/* New Maintenance Modal */}
      {isNewRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Agendar Manutenção de Máquina</h2>
              <button onClick={() => setIsNewRecordOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">Centro de Trabalho / Máquina</label>
                <select
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                >
                  {workCenters.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Intervenção</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                  >
                    <option value="preventive">Preventiva Programada</option>
                    <option value="corrective">Corretiva Emergencial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Data Agendada</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Técnico / Equipe Responsável</label>
                <input
                  type="text"
                  required
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Descrição do Serviço / Check-list</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Troca de filtros de ar, lubrificação de guias lineares e calibração ótica."
                  className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRecordOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  Salvar Ordem de Manutenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
