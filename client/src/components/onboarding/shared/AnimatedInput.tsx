import React, { useState } from 'react';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  error,
  icon,
  helperText,
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label 
          className={`block text-sm font-medium transition-colors duration-200 ${
            isFocused ? 'text-foreground' : 'text-muted-foreground'
          } ${error ? 'text-[hsl(var(--destructive))]' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
            isFocused ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground'
          }`}>
            {icon}
          </div>
        )}
        
        <input
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full
            ${icon ? 'pl-10' : 'px-4'}
            pr-4
            py-2.5
            border
            bg-background
            text-foreground
            rounded-lg
            transition-all
            duration-200
            outline-none
            ${isFocused 
              ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))/0.3] transform scale-[1.01]'
              : 'border-border'
            }
            ${error 
              ? 'border-[hsl(var(--destructive))] ring-1 ring-[hsl(var(--destructive))/0.3]'
              : ''
            }
            ${className}
          `}
        />
        
      </div>
      
      {(error || helperText) && (
        <p className={`text-sm mt-1 transition-all duration-200 ${
          error ? 'text-[hsl(var(--destructive))]' : 'text-muted-foreground'
        }`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export const AnimatedTextarea: React.FC<AnimatedInputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  label,
  error,
  helperText,
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label 
          className={`block text-sm font-medium transition-colors duration-200 ${
            isFocused ? 'text-foreground' : 'text-muted-foreground'
          } ${error ? 'text-[hsl(var(--destructive))]' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <textarea
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full
            px-4
            py-2.5
            border
            bg-background
            text-foreground
            rounded-lg
            transition-all
            duration-200
            outline-none
            resize-none
            ${isFocused 
              ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))/0.3] transform scale-[1.01]'
              : 'border-border'
            }
            ${error 
              ? 'border-[hsl(var(--destructive))] ring-1 ring-[hsl(var(--destructive))/0.3]'
              : ''
            }
            ${className}
          `}
        />
        
      </div>
      
      {(error || helperText) && (
        <p className={`text-sm mt-1 transition-all duration-200 ${
          error ? 'text-[hsl(var(--destructive))]' : 'text-muted-foreground'
        }`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};