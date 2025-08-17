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

    const shortcuts = [];

    if (handlersRef.current.onNext) {
      shortcuts.push({
        key: 'Enter',
        handler: () => handlersRef.current.onNext?.(),
        description: 'Go to next step'
      });
    }

    if (handlersRef.current.onSubmit) {
      shortcuts.push({
        key: 'Enter',
        ctrl: true,
        handler: () => handlersRef.current.onSubmit?.(),
        description: 'Submit form'
      });
    }

    if (handlersRef.current.onPrevious) {
      shortcuts.push({
        key: 'ArrowLeft',
        alt: true,
        handler: () => handlersRef.current.onPrevious?.(),
        description: 'Go to previous step'
      });
    }

    if (handlersRef.current.onSkip) {
      shortcuts.push({
        key: 's',
        ctrl: true,
        handler: () => handlersRef.current.onSkip?.(),
        description: 'Skip current step'
      });
    }

    if (handlersRef.current.onAddMember) {
      shortcuts.push({
        key: 'a',
        ctrl: true,
        handler: () => handlersRef.current.onAddMember?.(),
        description: 'Add team member'
      });
    }

    shortcuts.forEach(shortcut => registerShortcut(shortcut));

    return () => {
      shortcuts.forEach(shortcut => unregisterShortcut(shortcut.key));
    };
  }, [enabled, registerShortcut, unregisterShortcut]);
};