/**
 * SectionModal Component
 *
 * Reusable modal for displaying detailed section content
 * Provides consistent modal structure across all report sections
 */

'use client';

import { ReactNode } from 'react';
import { X, LucideIcon, Info } from 'lucide-react';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw]'
};

export default function SectionModal({
  isOpen,
  onClose,
  title,
  icon: Icon = Info,
  children,
  footer,
  size = 'lg'
}: SectionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`
          relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto
          bg-gradient-to-br from-tech-gray-900 to-tech-gray-800
          border border-neon-cyan/30
          rounded-xl shadow-2xl shadow-neon-cyan/20
          animate-slide-up
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-tech-gray-900/95 backdrop-blur-sm border-b border-tech-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-green/20 border border-neon-cyan/30">
              <Icon className="w-6 h-6 text-neon-cyan" />
            </div>
            <h3 className="text-xl font-bold text-tech-gray-100">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="
              p-2 rounded-lg
              text-tech-gray-400 hover:text-tech-gray-200
              hover:bg-tech-gray-800
              transition-colors
            "
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="sticky bottom-0 px-6 py-4 bg-tech-gray-900/95 backdrop-blur-sm border-t border-tech-gray-700">
            {footer}
          </div>
        ) : (
          <div className="sticky bottom-0 px-6 py-4 bg-tech-gray-900/95 backdrop-blur-sm border-t border-tech-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="
                w-full px-4 py-2.5
                bg-gradient-to-r from-neon-cyan to-neon-green
                hover:from-neon-cyan/90 hover:to-neon-green/90
                rounded-lg
                text-sm font-medium text-tech-gray-900
                transition-all duration-200
              "
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Modal with tabbed content
 */
interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
}

interface TabbedSectionModalProps extends Omit<SectionModalProps, 'children'> {
  tabs: Tab[];
  defaultTab?: string;
}

export function TabbedSectionModal({
  isOpen,
  onClose,
  title,
  icon,
  tabs,
  defaultTab,
  footer,
  size = 'lg'
}: TabbedSectionModalProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  if (!isOpen) return null;

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <SectionModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      footer={footer}
      size={size}
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-tech-gray-700">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3
                border-b-2 transition-all duration-200
                ${activeTab === tab.id
                  ? 'border-neon-cyan text-neon-cyan font-semibold'
                  : 'border-transparent text-tech-gray-400 hover:text-tech-gray-200'
                }
              `}
            >
              {TabIcon && <TabIcon className="w-4 h-4" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="text-tech-gray-200 leading-relaxed">
        {activeTabContent}
      </div>
    </SectionModal>
  );
}

/**
 * Import React for useState
 */
import React from 'react';

/**
 * Comparison modal with side-by-side content
 */
interface ComparisonSectionModalProps extends Omit<SectionModalProps, 'children'> {
  leftTitle: string;
  leftContent: ReactNode;
  rightTitle: string;
  rightContent: ReactNode;
}

export function ComparisonSectionModal({
  isOpen,
  onClose,
  title,
  icon,
  leftTitle,
  leftContent,
  rightTitle,
  rightContent,
  footer
}: ComparisonSectionModalProps) {
  return (
    <SectionModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      footer={footer}
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-neon-cyan border-b border-tech-gray-700 pb-2">
            {leftTitle}
          </h4>
          <div className="text-tech-gray-200 leading-relaxed">
            {leftContent}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block absolute left-1/2 top-20 bottom-20 w-px bg-gradient-to-b from-transparent via-tech-gray-700 to-transparent" />

        {/* Right Side */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-neon-green border-b border-tech-gray-700 pb-2">
            {rightTitle}
          </h4>
          <div className="text-tech-gray-200 leading-relaxed">
            {rightContent}
          </div>
        </div>
      </div>
    </SectionModal>
  );
}

/**
 * Timeline modal for step-by-step content
 */
interface TimelineStep {
  id: string;
  title: string;
  description: ReactNode;
  icon?: LucideIcon;
}

interface TimelineSectionModalProps extends Omit<SectionModalProps, 'children'> {
  steps: TimelineStep[];
}

export function TimelineSectionModal({
  isOpen,
  onClose,
  title,
  icon,
  steps,
  footer
}: TimelineSectionModalProps) {
  return (
    <SectionModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      footer={footer}
      size="lg"
    >
      <div className="space-y-6">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <div key={step.id} className="flex gap-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className="
                  flex items-center justify-center
                  w-10 h-10 rounded-full
                  bg-gradient-to-br from-neon-cyan/20 to-neon-green/20
                  border-2 border-neon-cyan
                  text-neon-cyan font-bold
                ">
                  {StepIcon ? <StepIcon className="w-5 h-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 flex-1 min-h-[40px] bg-gradient-to-b from-neon-cyan/50 to-transparent mt-2" />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-8">
                <h4 className="text-lg font-semibold text-tech-gray-100 mb-2">
                  {step.title}
                </h4>
                <div className="text-tech-gray-300 leading-relaxed">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionModal>
  );
}
