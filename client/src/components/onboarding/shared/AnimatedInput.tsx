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
            isFocused ? 'text-indigo-600' : 'text-gray-700'
          } ${error ? 'text-red-500' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
            isFocused ? 'text-indigo-600' : 'text-gray-400'
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
            rounded-lg
            transition-all
            duration-200
            outline-none
            ${isFocused 
              ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-lg transform scale-[1.02]' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${error 
              ? 'border-red-500 focus:ring-red-200' 
              : ''
            }
            ${className}
          `}
        />
        
        {isFocused && !error && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg blur-xl opacity-20 animate-pulse"></div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`text-sm mt-1 transition-all duration-200 ${
          error ? 'text-red-500' : 'text-gray-500'
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
            isFocused ? 'text-indigo-600' : 'text-gray-700'
          } ${error ? 'text-red-500' : ''}`}
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
            rounded-lg
            transition-all
            duration-200
            outline-none
            resize-none
            ${isFocused 
              ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-lg transform scale-[1.02]' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${error 
              ? 'border-red-500 focus:ring-red-200' 
              : ''
            }
            ${className}
          `}
        />
        
        {isFocused && !error && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg blur-xl opacity-20 animate-pulse"></div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`text-sm mt-1 transition-all duration-200 ${
          error ? 'text-red-500' : 'text-gray-500'
        }`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};