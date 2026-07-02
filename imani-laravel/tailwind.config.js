/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['DM Sans', 'Inter', 'sans-serif'],
            },
            colors: {
                brand: {
                    primary: {
                        DEFAULT: '#1E293B',
                        50: '#F8FAFC',
                        100: '#F1F5F9',
                        200: '#E2E8F0',
                        300: '#CBD5E1',
                        400: '#94A3B8',
                        500: '#64748B',
                        600: '#1E293B',
                        700: '#0F172A',
                        800: '#020617',
                        900: '#000000',
                    },
                    indigo: {
                        DEFAULT: '#4F46E5',
                        50: '#EEF2FF',
                        100: '#E0E7FF',
                        500: '#4F46E5',
                        600: '#4338CA',
                        700: '#3730A3',
                    },
                    gold: {
                        DEFAULT: '#FFB800',
                        50: '#FFFBEB',
                        100: '#FEF3C7',
                        500: '#FFB800',
                        600: '#D97706',
                    },
                    emerald: {
                        DEFAULT: '#10B981',
                        50: '#ECFDF5',
                        100: '#D1FAE5',
                        500: '#10B981',
                        600: '#059669',
                    },
                },
            },
            borderRadius: {
                'imani-sm': '1rem',
                'imani-md': '2rem',
                'imani-lg': '3rem',
                'imani-xl': '3.5rem',
            },
        },
    },
    plugins: [],
};
