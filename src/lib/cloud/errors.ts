// ============================================================
// HireFlow — Centralized Cloud Error Hierarchy
// ============================================================

export class CloudError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly causeError?: unknown;

  constructor(message: string, code: string, retryable = true, causeError?: unknown) {
    super(message);
    this.name = 'CloudError';
    this.code = code;
    this.retryable = retryable;
    this.causeError = causeError;
  }
}

export class CloudAuthRequiredError extends CloudError {
  constructor(message = 'Authentication with Google is required to access or save cloud data.') {
    super(message, 'AUTH_REQUIRED', false);
    this.name = 'CloudAuthRequiredError';
  }
}

export class CloudNotConfiguredError extends CloudError {
  constructor(
    message = 'Cloud backend is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect.'
  ) {
    super(message, 'CLOUD_NOT_CONFIGURED', false);
    this.name = 'CloudNotConfiguredError';
  }
}

export class CloudReadFailedError extends CloudError {
  constructor(operation: string, reason: string, causeError?: unknown) {
    super(`Failed to load ${operation} from cloud: ${reason}`, 'CLOUD_READ_FAILED', true, causeError);
    this.name = 'CloudReadFailedError';
  }
}

export class CloudWriteFailedError extends CloudError {
  constructor(operation: string, reason: string, causeError?: unknown) {
    super(
      `Cloud save failed for ${operation}: ${reason}. Your changes were not saved locally; retry when connected.`,
      'CLOUD_WRITE_FAILED',
      true,
      causeError
    );
    this.name = 'CloudWriteFailedError';
  }
}

export class CloudStorageSecurityError extends CloudError {
  constructor(reason: string) {
    super(reason, 'STORAGE_SECURITY_VIOLATION', false);
    this.name = 'CloudStorageSecurityError';
  }
}
