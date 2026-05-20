# Design System (`design-system/`)

## Package Identity
Shared UI component library for the AI Team Assistant. Source-of-truth for design tokens, component patterns, and visual conventions. Pure JavaScript (JSX), class-variance-authority (CVA) for variants, Tailwind CSS for styling. Components exported here are re-exported in `fe/src/components/ui/` for consumption.

## Setup
No separate build step — components are imported directly by the frontend via `@/components/ui` path alias (which resolves to `fe/src/components/ui/`). The `design-system/` directory is the reference specification for component APIs and visual behavior.

Key files:
- `design-tokens.css` — CSS custom properties (colors, spacing, typography, shadows)
- `tailwind.config.js` — Tailwind configuration with custom theme extensions
- `utils.js` — `cn()` utility (clsx + tailwind-merge) for conditional classes
- `index.js` — Barrel export of all components

## Component Library

| Component | File | Pattern |
|---|---|---|
| Button | `button.jsx` | CVA variants: primary, outline, ghost, destructive, link. Sizes: sm, md, lg, icon. Uses `@radix-ui/react-slot` |
| Card | `card.jsx` | Compound: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Badge | `badge.jsx` | CVA variants: default, success, warning, error, info |
| Input | `input.jsx` | Styled input with focus ring, label, helper text |
| Avatar | `avatar.jsx` | Image + fallback initials |
| StatCard | `stat-card.jsx` | Metric display with label, value, trend icon |
| ListItem | `list-item.jsx` | Row item with leading icon, primary/secondary text, trailing action |
| NavItem | `nav-item.jsx` | Sidebar navigation item with active state, icon, badge |
| Sidebar | `sidebar.jsx` | Collapsible navigation sidebar |
| HeroBanner | `hero-banner.jsx` | Page hero with title, description, CTA |
| TokenUsage | `token-usage.jsx` | Token usage summary display |
| ConfirmationModal | `confirmation-modal.jsx` | Confirm/cancel dialog with title, message, icon, variant |

## Patterns & Conventions

### Component Structure
- DO: Use `React.forwardRef` on all interactive components (Button, Input)
- DO: Use CVA from `class-variance-authority` for variant-based styling — see `button.jsx:11`
- DO: Use `cn()` from `utils.js` for conditional class merging
- DO: Export sub-components as properties of the root component (e.g., `Card.Header`, `Card.Title`)
- DO: Include `displayName` for forwardRef components
- DON'T: Hardcode color values — use Tailwind theme tokens or CSS variables from `design-tokens.css`
- DON'T: Use inline styles — use Tailwind classes only

### Design Tokens
Primary color: `#E84322` (Orange-Red)
- Tailwind: `primary-50` through `primary-900`
- CSS: `--color-primary-500`
- Font: Inter (headlines + body)
- Radius: 8px default (`rounded-lg`)

### Adding a New Component
1. Create `my-component.jsx` in `design-system/`
2. Follow existing CVA + forwardRef pattern
3. Add barrel export to `index.js`
4. Mirror in `fe/src/components/ui/my-component.jsx`
5. Update `fe/src/components/ui/index.js` to re-export

## Key Files

| File | Purpose |
|---|---|
| `DESIGN-SYSTEM.md` | Comprehensive design documentation (brand, colors, typography, usage) |
| `PLAN.md` | Evolution roadmap for the design system |
| `design-tokens.css` | CSS custom properties — single source of truth for tokens |
| `tailwind.config.js` | Tailwind theme extension (colors, animation, spacing) |
| `utils.js` | `cn()` utility for merging Tailwind classes |
| `button.jsx` | Reference component — canonical CVA + forwardRef pattern |
| `card.jsx` | Reference compound component pattern |
| `CONFIRMATION-MODAL.md` | Documentation for the ConfirmationModal component |

## JIT Index Hints
```bash
# Find all CVA definitions
rg -n "cva\(" design-system

# Find forwardRef usage
rg -n "forwardRef" design-system

# Find cn() usage
rg -n "cn\(" design-system

# Find exported components
rg -n "export (const|function|default)" design-system
```
