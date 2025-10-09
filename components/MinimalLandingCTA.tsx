import Link from 'next/link';
import { Sparkles } from 'lucide-react';

/**
 * Optional CTA component to promote the Minimal Clean landing page
 * Can be added to the main homepage (app/page.tsx) if desired
 *
 * Usage:
 * import MinimalLandingCTA from '@/components/MinimalLandingCTA';
 *
 * // Add before footer or after main content:
 * <MinimalLandingCTA />
 */
export default function MinimalLandingCTA() {
  return (
    <div className="border-t border-tech-gray-800 bg-background-card/20">
      <div className="container-professional py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-tech-gray-300 text-sm font-light mb-6">
            <Sparkles size={16} className="text-white" />
            <span>New Alternative Design</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-tech-gray-100 mb-4">
            Prefer a lighter aesthetic?
          </h3>

          <p className="text-tech-gray-400 mb-8 font-light">
            Experience our minimal clean version with a light theme and elegant typography.
          </p>

          <Link
            href="/minimal"
            className="inline-block px-8 py-4 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            View Minimal Version →
          </Link>
        </div>
      </div>
    </div>
  );
}
