/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        crisis: {
          bg: "#060B14",
          surface: "#0C1527",
          surfaceHover: "#13213B",
          surfaceAlt: "#101D36",
          border: "#182E4F",
          borderCyan: "rgba(6, 182, 212, 0.25)",
          borderCyanHover: "#06B6D4",
          cyan: "#06B6D4",
          cyanLight: "#22D3EE",
          cyanHover: "#0891B2",
          cyanGlow: "rgba(6, 182, 212, 0.35)",
          critical: "#EF4444",
          criticalGlow: "rgba(239, 68, 68, 0.25)",
          high: "#F97316",
          highGlow: "rgba(249, 115, 22, 0.25)",
          medium: "#FACC15",
          mediumGlow: "rgba(250, 204, 21, 0.25)",
          low: "#22C55E",
          lowGlow: "rgba(34, 197, 94, 0.25)",
          text: "#FFFFFF",
          textMuted: "#94A3B8",
          textDark: "#64748B"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
