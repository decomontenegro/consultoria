# 5 Feature Grid Designs

This document provides an overview of the 5 different feature grid designs created for the CulturaBuilder project. Each design offers a unique visual style and aesthetic to match different brand personalities.

## Table of Contents
1. [Design 1: Minimal Clean](#design-1-minimal-clean)
2. [Design 2: Vibrant Gradient](#design-2-vibrant-gradient)
3. [Design 3: Card Shadow Depth](#design-3-card-shadow-depth)
4. [Design 4: Dark Neon Glow](#design-4-dark-neon-glow)
5. [Design 5: Colorful Borders](#design-5-colorful-borders)
6. [Setup Instructions](#setup-instructions)
7. [Usage Examples](#usage-examples)

---

## Design 1: Minimal Clean

**File:** `components/ui/feature-minimal.tsx`

### Description
Ultra-clean design with ample whitespace, subtle animations, and a strong focus on typography. Perfect for brands that value simplicity and elegance.

### Key Features
- Light font weights for a refined look
- Centered layout with generous spacing
- Subtle hover animations
- Minimal borders and decorations
- Emphasized whitespace for breathing room

### Best For
- Professional services
- Premium products
- Content-focused sites
- Minimalist brands

### Visual Characteristics
- **Colors:** Grayscale with subtle accents
- **Typography:** Light and medium weights
- **Spacing:** Extra generous (20px+ gaps)
- **Animation:** Gentle spring animations

---

## Design 2: Vibrant Gradient

**File:** `components/ui/feature-gradient.tsx`

### Description
Bold design featuring vibrant gradients, colorful accents, and dynamic hover effects. Creates an energetic and modern impression.

### Key Features
- Gradient backgrounds (purple → pink → blue)
- Colorful gradient text headings
- Background blur effects (backdrop-blur)
- Dynamic scale animations on hover
- Floating gradient orbs in background

### Best For
- Creative agencies
- Tech startups
- Modern SaaS products
- Youth-oriented brands

### Visual Characteristics
- **Colors:** Purple, pink, blue gradients
- **Typography:** Bold and extrabold weights
- **Spacing:** Moderate with rounded corners
- **Animation:** Scale and transform effects

---

## Design 3: Card Shadow Depth

**File:** `components/ui/feature-shadow.tsx`

### Description
Elevated design with deep shadows creating a 3D layered effect. Cards appear to float above the background, giving a sense of depth and hierarchy.

### Key Features
- Multi-level shadow system
- Hover elevations (y-translate on hover)
- Gradient background (gray-50 → white)
- Checkmark icons for list items
- Corner accent decorations

### Best For
- Enterprise applications
- Professional portfolios
- Business services
- Premium offerings

### Visual Characteristics
- **Colors:** Blue and purple accents on white
- **Typography:** Bold headings with medium body
- **Spacing:** Cards with generous padding
- **Animation:** Vertical lift on hover

---

## Design 4: Dark Neon Glow

**File:** `components/ui/feature-neon.tsx`

### Description
Dark theme with neon accents, glowing effects, and a cyberpunk aesthetic. Features animated glow orbs and pulsing effects.

### Key Features
- Dark background (gray-950 → gray-900)
- Cyan and pink neon accents
- Animated glow effects
- Backdrop blur effects
- Pulsing orb animations
- Text shadow glows

### Best For
- Gaming platforms
- Tech products
- Creative tools
- Modern apps with dark mode

### Visual Characteristics
- **Colors:** Dark grays with cyan/pink neon
- **Typography:** Black weight with text glow
- **Spacing:** Compact with rounded corners
- **Animation:** Glow pulses and scale effects

---

## Design 5: Colorful Borders

**File:** `components/ui/feature-colorful.tsx`

### Description
Playful design featuring colorful left borders, large icons, and vibrant personality. Each category gets its own unique color theme.

### Key Features
- Thick colored left borders (8px)
- Category-specific color themes
- Large rounded icons (3xl size)
- Colorful bullet points
- Gradient background (amber → blue)
- Decorative blur orbs

### Best For
- Educational platforms
- Community sites
- Creative portfolios
- Playful brands

### Visual Characteristics
- **Colors:** Full spectrum (red, orange, yellow, green, blue, purple, pink)
- **Typography:** Black weight for emphasis
- **Spacing:** Moderate with colorful accents
- **Animation:** Rotation and scale on hover

### Color Mapping
Each category requires a `color` property:
```typescript
{
  icon: <Icon />,
  title: 'Category Name',
  color: 'blue', // red, orange, yellow, green, blue, purple, pink
  items: [...]
}
```

---

## Setup Instructions

### 1. Prerequisites
Ensure your project has the following installed:
- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**

### 2. Install Dependencies

```bash
npm install framer-motion @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
```

### 3. File Structure
```
project-root/
├── app/
│   └── feature-designs/
│       └── page.tsx
├── components/
│   ├── demos/
│   │   └── feature-demos.tsx
│   └── ui/
│       ├── button.tsx
│       ├── feature-minimal.tsx
│       ├── feature-gradient.tsx
│       ├── feature-shadow.tsx
│       ├── feature-neon.tsx
│       └── feature-colorful.tsx
└── lib/
    └── utils.ts
```

### 4. Configure Path Aliases
Ensure your `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Usage Examples

### Basic Usage

```tsx
import { FeatureGridMinimal } from '@/components/ui/feature-minimal';
import { Palette, FlaskConical } from 'lucide-react';

const categories = [
  {
    icon: <Palette size={24} />,
    title: 'Creators',
    items: [
      { text: 'Sell products online' },
      { text: 'Grow your newsletter', href: '/newsletter' },
    ],
  },
  // ... more categories
];

export default function MyPage() {
  return (
    <FeatureGridMinimal
      title="Designed for you"
      subtitle="Start from scratch or explore templates."
      illustrationSrc="/images/illustration.png"
      categories={categories}
      buttonText="Get Started"
      buttonHref="/signup"
    />
  );
}
```

### With Custom Title Element

```tsx
const title = (
  <>
    Designed{' '}
    <span className="relative inline-block">
      for you
      <svg viewBox="0 0 120 6" className="absolute left-0 bottom-0 -mb-1 w-full">
        <path
          d="M1 4.5C25.46 1.63 78.43 1.39 119 4.5"
          stroke="#f472b6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  </>
);

<FeatureGridGradient
  title={title}
  // ... other props
/>
```

### Colorful Borders (with color mapping)

```tsx
const categories = [
  {
    icon: <Palette size={24} />,
    title: 'Creators',
    color: 'purple', // Required for colorful design
    items: [
      { text: 'Sell products online' },
    ],
  },
  {
    icon: <FlaskConical size={24} />,
    title: 'Product',
    color: 'blue',
    items: [
      { text: 'Gather feedback' },
    ],
  },
];

<FeatureGridColorful
  title="Features"
  subtitle="Everything you need"
  illustrationSrc="/img.png"
  categories={categories}
  buttonText="Explore"
  buttonHref="/explore"
/>
```

---

## TypeScript Interfaces

### Base Interfaces (Designs 1-4)

```typescript
interface FeatureItem {
  text: string;
  href?: string;
}

interface FeatureCategory {
  icon: React.ReactNode;
  title: string;
  items: FeatureItem[];
}

interface FeatureGridProps {
  title: React.ReactNode;
  subtitle: string;
  illustrationSrc: string;
  illustrationAlt?: string;
  categories: FeatureCategory[];
  buttonText: string;
  buttonHref: string;
  className?: string;
}
```

### Colorful Design Interface (Design 5)

```typescript
interface FeatureCategory {
  icon: React.ReactNode;
  title: string;
  items: FeatureItem[];
  color: string; // Additional property: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'
}
```

---

## View All Designs

To view all 5 designs on a single page:

1. Navigate to `/feature-designs` in your browser
2. Or import the component directly:

```tsx
import { AllFeatureDesigns } from '@/components/demos/feature-demos';

export default function ShowcasePage() {
  return <AllFeatureDesigns />;
}
```

---

## Customization Tips

### Change Animation Timing
Modify the `staggerChildren` value in `containerVariants`:
```typescript
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Increase for slower stagger
    },
  },
};
```

### Adjust Colors
Each design uses Tailwind's color system. Modify colors by changing class names:
```tsx
// Before
className="text-purple-600"

// After
className="text-blue-600"
```

### Add Custom Styling
Use the `className` prop to add custom styles:
```tsx
<FeatureGridMinimal
  className="bg-gradient-to-r from-indigo-50 to-purple-50"
  // ... other props
/>
```

---

## Performance Notes

- All components use `React.forwardRef` for ref forwarding
- Framer Motion animations use `viewport={{ once: true }}` to prevent re-animation on scroll
- Images should be optimized (use Next.js `<Image>` component for production)

---

## Browser Compatibility

All designs use modern CSS features:
- **backdrop-filter** (blur effects)
- **CSS gradients**
- **CSS Grid**

Ensure your target browsers support these features or provide fallbacks.

---

## License

These components are part of the CulturaBuilder Assessment project.

---

## Support

For issues or questions, refer to the main project README or documentation.
