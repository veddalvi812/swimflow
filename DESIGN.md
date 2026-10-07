---
version: alpha
name: SwimFlow-design-system
description: "A canvas-first editor tool for swimlane diagrams. Minimal chrome, maximum workspace. The UI disappears so the diagram is the star. Light and dark themes with a muted, professional palette. Toolbars are compact, panels slide in from edges, and the infinite canvas dominates. Built on shadcn/ui primitives with Inter for UI and JetBrains Mono for code/labels."

colors:
  # Core surfaces
  background: "#ffffff"
  background-dark: "#0a0a0b"
  surface: "#f4f4f5"
  surface-dark: "#18181b"
  surface-raised: "#ffffff"
  surface-raised-dark: "#27272a"

  # Text
  foreground: "#09090b"
  foreground-dark: "#fafafa"
  muted: "#71717a"
  muted-dark: "#a1a1aa"

  # Borders
  border: "#e4e4e7"
  border-dark: "#27272a"
  border-focus: "#3b82f6"

  # Brand accent
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  on-primary: "#ffffff"

  # Semantic
  success: "#16a34a"
  warning: "#d97706"
  error: "#dc2626"
  info: "#2563eb"

  # Lane palette (default swimlane colors)
  lane-blue: "#dbeafe"
  lane-green: "#dcfce7"
  lane-amber: "#fef3c7"
  lane-rose: "#ffe4e6"
  lane-purple: "#f3e8ff"
  lane-cyan: "#cffafe"
  lane-orange: "#ffedd5"
  lane-slate: "#f1f5f9"

  # Canvas
  canvas-bg: "#fafafa"
  canvas-bg-dark: "#111113"
  canvas-grid: "#e4e4e7"
  canvas-grid-dark: "#27272a"

typography:
  heading-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.025em
  heading:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.015em
  heading-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.40
    letterSpacing: 0
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.00
    letterSpacing: 0.025em
  mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  node-label:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.30
    letterSpacing: 0

rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px

components:
  # Toolbar
  toolbar:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 4px
    height: 40px
    shadow: "0 1px 3px rgba(0,0,0,0.08)"

  toolbar-button:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    size: 32px

  toolbar-button-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    size: 32px

  # Panels
  side-panel:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    width: 280px
    shadow: "0 2px 8px rgba(0,0,0,0.08)"

  # Nodes
  node-process:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    typography: "{typography.node-label}"
    rounded: "{rounded.lg}"
    padding: 12px 16px
    border: "1px solid {colors.border}"
    minWidth: 120px

  node-decision:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    typography: "{typography.node-label}"
    shape: diamond
    padding: 12px
    border: "1px solid {colors.border}"

  node-start-end:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.node-label}"
    rounded: "{rounded.full}"
    padding: 8px 20px

  # Swimlane
  lane-header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.heading-sm}"
    padding: 8px 12px
    borderBottom: "1px solid {colors.border}"

  lane-body:
    backgroundColor: transparent
    minHeight: 200px
    padding: 16px

  # Buttons
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    fontWeight: 500

  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    border: "1px solid {colors.border}"

  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 16px

  # Input
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    border: "1px solid {colors.border}"
    height: 36px

  # Prompt bar
  prompt-bar:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 12px 16px
    shadow: "0 4px 12px rgba(0,0,0,0.10)"
    maxWidth: 640px

  # Toast
  toast:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 12px 16px
    shadow: "0 4px 12px rgba(0,0,0,0.10)"

  # Dialog
  dialog:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 24px
    shadow: "0 8px 24px rgba(0,0,0,0.12)"
    maxWidth: 480px
---

## Overview

SwimFlow is a canvas-first diagram editor. The UI exists to get out of the way. Chrome is compact — a floating toolbar at top, collapsible side panels, and a centered prompt bar. The infinite canvas fills the viewport with a subtle dot grid. Diagrams render as clean nodes and edges inside colored swimlane rows.

The palette is intentionally muted. Swimlane background colors are soft pastels from the `{colors.lane-*}` family so node content stays readable. The UI shell uses zinc-based neutrals that work in both light and dark themes. The only saturated color is `{colors.primary}` (blue-600) for primary actions and focus rings.

**Key Characteristics:**
- Canvas dominates: toolbar floats, panels slide, nothing is permanently docked.
- Zinc neutral palette for UI chrome; pastel `{colors.lane-*}` for swimlanes.
- Single accent: `{colors.primary}` for CTAs, focus, and selection highlights.
- Inter for everything; JetBrains Mono only for JSON preview and code snippets.
- All interactive elements use shadcn/ui primitives — no custom form controls.
- Dark theme is first-class, not an afterthought. All color tokens have `-dark` variants.
- Shadows are minimal — `{components.toolbar}` and `{components.side-panel}` float with subtle shadows; everything else is flat.
- Rounded corners are conservative: `{rounded.md}` (6px) for buttons/inputs, `{rounded.lg}` (8px) for cards/panels, `{rounded.xl}` (12px) for dialogs and prompt bar.

## Colors

### UI Shell
- **Background** ({colors.background}): Page background. White in light, near-black in dark.
- **Surface** ({colors.surface}): Slightly raised surface for panels, lane headers, button backgrounds.
- **Surface Raised** ({colors.surface-raised}): Cards, toolbars, dialogs that float above the surface.
- **Foreground** ({colors.foreground}): Primary text color. Near-black in light, near-white in dark.
- **Muted** ({colors.muted}): Secondary text, placeholder text, inactive icons.
- **Border** ({colors.border}): Subtle borders on inputs, cards, nodes.
- **Border Focus** ({colors.border-focus}): Blue focus ring on interactive elements — matches `{colors.primary}`.

