'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDiagnostics, logSESStatus } from '@/lib/pdf/ses-detector';

export function PDFDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  useEffect(() => {
    if (isOpen && !diagnostics) {
      const diag = getDiagnostics();
      setDiagnostics(diag);
      logSESStatus();
    }
  }, [isOpen, diagnostics]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Info className="h-4 w-4 mr-2" />
        PDF Debug Info
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-slate-200 rounded-lg shadow-2xl max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          PDF.js Environment Diagnostics
        </h3>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="overflow-auto p-4 space-y-4 text-sm">
        {diagnostics && (
          <>
            {/* SES Status */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                {diagnostics.ses.isActive ? (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                SES Lockdown Status
              </h4>
              <div className="bg-slate-50 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Active:</span>
                  <Badge variant={diagnostics.ses.isActive ? 'destructive' : 'default'}>
                    {diagnostics.ses.isActive ? 'YES' : 'NO'}
                  </Badge>
                </div>
                {diagnostics.ses.isActive && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Source:</span>
                      <code className="text-xs bg-slate-200 px-2 py-1 rounded">
                        {diagnostics.ses.source}
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-600 block mb-1">Affected Objects:</span>
                      <div className="flex flex-wrap gap-1">
                        {diagnostics.ses.affectedObjects.map((obj: string) => (
                          <Badge key={obj} variant="outline" className="text-xs">
                            {obj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600 block mb-1">Recommendations:</span>
                      <ul className="text-xs text-slate-500 space-y-1 ml-4 list-disc">
                        {diagnostics.ses.recommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Primordials Status */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700">Primordial Objects</h4>
              <div className="bg-slate-50 rounded p-3 space-y-2">
                {Object.entries(diagnostics.primordials).map(([name, status]: [string, any]) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <code className="text-slate-600">{name}</code>
                    <div className="flex gap-2">
                      <Badge variant={status.isFrozen ? 'destructive' : 'outline'} className="text-xs">
                        {status.isFrozen ? 'Frozen' : 'Mutable'}
                      </Badge>
                      {!status.isExtensible && (
                        <Badge variant="secondary" className="text-xs">
                          Non-extensible
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Extensions */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700">Detected Extensions</h4>
              <div className="bg-slate-50 rounded p-3">
                {diagnostics.browserExtensions.possibleWallets.length > 0 ? (
                  <div className="space-y-1">
                    {diagnostics.browserExtensions.possibleWallets.map((wallet: string) => (
                      <div key={wallet} className="flex items-center gap-2 text-xs">
                        <AlertCircle className="h-3 w-3 text-orange-500" />
                        <span className="text-slate-600">{wallet}</span>
                      </div>
                    ))}
                    <p className="text-xs text-orange-600 mt-2">
                      Wallet extensions may inject SES lockdown. Try disabling them.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No wallet extensions detected</p>
                )}
              </div>
            </div>

            {/* Environment */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700">Environment</h4>
              <div className="bg-slate-50 rounded p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">WebWorker:</span>
                  <span className="font-mono text-slate-800">
                    {diagnostics.environment.hasWebWorker ? 'Available' : 'Not Available'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Webpack:</span>
                  <span className="font-mono text-slate-800">
                    {diagnostics.webpack.hasWebpackRequire ? 'Active' : 'Not Active'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Platform:</span>
                  <span className="font-mono text-slate-800">{diagnostics.environment.platform}</span>
                </div>
              </div>
            </div>

            {/* Copy Diagnostics */}
            <Button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Copy Full Diagnostics to Clipboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
