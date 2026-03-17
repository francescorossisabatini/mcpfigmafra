# Secret Garden — Component Spec Sheet
> Figma-ready. All token names reference `secret-garden-tokens.json`.
> Source: `src/components/` + `src/components/ui/`

---

## 1. Button

**Source:** `src/components/ui/button.tsx`

### Variants

| Variant      | Background                  | Text                  | Border                  |
|--------------|-----------------------------|-----------------------|-------------------------|
| `default`    | `color.brand.primary`       | white                 | none                    |
| `secondary`  | `color.background.card`     | `color.text.primary`  | none                    |
| `outline`    | transparent                 | `color.brand.primary` | `color.border.default`  |
| `ghost`      | transparent                 | `color.brand.primary` | none                    |
| `destructive`| `color.semantic.destructive`| white                 | none                    |
| `link`       | transparent                 | `color.brand.primary` | none (underline only)   |

### Sizes

| Size   | Height | Padding H | Padding V | Font size           |
|--------|--------|-----------|-----------|---------------------|
| `sm`   | 36px   | 12px      | 8px       | `typography.scale.sm`|
| `md`   | 40px   | 16px      | 10px      | `typography.scale.sm`|
| `lg`   | 44px   | 32px      | 12px      | `typography.scale.base`|
| `icon` | 40px   | 10px      | 10px      | —                   |

### States
- **Hover:** opacity 90% on `default`; background shifts to `color.background.muted` on ghost/outline
- **Focus:** `color.border.ring` ring, 2px, offset 2px
- **Disabled:** opacity 50%, `pointer-events: none`
- **Transition:** `transition-all duration-200` → `animation.duration.fast`

### Mobile vs Desktop
- No structural difference; size variants handle density

---

## 2. Navigation Bar

**Source:** `src/components/Navigation.tsx`

### Desktop layout
- **Height:** 64px sticky
- **Background:** `color.background.primary` with backdrop blur
- **Padding H:** `spacing.8` (32px)
- **Logo:** Caveat font, `typography.scale.xl`, `color.brand.primary`
- **Nav links:** `typography.scale.sm`, `typography.family.ui`, `color.text.primary`
  - Hover: `color.brand.primary`
  - Active (current route): `color.brand.primary`, medium weight
- **CTA button:** Button `default` variant, sm size
- **Right items:** Instagram icon link + language switcher + call button
- **Focus ring:** `color.border.ring` 2px

### Mobile layout
- **Height:** 56px sticky
- **Hamburger button:** `color.text.primary`, `radius.lg`
- **Drawer:** slides from right, full height, `color.background.primary`
  - Width: 280px
  - Links: `typography.scale.lg`, `typography.family.ui`, padding `spacing.4`
  - "Call now" CTA button at bottom
  - "Get directions" link
  - Language switcher at bottom

### Scroll behavior (homepage only)
- Hidden until user scrolls 50px; appears with `fade-in` animation

---

## 3. Tag / Badge

**Source:** `src/components/ui/badge.tsx` + dietary labels in `MenuSection.tsx`

### Base styles
- Display: `inline-flex`, `items-center`
- Border radius: `radius.full`
- Padding: 2px 10px (px-2.5 py-0.5)
- Font: `typography.scale.xs`, `typography.weight.semibold`
- Transition: `transition-colors`, `animation.duration.fast`

### shadcn Variants

| Variant      | Background              | Text                   | Border                  |
|--------------|-------------------------|------------------------|-------------------------|
| `default`    | `color.brand.primary`   | white                  | transparent             |
| `secondary`  | `color.background.card` | `color.text.primary`   | transparent             |
| `destructive`| `color.semantic.destructive` | white             | transparent             |
| `outline`    | transparent             | `color.text.primary`   | `color.border.default`  |

### Dietary Badges (custom, in MenuSection)
> ⚠️ Currently hardcoded — see audit. Proposed token mapping:

| Label        | Bg token (proposed)        | Text (hardcoded now) | Text token (proposed)  |
|--------------|----------------------------|-----------------------|------------------------|
| Vegan        | light green tint           | `#166534`             | `color.state.vegan`    |
| Gluten-free  | light amber tint           | `#92400e`             | `color.state.glutenFree`|
| Bio          | light teal tint            | `#065f46`             | `color.state.bio`      |
| Today        | `color.state.today`        | white                 | —                      |

---

## 4. Menu Item — Today's Dish Card

**Source:** `src/components/DailyMenuCard.tsx`

### Structure
```
Frame (Card)
  ├── Botanical corner decoration (absolute, top-right)
  ├── Title (Caveat, bold)
  └── Items list
        └── Item row
              ├── Bullet dot (small circle)
              └── Item text
```

### Tokens
- **Background:** `color.background.card`
- **Border:** 2px solid `color.border.default`
- **Border radius:** `radius.lg`
- **Shadow (hover):** `shadow.md`
- **Title:** `typography.family.display` (Caveat), `typography.weight.bold`, `color.text.primary`
- **Body text:** `typography.family.body` (Lora), `typography.lineHeight.relaxed`
- **Bullet:** `color.brand.accent`, small circle 6×6px

### Padding
- All sides: `spacing.6` (24px)
- Desktop: `spacing.8` (32px) — `p-6 md:p-8`

### States
- Hover: `shadow.lg` (elevated)

---

## 5. Menu Item — Classic List Item (Klassiker)

