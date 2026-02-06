# PDF.js + SES Lockdown Troubleshooting Guide

## Problem Summary

**Error:** `TypeError: Object.defineProperty called on non-object`
**Root Cause:** SES (Secure EcmaScript) lockdown freezing JavaScript primordials before Webpack can initialize pdfjs-dist ESM modules.

## What is SES Lockdown?

SES (Secure EcmaScript) is a security hardening mechanism that:
- Freezes JavaScript primordial objects (`Object`, `Array`, etc.)
- Prevents modification of built-in prototypes
- Creates isolated execution compartments

**Common Sources:**
- Browser extensions (MetaMask, Phantom, Keplr, etc.)
- Security frameworks (Agoric, LavaMoat)
- Development tools with hardened sandboxes

## The Conflict

1. **SES lockdown runs** → Freezes `Object`, `Object.prototype`, etc.
2. **Next.js/Webpack loads** → Tries to evaluate `pdfjs-dist/build/pdf.mjs`
3. **Webpack's `__webpack_require__.r`** → Calls `Object.defineProperty` to mark ESM exports
4. **Frozen Object** → Cannot be modified → **TypeError thrown**

## Solutions Implemented

### Solution 1: SES-Safe PDF Viewer Component

**File:** [PDFViewerSafe.tsx](src/components/dashboard/documents/PDFViewerSafe.tsx)

**Key Features:**
- Dynamic imports to defer pdfjs-dist loading
- Runtime SES detection
- Delayed initialization (waits 100ms for SES to complete)
- Isolated worker loading via CDN
- Graceful error handling

**Usage:**
```tsx
import { PDFViewerSafe } from '@/components/dashboard/documents/PDFViewerSafe';

<PDFViewerSafe fileUrl={url} onPageChange={handlePageChange}>
  <AnnotationLayer annotations={annotations} />
</PDFViewerSafe>
```

### Solution 2: Enhanced Webpack Configuration

**File:** [next.config.ts](next.config.ts)

**Changes:**
- Added `pdfjs-dist` to `transpilePackages`
- Explicitly alias pdfjs ESM version
- Configured fallbacks for Node.js modules in browser
- Enabled top-level await for ESM compatibility

### Solution 3: SES Detection Utilities

**File:** [ses-detector.ts](src/lib/pdf/ses-detector.ts)

**Utilities:**
- `detectSES()` - Checks if SES lockdown is active
- `createSafePDFContext()` - Determines safe initialization strategy
- `getDiagnostics()` - Full environment report
- `logSESStatus()` - Console logging helper

### Solution 4: Debug Panel

**File:** [PDFDebugPanel.tsx](src/components/dashboard/documents/PDFDebugPanel.tsx)

**Features:**
- Visual SES detection status
- Lists affected primordial objects
- Shows detected browser extensions
- Provides actionable recommendations
- Copy diagnostics to clipboard

**Usage:**
```tsx
import { PDFDebugPanel } from '@/components/dashboard/documents/PDFDebugPanel';

// Add to your page during development
<PDFDebugPanel />
```

## Implementation Steps

### Step 1: Switch to SES-Safe Viewer

Update your DocumentAnnotator component:

```tsx
// Before
import { PDFViewer } from './PDFViewer';

// After
import { PDFViewerSafe } from './PDFViewerSafe';
```

### Step 2: Add Debug Panel (Development Only)

```tsx
import { PDFDebugPanel } from './PDFDebugPanel';

export default function DocumentPage() {
  return (
    <>
      {/* Your content */}
      {process.env.NODE_ENV === 'development' && <PDFDebugPanel />}
    </>
  );
}
```

### Step 3: Run the Application

```bash
npm run dev
```

### Step 4: Check Console and Debug Panel

- Click the "PDF Debug Info" button in bottom-right
- Review SES detection status
- Check console for detailed logs

## Troubleshooting Steps

### If the error persists:

