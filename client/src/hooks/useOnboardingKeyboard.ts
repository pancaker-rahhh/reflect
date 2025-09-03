import { useEffect, useRef } from 'react';
import { useKeyboardShortcuts } from '../context/KeyboardShortcutContext';

interface OnboardingKeyboardOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  onSubmit?: () => void;
  onAddMember?: () => void;
  enabled?: boolean;
}

export const useOnboardingKeyboard = ({
  onNext,
  onPrevious,
  onSkip,
  onSubmit,
  onAddMember,
  enabled = true
}: OnboardingKeyboardOptions) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  
  // Use refs to store latest function references
  const handlersRef = useRef({
    onNext,
    onPrevious,
    onSkip,
    onSubmit,
    onAddMember
  });

  // Update refs when handlers change
  handlersRef.current = {
    onNext,
    onPrevious,
    onSkip,
    onSubmit,
    onAddMember
  };

  useEffect(() => {
    if (!enabled) return;

    const shortcuts: Array<{ key: string; handler: () => void }> = [];

    if (handlersRef.current.onNext) {
      shortcuts.push({
        key: 'Enter',
        handler: () => handlersRef.current.onNext?.()
      });
    }

    if (handlersRef.current.onSubmit) {
      shortcuts.push({
        key: 'Enter',
        handler: () => handlersRef.current.onSubmit?.()
      });
    }

    if (handlersRef.current.onPrevious) {
      shortcuts.push({
        key: 'ArrowLeft',
        handler: () => handlersRef.current.onPrevious?.()
      });
    }

    if (handlersRef.current.onSkip) {
      shortcuts.push({
        key: 's',
        handler: () => handlersRef.current.onSkip?.()
      });
    }

    if (handlersRef.current.onAddMember) {
      shortcuts.push({
        key: 'a',
        handler: () => handlersRef.current.onAddMember?.()
      });
    }

    shortcuts.forEach(shortcut => registerShortcut(shortcut));

    return () => {
      shortcuts.forEach(shortcut => unregisterShortcut(shortcut.key));
    };
  }, [enabled, registerShortcut, unregisterShortcut]);
};