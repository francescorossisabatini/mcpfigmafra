# Secret Garden — Design Token Audit
> Generated from source code analysis of `mysecregardenrestaurantcafe`

---

## SECTION A — Tokens Defined But Never Used

These tokens are declared in `tailwind.config.ts` or `src/index.css` but were not found in any component `className` or `style` prop during the audit.

| Token name (config key)       | CSS var / Tailwind key        | Notes |
|-------------------------------|-------------------------------|-------|
| `--daily`                     | `color.daily` / `bg-daily`    | Declared in CSS vars, referenced in tailwind config, but no component uses `bg-daily` or `text-daily` directly — only used indirectly via inline style or data-driven logic |
| `--dailyAlt`                  | `color.dailyAlt`              | Same as above — fallback color for daily menu, not found in className usage |
| `--klassiker`                 | `color.klassiker`             | Declared but usage not confirmed in any className; may be used inline |
| `--badgeWood`                 | `color.badgeWood`             | Declared but no `bg-badgeWood` or `text-badgeWood` className found |
| `shadow-soft`                 | `boxShadow.soft`              | Defined in tailwind config as `shadow-soft`; no className usage found — components use `shadow-md`, `shadow-lg` from default scale |
| `shadow-elevated`             | `boxShadow.elevated`          | Same as above |
| `shadow-card`                 | `boxShadow.card`              | Same as above |
| `bg-gradient-green`           | `backgroundImage.gradient-green` | Defined but not found in any component className |
| `bg-gradient-subtle`          | `backgroundImage.gradient-subtle` | Defined but not confirmed in className usage |
| `animate-slide-up`            | `animation.slide-up`          | Keyframe defined, animation utility exists, but not found in className usage |
| `animate-float`               | `animation.float`             | Defined for decorative elements; confirmed only in CSS `@layer` class, not in component className |
| `font-cormorant`              | `fontFamily.cormorant`        | Defined in config; usage confirmed only via `font-cormorant` inline in About component — not in a design token pattern |
| `text-accent-light`           | `color.accent-light`          | Defined; not found in component classNames |
| `--sidebar-*` variables       | all `sidebar.*` color tokens  | Full sidebar color palette declared (sidebar-background, sidebar-foreground, sidebar-primary, etc.) but no sidebar component exists in the restaurant UI |

---

## SECTION B — Hardcoded Values Bypassing the Token System

These are raw color, spacing, or font values found directly in component files instead of using a Tailwind token or CSS variable.

### Colors

| File | Approx. Line | Hardcoded Value | Suggested Token |
|------|-------------|-----------------|-----------------|
| `src/components/MenuSection.tsx` | ~320 | `color: '#166534'` | `color.state.vegan` |
| `src/components/MenuSection.tsx` | ~321 | `color: '#92400e'` | `color.state.glutenFree` |
| `src/components/MenuSection.tsx` | ~322 | `color: '#065f46'` | `color.state.bio` |
| `src/components/MenuSection.tsx` | ~330 (comment) | `#FAF7F3` (cream, in code comment for WCAG note) | `color.background.primary` |
| `src/components/Reviews.tsx` | ~80 | star color via `text-yellow-400` (Tailwind default, not a custom token) | Add `color.brand.star` token |
| `src/components/About.tsx` | ~60 | `font-family: 'Playfair Display'` (via className `font-playfair` or inline) | Not in `tailwind.config` — add `typography.family.display2` or replace with `font-cormorant` |
| `src/components/About.tsx` | ~65 | `font-family: 'Dancing Script'` (via className or inline) | Not in `tailwind.config` — add or replace with `font-caveat` |
| `src/components/Hero.tsx` | ~110 | `bg-amber-500` / `bg-green-600` for status badge (Tailwind defaults) | `color.semantic.warning`, `color.semantic.success` |

### Spacing

| File | Approx. Line | Hardcoded Value | Suggested Token |
|------|-------------|-----------------|-----------------|
| `src/components/Footer.tsx` | ~40 | `pb-24` (mobile bottom padding) | Could be a named token `spacing.mobileNavBuffer` = `spacing.24` |

### Fonts not in tailwind.config

| File | Font used | Status |
|------|-----------|--------|
| `src/components/About.tsx` | `Playfair Display` | ❌ Not declared in `tailwind.config.ts` fontFamily |
| `src/components/About.tsx` | `Dancing Script` | ❌ Not declared in `tailwind.config.ts` fontFamily |

> **Recommendation:** Either add these fonts to `tailwind.config.ts` under `fontFamily` with `font-playfair` and `font-dancing` keys, or replace usages with the existing `font-caveat` (similar handwritten style) and `font-cormorant` (similar elegant serif).

---

## Summary

| Category | Count |
|----------|-------|
| Tokens defined but unused | 14 |
| Hardcoded color values | 8 |
| Hardcoded font families outside config | 2 |
| Hardcoded spacing patterns | 1 |

### Priority fixes
1. **Dietary badge colors** in `MenuSection.tsx` — highest impact, WCAG-related, 3 hardcoded values
2. **Undeclared fonts** in `About.tsx` — Playfair Display and Dancing Script break the font system
3. **Status badge colors** in `Hero.tsx` — use semantic tokens instead of Tailwind defaults (`amber-500`, `green-600`)
4. **Clean up unused sidebar tokens** — 10+ vars declared for a UI pattern that doesn't exist in the app