### Canvas
- **Canvas BG** ({colors.canvas-bg}): Slightly off-white canvas background (distinct from page background for visual separation).
- **Canvas Grid** ({colors.canvas-grid}): Dot grid color, barely visible.

### Swimlane Palette
Eight soft pastels assigned to lanes by default. Users can customize per lane.
- `{colors.lane-blue}` — default first lane
- `{colors.lane-green}`, `{colors.lane-amber}`, `{colors.lane-rose}`, `{colors.lane-purple}`, `{colors.lane-cyan}`, `{colors.lane-orange}`, `{colors.lane-slate}`

### Semantic
- `{colors.success}` — saved, exported, valid
- `{colors.warning}` — validation warnings, JSON parse issues
- `{colors.error}` — errors, delete confirmations
- `{colors.info}` — informational toasts

## Typography

### Font Family
- **Inter** — Variable sans-serif. Used for all UI text, node labels, lane headers, buttons. Load via Google Fonts or `next/font`.
- **JetBrains Mono** — Monospace. Used only for JSON schema preview in the prompt bar and code snippets. Load via Google Fonts.

### Hierarchy

| Token | Size | Weight | Use |
|---|---|---|---|
| `{typography.heading-lg}` | 24px | 600 | Dialog titles, landing page headings |
| `{typography.heading}` | 18px | 600 | Panel titles, section headings |
| `{typography.heading-sm}` | 14px | 600 | Lane headers, toolbar group labels |
| `{typography.body}` | 14px | 400 | Default body, inputs, buttons |
| `{typography.body-sm}` | 12px | 400 | Toolbar labels, tooltips, metadata |
| `{typography.label}` | 12px | 500 | Form labels, uppercase tags |
| `{typography.mono}` | 13px | 400 | JSON preview, code |
| `{typography.node-label}` | 13px | 500 | Text inside diagram nodes |

## Layout

### Canvas
- Infinite pan/zoom canvas fills the viewport below the toolbar.
- Dot grid at 20px intervals, opacity ~0.3.
- Minimap in bottom-right corner (collapsible).
- Zoom controls in bottom-left (fit view, zoom in/out, percentage).

### Toolbar
- Floating horizontal bar at top center of canvas.
- Contains: undo/redo, node tools (add process/decision/etc), auto-layout, export, share.
- Compact: 40px height, icon buttons with tooltips.
- Collapses to hamburger below 640px viewport width.

### Panels
- Right panel: properties inspector (node/edge details, styling).
- Left panel: diagram tree / layer list.
- Both slide in/out, 280px wide, floating over canvas.

### Prompt Bar
- Centered at bottom of canvas, above minimap.
- Contains: text area describing the process, "Generate" button, "Copy Prompt" button.
- Max width 640px, rounded `{rounded.xl}`.

## Nodes

| Type | Shape | Default Style |
|---|---|---|
| Start / End | Pill (rounded-full) | Black fill, white text |
| Process | Rounded rectangle | White fill, 1px border |
| Decision | Diamond (45deg rotated square) | White fill, 1px border |
| Subprocess | Rounded rectangle + double border | White fill, double 1px border |
| Delay | D-shape (flat left, rounded right) | White fill, 1px border |
| Document | Rectangle with wavy bottom | White fill, 1px border |
| Data Store | Cylinder | White fill, 1px border |

All nodes use `{typography.node-label}` for text. Selected nodes get a 2px `{colors.primary}` border. Hovering shows a subtle shadow lift.

## Edges

- Default: 1.5px stroke, `{colors.muted}` color, with arrowhead.
- Selected: 2px stroke, `{colors.primary}`.
- Labels sit on a white background pill centered on the edge.
- Bezier curves for smooth routing; straight segments when nodes are axis-aligned.

## Dark Theme

All `-dark` color variants activate under `prefers-color-scheme: dark` or manual toggle. Key changes:
- Canvas background darkens to `{colors.canvas-bg-dark}`.
- Node fills become `{colors.surface-raised-dark}`.
- Lane pastels shift to ~15% opacity versions of their light counterparts.
- Shadows become more transparent (rgba values drop).
- Border colors use `{colors.border-dark}`.

## Responsive

SwimFlow is desktop-only for MVP. Below 768px, show a static page: "SwimFlow works best on desktop. Please switch to a larger screen."

### Desktop Breakpoints

| Width | Behavior |
|---|---|
| >= 1280px | Full layout: both panels open by default |
| 960-1279px | One panel at a time; other auto-closes |
| 768-959px | Panels overlay canvas as drawers; toolbar compact |
| < 768px | Mobile gate (static page) |

## Do's and Don'ts

### Do
- Let the canvas breathe. No permanent sidebars eating space.
- Use `{colors.primary}` only for: primary buttons, selection highlights, focus rings.
- Keep node styling simple — 1px borders, no gradients, no shadows at rest.
- Use tooltips on toolbar icons. The toolbar is icon-only to save space.
- Animate panel slide-in/out (200ms ease-out).
- Use shadcn/ui `Dialog`, `Popover`, `DropdownMenu`, `Tooltip` for all overlays.

### Don't
- Don't add color to the UI shell. Chrome is neutral; color lives in the diagram.
- Don't use shadows on nodes at rest. Shadow = hover/drag state only.
- Don't make the toolbar taller than 40px. Vertical space is premium on a canvas tool.
- Don't put text smaller than 12px anywhere.
- Don't auto-open panels on page load on viewports < 1280px.
