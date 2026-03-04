import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/providers/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--color-primary)",
                secondary: "var(--color-secondary)",
                sidebarBg: "var(--color-sidebar-bg)",
                sidebarText: "var(--color-sidebar-text)",
                background: "var(--color-background)",
                card: "var(--color-card-bg)",
                heading: "var(--color-heading)",
                body: "var(--color-text)",
                border: "var(--color-border)",
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            }
        },
    },
    plugins: [],
};
export default config;
