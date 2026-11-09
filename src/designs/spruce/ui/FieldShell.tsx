import React, { useId, forwardRef } from 'react';
import { X, Check } from 'lucide-react';

export interface FieldShellProps {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FieldShell({ label, error, hint, children, className = '', id }: FieldShellProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="sp-caption text-sp-body font-medium">
          {label}
        </label>
      )}
      <div
        className={`bg-sp-surface border rounded-sp-xs transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-sp-primary-text ${
          error ? 'border-sp-error-text' : 'border-sp-field'
        }`}
      >
        {children}
      </div>
      {error && (
        <p id={errorId} role="alert" className="sp-caption text-sp-error-text flex items-center gap-1 mt-0.5">
          <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="sp-caption text-sp-muted mt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
}

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const fallbackId = useId();
    const inputId = id || fallbackId;
    const errorId = `${inputId}-error`;

    return (
      <FieldShell label={label} error={error} hint={hint} id={inputId}>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full h-12 bg-transparent border-0 outline-none sp-body text-sp-ink placeholder:text-sp-muted px-3.5 ${className}`}
          {...props}
        />
      </FieldShell>
    );
  }
);
TextInput.displayName = 'TextInput';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const fallbackId = useId();
    const inputId = id || fallbackId;
    const errorId = `${inputId}-error`;

    return (
      <FieldShell label={label} error={error} hint={hint} id={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full min-h-[160px] py-3 bg-transparent border-0 outline-none sp-body text-sp-ink placeholder:text-sp-muted px-3.5 resize-y ${className}`}
          {...props}
        />
      </FieldShell>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, children, className = '', id, ...props }, ref) => {
    const fallbackId = useId();
    const inputId = id || fallbackId;
    const errorId = `${inputId}-error`;

    return (
      <FieldShell label={label} error={error} hint={hint} id={inputId}>
        <select
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full h-12 bg-transparent border-0 outline-none sp-body text-sp-ink px-3.5 cursor-pointer ${className}`}
          {...props}
        >
          {options ? options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-sp-surface text-sp-ink">
              {opt.label}
            </option>
          )) : children}
        </select>
      </FieldShell>
    );
  }
);
Select.displayName = 'Select';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  sublabel?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, sublabel, checked, className = '', id, onChange, ...props }, ref) => {
    const fallbackId = useId();
    const inputId = id || fallbackId;

    return (
      <label htmlFor={inputId} className={`inline-flex items-start gap-3 cursor-pointer select-none group ${className}`}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div className="w-5 h-5 rounded-sp-xs border border-sp-field bg-sp-surface peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sp-primary-text peer-checked:bg-sp-primary peer-checked:border-sp-primary flex items-center justify-center transition-colors">
            {checked && <Check className="w-3.5 h-3.5 text-sp-on-primary stroke-[3]" />}
          </div>
        </div>
        {(label || sublabel) && (
          <div className="flex flex-col">
            {label && <span className="sp-body-sm font-medium text-sp-ink leading-tight">{label}</span>}
            {sublabel && <span className="sp-caption text-sp-muted">{sublabel}</span>}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  sublabel?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, sublabel, checked, className = '', id, ...props }, ref) => {
    const fallbackId = useId();
    const inputId = id || fallbackId;

    return (
      <label htmlFor={inputId} className={`inline-flex items-start gap-3 cursor-pointer select-none group ${className}`}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="radio"
            id={inputId}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div className="w-5 h-5 rounded-full border border-sp-field bg-sp-surface peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sp-primary-text peer-checked:border-sp-primary flex items-center justify-center transition-colors">
            {checked && <div className="w-2.5 h-2.5 rounded-full bg-sp-primary" />}
          </div>
        </div>
        {(label || sublabel) && (
          <div className="flex flex-col">
            {label && <span className="sp-body-sm font-medium text-sp-ink leading-tight">{label}</span>}
            {sublabel && <span className="sp-caption text-sp-muted">{sublabel}</span>}
          </div>
        )}
      </label>
    );
  }
);
Radio.displayName = 'Radio';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, id, className = '' }: ToggleProps) {
  const fallbackId = useId();
  const toggleId = id || fallbackId;

  return (
    <label htmlFor={toggleId} className={`inline-flex items-center gap-3 cursor-pointer select-none ${className}`}>
      <div className="relative inline-block w-11 h-6">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 rounded-full border border-sp-field bg-sp-canvas-soft peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sp-primary-text peer-checked:bg-sp-primary peer-checked:border-sp-primary transition-colors" />
        <div
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </div>
      {label && <span className="sp-body-sm text-sp-ink">{label}</span>}
    </label>
  );
}
