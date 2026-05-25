import React, { useState, useEffect, useRef } from 'react';

const FEATURES = [
  {
    icon: '🛰️',
    title: 'Satellite NDVI Mapping',
    desc: 'Real-time GIS satellite imagery overlaid with cell-level NDVI health indices across your 1-acre plot.',
    color: '#06b6d4',
  },
  {
    icon: '🌩️',
    title: 'Black Swan Climate Engine',
    desc: 'Generate 100 stochastic weather paths — heatwaves, flash floods, drought, and delayed monsoons.',
    color: '#10b981',
  },
  {
    icon: '🤖',
    title: 'XGBoost Yield Prediction',
    desc: 'Gradient-boosted ML models predict yield tonnage, failure probability, and water consumption per strategy.',
    color: '#f59e0b',
  },
  {
    icon: '🧬',
    title: 'Digital Twin Farm',
    desc: 'Live virtual replica of your farm with 100 IoT sensor nodes streaming pH, NPK, moisture, and temperature.',
    color: '#a78bfa',
  },
  {
    icon: '📧',
    title: 'AI Report Dispatch',
    desc: 'Auto-generate PDF advisory reports with multilingual insights and send via Gmail SMTP to farmers.',
    color: '#fb7185',
  },
  {
    icon: '🗣️',
    title: 'Multilingual Voice Advisory',
    desc: 'AI voice summaries in English, Hindi & Marathi — making agronomic intelligence accessible to all.',
    color: '#34d399',
  },
];

const STATS = [
  { value: '100', label: 'Climate Scenarios', suffix: '+' },
  { value: '10', label: 'IoT Sensor Nodes', suffix: 'x10' },
  { value: '98', label: 'Resilience Score Max', suffix: '/100' },
  { value: '3', label: 'Languages Supported', suffix: '' },
];

// Animated counter hook
function useCounter(target, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return count;
}

function StatCard({ value, label, suffix, started }) {
  const num = useCounter(parseInt(value), 1800, started);
  return (
    <div className="text-center">
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '2.5rem', fontWeight: 900, color: '#10b981', textShadow: '0 0 20px rgba(16,185,129,0.5)', lineHeight: 1 }}>
        {num}{suffix}
      </div>
      <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>
        {label}
      </div>
    </div>
  );
}

