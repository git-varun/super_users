# Design System: Dark Tech (Super Users)

## Core Identity
- **Name**: Sense Savings Engine
- **Visual Style**: High-contrast, tech-noir, neon-accented.
- **Tone**: Professional, fast, data-driven.

## Design Tokens

### Colors
- **Background-Primary**: `#0a0a0a` (Pure Black)
- **Background-Secondary**: `#111111` (Deep Charcoal)
- **Accent-Primary**: `#00ff9d` (Neon Mint)
- **Accent-Secondary**: `#00d4ff` (Cyan Glow)
- **Text-Primary**: `#ffffff` (Pure White)
- **Text-Secondary**: `#9ca3af` (Muted Gray)
- **Border-Default**: `#222222`
- **Border-Glow**: `rgba(0, 255, 157, 0.3)`

### Typography
- **Heading**: Inter/System Sans, Bold, tracking-tight.
- **Body**: Inter/System Sans, Regular.
- **Monospace**: JetBrains Mono / SF Mono (for pricing and technical data).

### Spacing & Radius
- **Base Radius**: `12px` (Tailwind `rounded-xl`)
- **Container Max-Width**: `800px` (Optimized for mobile-first/narrow desktop)

## Component Standards

### Search Bar
- **State**: Large, centered on home. Sticky on results.
- **Visual**: Glassmorphism (`backdrop-blur`), border-glow on focus, neon-accented icons.

### Product Card
- **Layout**: Image (left/top), Content (right/bottom).
- **Price Display**: Monospace, highlighted with Neon Mint.
- **CTA**: Minimalist deep-link button with cyan hover effect.

### Navigation
- **Flow**: Home (Immersive) -> Results (Fast, list-based).
- **Feedback**: Skeleton loaders with pulsing dark gray gradients.

## Stitch Rules
- Always use `dark` mode classes as default.
- Prefer `gap-4` for component spacing.
- Use `border-white/10` for subtle depth.
- Highlight "Landing Price" using `text-accent-primary`.