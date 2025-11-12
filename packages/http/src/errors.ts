export class HttpError extends Error {
  constructor(message: string, public readonly status?: number, public readonly cause?: unknown) {
    super(message); this.name = 'HttpError';
  }
}

export class TimeoutError extends Error {
  constructor(message = 'Request timed out') { super(message); this.name = 'TimeoutError'; }
}

export class CircuitOpenError extends Error {
  constructor(message = 'Circuit is open') { super(message); this.name = 'CircuitOpenError'; }
}
