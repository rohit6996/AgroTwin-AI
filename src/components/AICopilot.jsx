import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, HelpCircle, Globe, ChevronRight } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    welcome: "AgroTwin AI Copilot initialized. Select a quick query or enter custom telemetry parameters.",
    placeholder: "Ask AgroTwin Copilot...",
    btnRain: "What if rainfall reduces by 40%?",
    btnMinRisk: "Which strategy minimizes risk?",
    btnExplainShap: "Explain SHAP values simply",
    soilAlert: "Soil integrity optimal. Run stress simulation to recalculate.",
    thinking: "AI Copilot solving stochastic equations...",
    responseMinRisk: "To minimize crop failure under stress:\n1. Choose RICE if flash floods are predicted, or WHEAT if delayed monsoons.\n2. Set sowing offset to +12 days (late sowing) to bypass extreme heatwaves.\n3. Utilize Automated Drip Irrigation, which buffers moisture levels and cuts water consumption by 35%.\n4. Avoid Rainfed dryland protocols under stochastic droughts.",
    responseRainfall: "A 40% reduction in precipitation represents an Extended Drought event.\n- Without active irrigation, your crop's NDVI health drops below 0.30 within 40 days.\n- Under Maize or Soybeans, expected yields decline by 65%.\n- To buffer this stress, activate Automated Drip Irrigation immediately and shift sowing timing +10 days to delay vegetative peak.",
    responseShap: "SHAP values isolate the contribution of each strategy choice on your resilience score.\n- A green bar (+15) means a choice (e.g. Automated Drip) actively protected your crops.\n- A red bar (-20) means a choice (e.g. Rainfed) triggered a critical vulnerability."
  },
  hi: {
    welcome: "एग्रोट्विन एआई कोपायलट सक्रिय। एक त्वरित प्रश्न चुनें या विवरण दर्ज करें।",
    placeholder: "कोपायलट से पूछें...",
    btnRain: "यदि वर्षा 40% कम हो जाए तो क्या होगा?",
    btnMinRisk: "कौन सी रणनीति जोखिम को कम करती है?",
    btnExplainShap: "SHAP का मतलब आसान शब्दों में समझाएं",
    soilAlert: "मिट्टी की गुणवत्ता अनुकूल है। पुनर्मूल्यांकन के लिए सिमुलेशन चलाएं।",
    thinking: "समीकरणों का विश्लेषण किया जा रहा है...",
    responseMinRisk: "जोखिम को न्यूनतम करने के लिए:\n१. अत्यधिक बाढ़ में धान (RICE) चुनें, और मानसून में देरी होने पर गेहूं (WHEAT)।\n२. रोपण समय को +१२ दिन विलंबित करें (गर्मी से बचाव के लिए)।\n३. स्वचालित ड्रिप सिंचाई (Drip System) का उपयोग करें जो ३५% पानी बचाती है।\n४. सूखे की स्थिति में बिना सिंचाई खेती करने से बचें।",
    responseRainfall: "४०% कम वर्षा का अर्थ 'सूखा' (Drought) है।\n- बिना सिंचाई के, फसल स्वास्थ्य (NDVI) ४० दिनों के भीतर ०.३० से नीचे गिर जाएगा।\n- मक्का या सोयाबीन में प्रत्याशित उपज ६५% तक कम हो सकती है।\n- बचाव के लिए ड्रिप सिंचाई सक्रिय करें और रोपण समय +१० दिन बढ़ाएं।",
    responseShap: "SHAP मूल्य दिखाते हैं कि प्रत्येक विकल्प ने आपकी फसल लचीलापन (Resilience) को कैसे प्रभावित किया:\n- हरा बार (+15) दिखाता है कि ड्रिप सिंचाई ने सुरक्षा प्रदान की।\n- लाल बार (-20) दिखाता है कि बिना सिंचाई के खेती से भारी नुकसान हुआ।"
  },
  es: {
    welcome: "Copiloto AgroTwin AI inicializado. Seleccione una consulta o ingrese telemetría.",
    placeholder: "Preguntar al copiloto AgroTwin...",
    btnRain: "¿Qué pasa si la lluvia disminuye un 40%?",
    btnMinRisk: "¿Qué estrategia minimiza el riesgo?",
    btnExplainShap: "Explicar los valores SHAP de forma sencilla",
    soilAlert: "Integridad del suelo óptima. Ejecute la simulación.",
    thinking: "Analizando ecuaciones estocásticas...",
    responseMinRisk: "Para minimizar el fracaso de los cultivos:\n1. Elija ARROZ ante inundaciones repentinas o TRIGO ante monzones tardíos.\n2. Ajuste la siembra a +12 días (tardía) para evitar olas de calor extremas.\n3. Utilice Riego por Goteo Automatizado para mantener la humedad y ahorrar un 35% de agua.\n4. Evite cultivos de secano sin riego durante sequías.",
    responseRainfall: "Una reducción del 40% en las lluvias representa una Sequía Prolongada.\n- Sin riego activo, la salud NDVI del cultivo baja de 0.30 en 45 días.\n- Para maíz o soja, el rendimiento estimado disminuye un 65%.\n- Mitigación: Active Riego por Goteo e inicie la siembra +10 días más tarde.",
    responseShap: "Los valores SHAP aíslan el impacto de cada decisión en su puntuación de resiliencia.\n- Una barra verde (+15) indica que la opción (Riego por Goteo) protegió el cultivo.\n- Una barra roja (-20) indica que la opción (Secano) introdujo una vulnerabilidad crítica."
  },
  fr: {
    welcome: "Copilote AgroTwin AI initialisé. Sélectionnez une question rapide ou écrivez ci-dessous.",
    placeholder: "Demander au copilote AgroTwin...",
    btnRain: "Et si les précipitations baissent de 40%?",
    btnMinRisk: "Quelle stratégie minimise les risques?",
    btnExplainShap: "Expliquer les valeurs SHAP simplement",
    soilAlert: "Intégrité du sol optimale. Lancez la simulation.",
    thinking: "Calcul des équations stocastiques...",
    responseMinRisk: "Pour minimiser les pertes de rendement:\n1. Choisissez le RIZ en cas d'inondation, ou le BLÉ si la mousson est tardive.\n2. Décalez les semis de +12 jours (semis tardif) pour éviter les vagues de chaleur.\n3. Utilisez l'irrigation goutte-à-goutte automatisée, qui préserve l'humidité et économise 35% d'eau.\n4. Évitez l'agriculture pluviale non irriguée sous stress hydrique.",
    responseRainfall: "Une baisse de 40% des pluies correspond à une Sécheresse Prolongée.\n- Sans irrigation, la santé NDVI chute sous 0.30 en 40 jours.\n- Pour le maïs ou le soja, les rendements diminuent de 65%.\n- Recommandation: Activez le goutte-à-goutte et retardez les semis de 10 jours.",
    responseShap: "Les valeurs SHAP isolent la contribution de chaque choix de stratégie sur le score de résilience.\n- Une barre verte (+15) montre qu'un choix (goutte-à-goutte) a protégé les cultures.\n- Une barre rouge (-20) montre qu'un choix (pluvial) a créé une vulnérabilité critique."
  }
};

