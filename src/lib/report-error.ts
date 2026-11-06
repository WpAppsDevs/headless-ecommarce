interface ErrorContext {
  scope?: string;
  [key: string]: unknown;
}

/**
 * Report an unexpected error without blocking the UI.
 *
 * Logs locally and sends a small payload to /api/errors, which writes it to
 * the server log and forwards it to ERROR_REPORT_WEBHOOK_URL when configured.
 * Never include tokens, passwords, or full request bodies here.
 */
export function reportError(error: unknown, context: ErrorContext = {}): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const payload = {
    message: err.message,
    stack: err.stack,
    digest:
      typeof error === 'object' && error !== null && 'digest' in error
        ? (error as { digest?: string }).digest
        : undefined,
    path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error('[error]', payload);

  if (typeof window === 'undefined') return;

  void fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Reporting must never break the page.
  });
}
