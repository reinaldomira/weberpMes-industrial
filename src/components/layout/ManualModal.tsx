import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Calculator, 
  CalendarClock, 
  HardHat, 
  Boxes, 
  ClipboardCheck, 
  Wrench, 
  Sliders, 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  FileText,
  Search,
  Zap,
  Clock,
  ShieldAlert,
  Flame,
  LayoutDashboard
} from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose, onNavigateToTab }) => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const sections = [
    { id: 'intro', title: '1. Visão Geral & Arquitetura', icon: LayoutDashboard },
    { id: 'fluxo', title: '2. Fluxo Operacional Ponta a Ponta', icon: Zap },
    { id: 'dashboard', title: '3. Cockpit Executivo & OEE', icon: LayoutDashboard },
    { id: 'quotes', title: '4. Cotações & Formação de Custos', icon: Calculator },
    { id: 'engineering', title: '5. Engenharia, BOM & CAD', icon: Layers },
    { id: 'production', title: '6. PCP: Produção Seriada vs Ferramentaria', icon: CalendarClock },
    { id: 'mes_kiosk', title: '7. Terminal Chão de Fábrica (MES)', icon: HardHat },
    { id: 'inventory', title: '8. Estoque, Lotes & Rastreabilidade', icon: Boxes },
    { id: 'quality', title: '9. Controle de Qualidade & RNC', icon: ClipboardCheck },
    { id: 'maintenance', title: '10. Manutenção Industrial (TPM)', icon: Wrench },
    { id: 'customizer', title: '11. Perfis de Indústria & Configurações', icon: Sliders },
    { id: 'faq', title: '12. Dúvidas Frequentes & Boas Práticas', icon: HelpCircle },
  ];

  const handleGoToModule = (tab: string) => {
    if (onNavigateToTab) {
      onNavigateToTab(tab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-950/50">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Manual Completo do WebErpMes Industrial
                <span className="text-xs bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded font-mono font-normal">
                  Guia do Usuário v2.4
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Instruções passo a passo de todos os módulos, regras de cálculo e fluxos de chão de fábrica.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition-colors border border-slate-700"
            >
              Fechar Manual (ESC)
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar de Seções */}
          <div className="w-72 bg-slate-950/50 border-r border-slate-800 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800/80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar tópico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sections
                .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSection(sec.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                        isActive
                          ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                          : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span className="truncate">{sec.title}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
              💡 Dica: Navegue pelo manual ou clique no botão rápido para ir direto ao módulo correspondente.
            </div>
          </div>

          {/* Área Principal de Leitura */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-900/60 space-y-6 text-sm text-slate-300 leading-relaxed">
            
            {/* Seção 1: Visão Geral */}
            {activeSection === 'intro' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 1</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Visão Geral & Arquitetura do Sistema</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    O <strong>WebErpMes</strong> é uma plataforma integrada de gestão industrial (ERP) e execução de chão de fábrica (MES) em tempo real, projetada especialmente para a indústria metalmecânica, usinagem de precisão, caldeiraria pesada, ferramentaria (moldes e matrizes) e injeção plástica.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
                    <div className="text-cyan-400 font-bold mb-1 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> 1. Camada de Gestão (ERP)
                    </div>
                    <p className="text-xs text-slate-400">
                      Formação de preços, orçamentos detalhados com matéria-prima e taxa/hora de máquina, ordens de serviço, controle de estoque rastreado e custos.
                    </p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
                    <div className="text-emerald-400 font-bold mb-1 flex items-center gap-2">
                      <CalendarClock className="w-4 h-4" /> 2. Planejamento (PCP)
                    </div>
                    <p className="text-xs text-slate-400">
                      Roteirização operacional, tempos previstos x realizados, ordens de produção seriadas (OPs) e ordens de ferramentaria multipostas (OS).
                    </p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
                    <div className="text-amber-400 font-bold mb-1 flex items-center gap-2">
                      <HardHat className="w-4 h-4" /> 3. Execução Chão de Fábrica (MES)
                    </div>
                    <p className="text-xs text-slate-400">
                      Terminal Kiosk touch-friendly com cronômetro em tempo real, apontamento por operador, cálculo de OEE e telemetria de máquinas.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Principais Conceitos do Sistema
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                    <li><strong className="text-white">Centros de Trabalho (Work Centers):</strong> Representam suas máquinas e postos de trabalho (ex: Torno CNC, Centro de Usinagem 5 Eixos, Laser de Fibra, Eletroerosão, Dobradeira). Cada um possui taxa horária (R$/h) e operador padrão.</li>
                    <li><strong className="text-white">OP Seriada (Ordem de Produção):</strong> Voltada para lotes repetitivos de peças acabadas, com roteiro linear sequencial.</li>
                    <li><strong className="text-white">OS de Ferramentaria (Ordem de Serviço):</strong> Voltada para moldes, matrizes e dispositivos, com múltiplas peças postiças (POS) e operações independentes por componente.</li>
                    <li><strong className="text-white">Apontamentos em Tempo Real:</strong> Horas trabalhadas alimentam instantaneamente o custo real da peça versus o custo estimado.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Seção 2: Fluxo Operacional Ponta a Ponta */}
            {activeSection === 'fluxo' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 2</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Fluxo Operacional Ponta a Ponta</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Como uma demanda transita por todo o sistema, desde o primeiro contato comercial até a entrega ao cliente:
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-cyan-900/60 border border-cyan-700 text-cyan-300 flex items-center justify-center font-bold text-sm shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Cotação & Cálculo de Custo (Comercial/Engenharia)</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Cadastre o cliente, selecione a matéria-prima (tarugo, chapa ou bloco), insira as dimensões brutas (peso calculado automaticamente) e adicione as horas previstas de máquina e setup. O sistema calcula o Custo de Material + Custo de Máquina + BDI/Margem de Lucro.
                      </p>
                      <button onClick={() => handleGoToModule('quotes')} className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold">
                        Ir para Cotações <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-700 text-blue-300 flex items-center justify-center font-bold text-sm shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Aprovação & Conversão com 1 Clique</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Assim que o cliente aprova o orçamento, clique em <strong>"Aprovar & Gerar OP"</strong>. O sistema gera automaticamente a Ordem de Produção oficial (ex: OP-2026-0XXX), cria o número de lote rastreável e clona todas as etapas do roteiro de usinagem com tempos previstos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-700 text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Engenharia, Desenho Técnico & CAD 3D</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        No módulo de Engenharia, anexe o desenho técnico ou abra o visualizador 3D interativo integrado para inspeção de geometrias, conferência de cotas e lista de materiais (BOM).
                      </p>
                      <button onClick={() => handleGoToModule('engineering')} className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold">
                        Ir para Engenharia <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-amber-900/60 border border-amber-700 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">PCP & Programação de Máquinas</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        No PCP, visualize a fila de produção, ordene por prioridade (Normal, Alta ou Urgente), acompanhe o avanço percentual e despache a OP ou OS para o terminal do chão de fábrica.
                      </p>
                      <button onClick={() => handleGoToModule('production')} className="mt-2 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold">
                        Ir para PCP & Ordens <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-700 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                      5
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Execução no Chão de Fábrica (Terminal MES)</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        O operador na máquina seleciona o seu posto de trabalho, aciona o botão <strong>"Iniciar Operação"</strong> e o cronômetro começa a contar. Ao finalizar ou pausar, os minutos reais são creditados na OP/OS, atualizando o custo e a produtividade.
                      </p>
                      <button onClick={() => handleGoToModule('mes_kiosk')} className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold">
                        Abrir Terminal MES <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-rose-900/60 border border-rose-700 text-rose-300 flex items-center justify-center font-bold text-sm shrink-0">
                      6
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Inspeção da Qualidade & Liberação de Lote</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Antes de expedir, a metrologia realiza a inspeção dimensional e visual. Se houver desvio fora da tolerância, gera-se uma RNC (Não Conformidade) com causa raiz (Ishikawa/5 Porquês) e ação corretiva. Se aprovado, o lote segue para expedição.
                      </p>
                      <button onClick={() => handleGoToModule('quality')} className="mt-2 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold">
                        Ir para Qualidade & RNC <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seção 3: Dashboard & OEE */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 3</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Cockpit Executivo & OEE</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Visão estratégica em tempo real de toda a fábrica, com indicadores operacionais, financeiros e status das máquinas.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
                  <h4 className="font-bold text-white text-sm">Indicadores no Painel Superior (KPIs):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                      <strong className="text-cyan-300">OEE Médio da Fábrica:</strong> Disponibilidade × Desempenho × Qualidade. Mostra a eficiência global das máquinas instaladas.
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                      <strong className="text-emerald-300">OPs e OSs em Andamento:</strong> Total de ordens ativas simultâneas no chão de fábrica e contagem de itens em regime de urgência.
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                      <strong className="text-purple-300">Pipeline de Cotações:</strong> Volume financeiro de orçamentos pendentes e taxa de conversão em vendas.
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                      <strong className="text-amber-300">Máquinas Operacionais vs Paradas:</strong> Telemetria visual com badges de status de cada centro de usinagem.
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg space-y-2">
                  <h4 className="font-bold text-white text-sm">Ações Rápidas no Dashboard:</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                    <li><strong>Filtrar Máquinas:</strong> Visualize rapidamente máquinas paradas por quebra, manutenção ou setup.</li>
                    <li><strong>Acesso Direto à OP/OS:</strong> Clique em qualquer ordem listada para abrir seus detalhes no PCP.</li>
                    <li><strong>Botão Kiosk:</strong> Permite transitar diretamente para o modo terminal de operador.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Seção 4: Cotações */}
            {activeSection === 'quotes' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 4</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Cotações & Formação de Custos</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Motor de cálculo para orçamentos industriais precisos, eliminando estimativas no "olhômetro" e garantindo a margem de lucro.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg">
                    <h4 className="font-bold text-white text-sm mb-2 text-cyan-400">Como Criar uma Nova Cotação:</h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                      <li>Clique em <strong>"+ Nova Cotação"</strong> no canto superior direito.</li>
                      <li>Informe os <strong>Dados Gerais</strong>: Nome do Cliente, Código da Peça, Descrição e Quantidade do lote.</li>
                      <li>Selecione a <strong>Matéria-Prima</strong> cadastrada (ex: Aço AISI 1045, Inox 304, Alumínio 6061-T6, Aço Ferramenta P20).</li>
                      <li>Preencha a <strong>Geometria Bruta</strong> (Comprimento, Largura/Diâmetro e Espessura em mm). O sistema calcula a densidade e o peso bruto estimado.</li>
                      <li>Adicione as <strong>Operações de Máquina</strong> (ex: Torneamento, Fresa CNC, Eletroerosão) com tempo de setup e tempo ciclo por unidade.</li>
                      <li>Ajuste o <strong>BDI / Margem Desejada (%)</strong>: O preço unitário sugerido e o preço total são recalculados instantaneamente.</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                      <h5 className="font-bold text-white text-xs mb-1">Cálculo de Custo da Matéria-Prima:</h5>
                      <p className="text-xs text-slate-400">
                        <code className="text-cyan-300 font-mono">Custo MP = Volume Bruto (cm³) × Densidade (g/cm³) ÷ 1000 × Preço/kg</code>
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                      <h5 className="font-bold text-white text-xs mb-1">Cálculo de Custo de Fabricação:</h5>
                      <p className="text-xs text-slate-400">
                        <code className="text-cyan-300 font-mono">Custo Usinagem = (Setup + Ciclo × Qtd) ÷ 60 × Taxa Horária da Máquina</code>
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded text-xs text-emerald-300">
                    ✓ <strong>Conversão Automática:</strong> Ao aprovar o orçamento, basta clicar no botão de conversão para enviar tudo automaticamente ao PCP sem redigitar nenhum dado!
                  </div>
                </div>
              </div>
            )}

            {/* Seção 5: Engenharia, BOM & CAD */}
            {activeSection === 'engineering' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 5</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Engenharia, BOM & Visualizador CAD</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Repositório de dados técnicos de engenharia, estrutura de produto (Bill of Materials) e visualização de desenhos 3D/2D.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
                    <h4 className="font-bold text-white text-sm">Recursos Disponíveis:</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                      <li><strong>Estrutura de Produtos (BOM):</strong> Listagem de matérias-primas e componentes consumidos por unidade de produto acabado.</li>
                      <li><strong>Roteiro Padrão de Fabricação:</strong> Sequência de passos operacionais com centro de trabalho associado, tempo de preparação (setup) e tempo de usinagem.</li>
                      <li><strong>Visualizador CAD 3D Interativo:</strong> Permite rotacionar, aproximar (zoom) e inspecionar malhas 3D de peças e ferramentas diretamente no navegador.</li>
                      <li><strong>Parâmetros de Tolerância:</strong> Controle de classes dimensionais (ex: ISO 2768-m, ISO 2768-f, DIN 16901 para moldes plásticos).</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Seção 6: PCP */}
            {activeSection === 'production' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 6</span>
                  <h3 className="text-2xl font-bold text-white mt-1">PCP: Produção Seriada vs Ferramentaria</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    O coração operacional da fábrica. O módulo possui duas abas dedicadas para atender perfeitamente aos dois perfis de manufatura:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Aba 1: Seriada */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                      <CalendarClock className="w-4 h-4" /> 6.1 Produção Seriada (Ordens de Produção - OPs)
                    </div>
                    <p className="text-xs text-slate-400">
                      Para lotes industriais padronizados (ex: 500 buchas usinadas, 200 suportes cortados a laser).
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                      <li><strong>Identificação:</strong> Código OP-2026-0XXX, lote único associado.</li>
                      <li><strong>Status da OP:</strong> Pendente, Liberada, Em Andamento, Concluída ou Bloqueada.</li>
                      <li><strong>Rastreamento:</strong> Quantidade produzida versus quantidade de refugo/sucata gerada.</li>
                      <li><strong>Avanço de Roteiro:</strong> Cada etapa concluída avança o percentual geral da ordem.</li>
                    </ul>
                  </div>

                  {/* Aba 2: Ferramentaria */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <Wrench className="w-4 h-4" /> 6.2 Ferramentaria (Ordens de Serviço - OSs)
                    </div>
                    <p className="text-xs text-slate-400">
                      Para projetos sob medida: Moldes de Injeção Plástica, Estampos de Corte e Repuxo, Matrizes e Dispositivos.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                      <li><strong>Numeração Sequencial Automática:</strong> OS-2026-0001, OS-2026-0002, etc.</li>
                      <li><strong>Itens Postiços (POS):</strong> Cada molde possui múltiplas peças postiças (ex: Cavidade Superior, Gaveta Lateral, Macho Central), cada uma identificada por seu código POS.</li>
                      <li><strong>Roteiro por Postiça:</strong> Permite que cada peça tenha seu próprio roteiro (Desbaste CNC, Têmpera, Retífica Plana, Eletroerosão a Fio).</li>
                      <li><strong>Controle de Horas Rigoroso:</strong> Apontamento de horas com validação anti-duplicidade e recálculo automático de custos e prazos.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg space-y-2">
                  <h4 className="font-bold text-white text-sm text-cyan-400">Como Cadastrar uma Nova OS de Ferramentaria:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300">
                    <li>No PCP, selecione a aba <strong>"Ferramentaria (Moldes & Matrizes)"</strong>.</li>
                    <li>Clique no botão <strong>"+ Nova OS de Ferramentaria"</strong>.</li>
                    <li>Informe Cliente, Projeto/Ferramenta, Tipo de Serviço (Fabricação Nova, Modificação de Engenharia, Manutenção Preventiva/Corretiva), Prioridade e Prazo de Entrega.</li>
                    <li>Após criar a OS, clique em <strong>"+ Adicionar Postiça/Peça (POS)"</strong> para cadastrar os componentes do molde.</li>
                    <li>Em cada postiça, adicione as etapas de fabricação com tempo estimado de usinagem.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Seção 7: Terminal MES Kiosk */}
            {activeSection === 'mes_kiosk' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 7</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Terminal Chão de Fábrica (MES Kiosk)</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Interface touch de alta visibilidade criada especificamente para os operadores no chão de fábrica apontarem produção e paradas de máquina.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3">
                    <h4 className="font-bold text-white text-sm text-amber-400">Passo a Passo do Operador:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <strong className="text-white block mb-1">Passo 1: Selecionar Posto & Tipo</strong>
                        Escolha o Centro de Trabalho (ex: Torno CNC 01) e o tipo de ordem: Produção Seriada (OP) ou Ferramentaria (OS).
                      </div>
                      <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <strong className="text-white block mb-1">Passo 2: Iniciar Cronômetro</strong>
                        Selecione a OP/OS, a etapa do roteiro e clique no grande botão verde <strong>"Iniciar Operação"</strong>.
                      </div>
                      <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <strong className="text-white block mb-1">Passo 3: Finalizar & Apontar</strong>
                        Ao terminar, clique em <strong>"Pausar / Concluir"</strong>. Informe quantidade boa e refugo (na OP) ou registre o tempo exato (na OS).
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg space-y-2">
                    <h4 className="font-bold text-white text-sm">Status da Máquina em Tempo Real:</h4>
                    <p className="text-xs text-slate-400">
                      O operador pode alterar o estado do centro de trabalho diretamente no terminal:
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">Em Operação</span>
                      <span className="px-2.5 py-1 bg-blue-950 text-blue-400 border border-blue-800 rounded">Setup / Preparação</span>
                      <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded">Aguardando Material</span>
                      <span className="px-2.5 py-1 bg-rose-950 text-rose-400 border border-rose-800 rounded">Parada p/ Manutenção</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seção 8: Estoque */}
            {activeSection === 'inventory' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 8</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Estoque, Lotes & Rastreabilidade</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Gestão física e contábil de matérias-primas metálicas e polímeros com rastreabilidade total de lote e certificado de qualidade da usina.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
                    <h4 className="font-bold text-white text-sm">Controle de Estoque Inteligente:</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                      <li><strong>Cadastro de Materiais:</strong> Chapas, barras redondas, blocos usinados, tarugos e tubos estruturais.</li>
                      <li><strong>Estoque Mínimo & Alertas:</strong> Itens com quantidade abaixo do ponto de reposição são destacados em vermelho/laranja.</li>
                      <li><strong>Certificado de Matéria-Prima:</strong> Campo para registrar o número do certificado de corrida da usina siderúrgica.</li>
                      <li><strong>Entradas e Saídas:</strong> Movimentações vinculadas diretamente às ordens de produção para baixa automática de matéria-prima.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Seção 9: Qualidade */}
            {activeSection === 'quality' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 9</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Controle de Qualidade & RNC (Não Conformidade)</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Garantia da conformidade geométrica e metalúrgica conforme normas ISO 9001 e IATF 16949.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
                      <h4 className="font-bold text-emerald-400 text-sm">Inspeções de Qualidade</h4>
                      <p className="text-xs text-slate-400">
                        Registro de ensaios metrológicos (paquímetro, micrômetro, tridimensional CMM, rugosímetro) em amostras de produção. Emissão de parecer de Aprovação ou Reprovação.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
                      <h4 className="font-bold text-rose-400 text-sm">Gestão de RNCs</h4>
                      <p className="text-xs text-slate-400">
                        Quando uma peça é rejeitada, abre-se uma RNC com descrição do defeito, severidade, análise de causa raiz (Ishikawa) e plano de ação corretiva.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seção 10: Manutenção */}
            {activeSection === 'maintenance' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 10</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Manutenção Industrial (TPM)</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Manutenção Preventiva Total para manter o índice de disponibilidade das máquinas sempre acima de 90%.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
                    <h4 className="font-bold text-white text-sm">Ordens de Manutenção Preventiva e Corretiva:</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                      <li><strong>Cronograma Preventivo:</strong> Troca de fluido de corte, lubrificação de guias lineares, limpeza de filtros e troca de correias.</li>
                      <li><strong>Atendimentos Corretivos:</strong> Registro de paradas emergenciais com contagem de MTBF (Tempo Médio Entre Falhas) e MTTR (Tempo Médio Para Reparo).</li>
                      <li><strong>Histórico da Máquina:</strong> Registro cumulativo de intervenções técnicas por centro de trabalho.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Seção 11: Personalização */}
            {activeSection === 'customizer' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 11</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Perfis de Indústria & Personalização</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    O WebErpMes adapta dinamicamente sua terminologia, módulos ativos e regras para o seu segmento industrial específico.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                      <strong className="text-cyan-300 block mb-1">Caldeiraria & Laser:</strong>
                      Focado em corte de chapas, dobras, solda e consumo em kg/área.
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                      <strong className="text-emerald-300 block mb-1">Usinagem CNC:</strong>
                      Focado em taxa horária, tempos de ciclo precisos e rotação de ferramentas.
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                      <strong className="text-amber-300 block mb-1">Moldes & Matrizes:</strong>
                      Focado em projetos por OS, componentes postiços (POS) e horas de bancada.
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                      <strong className="text-purple-300 block mb-1">Injeção Plástica:</strong>
                      Focado em número de cavidades, ciclos por minuto e pesagem de resina.
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                    <p className="text-xs text-slate-300">
                      Você pode alternar o perfil da fábrica ou ativar/desativar módulos individuais a qualquer momento na aba <strong>"Personalizar Fábrica"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Seção 12: Dúvidas Frequentes */}
            {activeSection === 'faq' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider">Capítulo 12</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Dúvidas Frequentes & Dicas Operacionais</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg">
                    <h4 className="font-bold text-white text-xs text-cyan-400 mb-1">
                      1. "Por que a base de dados começou vazia?"
                    </h4>
                    <p className="text-xs text-slate-400">
                      Todos os dados fictícios de exemplo foram limpos a seu pedido para que sua fábrica comece com cadastros 100% reais. As máquinas (centros de trabalho) estão configuradas para permitir a imediata criação de ordens.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg">
                    <h4 className="font-bold text-white text-xs text-cyan-400 mb-1">
                      2. "Como funciona o número da OS de Ferramentaria?"
                    </h4>
                    <p className="text-xs text-slate-400">
                      O sistema gera a numeração automaticamente no padrão anual sequencial: a primeira OS criada será <code>OS-2026-0001</code>, a segunda <code>OS-2026-0002</code>, e assim por diante.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg">
                    <h4 className="font-bold text-white text-xs text-cyan-400 mb-1">
                      3. "Posso usar em tablets no chão de fábrica?"
                    </h4>
                    <p className="text-xs text-slate-400">
                      Sim! O botão <strong>"Terminal Chão de Fábrica"</strong> no topo da tela aciona o modo Kiosk com botões ampliados e alto contraste, perfeito para telas sensíveis ao toque com uso de luvas industriais.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg">
                    <h4 className="font-bold text-white text-xs text-cyan-400 mb-1">
                      4. "O que fazer se um operador esquecer o cronômetro ligado?"
                    </h4>
                    <p className="text-xs text-slate-400">
                      No módulo de PCP (na aba de Ferramentaria ou Produção), o gestor pode auditar a lista de apontamentos, excluir entradas incorretas ou ajustar os dados. O sistema recalcula automaticamente todas as horas reais acumuladas.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer do Modal */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Documentação Oficial WebErpMes — Sistema Atualizado e Pronto para Produção</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            Entendido / Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
