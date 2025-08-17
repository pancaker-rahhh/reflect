import { useEffect } from 'react';
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

  useEffect(() => {
    if (!enabled) return;

    const shortcuts = [];

    if (onNext) {
      shortcuts.push({
        key: 'Enter',
        handler: onNext,
        description: 'Go to next step'
      });
    }

    if (onSubmit) {
      shortcuts.push({
        key: 'Enter',
        ctrl: true,
        handler: onSubmit,
        description: 'Submit form'
      });
    }

    if (onPrevious) {
      shortcuts.push({
        key: 'ArrowLeft',
        alt: true,
        handler: onPrevious,
        description: 'Go to previous step'
      });
    }

    if (onSkip) {
      shortcuts.push({
        key: 's',
        ctrl: true,
        handler: onSkip,
        description: 'Skip current step'
      });
    }

    if (onAddMember) {
      shortcuts.push({
        key: 'a',
        ctrl: true,
        handler: onAddMember,
        description: 'Add team member'
      });
    }

    shortcuts.forEach(shortcut => registerShortcut(shortcut));

    return () => {
      shortcuts.forEach(shortcut => unregisterShortcut(shortcut.key));
    };
  }, [enabled, onNext, onPrevious, onSkip, onSubmit, onAddMember, registerShortcut, unregisterShortcut]);
};