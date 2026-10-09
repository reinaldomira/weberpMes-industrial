import React, { useState } from 'react';
import { 
  Sliders, 
  Check, 
  Layers, 
  Settings, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Building2, 
  Flame, 
  RotateCcw,
  Sparkles,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { IndustryProfileConfig, ManufacturingType, CustomFieldDefinition } from '../../types/industrial';

interface IndustryCustomizerProps {
  config: IndustryProfileConfig;
  onUpdateConfig: (newConfig: IndustryProfileConfig) => void;
  onApplyPreset: (presetId: ManufacturingType) => void;
}

export const IndustryCustomizer: React.FC<IndustryCustomizerProps> = ({
  config,
  onUpdateConfig,
  onApplyPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'modules' | 'finance' | 'custom_fields'>('presets');
  const [isAddingField, setIsAddingField] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldDefinition['type']>('text');
  const [fieldModule, setFieldModule] = useState<CustomFieldDefinition['module']>('orders');
  const [fieldRequired, setFieldRequired] = useState(false);

  const presets: { id: ManufacturingType; title: string; desc: string; icon: string }[] = [
    {
      id: 'sheet_metal',
      title: 'Caldeiraria & Chaparia (Sheet Metal)',
      desc: 'Otimizado para corte a laser de fibra, puncionamento, dobradeiras CNC, nesting de chapas e acabamento superficial.',
      icon: '✂️'
    },
    {
      id: 'cnc_machining',
      title: 'Usinagem de Precisão CNC (Machining)',
      desc: 'Focado em tornos CNC, centros de usinagem 3/4/5 eixos, tolerâncias H7/g6, rugosidade Ra e controle GD&T tridimensional.',
      icon: '⚙️'
    },
    {
      id: 'molds_tooling',
      title: 'Moldes, Matrizes & Ferramentaria',
      desc: 'Ideal para fabricação de moldes de injeção, estampo, eletroerosão por penetração/fio e montagem de cavidades.',
      icon: '🧰'
    },
    {
      id: 'plastic_injection',
      title: 'Injeção e Conformação Plástica',
      desc: 'Configurado para máquinas injetoras, tempo de ciclo por injeção, reciclagem de borras e pesagem de galhos.',
      icon: '🧪'
    },
    {
      id: 'custom_assembly',
      title: 'Montagem de Máquinas & Equipamentos',
      desc: 'Projetos sob medida (Make-to-Order), BOM multinível complexa, integração pneumática e testes de comissionamento.',
      icon: '🏭'
    }
  ];

  const handleToggleModule = (key: keyof IndustryProfileConfig['modulesEnabled']) => {
    const updated = {
      ...config,
      modulesEnabled: {
        ...config.modulesEnabled,
        [key]: !config.modulesEnabled[key]
      }
    };
    onUpdateConfig(updated);
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel) return;

    const newField: CustomFieldDefinition = {
      id: `cf-${Date.now()}`,
      name: fieldName || fieldLabel.toLowerCase().replace(/\s+/g, '_'),
      label: fieldLabel,
      type: fieldType,
      module: fieldModule,
      required: fieldRequired,
      defaultValue: ''
    };

    const updated = {
      ...config,
      customFields: [...config.customFields, newField]
    };
    onUpdateConfig(updated);
    setIsAddingField(false);
    setFieldLabel('');
    setFieldName('');
  };

  const handleRemoveField = (id: string) => {
    const updated = {
      ...config,
      customFields: config.customFields.filter(f => f.id !== id)
    };
    onUpdateConfig(updated);
  };

  const handleExportConfig = () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `weberpmes_config_${config.profileId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Personalizador de Recursos & Configurações Industriais
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              WebErpMes Factory Customizer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Adapte as regras de negócio, fluxos de trabalho, taxas e campos customizados especificamente para a realidade da sua fábrica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportConfig}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Config (JSON)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
            activeTab === 'presets'
              ? 'bg-slate-800 text-white font-bold border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Perfil da Fábrica (Presets)</span>
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
            activeTab === 'modules'
              ? 'bg-slate-800 text-white font-bold border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Módulos Ativos</span>
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
            activeTab === 'finance'
              ? 'bg-slate-800 text-white font-bold border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Parâmetros de Custo</span>
        </button>
        <button
          onClick={() => setActiveTab('custom_fields')}
          className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
            activeTab === 'custom_fields'
              ? 'bg-slate-800 text-white font-bold border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Campos Customizados ({config.customFields.length})</span>
        </button>
      </div>

      {/* Tab: Presets */}
      {activeTab === 'presets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">
              Selecione o Segmento de Atuação da sua Indústria
            </h2>
            <p className="text-xs text-slate-400">
              Ao alternar o segmento, os formulários de cotação, postos e fluxos do WebErpMes se ajustam automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {presets.map((p) => {
              const isSelected = config.profileId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onApplyPreset(p.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500 shadow-md ring-1 ring-cyan-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{p.icon}</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-600 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ativo
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Modules Toggle */}
      {activeTab === 'modules' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-white">
              Ativação Modular de Recursos do ERP / MES
            </h2>
            <p className="text-slate-400">
              Desative módulos que a sua operação não utiliza para simplificar a interface para a equipe.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              {
                key: 'quotes' as const,
                title: 'Cotações Paramétricas & CRM',
                desc: 'Cálculo de custos de chapa, tempos de máquina, margens e envio de propostas.'
              },
              {
                key: 'engineeringBom' as const,
                title: 'Engenharia de Produto, BOM & Roteiros',
                desc: 'Estrutura multinível de materiais e passos sequenciais de fabricação.'
              },
              {
                key: 'productionScheduler' as const,
                title: 'Programação de Produção (PCP) & Gantt',
                desc: 'Emissão de OPs e cronograma visual de ocupação de máquinas.'
              },
              {
                key: 'shopFloorKiosk' as const,
                title: 'Terminal de Apontamento Chão de Fábrica (MES)',
                desc: 'Interface touch-screen para operadores registrarem ciclos, boas e refugo.'
              },
              {
                key: 'inventoryLots' as const,
                title: 'Controle de Lotes & Certificados de Usina',
                desc: 'Rastreabilidade estrita de matéria-prima e números de corrida.'
              },
              {
                key: 'qualityControl' as const,
                title: 'Metrologia, Ensaios Dimensionais & RNC',
                desc: 'Fichas de medição, tolerâncias e tratamento de não conformidades.'
              },
              {
                key: 'preventiveMaintenance' as const,
                title: 'Manutenção de Máquinas (TPM) & OEE',
                desc: 'Cálculo de disponibilidade, desempenho e qualidade por centro.'
              },
              {
                key: 'cadViewer' as const,
                title: 'Visualizador Técnico CAD 2D/3D Integrado',
                desc: 'Exibição de cotas, planificação de chapas e wireframe 3D de peças.'
              }
            ].map((m) => {
              const isEnabled = config.modulesEnabled[m.key];
              return (
                <div
                  key={m.key}
                  className={`p-3.5 rounded-lg border flex items-start justify-between gap-3 ${
                    isEnabled ? 'bg-slate-950 border-slate-750' : 'bg-slate-950/40 border-slate-850 opacity-60'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-white text-xs">{m.title}</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">{m.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggleModule(m.key)}
                    className={`px-3 py-1 rounded text-[11px] font-bold shrink-0 transition-colors ${
                      isEnabled
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isEnabled ? 'Ativado' : 'Desativado'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Financial & Cost Parameters */}
      {activeTab === 'finance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-white">
              Parâmetros Financeiros e Fábrica Padrão
            </h2>
            <p className="text-slate-400">
              Taxas padrão aplicadas no simulador de custos de orçamentos e cotações.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-slate-400 mb-1">Razão Social / Nome da Fábrica</label>
              <input
                type="text"
                value={config.companyName}
                onChange={(e) => onUpdateConfig({ ...config, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Overhead Fabril Padrão (%)</label>
              <input
                type="number"
                value={config.defaultOverheadPercent}
                onChange={(e) => onUpdateConfig({ ...config, defaultOverheadPercent: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Margem de Lucro Alvo Padrão (%)</label>
              <input
                type="number"
                value={config.defaultProfitMarginPercent}
                onChange={(e) => onUpdateConfig({ ...config, defaultProfitMarginPercent: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Custom Fields */}
      {activeTab === 'custom_fields' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">
                Campos Customizados por Módulo
              </h2>
              <p className="text-slate-400">
                Adicione atributos técnicos específicos da sua fábrica (ex: "Número de Corrida", "Norma EPS de Solda").
              </p>
            </div>
            <button
              onClick={() => setIsAddingField(true)}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Campo Customizado</span>
            </button>
          </div>

          {/* Add Field Form */}
          {isAddingField && (
            <form onSubmit={handleAddField} className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Rótulo / Nome Visível</label>
                  <input
                    type="text"
                    required
                    value={fieldLabel}
                    onChange={(e) => setFieldLabel(e.target.value)}
                    placeholder="Ex: Código de Tratamento Térmico"
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Módulo Vinculado</label>
                  <select
                    value={fieldModule}
                    onChange={(e) => setFieldModule(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white"
                  >
                    <option value="quotes">Cotações</option>
                    <option value="orders">Ordens de Produção (OP)</option>
                    <option value="inventory">Estoque e Lotes</option>
                    <option value="quality">Controle de Qualidade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Dado</label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-white"
                  >
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="select">Lista de Seleção</option>
                    <option value="boolean">Sim / Não</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsAddingField(false)}
                  className="px-3 py-1 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
                >
                  Criar Campo
                </button>
              </div>
            </form>
          )}

          {/* List of Custom Fields */}
          <div className="border border-slate-800 rounded overflow-hidden">
            <table className="w-full text-left divide-y divide-slate-800">
              <thead className="bg-slate-950 text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Nome do Campo</th>
                  <th className="py-2.5 px-3">Módulo</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Valor Padrão</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                {config.customFields.map((field) => (
                  <tr key={field.id} className="hover:bg-slate-850/40">
                    <td className="py-2.5 px-3 font-sans font-medium text-white">
                      {field.label}
                      <span className="block text-[10px] font-mono text-slate-500">{field.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-cyan-400 uppercase text-[10px]">
                      {field.module}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px]">
                      {field.type}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {field.defaultValue || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleRemoveField(field.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remover campo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
