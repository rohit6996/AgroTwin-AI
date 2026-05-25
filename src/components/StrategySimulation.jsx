import React from 'react';
import { Sliders, Play, TrendingUp, Calendar, Droplets, Leaf } from 'lucide-react';

export default function StrategySimulation({
  activeStrategy,
  setActiveStrategy,
  onRunSimulation,
  isSimulating
}) {
  const handleCropChange = (crop) => {
    setActiveStrategy({ ...activeStrategy, crop });
  };

  const handleSowingChange = (val) => {
    setActiveStrategy({ ...activeStrategy, sowingOffset: parseInt(val) });
  };

  const handleIrrigationChange = (irrigation) => {
    setActiveStrategy({ ...activeStrategy, irrigation });
  };

  const handleFertilizerChange = (fertilizer) => {
    setActiveStrategy({ ...activeStrategy, fertilizer });
  };

  return (
    <div className="cyber-panel p-4 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
        <Sliders className="text-cyber-cyan-glow animate-pulse" size={18} />
        <h3 className="font-display font-bold text-sm tracking-widest text-slate-100 uppercase">
          Strategy Adaptability Simulator
        </h3>
      </div>

      {/* Control Panel Settings */}
      <div className="space-y-4 flex-grow">
        {/* Crop Selection */}
        <div>
          <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5">
            1. Crop Phenotype Selection
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {['maize', 'wheat', 'rice', 'soybeans'].map((crop) => {
              const isSelected = activeStrategy.crop === crop;
              return (
                <button
                  key={crop}
                  onClick={() => handleCropChange(crop)}
                  className={`py-1.5 px-1 rounded text-xs border capitalize transition-all duration-200 ${
                    isSelected
                      ? 'bg-cyber-cyan/15 border-cyber-cyan/60 text-slate-100 font-semibold shadow-[0_0_8px_rgba(6,182,212,0.1)]'
                      : 'bg-cyber-slate/50 border-slate-850/50 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {crop}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sowing Date Shift */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-slate-500 font-mono uppercase">
              2. Sowing Adjustment Date
            </label>
            <span className={`font-mono text-xs font-bold flex items-center gap-1 ${
              activeStrategy.sowingOffset === 0 
                ? 'text-slate-400' 
                : activeStrategy.sowingOffset > 0 
                  ? 'text-cyber-cyan-glow' 
                  : 'text-cyber-gold-glow'
            }`}>
              <Calendar size={12} />
              {activeStrategy.sowingOffset === 0 
                ? 'Sow at Normal Date' 
                : activeStrategy.sowingOffset > 0 
                  ? `Delay by ${activeStrategy.sowingOffset} Days` 
                  : `Advance by ${Math.abs(activeStrategy.sowingOffset)} Days`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono">-20d</span>
            <input
              type="range"
              min="-20"
              max="30"
              value={activeStrategy.sowingOffset}
              onChange={(e) => handleSowingChange(e.target.value)}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan outline-none"
            />
            <span className="text-[10px] text-slate-500 font-mono">+30d</span>
          </div>
        </div>

        {/* Irrigation Protocol */}
        <div>
          <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5">
            3. Irrigation Protocol
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'automated', label: 'Drip System (Sensor)', desc: 'Maximizes moisture buffers', icon: <Droplets size={12} /> },
              { id: 'deficit', label: 'Deficit Irrigation', desc: 'Saves 35% water resources', icon: <TrendingUp size={12} /> },
              { id: 'fixed', label: 'Fixed Intervals', desc: 'Standard scheduled watering', icon: <Calendar size={12} /> },
              { id: 'rainfed', label: 'Rainfed (Dryland)', desc: 'Zero added water buffer', icon: <Leaf size={12} /> }
            ].map((irr) => {
              const isSelected = activeStrategy.irrigation === irr.id;
              return (
                <button
                  key={irr.id}
                  onClick={() => handleIrrigationChange(irr.id)}
                  className={`p-2.5 rounded text-left border transition-all duration-200 flex flex-col justify-between h-[65px] ${
                    isSelected
                      ? 'bg-cyber-cyan/15 border-cyber-cyan/60 text-slate-100 shadow-[0_0_8px_rgba(6,182,212,0.1)]'
                      : 'bg-cyber-slate/50 border-slate-850/50 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-200">
                    {irr.icon}
                    <span>{irr.label}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 leading-tight block">{irr.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fertilizer & Nutrient Schedule */}
        <div>
          <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5">
            4. Nutrient Schedule
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'low', label: 'Low-Impact', desc: 'Organic inputs' },
              { id: 'balanced', label: 'Balanced', desc: 'NPK optimized' },
              { id: 'aggressive', label: 'Aggressive', desc: 'NPK + pest shield' }
            ].map((fert) => {
              const isSelected = activeStrategy.fertilizer === fert.id;
              return (
                <button
                  key={fert.id}
                  onClick={() => handleFertilizerChange(fert.id)}
                  className={`p-2 rounded text-left border transition-all duration-200 flex flex-col justify-between h-[55px] ${
                    isSelected
                      ? 'bg-cyber-cyan/15 border-cyber-cyan/60 text-slate-100 shadow-[0_0_8px_rgba(6,182,212,0.1)]'
                      : 'bg-cyber-slate/50 border-slate-850/50 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <span className="font-semibold text-xs text-slate-200 block capitalize">{fert.label}</span>
                  <span className="text-[9px] text-slate-500 leading-tight block truncate">{fert.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Run Simulation Trigger */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-emerald hover:from-cyber-cyan-glow hover:to-cyber-emerald-glow text-cyber-obsidian font-display font-black text-sm py-3 px-4 rounded shadow-glow-cyan transition duration-300 flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <Play size={16} fill="currentColor" />
          <span>{isSimulating ? 'Stochastic Solver Running...' : 'Execute Stress Simulation'}</span>
        </button>
      </div>
    </div>
  );
}
