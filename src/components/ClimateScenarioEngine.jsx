import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { CloudRain, Flame, AlertTriangle, RefreshCw, Zap, Bug, Sparkles } from 'lucide-react';

export default function ClimateScenarioEngine({
  currentDay,
  setCurrentDay,
  scenarios,
  selectedScenarioId,
  setSelectedScenarioId,
  regenerateScenarios
}) {
  const activeScenario = useMemo(() => {
    return scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];
  }, [scenarios, selectedScenarioId]);

  // Compute stochastic statistics (mean, min, max) for every single day across all scenarios
  const weatherEnvelopes = useMemo(() => {
    const data = [];
    for (let day = 1; day <= 120; day++) {
      let minTemp = 100, maxTemp = -100, sumTemp = 0;
      let minRain = 100, maxRain = -100, sumRain = 0;
      
      scenarios.forEach(scen => {
        const point = scen.timeSeries[day - 1] || { temperature: 25, rainfall: 0 };
        if (point.temperature < minTemp) minTemp = point.temperature;
        if (point.temperature > maxTemp) maxTemp = point.temperature;
        sumTemp += point.temperature;
        
        if (point.rainfall < minRain) minRain = point.rainfall;
        if (point.rainfall > maxRain) maxRain = point.rainfall;
        sumRain += point.rainfall;
      });
      
      data.push({
        day,
        minTemp: parseFloat(minTemp.toFixed(1)),
        maxTemp: parseFloat(maxTemp.toFixed(1)),
        meanTemp: parseFloat((sumTemp / scenarios.length).toFixed(1)),
        minRain: parseFloat(minRain.toFixed(1)),
        maxRain: parseFloat(maxRain.toFixed(1)),
        meanRain: parseFloat((sumRain / scenarios.length).toFixed(1)),
        currentTemp: activeScenario.timeSeries[day - 1]?.temperature || 25,
        currentRain: activeScenario.timeSeries[day - 1]?.rainfall || 0
      });
    }
    return data;
  }, [scenarios, activeScenario]);

  const activeDayData = activeScenario?.timeSeries?.[currentDay - 1] || { temperature: 24, rainfall: 0, pestRisk: 10, humidity: 60 };

  const getEventIcon = (type) => {
    switch (type) {
      case 'Severe Heatwave': return <Flame className="text-cyber-gold-glow animate-pulse" size={16} />;
      case 'Extended Drought': return <AlertTriangle className="text-amber-500" size={16} />;
      case 'Delayed Monsoon': return <Zap className="text-yellow-400" size={16} />;
      case 'Flash Flood': return <CloudRain className="text-cyber-cyan-glow" size={16} />;
      case 'Late Pest Outbreak': return <Bug className="text-lime-500" size={16} />;
      default: return <Sparkles className="text-cyber-emerald-glow" size={16} />;
    }
  };

  const getEventBannerClass = (type) => {
    switch (type) {
      case 'Severe Heatwave': return 'bg-cyber-gold/10 border-cyber-gold/30 text-cyber-gold-glow';
      case 'Extended Drought': return 'bg-amber-950/20 border-amber-800/30 text-amber-300';
      case 'Delayed Monsoon': return 'bg-yellow-950/25 border-yellow-800/30 text-yellow-300';
      case 'Flash Flood': return 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan-glow';
      case 'Late Pest Outbreak': return 'bg-lime-950/20 border-lime-800/30 text-lime-400';
      default: return 'bg-cyber-emerald/10 border-cyber-emerald/30 text-cyber-emerald-glow';
    }
  };

  return (
    <div className="cyber-panel p-4 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-cyber-emerald-glow animate-spin" style={{ animationDuration: '6s' }} size={18} />
          <h3 className="font-display font-bold text-sm tracking-widest text-slate-100 uppercase">
            Generative Climate Scenario Engine
          </h3>
          <span className="text-[10px] bg-cyber-emerald/15 text-cyber-emerald-glow border border-cyber-emerald/30 px-1.5 py-0.5 rounded font-mono uppercase">
            {scenarios.length} Synthetic Paths
          </span>
        </div>
        
        <button
          onClick={regenerateScenarios}
          className="flex items-center gap-1.5 text-xs bg-cyber-emerald/10 hover:bg-cyber-emerald/20 text-cyber-emerald-glow border border-cyber-emerald/30 px-2.5 py-1 rounded transition-all duration-200"
        >
          <RefreshCw size={12} className="hover:rotate-180 transition-all duration-500" />
          <span>Regenerate Scenarios</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 flex-grow">
        {/* Scenario Select Panel (1 Col) */}
        <div className="md:col-span-1 bg-cyber-obsidian border border-slate-800/80 rounded p-2.5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase mb-2">Select Climate Pattern</div>
            <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-1 cyber-scrollbar">
              {scenarios.map((scen) => {
                const isSelected = scen.id === selectedScenarioId;
                return (
                  <button
                    key={scen.id}
                    onClick={() => setSelectedScenarioId(scen.id)}
                    className={`w-full text-left p-2 rounded text-xs border transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyber-emerald/15 border-cyber-emerald/60 text-slate-100 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                        : 'bg-cyber-slate/50 border-slate-850/50 text-slate-400 hover:border-slate-850 hover:bg-cyber-slate hover:text-slate-200'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <div className="font-semibold text-slate-200">{scen.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono truncate">{scen.type}</div>
                    </div>
                    {getEventIcon(scen.type)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incident Alert box */}
          <div className={`mt-3 p-2.5 border rounded text-xs leading-relaxed ${getEventBannerClass(activeScenario?.type)}`}>
            <div className="flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wider mb-1 font-mono">
              <AlertTriangle size={12} />
              <span>Simulation Incident Report</span>
            </div>
            {activeScenario?.description}
          </div>
        </div>

        {/* Charts & Graphs Display (3 Cols) */}
        <div className="md:col-span-3 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
            {/* Temp Envelope Chart */}
            <div className="bg-cyber-obsidian/60 border border-slate-800/80 rounded p-2.5 h-[170px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 font-mono">Stochastic Temp Envelope (°C)</span>
                <span className="text-[10px] text-cyber-gold-glow font-mono font-bold">
                  Mean: {activeDayData.temperature.toFixed(1)}°C
                </span>
              </div>
              <div className="w-full h-[135px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weatherEnvelopes} margin={{ top: 2, right: 2, left: -25, bottom: 2 }}>
                    <XAxis dataKey="day" hide />
                    <YAxis domain={[5, 45]} tick={{ fill: '#475569', fontSize: 9 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f1626', border: '1px solid #1e293b', borderRadius: '4px', fontSize: 11 }}
                      labelStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="maxTemp" stroke="none" fill="rgba(245,158,11,0.06)" />
                    <Area type="monotone" dataKey="minTemp" stroke="none" fill="rgba(245,158,11,0.06)" />
                    <Area type="monotone" dataKey="meanTemp" stroke="rgba(245,158,11,0.25)" fill="none" strokeWidth={1} strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="currentTemp" stroke="#f59e0b" fill="none" strokeWidth={1.8} dot={false} />
                    <ReferenceLine x={currentDay} stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Precipitation Envelope Chart */}
            <div className="bg-cyber-obsidian/60 border border-slate-800/80 rounded p-2.5 h-[170px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 font-mono">Precipitation Envelope (mm)</span>
                <span className="text-[10px] text-cyber-cyan-glow font-mono font-bold">
                  Day Accumulation: {activeDayData.rainfall}mm
                </span>
              </div>
              <div className="w-full h-[135px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weatherEnvelopes} margin={{ top: 2, right: 2, left: -25, bottom: 2 }}>
                    <XAxis dataKey="day" hide />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f1626', border: '1px solid #1e293b', borderRadius: '4px', fontSize: 11 }}
                      labelStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="maxRain" stroke="none" fill="rgba(6,182,212,0.06)" />
                    <Area type="monotone" dataKey="minRain" stroke="none" fill="rgba(6,182,212,0.06)" />
                    <Area type="monotone" dataKey="meanRain" stroke="rgba(6,182,212,0.25)" fill="none" strokeWidth={1} strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="currentRain" stroke="#06b6d4" fill="none" strokeWidth={1.8} dot={false} />
                    <ReferenceLine x={currentDay} stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Timeline slider control (At the bottom of charts) */}
          <div className="bg-cyber-obsidian border border-slate-800/80 rounded p-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Season Timeline Control</span>
                <span className="font-digital text-sm text-cyber-emerald-glow animate-pulse">
                  DAY {currentDay} OF 120
                </span>
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                {currentDay <= 40 ? 'Vegetative State' : currentDay <= 85 ? 'Flowering & Pod Filling' : 'Ripening & Harvest Stage'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-mono">DAY 1</span>
              <input
                type="range"
                min="1"
                max="120"
                value={currentDay}
                onChange={(e) => setCurrentDay(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-cyber-emerald outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">DAY 120</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
