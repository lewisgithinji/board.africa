'use client';

import { useEffect } from 'react';

/**
 * Client-side initialization component
 * Runs only in development to monitor for SES lockdown and other debugging
 */
export function ClientInit() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // SES Monitoring disabled to improve performance
      // import('@/lib/pdf/ses-monitor').then(({ startSESMonitoring, installWebpackMonitor }) => {
      //   startSESMonitoring();
      //   installWebpackMonitor();
      // });
    }
  }, []);

  return null; // This component renders nothing
}
