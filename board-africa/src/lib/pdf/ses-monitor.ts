/**
 * SES Lockdown Monitor
 *
 * Continuously monitors for SES lockdown injection and logs when it happens.
 * Useful for debugging timing-dependent SES issues.
 */

let monitoringInterval: NodeJS.Timeout | null = null;
let lastSESState = false;
let detectionLog: Array<{ timestamp: number; isActive: boolean; trigger: string }> = [];

/**
 * Start monitoring for SES lockdown changes
 */
export function startSESMonitoring() {
  if (typeof window === 'undefined') return;

  console.log('%c[SES Monitor] Starting continuous monitoring...', 'color: #2196f3; font-weight: bold;');

  // Initial check
  checkSESState('initial');

  // Monitor every 50ms during critical startup period
  monitoringInterval = setInterval(() => {
    checkSESState('periodic');
  }, 50);

  // Also monitor key events
  window.addEventListener('load', () => checkSESState('window.load'));
  document.addEventListener('DOMContentLoaded', () => checkSESState('DOMContentLoaded'));

  // Stop intensive monitoring after 5 seconds
  setTimeout(() => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
      console.log('%c[SES Monitor] Stopped intensive monitoring', 'color: #2196f3;');

      // Switch to slower monitoring (every 2 seconds)
      setInterval(() => checkSESState('slow-periodic'), 2000);
    }
  }, 5000);
}

/**
 * Check current SES state and log if it changed
 */
function checkSESState(trigger: string) {
  const currentState = detectSESQuick();

  if (currentState !== lastSESState) {
    const timestamp = Date.now();
    detectionLog.push({ timestamp, isActive: currentState, trigger });

    if (currentState) {
      console.group('%c🚨 [SES Monitor] LOCKDOWN DETECTED!', 'color: #ff5722; font-weight: bold; font-size: 14px;');
      console.log('Trigger:', trigger);
      console.log('Timestamp:', new Date(timestamp).toISOString());
      console.log('Stack trace:', new Error().stack);

      // Log what's frozen
      const frozen = [];
      if (Object.isFrozen(Object)) frozen.push('Object');
      if (Object.isFrozen(Object.prototype)) frozen.push('Object.prototype');
      if (Object.isFrozen(Array.prototype)) frozen.push('Array.prototype');
      if (Object.isFrozen(Function.prototype)) frozen.push('Function.prototype');

      console.log('Frozen primordials:', frozen);

      // Check for lockdown function
      if (typeof (globalThis as any).lockdown === 'function') {
        console.log('lockdown() function found on globalThis');
      }

      console.groupEnd();
    } else if (lastSESState && !currentState) {
      console.log('%c[SES Monitor] Lockdown REMOVED', 'color: #4caf50;', trigger);
    }

    lastSESState = currentState;
  }
}

/**
 * Quick SES detection (optimized for frequent calls)
 */
function detectSESQuick(): boolean {
  return Object.isFrozen(Object) || Object.isFrozen(Object.prototype);
}

/**
 * Get the full detection log
 */
export function getSESLog() {
  return detectionLog;
}

/**
 * Stop monitoring
 */
export function stopSESMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

/**
 * Hook into Webpack module loading to catch SES conflicts
 */
export function installWebpackMonitor() {
  if (typeof window === 'undefined') return;

  // Try to hook into Webpack's require
  const checkWebpack = () => {
    const wp = (window as any).__webpack_require__;
    if (wp && !wp.__ses_monitored) {
      console.log('%c[SES Monitor] Webpack runtime detected, installing hooks', 'color: #ff9800;');

      const originalR = wp.r;
      if (originalR) {
        wp.r = function(exports: any) {
          try {
            return originalR(exports);
          } catch (error) {
            console.error('%c[SES Monitor] __webpack_require__.r failed!', 'color: #f44336; font-weight: bold;');
            console.error('Error:', error);
            console.error('Exports:', exports);
            console.error('SES active:', detectSESQuick());
            throw error;
          }
        };
      }

      wp.__ses_monitored = true;
    }
  };

  // Check periodically for Webpack runtime
  const interval = setInterval(checkWebpack, 100);
  setTimeout(() => clearInterval(interval), 3000);
}

