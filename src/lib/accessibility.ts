/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 * Ensures all components meet web accessibility standards
 */

/**
 * Generate unique ID for associating labels with form controls
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if keyboard event is Enter
 * Accounts for IME composition on mobile devices
 */
export function isEnterKey(event: React.KeyboardEvent): boolean {
  // Don't trigger on Enter during IME composition
  // (CJK input methods)
  if (event.nativeEvent.isComposing) return false;
  
  // Safari Desktop has unreliable final composition event
  // where keyCode is 229 before actual Enter is pressed
  if ((event as any).keyCode === 229) return false;

  return event.key === 'Enter';
}

/**
 * Check if keyboard event is Escape
 */
export function isEscapeKey(event: React.KeyboardEvent): boolean {
  return event.key === 'Escape';
}

/**
 * Get ARIA label attributes for screen readers
 */
export const AriaLabel = {
  /**
   * Full label visible and hidden from screen readers
   */
  visible: (text: string) => ({
    'aria-label': text,
  }),

  /**
   * Hidden from sighted users, visible to screen readers
   * Use with sr-only CSS class
   */
  hidden: (text: string) => ({
    className: 'sr-only',
    children: text,
  }),

  /**
   * Describes an element
   */
  describedBy: (id: string) => ({
    'aria-describedby': id,
  }),

  /**
   * Labels a group of elements
   */
  labelledBy: (id: string) => ({
    'aria-labelledby': id,
  }),
};

/**
 * ARIA live region attributes for dynamic content
 */
export const AriaLiveRegion = {
  /**
   * Polite (default) - waits until current speech is finished
   */
  polite: {
    'aria-live': 'polite',
    'aria-atomic': 'true',
  },

  /**
   * Assertive - interrupts current speech
   * Use for important alerts only
   */
  assertive: {
    'aria-live': 'assertive',
    'aria-atomic': 'true',
  },

  /**
   * Off - no announcement
   */
  off: {
    'aria-live': 'off',
  },
};

/**
 * Common ARIA attributes
 */
export const AriaAttributes = {
  /**
   * For loading states
   */
  busy: {
    'aria-busy': 'true',
    'aria-label': 'Loading...',
  },

  /**
   * For disabled elements
   */
  disabled: {
    'aria-disabled': 'true',
  },

  /**
   * For expanded/collapsed states
   */
  expanded: (isExpanded: boolean) => ({
    'aria-expanded': isExpanded,
  }),

  /**
   * For selected states
   */
  selected: (isSelected: boolean) => ({
    'aria-selected': isSelected,
  }),

  /**
   * For checked states
   */
  checked: (isChecked: boolean) => ({
    'aria-checked': isChecked,
  }),

  /**
   * For required form fields
   */
  required: {
    'aria-required': 'true',
    required: true,
  },

  /**
   * For invalid form fields
   */
  invalid: (hasError: boolean) => ({
    'aria-invalid': hasError,
  }),
};

/**
 * Focus management utilities
 */
export const FocusManagement = {
  /**
   * Focus element on mount (use in useEffect)
   */
  focusElement: (element: HTMLElement | null) => {
    element?.focus();
  },

  /**
   * Focus first interactive element
   */
  focusFirstElement: (container: HTMLElement | null) => {
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const element = container?.querySelector(focusableSelectors) as HTMLElement;
    element?.focus();
  },

  /**
   * Trap focus within element (for modals)
   */
  trapFocus: (event: KeyboardEvent, container: HTMLElement) => {
    if (event.key !== 'Tab') return;

    const focusableSelector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusableElements = Array.from(
      container.querySelectorAll(focusableSelector)
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift+Tab on first element - focus last
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab on last element - focus first
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  },
};

/**
 * Semantic HTML helpers
 */
export const SemanticHtml = {
  /**
   * Use <main> for primary content
   */
  main: (props: React.HTMLAttributes<HTMLElement>) => ({
    ...props,
    role: 'main',
  }),

  /**
   * Use <header> for introductory content
   */
  header: (props: React.HTMLAttributes<HTMLElement>) => ({
    ...props,
    role: 'banner',
  }),

  /**
   * Use <nav> for navigation
   */
  nav: (props: React.HTMLAttributes<HTMLElement>) => ({
    ...props,
    role: 'navigation',
  }),

  /**
   * Use <aside> for complementary content
   */
  aside: (props: React.HTMLAttributes<HTMLElement>) => ({
    ...props,
    role: 'complementary',
  }),

  /**
   * Use <footer> for footer content
   */
  footer: (props: React.HTMLAttributes<HTMLElement>) => ({
    ...props,
    role: 'contentinfo',
  }),
};

/**
 * Color contrast checker (for WCAG compliance)
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Simple contrast ratio calculator
  // Returns ratio between 1:1 and 21:1
  // WCAG AA requires 4.5:1 for normal text

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standard
 */
export function meetsWcagAA(color1: string, color2: string, largeText = false): boolean {
  const ratio = getContrastRatio(color1, color2);
  // 4.5:1 for normal text, 3:1 for large text (18px+)
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate luminance of RGB color
 */
function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(value =>
    value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Skip links for keyboard navigation
 * Helps screen reader users and keyboard navigators skip repetitive content
 */
export const SkipLink = {
  /**
   * Hidden skip link that becomes visible on focus
   */
  component: () => ({
    className: 'sr-only focus:not-sr-only',
    href: '#main-content',
    children: 'Skip to main content',
  }),

  /**
   * Main content anchor
   */
  target: {
    id: 'main-content',
    tabIndex: -1,
  },
};

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const element = document.createElement('div');
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', priority);
  element.setAttribute('aria-atomic', 'true');
  element.className = 'sr-only';
  element.textContent = message;

  document.body.appendChild(element);

  // Remove after announcement
  setTimeout(() => {
    element.remove();
  }, 1000);
}
