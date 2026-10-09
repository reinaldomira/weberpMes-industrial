import React, { useState } from 'react';
import { 
  X, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Layers, 
  Download, 
  Eye, 
  FileCheck,
  Ruler
} from 'lucide-react';
import { Product } from '../../types/industrial';

interface CadViewerModalProps {
  product: Product;
  onClose: () => void;
}

export const CadViewerModal: React.FC<CadViewerModalProps> = ({ product, onClose }) => {
  const [viewMode, setViewMode] = useState<'2d' | 'isometric'>('2d');
  const [showDimensions, setShowDimensions] = useState(true);
  const [showBendsAndTolerances, setShowBendsAndTolerances] = useState(true);
  const [showToolpath, setShowToolpath] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const isSheetMetal = product.code.includes('GAB') || product.code.includes('SUP');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-750 rounded-lg w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-xs">
              CAD / CAM VIEWER
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                {product.name}
                <span className="text-xs font-mono text-slate-400">({product.code} - {product.revision})</span>
              </h2>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Arquivo: {product.cadFileName || 'desenho_tecnico.dxf'}</span>
                <span>·</span>
                <span>Dimensões: {product.dimensions}</span>
                <span>·</span>
                <span>Massa: {product.weightKg} kg</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Exportando pacote técnico de engenharia (DXF, STEP e PDF de ${product.code})`);
              }}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar DXF/STEP</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-slate-800 bg-slate-900 text-xs">
          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded border border-slate-800">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === '2d'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Planificação 2D (Chapa / Perfil)
            </button>
            <button
              onClick={() => setViewMode('isometric')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'isometric'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Projeção Isométrica 3D
            </button>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showDimensions}
                onChange={(e) => setShowDimensions(e.target.checked)}
                className="rounded border-slate-700 text-cyan-600 focus:ring-0"
              />
              <span className="text-[11px]">Cotas Dimensionais</span>
            </label>

            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showBendsAndTolerances}
                onChange={(e) => setShowBendsAndTolerances(e.target.checked)}
                className="rounded border-slate-700 text-cyan-600 focus:ring-0"
              />
              <span className="text-[11px]">
                {isSheetMetal ? 'Linhas de Dobra CNC' : 'Tolerâncias GD&T (H7)'}
              </span>
            </label>

            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showToolpath}
                onChange={(e) => setShowToolpath(e.target.checked)}
                className="rounded border-slate-700 text-cyan-600 focus:ring-0"
              />
              <span className="text-[11px]">Trajetória G-Code (CAM)</span>
            </label>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1 hover:text-cyan-400 text-slate-400"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
              className="p-1 hover:text-cyan-400 text-slate-400"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:text-cyan-400 text-slate-400"
              title="Resetar"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CAD Canvas Viewport */}
        <div className="flex-1 bg-[#060b13] relative overflow-hidden flex items-center justify-center p-6">
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#38bdf8 1px, #060b13 1px)',
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0, 20px 20px'
            }}
          />

          {/* Coordinate system mark */}
          <div className="absolute bottom-4 left-4 font-mono text-[10px] text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
            Origem: X: 0.00 | Y: 0.00 | Z: 0.00 (WCS G54)
          </div>

          {/* Interactive SVG Drawing */}
          <div 
            className="transition-transform duration-200 select-none flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {isSheetMetal ? (
              /* Sheet metal flat pattern & folding */
              viewMode === '2d' ? (
                <svg width="680" height="420" viewBox="0 0 680 420" className="drop-shadow-lg">
                  {/* Outer blank outline */}
                  <rect
                    x="140"
                    y="60"
                    width="400"
                    height="300"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    rx="4"
                  />
                  {/* Internal cutouts / openings */}
                  <rect
                    x="240"
                    y="130"
                    width="200"
                    height="160"
                    fill="#060b13"
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                    strokeDasharray={showToolpath ? "4 3" : undefined}
                  />

                  {/* Mounting holes with pitch */}
                  {[
                    [170, 90], [510, 90], [170, 330], [510, 330],
                    [340, 90], [340, 330]
                  ].map(([cx, cy], i) => (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="8" fill="#060b13" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" />
                      <line x1={cx} y1={cy - 12} x2={cx} y2={cy + 12} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" />
                    </g>
                  ))}

                  {/* Bend lines (dotted magenta/yellow) */}
                  {showBendsAndTolerances && (
                    <g>
                      <line x1="200" y1="60" x2="200" y2="360" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" />
                      <text x="205" y="80" fill="#f59e0b" fontSize="10" fontFamily="monospace">Dobra 1: 90° UP (R1.5)</text>

                      <line x1="480" y1="60" x2="480" y2="360" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" />
                      <text x="405" y="80" fill="#f59e0b" fontSize="10" fontFamily="monospace">Dobra 2: 90° UP</text>

                      <line x1="140" y1="110" x2="540" y2="110" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" />
                      <line x1="140" y1="310" x2="540" y2="310" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" />
                    </g>
                  )}

                  {/* Dimensions & Tolerance Callouts */}
                  {showDimensions && (
                    <g fill="#94a3b8" fontSize="11" fontFamily="monospace">
                      {/* Width dimension */}
                      <line x1="140" y1="30" x2="540" y2="30" stroke="#64748b" strokeWidth="1" />
                      <line x1="140" y1="25" x2="140" y2="55" stroke="#64748b" strokeWidth="1" />
                      <line x1="540" y1="25" x2="540" y2="55" stroke="#64748b" strokeWidth="1" />
                      <text x="315" y="24" fill="#38bdf8" fontWeight="600">600.00 ± 0.2 mm</text>

                      {/* Height dimension */}
                      <line x1="100" y1="60" x2="100" y2="360" stroke="#64748b" strokeWidth="1" />
                      <line x1="95" y1="60" x2="135" y2="60" stroke="#64748b" strokeWidth="1" />
                      <line x1="95" y1="360" x2="135" y2="360" stroke="#64748b" strokeWidth="1" />
                      <text x="50" y="215" fill="#38bdf8" fontWeight="600" transform="rotate(-90 90,215)">
                        400.00 ± 0.2 mm
                      </text>

                      {/* Hole callout */}
                      <path d="M 510 90 L 580 50 L 640 50" fill="none" stroke="#64748b" strokeWidth="1" />
                      <text x="585" y="44" fill="#10b981">6x Ø 8.5 THRU</text>
                    </g>
                  )}

                  {/* CAM Toolpath */}
                  {showToolpath && (
                    <g>
                      <path
                        d="M 130 50 L 550 50 L 550 370 L 130 370 Z"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.2"
                        strokeDasharray="2 2"
                      />
                      <circle cx="130" cy="50" r="4" fill="#ef4444" />
                      <text x="110" y="40" fill="#ef4444" fontSize="10" fontFamily="monospace">Lead-in Laser</text>
                    </g>
                  )}
                </svg>
              ) : (
                /* Isometric 3D wireframe render */
                <svg width="680" height="420" viewBox="0 0 680 420" className="drop-shadow-lg">
                  {/* 3D Box Chassis */}
                  <polygon points="260,110 460,90 530,190 330,210" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <polygon points="260,110 330,210 330,350 260,250" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  <polygon points="330,210 530,190 530,330 330,350" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  {/* Inner depth flange */}
                  <polygon points="290,140 430,125 430,270 290,285" fill="#060b13" stroke="#0ea5e9" strokeWidth="1.5" />
                  
                  {/* Isometric dimensions */}
                  {showDimensions && (
                    <g fontFamily="monospace" fontSize="11" fill="#38bdf8">
                      <line x1="260" y1="260" x2="330" y2="360" stroke="#64748b" strokeWidth="1" />
                      <text x="250" y="325">Prof: 250 mm</text>

                      <line x1="330" y1="365" x2="530" y2="345" stroke="#64748b" strokeWidth="1" />
                      <text x="410" y="375">Comp: 600 mm</text>

                      <line x1="545" y1="190" x2="545" y2="330" stroke="#64748b" strokeWidth="1" />
                      <text x="555" y="265">Alt: 400 mm</text>
                    </g>
                  )}
                </svg>
              )
            ) : (
              /* CNC Flange Cylindrical Component */
              <svg width="600" height="400" viewBox="0 0 600 400" className="drop-shadow-lg">
                {/* Main flange circle */}
                <circle cx="300" cy="200" r="140" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                {/* Internal bore H7 */}
                <circle cx="300" cy="200" r="50" fill="#060b13" stroke="#38bdf8" strokeWidth="2" />
                {/* Bolt circle */}
                <circle cx="300" cy="200" r="100" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="6 4" />

                {/* 8 bolt holes */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const cx = 300 + 100 * Math.cos(rad);
                  const cy = 200 + 100 * Math.sin(rad);
                  return (
                    <circle key={i} cx={cx} cy={cy} r="9" fill="#060b13" stroke="#38bdf8" strokeWidth="1.8" />
                  );
                })}

                {/* Dimensions */}
                {showDimensions && (
                  <g fontFamily="monospace" fontSize="11" fill="#38bdf8">
                    <line x1="160" y1="40" x2="440" y2="40" stroke="#64748b" strokeWidth="1" />
                    <line x1="160" y1="35" x2="160" y2="200" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="440" y1="35" x2="440" y2="200" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="260" y="32">Ø 180.00 ± 0.02</text>

                    <path d="M 300 200 L 220 280 L 140 280" fill="none" stroke="#64748b" strokeWidth="1" />
                    <text x="145" y="275" fill="#10b981">Ø 65.00 H7 (+0.030 / 0)</text>
                  </g>
                )}
              </svg>
            )}
          </div>

          {/* Technical Title Block (Legenda Técnica de Engenharia) */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-750 p-2.5 rounded text-[11px] font-mono text-slate-300 w-72 shadow-lg">
            <div className="border-b border-slate-800 pb-1 mb-1 font-bold text-white flex justify-between">
              <span>{product.code}</span>
              <span className="text-cyan-400">{product.revision}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Material:</span>
              <span className="text-slate-200">
                {product.bom[0]?.materialName?.substring(0, 22) || 'Aço / Alumínio'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tolerância Geral:</span>
              <span className="text-slate-200">ISO 2768-m</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Projeção:</span>
              <span className="text-slate-200">1º Diedro (ISO)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
