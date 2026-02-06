/**
 * SES (Secure EcmaScript) Detection and Mitigation Utilities
 *
 * This module detects if SES lockdown is active (commonly injected by browser extensions
 * like MetaMask) and provides workarounds for PDF.js initialization.
 */

export interface SESDetectionResult {
  isActive: boolean;
  source: 'lockdown-function' | 'frozen-primordials' | 'none';
  affectedObjects: string[];
  recommendations: string[];
}

/**
 * Detects if SES lockdown is active in the current environment
 */
export function detectSES(): SESDetectionResult {
  const affectedObjects: string[] = [];
  let source: SESDetectionResult['source'] = 'none';

  // Check 1: Look for lockdown function (Agoric SES)
  if (typeof (globalThis as any).lockdown === 'function') {
    source = 'lockdown-function';
  }

  // Check 2: Look for lockdown-install.js script in page
  if (typeof document !== 'undefined') {
    const scripts = Array.from(document.querySelectorAll('script'));
    const hasLockdownScript = scripts.some(script =>
      script.src.includes('lockdown-install') ||
      script.textContent?.includes('SES Removing unpermitted intrinsics')
    );
    if (hasLockdownScript && source === 'none') {
      source = 'lockdown-function'; // Treat lockdown-install.js presence as lockdown active
    }
  }

  // Check 3: Test if primordial objects are frozen
  const primordials = [
    { name: 'Object.prototype', obj: Object.prototype },
    { name: 'Array.prototype', obj: Array.prototype },
    { name: 'Function.prototype', obj: Function.prototype },
    { name: 'Object', obj: Object },
  ];

  for (const { name, obj } of primordials) {
    if (Object.isFrozen(obj)) {
      affectedObjects.push(name);
      if (source === 'none') {
        source = 'frozen-primordials';
      }
    }
  }

  const isActive = source !== 'none';

  // Generate recommendations
  const recommendations: string[] = [];
  if (isActive) {
    recommendations.push('Use dynamic imports to defer PDF.js loading');
    recommendations.push('Load PDF.js worker from CDN (separate context)');
    recommendations.push('Disable browser extensions (especially wallets) for development');

    if (affectedObjects.includes('Object')) {
      recommendations.push('Critical: Object is frozen - Webpack module system may fail');
    }
  }

  return {
    isActive,
    source,
    affectedObjects,
    recommendations,
  };
}

/**
 * Logs SES detection results to console with styling
 */
export function logSESStatus(): void {
  const result = detectSES();

  if (result.isActive) {
    console.group('%c[SES Lockdown Detected]', 'color: #ff9800; font-weight: bold;');
    console.log('Source:', result.source);
    console.log('Affected Objects:', result.affectedObjects);
    console.log('Recommendations:', result.recommendations);
    console.groupEnd();
  } else {
    console.log('%c[SES] No lockdown detected', 'color: #4caf50;');
  }
}

/**
 * Attempts to create a safe execution context for PDF.js initialization
 * Returns true if initialization can proceed safely
 */
export async function createSafePDFContext(): Promise<{
  canProceed: boolean;
  strategy: 'direct' | 'worker-only' | 'delayed';
  message: string;
}> {
  const sesResult = detectSES();

  if (!sesResult.isActive) {
    return {
      canProceed: true,
      strategy: 'direct',
      message: 'No SES lockdown detected. Using direct initialization.',
    };
  }

  // If SES is active, use worker-only strategy
  if (sesResult.affectedObjects.includes('Object')) {
    return {
      canProceed: true,
      strategy: 'worker-only',
      message: 'SES lockdown active. Using worker-only strategy with CDN worker.',
    };
  }

  // Delayed initialization for less severe cases
  return {
    canProceed: true,
    strategy: 'delayed',
    message: 'SES lockdown detected. Using delayed initialization strategy.',
  };
}

/**
 * Gets detailed diagnostic information about the environment
 */
export function getDiagnostics(): Record<string, any> {
  const sesResult = detectSES();

  return {
    ses: sesResult,
    environment: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'N/A',
      hasWebWorker: typeof Worker !== 'undefined',
    },
    webpack: {
      // Check if Webpack runtime is available
      hasWebpackRequire: typeof (globalThis as any).__webpack_require__ !== 'undefined',
    },
    primordials: {
      Object: {
        isFrozen: Object.isFrozen(Object),
        isSealed: Object.isSealed(Object),
        isExtensible: Object.isExtensible(Object),
      },
      'Object.prototype': {
        isFrozen: Object.isFrozen(Object.prototype),
        isSealed: Object.isSealed(Object.prototype),
        isExtensible: Object.isExtensible(Object.prototype),
      },
    },
    browserExtensions: {
      possibleWallets: [
        typeof (window as any).ethereum !== 'undefined' ? 'MetaMask/Web3' : null,
        typeof (window as any).solana !== 'undefined' ? 'Phantom' : null,
        typeof (window as any).keplr !== 'undefined' ? 'Keplr' : null,
      ].filter(Boolean),
    },
  };
}
