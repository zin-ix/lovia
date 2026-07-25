# 🎨 Lovia Design Theme — Apple-Inspired Minimalist (Rose Accent)

## Design Philosophy

Same minimalist rule as before — **grayscale by default, color used sparingly and with intent** — but now shaped by Apple's actual design language: big confident typography, generous whitespace, soft depth via blur rather than shadow, pill-shaped controls, and a single accent color that appears consistently in the same few roles (Apple uses blue for links/CTAs everywhere; Lovia uses **rose** the same way).

The difference from the previous minimalist version: that one restricted rose to _just_ the primary button. Apple's actual pattern is a bit more generous than that — the accent shows up wherever it means "tap this" or "you can interact here" (links, toggles switched on, selected state) — but never on backgrounds, cards, or decoration. Still restrained, just Apple's specific flavor of restrained.

---

# Color Palette

## Grayscale (foundation — does most of the work)

```css
--black: #000000;
--gray-900: #1d1d1f; /* Apple's near-black, slightly warm */
--gray-700: #424245;
--gray-500: #6e6e73; /* Apple's standard secondary text gray */
--gray-300: #d2d2d7; /* Apple's border gray */
--gray-100: #f5f5f7; /* Apple's signature off-white background */
--white: #ffffff;
```

## Accent — Rose, used the way Apple uses blue

```css
--accent: oklch(0.65 0.22 16); /* rose-500 */
--accent-hover: oklch(0.59 0.22 18); /* rose-600 */
--accent-tint: oklch(0.97 0.02 12); /* rose-50, for selected/on states only */
```

Applied to: primary buttons, links, toggle switches (on state), selected tabs/pills, radio/checkbox checked state, focus outline. **Not** used on cards, backgrounds, icons-at-rest, or decoration.

---

# Typography

- **Font:** SF Pro Display (headings) / SF Pro Text (body) — fallback to **Inter** on web/non-Apple platforms, since Inter is metrically close and free.
- **Headlines:** Large, bold, tight letter-spacing (`-0.02em` to `-0.03em`). This is Apple's biggest tell — go bigger than feels natural, then tighten the tracking.
- **Body:** Regular weight, relaxed line-height (1.5), gray-900 on white.
- **No decorative or script fonts.** No color on headline text — headlines are always black/gray-900, never rose.

| Level   | Size    | Weight | Tracking |
| ------- | ------- | ------ | -------- |
| Hero    | 48–64px | 700    | -0.03em  |
| H1      | 32px    | 700    | -0.02em  |
| H2      | 24px    | 600    | -0.01em  |
| Body    | 16px    | 400    | normal   |
| Caption | 13px    | 400    | normal   |

---

# Buttons (Apple pill style, not bulky — refined, not tiny)

Apple's actual buttons are pill-shaped and comfortably sized, not compressed. "Not bulky" here means no heavy shadow/gradient/border, not "make it small."

| Size             | Height | Radius    | Padding (x) |
| ---------------- | ------ | --------- | ----------- |
| Compact          | 36px   | full pill | 16px        |
| Default          | 44px   | full pill | 22px        |
| Large (hero CTA) | 50px   | full pill | 28px        |

## Primary Button

- Background: `--accent`
- Hover: `--accent-hover`
- Text: white, weight 500
- Shape: full pill (`border-radius: 999px`)
- No shadow, no gradient, no border

## Secondary Button

- Background: `gray-100`
- Text: `black`
- Hover: `gray-300`
- Same pill shape

## Text / Ghost Button (Apple uses this a lot — "Learn more >")

- Background: none
- Text: `--accent`
- Hover: underline
- Often paired with a chevron `>`

---

# Cards & Surfaces

- Background: `white` or `gray-100` — never colored
- Radius: `18px` (Apple uses larger, softer radii than most "minimalist" systems — this is one place it diverges from strict austerity)
- Border: none, or `1px solid gray-300` only where needed for separation
- Shadow: avoided in favor of a flat background-color shift (e.g. white card on `gray-100` page background does the separating, not a shadow)

---

# Navigation Bar (the clearest "Apple" signature)

- Height: `48–52px` (Apple's is famously compact)
- Background: `rgba(255,255,255,0.8)`
- Blur: `backdrop-filter: blur(20px)` — Apple's frosted-glass nav is real glassmorphism, unlike the flat minimalist version
- Border bottom: `1px solid rgba(0,0,0,0.05)` — barely visible
- Text: `gray-900`, active/current page can use `--accent` on the underline only, not the text color

---

# Toggles, Tabs, Selected States

This is where rose does its Apple-blue job:

- **Toggle switch (on):** track fills with `--accent`
- **Segmented control (selected tab):** white pill on `gray-100` track, selected label in `black` — accent used only if the control is a link-style tab, not a segmented control
- **Checked checkbox/radio:** `--accent` fill, white checkmark
- **Selected list item:** `--accent-tint` background, `black` text (subtle, not a strong fill)

---

# Icons

- Default: `gray-900` or `gray-500`, not colored
- Interactive icon at rest: gray; on hover/active: `--accent` (same rule as links)
- SF Symbols style if available — thin/regular weight, not filled/bold by default

---

# Motion

Apple's motion is smooth and physics-based, not flashy:

- Ease curve: `cubic-bezier(0.4, 0, 0.2, 1)` (standard "Apple ease")
- Page transitions: cross-fade + slight scale (0.98 → 1), never a hard cut
- Scroll-triggered reveals: fade + rise 12–16px, staggered slightly for lists
- Buttons: subtle opacity dip on press (no scale/lift), mimicking iOS tap feedback
- No floating particles, no bounce, no spring-heavy easing

---

# What Changed vs. the Previous Minimalist Version

| Element     | Strict Minimalist                       | Apple-Inspired Minimalist                                           |
| ----------- | --------------------------------------- | ------------------------------------------------------------------- |
| Rose usage  | Primary button only                     | Buttons, links, toggles-on, selected states, focus                  |
| Radius      | 6–8px, tight                            | 18px cards, full pill buttons                                       |
| Nav bar     | Flat white, no blur                     | Frosted glass, 20px blur                                            |
| Headlines   | Size/spacing only, no boldness variance | Large, bold, tight tracking — typography carries more visual weight |
| Shadows     | Occasional 1–2px hint                   | Avoided almost entirely — background contrast instead               |
| Card radius | 8px                                     | 18px (Apple's softer, larger radius)                                |

Both versions agree on the core minimalist law — no decoration, no rose on backgrounds/text/cards — they just differ in Apple's specific vocabulary: bigger type, pill shapes, glass nav, softer radii.

---

_Next step: I can turn this into CSS variables / a Tailwind config, or mock up a sample screen (nav + hero + button + card) so you can see it rendered rather than just specced._
