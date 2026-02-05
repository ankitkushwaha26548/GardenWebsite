// Mobile & Responsive Optimization Config
// GardenWeb Frontend - Complete Responsive Design Setup

export const responsiveConfig = {
  // Breakpoints matching Tailwind defaults
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Touch target sizes (minimum 44px for accessibility)
  touchTargets: {
    button: '44px',
    input: '44px',
    link: '44px',
    tapArea: '44px',
  },

  // Spacing scale (matches Tailwind)
  spacing: {
    mobile: '1rem',      // p-4
    tablet: '1.5rem',    // p-6
    desktop: '2rem',     // p-8
  },

  // Responsive Typography
  typography: {
    h1: {
      mobile: 'clamp(1.875rem, 5vw, 3rem)',     // 2xl to 3xl
      tablet: 'clamp(2.25rem, 6vw, 4rem)',      // 3xl to 4xl
      desktop: '4rem',                           // 4xl
    },
    h2: {
      mobile: 'clamp(1.5rem, 4vw, 2.25rem)',    // xl to 2xl
      tablet: 'clamp(1.875rem, 5vw, 3rem)',     // 2xl to 3xl
      desktop: '3rem',                           // 3xl
    },
    body: {
      mobile: 'clamp(0.875rem, 2.5vw, 1rem)',   // sm to base
      tablet: 'clamp(1rem, 3vw, 1.125rem)',     // base to lg
      desktop: '1.125rem',                       // lg
    },
  },

  // Grid columns responsive
  gridColumns: {
    mobile: 1,      // Single column
    tablet: 2,      // Two columns
    desktop: 3,     // Three columns
    large: 4,       // Four columns (xl+)
  },

  // Gap sizes
  gaps: {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
  },

  // Container max widths
  containers: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Aspect ratios for images
  aspectRatios: {
    square: '1 / 1',
    video: '16 / 9',
    card: '1.2 / 1',
    thumbnail: '1.5 / 1',
  },

  // Animation settings (reduced motion support)
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    reduceMotion: {
      duration: '0ms',
      enabled: 'prefers-reduced-motion',
    },
  },

  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1001,
    fixed: 1020,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Responsive padding matrix
  padding: {
    mobile: { x: '1rem', y: '1rem' },     // px-4 py-4
    tablet: { x: '1.5rem', y: '1.5rem' }, // px-6 py-6
    desktop: { x: '2rem', y: '2rem' },    // px-8 py-8
  },

  // Mobile-first media queries
  media: {
    sm: '@media (min-width: 640px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',
    '2xl': '@media (min-width: 1536px)',
  },

  // Performance optimization settings
  performance: {
    lazyLoad: true,
    imageLazyLoad: true,
    scriptDefer: true,
    preloadCritical: true,
  },

  // Accessibility settings
  accessibility: {
    touchTargetMin: '44px',
    focusOutlineWidth: '2px',
    reduceMotionDefault: true,
    contrastRatio: 'WCAG AA',
  },

  // Mobile viewport settings
  viewport: {
    width: 'device-width',
    initialScale: 1.0,
    minimumScale: 1.0,
    maximumScale: 5.0,
    userScalable: true,
  },

  // Safe area insets (for notched devices)
  safeArea: {
    top: 'env(safe-area-inset-top)',
    right: 'env(safe-area-inset-right)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
  },

  // Responsive font weight
  fontWeight: {
    mobile: 400,    // Regular for mobile
    desktop: 500,   // Medium for desktop
  },

  // Line height responsive
  lineHeight: {
    mobile: 1.5,
    tablet: 1.6,
    desktop: 1.75,
  },

  // Color accessibility
  colors: {
    contrastPairs: [
      { foreground: '#FFFFFF', background: '#000000', ratio: 21 },
      { foreground: '#FFFFFF', background: '#0066CC', ratio: 8.6 },
      { foreground: '#000000', background: '#FFFFFF', ratio: 21 },
    ],
  },

  // Form input sizing
  formElements: {
    inputHeight: {
      mobile: '2.75rem',   // 44px min touch target
      desktop: '2.75rem',
    },
    buttonHeight: {
      mobile: '2.75rem',   // 44px min touch target
      desktop: '2.75rem',
    },
  },

  // Responsive image sizes
  imageSizes: {
    thumbnail: { mobile: '120px', desktop: '150px' },
    card: { mobile: '200px', desktop: '300px' },
    hero: { mobile: '280px', tablet: '400px', desktop: '600px' },
  },
};

// Helper function for responsive styles
export const getResponsiveSpacing = (mobile, tablet, desktop) => {
  return {
    mobile,
    tablet,
    desktop,
  };
};

// Helper function for touch target compliance
export const getTouchTargetStyles = (type = 'button') => {
  return {
    minHeight: '44px',
    minWidth: '44px',
    padding: '0.5rem 1rem',
  };
};

// Breakpoint helper
export const getBreakpointQuery = (breakpoint) => {
  const breakpoints = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
  };
  return `@media ${breakpoints[breakpoint]}`;
};

export default responsiveConfig;
