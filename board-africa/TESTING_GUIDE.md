# Testing Guide - SES Lockdown Fix

## Current Status from Your Diagnostics

Based on the diagnostic output you provided:

```json
{
  "ses": { "isActive": false },
  "primordials": { "Object": { "isFrozen": false } },
  "browserExtensions": { "possibleWallets": ["MetaMask/Web3"] }
}
```

**Analysis:**
- ✅ SES lockdown is **NOT active** when diagnostics ran
- ✅ All primordials are mutable
- ⚠️ **MetaMask IS present** but hasn't injected lockdown yet
- ℹ️ Webpack runtime was not detected (may run later)

**This suggests the error is timing-dependent** - SES lockdown happens at a specific moment during page load, not constantly.

---

## New Monitoring Tools Added

### 1. **Continuous SES Monitor** ([ses-monitor.ts](src/lib/pdf/ses-monitor.ts))

This will now **automatically run** in development and catch the exact moment SES lockdown happens.

**What it does:**
- Checks for SES lockdown every **50ms** during first 5 seconds (critical startup)
- Then checks every **2 seconds** thereafter
- Hooks into Webpack's `__webpack_require__.r` to catch failures
- Logs detailed information when lockdown is detected

**Expected Console Output:**
```
[SES Monitor] Starting continuous monitoring...
[SES Monitor] Webpack runtime detected, installing hooks

// When SES lockdown happens:
🚨 [SES Monitor] LOCKDOWN DETECTED!
  Trigger: periodic
  Timestamp: 2026-01-29T...
  Frozen primordials: ['Object', 'Object.prototype']
  Stack trace: ...
```

### 2. **ClientInit Component** ([ClientInit.tsx](src/components/ClientInit.tsx))

Added to root layout - automatically starts monitoring in development mode.

---

## Testing Procedure

### Phase 1: Reproduce the Error

1. **Clear everything and start fresh:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Open Browser DevTools** (F12)
   - Go to **Console** tab
   - Enable **Preserve log** (checkbox at top)
   - Clear console

3. **Navigate to a document page** that has PDF viewer

4. **Watch the console for:**
   ```
   [SES Monitor] Starting continuous monitoring...

   // If SES gets injected:
   🚨 [SES Monitor] LOCKDOWN DETECTED!
   ```

5. **If you see the original error:**
   ```
   TypeError: Object.defineProperty called on non-object
   ```

   The monitor should have logged when SES lockdown happened **before** this error.

### Phase 2: Analyze the Timing

Look for this sequence in console:

```
[SES Monitor] Starting continuous monitoring...
[SES Monitor] Webpack runtime detected, installing hooks
🚨 [SES Monitor] LOCKDOWN DETECTED!
  Trigger: window.load (or periodic, or DOMContentLoaded)
  Frozen primordials: ['Object', 'Object.prototype']
[PDF Viewer] SES lockdown detected. Using isolated worker strategy.
[PDF Viewer] Successfully initialized with worker: https://unpkg.com/...
```

**Key Questions:**
1. **When does lockdown happen?** (Look at the "Trigger" field)
2. **Does PDF.js initialize BEFORE or AFTER lockdown?**
3. **Does the error still occur with PDFViewerSafe?**

### Phase 3: Test Different Scenarios

#### Scenario A: Fresh Page Load
```bash
# Hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

#### Scenario B: Navigation
1. Start on homepage
2. Navigate to document page
3. Check when SES activates

#### Scenario C: With/Without MetaMask
1. **Test 1:** MetaMask enabled and unlocked
2. **Test 2:** MetaMask enabled but locked
3. **Test 3:** MetaMask disabled
4. **Test 4:** Incognito mode (no extensions)

#### Scenario D: Build vs Dev
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

---

## Expected Results

### ✅ Success Case (Fixed)

Console should show:
```
[SES Monitor] Starting continuous monitoring...
🚨 [SES Monitor] LOCKDOWN DETECTED!
  Trigger: periodic
  Frozen primordials: ['Object', 'Object.prototype']
