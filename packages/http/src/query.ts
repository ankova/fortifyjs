import { ZodTypeAny } from 'zod';

type Primitive = string | number | boolean | null | undefined | Date;

export function buildQuery<TSchema extends ZodTypeAny>(schema: TSchema, input: unknown): URLSearchParams {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw parsed.error;
  const q = new URLSearchParams();
  const data = parsed.data as Record<string, unknown>;
  for (const [k, v] of Object.entries(data)) {
    if (v == null) continue;
    if (Array.isArray(v)) for (const item of v) append(q, k, item as Primitive);
    else append(q, k, v as Primitive);
  }
  return q;
}

function append(q: URLSearchParams, k: string, v: Primitive) {
  if (v == null) return;
  if (v instanceof Date) q.append(k, v.toISOString());
  else q.append(k, String(v));
}
