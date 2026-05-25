import React, { useState, useMemo } from 'react';
import { Shield, Eye, Layers, Compass, Thermometer, Droplet, Sun, Activity } from 'lucide-react';

// Pre-define 100 micro-zones with heterogeneous baseline properties
const CELL_TYPES = ['Clay Loam', 'Sandy Loam', 'Silt Loam'];

const BASE_CELLS = Array.from({ length: 100 }, (_, i) => {
  const row = Math.floor(i / 10);
  const col = i % 10;
  
  // Create natural spatial gradients (e.g. a river or clay patch nearby)
  const basepH = 6.2 + 0.1 * Math.sin(row / 2) + 0.15 * Math.cos(col / 2) + (Math.random() * 0.1 - 0.05);
  const baseMoisture = 55 + 8 * Math.sin(row / 3.1) - 6 * Math.cos(col / 2.5);
  const baseNDVI = 0.65 + 0.1 * Math.cos((row + col) / 4) + (Math.random() * 0.05 - 0.025);
  
  // NPK baseline values (Nitrogen, Phosphorus, Potassium in ppm)
  const baseN = Math.round(55 + 15 * Math.sin(row / 2) + (Math.random() * 10 - 5));
  const baseP = Math.round(42 + 10 * Math.cos(col / 2) + (Math.random() * 6 - 3));
  const baseK = Math.round(180 + 30 * Math.sin((row + col) / 3) + (Math.random() * 20 - 10));
  
  // Assign soil types spatially
  const soilIdx = (row * 3 + col * 7) % CELL_TYPES.length;
  const soilType = CELL_TYPES[soilIdx];

  return {
    id: i,
    row,
    col,
    soilType,
    basepH,
    baseMoisture,
    baseNDVI,
    baseN,
    baseP,
    baseK,
    vulnerability: 0.1 + 0.4 * Math.sin(row / 2) * Math.cos(col / 2) + Math.random() * 0.1
  };
});

