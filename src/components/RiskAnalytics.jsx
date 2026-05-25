import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Shield, ShieldAlert, Award, Droplets, Percent } from 'lucide-react';

export default function RiskAnalytics({ evaluationResults }) {
  const {
    expectedYield,
    worstCaseYield,
    failureProbability,
    waterConsumption,
    resilienceScore,
    yieldsList
  } = evaluationResults;

  // Generate dynamic probability density points based on the yields list
  const distributionData = useMemo(() => {
    if (!yieldsList || yieldsList.length === 0) return [];
    
    // Set up 15 yield bins from 0.0 to 7.0 tons/acre
    const binCount = 15;
    const maxYield = 7.0;
    const binWidth = maxYield / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      yieldVal: parseFloat(((i + 0.5) * binWidth).toFixed(1)),
      count: 0
    }));

    // Categorize actual outcomes into bins
    yieldsList.forEach(y => {
      const binIdx = Math.min(binCount - 1, Math.floor(y / binWidth));
      if (binIdx >= 0) bins[binIdx].count += 1;
    });

    // Smooth data into probability distribution shape
    return bins.map(b => ({
      ...b,
      probability: parseFloat(((b.count / yieldsList.length) * 100).toFixed(1))
    }));
  }, [yieldsList]);

  // Color mappings based on resilience score
  const scoreColorClass = resilienceScore >= 75 
    ? 'text-cyber-emerald-glow' 
    : resilienceScore >= 50 
      ? 'text-cyber-gold-glow' 
      : 'text-cyber-crimson-glow';

  const scoreGlowClass = resilienceScore >= 75 
    ? 'glow-text-emerald' 
    : resilienceScore >= 50 
      ? 'glow-text-gold' 
      : 'glow-text-crimson';

  const getShieldIcon = () => {
    if (resilienceScore >= 75) return <Shield className="text-cyber-emerald-glow" size={24} />;
    if (resilienceScore >= 50) return <Award className="text-cyber-gold-glow animate-pulse" size={24} />;
    return <ShieldAlert className="text-cyber-crimson-glow animate-bounce" size={24} />;
  };

  return (
    <div className="cyber-panel p-4 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
        {getShieldIcon()}
        <h3 className="font-display font-bold text-sm tracking-widest text-slate-100 uppercase">
          Yield-at-Risk Predictive Analytics
        </h3>
      </div>

      {/* KPI dashboard grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {/* Resilience Score */}
        <div className="bg-cyber-obsidian/75 border border-slate-800 rounded p-3 text-center flex flex-col justify-between items-center relative overflow-hidden">
          <div className="absolute top-1 left-2 text-[9px] text-slate-500 font-mono uppercase">Resilience Rating</div>
          <div className={`text-3xl font-digital ${scoreColorClass} ${scoreGlowClass} mt-2`}>
            {resilienceScore}
          </div>
          <span className="text-[9px] text-slate-400 font-mono mt-1">Index Score</span>
        </div>

        {/* Expected Yield */}
        <div className="bg-cyber-obsidian/75 border border-slate-800 rounded p-3 text-center flex flex-col justify-between items-center relative overflow-hidden">
          <div className="absolute top-1 left-2 text-[9px] text-slate-500 font-mono uppercase">Expected Yield</div>
          <div className="text-3xl font-digital text-slate-200 mt-2">
            {expectedYield.toFixed(2)}
          </div>
          <span className="text-[9px] text-slate-400 font-mono mt-1">Tons / Acre</span>
        </div>

        {/* Worst Case (5th percentile) */}
        <div className="bg-cyber-obsidian/75 border border-slate-800 rounded p-3 text-center flex flex-col justify-between items-center relative overflow-hidden">
          <div className="absolute top-1 left-2 text-[9px] text-cyber-gold-glow font-mono uppercase">Black Swan Yield</div>
          <div className="text-3xl font-digital text-cyber-gold-glow mt-2">
            {worstCaseYield.toFixed(2)}
          </div>
          <span className="text-[9px] text-slate-400 font-mono mt-1">5th %-tile Worst</span>
        </div>

        {/* Failure Probability */}
        <div className="bg-cyber-obsidian/75 border border-slate-800 rounded p-3 text-center flex flex-col justify-between items-center relative overflow-hidden">
          <div className="absolute top-1 left-2 text-[9px] text-cyber-crimson-glow font-mono uppercase">Loss Probability</div>
          <div className={`text-3xl font-digital ${failureProbability > 35 ? 'text-cyber-crimson-glow' : 'text-slate-300'} mt-2`}>
            {failureProbability}%
          </div>
          <span className="text-[9px] text-slate-400 font-mono mt-1">Below 2.0 t/ac</span>
        </div>

        {/* Water Consumption */}
        <div className="bg-cyber-obsidian/75 border border-slate-800 rounded p-3 text-center flex flex-col justify-between items-center lg:col-span-1 col-span-2 relative overflow-hidden">
          <div className="absolute top-1 left-2 text-[9px] text-cyber-cyan-glow font-mono uppercase">Water Footprint</div>
          <div className="text-2xl font-digital text-cyber-cyan-glow mt-3 flex items-center justify-center gap-1">
            <Droplets size={14} />
            {waterConsumption.toLocaleString()}
          </div>
          <span className="text-[9px] text-slate-400 font-mono mt-1">Total Liters Used</span>
        </div>
      </div>

      {/* Yield Curve Graph */}
      <div className="bg-cyber-obsidian/60 border border-slate-800/80 rounded p-3 h-[180px] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-400 font-mono">Yield Outcome Probability Distribution Curve</span>
          <span className="text-[9px] text-cyber-crimson-glow font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-crimson animate-ping" />
            Red Band = Economic Failure Zone (&lt; 2.0 t/ac)
          </span>
        </div>
        
        <div className="w-full h-[145px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={distributionData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <XAxis 
                dataKey="yieldVal" 
                tick={{ fill: '#64748b', fontSize: 9 }} 
                label={{ value: 'Crop Yield Output (Tons/Acre)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 9 }}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 9 }} 
                label={{ value: 'Occurrence Prob (%)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 9 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f1626', border: '1px solid #1e293b', borderRadius: '4px', fontSize: 10 }}
                labelFormatter={(value) => `Yield: ${value} t/ac`}
              />
              {/* Highlight loss threshold */}
              <ReferenceLine 
                x={2.0} 
                stroke="#ef4444" 
                strokeWidth={1.5} 
                strokeDasharray="4 4" 
                label={{ value: 'Loss Floor', position: 'top', fill: '#ef4444', fontSize: 8, fontWeight: 'bold' }} 
              />
              <Area 
                type="monotone" 
                dataKey="probability" 
                stroke="#10b981" 
                fill="url(#yieldGlow)" 
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="yieldGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
