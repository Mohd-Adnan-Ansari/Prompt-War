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
        plum: {
          DEFAULT: '#48151D',
          dark: '#350F15',
          light: '#5E1C26',
          hover: '#3D1219',
        },
        cream: {
          DEFAULT: '#F2E8D9',
          light: '#FAF5EE',
          muted: '#E5D7C3',
        },
        taupe: {
          DEFAULT: '#A0927E',
          muted: '#847563',
          light: '#B5A997',
          hover: '#8E806D',
        },
        gold: {
          DEFAULT: '#C6A66B',
          bright: '#D4B77D',
          hover: '#D4B77D',
          light: '#EAD7AF',
          muted: 'rgba(198, 166, 107, 0.4)',
        },
        crisis: {
          bg: "#060B14",
          surface: "#0C1527",
          surfaceHover: "#13213B",
          surfaceAlt: "#101D36",
          border: "#182E4F",
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
