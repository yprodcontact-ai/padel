/**
 * Reusable utility for web haptic feedback (vibrations).
 * Safely guards against SSR and handles both standard Android (Vibration API)
 * and the iOS 18+ Taptic Engine workaround using a hidden switch input.
 */

const triggerIOSHaptic = () => {
  if (typeof document === 'undefined') return;

  let input = document.getElementById('haptic-switch') as HTMLInputElement | null;
  let label = document.getElementById('haptic-label') as HTMLLabelElement | null;

  if (!input) {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.id = 'haptic-switch';
    input.style.position = 'absolute';
    input.style.width = '1px';
    input.style.height = '1px';
    input.style.padding = '0';
    input.style.margin = '-1px';
    input.style.overflow = 'hidden';
    input.style.clip = 'rect(0, 0, 0, 0)';
    input.style.border = '0';
    input.style.display = 'none';

    label = document.createElement('label');
    label.id = 'haptic-label';
    label.htmlFor = 'haptic-switch';
    label.style.display = 'none';

    document.body.appendChild(input);
    document.body.appendChild(label);
  }

  if (label) {
    label.click();
  }
};

export const haptic = {
  /**
   * Subtle tick for sliders, dial ticks, bottom navigation tabs.
   */
  light: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    } else {
      triggerIOSHaptic();
    }
  },

  /**
   * Standard button click, toggle switch, selection confirmation.
   */
  medium: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    } else {
      triggerIOSHaptic();
    }
  },

  /**
   * Dynamic success confirmation.
   */
  success: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([40, 50, 40]);
    } else {
      // Trigger multiple close iOS haptics (iOS handles quick clicks gracefully in gesture)
      triggerIOSHaptic();
      setTimeout(triggerIOSHaptic, 100);
    }
  },

  /**
   * Soft warning pattern.
   */
  warning: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([50, 80, 50]);
    } else {
      triggerIOSHaptic();
      setTimeout(triggerIOSHaptic, 150);
    }
  },

  /**
   * Distinct error pattern.
   */
  error: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([60, 50, 60]);
    } else {
      triggerIOSHaptic();
      setTimeout(triggerIOSHaptic, 100);
      setTimeout(triggerIOSHaptic, 200);
    }
  }
};
