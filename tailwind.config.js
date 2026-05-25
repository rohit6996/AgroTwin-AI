/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          obsidian: "#070A13",
          slate: "#0F1626",
          dark: "#172237",
          emerald: "#059669",
          "emerald-glow": "#10B981",
          gold: "#D97706",
          "gold-glow": "#F59E0B",
          crimson: "#DC2626",
          "crimson-glow": "#EF4444",
          cyan: "#0891B2",
          "cyan-glow": "#06B6D4",
          violet: "#7C3AED",
          "violet-glow": "#8B5CF6",
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['Orbitron', 'Inter', 'sans-serif'],
      },
      animation: {
        'radar-pulse': 'radarPulse 6s infinite linear',
        'scanline': 'scanline 8s infinite linear',
        'slow-pulse': 'pulse 3s infinite ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'border-glow': 'borderGlow 2s infinite alternate',
      },
      keyframes: {
        radarPulse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        borderGlow: {
          '0%': { borderColor: 'rgba(16, 185, 129, 0.2)', boxShadow: '0 0 5px rgba(16, 185, 129, 0.1)' },
          '100%': { borderColor: 'rgba(16, 185, 129, 0.6)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.3)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.3)',
        'glow-gold': '0 0 15px rgba(245, 158, 11, 0.3)',
        'glow-crimson': '0 0 15px rgba(239, 68, 68, 0.3)',
      }
    },
  },
  plugins: [],
}
