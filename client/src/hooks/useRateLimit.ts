import { useState, useCallback, useEffect } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitState {
  attempts: number;
  isBlocked: boolean;
  remainingTime: number;
  canAttempt: boolean;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 5 * 60 * 1000, // 5 minutes
};

export function useRateLimit(key: string, config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const storageKey = `rateLimit_${key}`;

  const [state, setState] = useState<RateLimitState>(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return {
        attempts: 0,
        isBlocked: false,
        remainingTime: 0,
        canAttempt: true,
      };
    }

    try {
      const data = JSON.parse(stored);
      const now = Date.now();
      
      // Check if we're still blocked
      if (data.blockedUntil && now < data.blockedUntil) {
        return {
          attempts: data.attempts,
          isBlocked: true,
          remainingTime: Math.ceil((data.blockedUntil - now) / 1000),
          canAttempt: false,
        };
      }

      // Check if window has expired
      if (data.windowStart && now - data.windowStart > finalConfig.windowMs) {
        // Reset attempts if window expired
        localStorage.removeItem(storageKey);
        return {
          attempts: 0,
          isBlocked: false,
          remainingTime: 0,
          canAttempt: true,
        };
      }

      return {
        attempts: data.attempts || 0,
        isBlocked: false,
        remainingTime: 0,
        canAttempt: data.attempts < finalConfig.maxAttempts,
      };
    } catch {
      localStorage.removeItem(storageKey);
      return {
        attempts: 0,
        isBlocked: false,
        remainingTime: 0,
        canAttempt: true,
      };
    }
  });

  // Countdown timer for blocked state
  useEffect(() => {
    if (!state.isBlocked || state.remainingTime <= 0) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.remainingTime <= 1) {
          // Unblock and reset
          localStorage.removeItem(storageKey);
          return {
            attempts: 0,
            isBlocked: false,
            remainingTime: 0,
            canAttempt: true,
          };
        }

        return {
          ...prev,
          remainingTime: prev.remainingTime - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isBlocked, state.remainingTime, storageKey]);

  const recordAttempt = useCallback((wasSuccessful: boolean = false) => {
    const now = Date.now();
    
    if (wasSuccessful) {
      // Success - reset attempts
      localStorage.removeItem(storageKey);
      setState({
        attempts: 0,
        isBlocked: false,
        remainingTime: 0,
        canAttempt: true,
      });
      return;
    }

    // Failed attempt
    setState(prev => {
      const newAttempts = prev.attempts + 1;
      const shouldBlock = newAttempts >= finalConfig.maxAttempts;
      
      const data = {
        attempts: newAttempts,
        windowStart: now,
        ...(shouldBlock && { blockedUntil: now + finalConfig.blockDurationMs }),
      };

      localStorage.setItem(storageKey, JSON.stringify(data));

      return {
        attempts: newAttempts,
        isBlocked: shouldBlock,
        remainingTime: shouldBlock ? Math.ceil(finalConfig.blockDurationMs / 1000) : 0,
        canAttempt: !shouldBlock,
      };
    });
  }, [storageKey, finalConfig.maxAttempts, finalConfig.blockDurationMs]);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState({
      attempts: 0,
      isBlocked: false,
      remainingTime: 0,
      canAttempt: true,
    });
  }, [storageKey]);

  const getBlockMessage = useCallback(() => {
    if (!state.isBlocked) return null;
    
    const minutes = Math.floor(state.remainingTime / 60);
    const seconds = state.remainingTime % 60;
    
    if (minutes > 0) {
      return `Too many login attempts. Please try again in ${minutes}m ${seconds}s.`;
    }
    
    return `Too many login attempts. Please try again in ${seconds}s.`;
  }, [state.isBlocked, state.remainingTime]);

  const getWarningMessage = useCallback(() => {
    if (state.isBlocked || state.attempts === 0) return null;
    
    const remaining = finalConfig.maxAttempts - state.attempts;
    if (remaining === 1) {
      return `Warning: 1 attempt remaining before temporary lockout.`;
    }
    
    return `Warning: ${remaining} attempts remaining before temporary lockout.`;
  }, [state.attempts, state.isBlocked, finalConfig.maxAttempts]);

  return {
    ...state,
    recordAttempt,
    reset,
    getBlockMessage,
    getWarningMessage,
  };
}