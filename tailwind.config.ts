import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './server/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Brand crimson
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          soft: 'hsl(var(--primary-soft))',
        },
        // Warm neutrals
        bg: 'hsl(var(--bg))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          alt: 'hsl(var(--surface-alt))',
        },
        // Soft rose accents
        rose: {
          DEFAULT: 'hsl(var(--rose))',
          light: 'hsl(var(--rose-light))',
        },
        // Foregrounds
        fg: {
          DEFAULT: 'hsl(var(--fg))',
          muted: 'hsl(var(--fg-muted))',
          subtle: 'hsl(var(--fg-subtle))',
          inverse: 'hsl(var(--fg-inverse))',
        },
        // Borders
        border: 'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        // Semantic
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',
        info: 'hsl(var(--info))',
        // shadcn-required aliases (point at our brand tokens)
        background: 'hsl(var(--bg))',
        foreground: 'hsl(var(--fg))',
        card: {
          DEFAULT: 'hsl(var(--surface))',
          foreground: 'hsl(var(--fg))',
        },
        popover: {
          DEFAULT: 'hsl(var(--surface))',
          foreground: 'hsl(var(--fg))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--surface-alt))',
          foreground: 'hsl(var(--fg))',
        },
        muted: {
          DEFAULT: 'hsl(var(--surface-alt))',
          foreground: 'hsl(var(--fg-muted))',
        },
        accent: {
          DEFAULT: 'hsl(var(--primary-soft))',
          foreground: 'hsl(var(--primary))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--danger))',
          foreground: 'hsl(var(--fg-inverse))',
        },
        input: 'hsl(var(--border))',
        ring: 'hsl(var(--primary))',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', '"Times New Roman"', 'serif'],
      },
      fontSize: {
        // Match the design's type scale (size, lineHeight, letterSpacing)
        display: ['44px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h1: ['32px', { lineHeight: '1.10', letterSpacing: '-0.01em' }],
        h2: ['24px', { lineHeight: '1.15', letterSpacing: '-0.005em' }],
        h3: ['20px', { lineHeight: '1.25' }],
        eyebrow: ['11px', { lineHeight: '1.30', letterSpacing: '0.18em' }],
        'body-lg': ['17px', { lineHeight: '1.55' }],
        body: ['16px', { lineHeight: '1.55' }],
        label: ['14px', { lineHeight: '1.40' }],
        small: ['13px', { lineHeight: '1.45' }],
        caption: ['12px', { lineHeight: '1.40' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      spacing: {
        13: '3.25rem', // 52px — design's primary CTA height
      },
      boxShadow: {
        sm: '0 1px 2px rgba(60, 40, 30, 0.04)',
        md: '0 2px 8px rgba(60, 40, 30, 0.06)',
        lg: '0 8px 24px rgba(60, 40, 30, 0.08)',
        xl: '0 20px 48px rgba(60, 40, 30, 0.10)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 200ms ease-out',
        'accordion-up': 'accordion-up 200ms ease-out',
      },
    },
  },
  plugins: [animate],
};
export default config;
