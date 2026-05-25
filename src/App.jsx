import React, { useState, useEffect, useMemo } from 'react';
import DigitalTwinMap from './components/DigitalTwinMap';
import ClimateScenarioEngine from './components/ClimateScenarioEngine';
import StrategySimulation from './components/StrategySimulation';
import RiskAnalytics from './components/RiskAnalytics';
import PlaybookInsights from './components/PlaybookInsights';
import AICopilot from './components/AICopilot';
import { Eye, HelpCircle, AlertCircle, Cpu, Wifi, Radio, Shield, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import ReportDeliverySystem from './components/ReportDeliverySystem';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';

// Pre-programmed seed-generators for stochastic modeling
const SCENARIO_TEMPLATES = [
  { type: 'Normal Season', name: 'Optimized Baseline', description: 'Average temperatures (23-28°C) with regular bi-weekly rainfall. Standard historical profile. Zero active Black Swan hazards.' },
  { type: 'Severe Heatwave', name: 'Scenario 12 (Thermal Stress)', description: 'Black Swan Event: Severe late-June heatwave (temp spikes to 42°C for 25 continuous days). High evaporative moisture draw. Threatens flowering crops.' },
  { type: 'Delayed Monsoon', name: 'Scenario 24 (Arid Monsoon Gap)', description: 'Black Swan Event: Sowing rains delayed by 45 days. Early season drought followed by heavy late-season recovery storms. High seed germination risks.' },
  { type: 'Extended Drought', name: 'Scenario 42 (Extended Rain Deficit)', description: 'Black Swan Event: Total precipitation failure (0mm) between Day 25 and Day 85. Severe moisture depletion. Sub-surface clay hardens.' },
  { type: 'Flash Flood', name: 'Scenario 68 (Saturating Cloudburst)', description: 'Black Swan Event: Unprecedented cloudburst at Day 60 (125mm of rain in 36 hours). Immediate surface flooding and soil waterlogging.' },
  { type: 'Late Pest Outbreak', name: 'Scenario 85 (High Humidity Swarm)', description: 'Black Swan Event: Warm, humid conditions at Day 70 trigger sudden stem borer infestation. Pest threat levels spike from 10% to 85%.' }
];

// Helper to generate 100 stochastic weather paths
function generate100Scenarios() {
  return Array.from({ length: 100 }, (_, index) => {
    // Distribute template categories across 100 paths
    const templateIdx = index % SCENARIO_TEMPLATES.length;
    const template = SCENARIO_TEMPLATES[templateIdx];
    
    const timeSeries = [];
    let cumulativeRain = 0;

    for (let day = 1; day <= 120; day++) {
      let temp = 24 + 3 * Math.sin((day / 120) * Math.PI) + (Math.random() * 4 - 2);
      let rain = Math.random() < 0.15 ? Math.random() * 18 : 0;
      let pest = Math.max(5, 12 + 8 * Math.sin((day / 120) * Math.PI) + (Math.random() * 6 - 3));
      let ndviMod = 0;

      // Inject stress event paths depending on the template type
      if (template.type === 'Severe Heatwave' && day >= 35 && day <= 65) {
        temp += 10 + (Math.random() * 4 - 2);
        rain = 0;
        ndviMod = -0.15;
      }
      
      if (template.type === 'Delayed Monsoon') {
        if (day < 45) {
          rain = 0;
          temp += 2;
          ndviMod = -0.1;
        } else if (day >= 45 && day <= 55) {
          rain = Math.random() * 35; // intense storm recovery
        }
      }

      if (template.type === 'Extended Drought' && day >= 25 && day <= 85) {
        rain = 0;
        temp += 1.5;
        ndviMod = -0.2;
      }

      if (template.type === 'Flash Flood') {
        if (day === 60) {
          rain = 85 + Math.random() * 40;
          ndviMod = -0.22;
        } else if (day === 61) {
          rain = 30 + Math.random() * 15;
        }
      }

      if (template.type === 'Late Pest Outbreak' && day >= 70 && day <= 90) {
        pest = 70 + (Math.random() * 15 - 7.5);
        ndviMod = -0.18;
      }

      // Cap bounds
      temp = parseFloat(Math.max(5, Math.min(50, temp)).toFixed(1));
      rain = parseFloat(Math.max(0, Math.min(150, rain)).toFixed(1));
      pest = parseFloat(Math.max(1, Math.min(100, pest)).toFixed(1));

      timeSeries.push({
        day,
        temperature: temp,
        rainfall: rain,
        pestRisk: pest,
        ndviModifier: ndviMod
      });
    }

    return {
      id: index + 1,
      name: `${template.name.split(' (')[0]} - Run ${String(index + 1).padStart(3, '0')}`,
      type: template.type,
      description: template.description,
      timeSeries
    };
  });
}

// Compute the yield and resilience of a single strategy run
function computeYieldOutcome(crop, sowingOffset, irrigation, fertilizer, scenario) {
  // Baseline yields (tons/acre)
  let baseYield = 0;
  let maxWaterUse = 0;
  
  if (crop === 'maize') { baseYield = 5.6; maxWaterUse = 380000; }
  else if (crop === 'wheat') { baseYield = 4.2; maxWaterUse = 290000; }
  else if (crop === 'rice') { baseYield = 5.0; maxWaterUse = 580000; }
  else if (crop === 'soybeans') { baseYield = 3.6; maxWaterUse = 320000; }

  let yieldLoss = 0;
  
  // Calculate weather stresses across the 120 days
  let totalRain = 0;
  let severeHeatDays = 0;
  let waterlogDays = 0;
  let highestPestRisk = 0;

  scenario.timeSeries.forEach((dayData) => {
    totalRain += dayData.rainfall;
    if (dayData.temperature > 37) severeHeatDays++;
    if (dayData.rainfall > 80) waterlogDays++;
    if (dayData.pestRisk > highestPestRisk) highestPestRisk = dayData.pestRisk;
  });

  // 1. Water Stress (Drought) Penalities
  const isRainfed = irrigation === 'rainfed';
  const isDeficit = irrigation === 'deficit';
  const isAutomated = irrigation === 'automated';

  let droughtPenalty = 0;
  if (scenario.type === 'Extended Drought' || totalRain < 120) {
    if (isRainfed) droughtPenalty = 0.70;
    else if (isDeficit) droughtPenalty = 0.22;
    else if (isAutomated) droughtPenalty = 0.08;
    else droughtPenalty = 0.18; // fixed intervals
  } else if (scenario.type === 'Delayed Monsoon' && totalRain < 180) {
    if (isRainfed) droughtPenalty = 0.45;
    else if (isAutomated) droughtPenalty = 0.05;
    else droughtPenalty = 0.15;
  }
  yieldLoss += baseYield * droughtPenalty;

  // 2. Heat Stress & Flowering window overlap
  // Flowering typically occurs between day 45-75. Shifting sowing date moves this sensitive stage!
  const criticalFloweringStart = 45 + sowingOffset;
  const criticalFloweringEnd = 75 + sowingOffset;

  let heatLossCoefficient = 0;
  if (crop === 'wheat') heatLossCoefficient = 0.08; // highly sensitive
  else if (crop === 'maize') heatLossCoefficient = 0.06;
  else if (crop === 'rice') heatLossCoefficient = 0.03;
  else heatLossCoefficient = 0.04;

  let interactiveHeatDays = 0;
  scenario.timeSeries.forEach((dayData) => {
    if (dayData.day >= criticalFloweringStart && dayData.day <= criticalFloweringEnd && dayData.temperature > 36) {
      interactiveHeatDays++;
    }
  });

  if (interactiveHeatDays > 0) {
    const heatPenalty = Math.min(0.60, interactiveHeatDays * heatLossCoefficient);
    yieldLoss += baseYield * heatPenalty;
  }

  // 3. Flood waterlogging penalty (Rice is fully immune, wheat/soybeans extremely susceptible)
  if (waterlogDays > 0) {
    let floodPenalty = 0;
    if (crop === 'wheat') floodPenalty = 0.50;
    else if (crop === 'soybeans') floodPenalty = 0.40;
    else if (crop === 'maize') floodPenalty = 0.30;
    else floodPenalty = 0.0; // rice loves floods!
    
    yieldLoss += baseYield * floodPenalty;
  }

  // 4. Pest infestation penalties (mitigated by chemical/fertilizer packages)
  if (highestPestRisk > 40) {
    let pestPenalty = 0.25;
    if (fertilizer === 'aggressive') pestPenalty = 0.04; // aggressive pesticide/nutrient buffer
    else if (fertilizer === 'balanced') pestPenalty = 0.12;
    
    yieldLoss += baseYield * pestPenalty;
  }

  // Final yield math
  let finalYield = baseYield - yieldLoss;
  finalYield = Math.max(0.4, Math.min(baseYield * 1.1, finalYield)); // yield bounds

  return parseFloat(finalYield.toFixed(2));
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [currentDay, setCurrentDay] = useState(1);
  const [activeStrategy, setActiveStrategy] = useState({
    crop: 'maize',
    sowingOffset: 0,
    irrigation: 'automated',
    fertilizer: 'balanced'
  });
  const [selectedScenarioId, setSelectedScenarioId] = useState(1);
  const [scenarios, setScenarios] = useState(() => generate100Scenarios());
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Overall evaluation results state
  const [evaluationResults, setEvaluationResults] = useState({
    expectedYield: 0,
    worstCaseYield: 0,
    failureProbability: 0,
    waterConsumption: 0,
    resilienceScore: 0,
    yieldsList: [],
    riskHeatmap: []
  });

  const activeScenario = useMemo(() => {
    if (scenarios.length === 0) return null;
    return scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];
  }, [scenarios, selectedScenarioId]);

  // Strategy simulation core solver
  const runStrategyEvaluation = () => {
    if (scenarios.length === 0) return;
    
    setIsSimulating(true);
    
    // Simulate complex parallel processing with a nice cyber loading block
    setTimeout(() => {
      const yields = scenarios.map(scen => {
        return computeYieldOutcome(
          activeStrategy.crop,
          activeStrategy.sowingOffset,
          activeStrategy.irrigation,
          activeStrategy.fertilizer,
          scen
        );
      });

      // Calculate Expected Yield
      const sum = yields.reduce((acc, curr) => acc + curr, 0);
      const expectedYield = sum / yields.length;

      // Calculate Worst-Case (5th percentile representing extreme tail-end failure)
      const sortedYields = [...yields].sort((a, b) => a - b);
      const worstCaseIdx = Math.floor(yields.length * 0.05);
      const worstCaseYield = sortedYields[worstCaseIdx];

      // Calculate Failure Probability (under 2.0 tons/acre profit threshold)
      const failureCount = yields.filter(y => y < 2.0).length;
      const failureProbability = Math.round((failureCount / yields.length) * 100);

      // Calculate water consumption (in Liters per acre)
      let baseWater = 0;
      if (activeStrategy.crop === 'maize') baseWater = 300000;
      else if (activeStrategy.crop === 'wheat') baseWater = 220000;
      else if (activeStrategy.crop === 'rice') baseWater = 450000;
      else baseWater = 250000;

      let waterModifier = 1.0;
      if (activeStrategy.irrigation === 'automated') waterModifier = 0.95; // highly targeted drip savings
      if (activeStrategy.irrigation === 'deficit') waterModifier = 0.65; // aggressive deficit rationing
      if (activeStrategy.irrigation === 'fixed') waterModifier = 1.30; // scheduled overflow overhead
      if (activeStrategy.irrigation === 'rainfed') waterModifier = 0.0; // zero grid utility draw

      const waterConsumption = Math.round(baseWater * waterModifier);

      // Compute composite Resilience Score (Weighted rating: 50% Failure Avoidance, 30% Expected Yield, 20% Water frugality)
      const maxPossibleYield = activeStrategy.crop === 'maize' ? 6.1 : activeStrategy.crop === 'rice' ? 5.5 : activeStrategy.crop === 'wheat' ? 4.6 : 3.9;
      const yieldScore = (expectedYield / maxPossibleYield) * 30;
      const failureScore = (1 - failureProbability / 100) * 50;
      
      const maxWaterLimit = 585000;
      const waterScore = (1 - waterConsumption / maxWaterLimit) * 20;
      
      const resilienceScore = Math.min(100, Math.max(10, Math.round(yieldScore + failureScore + waterScore)));

      // Generate localized GIS cell-level risk heatmaps based on crop vulnerability
      const riskHeatmap = Array.from({ length: 100 }, (_, cellId) => {
        const row = Math.floor(cellId / 10);
        const col = cellId % 10;
        
        // Base land elevation & clay loam gradients
        const localSlopeVulnerability = 0.15 * Math.sin(row / 2) * Math.cos(col / 2.5);
        let stressRisk = failureProbability / 100 + localSlopeVulnerability;
        
        // Rainfed strategies elevate risk in high-exposure cells
        if (activeStrategy.irrigation === 'rainfed') stressRisk += 0.25;
        return parseFloat(Math.max(0.05, Math.min(0.98, stressRisk)).toFixed(2));
      });

      setEvaluationResults({
        expectedYield,
        worstCaseYield,
        failureProbability,
        waterConsumption,
        resilienceScore,
        yieldsList: yields,
        riskHeatmap
      });

      setIsSimulating(false);

      // Trigger high-resilience congratulatory fireworks!
      if (resilienceScore >= 80) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#3b82f6']
        });
      }
    }, 1000);
  };

  // Run a default evaluation on startup when scenarios are generated
  useEffect(() => {
    if (scenarios.length > 0) {
      runStrategyEvaluation();
    }
  }, [scenarios]);

  const regenerateScenarios = () => {
    const freshScenarios = generate100Scenarios();
    setScenarios(freshScenarios);
  };

  if (currentScreen === 'landing') {
    return <LandingPage onEnterDashboard={() => setCurrentScreen('login')} />;
  }

  if (currentScreen === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => setCurrentScreen('dashboard')}
        onBack={() => setCurrentScreen('landing')}
      />
    );
  }

  return (
    <div className="h-full flex flex-col justify-between p-3 select-none">
      {/* Platform Title HUD Bar */}
      <header className="flex items-center justify-between border border-slate-800 bg-cyber-slate/90 backdrop-blur-md rounded-lg py-2.5 px-4 mb-3 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-cyber-emerald/40 bg-cyber-emerald/10 text-cyber-emerald-glow animate-pulse">
            🌱
          </div>
          <div>
            <h1 className="font-display font-black text-sm md:text-base tracking-widest text-slate-100 uppercase m-0 leading-none">
              AgroTwin AI
            </h1>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mt-0.5">
              Generative Agricultural Digital Twin v2.8
            </span>
          </div>
        </div>

        {/* Global Diagnostic Live Ticker */}
        <div className="hidden lg:flex items-center gap-6 font-mono text-[10px]">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-5">
            <Cpu className="text-cyber-cyan-glow" size={13} />
            <span className="text-slate-400">CORE SOLVER:</span>
            <span className="text-cyber-cyan-glow font-bold animate-pulse">SOLVING_COMPOSITE</span>
          </div>
          <div className="flex items-center gap-2 border-r border-slate-800 pr-5">
            <Wifi className="text-cyber-emerald-glow animate-ping" size={12} style={{ animationDuration: '3s' }} />
            <span className="text-slate-400">TELEMETRY LINK:</span>
            <span className="text-cyber-emerald-glow font-bold">VERIFIED_ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="text-cyber-gold-glow animate-pulse" size={13} />
            <span className="text-slate-400">BLACK SWAN ALERT:</span>
            <span className="text-cyber-gold-glow font-bold uppercase">
              {activeScenario?.type || 'STABLE'}
            </span>
          </div>
        </div>

        {/* Dynamic status LED indicator & Report Dispatch System */}
        <div className="flex items-center gap-4">
          <ReportDeliverySystem 
            activeStrategy={activeStrategy}
            evaluationResults={evaluationResults}
            activeScenarioType={activeScenario?.type || 'Normal Season'}
          />
          <button
            onClick={() => setCurrentScreen('landing')}
            className="px-3 py-1.5 rounded border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:text-red-300 hover:border-red-500/60 font-mono text-[9px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1"
          >
            <span>🔓</span> LOGOUT
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase hidden md:inline">SYSTEM STATE:</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-emerald-glow opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-emerald"></span>
            </span>
          </div>
        </div>
      </header>

      {/* Main command deck grid */}
      <main className="flex-grow grid grid-cols-1 xl:grid-cols-4 gap-3 overflow-hidden mb-3">
        {/* Left Side: Strategy Configuration Sandbox (1 Col) */}
        <div className="xl:col-span-1 h-full min-h-[300px]">
          <StrategySimulation 
            activeStrategy={activeStrategy}
            setActiveStrategy={setActiveStrategy}
            onRunSimulation={runStrategyEvaluation}
            isSimulating={isSimulating}
          />
        </div>

        {/* Center: Digital Twin Visual Grid (2 Cols) */}
        <div className="xl:col-span-2 h-full flex flex-col justify-between space-y-3 min-h-[450px]">
          {/* Virtual GIS map */}
          <div className="flex-grow">
            <DigitalTwinMap 
              currentDay={currentDay}
              activeScenario={activeScenario}
              activeStrategy={activeStrategy}
              riskHeatmap={evaluationResults.riskHeatmap}
            />
          </div>

          {/* Scenario graph generator */}
          <div className="h-[270px]">
            <ClimateScenarioEngine 
              currentDay={currentDay}
              setCurrentDay={setCurrentDay}
              scenarios={scenarios}
              selectedScenarioId={selectedScenarioId}
              setSelectedScenarioId={setSelectedScenarioId}
              regenerateScenarios={regenerateScenarios}
            />
          </div>
        </div>

        {/* Right Side: Predictive Analytics + XAI Playbook + LLM Copilot Terminal (1 Col) */}
        <div className="xl:col-span-1 h-full flex flex-col justify-between space-y-3 overflow-y-auto pr-1 cyber-scrollbar min-h-[500px]">
          {/* Yield metrics risk dashboard */}
          <div className="shrink-0">
            <RiskAnalytics evaluationResults={evaluationResults} />
          </div>

          {/* Explainable AI SHAP attribution & playbook */}
          <div className="shrink-0">
            <PlaybookInsights 
              activeStrategy={activeStrategy}
              evaluationResults={evaluationResults}
              scenarios={scenarios}
              activeScenarioId={selectedScenarioId}
            />
          </div>

          {/* Multilingual AI Terminal */}
          <div className="flex-grow min-h-[320px]">
            <AICopilot 
              activeStrategy={activeStrategy} 
              currentScenarioType={activeScenario?.type || 'Normal Season'} 
            />
          </div>
        </div>
      </main>

      {/* Footer dynamic tickers */}
      <footer className="border border-slate-900 bg-[#060a12]/80 px-4 py-1.5 rounded-lg flex items-center justify-between text-[9px] font-mono text-slate-500 z-10">
        <div>© 2026 AgroTwin AI Inc. All rights reserved. Quantum Agriculture Command Deck.</div>
        <div className="flex items-center gap-3">
          <span>LATITUDE: 34.0522° N</span>
          <span>LONGITUDE: -118.2437° W</span>
          <span>ELEVATION: 104M ASL</span>
          <span className="text-cyber-cyan-glow">STOCHASTIC_ENVELOPE_CALC_OK</span>
        </div>
      </footer>
    </div>
  );
}
