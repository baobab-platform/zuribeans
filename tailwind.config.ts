import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand & neutral
        ink: "var(--color-ink)",
        "ink-soft": "var(--color-ink-soft)",
        canvas: "var(--color-canvas)",
        leaf: "var(--color-leaf)",
        "leaf-dark": "var(--color-leaf-dark)",
        clay: "var(--color-clay)",
        "clay-inverse": "var(--color-clay-inverse)",
        "clay-on-light": "var(--color-clay-on-light)",
        sand: "var(--color-sand)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        "surface-muted": "var(--color-surface-muted)",
        line: "var(--color-line)",
        "line-strong": "var(--color-line-strong)",
        muted: "var(--color-muted)",
        "muted-strong": "var(--color-muted-strong)",
        focus: "var(--color-focus)",
        "focus-offset": "var(--color-focus-offset)",

        // Semantic
        success: "var(--color-success)",
        "success-soft": "var(--color-success-soft)",
        "success-strong": "var(--color-success-strong)",
        warning: "var(--color-warning)",
        "warning-soft": "var(--color-warning-soft)",
        "warning-strong": "var(--color-warning-strong)",
        danger: "var(--color-danger)",
        "danger-soft": "var(--color-danger-soft)",
        "danger-strong": "var(--color-danger-strong)",
        info: "var(--color-info)",
        "info-soft": "var(--color-info-soft)",
        "info-strong": "var(--color-info-strong)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      borderRadius: {
        control: "var(--radius-control)",
        panel: "var(--radius-panel)",
      },
      boxShadow: {
        control: "var(--shadow-control)",
        panel: "var(--shadow-panel)",
        overlay: "var(--shadow-overlay)",
      },
      ringOffsetColor: {
        canvas: "var(--color-focus-offset)",
        ink: "var(--color-ink)",
      },
      transitionDuration: {
        fast: "var(--transition-fast)",
        standard: "var(--transition-standard)",
      },
      zIndex: {
        header: "var(--layer-header)",
        overlay: "var(--layer-overlay)",
      },
      maxWidth: {
        page: "var(--container-page)",
        reading: "var(--container-reading)",
      },
    },
  },
  plugins: [],
} satisfies Config