#### 1. Disable Browser Extensions
The most common cause is wallet extensions:
- **Chrome:** More tools → Extensions → Disable MetaMask, Phantom, etc.
- **Firefox:** Add-ons → Disable wallet extensions
- **Alternative:** Use incognito mode

#### 2. Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

#### 3. Verify Worker Loading
Check browser DevTools → Network tab:
- Should see request to `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`
- Should load successfully (200 status)

#### 4. Check for Global Lockdown Calls
In browser console:
```javascript
// Check if lockdown was called
console.log(typeof globalThis.lockdown); // Should be 'undefined'

// Check Object mutability
console.log(Object.isFrozen(Object)); // Should be false
console.log(Object.isFrozen(Object.prototype)); // Should be false
```

#### 5. Try Alternative Worker Loading

If CDN fails, use local worker:

**Install worker files:**
```bash
npm install pdfjs-dist@4.4.168
```

**Update PDFViewerSafe.tsx:**
```tsx
// Instead of CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
```

**Copy worker to public folder:**
```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

## Advanced Debugging

### Get Full Diagnostic Report

Add this to your component:

```tsx
import { getDiagnostics } from '@/lib/pdf/ses-detector';

useEffect(() => {
  const diag = getDiagnostics();
  console.log('Full Diagnostics:', diag);
}, []);
```

### Monitor Webpack Module Loading

Add to browser console:

```javascript
// Hook into Webpack module system
const originalRequire = __webpack_require__;
__webpack_require__ = function(moduleId) {
  console.log('Loading module:', moduleId);
  return originalRequire(moduleId);
};
```

### Check for Lockdown Install Script

Search browser DevTools → Sources:
- Look for `lockdown-install.js`
- Check which extension/script is injecting it
- Note the stack trace

## Prevention Strategies

### For Development
1. Use dedicated browser profile without extensions
2. Use incognito/private mode
3. Disable wallet extensions when not needed

### For Production
1. The SES-safe viewer handles lockdown gracefully
2. Worker runs in separate context (unaffected by SES)
3. Dynamic imports defer loading until after lockdown

### For Testing
1. Test with extensions enabled (real-world scenario)
2. Test in incognito mode (clean environment)
3. Test in multiple browsers

## When to Use Which Viewer

### Use PDFViewerSafe (Recommended)
- Production environment
- Development with browser extensions
- Unknown user environments
- Maximum compatibility needed

### Use PDFViewer (Original)
- Development without extensions
- Controlled environments
- Testing performance without overhead

## Technical Deep Dive

### Why Dynamic Imports Help

```tsx
// Static import (evaluated during module graph construction)
import { pdfjs } from 'react-pdf'; // ❌ Fails if SES is already active

// Dynamic import (evaluated at runtime, after lockdown)
const pdfjsLib = await import('pdfjs-dist'); // ✅ Can work around frozen objects
```

### Why CDN Worker Works

The Web Worker:
- Runs in separate global scope
- Has its own primordial objects
- Is not affected by parent context's SES lockdown
- Loads and evaluates pdfjs-dist in clean environment

### Webpack's `__webpack_require__.r`

This function marks modules as ES modules:

```javascript
__webpack_require__.r = function(exports) {
  Object.defineProperty(exports, '__esModule', { value: true });
  // ↑ Fails if Object is frozen by SES
};
```

## Additional Resources

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [SES (Secure EcmaScript) Specification](https://github.com/endojs/endo/tree/master/packages/ses)
- [MetaMask's SES Implementation](https://github.com/MetaMask/metamask-extension/blob/develop/docs/lockdown.md)
- [Next.js Webpack Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/webpack)

## Contact & Support

If you continue experiencing issues:
1. Copy full diagnostics from PDFDebugPanel
2. Check browser console for additional errors
3. Note which browser and extensions are active
4. Provide the full error stack trace

## Quick Reference Commands

```bash
# Clear cache and rebuild
rm -rf .next && npm run dev

# Check for SES-related packages
npm list | grep -i ses

# Install specific pdfjs version
npm install pdfjs-dist@4.4.168

# Run in production mode
npm run build && npm start
```
