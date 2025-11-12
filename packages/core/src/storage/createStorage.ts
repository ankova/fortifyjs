import { z, type ZodTypeAny } from 'zod';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function createTypedStorage<TSchema extends ZodTypeAny>(
  key: string,
  schema: TSchema,
  storage: StorageLike,
) {
  type T = z.infer<TSchema>;

  return {
    get(): T | null {
      const raw = storage.getItem(key);
      if (!raw) return null;

      const json = JSON.parse(raw);
      const parsed = schema.safeParse(json);
      return parsed.success ? parsed.data : null;
    },
    set(value: T): void {
      const parsed = schema.safeParse(value);
      if (!parsed.success) throw parsed.error;
      storage.setItem(key, JSON.stringify(parsed.data));
    },
    remove(): void {
      storage.removeItem(key);
    },
  } as const;
}
