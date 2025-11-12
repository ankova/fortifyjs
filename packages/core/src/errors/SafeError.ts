export interface SafeErrorOptions {
  code?: string;
  cause?: unknown;
}

export class SafeError extends Error {
  readonly code?: string;
  readonly cause?: unknown;

  constructor(message: string, options: SafeErrorOptions = {}) {
    super(message);
    this.name = 'SafeError';

    // Maintain correct prototype chain when targeting downlevel environments
    Object.setPrototypeOf(this, new.target.prototype);

    if ('code' in options) {
      this.code = options.code;
    }

    if ('cause' in options) {
      this.cause = options.cause;
    }
  }
}