export default function DigitalTwinMap({ 
  currentDay, 
  activeScenario, 
  activeStrategy, 
  riskHeatmap 
}) {
  const [activeLayer, setActiveLayer] = useState('ndvi'); // 'ndvi', 'moisture', 'pH', 'npk'
  const [selectedCellId, setSelectedCellId] = useState(0);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Compute cell-level telemetry dynamically based on current day and strategy
  const dynamicCells = useMemo(() => {
    if (!activeScenario) return BASE_CELLS;
    
    const dayData = activeScenario.timeSeries[currentDay - 1] || activeScenario.timeSeries[activeScenario.timeSeries.length - 1];
    const rainEffect = dayData.rainfall * 0.8;
    const heatEffect = Math.max(0, dayData.temperature - 28) * -0.5;
    
    // Strategy modifiers
    let irrigationMultiplier = 1.0;
    if (activeStrategy.irrigation === 'automated') irrigationMultiplier = 1.35;
    if (activeStrategy.irrigation === 'deficit') irrigationMultiplier = 1.15;
    if (activeStrategy.irrigation === 'rainfed') irrigationMultiplier = 0.85;

    let fertilizerNModifier = 0;
    let fertilizerPModifier = 0;
    let fertilizerKModifier = 0;
    if (activeStrategy.fertilizer === 'aggressive') {
      fertilizerNModifier = 25;
      fertilizerPModifier = 15;
      fertilizerKModifier = 40;
    } else if (activeStrategy.fertilizer === 'low') {
      fertilizerNModifier = -10;
      fertilizerPModifier = -5;
      fertilizerKModifier = -15;
    }

    return BASE_CELLS.map((cell, idx) => {
      // Calculate dynamic moisture
      let moisture = cell.baseMoisture + rainEffect + heatEffect;
      moisture = Math.max(10, Math.min(95, moisture * irrigationMultiplier));

      // Calculate dynamic NDVI based on moisture and pest risk
      const pestEffect = Math.max(0, dayData.pestRisk - 15) * -0.004;
      let ndvi = cell.baseNDVI + (dayData.ndviModifier || 0) + (moisture - 50) * 0.002 + pestEffect;
      
      // Sowing offset impact on growth stage
      const age = Math.max(0, currentDay + activeStrategy.sowingOffset);
      const cropGrowthFactor = Math.sin(Math.min(Math.PI, (age / 120) * Math.PI));
      ndvi = ndvi * (0.3 + 0.7 * cropGrowthFactor);
      ndvi = Math.max(0.1, Math.min(0.92, ndvi));

      // Dynamic pH
      let pH = cell.basepH;
      if (activeStrategy.fertilizer === 'aggressive') pH -= 0.25 * (currentDay / 120);
      pH = Math.max(4.5, Math.min(8.5, pH));

      // Dynamic NPK
      const n = Math.round(Math.max(10, cell.baseN + fertilizerNModifier - (currentDay * 0.2)));
      const p = Math.round(Math.max(5, cell.baseP + fertilizerPModifier - (currentDay * 0.1)));
      const k = Math.round(Math.max(50, cell.baseK + fertilizerKModifier - (currentDay * 0.4)));

      // Yield failure risk indicator
      const cellRisk = riskHeatmap ? riskHeatmap[idx] : cell.vulnerability;

      return {
        ...cell,
        ndvi,
        moisture: Math.round(moisture),
        pH: parseFloat(pH.toFixed(1)),
        n,
        p,
        k,
        cellRisk
      };
    });
  }, [currentDay, activeScenario, activeStrategy, riskHeatmap]);

  const selectedCell = dynamicCells[selectedCellId] || dynamicCells[0];

  // Helper to color cells based on active telemetry layer
  const getCellColor = (cell) => {
    if (activeLayer === 'ndvi') {
      const v = cell.ndvi;
      if (v > 0.75) return 'bg-emerald-600/90 shadow-[inset_0_0_8px_rgba(16,185,129,0.3)]';
      if (v > 0.6) return 'bg-emerald-500/70';
      if (v > 0.45) return 'bg-yellow-600/50';
      if (v > 0.3) return 'bg-orange-600/60';
      return 'bg-red-700/80 shadow-[inset_0_0_8px_rgba(239,68,68,0.3)]';
    }
    
    if (activeLayer === 'moisture') {
      const v = cell.moisture;
      if (v > 75) return 'bg-cyan-600/90 shadow-[inset_0_0_8px_rgba(6,182,212,0.3)]';
      if (v > 50) return 'bg-cyan-500/60';
      if (v > 30) return 'bg-cyan-700/30';
      if (v > 20) return 'bg-yellow-700/50';
      return 'bg-amber-800/80 shadow-[inset_0_0_8px_rgba(245,158,11,0.3)]';
    }
    
    if (activeLayer === 'pH') {
      const v = cell.pH;
      if (v < 5.5) return 'bg-red-900/50'; // Acidic
      if (v > 7.5) return 'bg-blue-900/50'; // Alkaline
      return 'bg-teal-500/60'; // Optimal
    }
    
    if (activeLayer === 'npk') {
      const v = cell.n + cell.p + cell.k;
      if (v > 300) return 'bg-violet-600/80 shadow-[inset_0_0_8px_rgba(139,92,246,0.3)]';
      if (v > 220) return 'bg-violet-500/50';
      if (v > 150) return 'bg-violet-800/30';
      return 'bg-amber-950/60';
    }
    
    return 'bg-slate-800';
  };

  const getCellLabel = (cell) => {
    if (activeLayer === 'ndvi') return cell.ndvi.toFixed(2);
    if (activeLayer === 'moisture') return `${cell.moisture}%`;
    if (activeLayer === 'pH') return cell.pH;
    if (activeLayer === 'npk') return `N:${cell.n}`;
    return '';
  };

  const currentDayData = activeScenario?.timeSeries?.[currentDay - 1] || { temperature: 24, rainfall: 0, humidity: 60 };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* 1-acre grid (Left 2 cols on wide, full otherwise) */}
      <div className="lg:col-span-2 cyber-panel p-4 flex flex-col justify-between">
        {/* Panel Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="text-cyber-emerald-glow animate-pulse" size={18} />
            <h3 className="font-display font-bold text-sm tracking-widest text-slate-100 uppercase">
              1-Acre Farm Vector Twin GIS Grid
            </h3>
          </div>
          
          {/* Layer toggles */}
          <div className="flex items-center bg-cyber-obsidian border border-slate-800 rounded p-0.5 text-xs">
            <button 
              onClick={() => setActiveLayer('ndvi')}
              className={`px-2 py-1 rounded transition ${activeLayer === 'ndvi' ? 'bg-cyber-emerald text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              NDVI (Health)
            </button>
            <button 
              onClick={() => setActiveLayer('moisture')}
              className={`px-2 py-1 rounded transition ${activeLayer === 'moisture' ? 'bg-cyber-cyan text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Moisture
            </button>
            <button 
              onClick={() => setActiveLayer('pH')}
              className={`px-2 py-1 rounded transition ${activeLayer === 'pH' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              pH
            </button>
            <button 
              onClick={() => setActiveLayer('npk')}
              className={`px-2 py-1 rounded transition ${activeLayer === 'npk' ? 'bg-cyber-violet text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              NPK
            </button>
          </div>
        </div>

        {/* The Grid Map */}
        <div className="relative aspect-video w-full bg-cyber-obsidian border border-slate-800/80 rounded flex items-center justify-center overflow-hidden p-6 select-none">
          {/* Futuristic radar scanlines & ticks */}
          <div className="absolute inset-0 cyber-grid pointer-events-none" />
          <div className="radar-sweep" />
          
          {/* Coordinates grid markings */}
          <div className="absolute top-1 left-4 text-[9px] text-slate-500 font-mono">0m (North Boundary)</div>
          <div className="absolute bottom-1 left-4 text-[9px] text-slate-500 font-mono">40m (South Boundary)</div>
          <div className="absolute bottom-1 right-4 text-[9px] text-slate-500 font-mono">100m (East Limit)</div>
          <div className="absolute top-1 right-4 text-[9px] text-slate-500 font-mono">West Limit</div>

          {/* Grid Layout (10x10) */}
          <div className="grid grid-cols-10 gap-1 z-10 w-full max-w-[550px] aspect-square lg:aspect-auto">
            {dynamicCells.map((cell) => {
              const isSelected = selectedCellId === cell.id;
              const isHovered = hoveredCell?.id === cell.id;
              const cellColor = getCellColor(cell);
              
              return (
                <div
                  key={cell.id}
                  onClick={() => setSelectedCellId(cell.id)}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`
                    ${cellColor} 
                    relative border cursor-pointer aspect-square rounded-sm flex items-center justify-center 
                    text-[9px] font-mono text-white font-bold transition-all duration-200
                    hover:scale-105 hover:z-20
                    ${isSelected ? 'border-white scale-105 z-20 shadow-glow-emerald ring-2 ring-cyber-emerald-glow/40' : 'border-slate-900/60 hover:border-slate-200'}
                  `}
                >
                  <span className="opacity-75">{getCellLabel(cell)}</span>
                  
                  {/* Subtle pulsing red alarm on extremely high risk plots */}
                  {cell.cellRisk > 0.7 && (
                    <span className="absolute top-0.5 right-0.5 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-crimson opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyber-crimson-glow"></span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-4 border-t border-slate-800/60 pt-3">
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded bg-emerald-600" />
            <span>Optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded bg-yellow-600" />
            <span>Moderate Stress</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded bg-red-700" />
            <span>Critical Deficit</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="text-cyber-crimson-glow animate-pulse" size={12} />
            <span className="text-[10px] text-cyber-crimson-glow font-mono">Bioluminescent Alarm Active</span>
          </div>
        </div>
      </div>

      {/* Holographic Cell Inspector (Right 1 col) */}
      <div className="cyber-panel p-4 flex flex-col justify-between border-l border-slate-800/80">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Shield className="text-cyber-cyan-glow" size={16} />
              <h3 className="font-display font-bold text-xs tracking-wider text-slate-200 uppercase">
                Zone Telemetry Inspector
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-cyber-cyan/15 text-cyber-cyan-glow border border-cyber-cyan/30 px-1.5 py-0.5 rounded uppercase">
              GRID-[{selectedCell.row},{selectedCell.col}]
            </span>
          </div>

          {/* Selected Cell Parameters */}
          <div className="space-y-4">
            <div className="bg-cyber-obsidian border border-slate-800/80 rounded p-3 relative overflow-hidden">
              <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full led-blinker-green" />
              <div className="text-[10px] text-slate-500 font-mono uppercase">Zone Soil Classification</div>
              <div className="font-display font-semibold text-sm text-slate-200 mt-0.5">
                {selectedCell.soilType}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Lat: 34.0522° N | Lon: -118.2437° W
              </div>
            </div>

            {/* Telemetry metrics bar */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-cyber-obsidian/60 border border-slate-800/50 rounded p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Soil pH</span>
                  <span className="text-[9px] px-1 bg-teal-900/40 text-teal-400 border border-teal-700/30 rounded font-mono">
                    {selectedCell.pH < 6.0 ? 'Acidic' : selectedCell.pH > 7.2 ? 'Alkaline' : 'Neutral'}
                  </span>
                </div>
                <div className="text-lg font-digital text-teal-400 mt-1">{selectedCell.pH}</div>
              </div>

              <div className="bg-cyber-obsidian/60 border border-slate-800/50 rounded p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Moisture</span>
                  <span className="text-[9px] px-1 bg-cyan-900/40 text-cyber-cyan-glow border border-cyber-cyan/30 rounded font-mono">
                    {selectedCell.moisture}%
                  </span>
                </div>
                <div className="text-lg font-digital text-cyber-cyan-glow mt-1">{selectedCell.moisture}%</div>
              </div>
            </div>

            {/* NDVI Gauge */}
            <div className="bg-cyber-obsidian/60 border border-slate-800/50 rounded p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">NDVI Health Index</span>
                <span className={`font-mono font-bold ${
                  selectedCell.ndvi > 0.7 ? 'text-cyber-emerald-glow' : selectedCell.ndvi > 0.5 ? 'text-yellow-400' : 'text-cyber-crimson-glow'
                }`}>
                  {selectedCell.ndvi.toFixed(3)}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    selectedCell.ndvi > 0.7 ? 'bg-cyber-emerald' : selectedCell.ndvi > 0.5 ? 'bg-cyber-gold' : 'bg-cyber-crimson'
                  }`}
                  style={{ width: `${selectedCell.ndvi * 100}%` }}
                />
              </div>
            </div>

            {/* NPK Matrix breakdown */}
            <div className="bg-cyber-obsidian/60 border border-slate-800/50 rounded p-3">
              <div className="text-[10px] text-slate-500 font-mono uppercase mb-2">NPK Nutrient Concentration</div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded bg-purple-500" />
                    <span>Nitrogen (N)</span>
                  </div>
                  <span className="text-purple-300 font-bold">{selectedCell.n} ppm</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded bg-pink-500" />
                    <span>Phosphorus (P)</span>
                  </div>
                  <span className="text-pink-300 font-bold">{selectedCell.p} ppm</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded bg-blue-500" />
                    <span>Potassium (K)</span>
                  </div>
                  <span className="text-blue-300 font-bold">{selectedCell.k} ppm</span>
                </div>
              </div>
            </div>

            {/* Soil Vulnerability Assessment */}
            <div className="bg-cyber-obsidian/60 border border-slate-800/50 rounded p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Vulnerability Index</span>
                <span className={`text-[10px] font-bold uppercase ${
                  selectedCell.cellRisk > 0.6 ? 'text-cyber-crimson-glow' : selectedCell.cellRisk > 0.35 ? 'text-cyber-gold-glow' : 'text-cyber-emerald-glow'
                }`}>
                  {selectedCell.cellRisk > 0.6 ? 'High Risk' : selectedCell.cellRisk > 0.35 ? 'Medium' : 'Stable'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-3 h-3 rounded-full ${
                  selectedCell.cellRisk > 0.6 ? 'led-blinker-red' : selectedCell.cellRisk > 0.35 ? 'led-blinker-orange' : 'led-blinker-green'
                }`} />
                <span className="text-xs text-slate-300">
                  {selectedCell.cellRisk > 0.6 
                    ? 'Prone to localized water pooling & root stress.' 
                    : selectedCell.cellRisk > 0.35 
                      ? 'Drying soil rate average. Standard drainage.' 
                      : 'Optimal biological and moisture buffers.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Live Ticker at the bottom of the inspector */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <Thermometer size={12} className="text-orange-400 animate-pulse" />
            <span>T: {currentDayData.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplet size={12} className="text-cyan-400 animate-pulse" />
            <span>R: {currentDayData.rainfall}mm</span>
          </div>
          <div className="flex items-center gap-1">
            <Sun size={12} className="text-yellow-400 animate-pulse" />
            <span>RH: {currentDayData.humidity}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
