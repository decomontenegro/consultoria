import React from 'react';
import {
  Palette,
  FlaskConical,
  Megaphone,
  Users,
  Building,
  User,
} from 'lucide-react';
import { FeatureGridMinimal } from '@/components/ui/feature-minimal';
import { FeatureGridGradient } from '@/components/ui/feature-gradient';
import { FeatureGridShadow } from '@/components/ui/feature-shadow';
import { FeatureGridNeon } from '@/components/ui/feature-neon';
import { FeatureGridColorful } from '@/components/ui/feature-colorful';

// Demo data for the categories
const featureCategories = [
  {
    icon: <Palette size={24} />,
    title: 'Creators',
    items: [
      { text: 'Sell products online' },
      { text: 'Grow your newsletter' },
      { text: 'Receive contact form messages' },
    ],
    color: 'purple',
  },
  {
    icon: <FlaskConical size={24} />,
    title: 'Product',
    items: [
      { text: 'Gather audience feedback' },
      { text: 'Receive feature requests' },
      { text: 'Conduct user research', href: '#' },
    ],
    color: 'blue',
  },
  {
    icon: <Megaphone size={24} />,
    title: 'Marketing',
    items: [
      { text: 'Generate leads' },
      { text: 'Register users' },
      { text: 'Measure customer satisfaction' },
    ],
    color: 'pink',
  },
  {
    icon: <Users size={24} />,
    title: 'HR',
    items: [
      { text: 'Evaluate employee engagement' },
      { text: 'Receive job applications' },
      { text: 'Create exit surveys' },
    ],
    color: 'green',
  },
  {
    icon: <Building size={24} />,
    title: 'Office',
    items: [
      { text: 'Organize team events' },
      { text: 'Receive help desk tickets' },
      { text: 'Collect internal suggestions' },
    ],
    color: 'orange',
  },
  {
    icon: <User size={24} />,
    title: 'Personal',
    items: [
      { text: 'Create an online quiz' },
      { text: 'Send an RSVP form' },
      { text: 'Organize a volunteer signup' },
    ],
    color: 'yellow',
  },
];

const title = (
  <>
    Designed{' '}
    <span className="relative inline-block">
      for you
      <svg
        viewBox="0 0 120 6"
        className="absolute left-0 bottom-0 -mb-1 w-full"
        aria-hidden="true"
      >
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

// Demo 1: Minimal Clean
export const FeatureDemo1 = () => {
  return (
    <div className="bg-white w-full min-h-screen">
      <FeatureGridMinimal
        title={title}
        subtitle="Start from scratch or explore templates created by our community."
        illustrationSrc="https://tally.so/images/demo/v2/designed-for-you.png"
        categories={featureCategories}
        buttonText="Browse templates"
        buttonHref="#"
      />
    </div>
  );
};

// Demo 2: Vibrant Gradient
export const FeatureDemo2 = () => {
  return (
    <div className="bg-white w-full min-h-screen">
      <FeatureGridGradient
        title={title}
        subtitle="Start from scratch or explore templates created by our community."
        illustrationSrc="https://tally.so/images/demo/v2/designed-for-you.png"
        categories={featureCategories}
        buttonText="Browse templates"
        buttonHref="#"
      />
    </div>
  );
};

// Demo 3: Card Shadow Depth
export const FeatureDemo3 = () => {
  return (
    <div className="w-full min-h-screen">
      <FeatureGridShadow
        title={title}
        subtitle="Start from scratch or explore templates created by our community."
        illustrationSrc="https://tally.so/images/demo/v2/designed-for-you.png"
        categories={featureCategories}
        buttonText="Browse templates"
        buttonHref="#"
      />
    </div>
  );
};

// Demo 4: Dark Neon Glow
export const FeatureDemo4 = () => {
  return (
    <div className="w-full min-h-screen bg-gray-950">
      <FeatureGridNeon
        title={title}
        subtitle="Start from scratch or explore templates created by our community."
        illustrationSrc="https://tally.so/images/demo/v2/designed-for-you.png"
        categories={featureCategories}
        buttonText="Browse templates"
        buttonHref="#"
      />
    </div>
  );
};

// Demo 5: Colorful Borders
export const FeatureDemo5 = () => {
  return (
    <div className="w-full min-h-screen">
      <FeatureGridColorful
        title={title}
        subtitle="Start from scratch or explore templates created by our community."
        illustrationSrc="https://tally.so/images/demo/v2/designed-for-you.png"
        categories={featureCategories}
        buttonText="Browse templates"
        buttonHref="#"
      />
    </div>
  );
};

// All Demos in One Page
export const AllFeatureDesigns = () => {
  return (
    <div className="w-full">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            5 Feature Grid Designs
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the design that best fits your brand and aesthetic
          </p>
        </div>
      </div>

      {/* Design 1 */}
      <div className="border-b-8 border-gray-200">
        <div className="bg-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              1. Minimal Clean
            </h2>
            <p className="text-gray-600">
              Ultra-clean design with ample whitespace and focus on typography
            </p>
          </div>
        </div>
        <FeatureDemo1 />
      </div>

      {/* Design 2 */}
      <div className="border-b-8 border-gray-200">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              2. Vibrant Gradient
            </h2>
            <p className="text-gray-700">
              Bold gradients with vibrant colors and dynamic hover effects
            </p>
          </div>
        </div>
        <FeatureDemo2 />
      </div>

      {/* Design 3 */}
      <div className="border-b-8 border-gray-200">
        <div className="bg-blue-100 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              3. Card Shadow Depth
            </h2>
            <p className="text-gray-700">
              Elevated cards with deep shadows creating a 3D layered effect
            </p>
          </div>
        </div>
        <FeatureDemo3 />
      </div>

      {/* Design 4 */}
      <div className="border-b-8 border-cyan-500">
        <div className="bg-gray-900 py-8 border-b border-cyan-500/30">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-cyan-400 mb-2">
              4. Dark Neon Glow
            </h2>
            <p className="text-gray-300">
              Dark theme with neon accents and cyberpunk aesthetic
            </p>
          </div>
        </div>
        <FeatureDemo4 />
      </div>

      {/* Design 5 */}
      <div>
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              5. Colorful Borders
            </h2>
            <p className="text-gray-700">
              Playful design with colorful borders and vibrant personality
            </p>
          </div>
        </div>
        <FeatureDemo5 />
      </div>
    </div>
  );
};