export default function LandingPage({ onEnterDashboard }) {
  const [statsVisible, setStatsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [particles, setParticles] = useState([]);
  const statsRef = useRef(null);
  const containerRef = useRef(null);

  // Generate floating particles
  useEffect(() => {
    const pts = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 20 + 10,
      opacity: Math.random() * 0.4 + 0.1,
      color: ['#10b981', '#06b6d4', '#f59e0b', '#a78bfa'][Math.floor(Math.random() * 4)],
    }));
    setParticles(pts);
  }, []);

  // Scroll handler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Stats intersection observer
  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: '100vh', overflowY: 'auto', background: '#060a12', color: '#f1f5f9', fontFamily: 'Inter, Arial, sans-serif', position: 'relative' }}
      className="cyber-scrollbar"
    >
      {/* ── Animated grid background ── */}
      <div className="cyber-grid" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Floating Particles ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: '50%', background: p.color, opacity: p.opacity,
            animation: `floatUp ${p.speed}s linear infinite`,
            animationDelay: `${Math.random() * 10}s`,
          }} />
        ))}
      </div>

      {/* ── Glow orbs ── */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'fixed', bottom: '-15%', right: '-5%', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 48px',
        background: scrollY > 30 ? 'rgba(6,10,18,0.95)' : 'transparent',
        backdropFilter: scrollY > 30 ? 'blur(12px)' : 'none',
        borderBottom: scrollY > 30 ? '1px solid rgba(16,185,129,0.15)' : '1px solid transparent',
        transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🌱</span>
          <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.1em', color: '#fff' }}>
            AGRO<span style={{ color: '#10b981' }}>TWIN</span> AI
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {['Features', 'Technology', 'About'].map(item => (
            <span key={item} style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'monospace', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#10b981'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}>{item}</span>
          ))}
          <button
            onClick={onEnterDashboard}
            style={{
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              border: 'none', borderRadius: '8px', padding: '8px 20px',
              color: '#030712', fontFamily: 'Orbitron, monospace', fontWeight: 700,
              fontSize: '0.72rem', letterSpacing: '0.08em', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(16,185,129,0.3)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            ADMIN LOGIN
          </button>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section style={{ position: 'relative', zIndex: 2, minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px 80px' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '999px', padding: '6px 18px', marginBottom: '32px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#10b981', fontFamily: 'monospace', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Generative AI · Digital Twin · Climate Intelligence
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 'clamp(2.4rem, 6vw, 5rem)', lineHeight: 1.1, margin: '0 0 24px', maxWidth: '900px' }}>
          <span style={{ color: '#ffffff' }}>THE FUTURE OF</span>
          <br />
          <span style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            PRECISION FARMING
          </span>
          <br />
          <span style={{ color: '#ffffff' }}>IS HERE</span>
        </h1>

        {/* Subtitle */}
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '680px', margin: '0 0 48px', fontFamily: 'Inter, sans-serif' }}>
          AgroTwin AI creates a <strong style={{ color: '#10b981' }}>Generative Digital Twin</strong> of your 1-acre farm — 
          combining real-time IoT sensors, satellite imagery, stochastic climate simulation, and XGBoost ML 
          to protect crops against <strong style={{ color: '#f59e0b' }}>Black Swan weather events</strong>.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={onEnterDashboard}
            style={{
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              border: 'none', borderRadius: '12px', padding: '16px 40px',
              color: '#030712', fontFamily: 'Orbitron, monospace', fontWeight: 800,
              fontSize: '0.85rem', letterSpacing: '0.1em', cursor: 'pointer',
              boxShadow: '0 0 40px rgba(16,185,129,0.35)', transition: 'all 0.3s',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 50px rgba(16,185,129,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(16,185,129,0.35)'; }}
          >
            🚀 Enter Command Center
          </button>
          <button
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px', padding: '16px 40px', color: '#cbd5e1',
              fontFamily: 'monospace', fontSize: '0.85rem', cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; e.currentTarget.style.color = '#10b981'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#cbd5e1'; }}
          >
            📄 View Documentation
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', animation: 'bounceY 2s infinite' }}>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(16,185,129,0.6), transparent)' }} />
          <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.1em' }}>SCROLL</span>
        </div>

        {/* Hero Dashboard Preview */}
        <div style={{
          marginTop: '80px', width: '100%', maxWidth: '900px',
          background: 'rgba(11,17,32,0.8)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '16px', padding: '24px',
          boxShadow: '0 0 80px rgba(16,185,129,0.08), 0 40px 80px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
        }}>
          {/* Fake terminal header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['#ef4444','#f59e0b','#10b981'].map((c, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
            ))}
            <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.7rem', marginLeft: '8px' }}>agrotwin-ai — command-center v2.8</span>
          </div>

          {/* Fake metric grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'Resilience Score', val: '79/100', color: '#10b981' },
              { label: 'Expected Yield', val: '4.53 T/Ac', color: '#06b6d4' },
              { label: 'Black Swan Risk', val: '8%', color: '#f59e0b' },
              { label: 'Water Usage', val: '285K L', color: '#a78bfa' },
            ].map(m => (
              <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.1rem', fontWeight: 700, color: m.color }}>{m.val}</div>
                <div style={{ color: '#64748b', fontSize: '0.65rem', fontFamily: 'monospace', marginTop: '4px', textTransform: 'uppercase' }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Fake waveform bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '60px' }}>
            {Array.from({ length: 60 }, (_, i) => {
              const h = 10 + Math.abs(Math.sin(i * 0.4) * 45) + Math.abs(Math.cos(i * 0.2) * 15);
              return (
                <div key={i} style={{
                  flex: 1, height: `${h}%`,
                  background: i % 6 === 0 ? '#f59e0b' : i % 3 === 0 ? '#06b6d4' : '#10b981',
                  opacity: 0.5 + (i / 120),
                  borderRadius: '2px 2px 0 0',
                }} />
              );
            })}
          </div>
          <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.65rem', marginTop: '8px', textAlign: 'left' }}>
            ● 100 STOCHASTIC CLIMATE PATHS GENERATED · SCENARIO: NORMAL SEASON · DAY 45/120
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section ref={statsRef} style={{ position: 'relative', zIndex: 2, padding: '80px 48px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
          {STATS.map(s => <StatCard key={s.label} {...s} started={statsVisible} />)}
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '100px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ color: '#10b981', fontFamily: 'monospace', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>
              PLATFORM CAPABILITIES
            </div>
            <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', color: '#fff', margin: 0 }}>
              Built for the Next Generation<br />
              <span style={{ color: '#10b981' }}>of Climate-Resilient Farming</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                style={{
                  background: 'rgba(11,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px', padding: '28px', cursor: 'default',
                  transition: 'all 0.3s', backdropFilter: 'blur(8px)',
                  animation: `fadeInUp 0.6s ease ${i * 0.1}s both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + '55'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${f.color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ color: f.color, fontFamily: 'Orbitron, monospace', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', margin: '0 0 10px', textTransform: 'uppercase' }}>
                  {f.title}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TECH STACK ══════════ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '80px 48px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '32px' }}>
            POWERED BY
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
            {['React 19', 'Vite', 'FastAPI', 'PyTorch LSTM', 'XGBoost', 'Tailwind CSS', 'Recharts', 'jsPDF', 'Gmail SMTP', 'Web Speech API', 'NumPy', 'Uvicorn'].map(tech => (
              <span key={tech} style={{
                padding: '7px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px', color: '#cbd5e1', fontFamily: 'monospace', fontSize: '0.78rem',
                transition: 'all 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => { e.target.style.borderColor = 'rgba(16,185,129,0.4)'; e.target.style.color = '#10b981'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = '#cbd5e1'; }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section style={{ position: 'relative', zIndex: 2, padding: '100px 48px' }}>
        <div style={{
          maxWidth: '800px', margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.06), rgba(167,139,250,0.08))',
          border: '1px solid rgba(16,185,129,0.2)', borderRadius: '24px', padding: '64px 48px',
          boxShadow: '0 0 80px rgba(16,185,129,0.06)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌾</div>
          <h2 style={{ fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', color: '#fff', margin: '0 0 16px' }}>
            Ready to Transform Your Farm?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, margin: '0 0 36px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            Access the full AgroTwin AI Command Center. Simulate climate scenarios, predict yields, and send AI reports to your farmers — all in one platform.
          </p>
          <button
            onClick={onEnterDashboard}
            style={{
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              border: 'none', borderRadius: '12px', padding: '16px 48px',
              color: '#030712', fontFamily: 'Orbitron, monospace', fontWeight: 800,
              fontSize: '0.85rem', letterSpacing: '0.1em', cursor: 'pointer',
              boxShadow: '0 0 40px rgba(16,185,129,0.4)', transition: 'all 0.3s',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 50px rgba(16,185,129,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(16,185,129,0.4)'; }}
          >
            🚀 Get Started — Admin Login
          </button>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>🌱</span>
          <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>AGROTWIN AI</span>
        </div>
        <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.7rem' }}>
          © 2026 AgroTwin AI Inc. · Generative Agricultural Digital Twin v2.8
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <span key={l} style={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.72rem', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#10b981'}
              onMouseLeave={e => e.target.style.color = '#475569'}>{l}</span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceY {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #10b981; }
          50%       { opacity: 0.5; box-shadow: 0 0 14px #10b981; }
        }
      `}</style>
    </div>
  );
}
