/**
 * Question Renderer - Hybrid Mode UI
 *
 * Renders different input types based on question configuration:
 * - text: Traditional text input
 * - single-choice: Radio buttons
 * - multi-choice: Checkboxes (max 3)
 * - quick-chips: Quick selection chips/tags
 */

'use client';

import { QuestionTemplate } from '@/lib/types';
import SingleChoiceInput from './SingleChoiceInput';
import MultiChoiceInput from './MultiChoiceInput';
import QuickChipsInput from './QuickChipsInput';

interface QuestionRendererProps {
  question: QuestionTemplate;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  disabled = false
}: QuestionRendererProps) {

  switch (question.inputType) {
    case 'single-choice':
      return (
        <SingleChoiceInput
          options={question.options || []}
          value={Array.isArray(value) ? value[0] : value}
          onChange={(val) => onChange(val)}
          allowOther={question.allowOther}
          disabled={disabled}
        />
      );

    case 'multi-choice':
      return (
        <MultiChoiceInput
          options={question.options || []}
          value={Array.isArray(value) ? value : [value]}
          onChange={(val) => onChange(val)}
          maxSelections={3}
          disabled={disabled}
        />
      );

    case 'quick-chips':
      return (
        <QuickChipsInput
          options={question.options || []}
          value={Array.isArray(value) ? value : [value]}
          onChange={(val) => onChange(val)}
          disabled={disabled}
        />
      );

    case 'text':
    default:
      return (
        <input
          type="text"
          value={Array.isArray(value) ? value.join(', ') : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || 'Digite sua resposta...'}
          className="input-dark w-full"
          disabled={disabled}
          autoFocus
        />
      );
  }
}
