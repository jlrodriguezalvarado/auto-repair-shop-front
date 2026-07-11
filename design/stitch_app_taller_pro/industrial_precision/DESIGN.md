---
name: Industrial Precision
colors:
  surface: '#f8f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#42474d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#72787e'
  outline-variant: '#c2c7ce'
  surface-tint: '#396280'
  primary: '#00273c'
  on-primary: '#ffffff'
  primary-container: '#0b3d59'
  on-primary-container: '#7fa8c8'
  inverse-primary: '#a2cbed'
  secondary: '#7e5700'
  on-secondary: '#ffffff'
  secondary-container: '#feb300'
  on-secondary-container: '#6a4800'
  tertiary: '#002a1a'
  on-tertiary: '#ffffff'
  tertiary-container: '#00422b'
  on-tertiary-container: '#10b981'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cae6ff'
  primary-fixed-dim: '#a2cbed'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#1e4b67'
  secondary-fixed: '#ffdeac'
  secondary-fixed-dim: '#ffba38'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#604100'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1440px
  gutter: 16px
---

## Brand & Style

This design system is built for a high-efficiency Mechanical Workshop Management environment. The brand personality is rooted in **Industrial Precision**: it is authoritative, reliable, and meticulously organized. It bridges the gap between the physical grit of automotive repair and the digital clarity of modern enterprise SaaS.

The visual style follows a **Modern Corporate** aesthetic. It prioritizes clarity and utility, using generous whitespace to reduce cognitive load in busy workshop environments. The interface uses a "Layered Utility" approach—functional zones are clearly demarcated by subtle tonal changes rather than heavy lines, ensuring a clean, focused workspace that feels premium and robust.

Target users are shop owners and technicians who require immediate access to data without visual noise. The emotional response should be one of "controlled efficiency" and "professional trust."

## Colors

The palette is designed for high legibility and clear status communication.

- **Primary (Petrol Blue):** Used for global navigation, primary headers, and structural elements to establish authority.
- **Secondary (Amber):** Reserved strictly for high-priority calls to action (CTAs), new work orders, and "In-Progress" highlights.
- **Success (Emerald):** Denotes paid invoices, completed repairs, and positive inventory counts.
- **Danger (Warm Red):** Flags overdue payments, critical vehicle alerts, and stock-outs.
- **Background & Surface:** The application uses a subtle light-gray base (#F5F7F9) to reduce glare, with white (#FFFFFF) cards providing a "lifted" workspace for data entry and reading.

## Typography

The design system utilizes **Inter** exclusively to ensure maximum legibility and a systematic, tech-forward feel. 

- **Hierarchy:** Use `display-lg` for dashboard overviews. `headline-md` is the standard for card titles and section headers.
- **Labels:** `label-caps` should be used for table headers and small metadata categories (e.g., "VIN NUMBER") to provide high contrast against data values.
- **Weight:** Use Semibold (600) for interactive elements and Regular (400) for long-form data or descriptions. 
- **Mobile:** Headline sizes scale down on mobile to preserve screen real estate for technical data tables.

## Layout & Spacing

This design system uses a **Fluid Grid** model based on an 8px spacing scale.

- **Desktop:** A fixed 260px left sidebar for primary navigation. Content area uses a 12-column fluid grid with 24px margins and 16px gutters.
- **Mobile (PWA):** Bottom navigation bar for core views (Dashboard, Work Orders, Customers, Inventory). Safe area margins are set to 16px.
- **Alignment:** Data density is medium-high. Use `md` (16px) padding inside cards and `lg` (24px) spacing between major sections.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**.

1.  **Level 0 (Background):** #F5F7F9. The base canvas.
2.  **Level 1 (Cards/Surface):** #FFFFFF. Used for the main content containers. These use a very soft, diffused shadow: `0px 2px 4px rgba(11, 61, 89, 0.05)`.
3.  **Level 2 (Dropdowns/Modals):** Floating elements use a more pronounced shadow to indicate focus: `0px 10px 20px rgba(11, 61, 89, 0.1)`.
4.  **Interactions:** Hover states on interactive cards should slightly deepen the shadow and shift the border color to the primary petrol blue at 10% opacity.

## Shapes

The design system uses a **Rounded** shape language to soften the industrial data.

- **Standard Elements:** Buttons, Input fields, and small cards use a 0.5rem (8px) radius.
- **Large Containers:** Main dashboard widgets and modal windows use 1rem (16px) for a more modern, friendly "app" feel.
- **Status Pills:** Badges for "Paid" or "Pending" should use a fully rounded (pill) shape to distinguish them from interactive buttons.

## Components

- **Buttons:** Primary buttons use the Petrol Blue background with White text. Secondary actions use White background with Petrol Blue borders. The "New Order" action is the only component allowed to use the Amber (#FFB300) background.
- **Input Fields:** Use a 1px border (#E2E8F0). On focus, the border transitions to Primary Petrol Blue. Labels must be `label-sm` in a dark neutral shade (#475569) placed above the field.
- **Chips/Status:** Use low-saturation background tints of the status colors (e.g., Emerald at 10% opacity) with high-saturation text for maximum readability.
- **Lists/Tables:** Use a "Striped" row pattern on large data sets using the Neutral Background color. Rows should have a 1px bottom border.
- **Cards:** Cards are the primary unit of the UI. They must include a `headline-md` title and a 16px internal padding.
- **Navigation:** Desktop uses a "Slim" state for the sidebar to maximize workspace. Mobile bottom nav uses 24px Material Symbols with `label-sm` text below each icon.
- **Inventory Indicators:** Use a vertical progress bar within list items to show stock levels at a glance.