**Source:** `src/components/MenuSection.tsx`

### Structure
```
Frame
  ├── Category heading
  └── Item row
        ├── Item name (flex-1)
        ├── Dietary badges (optional)
        └── Price
```

### Tokens
- **Background:** `color.surface.klassiker`
- **Item name:** `typography.family.body`, `typography.scale.base`, `color.text.primary`
- **Price:** `typography.family.ui`, `typography.scale.sm`, `color.text.secondary`
- **Category heading:** `typography.family.display`, `typography.scale.lg`, `color.brand.primary`, `typography.weight.bold`
- **Divider:** 1px `color.border.default`

### Padding
- Row padding V: `spacing.3` (12px)
- Row padding H: `spacing.4` (16px)

---

## 6. Review Card

**Source:** `src/components/Reviews.tsx`

### Structure
```
Frame (Card)
  ├── Stars row (5× star icons, amber/yellow)
  ├── Quote text
  ├── Author name
  └── Date
```

### Tokens
- **Background:** `color.background.card`
- **Border radius:** `radius.lg`
- **Border:** 1px `color.border.default`
- **Quote text:** `typography.family.accent` (Cormorant Garamond), italic, `typography.scale.base`, `color.text.primary`
- **Author:** `typography.family.ui`, `typography.weight.semibold`, `typography.scale.sm`
- **Date:** `typography.family.ui`, `typography.scale.xs`, `color.text.muted`
- **Stars:** amber/yellow (⚠️ hardcoded — see audit)

### Layout
- **Desktop:** 3-column grid, `gap.6`
- **Mobile:** single column stack, `gap.4`

### Padding
- `spacing.6` all sides (24px)

---

## 7. Hero Section

**Source:** `src/components/Hero.tsx`

### Structure
```
Section (100vh)
  ├── Background image (cover, absolute)
  ├── Gradient overlay (gradient-hero token)
  ├── Content (centered, z-index overlay)
  │     ├── Status badge (open/closed)
  │     ├── H1 title (Caveat, white)
  │     ├── Subtitle (Cormorant, white/muted)
  │     └── CTA buttons row
  ├── Carousel dots
  └── Scroll indicator (animated chevron)
```

### Tokens
- **Background overlay:** `color.gradient.heroStart` → `color.gradient.heroEnd`, 135deg
- **H1:** `typography.family.display`, `typography.scale.5xl` (desktop) / `typography.scale.3xl` (mobile), white, `animation.keyframes.fadeInHero`
- **Subtitle:** `typography.family.accent`, `typography.scale.xl`, white/80%
- **CTA primary:** Button `default` lg
- **CTA secondary:** Button `outline` lg (white border on dark bg)
- **Status badge open:** `color.semantic.success` bg, white text
- **Status badge closed:** `color.semantic.destructive` bg, white text
- **Status badge soon:** amber bg, dark text
- **Scroll indicator:** white, `animation.keyframes.float`

### Padding
- Content padding H: `spacing.6` → `spacing.12` at md
- Content padding top: `spacing.32`

### Mobile vs Desktop
- Title: 3xl mobile → 5xl/6xl desktop
- Buttons: stack vertically on mobile, inline on desktop

---

## 8. Generic Section (Title + Body)

**Source:** `src/components/AboutSection.tsx`, `StorySection.tsx`, `Philosophy.tsx`

### Structure
```
Section
  ├── Section label (small caps, muted)
  ├── H2 heading (Caveat)
  ├── Decorative underline accent
  └── Body paragraphs / content
```

### Tokens
- **Background:** `color.background.primary` or transparent
- **Section label:** `typography.family.ui`, `typography.scale.sm`, `typography.letterSpacing.wide`, `color.text.muted`
- **Heading H2:** `typography.family.display`, `typography.scale.4xl` desktop / `3xl` mobile, `color.text.primary`
- **Body:** `typography.family.body`, `typography.scale.base`, `typography.lineHeight.relaxed`, `color.text.secondary`
- **Accent underline:** `color.brand.accent`, 2px, width 48px

### Padding
- Section padding V: `spacing.16` → `spacing.24` at md
- Section padding H: `spacing.6` → `spacing.8` at lg

---

## 9. Footer

**Source:** `src/components/Footer.tsx`

### Structure
```
Footer
  ├── Brand block
  │     ├── Logo / Brand name (Caveat)
  │     └── Tagline (Cormorant, italic)
  ├── Address block
  ├── Social links (Instagram icon)
  └── Nav links row (Contact, Legal, Privacy)
  └── Copyright line
```

### Tokens
- **Background:** `color.brand.primary`
- **Brand name:** `typography.family.display`, `typography.scale.2xl`, white
- **Tagline:** `typography.family.accent`, italic, white/80%
- **Address:** `typography.family.ui`, `typography.scale.sm`, white/70%
- **Nav links:** `typography.family.ui`, `typography.scale.sm`, white/70%; hover → white
- **Copyright:** `typography.family.ui`, `typography.scale.xs`, white/50%
- **Social icon:** white/70%, hover → white

### Padding
- Desktop: `spacing.12` top, `spacing.8` bottom
- Mobile: `spacing.12` top, `spacing.24` bottom (pb-24, for mobile sticky bar)
- Padding H: `spacing.6` → `spacing.8` at md

### Mobile vs Desktop
- Mobile adds extra bottom padding to avoid overlap with the sticky nav bar (`MobileStickyBar`)
