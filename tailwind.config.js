import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: {
                qurban: {
                    50: '#ecfdf3',
                    100: '#d1fae0',
                    200: '#a7f3c8',
                    300: '#6ee7a3',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#0f5132',
                    800: '#144534',
                    900: '#0a2a1c',
                },
                cream: {
                    50: '#fffdf7',
                    100: '#fef7e8',
                    200: '#fcefd4',
                },
                report: {
                    teal: '#e6f4f1',
                },
            },
            fontFamily: {
                sans: ['Montserrat', 'Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
