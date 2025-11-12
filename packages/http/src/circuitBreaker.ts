export type CircuitState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private lastOpenedAt = 0;
  private inFlight = 0;

  constructor(
    private readonly opts: { failureThreshold: number; coolDownMs: number; halfOpenMaxInFlight: number },
  ) {}

  canRequest(): boolean {
    const now = Date.now();
    if (this.state === 'open') {
      if (now - this.lastOpenedAt >= this.opts.coolDownMs) {
        this.state = 'half-open';
        this.inFlight = 0;
        return this.inFlight < this.opts.halfOpenMaxInFlight;
      }
      return false;
    }
    if (this.state === 'half-open') return this.inFlight < this.opts.halfOpenMaxInFlight;
    return true;
  }

  onRequestStart() { if (this.state === 'half-open') this.inFlight++; }

  onSuccess() {
    this.failures = 0;
    if (this.state === 'half-open') this.inFlight = Math.max(0, this.inFlight - 1);
    this.state = 'closed';
  }

  onFailure() {
    if (this.state === 'half-open') {
      this.open();
      this.inFlight = Math.max(0, this.inFlight - 1);
      return;
    }
    this.failures++;
    if (this.failures >= this.opts.failureThreshold) this.open();
  }

  private open() { this.state = 'open'; this.lastOpenedAt = Date.now(); }
}
