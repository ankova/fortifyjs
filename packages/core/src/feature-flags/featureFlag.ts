export type FlagMap = Record<string, boolean>;

export class FeatureFlags {
  private readonly flags: FlagMap;

  constructor(initial: FlagMap = {}) {
    this.flags = { ...initial };
  }

  isOn(name: string): boolean {
    return !!this.flags[name];
  }

  set(name: string, value: boolean): void {
    this.flags[name] = value;
  }

  all(): FlagMap {
    return { ...this.flags };
  }
}
