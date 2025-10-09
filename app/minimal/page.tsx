'use client';

import Link from 'next/link';
import { ArrowLeft, Target } from 'lucide-react';

export default function MinimalPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-light text-gray-900">
              CulturaBuilder
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-light text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Home
              </Link>
              <Link
                href="/assessment"
                className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Start Assessment
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            Built for <span className="italic text-gray-700">enterprise leaders</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enterprise AI readiness assessment based on verified research from McKinsey, Forrester, DORA, and GitHub.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6">
            <div className="mb-4">
              <Target size={28} className="text-gray-900" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Enterprise AI Assessment
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>ROI Calculator with verified data</li>
              <li>Risk analysis framework</li>
              <li>Board-ready executive reports</li>
            </ul>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <Target size={28} className="text-gray-900" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Team Productivity
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>Voice coding adoption metrics</li>
              <li>Developer experience tracking</li>
              <li>Team velocity benchmarks</li>
            </ul>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <Target size={28} className="text-gray-900" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Development Velocity
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>AI coding tools comparison</li>
              <li>Implementation roadmaps</li>
              <li>Best practices library</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Start Free Assessment
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 CulturaBuilder. All data based on verifiable research.
          </p>
        </div>
      </footer>
    </div>
  );
}
