/**
 * TEAKLE — Server Startup Instrumentation
 *
 * Enforces required production environment variables at server startup.
 *
 * Behavior:
 * - Development / test: no enforcement (usable locally).
 * - Production (`next start`): calls requireEnv() which throws with a clear
 *   message listing the MISSING required variable NAMES (never the values) if
 *   any required env var is absent or too short. A throw here fails startup
 *   clearly before serving traffic.
 * - Build phase (`next build`): skipped so builds are not blocked.
 * - Edge runtime: skipped (env enforcement is a Node.js server concern).
 *
 * Validation logic is NOT duplicated — it reuses lib/env's requireEnv().
 */

export async function register() {
  if (process.env.NODE_ENV !== 'production') return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== 'nodejs') return;

  try {
    const { requireEnv } = await import('./lib/env');
    requireEnv();
  } catch (err) {
    // Fail startup clearly. The error only contains missing/short key NAMES,
    // never secret values.
    console.error('[TEAKLE] Fatal: environment validation failed on startup.');
    console.error(`[TEAKLE] ${err.message}`);
    throw err;
  }
}
