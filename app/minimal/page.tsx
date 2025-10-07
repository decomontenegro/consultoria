'use client';

import { FeatureGridMinimal } from '@/components/ui/feature-minimal';
import {
  culturaBuilderFeatures,
  minimalPageTitle,
  minimalPageSubtitle,
} from '@/data/culturabuilder-features-minimal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Minimal Clean landing page for CulturaBuilder
 * Uses light theme (white background) as a contrast to the main dark/neon theme
 */
export default function MinimalPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple light header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-2xl font-light text-gray-900 tracking-tight hover:text-gray-700 transition-colors"
            >
              CulturaBuilder
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Home
              </Link>
              <Link
                href="/assessment"
                className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                Start Assessment
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Minimal Feature Grid Section */}
      <FeatureGridMinimal
        title={minimalPageTitle}
        subtitle={minimalPageSubtitle}
        illustrationSrc="https://tally.so/images/demo/v2/designed-for-you.png"
        illustrationAlt="CulturaBuilder Enterprise AI Assessment"
        categories={culturaBuilderFeatures}
        buttonText="Start Free Assessment"
        buttonHref="/assessment"
      />

      {/* Simple light footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-medium text-gray-900 mb-4">CulturaBuilder</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                A maior comunidade de builders do Brasil. Transformando
                empresas através de AI e voice coding.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Research</h4>
              <ul className="space-y-2 text-sm text-gray-600 font-light">
                <li>McKinsey GenAI Report 2024</li>
                <li>Forrester TEI Studies</li>
                <li>DORA DevOps Reports</li>
                <li>GitHub Octoverse 2024</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://culturabuilder.com"
                    target="_blank"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-light"
                  >
                    Comunidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/assessment"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-light"
                  >
                    Assessment
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-light"
                  >
                    Dark Theme Version
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-500 text-sm font-light">
              © 2025 CulturaBuilder. All data based on verifiable research.
            </p>
            <p className="text-gray-400 text-xs mt-2 font-light">
              Transparent and auditable methodology • McKinsey • Forrester •
              DORA • GitHub
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
