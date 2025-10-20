/**
 * Single Choice Input - Radio Button Style
 *
 * For questions where user can select only one option.
 * Includes "Outro" option if allowOther is true.
 */

'use client';

import { useState } from 'react';
import { QuestionOption } from '@/lib/types';
import { Check } from 'lucide-react';

interface SingleChoiceInputProps {
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
  allowOther?: boolean;
  disabled?: boolean;
}

export default function SingleChoiceInput({
  options,
  value,
  onChange,
  allowOther = false,
  disabled = false
}: SingleChoiceInputProps) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState('');

  const handleOptionClick = (optionValue: string) => {
    if (disabled) return;

    if (optionValue === '__other__') {
      setShowOtherInput(true);
      onChange('');
    } else {
      setShowOtherInput(false);
      onChange(optionValue);
    }
  };

  const handleOtherSubmit = () => {
    if (otherValue.trim()) {
      onChange(otherValue.trim());
    }
  };

  return (
    <div className="space-y-3">
      {/* Options */}
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => handleOptionClick(option.value)}
            disabled={disabled}
            className={`
              w-full text-left p-4 rounded-lg border-2 transition-all
              ${isSelected
                ? 'border-neon-green bg-neon-green/10'
                : 'border-tech-gray-700 bg-tech-gray-800/30 hover:border-tech-gray-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-3">
              {/* Radio Circle */}
              <div className={`
                flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
                ${isSelected
                  ? 'border-neon-green bg-neon-green'
                  : 'border-tech-gray-600'
                }
              `}>
                {isSelected && (
                  <Check className="w-3 h-3 text-tech-gray-900" strokeWidth={3} />
                )}
              </div>

              <div className="flex-1">
                <div className={`font-medium ${isSelected ? 'text-neon-green' : 'text-white'}`}>
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-sm text-tech-gray-400 mt-1">
                    {option.description}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}

      {/* Other Option */}
      {allowOther && (
        <div>
          <button
            onClick={() => handleOptionClick('__other__')}
            disabled={disabled}
            className={`
              w-full text-left p-4 rounded-lg border-2 transition-all
              ${showOtherInput
                ? 'border-neon-green bg-neon-green/10'
                : 'border-tech-gray-700 bg-tech-gray-800/30 hover:border-tech-gray-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
                ${showOtherInput
                  ? 'border-neon-green bg-neon-green'
                  : 'border-tech-gray-600'
                }
              `}>
                {showOtherInput && (
                  <Check className="w-3 h-3 text-tech-gray-900" strokeWidth={3} />
                )}
              </div>
              <div className="flex-1 font-medium text-white">
                Outro (especificar)
              </div>
            </div>
          </button>

          {/* Other Input Field */}
          {showOtherInput && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleOtherSubmit()}
                placeholder="Digite aqui..."
                className="input-dark flex-1"
                autoFocus
                disabled={disabled}
              />
              <button
                onClick={handleOtherSubmit}
                disabled={!otherValue.trim() || disabled}
                className="btn-primary px-4 disabled:opacity-50"
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
