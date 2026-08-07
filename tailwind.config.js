/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        // Literal template-style palette (Atelier-inspired), for classes like
        // bg-cream / text-brass where reading the raw name is clearer than
        // the semantic bg-primary/bg-muted aliases above.
        ivory: "#F6F1EA",
        cream: "#EDE6DA",
        sand: "#DBCFBE",
        ink: "#1C1A17",
        charcoal: "#3A362F",
        stone: "#7A7267",
        brass: "#B8863E",
        wood: "#DBB164",
        olive: "#6B6A4B",
        azure: { DEFAULT: "#3E7CA6", light: "#AFD0E4", dark: "#2A5A78" },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Inter"', "Helvetica Neue", "Arial", "sans-serif"],
      },
      letterSpacing: { widest2: "0.28em" },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "9999px",
      },
      boxShadow: {
        "soft-primary": "0 8px 20px hsl(var(--primary) / 0.35)",
        card: "0 10px 30px rgba(15, 23, 42, 0.08)",
        "card-hover": "0 16px 40px rgba(15, 23, 42, 0.14)",
      },
    },
  },
  plugins: [],
}
