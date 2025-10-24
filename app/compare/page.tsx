import { Suspense } from 'react';
import ComparePageClient from '@/components/compare/ComparePageClient';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neon-cyan border-r-transparent"></div>
          <p className="mt-4 text-tech-gray-400">Carregando comparação...</p>
        </div>
      </div>
    }>
      <ComparePageClient />
    </Suspense>
  );
}
