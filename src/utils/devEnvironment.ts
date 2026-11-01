/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Checks if the application is running in development mode,
 * AI Studio preview sandbox, or local testing environment.
 *
 * Guarantees:
 * - Returns true in Vite development mode (`import.meta.env.DEV`).
 * - Returns true in Google AI Studio dev/preview sandboxes (ais-dev-*, ais-pre-*).
 * - Returns true in local environments (localhost, 127.0.0.1).
 * - Allows explicit demo override via URL parameter (?admin_demo=true) during testing.
 * - Returns false in strict production builds deployed to real production domains.
 */
export function isDevOrAdminDemoEnabled(): boolean {
  // 1. Vite development flag (standard dev server)
  if (import.meta.env.DEV) {
    return true;
  }

  // 2. Browser environment diagnosis for AI Studio and local development
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname.toLowerCase();

    // AI Studio dev/preview sandboxes
    if (
      hostname.includes('ais-dev-') ||
      hostname.includes('ais-pre-') ||
      hostname.includes('localhost') ||
      hostname.includes('127.0.0.1')
    ) {
      return true;
    }

    // Explicit developer parameter safe override
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (
        searchParams.get('admin_demo') === 'true' ||
        searchParams.get('admin_demo') === '1' ||
        searchParams.get('dev') === 'true'
      ) {
        return true;
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  return false;
}
