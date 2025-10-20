/**
 * Multi Choice Input - Checkbox Style
 *
 * For questions where user can select multiple options (up to max).
 * Visual feedback shows selection count and limit.
 */

'use client';

import { QuestionOption } from '@/lib/types';
import { Check } from 'lucide-react';

interface MultiChoiceInputProps {
  options: QuestionOption[];
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
  disabled?: boolean;
}

export default function MultiChoiceInput({
  options,
  value,
  onChange,
  maxSelections = 3,
  disabled = false
}: MultiChoiceInputProps) {

  const handleToggle = (optionValue: string) => {
    if (disabled) return;

    const isSelected = value.includes(optionValue);

    if (isSelected) {
      // Remove from selection
      onChange(value.filter(v => v !== optionValue));
    } else {
      // Add to selection (if not at limit)
      if (value.length < maxSelections) {
        onChange([...value, optionValue]);
      }
    }
  };

  const isAtLimit = value.length >= maxSelections;

  return (
    <div className="space-y-3">
      {/* Selection Counter */}
      <div className="text-sm text-tech-gray-400 mb-4">
        {value.length > 0 ? (
          <span>
            {value.length} de {maxSelections} selecionado(s)
            {isAtLimit && <span className="text-neon-cyan ml-2">• Limite atingido</span>}
          </span>
        ) : (
          <span>Selecione até {maxSelections} opções</span>
        )}
      </div>

      {/* Options */}
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        const isDisabledOption = disabled || (!isSelected && isAtLimit);

        return (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            disabled={isDisabledOption}
            className={`
              w-full text-left p-4 rounded-lg border-2 transition-all
              ${isSelected
                ? 'border-neon-green bg-neon-green/10'
                : isDisabledOption
                  ? 'border-tech-gray-800 bg-tech-gray-900/30 opacity-50'
                  : 'border-tech-gray-700 bg-tech-gray-800/30 hover:border-tech-gray-600'
              }
              ${isDisabledOption ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <div className={`
                flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                ${isSelected
                  ? 'border-neon-green bg-neon-green'
                  : isDisabledOption
                    ? 'border-tech-gray-800'
                    : 'border-tech-gray-600'
                }
              `}>
                {isSelected && (
                  <Check className="w-3 h-3 text-tech-gray-900" strokeWidth={3} />
                )}
              </div>

              <div className="flex-1">
                <div className={`
                  font-medium
                  ${isSelected ? 'text-neon-green' : isDisabledOption ? 'text-tech-gray-600' : 'text-white'}
                `}>
                  {option.label}
                </div>
                {option.description && (
                  <div className={`
                    text-sm mt-1
                    ${isDisabledOption ? 'text-tech-gray-700' : 'text-tech-gray-400'}
                  `}>
                    {option.description}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}

      {/* Helper text */}
      {isAtLimit && (
        <div className="text-xs text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-3 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Desmarque uma opção para selecionar outra.</span>
        </div>
      )}
    </div>
  );
}
