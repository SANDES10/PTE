---
version: alpha
name: PTEMaster
description: PTE Academic practice platform. APEUni-inspired teal/cyan identity with dark navy sidebar. Clean white cards on light slate background.
colors:
  primary: "#00B2B4"
  primary-foreground: "#FFFFFF"
  background: "#F1F4F5"
  foreground: "#0A1316"
  card: "#FFFFFF"
  card-foreground: "#0A1316"
  secondary: "#EBEFF1"
  secondary-foreground: "#1D2325"
  muted: "#ECEFF0"
  muted-foreground: "#636A6D"
  accent: "#BFF0EF"
  accent-foreground: "#003B3E"
  destructive: "#EE343B"
  destructive-foreground: "#FFFFFF"
  border: "#DBDFE0"
  input: "#DBDFE0"
  ring: "#00B2B4"
  sidebar: "#061116"
  sidebar-foreground: "#BDC6C9"
  sidebar-primary: "#00B2B4"
  sidebar-primary-foreground: "#FFFFFF"
  sidebar-accent: "#101F26"
  sidebar-accent-foreground: "#D1D9DC"
  sidebar-border: "#1C282E"
  sidebar-ring: "#00B2B4"
  chart-1: "#00B2B4"
  chart-2: "#EE343B"
  chart-3: "#4CC157"
  chart-4: "#F2943C"
  chart-5: "#7D7DF9"
  good: "#4CAF50"
  average: "#FF9800"
  bad: "#EF5350"
  info: "#9E9E9E"
  word-neutral: "#333333"
  tailwind-teal-600: "#0D9488"
  tailwind-teal-700: "#0F766E"
  tailwind-teal-100: "#CCFBF1"
  tailwind-teal-200: "#99F6E4"
typography:
  display:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.025em
  h1:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.025em
  h2:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label-xs:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 600
  caption:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 400
  badge:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: 700
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-lg: 1280px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label-xs}"
    rounded: "{rounded.md}"
    padding: 12px 24px
    height: 40px
  button-primary-hover:
    backgroundColor: "{colors.tailwind-teal-700}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 12px 24px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: 24px
  badge:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.full}"
    padding: 4px 12px
    typography: "{typography.label-xs}"
  task-badge:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    size: 32px
    typography: "{typography.badge}"
  record-btn:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    size: 56px
  record-btn-recording:
    backgroundColor: "{colors.destructive}"
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
  sidebar-accent:
    backgroundColor: "{colors.sidebar-accent}"
    textColor: "{colors.sidebar-accent-foreground}"
  section-tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: 6px 18px
  score-bar-track:
    backgroundColor: "#E8F5E9"
    rounded: "{rounded.xs}"
    size: 8px
  score-bar-fill:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.xs}"
---

## Overview

PTEMaster is a PTE Academic practice platform. Visual identity mirrors APEUni: premium teal/cyan accent over clean white cards, light slate page background, and a dark navy sidebar. Design goal: calm testing environment — high readability, soft color blocks, clear score feedback. Interaction color = teal. Feedback color = green/orange/red spectrum.

## Colors

Palette rooted in teal-cyan accent + cool neutral surfaces + dark navy sidebar.

- **Primary (#00B2B4):** Teal accent (APEUni-inspired, from oklch(0.68 0.14 196)). Drives CTAs, links, active tabs, focus ring, recording states, waveform, score fills.
- **Background (#F1F4F5):** Light cool slate page surface (never pure white).
- **Card (#FFFFFF):** Pure white content surfaces — cards, popovers, dialogs.
- **Sidebar (#061116):** Near-black navy; supporting dark UI next to teal.
- **Destructive (#EE343B):** Errors, failed payments, recording-stop state, removal actions.
- **Good/Average/Bad:** #4CAF50 green, #FF9800 orange, #EF5350 red — pronunciation highlighting, score bars, performance feedback.
- **Chart-1..5:** Series palette for analytics (teal, red, green, amber, violet).
- **Tailwind teal-600/700 (#0D9488/#0F766E):** Hard-coded hover states in page-level components; treat as primary hover.
- Dark mode: background family shifts to `oklch(0.12 0.03 255)`; sidebar darkens; primary hue shifts blue-ward (`oklch(0.65 0.15 255)`).

## Typography

Inter is the only family (Google Fonts, weights 300-800). Headings use tight tracking (-0.025em) and bold weight. Body runs 300-400 weight at relaxed 1.5 line-height for exam-text readability.

- **Display (2.25rem/800):** Landing hero numbers, score modals.
- **H1 (1.5rem/700):** Page titles (dashboard, admin, coaching plan).
- **H2 (1.125rem/600):** Section headers, card titles.
- **Body-md (1rem/400):** Default content.
- **Body-sm (0.875rem/400):** Secondary text, descriptions.
- **Label-xs (0.75rem/600):** Buttons, badges.
- **Badge (0.6875rem/700):** Uppercase task-type badges (RA, RS, DI…).
- Cursors: all interactive elements force `cursor-pointer`.

## Layout

Simple vertical rhythm. Spacing scale 4/8/16/24/32px. Cards use gap-based internal padding (24px default). Container centers content: full-width on mobile (16px padding), 24px tablet, 32px + 1280px max on desktop. Sidebar + main layout: dark sidebar (fixed) with inset main. Practice page groups tasks in collapsible accordion cards.

## Elevation & Depth

Soft, neutral shadows. No colored glows except teal-tinted button shadows.

- **shadow-sm:** Cards, nav bar (default card elevation).
- **shadow-md:** Hovered cards, popovers, dropdowns, floating action.
- **shadow-lg:** Modals/dialogs, AI feedback panel, primary CTAs.
- **shadow-lg shadow-teal-200:** Primary CTA glow (teal-tinted).
- **shadow-xl/2xl:** Hero mock, celebratory modals.

## Shapes

Default radius 8px (Tailwind `rounded`). Cards use 12px (`rounded-xl`), feature panels 16px (`rounded-2xl`). Badges/pills/tabs/record button = fully rounded. Task badges = 6px. Progress bars = 2-4px (half-rounded).

## Components

- **Button primary:** Teal bg, white text, 12px radius, 12×24px padding. Hover darkens to #0F766E. CTA glow variant adds `shadow-lg shadow-teal-200`.
- **Card:** White bg, 1px border (#DBDFE0), 12px radius, `shadow-sm`, 24px padding.
- **Task badge:** 32×32px square, 6px radius, 11px/700 white text, per-task-type colors (RA red, RS teal, DI orange, ASQ green, etc.).
- **Record button:** 56px circle, teal. Hover scales + darkens. Recoding = red + pulse.
- **Section tabs:** Pill (20px radius), 6×18px padding, active = teal/white, hover = light teal fill.
- **Sidebar:** Dark navy (#061116), subtle borders, teal active states, 60s-refresh SRS badges.
- **Score bars:** 8px track (#E8F5E9), fill color-coded good/average/poor.

## Do's and Don'ts

- Do use teal (#00B2B4) for all interaction affordances — never blue or purple for primary actions.
- Don't use pure white for page background; use #F1F4F5.
- Don't hard-code Tailwind teal-600/700 for new components — reference the teal token and migrate legacy usages.
- Do keep feedback semantics: green = correct/good, orange = average/partial, red = incorrect/poor, grey = pause/neutral.
- Do use dark sidebar for authenticated layout chrome; keep content surfaces white.
- Don't introduce new font families; Inter only.
- Do keep headings tight (-0.025em) and bold.