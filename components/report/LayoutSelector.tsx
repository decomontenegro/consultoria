/**
 * LayoutSelector Component
 *
 * Allows users to switch between different report layout variants
 */

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { LayoutDashboard, SidebarOpen, ChevronDown, Grid3x3, BookOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export type LayoutType = 'default' | 'tabs' | 'sidebar' | 'accordion' | 'modular' | 'story';

interface LayoutOption {
  id: LayoutType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const layoutOptions: LayoutOption[] = [
  {
    id: 'sidebar',
    name: 'Navegação Lateral',
    description: 'Sidebar fixa com navegação scroll-spy',
    icon: SidebarOpen
  },
  {
    id: 'tabs',
    name: 'Dashboard com Abas',
    description: 'Seções organizadas em 4 abas temáticas',
    icon: LayoutDashboard
  },
  {
    id: 'accordion',
    name: 'Acordeão',
    description: 'Seções expansíveis/colapsáveis',
    icon: ChevronDown
  },
  {
    id: 'modular',
    name: 'Dashboard Modular',
    description: 'Cards modulares em grade responsiva',
    icon: Grid3x3
  },
  {
    id: 'story',
    name: 'Narrativa',
    description: 'Apresentação em capítulos sequenciais',
    icon: BookOpen
  },
  {
    id: 'default',
    name: 'Padrão',
    description: 'Layout tradicional com todas as seções visíveis',
    icon: LayoutDashboard
  }
];

export default function LayoutSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLayout = (searchParams.get('layout') as LayoutType) || 'sidebar'; // Default changed to sidebar
  const currentOption = layoutOptions.find((opt) => opt.id === currentLayout) || layoutOptions.find((opt) => opt.id === 'sidebar')!;

  const handleLayoutChange = (layoutId: LayoutType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (layoutId === 'sidebar') {
      // Sidebar is now the default, so remove the parameter
      params.delete('layout');
    } else {
      params.set('layout', layoutId);
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          inline-flex items-center gap-2 px-4 py-2
          bg-tech-gray-800 hover:bg-tech-gray-700
          border border-tech-gray-700 hover:border-neon-cyan/50
          rounded-lg
          text-sm font-medium text-tech-gray-200
          transition-all duration-200
        "
      >
        <CurrentIcon className="w-4 h-4 text-neon-cyan" />
        <span className="hidden sm:inline">{currentOption.name}</span>
        <span className="sm:hidden">Layout</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="
          absolute right-0 mt-2 w-72
          bg-tech-gray-900 border border-tech-gray-700
          rounded-lg shadow-2xl shadow-black/50
          z-50
          animate-fade-in
        ">
          <div className="p-2">
            <div className="px-3 py-2 mb-2 border-b border-tech-gray-700">
              <p className="text-xs font-semibold text-tech-gray-400 uppercase tracking-wider">
                Escolha o Layout
              </p>
            </div>

            <div className="space-y-1">
              {layoutOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = option.id === currentLayout;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleLayoutChange(option.id)}
                    className={`
                      w-full flex items-start gap-3 px-3 py-3 rounded-lg
                      text-left transition-all duration-200
                      ${isSelected
                        ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-green/20 border border-neon-cyan/50'
                        : 'hover:bg-tech-gray-800'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-neon-cyan' : 'text-tech-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${isSelected ? 'text-neon-cyan' : 'text-tech-gray-200'}`}>
                        {option.name}
                      </div>
                      <div className="text-xs text-tech-gray-400 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 w-2 h-2 bg-neon-cyan rounded-full mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
