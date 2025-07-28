# 🟦 Moohaar Brand Guide

**Platform Name:** Moohaar  
**Tagline (Urdu):** ویبسائٹ آج اور ابھی

---

## 🎨 Color Palette

### 🌐 Primary Theme
- `#1C2B64` – Primary Blue
- `#FBECB2` – Soft Cream
- `#F8BDEB` – Light Pink
- `#5272F2` – Sky Blue
- `#072541` – Navy Shadow

### 🌑 Dark Mode Theme
- `#0E0D0D` – Deep Black
- `#1C2B64` – Indigo (shared with primary)
- `#E2AA4D` – Rich Gold
- `#E2E9ED` – Cloudy White

---

## 🔤 Font System

### ✅ Font Combo
- **Montserrat** – For modern, minimal English UI
- **Nastaliq Urdu** – For Urdu taglines and culturally-rich headings

### ⚙️ Usage Strategy

| Section        | Font        | Weight   |
|----------------|-------------|----------|
| Headings       | Montserrat  | 700      |
| Subheadings    | Montserrat  | 600      |
| Body text      | Montserrat  | 400      |
| Urdu Taglines  | Nastaliq    | Regular  |

> ⚡ *Fonts will be optimized by importing only selected weights with `display=swap` for better loading speed.*

---

## 🔡 Font Weight Usage

Use the following font weights consistently across the platform to maintain visual hierarchy:

- **Montserrat Bold (700–800):** Headlines, page titles, call-to-action buttons
- **Montserrat Semi-Bold (600):** Section headers, navigation menu items
- **Montserrat Medium (500):** Subheadings, feature highlights
- **Montserrat Regular (400):** Paragraphs, form labels, body content
- **Nastaliq (Urdu):** Use lightest available weight for elegance (typically Regular or Light)

---

## 🎯 Tailwind Utility Tokens

To keep the UI consistent and efficient, use Tailwind CSS tokens mapped to your brand colors and fonts.

**Extend Tailwind Config (`tailwind.config.js`):**

```js
theme: {
  extend: {
    colors: {
      primary: '#1C2B64',
      accent: '#FBECB2',
      highlight: '#F8BDEB',
      info: '#5272F2',
      deep: '#072541',
      darkBg: '#0E0D0D',
      gold: '#E2AA4D',
      softLight: '#E2E9ED',
    },
    fontFamily: {
      mont: ['Montserrat', 'sans-serif'],
      nastaliq: ['Noto Nastaliq Urdu', 'serif'],
    },
    fontWeight: {
      'extra-bold': '800',
      'bold': '700',
      'semibold': '600',
      'medium': '500',
      'regular': '400',
    }
  }
}
```

---

📁 This file will evolve:
Next update will include brand imagery, spacing rules, and UI component design tokens.
