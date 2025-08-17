import React, { createContext, useContext, useEffect, useCallback } from 'react';

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description?: string;
}

interface KeyboardShortcutContextType {
  registerShortcut: (shortcut: ShortcutHandler) => void;
  unregisterShortcut: (key: string) => void;
  shortcuts: ShortcutHandler[];
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType | undefined>(undefined);

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutProvider');
  }
  return context;
};

export const KeyboardShortcutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = React.useState<ShortcutHandler[]>([]);

  const registerShortcut = useCallback((shortcut: ShortcutHandler) => {
    setShortcuts(prev => [...prev.filter(s => s.key !== shortcut.key), shortcut]);
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputField = activeElement?.tagName === 'INPUT' || 
                          activeElement?.tagName === 'TEXTAREA' ||
                          (activeElement as HTMLElement)?.contentEditable === 'true';

      shortcuts.forEach(shortcut => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (shortcut.key === 'Enter' && !shortcut.ctrl && isInputField) {
            return;
          }
          
          if (shortcut.key === 'Escape' || (shortcut.ctrl && shortcut.key === 'Enter')) {
            event.preventDefault();
            shortcut.handler();
          } else if (!isInputField) {
            event.preventDefault();
            shortcut.handler();
          }
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <KeyboardShortcutContext.Provider value={{ registerShortcut, unregisterShortcut, shortcuts }}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
};