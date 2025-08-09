/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './**/*.html',
    './assets/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'tech-blue': '#0066ff',
        'tech-dark': '#0a0f1c',
        'tech-purple': '#6366f1',
        'tech-cyan': '#06b6d4',
        'tech-green': '#10b981'
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-in-left': 'slideInLeft 0.8s ease-out',
        'slide-in-right': 'slideInRight 0.8s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.8)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(6, 182, 212, 0.8)' }
        }
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
        'tech': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        'display': ['Inter', 'system-ui', 'sans-serif']
      },
    },
  },
  plugins: [],
}
