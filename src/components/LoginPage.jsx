import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, AlertTriangle, Loader } from 'lucide-react';

// Hardcoded admin credentials
const ADMIN_USER = 'admin123';
const ADMIN_PASS = 'agrotwin121';

export default function LoginPage({ onLoginSuccess, onBack }) {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [attempts, setAttempts]   = useState(0);
  const [shake, setShake]         = useState(false);
  const [typingUser, setTypingUser] = useState(false);
  const [typingPass, setTypingPass] = useState(false);
  const [matrixChars, setMatrixChars] = useState([]);

  // Matrix rain effect
  useEffect(() => {
    const chars = '01アイウエオカキクケコABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const cols = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      char: chars[Math.floor(Math.random() * chars.length)],
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 4,
      opacity: Math.random() * 0.3 + 0.05,
    }));
    setMatrixChars(cols);
    const interval = setInterval(() => {
      setMatrixChars(prev => prev.map(c => ({
        ...c, char: chars[Math.floor(Math.random() * chars.length)],
      })));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Both fields are required.'); triggerShake(); return;
    }
    setLoading(true); setError('');
    // Simulate async auth check
    await new Promise(r => setTimeout(r, 1200));
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setLoading(false);
      onLoginSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(newAttempts >= 3
        ? `Access denied. ${newAttempts} failed attempts. Credentials: ${ADMIN_USER} / ${ADMIN_PASS}`
        : 'Invalid credentials. Access denied.');
      setPassword(''); setLoading(false); triggerShake();
    }
  };

  const isReady = username.trim() && password.trim() && !loading;

  return (
    <div style={{
      height: '100vh', background: '#060a12', display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid bg */}
      <div className="cyber-grid" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Matrix rain */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
        {matrixChars.map(c => (
          <div key={c.id} style={{
            position: 'absolute', left: `${c.x}%`, top: '-10%',
            fontFamily: 'monospace', fontSize: '0.8rem', color: '#10b981',
            opacity: c.opacity, animation: `matrixFall ${c.duration}s linear ${c.delay}s infinite`,
            userSelect: 'none',
          }}>{c.char}</div>
        ))}
      </div>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', zIndex: 1 }} />

      {/* Card */}
      <div
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: '420px',
          margin: '16px',
          background: 'rgba(11,17,32,0.9)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '20px',
          boxShadow: '0 0 80px rgba(16,185,129,0.08), 0 40px 80px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          animation: shake ? 'shakeCard 0.5s ease' : 'none',
        }}
      >
        {/* Top accent line */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #10b981, #06b6d4, transparent)' }} />

        {/* Scanline overlay */}
        <div className="scanlines" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ padding: '40px 36px', position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
              border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', margin: '0 auto 16px',
              boxShadow: '0 0 24px rgba(16,185,129,0.15)',
            }}>🌱</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.1em', color: '#fff' }}>
              AGRO<span style={{ color: '#10b981' }}>TWIN</span> AI
            </div>
            <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.68rem', letterSpacing: '0.15em', marginTop: '4px', textTransform: 'uppercase' }}>
              Secure Admin Console
            </div>
          </div>

          {/* Status bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: '8px', padding: '8px 14px', marginBottom: '28px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'blinker 1.5s infinite' }} />
            <span style={{ color: '#10b981', fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
              SECURE GATEWAY ONLINE · TLS ACTIVE
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Username */}
            <div>
              <label style={{ display: 'block', color: '#06b6d4', fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Administrator ID
              </label>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: '#07091a', border: `1.5px solid ${typingUser ? '#06b6d4' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px', padding: '12px 16px',
                transition: 'all 0.2s', boxShadow: typingUser ? '0 0 12px rgba(6,182,212,0.1)' : 'none',
              }}>
                <User size={15} style={{ color: typingUser ? '#06b6d4' : '#334155', marginRight: '10px', flexShrink: 0 }} />
                <input
                  type="text" value={username} autoComplete="username"
                  placeholder="Enter admin username"
                  onFocus={() => setTypingUser(true)} onBlur={() => setTypingUser(false)}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', width: '100%', fontFamily: 'monospace', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: '#06b6d4', fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Access Key
              </label>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: '#07091a', border: `1.5px solid ${typingPass ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px', padding: '12px 16px',
                transition: 'all 0.2s', boxShadow: typingPass ? '0 0 12px rgba(16,185,129,0.1)' : 'none',
              }}>
                <Lock size={15} style={{ color: typingPass ? '#10b981' : '#334155', marginRight: '10px', flexShrink: 0 }} />
                <input
                  type={showPass ? 'text' : 'password'} value={password} autoComplete="current-password"
                  placeholder="Enter access key"
                  onFocus={() => setTypingPass(true)} onBlur={() => setTypingPass(false)}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', width: '100%', fontFamily: 'monospace', fontSize: '0.9rem' }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex', flexShrink: 0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Hint */}
            <div style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.12)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace', fontSize: '0.68rem', color: '#475569' }}>
              💡 Default credentials: <span style={{ color: '#10b981' }}>admin123</span> / <span style={{ color: '#10b981' }}>agrotwin121</span>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px' }}>
                <AlertTriangle size={13} style={{ color: '#ef4444', marginTop: '1px', flexShrink: 0 }} />
                <span style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '0.72rem', lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!isReady}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                background: isReady
                  ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                  : 'rgba(255,255,255,0.05)',
                border: 'none', borderRadius: '10px', padding: '14px',
                color: isReady ? '#030712' : '#334155',
                fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.78rem',
                letterSpacing: '0.08em', cursor: isReady ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                boxShadow: isReady ? '0 0 24px rgba(16,185,129,0.25)' : 'none',
                textTransform: 'uppercase',
              }}
              onMouseEnter={e => { if (isReady) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {loading
                ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /><span>Authenticating...</span></>
                : <><Lock size={15} /><span>Access Command Center</span></>}
            </button>
          </form>
        </div>

        {/* Footer of card */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#475569', fontFamily: 'monospace', fontSize: '0.7rem', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
            ← Back to Landing
          </button>
          <div style={{ color: '#334155', fontFamily: 'monospace', fontSize: '0.65rem' }}>
            v2.8 · AGROTWIN AI
          </div>
        </div>
      </div>

      <style>{`
        @keyframes matrixFall {
          0%   { transform: translateY(-10vh); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
        @keyframes shakeCard {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-8px); }
          30%      { transform: translateX(8px); }
          45%      { transform: translateX(-6px); }
          60%      { transform: translateX(6px); }
          75%      { transform: translateX(-3px); }
          90%      { transform: translateX(3px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
