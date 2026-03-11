import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                profit: 'rgb(52, 199, 89)',
                loss: 'rgb(255, 59, 48)',
                'apple-blue': 'rgb(0, 122, 255)',
                'apple-purple': 'rgb(175, 82, 222)',
                'apple-green': 'rgb(52, 199, 89)',
                'apple-gray': 'rgb(142, 142, 147)',
                'apple-bg': 'rgb(246, 246, 248)',
                gray: {
                    750: '#2d3748',
                },
            },
        },
    },
    plugins: [],
}
export default config
