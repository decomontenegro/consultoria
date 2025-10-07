import React from 'react';
import { Target, Users, Code, Lightbulb, DollarSign, Shield } from 'lucide-react';

/**
 * CulturaBuilder feature categories for Minimal Clean design
 * Focused on enterprise AI readiness and voice coding adoption
 */

interface FeatureItem {
  text: string;
  href?: string;
}

interface FeatureCategory {
  icon: React.ReactNode;
  title: string;
  items: FeatureItem[];
}

export const culturaBuilderFeatures: FeatureCategory[] = [
  {
    icon: React.createElement(Target, { size: 28, strokeWidth: 1.5 }),
    title: 'Enterprise AI Assessment',
    items: [
      { text: 'ROI Calculator with verified data', href: '/assessment' },
      { text: 'Risk analysis framework' },
      { text: 'Board-ready executive reports' },
    ],
  },
  {
    icon: React.createElement(Users, { size: 28, strokeWidth: 1.5 }),
    title: 'Team Productivity',
    items: [
      { text: 'Voice coding adoption metrics' },
      { text: 'Developer experience tracking' },
      { text: 'Team velocity benchmarks' },
    ],
  },
  {
    icon: React.createElement(Code, { size: 28, strokeWidth: 1.5 }),
    title: 'Development Velocity',
    items: [
      { text: 'AI coding tools comparison' },
      { text: 'Implementation roadmaps' },
      { text: 'Best practices library' },
    ],
  },
  {
    icon: React.createElement(Lightbulb, { size: 28, strokeWidth: 1.5 }),
    title: 'Innovation Metrics',
    items: [
      { text: 'Time-to-market reduction' },
      { text: 'Feature velocity analysis' },
      { text: 'Competitive advantage tracking' },
    ],
  },
  {
    icon: React.createElement(DollarSign, { size: 28, strokeWidth: 1.5 }),
    title: 'Financial Analysis',
    items: [
      { text: 'Conservative ROI models' },
      { text: 'Cost savings calculator' },
      { text: 'Payback period analysis' },
    ],
  },
  {
    icon: React.createElement(Shield, { size: 28, strokeWidth: 1.5 }),
    title: 'Security & Compliance',
    items: [
      { text: 'Data governance frameworks' },
      { text: 'Compliance automation' },
      { text: 'Audit trail generation' },
    ],
  },
];

export const minimalPageTitle = (
  <>
    Built for{' '}
    <span className="font-light italic text-gray-700">enterprise leaders</span>
  </>
);

export const minimalPageSubtitle =
  'Enterprise AI readiness assessment based on verified research from McKinsey, Forrester, DORA, and GitHub. Conservative estimates, defensive assumptions.';