export default function AICopilot({ activeStrategy, currentScenarioType }) {
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState([
    { sender: 'copilot', text: TRANSLATIONS.en.welcome }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync welcome message on language change
  useEffect(() => {
    setMessages([
      { sender: 'copilot', text: TRANSLATIONS[lang].welcome }
    ]);
  }, [lang]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    // AI thinking effect
    setTimeout(() => {
      let aiText = '';
      const t = TRANSLATIONS[lang];
      
      const cleanText = text.toLowerCase();
      if (cleanText.includes('rain') || cleanText.includes('precip') || cleanText.includes('वर्षा') || cleanText.includes('lluvia') || cleanText.includes('pluie')) {
        aiText = t.responseRainfall;
      } else if (cleanText.includes('minim') || cleanText.includes('risk') || cleanText.includes('जोखिम') || cleanText.includes('riesgo') || cleanText.includes('risq')) {
        aiText = t.responseMinRisk;
      } else if (cleanText.includes('shap') || cleanText.includes('value') || cleanText.includes('मूल्य') || cleanText.includes('valeur')) {
        aiText = t.responseShap;
      } else {
        // Generic smart agro fallback
        aiText = lang === 'en' 
          ? `Analysis of ${currentScenarioType.toUpperCase()} scenario under crop ${activeStrategy.crop.toUpperCase()} indicates crop failure threshold is currently at ${activeStrategy.irrigation === 'rainfed' ? 'HIGH RISK' : 'STABLE BUFFER'}. Ensure drip systems are active and monitor soil zones.`
          : lang === 'hi'
            ? `फसल ${activeStrategy.crop.toUpperCase()} के तहत ${currentScenarioType.toUpperCase()} परिदृश्य के विश्लेषण से संकेत मिलता है कि जोखिम ${activeStrategy.irrigation === 'rainfed' ? 'उच्च' : 'स्थिर'} है। ड्रिप सिस्टम चालू रखें।`
            : lang === 'es'
              ? `El análisis del escenario ${currentScenarioType.toUpperCase()} bajo cultivo ${activeStrategy.crop.toUpperCase()} indica un nivel de riesgo ${activeStrategy.irrigation === 'rainfed' ? 'CRÍTICO' : 'ESTABLE'}. Mantenga activos los sistemas de goteo.`
              : `L'analyse du scénario ${currentScenarioType.toUpperCase()} pour la culture de ${activeStrategy.crop.toUpperCase()} indique un niveau de risque ${activeStrategy.irrigation === 'rainfed' ? 'ÉLEVÉ' : 'STABLE'}. Activez les vannes d'irrigation.`;
      }

      setMessages([...newMessages, { sender: 'copilot', text: aiText }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className="cyber-panel p-4 flex flex-col justify-between h-full border-l border-slate-800/80">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="text-cyber-cyan-glow animate-pulse" size={18} />
          <h3 className="font-display font-bold text-sm tracking-widest text-slate-100 uppercase">
            AgroTwin AI CRT Copilot
          </h3>
        </div>

        {/* Language select */}
        <div className="flex items-center gap-1 bg-cyber-obsidian border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-400">
          <Globe size={11} className="text-cyber-cyan-glow" />
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent border-none outline-none text-[10px] text-slate-300 font-semibold cursor-pointer"
          >
            <option value="en" className="bg-cyber-slate">EN</option>
            <option value="hi" className="bg-cyber-slate">HI</option>
            <option value="es" className="bg-cyber-slate">ES</option>
            <option value="fr" className="bg-cyber-slate">FR</option>
          </select>
        </div>
      </div>

      {/* Terminal Screen Console */}
      <div className="bg-[#050B14] border border-[#0d2a45]/60 rounded-lg p-3 h-[240px] flex flex-col overflow-y-auto mb-4 font-mono text-xs text-cyber-cyan-glow scanlines cyber-scrollbar space-y-3">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex items-start gap-1.5 ${
              m.sender === 'user' ? 'text-slate-300 justify-end' : 'text-cyber-cyan-glow'
            }`}
          >
            {m.sender !== 'user' && <ChevronRight className="mt-0.5 shrink-0" size={12} />}
            <div 
              className={`p-2 rounded max-w-[85%] whitespace-pre-line leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-cyber-cyan/15 border border-cyber-cyan/30' 
                  : 'bg-emerald-950/15 border border-emerald-900/10'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-[10px] text-slate-500 italic animate-pulse flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan-glow animate-ping" />
            <span>{t.thinking}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Question Queries */}
      <div className="space-y-1.5 mb-4">
        <button 
          onClick={() => handleSendMessage(t.btnRain)}
          disabled={isTyping}
          className="w-full text-left p-2 rounded bg-cyber-slate/30 border border-slate-850/50 text-[10px] text-slate-400 hover:text-slate-200 hover:border-slate-800 transition"
        >
          {t.btnRain}
        </button>
        <button 
          onClick={() => handleSendMessage(t.btnMinRisk)}
          disabled={isTyping}
          className="w-full text-left p-2 rounded bg-cyber-slate/30 border border-slate-850/50 text-[10px] text-slate-400 hover:text-slate-200 hover:border-slate-800 transition"
        >
          {t.btnMinRisk}
        </button>
        <button 
          onClick={() => handleSendMessage(t.btnExplainShap)}
          disabled={isTyping}
          className="w-full text-left p-2 rounded bg-cyber-slate/30 border border-slate-850/50 text-[10px] text-slate-400 hover:text-slate-200 hover:border-slate-800 transition"
        >
          {t.btnExplainShap}
        </button>
      </div>

      {/* Input box */}
      <div className="flex items-center bg-cyber-obsidian border border-slate-800 rounded p-1.5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={t.placeholder}
          disabled={isTyping}
          className="bg-transparent border-none outline-none flex-grow text-xs text-slate-200 px-2 font-mono"
        />
        <button 
          onClick={() => handleSendMessage(inputText)}
          disabled={isTyping}
          className="p-2 bg-cyber-cyan hover:bg-cyber-cyan-glow text-cyber-obsidian rounded transition shadow-[0_0_8px_rgba(6,182,212,0.2)]"
        >
          <Send size={12} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
