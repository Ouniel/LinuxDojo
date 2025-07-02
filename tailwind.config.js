/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    500: '#00d4ff',
                    600: '#0ea5e9',
                    700: '#0284c7',
                    900: '#0c4a6e',
                },
                terminal: {
                    bg: '#0a0a23',
                    text: '#00ff88',
                },
                cyber: {
                    purple: '#1a1a2e',
                    blue: '#00d4ff',
                    green: '#00ff88',
                    orange: '#ff6b35',
                }
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'typing': 'typing 2s steps(20, end) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                typing: {
                    'from': { width: '0' },
                    'to': { width: '100%' },
                }
            }
        },
    },
    plugins: [],
} 