# Design Document: Kushal's Modern Personal Website

This document outlines the strategy for modernizing Kushal's personal website while maintaining the core identity of the original site (D20, academic/maker focus, and specific color personality).

## 1. Goal
Transition from the current "retro-monospaced" look to a **Clean Minimalist** aesthetic. The goal is to provide a professional, polished tech portfolio that feels "alive" through subtle animations and depth.

## 2. Visual Design Strategy

### Aesthetic
- **Glassmorphism:** Use semi-transparent backgrounds with `backdrop-filter: blur(10px)` for content cards and navigation to create a sense of depth and modernity.
- **Soft Shadows:** Replace the hard offset shadows with multi-layered, soft ambient shadows.
- **Typography:** 
    - **Primary:** Inter (variable font) or a clean system sans-serif (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, etc.) for body and headers to improve readability.
    - **Accents:** Retain a monospaced font (like `JetBrains Mono` or `Consolas`) for technical elements, labels, and small UI details to keep the "maker" vibe.

### Color Palette
- **Background:** A very light, neutral grey-white (`#fcfcfd`) with subtle gradients.
- **Accents:** Retain the original Lavender (`#b19cd9`), Lime (`#bef264`), and Pink (`#f472b6`) but use them primarily as highlights, border glows, or soft gradient splashes.
- **Text:** Deep charcoal (`#1a1a1a`) for primary text, medium grey (`#4a4a4a`) for secondary.

### Components
- **Hero:** A high-impact but clean headline with the "maker" subtitle.
- **Project Grid:** Responsive grid using CSS Grid. Cards will use the glassmorphism style.
- **3D Background:** The Canvas-based 3D wireframes (Octahedron, D20) will be refined with thinner, glowing lines and higher opacity in specific regions to serve as ambient "hero" visuals.

## 3. Tech Stack
- **Languages:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla).
- **Libraries:** None required (keep it lightweight and fast).
- **Icons:** Simple SVG paths or minimalist icon set if needed.

## 4. Functionality & Interactivity
- **D20 Interaction:** The floating D20 will remain a central interactive element. Clicking it will trigger a modern "toast" notification with the roll result.
- **Animations:** 
    - Subtle entrance animations for sections using `IntersectionObserver`.
    - Hover states on cards will involve slight scaling and enhanced glow effects.
- **Responsiveness:** Mobile-first design ensuring the 3D background adapts well to different screen sizes.

## 5. Implementation Steps
1. **Scaffold:** Create a new structure in `index.html` (backing up the original or replacing it surgically).
2. **CSS Foundation:** Establish CSS variables for the new palette and typography.
3. **Core Layout:** Implement the glassmorphic container and section layout.
4. **Canvas Refinement:** Update the 3D drawing logic for a more "ethereal" look.
5. **Polishing:** Add scroll animations and refine the D20 toast notifications.
