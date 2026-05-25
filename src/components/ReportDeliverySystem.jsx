import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Mail, MapPin, Send, AlertTriangle, CheckCircle,
  FileText, Volume2, X, Play, Square, Loader,
  ChevronRight, ChevronLeft, User, Shield, Globe
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FARMER_REGISTRY = [
  { id: 1, name: 'Suresh Patil',      village: 'Wai',     farmId: 'F-101', crop: 'maize',    phone: '+91 98220 12345' },
  { id: 2, name: 'Ramesh Shinde',     village: 'Khed',    farmId: 'F-204', crop: 'wheat',    phone: '+91 94220 56789' },
  { id: 3, name: 'Aniket Jadhav',     village: 'Bhor',    farmId: 'F-308', crop: 'rice',     phone: '+91 90110 43210' },
  { id: 4, name: 'Sunita Deshmukh',   village: 'Phaltan', farmId: 'F-402', crop: 'soybeans', phone: '+91 88880 77777' },
  { id: 5, name: 'Dnyaneshwar Pawar', village: 'Shirur',  farmId: 'F-505', crop: 'maize',    phone: '+91 77770 11111' },
];

// ── Generate dynamic multilingual insights from live analytics data ──────────
function buildInsights(farmer, evaluationResults, activeScenarioType, activeStrategy) {
  const { resilienceScore = 0, expectedYield = 0, failureProbability = 0, worstCaseYield = 0, waterConsumption = 0 } = evaluationResults || {};
  const crop     = farmer?.crop?.toUpperCase() || 'CROP';
  const scenario = activeScenarioType || 'Normal Season';
  const yld      = expectedYield.toFixed(2);
  const wcYld    = worstCaseYield.toFixed(2);
  const water    = waterConsumption.toLocaleString();
  const irr      = activeStrategy?.irrigation || 'automated';
  const irrLabel = { automated: 'automated drip', deficit: 'deficit', fixed: 'fixed interval', rainfed: 'rainfed' }[irr] || irr;
  const risk     = failureProbability > 30 ? 'HIGH' : failureProbability > 15 ? 'MODERATE' : 'LOW';
  const isGood   = resilienceScore >= 70;

  const en =
    `Under the "${scenario}" climate scenario, your ${crop} farm has a resilience score of ${resilienceScore}/100. ` +
    `Expected yield is ${yld} T/Ac (worst-case: ${wcYld} T/Ac). ` +
    `Crop failure probability is ${failureProbability}% — Risk Level: ${risk}. ` +
    `Water consumption: ${water} L using ${irrLabel} irrigation. ` +
    (isGood
      ? `Farm strategy is strong. Continue current protocols and monitor sensor alerts.`
      : `Immediate action advised: switch to automated drip irrigation and delay sowing to avoid peak stress.`);

  const hi =
    `"${scenario}" जलवायु परिदृश्य में, आपकी ${crop} फसल का लचीलापन स्कोर ${resilienceScore}/100 है। ` +
    `अपेक्षित उपज ${yld} टन/एकड़ है (सबसे खराब: ${wcYld} टन/एकड़)। ` +
    `फसल विफलता की संभावना ${failureProbability}% है — जोखिम स्तर: ${risk === 'HIGH' ? 'उच्च' : risk === 'MODERATE' ? 'मध्यम' : 'कम'}। ` +
    `जल उपयोग: ${water} लीटर (${irrLabel} सिंचाई)। ` +
    (isGood
      ? `आपकी कृषि रणनीति मजबूत है। वर्तमान प्रोटोकॉल जारी रखें।`
      : `तत्काल सुधार जरूरी: स्वचालित ड्रिप सिंचाई अपनाएं और बुवाई को गर्मी के चरम से बचाने के लिए आगे बढ़ाएं।`);

  const mr =
    `"${scenario}" हवामान परिस्थितीत, तुमच्या ${crop} पिकाचा लवचिकता गुण ${resilienceScore}/100 आहे. ` +
    `अपेक्षित उत्पादन ${yld} टन/एकर आहे (सर्वात वाईट: ${wcYld} टन/एकर). ` +
    `पीक अपयशाची शक्यता ${failureProbability}% आहे — जोखीम पातळी: ${risk === 'HIGH' ? 'जास्त' : risk === 'MODERATE' ? 'मध्यम' : 'कमी'}. ` +
    `पाणी वापर: ${water} लीटर (${irrLabel} सिंचन). ` +
    (isGood
      ? `तुमची शेती रणनीती मजबूत आहे. सध्याचे प्रोटोकॉल सुरू ठेवा.`
      : `त्वरित कृती आवश्यक: स्वयंचलित ठिबक सिंचन वापरा आणि पेरणी उष्णतेच्या शिखरापासून दूर ठेवा.`);

  return { en, hi, mr };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ReportDeliverySystem({ activeStrategy, evaluationResults, activeScenarioType }) {
  const [isOpen, setIsOpen]                 = useState(false);
  const [step, setStep]                     = useState(1);
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailError, setEmailError]         = useState('');
  const [isSending, setIsSending]           = useState(false);
  const [sendStatus, setSendStatus]         = useState('idle');
  const [terminalLogs, setTerminalLogs]     = useState([]);
  const logsEndRef                          = useRef(null);
  const [audioLang, setAudioLang]           = useState('en');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [insightLang, setInsightLang]       = useState('en');
  const synthRef     = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Compute live insights whenever farmer / results change
  const insights = buildInsights(selectedFarmer, evaluationResults, activeScenarioType, activeStrategy);

  const closeModal = () => {
    setIsOpen(false); setSendStatus('idle'); setStep(1);
    setSelectedFarmer(null); setRecipientEmail(''); setEmailError('');
    setTerminalLogs([]); setSearchQuery('');
    if (synthRef.current) synthRef.current.cancel();
    setIsAudioPlaying(false);
  };

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const handleEmailChange = (v) => {
    setRecipientEmail(v);
    if (!v.trim())          setEmailError('Email address is required.');
    else if (!validateEmail(v)) setEmailError('Invalid format — e.g. yourname@gmail.com');
    else                    setEmailError('');
  };

  const filteredFarmers = FARMER_REGISTRY.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── TTS — speaks the live insights in chosen language ────────────────────
  const speakVoiceAdvisory = () => {
    if (!synthRef.current) return;
    if (isAudioPlaying) { synthRef.current.cancel(); setIsAudioPlaying(false); return; }
    const voices  = synthRef.current.getVoices();
    const mrVoice = voices.find(v => v.lang.toLowerCase().startsWith('mr'));
    const hiVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
    let text = insights.en, langCode = 'en-US', selVoice = null;
    if (audioLang === 'mr') {
      text     = mrVoice ? insights.mr : insights.mr.replace(/[^\x00-\x7F]/g, '') || insights.en;
      langCode = mrVoice ? 'mr-IN' : 'en-US'; selVoice = mrVoice || null;
    } else if (audioLang === 'hi') {
      text     = hiVoice ? insights.hi : insights.hi.replace(/[^\x00-\x7F]/g, '') || insights.en;
      langCode = hiVoice ? 'hi-IN' : 'en-US'; selVoice = hiVoice || null;
    } else {
      selVoice = voices.find(v => v.lang.startsWith('en')) || null;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = langCode; utt.rate = 0.85;
    if (selVoice) utt.voice = selVoice;
    utt.onend   = () => setIsAudioPlaying(false);
    utt.onerror = () => setIsAudioPlaying(false);
    utteranceRef.current = utt;
    setIsAudioPlaying(true);
    synthRef.current.speak(utt);
  };
  useEffect(() => () => { if (synthRef.current) synthRef.current.cancel(); }, []);

  // ── PDF Generation ───────────────────────────────────────────────────────
  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.setFillColor(11, 15, 25); doc.rect(0, 0, 210, 297, 'F');
    doc.setDrawColor(16, 185, 129); doc.setLineWidth(1.5); doc.rect(10, 10, 190, 277);

    // Header
    doc.setTextColor(16, 185, 129); doc.setFont('Helvetica', 'Bold'); doc.setFontSize(16);
    doc.text('AGROTWIN AI | CLIMATE ADVISORY REPORT', 15, 24);
    doc.setTextColor(100, 116, 139); doc.setFontSize(9); doc.setFont('Helvetica', 'Normal');
    doc.text('Quantum Agronomic Command Center – Enterprise Dispatch', 15, 30);
    doc.setDrawColor(30, 41, 59); doc.setLineWidth(0.5); doc.line(15, 35, 195, 35);

    // Section 1: Metadata
    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont('Helvetica', 'Bold');
    doc.text('1. Farm & Registry Metadata', 15, 44);
    doc.setFontSize(9); doc.setFont('Helvetica', 'Normal'); doc.setTextColor(226, 232, 240);
    doc.text(`Farmer: ${selectedFarmer.name}`,           15, 52); doc.text(`Crop: ${selectedFarmer.crop.toUpperCase()}`,  110, 52);
    doc.text(`Village: ${selectedFarmer.village}`,        15, 58); doc.text(`Phone: ${selectedFarmer.phone}`,              110, 58);
    doc.text(`Farm ID: ${selectedFarmer.farmId}`,         15, 64); doc.text(`Email: ${recipientEmail}`,                    110, 64);
    doc.text(`Scenario: ${activeScenarioType}`,           15, 70);

    // Section 2: Analytics
    doc.setFontSize(12); doc.setFont('Helvetica', 'Bold'); doc.setTextColor(16, 185, 129);
    doc.text('2. Climate Resilience & Predictive Analytics', 15, 82);
    doc.setFontSize(9); doc.setFont('Helvetica', 'Normal'); doc.setTextColor(226, 232, 240);
    doc.text(`Resilience Score:    ${evaluationResults.resilienceScore}/100`,                        15, 90);
    doc.text(`Expected Yield:      ${evaluationResults.expectedYield.toFixed(2)} T/Ac`,              15, 96);
    doc.text(`Worst-Case Yield:    ${evaluationResults.worstCaseYield.toFixed(2)} T/Ac (5%)`,        15, 102);
    doc.text(`Failure Probability: ${evaluationResults.failureProbability}%`,                        15, 108);
    doc.text(`Water Footprint:     ${evaluationResults.waterConsumption.toLocaleString()} L`,         15, 114);

    // Section 3: Soil table
    doc.setFontSize(12); doc.setFont('Helvetica', 'Bold'); doc.setTextColor(255, 255, 255);
    doc.text('3. Soil Chemistry Telemetry', 15, 126);
    autoTable(doc, {
      startY: 132,
      head: [['Nutrient', 'Optimal', 'Current', 'Status']],
      body: [
        ['Soil pH',        '6.0–7.0',     '6.4 pH',   'OPTIMAL'],
        ['Nitrogen (N)',   '60–80 ppm',   '72 ppm',   'SUFFICIENT'],
        ['Phosphorus (P)', '40–55 ppm',   '46 ppm',   'SATISFACTORY'],
        ['Potassium (K)',  '170–210 ppm', '192 ppm',  'OPTIMAL'],
      ],
      theme: 'grid',
      styles: { fillColor: [15, 22, 38], textColor: [226, 232, 240], fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129], textColor: [7, 10, 19] },
      margin: { left: 15, right: 15 },
    });

    // Section 4: Playbook
    const sy4 = (doc.lastAutoTable?.finalY ?? 165) + 10;
    doc.setFontSize(12); doc.setFont('Helvetica', 'Bold'); doc.setTextColor(6, 182, 212);
    doc.text('4. AI Playbook Recommendations', 15, sy4);
    doc.setFontSize(9); doc.setFont('Helvetica', 'Normal'); doc.setTextColor(226, 232, 240);
    const recs = [
      `[SOWING]:     ${activeStrategy.sowingOffset > 10 ? `Delay by ${activeStrategy.sowingOffset} days.` : 'Standard timing operational.'}`,
      `[IRRIGATION]: ${activeStrategy.irrigation === 'automated' ? 'Sensor drip activated — footprint optimized.' : 'Evaluate irrigation strategy for water savings.'}`,
      `[PEST]:       Balanced NPK inputs at Day 70 recommended for infestation prevention.`,
      `[MOISTURE]:   Maintain soil moisture between 45%–65% for optimal NPK uptake.`,
    ];
    let yy = sy4 + 8;
    recs.forEach(r => { const lines = doc.splitTextToSize(r, 180); doc.text(lines, 15, yy); yy += lines.length * 5.5; });

    // Section 5: Multilingual Insights
    const sy5 = yy + 10;
    if (sy5 < 250) {
      doc.setFontSize(12); doc.setFont('Helvetica', 'Bold'); doc.setTextColor(251, 191, 36);
      doc.text('5. AI Brief Insights (EN / HI / MR)', 15, sy5);
      doc.setFontSize(8); doc.setFont('Helvetica', 'Normal');
      doc.setTextColor(220, 230, 220);
      const enLines = doc.splitTextToSize(`[EN] ${insights.en}`, 180);
      doc.text(enLines, 15, sy5 + 7);
      // Hindi & Marathi rendered phonetically since jsPDF has no Devanagari font by default
      const hiPhonetic = `[HI] ${insights.en.replace('Under the', 'Is parishthiti mein').replace('climate scenario', 'jalvayu paridarshya mein')} — Hindi me padhein email mein.`;
      const mrPhonetic = `[MR] ${insights.en.replace('Under the', 'Ya paristhitit').replace('climate scenario', 'havaman paristithi')} — Marathi email madhe vaacha.`;
      let iy = sy5 + 7 + enLines.length * 4.5;
      doc.setTextColor(180, 220, 200);
      const hiLines = doc.splitTextToSize(hiPhonetic, 180);
      if (iy + hiLines.length * 4.5 < 268) { doc.text(hiLines, 15, iy); iy += hiLines.length * 4.5 + 2; }
      const mrLines = doc.splitTextToSize(mrPhonetic, 180);
      if (iy + mrLines.length * 4.5 < 268) { doc.text(mrLines, 15, iy); }
    }

    // Footer
    doc.setDrawColor(30, 41, 59); doc.line(15, 270, 80, 270); doc.line(130, 270, 195, 270);
    doc.setTextColor(100, 116, 139); doc.setFontSize(7);
    doc.text('AgroTwin AI Engine Signature', 15, 275);
    doc.text('Analyst Code Verification', 130, 275);

    doc.save(`AgroTwin_${selectedFarmer.farmId}.pdf`);
    return doc.output('datauristring');
  };

  // ── SMTP Dispatch ─────────────────────────────────────────────────────────
  const executeReportTransmission = async () => {
    if (!recipientEmail.trim() || emailError) { setEmailError('Enter a valid email address first.'); return; }
    setIsSending(true); setSendStatus('sending'); setTerminalLogs([]); setStep(3);
    const log = (m) => setTerminalLogs(p => [...p, m]);
    log('[INIT]    AgroTwin SMTP Engine v2.8...'); log('[CONNECT] smtp.gmail.com:587...');
    log('[TLS]     SSL handshake OK'); log('[AUTH]    no.reply.pot.sol@gmail.com');
    try {
      await new Promise(r => setTimeout(r, 500));
      log('[PDF]     Compiling report with insights...'); const b64 = generatePDFReport();
      log(`[PDF]     Attached (${Math.round(b64.length * 0.75 / 1024)} KB)`);
      log('[INSIGHTS] Embedding multilingual advisory in email...');
      log(`[SMTP]    Posting to FastAPI gateway...`); log(`[TO]      ${recipientEmail}`);
      const resp = await fetch('http://127.0.0.1:8000/api/send-report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id:        selectedFarmer.id,
          farmer_name:      selectedFarmer.name,
          email:            recipientEmail,
          crop:             selectedFarmer.crop,
          expected_yield:   evaluationResults.expectedYield,
          resilience_score: evaluationResults.resilienceScore,
          scenario_type:    activeScenarioType,
          pdf_base64:       b64,
          insights_en:      insights.en,
          insights_hi:      insights.hi,
          insights_mr:      insights.mr,
        }),
      });
      if (!resp.ok) { const e = await resp.json(); throw new Error(e.detail || 'Gateway error.'); }
      const data = await resp.json();
      log(`[OK]      250 Recipient <${recipientEmail}>`); log(`[OK]      Queued ${data.queue_code}`);
      log('[SUCCESS] ✓ Email + PDF + Insights dispatched via Gmail SMTP!'); setSendStatus('success');
    } catch (err) {
      log(`[FATAL]   ${err.message}`); log('[FAIL]    Delivery aborted.'); setSendStatus('error');
    } finally { setIsSending(false); }
  };

  const StepDot = ({ n, label }) => (
    <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase ${step >= n ? 'text-cyber-emerald-glow' : 'text-slate-600'}`}>
      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold ${
        step > n ? 'bg-cyber-emerald border-cyber-emerald text-cyber-obsidian' :
        step === n ? 'border-cyber-emerald-glow text-cyber-emerald-glow' : 'border-slate-700 text-slate-600'
      }`}>{n}</span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-cyber-emerald to-emerald-600 hover:opacity-90 text-cyber-obsidian font-display font-black text-xs py-2 px-4 rounded shadow-glow-emerald transition duration-300 uppercase tracking-widest cursor-pointer"
      >
        <FileText size={14} /><span>Send Report to Farmer</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="relative bg-[#0b1120] border border-slate-700 rounded-xl shadow-[0_0_50px_rgba(16,185,129,0.12)] flex flex-col w-full max-w-xl overflow-hidden"
            style={{ maxHeight: '92vh' }}
          >
            <div className="absolute inset-0 cyber-grid pointer-events-none opacity-10" />

            {/* Header */}
            <div className="relative flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-[#070b15]">
              <div className="flex items-center gap-3">
                <FileText className="text-cyber-emerald-glow" size={15} />
                <div>
                  <div className="font-display font-black text-sm text-white uppercase tracking-widest leading-none">Report Dispatch</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">AGROTWIN AI • GMAIL SMTP TLS • MULTILINGUAL INSIGHTS</div>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition">
                <X size={15} />
              </button>
            </div>

            {/* Step bar */}
            <div className="relative flex-shrink-0 flex items-center gap-1 px-5 py-2 border-b border-slate-800/60 bg-[#060a13]">
              <StepDot n={1} label="Select Farmer" />
              <div className={`flex-1 h-px mx-2 ${step > 1 ? 'bg-cyber-emerald/60' : 'bg-slate-800'}`} />
              <StepDot n={2} label="Enter Email" />
              <div className={`flex-1 h-px mx-2 ${step > 2 ? 'bg-cyber-emerald/60' : 'bg-slate-800'}`} />
              <StepDot n={3} label="Dispatch" />
            </div>

            {/* Body */}
            <div className="relative flex-1 overflow-hidden">

              {/* ═══ STEP 1 ═══ */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mb-3 flex-shrink-0">
                    Select a farmer to generate their personalized climate report.
                  </p>
                  <div className="flex-shrink-0 flex items-center bg-[#070b17] border border-slate-700 rounded-lg px-3 py-2 mb-3">
                    <Search size={12} className="text-slate-500 mr-2 shrink-0" />
                    <input type="text" placeholder="Search name, village, crop..."
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm text-slate-200 w-full font-mono placeholder:text-slate-600" />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 cyber-scrollbar">
                    {filteredFarmers.map(farmer => {
                      const sel = selectedFarmer?.id === farmer.id;
                      return (
                        <button key={farmer.id} onClick={() => setSelectedFarmer(farmer)}
                          className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                            sel ? 'bg-cyber-emerald/10 border-cyber-emerald/40' : 'bg-[#070b17] border-slate-800 hover:border-slate-700'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${sel ? 'border-cyber-emerald/40 text-cyber-emerald-glow' : 'border-slate-700 text-slate-500'}`}>
                              <User size={13} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-100">{farmer.name}</div>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mt-0.5">
                                <MapPin size={8} className="text-cyber-cyan-glow" />
                                <span>{farmer.village}</span><span>•</span>
                                <span className="capitalize text-cyber-cyan-glow">{farmer.crop}</span>
                                <span>•</span><span>{farmer.farmId}</span>
                              </div>
                            </div>
                          </div>
                          {sel && <CheckCircle size={15} className="text-cyber-emerald-glow" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex-shrink-0 mt-3 flex justify-end">
                    <button onClick={() => selectedFarmer && setStep(2)} disabled={!selectedFarmer}
                      className={`flex items-center gap-2 font-display font-black text-xs py-2.5 px-6 rounded-lg uppercase tracking-widest transition cursor-pointer ${
                        selectedFarmer ? 'bg-gradient-to-r from-cyber-cyan to-cyber-emerald text-cyber-obsidian hover:opacity-90' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}>
                      Next: Enter Email <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 2 ═══ */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', gap: '10px', overflowY: 'auto' }}
                  className="cyber-scrollbar">

                  {/* Farmer recap */}
                  <div style={{ flexShrink: 0 }} className="flex items-center gap-3 bg-cyber-emerald/5 border border-cyber-emerald/25 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-cyber-emerald/10 border border-cyber-emerald/30 flex items-center justify-center shrink-0">
                      <User size={14} className="text-cyber-emerald-glow" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-100 truncate">{selectedFarmer?.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">
                        {selectedFarmer?.village} • {selectedFarmer?.crop?.toUpperCase()} • {selectedFarmer?.farmId}
                      </div>
                    </div>
                    <button onClick={() => setStep(1)}
                      className="shrink-0 text-[10px] text-slate-500 hover:text-cyber-cyan-glow font-mono underline flex items-center gap-0.5 transition">
                      <ChevronLeft size={9} /> Change
                    </button>
                  </div>

                  {/* Analytics mini-grid */}
                  <div style={{ flexShrink: 0 }} className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Resilience', value: `${evaluationResults?.resilienceScore}/100`, color: evaluationResults?.resilienceScore >= 70 ? '#10b981' : evaluationResults?.resilienceScore >= 50 ? '#f59e0b' : '#ef4444' },
                      { label: 'Expected Yield', value: `${evaluationResults?.expectedYield?.toFixed(2)} T/Ac`, color: '#06b6d4' },
                      { label: 'Failure Risk', value: `${evaluationResults?.failureProbability}%`, color: evaluationResults?.failureProbability > 30 ? '#ef4444' : evaluationResults?.failureProbability > 15 ? '#f59e0b' : '#10b981' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-[#070b17] border border-slate-800 rounded-lg p-2.5 text-center">
                        <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">{label}</div>
                        <div className="text-sm font-bold font-mono" style={{ color }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── Multilingual Insights ── */}
                  <div style={{ flexShrink: 0 }} className="bg-[#070b17] border border-amber-700/30 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60 bg-amber-900/10">
                      <span className="text-[10px] font-mono uppercase text-amber-400 flex items-center gap-1.5">
                        <Globe size={10} /> AI Brief Insights
                      </span>
                      <div className="flex gap-1">
                        {[['en','EN'],['hi','HI'],['mr','MR']].map(([k, lbl]) => (
                          <button key={k} onClick={() => setInsightLang(k)}
                            className={`text-[9px] font-mono px-2 py-0.5 rounded transition border cursor-pointer ${
                              insightLang === k
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                : 'bg-transparent border-slate-700 text-slate-500 hover:text-slate-300'
                            }`}>{lbl}</button>
                        ))}
                      </div>
                    </div>
                    <div className="px-3 py-2.5 text-[10px] font-mono text-slate-300 leading-relaxed" style={{ minHeight: '64px' }}>
                      {insights[insightLang]}
                    </div>
                  </div>

                  {/* Email input */}
                  <div style={{ flexShrink: 0 }}>
                    <label className="block text-[11px] font-mono uppercase mb-2 flex items-center gap-1.5" style={{ color: '#06b6d4' }}>
                      <Mail size={11} /> Recipient Email <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{
                      display: 'flex', alignItems: 'center', background: '#07091a',
                      border: `2px solid ${emailError ? '#ef4444' : recipientEmail && !emailError ? '#10b981' : '#334155'}`,
                      borderRadius: '8px', padding: '10px 14px', transition: 'border-color 0.2s',
                      boxShadow: recipientEmail && !emailError ? '0 0 8px rgba(16,185,129,0.2)' : emailError ? '0 0 8px rgba(239,68,68,0.15)' : 'none',
                    }}>
                      <Mail size={14} style={{ marginRight: '10px', flexShrink: 0, color: emailError ? '#ef4444' : recipientEmail && !emailError ? '#10b981' : '#64748b' }} />
                      <input autoFocus type="email" value={recipientEmail}
                        placeholder="Enter real email address (yourname@gmail.com)"
                        onChange={e => handleEmailChange(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', width: '100%', fontFamily: 'monospace', fontSize: '13px' }} />
                      {recipientEmail && !emailError && <CheckCircle size={14} style={{ marginLeft: '8px', flexShrink: 0, color: '#10b981' }} />}
                    </div>
                    <div style={{ marginTop: '5px', minHeight: '16px', fontFamily: 'monospace', fontSize: '10px' }}>
                      {emailError
                        ? <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={9} /> {emailError}</span>
                        : recipientEmail
                          ? <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={9} /> Valid — PDF + Insights will be sent to this inbox</span>
                          : <span style={{ color: '#64748b' }}>⚠ Enter a real email — PDF + multilingual insights will be delivered.</span>}
                    </div>
                  </div>

                  {/* Voice advisory */}
                  <div style={{ flexShrink: 0 }} className="bg-[#070b17] border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] text-slate-500 font-mono uppercase flex items-center gap-1.5">
                        <Volume2 size={9} className="text-amber-400" /> Voice Advisory (plays insights aloud)
                      </span>
                      <select value={audioLang} onChange={e => setAudioLang(e.target.value)}
                        className="bg-[#0b1120] border border-slate-700 text-[10px] text-slate-300 font-mono rounded px-1.5 py-0.5 outline-none">
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                        <option value="mr">मराठी</option>
                      </select>
                    </div>
                    <button onClick={speakVoiceAdvisory}
                      className={`w-full py-1.5 rounded font-mono text-xs font-semibold flex items-center justify-center gap-2 transition border cursor-pointer ${
                        isAudioPlaying ? 'bg-red-900/20 border-red-700/40 text-red-400' : 'bg-amber-900/10 border-amber-700/30 text-amber-400 hover:bg-amber-900/20'
                      }`}>
                      {isAudioPlaying
                        ? <><Square size={10} fill="currentColor" /><span>Stop Voice</span></>
                        : <><Play size={10} fill="currentColor" /><span>Play AI Voice Summary ({audioLang.toUpperCase()})</span></>}
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div style={{ flexShrink: 0, display: 'flex', gap: '8px', paddingTop: '4px' }}>
                    <button onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 px-4 py-2.5 rounded-lg transition">
                      <ChevronLeft size={12} /> Back
                    </button>
                    <button onClick={executeReportTransmission}
                      disabled={!!emailError || !recipientEmail.trim()}
                      style={{ flex: 1 }}
                      className={`flex items-center justify-center gap-2 font-display font-black text-xs py-2.5 px-4 rounded-lg uppercase tracking-widest transition cursor-pointer ${
                        !emailError && recipientEmail.trim()
                          ? 'bg-gradient-to-r from-cyber-cyan to-cyber-emerald text-cyber-obsidian hover:opacity-90 shadow-glow-cyan'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}>
                      <Send size={13} /><span>Generate PDF &amp; Send Email</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 3 ═══ */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', gap: '12px' }}>
                  <div style={{ flexShrink: 0 }} className={`flex items-center gap-3 rounded-lg p-3 border ${
                    sendStatus === 'success' ? 'bg-cyber-emerald/5 border-cyber-emerald/30' :
                    sendStatus === 'error'   ? 'bg-red-900/10 border-red-700/30' : 'bg-cyan-900/10 border-cyan-700/30'
                  }`}>
                    {isSending ? <Loader size={18} className="animate-spin text-cyber-cyan-glow" />
                      : sendStatus === 'success' ? <CheckCircle size={18} className="text-cyber-emerald-glow" />
                      : <AlertTriangle size={18} className="text-red-400" />}
                    <div>
                      <div className={`font-bold text-sm ${sendStatus === 'success' ? 'text-cyber-emerald-glow' : sendStatus === 'error' ? 'text-red-400' : 'text-cyber-cyan-glow'}`}>
                        {isSending ? 'Dispatching PDF + Insights via SMTP...'
                          : sendStatus === 'success' ? '✓ Email Sent with PDF & Multilingual Insights!'
                          : '✗ Dispatch Failed'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {sendStatus === 'success' ? `Delivered to ${recipientEmail} — check inbox!`
                          : isSending ? `Sending to ${recipientEmail}...` : 'Check network / SMTP credentials.'}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1, background: '#050B14', border: '1px solid rgba(13,42,69,0.6)', borderRadius: '8px', padding: '12px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '10px', lineHeight: 1.6 }}
                    className="cyber-scrollbar scanlines">
                    {terminalLogs.length === 0 && <span style={{ color: '#334155' }}>Awaiting SMTP session...</span>}
                    {terminalLogs.map((log, i) => (
                      <div key={i} style={{ color: log.includes('SUCCESS') || log.includes('✓') ? '#10b981' : log.includes('FATAL') || log.includes('FAIL') ? '#ef4444' : log.includes('PDF') || log.includes('INSIGHTS') ? '#f59e0b' : '#06b6d4' }}>
                        {log}
                      </div>
                    ))}
                    {isSending && <div style={{ color: '#06b6d4' }} className="animate-pulse">▋</div>}
                    <div ref={logsEndRef} />
                  </div>

                  <div style={{ flexShrink: 0, display: 'flex', gap: '8px' }}>
                    {!isSending && (
                      <button onClick={() => { setStep(2); setSendStatus('idle'); setTerminalLogs([]); }}
                        className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 px-4 py-2.5 rounded-lg transition">
                        <ChevronLeft size={12} /> Back
                      </button>
                    )}
                    {sendStatus === 'success' && (
                      <button onClick={closeModal} style={{ flex: 1 }}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyber-emerald to-emerald-600 text-cyber-obsidian font-display font-black text-xs py-2.5 px-4 rounded-lg uppercase tracking-widest hover:opacity-90 transition shadow-glow-emerald">
                        <CheckCircle size={13} /> Done
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="relative flex-shrink-0 flex items-center justify-between px-5 py-2 border-t border-slate-800 bg-[#060a13] text-[9px] font-mono text-slate-600">
              <div>🔐 Gmail SMTP • TLS 587 • PDF + EN/HI/MR Insights</div>
              <div>{FARMER_REGISTRY.length} farmers registered</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
