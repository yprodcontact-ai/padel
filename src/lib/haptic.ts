/**
 * Reusable utility for web haptic feedback (vibrations).
 * Safely guards against SSR and browsers that do not support the Vibration API (e.g., iOS Safari in some modes).
 */

export const haptic = {
  /**
   * Subtle tick for sliders, dial ticks, bottom navigation tabs.
   */
  light: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Standard button click, toggle switch, selection confirmation.
   */
  medium: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  /**
   * Dynamic success confirmation (e.g., matching successfully created).
   */
  success: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([40, 50, 40]);
    }
  },

  /**
   * Soft warning pattern (e.g., user attempts operation that is near limits).
   */
  warning: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([50, 80, 50]);
    }
  },

  /**
   * Distinct error pattern (e.g., validation failed, action rejected).
   */
  error: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([60, 50, 60]);
    }
  }
};
