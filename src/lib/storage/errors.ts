export class StorageQuotaError extends Error {
  readonly code = 'STORAGE_QUOTA_EXCEEDED' as const;
  constructor(message = 'Storage quota exceeded') {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

export class StorageUnavailableError extends Error {
  readonly code = 'STORAGE_UNAVAILABLE' as const;
  constructor(message = 'Storage is unavailable') {
    super(message);
    this.name = 'StorageUnavailableError';
  }
}
