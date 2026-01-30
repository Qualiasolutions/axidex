# Testing Patterns

**Analysis Date:** 2026-01-30

## Test Framework

**Runner:**
- Not configured

**Assertion Library:**
- Not configured

**Run Commands:**
```bash
# No test commands in package.json
# Only available scripts: dev, build, start, lint
```

## Test File Organization

**Location:**
- No test files detected in `src/`
- No `__tests__` directories
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files

**Naming:**
- Not established

**Structure:**
- Not established

## Test Structure

**Suite Organization:**
- Not established

**Patterns:**
- No testing patterns established in this codebase

## Mocking

**Framework:** Not configured

**Patterns:**
- Not established

**What to Mock (Recommended):**
- Supabase client (`@/lib/supabase/client`, `@/lib/supabase/server`)
- External API calls
- `next/navigation` hooks (useRouter, usePathname)
- Date/time functions

**What NOT to Mock (Recommended):**
- React components
- Utility functions (`cn`, `formatDate`, etc.)
- Type definitions

## Fixtures and Factories

**Test Data:**
- Not established

**Location:**
- Not established

**Recommended structure based on types:**
```typescript
// Example fixture based on src/types/index.ts
const mockSignal: Signal = {
  id: "signal-1",
  company_name: "Test Company",
  company_domain: "test.com",
  signal_type: "hiring",
  title: "Test Signal",
  summary: "Test signal summary",
  source_url: "https://example.com",
  source_name: "Test Source",
  priority: "high",
  status: "new",
  detected_at: "2026-01-30T12:00:00Z",
  created_at: "2026-01-30T12:00:00Z",
};
```

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
# Not configured
```

## Test Types

**Unit Tests:**
- Not implemented

**Integration Tests:**
- Not implemented

**E2E Tests:**
- Not implemented

## Common Patterns

**Async Testing:**
- Not established

**Error Testing:**
- Not established

## Recommended Setup

**To add testing to this project:**

1. Install Vitest (recommended for Next.js 16+):
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

2. Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

3. Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

4. Add scripts to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Recommended test file locations:**
- Co-locate with source: `src/components/ui/button.test.tsx`
- Or separate directory: `src/__tests__/components/ui/button.test.tsx`

**Priority test targets:**
1. `src/lib/utils.ts` - Pure utility functions (easiest to test)
2. `src/components/ui/badge.tsx` - Config-driven component rendering
3. `src/components/signals/signal-card.tsx` - Business logic component
4. `src/lib/supabase/client.ts` - Mock Supabase client creation

## Testing Debt

**Current state:** No tests exist

**Risk areas without tests:**
- `src/lib/utils.ts` - Date formatting could break silently
- `src/lib/supabase/server.ts` - Cookie handling edge cases
- `src/types/index.ts` - Type definitions (covered by TypeScript)
- Component variants and conditional rendering

---

*Testing analysis: 2026-01-30*
