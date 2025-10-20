/**
 * Quick Chips Input - Tag Style
 *
 * For quick selections with compact, chip-style buttons.
 * Good for simple choices like Yes/No, timeframes, etc.
 */

'use client';

import { QuestionOption } from '@/lib/types';
import { Check } from 'lucide-react';

interface QuickChipsInputProps {
  options: QuestionOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multiSelect?: boolean;
  disabled?: boolean;
}

export default function QuickChipsInput({
  options,
  value,
  onChange,
  multiSelect = false,
  disabled = false
}: QuickChipsInputProps) {

  const handleChipClick = (optionValue: string) => {
    if (disabled) return;

    if (multiSelect) {
      // Multi-select mode
      const isSelected = value.includes(optionValue);
      if (isSelected) {
        onChange(value.filter(v => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    } else {
      // Single-select mode
      onChange([optionValue]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Chips Grid */}
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = value.includes(option.value);

          return (
            <button
              key={option.value}
              onClick={() => handleChipClick(option.value)}
              disabled={disabled}
              className={`
                px-5 py-3 rounded-full border-2 transition-all font-medium
                flex items-center gap-2
                ${isSelected
                  ? 'border-neon-green bg-neon-green/20 text-neon-green'
                  : 'border-tech-gray-700 bg-tech-gray-800/50 text-white hover:border-tech-gray-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isSelected && (
                <Check className="w-4 h-4" strokeWidth={3} />
              )}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Descriptions (if any selected) */}
      {value.length > 0 && (
        <div className="space-y-2">
          {options
            .filter(opt => value.includes(opt.value) && opt.description)
            .map(opt => (
              <div
                key={opt.value}
                className="text-sm text-tech-gray-400 bg-tech-gray-800/30 rounded-lg p-3 border border-tech-gray-800"
              >
                <span className="text-neon-green font-medium">{opt.label}:</span> {opt.description}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