[PDF Viewer] SES lockdown detected. Using isolated worker strategy.
[PDF Viewer] Successfully initialized with worker: https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs
```

PDF loads successfully, annotations work.

### ❌ Failure Case (Not Fixed Yet)

Console shows:
```
[SES Monitor] Starting continuous monitoring...
🚨 [SES Monitor] LOCKDOWN DETECTED!
  Trigger: DOMContentLoaded
  Frozen primordials: ['Object', 'Object.prototype']
[SES Monitor] __webpack_require__.r failed!
  Error: TypeError: Object.defineProperty called on non-object
  SES active: true
```

---

## Debugging Commands

### Check if SES is active RIGHT NOW
Run in browser console:
```javascript
console.log('SES Active:', Object.isFrozen(Object));
console.log('Lockdown function:', typeof globalThis.lockdown);
```

### Check Webpack state
```javascript
console.log('Webpack:', typeof __webpack_require__);
console.log('Webpack monitored:', __webpack_require__?.__ses_monitored);
```

### Get full monitoring log
```javascript
import { getSESLog } from '@/lib/pdf/ses-monitor';
console.table(getSESLog());
```

### Force PDF re-initialization
```javascript
// Reload the page with cache disabled
location.reload(true);
```

---

## Collecting Evidence

If the error persists, collect this information:

### 1. Console Logs
- Copy ALL console output from page load to error
- Include timestamps
- Include the SES Monitor logs

### 2. Network Requests
DevTools → Network tab:
- Filter for "pdf"
- Check if worker loaded (200 or failed?)
- Screenshot the network tab

### 3. Timing Information
From SES Monitor logs:
- When did lockdown happen?
- What triggered it?
- What was the sequence of events?

### 4. Full Diagnostics
Click "Copy Full Diagnostics to Clipboard" in Debug Panel

### 5. Extensions List
Chrome: `chrome://extensions/`
- List all installed extensions
- Note which are enabled

---

## Advanced: Hook MetaMask Directly

If you want to see EXACTLY when MetaMask injects lockdown:

```javascript
// Run this BEFORE navigating to the page
// (in browser console on any page, before navigation)

Object.defineProperty(Object, 'freeze', {
  value: new Proxy(Object.freeze, {
    apply(target, thisArg, args) {
      if (args[0] === Object || args[0] === Object.prototype) {
        console.trace('🔒 Attempting to freeze primordial:', args[0]);
      }
      return Reflect.apply(target, thisArg, args);
    }
  })
});

console.log('Freeze hook installed. Navigate to the page now.');
```

This will show you the **stack trace** of where `Object.freeze()` is being called on primordials.

---

## Quick Checklist

Before reporting results:

- [ ] Cleared `.next` folder
- [ ] Started dev server fresh
- [ ] Opened DevTools with "Preserve log" enabled
- [ ] Tested with MetaMask enabled
- [ ] Tested in incognito mode
- [ ] Checked console for SES Monitor logs
- [ ] Verified worker loaded in Network tab
- [ ] Copied full diagnostics from Debug Panel
- [ ] Noted which scenario triggers the error (if any)

---

## Next Steps Based on Results

### If error is GONE ✅
- Test in production build (`npm run build && npm start`)
- Remove Debug Panel before deploying
- Consider monitoring SES detection rates in production

### If error PERSISTS ❌
With monitoring logs, we can:
1. Identify EXACTLY when SES lockdown happens
2. Adjust the delay timing in PDFViewerSafe
3. Try alternative loading strategies
4. Implement pre-lockdown initialization

### If error is INTERMITTENT ⚠️
Monitoring will help identify:
- Which navigation paths trigger it
- Race condition timing
- Specific extension interactions

---

## Contact

Share your findings with:
- SES Monitor console logs
- Timing information from detection log
- Network tab screenshot
- Full diagnostics JSON
